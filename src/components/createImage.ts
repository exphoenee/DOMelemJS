import createDOMElem from "../createDOMElem";
import createSpinner from "./createSpinner";
import { cx, toNode, type ComponentParent, type ContentInput } from "./shared";

export type ImageState = "idle" | "loading" | "loaded" | "error";

export interface ImageOptions {
  /** Image URL. */
  src: string;
  alt?: string;
  /**
   * Loading indicator shown until the image has loaded. Any content, or a
   * factory (called per load, so a fresh node each time). Default: `createSpinner()`.
   * Pass `false` to show nothing.
   */
  spinner?: ContentInput | (() => ContentInput) | false;
  /** Content shown on failure (string, node, options or factory). Default: a message with a retry button. */
  fallback?: ContentInput | ((error: Error, retry: () => void) => ContentInput);
  /** Message of the default fallback. */
  errorText?: string;
  /** Label of the default retry button. */
  retryText?: string;
  /**
   * `"image"` (default): preload through `Image` — works cross-origin.
   * `"fetch"`: download with `fetch()` and show a blob URL — real HTTP status
   * errors and abortable, but the server must allow CORS.
   */
  strategy?: "image" | "fetch";
  /** Extra options for `fetch()` (strategy `"fetch"`). */
  fetchInit?: RequestInit;
  /** Abort the load after this many ms (default: none). */
  timeout?: number;
  /** Automatic retries before the error state (default 0). */
  retries?: number;
  /** Start loading only when the image scrolls into view. */
  lazy?: boolean;
  className?: string;
  imgClassName?: string;
  parent?: ComponentParent;
  append?: boolean;
  onLoad?: (img: HTMLImageElement) => void;
  onError?: (error: Error) => void;
  onStateChange?: (state: ImageState) => void;
}

export interface ImageController {
  /** Wrapper element; carries `data-state`. */
  elem: HTMLElement;
  /** The `<img>` element. */
  img: HTMLImageElement;
  getState(): ImageState;
  /** Loads a new URL (cancels the one in flight). */
  setSrc(src: string, alt?: string): void;
  /** Retries the current URL. */
  reload(): void;
  /** Cancels any load in flight and releases blob URLs. */
  destroy(): void;
}

const resolve = <T,>(v: T | (() => T)): T => (typeof v === "function" ? (v as () => T)() : v);

/**
 * An image that fetches itself and manages its own states:
 * `loading` (spinner), `loaded`, `error` (fallback + retry).
 * The wrapper's `data-state` attribute mirrors the state for styling.
 */
export default function createImage(options: ImageOptions): ImageController {
  const strategy = options.strategy ?? "image";
  const retries = options.retries ?? 0;

  const img = createDOMElem({
    tag: "img",
    append: false,
    attrs: { class: cx("dom-image__img", options.imgClassName), alt: options.alt ?? "", decoding: "async" },
  }) as HTMLImageElement;

  const layer = createDOMElem({ tag: "span", append: false, attrs: { class: "dom-image__layer" } });

  const elem = createDOMElem({
    tag: "span",
    parent: options.parent,
    append: options.append,
    attrs: { class: cx("dom-image", options.className), "data-state": "idle" },
    children: [img, layer],
  });

  let src = options.src;
  let state: ImageState = "idle";
  let token = 0;
  let controller: AbortController | null = null;
  let blobUrl: string | null = null;
  let observer: IntersectionObserver | null = null;

  const setState = (s: ImageState): void => {
    if (s === state) return;
    state = s;
    elem.dataset.state = s;
    elem.setAttribute("aria-busy", String(s === "loading"));
    options.onStateChange?.(s);
  };

  const showLayer = (node: Node | null): void => {
    layer.textContent = "";
    if (node) layer.appendChild(node);
  };

  const releaseBlob = (): void => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    blobUrl = null;
  };

  function defaultFallback(retry: () => void): HTMLElement {
    return createDOMElem({
      tag: "span",
      append: false,
      attrs: { class: "dom-image__error", role: "alert" },
      children: [
        { tag: "span", text: options.errorText ?? "Image failed to load" },
        {
          tag: "button",
          text: options.retryText ?? "Retry",
          attrs: { type: "button", class: "dom-image__retry" },
          handleEvent: { event: "click", cb: retry },
        },
      ],
    });
  }

  function fail(error: Error): void {
    setState("error");
    img.removeAttribute("src");
    let node: ContentInput;
    if (options.fallback === undefined) node = defaultFallback(reload);
    else if (typeof options.fallback === "function") node = options.fallback(error, reload);
    else node = options.fallback;
    showLayer(toNode(node));
    options.onError?.(error);
  }

  function loadViaImage(url: string, signal: AbortSignal): Promise<string> {
    return new Promise((res, rej) => {
      const probe = new Image();
      const cleanup = (): void => {
        probe.onload = probe.onerror = null;
        signal.removeEventListener("abort", onAbort);
      };
      const onAbort = (): void => {
        cleanup();
        probe.src = "";
        rej(new DOMException("Aborted", "AbortError"));
      };
      signal.addEventListener("abort", onAbort);
      probe.onload = () => {
        cleanup();
        res(url);
      };
      probe.onerror = () => {
        cleanup();
        rej(new Error(`Failed to load image: ${url}`));
      };
      probe.src = url;
    });
  }

  async function loadViaFetch(url: string, signal: AbortSignal): Promise<string> {
    const response = await fetch(url, { ...options.fetchInit, signal });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const blob = await response.blob();
    if (blob.type && !blob.type.startsWith("image/")) {
      throw new Error(`Not an image (${blob.type}): ${url}`);
    }
    releaseBlob();
    blobUrl = URL.createObjectURL(blob);
    return blobUrl;
  }

  async function load(attempt = 0): Promise<void> {
    const mine = ++token;
    controller?.abort();
    controller = new AbortController();
    const { signal } = controller;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (options.timeout) timer = setTimeout(() => controller?.abort(), options.timeout);

    if (attempt === 0) {
      setState("loading");
      const spin = options.spinner === undefined ? createSpinner() : options.spinner;
      showLayer(spin === false ? null : toNode(resolve(spin)));
    }

    try {
      const shown = await (strategy === "fetch" ? loadViaFetch(src, signal) : loadViaImage(src, signal));
      if (mine !== token) return;
      img.src = shown;
      showLayer(null);
      setState("loaded");
      options.onLoad?.(img);
    } catch (e) {
      if (mine !== token) return;
      const timedOut = signal.aborted;
      const error = timedOut
        ? new Error(`Timed out loading image: ${src}`)
        : e instanceof Error
          ? e
          : new Error(String(e));
      if (attempt < retries) return load(attempt + 1);
      fail(error);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  function start(): void {
    observer?.disconnect();
    observer = null;
    void load();
  }

  function reload(): void {
    start();
  }

  if (options.lazy && typeof IntersectionObserver !== "undefined") {
    setState("loading");
    const spin = options.spinner === undefined ? createSpinner() : options.spinner;
    showLayer(spin === false ? null : toNode(resolve(spin)));
    observer = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) start();
    });
    observer.observe(elem);
  } else {
    start();
  }

  return {
    elem,
    img,
    getState: () => state,
    setSrc(newSrc, alt) {
      src = newSrc;
      if (alt !== undefined) img.alt = alt;
      start();
    },
    reload,
    destroy() {
      token++;
      controller?.abort();
      observer?.disconnect();
      releaseBlob();
    },
  };
}

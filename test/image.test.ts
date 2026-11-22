import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createImage, createSpinner } from "../src/index";

/** Fake Image: resolves via a manual trigger. */
const probes: FakeImage[] = [];
class FakeImage {
  onload: null | (() => void) = null;
  onerror: null | (() => void) = null;
  src = "";
  constructor() {
    probes.push(this);
  }
}
const last = () => probes[probes.length - 1];
const flush = () => new Promise((r) => setTimeout(r, 0));

beforeEach(() => {
  document.body.innerHTML = "";
  probes.length = 0;
  vi.stubGlobal("Image", FakeImage);
});
afterEach(() => vi.unstubAllGlobals());

describe("createSpinner", () => {
  it("renders an accessible status", () => {
    const s = createSpinner({ size: 20, label: "Wait", append: false });
    expect(s.getAttribute("role")).toBe("status");
    expect(s.getAttribute("aria-label")).toBe("Wait");
    expect(s.style.getPropertyValue("--dom-spinner-size")).toBe("20px");
  });
});

describe("createImage (image strategy)", () => {
  it("shows the default spinner while loading, then the image", async () => {
    const onLoad = vi.fn();
    const c = createImage({ src: "/a.png", alt: "A", onLoad, append: false });
    expect(c.getState()).toBe("loading");
    expect(c.elem.dataset.state).toBe("loading");
    expect(c.elem.querySelector(".dom-spinner")).not.toBeNull();
    last().onload!();
    await flush();
    expect(c.getState()).toBe("loaded");
    expect(c.img.getAttribute("src")).toBe("/a.png");
    expect(c.elem.querySelector(".dom-spinner")).toBeNull();
    expect(onLoad).toHaveBeenCalledWith(c.img);
  });

  it("injects a custom spinner (node and factory)", () => {
    const mine = document.createElement("i");
    mine.className = "mine";
    const a = createImage({ src: "/a.png", spinner: mine, append: false });
    expect(a.elem.querySelector(".mine")).toBe(mine);
    const b = createImage({ src: "/b.png", spinner: () => ({ tag: "b", text: "…" }), append: false });
    expect(b.elem.querySelector("b")?.textContent).toBe("…");
    const none = createImage({ src: "/c.png", spinner: false, append: false });
    expect(none.elem.querySelector(".dom-image__layer")?.childNodes.length).toBe(0);
  });

  it("goes to error state with default fallback and retries", async () => {
    const onError = vi.fn();
    const c = createImage({ src: "/bad.png", onError, append: false });
    last().onerror!();
    await flush();
    expect(c.getState()).toBe("error");
    expect(c.img.hasAttribute("src")).toBe(false);
    expect(onError).toHaveBeenCalledOnce();
    c.elem.querySelector<HTMLElement>(".dom-image__retry")!.click();
    expect(c.getState()).toBe("loading");
    last().onload!();
    await flush();
    expect(c.getState()).toBe("loaded");
  });

  it("supports a custom fallback", async () => {
    const c = createImage({ src: "/bad.png", fallback: "nope", append: false });
    last().onerror!();
    await flush();
    expect(c.elem.textContent).toBe("nope");
  });

  it("auto-retries before failing", async () => {
    const c = createImage({ src: "/x.png", retries: 1, append: false });
    last().onerror!();
    await flush();
    expect(probes.length).toBe(2);
    expect(c.getState()).toBe("loading");
    last().onerror!();
    await flush();
    expect(c.getState()).toBe("error");
  });

  it("setSrc ignores the stale load", async () => {
    const c = createImage({ src: "/old.png", append: false });
    const old = last();
    c.setSrc("/new.png", "new");
    const fresh = last();
    old.onload?.();
    await flush();
    expect(c.getState()).toBe("loading");
    fresh.onload!();
    await flush();
    expect(c.img.getAttribute("src")).toBe("/new.png");
    expect(c.img.alt).toBe("new");
  });

  it("times out", async () => {
    vi.useFakeTimers();
    const c = createImage({ src: "/slow.png", timeout: 50, append: false });
    vi.advanceTimersByTime(60);
    vi.useRealTimers();
    await flush();
    expect(c.getState()).toBe("error");
  });
});

describe("createImage (fetch strategy)", () => {
  beforeEach(() => {
    URL.createObjectURL = vi.fn(() => "blob:fake");
    URL.revokeObjectURL = vi.fn();
  });

  it("loads via fetch and uses a blob URL", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, blob: async () => ({ type: "image/png" }) })));
    const c = createImage({ src: "/a.png", strategy: "fetch", append: false });
    await flush();
    expect(c.getState()).toBe("loaded");
    expect(c.img.getAttribute("src")).toBe("blob:fake");
    c.destroy();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:fake");
  });

  it("fails on HTTP errors and non-images", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status: 404, blob: async () => ({ type: "" }) })));
    const onError = vi.fn();
    const c = createImage({ src: "/missing.png", strategy: "fetch", onError, append: false });
    await flush();
    expect(c.getState()).toBe("error");
    expect(onError.mock.calls[0][0].message).toContain("404");

    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, status: 200, blob: async () => ({ type: "text/html" }) })));
    c.reload();
    await flush();
    expect(c.getState()).toBe("error");
  });
});

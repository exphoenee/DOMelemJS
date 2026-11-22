import createDOMElem from "../createDOMElem";
import {
  appendContent,
  cx,
  mod,
  type ComponentParent,
  type ContentInput,
} from "./shared";

export interface CarouselOptions {
  /** One entry per slide. */
  slides: Array<ContentInput | ContentInput[]>;
  /** Initially active slide (default 0). */
  startIndex?: number;
  /** Accessible labels (override for translations). */
  labels?: {
    stage?: string;
    nav?: string;
    prev?: string;
    next?: string;
    /** Receives the 1-based dot number. */
    dot?: (n: number) => string;
  };
  /** Hide the dots (default shown). */
  showDots?: boolean;
  /** Hide the arrow buttons (default shown). */
  showArrows?: boolean;
  /** Slide width in px (sets `--dom-carousel-slide-w`). */
  slideWidth?: number;
  /** Stage height in px (sets `--dom-carousel-height`). */
  height?: number;
  className?: string;
  parent?: ComponentParent;
  append?: boolean;
  onChange?: (index: number) => void;
}

export interface CarouselController {
  elem: HTMLElement;
  goTo(index: number): void;
  next(): void;
  prev(): void;
  getIndex(): number;
}

const FOCUSABLE = "a, button, input, select, textarea, [tabindex]";

/**
 * Only the active slide takes part in the tab order. Original tabindex
 * values are remembered in `data-tabindex` and restored on activation.
 */
function setSlideFocus(slide: HTMLElement, active: boolean): void {
  slide.setAttribute("aria-hidden", active ? "false" : "true");
  slide.querySelectorAll<HTMLElement>(FOCUSABLE).forEach((el) => {
    if (active) {
      const orig = el.dataset.tabindex;
      if (orig === undefined) return; // never deactivated: markup untouched
      if (orig === "") el.removeAttribute("tabindex");
      else el.setAttribute("tabindex", orig);
    } else {
      if (el.dataset.tabindex === undefined) {
        el.dataset.tabindex = el.getAttribute("tabindex") ?? "";
      }
      el.setAttribute("tabindex", "-1");
    }
  });
}

const chevron = (d: string): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

/**
 * A 3D coverflow carousel: one active slide in front, previous / next
 * flanking it rotated, the rest hidden. Prev/next arrows, dots, click on a
 * flanking slide, drag / swipe (pointer events) and keyboard
 * (arrows wrap, Home / End jump).
 */
export default function createCarousel(options: CarouselOptions): CarouselController {
  const { slides: slideContents, onChange } = options;
  const N = slideContents.length;
  const labels = options.labels ?? {};
  const style: Record<string, string> = {};
  if (options.slideWidth) style["--dom-carousel-slide-w"] = `${options.slideWidth}px`;
  if (options.height) style["--dom-carousel-height"] = `${options.height}px`;

  const stage = createDOMElem({
    tag: "div",
    append: false,
    attrs: {
      class: "dom-carousel__stage",
      role: "region",
      "aria-roledescription": "carousel",
      "aria-label": labels.stage ?? "Carousel",
      tabindex: 0,
    },
  });
  const slides = slideContents.map((c) => {
    const slide = createDOMElem({
      tag: "div",
      append: false,
      attrs: { class: "dom-carousel__slide" },
    });
    appendContent(slide, c);
    stage.appendChild(slide);
    return slide;
  });

  const prevBtn = createDOMElem({
    tag: "button",
    content: chevron("M15 18l-6-6 6-6"),
    append: false,
    attrs: {
      type: "button",
      class: "dom-carousel__arrow dom-carousel__prev",
      "aria-label": labels.prev ?? "Previous",
    },
  });
  const nextBtn = createDOMElem({
    tag: "button",
    content: chevron("M9 6l6 6-6 6"),
    append: false,
    attrs: {
      type: "button",
      class: "dom-carousel__arrow dom-carousel__next",
      "aria-label": labels.next ?? "Next",
    },
  });
  const dotsWrap = createDOMElem({
    tag: "div",
    append: false,
    attrs: { class: "dom-carousel__dots", role: "group" },
  });

  const nav = createDOMElem({
    tag: "div",
    append: false,
    attrs: {
      class: "dom-carousel__nav",
      role: "group",
      "aria-label": labels.nav ?? "Carousel navigation",
    },
    children: [
      ...(options.showArrows === false ? [] : [prevBtn]),
      ...(options.showDots === false ? [] : [dotsWrap]),
      ...(options.showArrows === false ? [] : [nextBtn]),
    ],
  });

  const root = createDOMElem({
    tag: "div",
    parent: options.parent,
    append: options.append,
    attrs: { class: cx("dom-carousel", options.className) },
    style,
    children: [stage, nav],
  });

  let current = 0;

  const dots = slides.map((_, i) => {
    const d = createDOMElem({
      tag: "button",
      append: false,
      attrs: {
        type: "button",
        class: "dom-carousel__dot",
        "aria-label": labels.dot ? labels.dot(i + 1) : `Slide ${i + 1}`,
      },
    });
    d.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(d);
    return d;
  });

  function goTo(idx: number): void {
    if (!N) return;
    const previous = current;
    current = mod(idx, N);
    const prev = mod(current - 1, N);
    const next = mod(current + 1, N);
    slides.forEach((slide, i) => {
      let state: string;
      if (i === current) state = "active";
      else if (i === prev) state = "prev";
      else if (i === next) state = "next";
      else state = mod(i - current, N) <= Math.floor(N / 2) ? "hidden-next" : "hidden-prev";
      slide.dataset.state = state;
      setSlideFocus(slide, state === "active");
    });
    dots.forEach((d, i) => {
      d.classList.toggle("is-active", i === current);
      d.setAttribute("aria-current", String(i === current));
    });
    if (previous !== current) onChange?.(current);
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  // Click a flanking slide to advance toward it; the active slide keeps its own controls.
  stage.addEventListener("click", (e) => {
    const slide = (e.target as HTMLElement).closest<HTMLElement>(".dom-carousel__slide");
    if (!slide) return;
    const state = slide.dataset.state;
    if (state === "prev" || state === "next") {
      e.preventDefault();
      e.stopPropagation();
      goTo(current + (state === "next" ? 1 : -1));
    }
  });

  // Drag / swipe with Pointer Events; vertical scrolling stays with the browser (touch-action: pan-y).
  let slideW = options.slideWidth ?? 360;
  const measureSlide = (): void => {
    slideW = slides[0]?.offsetWidth || slideW;
  };
  const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
  const drag = { active: false, startX: 0, startY: 0, moved: false, suppress: false };

  stage.addEventListener("pointerdown", (e) => {
    if (drag.active) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    measureSlide();
    drag.active = true;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.moved = false;
    drag.suppress = false;
    // No pointer capture yet: it would retarget the click of a plain tap to the stage.
  });

  stage.addEventListener("pointermove", (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.active = false;
        return;
      }
      drag.moved = true;
      stage.classList.add("is-dragging");
      try {
        stage.setPointerCapture(e.pointerId);
      } catch {
        /* synthetic or unsupported pointers */
      }
    }
    if (Math.abs(dx) > 8) drag.suppress = true;
    stage.style.setProperty("--dom-carousel-drag", `${clamp(dx, -slideW * 0.5, slideW * 0.5)}px`);
  });

  stage.addEventListener("pointerup", (e) => {
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    drag.active = false;
    stage.classList.remove("is-dragging");
    if (!drag.moved) return;
    stage.style.setProperty("--dom-carousel-drag", "0px");
    if (Math.abs(dx) >= Math.max(40, slideW * 0.18)) goTo(dx < 0 ? current + 1 : current - 1);
  });

  stage.addEventListener("pointercancel", () => {
    if (!drag.active) return;
    drag.active = false;
    stage.classList.remove("is-dragging");
    stage.style.setProperty("--dom-carousel-drag", "0px");
  });

  // Swallow the click that ends a real drag (capture phase).
  stage.addEventListener(
    "click",
    (e) => {
      if (drag.suppress) {
        e.preventDefault();
        e.stopPropagation();
        drag.suppress = false;
      }
    },
    true
  );
  stage.addEventListener("dragstart", (e) => e.preventDefault());

  // Keyboard on the stage and the nav arrows.
  // Only when the stage or an arrow itself is focused, so controls inside a
  // slide (e.g. tabs) keep their own arrow keys.
  const onKey = (e: KeyboardEvent): void => {
    if (e.target !== stage && e.target !== prevBtn && e.target !== nextBtn) return;
    if (e.key === "ArrowRight") goTo(current + 1);
    else if (e.key === "ArrowLeft") goTo(current - 1);
    else if (e.key === "Home") goTo(0);
    else if (e.key === "End") goTo(N - 1);
    else return;
    e.preventDefault();
  };
  for (const el of [stage, prevBtn, nextBtn]) el.addEventListener("keydown", onKey);

  goTo(options.startIndex ?? 0);

  return {
    elem: root,
    goTo,
    next: () => goTo(current + 1),
    prev: () => goTo(current - 1),
    getIndex: () => current,
  };
}

import { describe, it, expect, beforeEach, vi } from "vitest";
import { createTabs, createGrid, createCarousel, createTimeline } from "../src/index";

beforeEach(() => {
  document.body.innerHTML = "";
});

describe("createTabs", () => {
  const make = (onChange?: (id: string) => void) =>
    createTabs({
      tabs: [
        { id: "a", label: "A", content: "Panel A" },
        { id: "b", label: "B", content: "Panel B" },
        { id: "c", label: "C", content: "Panel C" },
      ],
      onChange,
    });

  it("activates the first tab and wires ARIA", () => {
    const t = make();
    const tabs = t.elem.querySelectorAll<HTMLElement>("[role=tab]");
    expect(tabs[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs[1].tabIndex).toBe(-1);
    const panels = t.elem.querySelectorAll<HTMLElement>("[role=tabpanel]");
    expect(panels[0].hidden).toBe(false);
    expect(panels[1].hidden).toBe(true);
    expect(tabs[0].getAttribute("aria-controls")).toBe(panels[0].id);
  });

  it("switches on click and fires onChange", () => {
    const cb = vi.fn();
    const t = make(cb);
    t.elem.querySelectorAll<HTMLElement>("[role=tab]")[1].click();
    expect(t.getActive()).toBe("b");
    expect(cb).toHaveBeenCalledWith("b");
  });

  it("supports arrow keys with wrap, Home and End", () => {
    const t = make();
    const tabs = t.elem.querySelectorAll<HTMLElement>("[role=tab]");
    const key = (el: HTMLElement, k: string) =>
      el.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
    key(tabs[0], "ArrowLeft");
    expect(t.getActive()).toBe("c");
    key(tabs[2], "ArrowRight");
    expect(t.getActive()).toBe("a");
    key(tabs[0], "End");
    expect(t.getActive()).toBe("c");
    key(tabs[2], "Home");
    expect(t.getActive()).toBe("a");
  });

  it("setLabel and setContent patch in place", () => {
    const t = make();
    t.setLabel("a", "X");
    t.setContent("a", "New");
    expect(t.elem.querySelector("[role=tab]")?.textContent).toBe("X");
    expect(t.elem.querySelector("[role=tabpanel]")?.textContent).toBe("New");
  });
});

describe("createGrid", () => {
  it("renders items and sets CSS variables", () => {
    const g = createGrid({ items: ["a", { tag: "b", text: "c" }], minItemWidth: 200, gap: 10 });
    expect(g.elem.childNodes.length).toBe(2);
    expect(g.elem.style.getPropertyValue("--dom-grid-min")).toBe("200px");
    g.setItems(["x"]);
    expect(g.elem.textContent).toBe("x");
    g.addItem("y");
    expect(g.elem.textContent).toBe("xy");
  });

  it("fixed columns", () => {
    const g = createGrid({ items: [], columns: 3 });
    expect(g.elem.classList.contains("dom-grid--fixed")).toBe(true);
    expect(g.elem.style.getPropertyValue("--dom-grid-columns")).toContain("3");
  });
});

describe("createCarousel", () => {
  const make = () =>
    createCarousel({
      slides: [
        { tag: "div", text: "1" },
        { tag: "div", text: "2" },
        { tag: "div", text: "3" },
        { tag: "div", text: "4" },
        { tag: "div", text: "5" },
      ],
    });
  const states = (c: ReturnType<typeof make>) =>
    [...c.elem.querySelectorAll<HTMLElement>(".dom-carousel__slide")].map((s) => s.dataset.state);

  it("lays out coverflow states and dots", () => {
    const c = make();
    expect(states(c)).toEqual(["active", "next", "hidden-next", "hidden-prev", "prev"]);
    expect(c.elem.querySelectorAll(".dom-carousel__dot").length).toBe(5);
  });

  it("wraps with next/prev and goTo", () => {
    const c = make();
    c.prev();
    expect(c.getIndex()).toBe(4);
    c.next();
    c.next();
    expect(c.getIndex()).toBe(1);
    c.goTo(3);
    expect(states(c)[3]).toBe("active");
  });

  it("buttons, dots, flanking click and keyboard navigate", () => {
    const c = make();
    c.elem.querySelector<HTMLElement>(".dom-carousel__next")!.click();
    expect(c.getIndex()).toBe(1);
    c.elem.querySelectorAll<HTMLElement>(".dom-carousel__dot")[3].click();
    expect(c.getIndex()).toBe(3);
    c.elem.querySelectorAll<HTMLElement>(".dom-carousel__slide")[4].click(); // next of 3
    expect(c.getIndex()).toBe(4);
    const stage = c.elem.querySelector<HTMLElement>(".dom-carousel__stage")!;
    stage.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    expect(c.getIndex()).toBe(0);
  });

  it("keeps only the active slide focusable and restores tabindex", () => {
    const c = createCarousel({
      slides: [
        { tag: "button", text: "x", attrs: { tabindex: 0 } },
        { tag: "a", text: "y", attrs: { href: "#" } },
      ],
    });
    const [s0, s1] = [...c.elem.querySelectorAll<HTMLElement>(".dom-carousel__slide")];
    expect(s1.querySelector("a")!.getAttribute("tabindex")).toBe("-1");
    expect(s0.getAttribute("aria-hidden")).toBe("false");
    c.next();
    expect(s0.querySelector("button")!.getAttribute("tabindex")).toBe("-1");
    expect(s1.querySelector("a")!.hasAttribute("tabindex")).toBe(false);
    c.prev();
    expect(s0.querySelector("button")!.getAttribute("tabindex")).toBe("0");
  });

  it("onChange fires only on change", () => {
    const cb = vi.fn();
    const c = createCarousel({ slides: ["a", "b"], onChange: cb });
    expect(cb).not.toHaveBeenCalled();
    c.next();
    expect(cb).toHaveBeenCalledWith(1);
  });
});

describe("createTimeline", () => {
  const items = [
    { period: "2020", title: "Dev", subtitle: "Acme", description: "Did things", badge: "now" },
    { period: "2018", title: "Junior" },
  ];

  it("renders items, badge and description", () => {
    const t = createTimeline({ items });
    expect(t.elem.querySelectorAll(".dom-timeline__item").length).toBe(2);
    expect(t.elem.querySelector(".dom-timeline__badge")?.textContent).toBe("now");
    expect(t.elem.querySelectorAll(".dom-timeline__desc").length).toBe(1);
  });

  it("toggles compact and re-renders text", () => {
    const t = createTimeline({ items, compact: true });
    expect(t.elem.classList.contains("is-compact")).toBe(true);
    t.setCompact(false);
    expect(t.isCompact()).toBe(false);
    expect(t.elem.classList.contains("is-compact")).toBe(false);
    t.setItems([{ period: "p", title: "t" }]);
    expect(t.elem.querySelectorAll(".dom-timeline__item").length).toBe(1);
  });

  it("appends to parent selector", () => {
    document.body.innerHTML = '<div id="host"></div>';
    createTimeline({ items, parent: "#host" });
    expect(document.querySelector("#host .dom-timeline")).not.toBeNull();
  });
});

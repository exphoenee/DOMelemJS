import { describe, it, expect, beforeEach } from "vitest";
import { createDOMElem, DOMElem, HTML_TAGS } from "../src/index";

describe("createDOMElem", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("creates a basic element", () => {
    const el = createDOMElem({ tag: "div", append: false });
    expect(el.tagName).toBe("DIV");
  });

  it("sets text content", () => {
    const el = createDOMElem({ tag: "p", text: "Hello", append: false });
    expect(el.textContent).toBe("Hello");
  });

  it("sets innerHTML via content", () => {
    const el = createDOMElem({
      tag: "div",
      content: "<b>Bold</b>",
      append: false,
    });
    expect(el.innerHTML).toBe("<b>Bold</b>");
  });

  it("text takes precedence over content", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = createDOMElem({
      tag: "div",
      text: "Plain",
      content: "<b>Bold</b>",
      append: false,
    });
    expect(el.textContent).toBe("Plain");
    expect(el.innerHTML).toBe("Plain");
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("applies attributes", () => {
    const el = createDOMElem({
      tag: "input",
      attrs: { type: "text", id: "name" },
      append: false,
    });
    expect(el.getAttribute("type")).toBe("text");
    expect(el.getAttribute("id")).toBe("name");
  });

  it("applies class attribute with diacritics stripped by default", () => {
    const el = createDOMElem({
      tag: "div",
      attrs: { class: "szöveg" },
      append: false,
    });
    expect(el.getAttribute("class")).toBe("szoveg");
  });

  it("preserves diacritics when stripDiacritics is false", () => {
    const el = createDOMElem({
      tag: "div",
      attrs: { class: "szöveg" },
      stripDiacritics: false,
      append: false,
    });
    expect(el.getAttribute("class")).toBe("szöveg");
  });

  it("applies style object", () => {
    const el = createDOMElem({
      tag: "div",
      style: { color: "red", fontSize: "14px" },
      append: false,
    });
    expect(el.style.color).toBe("red");
    expect(el.style.fontSize).toBe("14px");
  });

  it("applies style string", () => {
    const el = createDOMElem({
      tag: "div",
      style: "color: blue",
      append: false,
    });
    expect(el.style.color).toBe("blue");
  });

  it("applies style array (mixed)", () => {
    const el = createDOMElem({
      tag: "div",
      style: ["color: green", { fontSize: "12px" }],
      append: false,
    });
    expect(el.style.color).toBe("green");
    expect(el.style.fontSize).toBe("12px");
  });

  it("appends to parent element", () => {
    const parent = document.createElement("div");
    document.body.appendChild(parent);
    const el = createDOMElem({ tag: "span", parent });
    expect(parent.children.length).toBe(1);
    expect(parent.children[0]).toBe(el);
  });

  it("appends to parent via CSS selector", () => {
    const parent = document.createElement("div");
    parent.id = "app";
    document.body.appendChild(parent);
    const el = createDOMElem({ tag: "span", parent: "#app" });
    expect(parent.children[0]).toBe(el);
  });

  it("falls back to body when selector not found", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const el = createDOMElem({ tag: "span", parent: "#nonexistent" });
    expect(document.body.children[0]).toBe(el);
    expect(spy).toHaveBeenCalledOnce();
    spy.mockRestore();
  });

  it("does not append when append is false", () => {
    const el = createDOMElem({ tag: "div", append: false });
    expect(el.parentElement).toBeNull();
  });

  it("creates children recursively", () => {
    const el = createDOMElem({
      tag: "ul",
      append: false,
      children: [
        { tag: "li", text: "Item 1" },
        { tag: "li", text: "Item 2" },
      ],
    });
    expect(el.children.length).toBe(2);
    expect(el.children[0].textContent).toBe("Item 1");
    expect(el.children[1].textContent).toBe("Item 2");
  });

  it("accepts HTMLElement as child", () => {
    const child = document.createElement("span");
    child.textContent = "raw";
    const el = createDOMElem({
      tag: "div",
      append: false,
      children: [child],
    });
    expect(el.children[0]).toBe(child);
  });

  it("attaches single event listener", () => {
    let clicked = false;
    const el = createDOMElem({
      tag: "button",
      append: false,
      handleEvent: { event: "click", cb: () => { clicked = true; } },
    });
    el.click();
    expect(clicked).toBe(true);
  });

  it("attaches multiple event listeners", () => {
    let count = 0;
    const el = createDOMElem({
      tag: "input",
      append: false,
      handleEvent: [
        { event: "focus", cb: () => { count++; } },
        { event: "blur", cb: () => { count++; } },
      ],
    });
    el.dispatchEvent(new Event("focus"));
    el.dispatchEvent(new Event("blur"));
    expect(count).toBe(2);
  });

  it("handles dataset attribute", () => {
    const el = createDOMElem({
      tag: "div",
      attrs: { dataset: { id: "foo", name: "bar" } },
      append: false,
    });
    expect(el.dataset.id).toBe("foo");
    expect(el.dataset.name).toBe("bar");
  });

  it("handles checked attribute on input", () => {
    const el = createDOMElem({
      tag: "input",
      attrs: { type: "checkbox", checked: true },
      append: false,
    }) as HTMLInputElement;
    expect(el.checked).toBe(true);
  });

  it("accepts attributes as array", () => {
    const el = createDOMElem({
      tag: "input",
      attrs: [{ id: "a" }, { class: "b" }],
      append: false,
    });
    expect(el.getAttribute("id")).toBe("a");
    expect(el.getAttribute("class")).toBe("b");
  });
});

describe("DOMElem class", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  it("creates element accessible via .elem", () => {
    const d = new DOMElem({ tag: "div", text: "Hi", append: false });
    expect(d.elem.tagName).toBe("DIV");
    expect(d.elem.textContent).toBe("Hi");
  });

  it("stores options", () => {
    const opts = { tag: "span", text: "Test" };
    const d = new DOMElem({ ...opts, append: false });
    expect(d.options.tag).toBe("span");
  });

  it("addEventListener and removeEventListener", () => {
    const d = new DOMElem({ tag: "button", append: false });
    let count = 0;
    const handler = () => { count++; };
    d.addEventListener("click", handler);
    d.elem.click();
    expect(count).toBe(1);
    d.removeEventListener("click", handler);
    d.elem.click();
    expect(count).toBe(1);
  });

  it("removeAllListeners", () => {
    const d = new DOMElem({ tag: "button", append: false });
    let count = 0;
    d.addEventListener("click", () => { count++; });
    d.addEventListener("focus", () => { count++; });
    d.removeAllListeners();
    d.elem.click();
    d.elem.dispatchEvent(new Event("focus"));
    expect(count).toBe(0);
  });

  it("tracks listeners from constructor handleEvent", () => {
    let count = 0;
    const handler = () => { count++; };
    const d = new DOMElem({
      tag: "button",
      append: false,
      handleEvent: { event: "click", cb: handler },
    });
    d.elem.click();
    expect(count).toBe(1);
    d.removeEventListener("click", handler);
    d.elem.click();
    expect(count).toBe(1);
  });

  it("supports chaining", () => {
    const d = new DOMElem({ tag: "div", append: false });
    const result = d.addEventListener("click", () => {}).addEventListener("focus", () => {});
    expect(result).toBe(d);
  });
});

describe("HTML_TAGS export", () => {
  it("contains common tags", () => {
    expect(HTML_TAGS).toContain("div");
    expect(HTML_TAGS).toContain("span");
    expect(HTML_TAGS).toContain("input");
    expect(HTML_TAGS).toContain("button");
    expect(HTML_TAGS).toContain("a");
    expect(HTML_TAGS).toContain("img");
  });
});

describe("createDOMElem custom properties", () => {
  it("supports CSS custom properties in style", () => {
    const el = createDOMElem({ tag: "div", style: { "--x": "12px" }, append: false });
    expect(el.style.getPropertyValue("--x")).toBe("12px");
  });
});

import { makeCamelCase, toArray, noSpecChars } from "./utils";
import type { CreateDOMElemOptions, AttrsInput, StyleInput } from "./types";

/** Attributes that have special characters stripped automatically. */
const NO_SPEC_CHARS_ATTRS = ["class", "id"];

/**
 * Resolves a parent element from a string selector or HTMLElement reference.
 *
 * If the string starts with `#` or `.`, it is used directly as a querySelector
 * argument. Otherwise, it is tried first as `#<selector>` then as `.<selector>`.
 *
 * @param parent - An HTMLElement or a CSS selector string.
 * @returns The resolved HTMLElement.
 * @throws Will console.warn if the selector does not match any element.
 */
function resolveParent(parent: HTMLElement | string): HTMLElement {
  if (parent instanceof HTMLElement) return parent;

  let el: Element | null = null;

  if (parent.charAt(0) === "#" || parent.charAt(0) === ".") {
    el = document.querySelector(parent);
  } else {
    el =
      document.querySelector(`#${parent}`) ||
      document.querySelector(`.${parent}`) ||
      document.querySelector(parent);
  }

  if (!el) {
    console.warn(
      `[DOMElemJS] Parent element not found for selector: "${parent}". ` +
        `Falling back to document.body.`
    );
    return document.body;
  }

  return el as HTMLElement;
}

/**
 * Applies HTML attributes to an element from an {@link AttrsInput}.
 *
 * Handles special cases:
 * - `"checked"` — sets the checked property on the element.
 * - `"dataset"` — merges data-* attributes via `elem.dataset`.
 * - Other attributes — joined with spaces, with special characters stripped
 *   for `"class"` and `"id"` when `stripDiacritics` is enabled.
 *
 * @param elem - The target element.
 * @param attrs - Attributes to apply.
 * @param stripDiacritics - Whether to strip diacritics from class/id.
 */
function applyAttrs(
  elem: HTMLElement,
  attrs: AttrsInput,
  stripDiacritics: boolean
): void {
  for (const attrObj of toArray(attrs)) {
    for (const [key, value] of Object.entries(attrObj)) {
      if (value == null) continue;

      if (key === "checked") {
        (elem as HTMLInputElement).checked = !!value;
      } else if (
        key === "dataset" &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        Object.assign(elem.dataset, value);
      } else {
        const rawValues = Array.isArray(value) ? value : [value];
        const values = rawValues.map((v) =>
          stripDiacritics && NO_SPEC_CHARS_ATTRS.includes(key)
            ? noSpecChars(String(v))
            : String(v)
        );
        elem.setAttribute(key, values.join(" "));
      }
    }
  }
}

/**
 * Applies inline CSS styles to an element from a {@link StyleInput}.
 *
 * Accepts:
 * - A CSS string: `"color: red; font-size: 14px"`
 * - An object: `{ color: "red", fontSize: "14px" }`
 * - An array mixing both formats
 *
 * @param elem - The target element.
 * @param style - Style input to apply.
 */
function applyStyle(elem: HTMLElement, style: StyleInput): void {
  const styleParts = toArray(style)
    .map((s) => {
      if (typeof s === "object" && s !== null) {
        return Object.entries(s)
          .map(([k, v]) => `${k}: ${v}`)
          .join("; ");
      }
      return toArray(s).join("; ");
    })
    .join("; ");

  styleParts
    .split(";")
    .filter(Boolean)
    .forEach((styleText) => {
      const colonIndex = styleText.indexOf(":");
      if (colonIndex === -1) return;
      const prop = styleText.slice(0, colonIndex).trim();
      const val = styleText.slice(colonIndex + 1).trim();
      if (prop) {
        const camelProp = makeCamelCase(prop);
        (elem.style as unknown as Record<string, string>)[camelProp] = val;
      }
    });
}

/**
 * Appends child elements to a parent element.
 *
 * Each child can be either an {@link HTMLElement} or a
 * {@link CreateDOMElemOptions} object that will be recursively created.
 *
 * @param elem - The parent element to append children to.
 * @param children - Array of child elements or options.
 */
function applyChildren(
  elem: HTMLElement,
  children: Array<CreateDOMElemOptions | HTMLElement>
): void {
  for (const child of children) {
    if (child instanceof HTMLElement) {
      elem.appendChild(child);
    } else {
      elem.appendChild(createDOMElem(child));
    }
  }
}

/**
 * Attaches event listeners to an element.
 *
 * @param elem - The target element.
 * @param handleEvent - One or more {@link EventHandler} descriptors.
 */
function applyEvents(
  elem: HTMLElement,
  handleEvent: CreateDOMElemOptions["handleEvent"]
): void {
  for (const evt of toArray(handleEvent)) {
    if (evt?.event && evt?.cb) {
      elem.addEventListener(evt.event, evt.cb);
    }
  }
}

/**
 * Creates a DOM element with the given configuration.
 *
 * This is the core function of DOMelemJS. It creates an HTML element,
 * applies attributes, styles, children, and event listeners, then
 * appends it to a parent element.
 *
 * @example
 * ```ts
 * const el = createDOMElem({
 *   tag: "div",
 *   text: "Hello",
 *   attrs: { class: "greeting" },
 *   style: { color: "blue" },
 *   parent: "#app",
 *   handleEvent: {
 *     event: "click",
 *     cb: () => console.log("clicked"),
 *   },
 * });
 * ```
 *
 * @param options - Element creation options.
 * @returns The created HTMLElement.
 */
export default function createDOMElem(options: CreateDOMElemOptions): HTMLElement {
  const {
    tag,
    content,
    text,
    attrs,
    style,
    children,
    parent,
    handleEvent,
    append = true,
    stripDiacritics = true,
  } = options;

  if (content && text) {
    console.warn(
      `[DOMElemJS] Both "content" and "text" provided for <${tag}>. ` +
        `"text" takes precedence — "content" will be ignored.`
    );
  }

  const elem = document.createElement(tag);

  if (text) {
    elem.textContent = text;
  } else if (content) {
    elem.innerHTML = content;
  }

  if (attrs) applyAttrs(elem, attrs, stripDiacritics);
  if (style) applyStyle(elem, style);
  if (children) applyChildren(elem, children);
  if (handleEvent) applyEvents(elem, handleEvent);

  if (append) {
    const target = parent ? resolveParent(parent) : document.body;
    target.appendChild(elem);
  }

  return elem;
}

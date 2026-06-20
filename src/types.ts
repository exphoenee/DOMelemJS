import type { HtmlTagConst } from "./htmlTags";

/** HTML tag name — a string union of valid tags, or any string for flexibility. */
export type HtmlTag = HtmlTagConst | string;

/** A single CSS style value — either a string or a numeric pixel value. */
export type StyleValue = string | number;

/**
 * Style input accepted by `createDOMElem`.
 *
 * Can be:
 * - a CSS string (`"color: red; background: blue"`)
 * - an object (`{ color: "red", background: "blue" }`)
 * - an array mixing both formats
 */
export type StyleInput =
  | string
  | Record<string, StyleValue>
  | Array<string | Record<string, StyleValue>>;

/** Dataset (`data-*`) input — a single object or an array of objects. */
export type DatasetInput = Record<string, string> | Array<Record<string, string>>;

/**
 * Attributes input accepted by `createDOMElem`.
 *
 * Can be a single object or an array of objects.
 * Special keys:
 * - `"checked"` — sets the checked property on inputs
 * - `"dataset"` — merges data-* attributes via `elem.dataset`
 */
export type AttrsInput =
  | Record<string, string | number | boolean | DatasetInput>
  | Array<Record<string, string | number | boolean | DatasetInput>>;

/**
 * Event handler descriptor.
 *
 * @property event - The DOM event name (e.g. `"click"`, `"change"`).
 * @property cb - The callback function invoked when the event fires.
 */
export type EventHandler = {
  event: string;
  cb: (e: Event) => void;
};

/**
 * Parent element input.
 *
 * Can be an `HTMLElement` reference or a CSS selector string
 * (e.g. `"#app"`, `".container"`, `"app"`).
 */
export type ParentInput = HTMLElement | string;

/**
 * Options for creating a DOM element.
 *
 * @property tag - The HTML tag name to create.
 * @property content - Raw HTML string to set as innerHTML.
 * @property text - Plain text to set as textContent.
 * @property attrs - HTML attributes to set on the element.
 * @property style - CSS styles to apply (string, object, or array).
 * @property children - Child elements (options objects or HTMLElements).
 * @property parent - Parent element to append to (default: `document.body`).
 * @property handleEvent - Event listener(s) to attach.
 * @property append - Whether to append the element to its parent (default: `true`).
 */
export interface CreateDOMElemOptions {
  tag: HtmlTag;
  content?: string;
  text?: string;
  attrs?: AttrsInput;
  style?: StyleInput;
  children?: Array<CreateDOMElemOptions | HTMLElement>;
  parent?: ParentInput;
  handleEvent?: EventHandler | EventHandler[];
  append?: boolean;
  /** Whether to strip diacritics from `class` and `id` attributes. Defaults to `true`. */
  stripDiacritics?: boolean;
}

/** Options type for the `DOMElem` class — identical to `CreateDOMElemOptions`. */
export type DOMElemOptions = CreateDOMElemOptions;

/** Function signature for `createDOMElem`. */
export type CreateDOMElemFn = (options: CreateDOMElemOptions) => HTMLElement;

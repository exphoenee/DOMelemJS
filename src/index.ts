/**
 * DOMelemJS — a lightweight, zero-dependency library for creating
 * DOM elements from JavaScript/TypeScript.
 *
 * @example
 * ```ts
 * import { createDOMElem, DOMElem } from "domelemjs";
 *
 * // Functional API
 * const el = createDOMElem({
 *   tag: "div",
 *   text: "Hello",
 *   attrs: { id: "app" },
 * });
 *
 * // Class API
 * const div = new DOMElem({ tag: "div", text: "World" });
 * ```
 *
 * @packageDocumentation
 */

export { default as DOMElem } from "./DOMElem";
export { default as createDOMElem } from "./createDOMElem";
export type {
  CreateDOMElemOptions,
  DOMElemOptions,
  EventHandler,
  StyleInput,
  AttrsInput,
  ParentInput,
  HtmlTag,
} from "./types";

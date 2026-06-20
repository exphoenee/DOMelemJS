import createDOMElem from "./createDOMElem";
import type { DOMElemOptions } from "./types";

/**
 * Wrapper class around {@link createDOMElem}.
 *
 * Provides an object-oriented API for creating DOM elements.
 * The created element is available via the `.elem` property.
 *
 * @example
 * ```ts
 * const div = new DOMElem({
 *   tag: "div",
 *   attrs: { class: "container" },
 *   text: "Hello World",
 * });
 *
 * document.body.appendChild(div.elem);
 * ```
 */
export default class DOMElem {
  /** The created HTMLElement. */
  readonly elem: HTMLElement;

  /** The options used to create the element. */
  readonly options: DOMElemOptions;

  /**
   * Creates a new DOMElem instance.
   *
   * @param options - Element creation options.
   */
  constructor(options: DOMElemOptions) {
    this.options = options;
    this.elem = createDOMElem(options);
  }
}

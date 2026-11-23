import createDOMElem from "./createDOMElem";
import type { DOMElemOptions } from "./types";

/**
 * Wrapper class around {@link createDOMElem}.
 *
 * Provides an object-oriented API for creating DOM elements.
 * The created element is available via the `.elem` property.
 * Event listeners can be added and removed via `addEventListener` /
 * `removeEventListener`.
 *
 * @example
 * ```ts
 * const div = new DOMElem({
 *   tag: "div",
 *   attrs: { class: "container" },
 *   text: "Hello World",
 * });
 *
 * div.addEventListener("click", () => console.log("clicked"));
 * div.removeEventListener("click", handler);
 * ```
 */
export default class DOMElem {
  /** The created HTMLElement. */
  readonly elem: HTMLElement;

  /** The options used to create the element. */
  readonly options: DOMElemOptions;

  private _listeners: Map<string, Set<(e: Event) => void>> = new Map();

  /**
   * Creates a new DOMElem instance.
   *
   * @param options - Element creation options.
   */
  constructor(options: DOMElemOptions) {
    this.options = options;
    this.elem = createDOMElem(options);

    if (options.handleEvent) {
      const events = Array.isArray(options.handleEvent)
        ? options.handleEvent
        : [options.handleEvent];
      for (const evt of events) {
        this._trackListener(evt.event, evt.cb);
      }
    }
  }

  /**
   * Adds an event listener to the element and tracks it for later removal.
   *
   * @param event - The DOM event name.
   * @param cb - The callback function.
   * @returns This instance for chaining.
   */
  addEventListener(event: string, cb: (e: Event) => void): this {
    this.elem.addEventListener(event, cb);
    this._trackListener(event, cb);
    return this;
  }

  /**
   * Removes a previously added event listener.
   *
   * @param event - The DOM event name.
   * @param cb - The callback function to remove.
   * @returns This instance for chaining.
   */
  removeEventListener(event: string, cb: (e: Event) => void): this {
    this.elem.removeEventListener(event, cb);
    this._untrackListener(event, cb);
    return this;
  }

  /**
   * Removes all tracked event listeners from the element.
   */
  removeAllListeners(): void {
    for (const [event, cbs] of this._listeners) {
      for (const cb of cbs) {
        this.elem.removeEventListener(event, cb);
      }
    }
    this._listeners.clear();
  }

  private _trackListener(event: string, cb: (e: Event) => void): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event)!.add(cb);
  }

  private _untrackListener(event: string, cb: (e: Event) => void): void {
    this._listeners.get(event)?.delete(cb);
  }
}

import createDOMElem from "../createDOMElem";
import { appendContent, cx, type ComponentParent, type ContentInput } from "./shared";

export interface GridOptions {
  items: ContentInput[];
  /**
   * Minimum width of one column. The column count follows the available
   * width (`repeat(auto-fill, minmax(min, 1fr))`). Number = px. Default 340.
   */
  minItemWidth?: number | string;
  /** Fixed column count; overrides `minItemWidth`. */
  columns?: number;
  /** Gap between items. Number = px. Default 28. */
  gap?: number | string;
  className?: string;
  parent?: ComponentParent;
  append?: boolean;
  ariaLabel?: string;
}

export interface GridController {
  elem: HTMLElement;
  /** Replaces all items (e.g. after a filter change). */
  setItems(items: ContentInput[]): void;
  /** Adds one item to the end. */
  addItem(item: ContentInput): void;
}

const px = (v: number | string): string => (typeof v === "number" ? `${v}px` : v);

/** A responsive CSS grid; the column count follows the available width. */
export default function createGrid(options: GridOptions): GridController {
  const style: Record<string, string> = {
    "--dom-grid-min": px(options.minItemWidth ?? 340),
    "--dom-grid-gap": px(options.gap ?? 28),
  };
  if (options.columns) style["--dom-grid-columns"] = `repeat(${options.columns}, minmax(0, 1fr))`;

  const elem = createDOMElem({
    tag: "div",
    parent: options.parent,
    append: options.append,
    attrs: {
      class: cx("dom-grid", !!options.columns && "dom-grid--fixed", options.className),
      ...(options.ariaLabel ? { role: "group", "aria-label": options.ariaLabel } : {}),
    },
    style,
  });
  appendContent(elem, options.items);

  return {
    elem,
    setItems(items) {
      elem.textContent = "";
      appendContent(elem, items);
    },
    addItem(item) {
      appendContent(elem, item);
    },
  };
}

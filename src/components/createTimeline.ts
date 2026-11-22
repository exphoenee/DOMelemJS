import createDOMElem from "../createDOMElem";
import { cx, type ComponentParent, type ContentInput } from "./shared";

export interface TimelineItem {
  /** Period, e.g. "2021 – present". */
  period: string;
  /** Role / headline. */
  title: string;
  /** Company / place. */
  subtitle?: string;
  /** Description; hidden in the compact view. */
  description?: ContentInput;
  /** Small highlighted badge, e.g. "current". */
  badge?: string;
}

export interface TimelineOptions {
  items: TimelineItem[];
  /** Start in compact mode (descriptions hidden). */
  compact?: boolean;
  className?: string;
  parent?: ComponentParent;
  append?: boolean;
  ariaLabel?: string;
}

export interface TimelineController {
  elem: HTMLElement;
  setCompact(compact: boolean): void;
  isCompact(): boolean;
  /** Patches the texts in place (e.g. on a language switch); same order and length. */
  setItems(items: TimelineItem[]): void;
}

function buildItem(item: TimelineItem): HTMLElement {
  const head = createDOMElem({
    tag: "div",
    append: false,
    attrs: { class: "dom-timeline__head" },
    children: [
      { tag: "span", text: item.period, attrs: { class: "dom-timeline__period" } },
      ...(item.badge
        ? [{ tag: "span", text: item.badge, attrs: { class: "dom-timeline__badge" } }]
        : []),
    ],
  });

  const card = createDOMElem({
    tag: "div",
    append: false,
    attrs: { class: "dom-timeline__card" },
    children: [
      head,
      { tag: "h3", text: item.title, attrs: { class: "dom-timeline__title" } },
      ...(item.subtitle
        ? [{ tag: "div", text: item.subtitle, attrs: { class: "dom-timeline__subtitle" } }]
        : []),
    ],
  });

  if (item.description !== undefined) {
    const desc = createDOMElem({
      tag: "div",
      append: false,
      attrs: { class: "dom-timeline__desc" },
    });
    if (typeof item.description === "string") desc.textContent = item.description;
    else if (item.description instanceof Node) desc.appendChild(item.description);
    else desc.appendChild(createDOMElem({ ...item.description, append: false }));
    card.appendChild(desc);
  }

  return createDOMElem({
    tag: "div",
    append: false,
    attrs: { class: "dom-timeline__item" },
    children: [
      { tag: "span", attrs: { class: "dom-timeline__dot", "aria-hidden": "true" } },
      card,
    ],
  });
}

/** A vertical timeline whose cards alternate sides (one column on narrow screens). */
export default function createTimeline(options: TimelineOptions): TimelineController {
  let compact = !!options.compact;

  const elem = createDOMElem({
    tag: "div",
    parent: options.parent,
    append: options.append,
    attrs: {
      class: cx("dom-timeline", compact && "is-compact", options.className),
      role: "list",
      ...(options.ariaLabel ? { "aria-label": options.ariaLabel } : {}),
    },
  });

  const render = (items: TimelineItem[]): void => {
    elem.textContent = "";
    for (const item of items) {
      const node = buildItem(item);
      node.setAttribute("role", "listitem");
      elem.appendChild(node);
    }
  };
  render(options.items);

  return {
    elem,
    setCompact(value) {
      compact = value;
      elem.classList.toggle("is-compact", compact);
    },
    isCompact: () => compact,
    setItems: render,
  };
}

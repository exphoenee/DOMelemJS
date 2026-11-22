import createDOMElem from "../createDOMElem";
import {
  appendContent,
  cx,
  uniqueId,
  type ComponentParent,
  type ContentInput,
} from "./shared";

export interface TabItem {
  /** Unique id of the tab within this tab set. */
  id: string;
  /** Tab button label. */
  label: string;
  /** Panel content. */
  content: ContentInput | ContentInput[];
}

export interface TabsOptions {
  tabs: TabItem[];
  /** Id of the initially active tab (default: the first one). */
  active?: string;
  /** Accessible name of the tablist. */
  ariaLabel?: string;
  /** Extra class on the root. */
  className?: string;
  parent?: ComponentParent;
  /** Set to `false` to build the element without attaching it. */
  append?: boolean;
  onChange?: (id: string) => void;
}

export interface TabsController {
  elem: HTMLElement;
  /** Activates a tab by id (no-op for unknown ids). */
  select(id: string, focus?: boolean): void;
  /** The active tab id. */
  getActive(): string;
  /** Changes a tab's label (e.g. on a language switch). */
  setLabel(id: string, label: string): void;
  /** Replaces a tab's panel content. */
  setContent(id: string, content: ContentInput | ContentInput[]): void;
}

/**
 * Accessible tabs (WAI-ARIA tabs pattern): roving tabindex, arrow keys wrap
 * around, Home / End jump to the ends, focus activates the tab.
 */
export default function createTabs(options: TabsOptions): TabsController {
  const { tabs, onChange } = options;
  const prefix = uniqueId("dom-tabs");
  let active = tabs.some((t) => t.id === options.active)
    ? (options.active as string)
    : tabs[0]?.id ?? "";

  const buttons = new Map<string, HTMLElement>();
  const panels = new Map<string, HTMLElement>();

  const list = createDOMElem({
    tag: "div",
    append: false,
    attrs: {
      class: "dom-tabs__list",
      role: "tablist",
      ...(options.ariaLabel ? { "aria-label": options.ariaLabel } : {}),
    },
  });
  const panelWrap = createDOMElem({
    tag: "div",
    append: false,
    attrs: { class: "dom-tabs__panels" },
  });

  for (const tab of tabs) {
    const btn = createDOMElem({
      tag: "button",
      text: tab.label,
      append: false,
      attrs: {
        type: "button",
        class: "dom-tabs__tab",
        role: "tab",
        id: `${prefix}-tab-${tab.id}`,
        "aria-controls": `${prefix}-panel-${tab.id}`,
        dataset: { tab: tab.id },
      },
    });
    const panel = createDOMElem({
      tag: "div",
      append: false,
      attrs: {
        class: "dom-tabs__panel",
        role: "tabpanel",
        id: `${prefix}-panel-${tab.id}`,
        "aria-labelledby": `${prefix}-tab-${tab.id}`,
        tabindex: 0,
      },
    });
    appendContent(panel, tab.content);
    buttons.set(tab.id, btn);
    panels.set(tab.id, panel);
    list.appendChild(btn);
    panelWrap.appendChild(panel);
  }

  const root = createDOMElem({
    tag: "div",
    parent: options.parent,
    append: options.append,
    attrs: { class: cx("dom-tabs", options.className) },
    children: [list, panelWrap],
  });

  function sync(): void {
    for (const [id, btn] of buttons) {
      const on = id === active;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", String(on));
      btn.tabIndex = on ? 0 : -1;
      const panel = panels.get(id) as HTMLElement;
      panel.hidden = !on;
      panel.classList.toggle("is-active", on);
    }
  }

  function select(id: string, focus = false): void {
    if (!buttons.has(id)) return;
    const changed = id !== active;
    active = id;
    sync();
    if (focus) buttons.get(id)?.focus();
    if (changed) onChange?.(id);
  }

  list.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".dom-tabs__tab");
    if (btn?.dataset.tab) select(btn.dataset.tab);
  });

  list.addEventListener("keydown", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".dom-tabs__tab");
    if (!btn) return;
    const ids = tabs.map((t) => t.id);
    const i = ids.indexOf(btn.dataset.tab as string);
    let next: string | undefined;
    if (e.key === "ArrowRight") next = ids[(i + 1) % ids.length];
    else if (e.key === "ArrowLeft") next = ids[(i - 1 + ids.length) % ids.length];
    else if (e.key === "Home") next = ids[0];
    else if (e.key === "End") next = ids[ids.length - 1];
    else return;
    e.preventDefault();
    select(next, true);
  });

  sync();

  return {
    elem: root,
    select,
    getActive: () => active,
    setLabel(id, label) {
      const btn = buttons.get(id);
      if (btn) btn.textContent = label;
    },
    setContent(id, content) {
      const panel = panels.get(id);
      if (!panel) return;
      panel.textContent = "";
      appendContent(panel, content);
    },
  };
}

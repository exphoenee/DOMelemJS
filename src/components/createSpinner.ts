import createDOMElem from "../createDOMElem";
import { cx, type ComponentParent } from "./shared";

export interface SpinnerOptions {
  /** Diameter in px (default 32). */
  size?: number;
  /** Accessible label (default "Loading"). */
  label?: string;
  className?: string;
  parent?: ComponentParent;
  append?: boolean;
}

/** A small CSS ring spinner; usable standalone or injected into `createImage`. */
export default function createSpinner(options: SpinnerOptions = {}): HTMLElement {
  return createDOMElem({
    tag: "span",
    parent: options.parent,
    append: options.append,
    attrs: {
      class: cx("dom-spinner", options.className),
      role: "status",
      "aria-label": options.label ?? "Loading",
    },
    style: options.size ? { "--dom-spinner-size": `${options.size}px` } : undefined,
  });
}

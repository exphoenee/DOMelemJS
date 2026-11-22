import createDOMElem from "../createDOMElem";
import type { CreateDOMElemOptions } from "../types";

/** Content accepted by the component builders: text, a node, or element options. */
export type ContentInput = string | Node | CreateDOMElemOptions;

/** Parent accepted by the component builders. */
export type ComponentParent = HTMLElement | string;

/** Turns a {@link ContentInput} into a DOM node without attaching it. */
export function toNode(content: ContentInput): Node {
  if (typeof content === "string") return document.createTextNode(content);
  if (content instanceof Node) return content;
  return createDOMElem({ ...content, append: false });
}

/** Appends one or more contents to an element. */
export function appendContent(
  target: HTMLElement,
  content: ContentInput | ContentInput[] | undefined
): void {
  if (content === undefined || content === null) return;
  const list = Array.isArray(content) ? content : [content];
  for (const c of list) target.appendChild(toNode(c));
}

/** Joins class names, skipping falsy values. */
export function cx(...names: Array<string | false | null | undefined>): string {
  return names.filter(Boolean).join(" ");
}

/** Wraps a number into `0..max-1`. */
export function mod(n: number, max: number): number {
  return ((n % max) + max) % max;
}

let uid = 0;
/** Returns a document-unique id with the given prefix. */
export function uniqueId(prefix: string): string {
  uid += 1;
  return `${prefix}-${uid}`;
}

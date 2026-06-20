/**
 * List of standard HTML tag names.
 *
 * Provided as a `const` tuple so TypeScript can infer literal types
 * (e.g. `"div"` instead of `string`).
 *
 * @example
 * import { HTML_TAGS } from "domelemjs";
 * if (HTML_TAGS.includes(tag as HtmlTagConst)) { ... }
 */
export const HTML_TAGS = [
  "a", "abbr", "address", "area", "article", "aside", "audio",
  "b", "base", "bdi", "bdo", "blockquote", "body", "br", "button",
  "canvas", "caption", "cite", "code", "col", "colgroup",
  "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt",
  "em", "embed",
  "fieldset", "figcaption", "figure", "footer", "form",
  "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hr", "html",
  "i", "iframe", "img", "input", "ins",
  "kbd",
  "label", "legend", "li", "link",
  "main", "map", "mark", "meta", "meter",
  "nav", "noscript",
  "object", "ol", "optgroup", "option", "output",
  "p", "param", "picture", "pre", "progress",
  "q",
  "rp", "rt", "ruby",
  "s", "samp", "script", "section", "select", "small", "source", "span",
  "strong", "style", "sub", "summary", "sup", "svg",
  "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead",
  "time", "title", "tr", "track",
  "u", "ul",
  "video",
  "wbr",
] as const;

/** Union type of all valid HTML tag name literals. */
export type HtmlTagConst = (typeof HTML_TAGS)[number];

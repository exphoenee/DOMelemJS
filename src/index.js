import makeCamelCase from "./Utils/makeCamelCase.js";
import makeThatArray from "./Utils/makeThatArray.js";
import noSpecChars from "./Utils/noSpecChars.js";

export const [
  a,
  abbr,
  acronym,
  address,
  applet,
  area,
  article,
  aside,
  audio,
  b,
  base,
  basefont,
  bdi,
  bdo,
  big,
  blockquote,
  body,
  br,
  button,
  canvas,
  caption,
  center,
  cite,
  code,
  col,
  colgroup,
  data,
  datalist,
  dd,
  del,
  details,
  dfn,
  dialog,
  dir,
  div,
  dl,
  dt,
  em,
  embed,
  fieldset,
  figcaption,
  figure,
  font,
  footer,
  form,
  frame,
  frameset,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  head,
  header,
  hr,
  html,
  i,
  iframe,
  img,
  input,
  ins,
  kbd,
  label,
  legend,
  li,
  link,
  main,
  map,
  mark,
  meta,
  meter,
  nav,
  noframes,
  noscript,
  object,
  ol,
  optgroup,
  option,
  output,
  p,
  param,
  picture,
  pre,
  progress,
  q,
  rp,
  rt,
  ruby,
  s,
  samp,
  script,
  section,
  select,
  small,
  source,
  span,
  strike,
  strong,
  style,
  sub,
  summary,
  sup,
  svg,
  table,
  tbody,
  td,
  template,
  textarea,
  tfoot,
  th,
  thead,
  time,
  title,
  tr,
  track,
  tt,
  u,
  ul,
  video,
  wbr,
] = [
  "a",
  "abbr",
  "acronym",
  "address",
  "applet",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "basefont",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "center",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "dir",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "font",
  "footer",
  "form",
  "frame",
  "frameset",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "meta",
  "meter",
  "nav",
  "noframes",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strike",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "svg",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",

  "track",
  "tt",
  "u",
  "ul",
  "video",
  "wbr",
];

export default function createDOMElem({
  tag,
  content,
  text,
  attrs,
  style,
  children,
  parent,
  handleEvent,
  append = true,
}) {
  /*
   * create the DOM element with the given tag
   */
  let elem = document.createElement(tag);

  /*
   * add the content
   */
  content && (elem.innerHTML = content);
  /*
   * add the text
   */
  text && (elem.textContent = text);

  /*
   *  add all the attributes they want
   */

  const noSpecChAttrs = ["class", "id"];

  attrs &&
    makeThatArray(attrs).forEach((atts) =>
      Object.keys(atts).forEach((attr) => {
        if (atts[attr]) {
          if (attr === "checked") {
            elem.checked = atts[attr];
          } else if (attr === "dataset") {
            makeThatArray(atts[attr]).map((data) =>
              Object.keys(data).forEach((d) => (elem.dataset[d] = data[d]))
            );
          } else {
            elem.setAttribute(
              attr,
              makeThatArray(atts[attr])
                .map((a) => (noSpecChAttrs.includes(attr) ? noSpecChars(a) : a))
                .join(" ")
            );
          }
        }
      })
    );

  /*
   * Adding stye is possible as:
   * * a string, with a bunch of style properties, it can be:
   * * * CCS style (e.g. background-color) or
   * * * JS/camelCase (e.g. backgroundColor) style formatted version also.
   * * or an object formatted (e.g. style: { backgroundColor: red })
   * * or an array with multiple style strings with CSS or JS vesrion, or mixed
   */

  style &&
    makeThatArray(style)
      .map((styleElem) => {
        if (typeof styleElem === "object") {
          return Object.keys(styleElem)
            .map((styleTxt) => `${styleTxt}: ${styleElem[styleTxt]}`)
            .join("; ");
        } else {
          return makeThatArray(styleElem).join("; ");
        }
      })
      .join("; ")
      .split(";")
      .forEach((styleTxts) => {
        let [styleTxt, val] = styleTxts.split(":").map((c) => c.trim());
        elem.style[makeCamelCase(styleTxt)] = val;
      });

  children &&
    makeThatArray(children).forEach((child) =>
      elem.appendChild(
        child instanceof HTMLElement ? child : createDOMElem(child)
      )
    );

  /*
   * Add the eventListener or more eventListeners it hey comes in array
   * Handle event is an object or an array of object, that should be contain:
   * event, what will fire the event?
   * and a cb, that is the callback function
   */
  handleEvent &&
    makeThatArray(handleEvent).forEach(
      (newEvent) =>
        newEvent &&
        newEvent?.event &&
        newEvent?.cb &&
        elem.addEventListener(newEvent.event, newEvent.cb)
    );

  /*
  * Append the created elem to the parent what is given, or add to the body of the Document if not given.

  * The parent:
    * can be a DOM element, or
    * a String of:
        * ID or
        * CLass
  */
  if (parent) {
    const firstChars = ["#", "."];
    if (typeof parent === "string") {
      if (parent.charAt(0) in firstChars) {
        parent = document.querySelector(parent);
      } else {
        parent = firstChars
          .map((prep) => {
            return document.querySelector(prep + parent);
          })
          .filter((pe) => {
            return pe !== null;
          })[0];
      }
    }
  } else parent = document.querySelector("body");

  const appendElem = () => {
    parent.appendChild(elem);
  };

  append && appendElem();

  /*
   * and at the end give the elem back for later usage
   */
  return elem;
}

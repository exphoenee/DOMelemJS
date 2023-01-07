"use strict";

import makeCamelCase from "../utils/makeCamelCase.mjs";
import makeThatArray from "../utils/makeThatArray.mjs";
import noSpecChars from "../utils/noSpecChars.mjs";

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
        newEvent.event &&
        newEvent.cb &&
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

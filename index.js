const noSpecChars = (text, lowercase = false) => {
  function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
  }

  let specialChars = {
    é: "e",
    á: "a",
    ó: "o",
    ö: "o",
    ő: "o",
    ú: "u",
    ü: "u",
    ű: "u",
    í: "i",
    É: "E",
    Á: "A",
    Ó: "O",
    Ö: "O",
    Ő: "O",
    Ú: "U",
    Ü: "U",
    Ű: "U",
    Í: "I",
    " ": "-",
    "/": "-",
    ":": "-",
    ";": "-",
    "=": "-",
  };
  for (let char in specialChars) {
    text = replaceAll(text, char, specialChars[char]);
  }
  return lowercase ? text.toLowerCase() : text;
};

const DOMElem = {
  Create: function (parameters) {
    let tag = parameters.tag || "div";
    let attrs = parameters.attrs || {};
    let children = parameters.children || [];
    let eventStarter = parameters.eventStarter || null;
    let eventFunction = parameters.eventFunction || null;
    let content = parameters.content || null;
    let text = parameters.text || null;
    let style = parameters.style || null;

    let targetParent =
      typeof parameters.targetParent == "string"
        ? document.getElementById(parameters.targetParent) ||
          document.querySelector(parameters.targetParent)
        : typeof parameters.targetParent == "object"
        ? parameters.targetParent
        : null;

    let elem = document.createElement(tag);

    if (content) elem.innerHTML = content;
    if (text) elem.textContent = text;

    for (let attr in attrs) {
      elem.setAttribute(
        attr,
        attr == "class" || attr == "id" ? noSpecChars(attrs[attr]) : attrs[attr]
      );
    }

    /*
     * Adding stye is possible as:
     * * a string, with a bunch of style properties, it can be:
     * * * CCS style (e.g. background-color) or
     * * * JS/camelCase (e.g. backgroundColor) style formatted version also.
     * * or an object formatted (e.g. style: { backgroundColor: red })
     * * or an array with multiple style strings with CSS or JS vesrion, or mixed
     */

    if (style) {
      let styleText;
      if (typeof style === "string") {
        styleText = style;
      } else if (Array.isArray(style)) {
        styleText = style.join("; ");
      } else if (typeof style === "object") {
        styleText = [];
        for (let s in style) {
          styleText.push(`${s}: ${style[s]}`);
        }
        styleText = styleText.join("; ");
      }

      styleText.split(";").forEach((styleText) => {
        let [s, p] = styleText.split(":").map((c) => c.trim());
        s = s
          .split("-")
          .map((ss, i) => {
            return i > 0 ? ss.charAt(0).toUpperCase() + ss.slice(1) : ss;
          })
          .join("");
        elem.style[s] = p;
      });
    }

    children.map((child) => {
      typeof child != "object"
        ? (child = document.createTextNode(child))
        : null;
      elem.appendChild(child);
    });

    if (eventStarter && eventFunction)
      elem.addEventListener(eventStarter, eventFunction);

    if (targetParent) targetParent.appendChild(elem);

    return elem;
  },
};

const createDOMElem = ({
  tag,
  content,
  text,
  attrs,
  style,
  children,
  parent,
  handleEvent,
}) => {
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

  function makeThatArray(arr) {
    if (Array.isArray(arr)) {
      return arr;
    } else {
      return [arr];
    }
  }

  /*
   *  add all the attributes they want
   */

  Object.keys(attrs).forEach((attr) => {
    if (attr === "checked") {
      elem.checked = attrs[attr];
    } else if (attr === "dataset") {
      makeThatArray(attrs[attr]).map((data) =>
        Object.keys(data).forEach((d) => (elem.dataset[d] = data[d]))
      );
    } else if (attr === "class" || attr === "id") {
      elem.setAttribute(
        attr,
        makeThatArray(attrs[attr])
          .map((a) => noSpecChars(a))
          .join(" ")
      );
    } else {
      elem.setAttribute(attr, makeThatArray(attrs[attr]).join(" "));
    }
  });

  /*
   * Adding stye is possible as:
   * * a string, with a bunch of style properties, it can be:
   * * * CCS style (e.g. background-color) or
   * * * JS/camelCase (e.g. backgroundColor) style formatted version also.
   * * or an object formatted (e.g. style: { backgroundColor: red })
   * * or an array with multiple style strings with CSS or JS vesrion, or mixed
   */

  function makeCamelCase(s) {
    return s
      .split("-")
      .map((ss, i) => {
        return i > 0 ? ss.charAt(0).toUpperCase() + ss.slice(1) : ss;
      })
      .join("");
  }

  if (style) {
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
  }

  if (children) {
    makeThatArray(children).map((child) => {
      let childElem = child;
      if (typeof child === "object") childElem = createDOMElem(child);
      elem.appendChild(childElem);
    });
  }

  /*
   * Add the eventListener or more eventListeners it hey comes in array
   */
  let eventsToAdd = [];
  /*
   * Handle event is an object or an array of object, that schould be conain:
   * event, what will fire the event?
   * and a cb, that is the callback function
   */
  if (handleEvent) {
    if (Array.isArray(handleEvent)) {
      eventsToAdd = [...handleEvent];
    } else {
      eventsToAdd.push(handleEvent);
    }
    eventsToAdd.forEach((newEvent) => {
      elem.addEventListener(newEvent.event, newEvent.cb);
    });
  }

  /*
  * Append the created elem to the parent what is given, or add to the body of the Document if not given.

  * The parent:
    * can be a DOM element, or
    * a String of:
        * ID or
        * CLass
  */
  if (parent) {
    if (typeof parent === "string") {
      parent = [".", "#"]
        .map((prep) => {
          return document.querySelector(prep + parent);
        })
        .filter((pe) => {
          return pe !== null;
        })[0];
    }
  } else parent = document.querySelector("body");

  parent.appendChild(elem);

  /*
   * and at the end give the elem back for later usage
   */
  return elem;
};

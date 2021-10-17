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
        ? document.querySelector(parameters.targetParent) ||
          document.getElementById(parameters.targetParent)
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

  /*
   *  add all the attributes they want
   */
  for (let attr in attrs) {
    if (attr === "dataset") {
      for (let data in attrs[attr]) {
        elem.dataset[data] = attrs[attr][data];
      }
    } else {
      let attribute;
      if (Array.isArray(attrs[attr])) {
        if (attr === "class") {
          attribute = NoSpecChars(attrs[attr].join(" "));
        } else {
          attribute = attrs[attr].join(" ");
        }
      } else {
        if (attr === "id") {
          attribute = noSpecChars(attrs[attr]);
        } else {
          attribute = attrs[attr];
        }
      }
      elem.setAttribute(attr, attribute);
    }
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

  if (children) {
    let childrenArray = [];
    if (!Array.isArray(children)) {
      childrenArray.push(children);
    } else {
      childrenArray = children;
    }
    childrenArray.forEach((child) => {
      child.parent = elem;
      createDOMElem(child);
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

module.exports = {
  createDOMElem,
  DOMElem,
  noSpecChars,
};

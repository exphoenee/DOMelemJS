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

  attrs &&
    makeThatArray(attrs).forEach((atts) =>
      Object.keys(atts).forEach((attr) => {
        if (attr === "checked") {
          elem.checked = atts[attr];
        } else if (attr === "dataset") {
          makeThatArray(atts[attr]).map((data) =>
            Object.keys(data).forEach((d) => (elem.dataset[d] = data[d]))
          );
        } else if (attr === "class" || attr === "id") {
          elem.setAttribute(
            attr,
            makeThatArray(atts[attr])
              .map((a) => noSpecChars(a))
              .join(" ")
          );
        } else {
          elem.setAttribute(attr, makeThatArray(atts[attr]).join(" "));
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
    makeThatArray(children).map((child) => {
      let childElem = child;
      if (typeof child === "object") childElem = createDOMElem(child);
      elem.appendChild(childElem);
    });

  /*
   * Add the eventListener or more eventListeners it hey comes in array
   * Handle event is an object or an array of object, that schould be conain:
   * event, what will fire the event?
   * and a cb, that is the callback function
   */
  handleEvent &&
    makeThatArray(handleEvent).forEach((newEvent) => {
      elem.addEventListener(newEvent.event, newEvent.cb);
    });

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

/* object caller of the funcion */
const DOMElem = {
  Create: createDOMElem,
};

/******************/
/* HELPER METHODS */
/******************/

/* removing special chars form a string */
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

/* check is it is array do nothing, if not maki it array */
const makeThatArray = (arr) => {
  if (Array.isArray(arr)) {
    return arr;
  } else {
    return [arr];
  }
};

/* removing the "-" symbol form the string adn makind the afterward word to uppercase, that is named as camelCase */
function makeCamelCase(s) {
  return s
    .split("-")
    .map((ss, i) => {
      return i > 0 ? ss.charAt(0).toUpperCase() + ss.slice(1) : ss;
    })
    .join("");
}

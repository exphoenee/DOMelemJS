export const Elem = {
  noSpecChars: function (text, lowercase = false) {
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
  },

  Create: function (parameters) {
    let tag = parameters.tag || "div";
    let attributes = parameters.attributes || {};
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

    for (let attr in attributes) {
      elem.setAttribute(
        attr,
        attr == "class" || attr == "id"
          ? this.noSpecChars(attributes[attr])
          : attributes[attr]
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
        console.log(styleText);
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

    if (content) elem.innerHTML = content;
    if (text) elem.textContent = text;

    if (eventStarter && eventFunction)
      elem.addEventListener(eventStarter, eventFunction);

    if (targetParent) targetParent.appendChild(elem);

    return elem;
  },
};

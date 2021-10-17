let Elem = {
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

    children.map((child) => {
      typeof child != "object"
        ? (child = document.createTextNode(child))
        : null;
      elem.appendChild(child);
    });

    if (content) elem.innerHTML = content;
    if (text) elem.text = text;

    if (eventStarter && eventFunction)
      elem.addEventListener(eventStarter, eventFunction);

    if (targetParent) targetParent.appendChild(elem);

    return elem;
  },
};

/* használata */

let myDOM = {};

/* 1. Úgy is haszálhatom, hogy változóba hozom létre, és azt appendolom külön */

myDOM.selectControlContainer = Elem.Create({
  tag: "div",
  attrs: { class: "első próbálkozás" },
});
document.body.appendChild(myDOM.selectControlContainer);

/* 2. Úgy is használhatom, hogy a szülőelemet már az Elem létrehozásakor megadom neki, és akkor befűzi oda. */

function generateOption(options) {
  let optionElems = [];
  options.forEach(function (option) {
    let optionElem = Elem.Create({
      tag: "option",
      content: option,
    });
    optionElems.push(optionElem);
  });
  return optionElems;
}

let animals = ["Maci", "Nyuszi", "Cica", "Kutya"];
let animalOption = generateOption(animals);

myDOM.selectControl = Elem.Create({
  tag: "select",
  attrs: { id: "selectControl" },
  targetParent: myDOM.selectControlContainer,
  children: animalOption,
});

myDOM.selectControl = Elem.Create({
  tag: "label",
  attrs: { for: "selectControl" },
  targetParent: myDOM.selectControlContainer,
});

/* 3. Úgy is haszálhatom, hogy egyből appendolom és azt változónak adom */

let plants = ["Fenyő", "Juhar", "Cédrus", "Mahagóni"];

myDOM.selectControl = myDOM.selectControl.appendChild(
  Elem.Create({
    tag: "select",
    attrs: { id: "selectControl" },
    targetParent: myDOM.selectControlContainer,
    children: generateOption(plants),
  })
);

myDOM.selectControl = myDOM.selectControl.appendChild(
  Elem.Create({
    tag: "label",
    attrs: { for: "selectControl" },
    targetParent: myDOM.selectControlContainer,
  })
);

/* Példa egy komplexebb struktúra előállítására */

myDOM.dateFilterContainer = document.body.appendChild(
  Elem.Create({
    tag: "div",
    attrs: { class: "dateFilter-Container", id: "dateFilter-Container" },
    children: [
      Elem.Create({
        tag: "div",
        attrs: { class: "beginDate-container", id: "beginDate-container" },
        children: [
          Elem.Create({
            tag: "label",
            attrs: {
              class: "beginDate-lable",
            },
            content: "Kezdő dátum: ",
          }),
          Elem.Create({
            tag: "input",
            attrs: {
              type: "date",
              class: "beginDate",
              id: "beginDate",
            },
            eventStarter: "change",
            eventFunction: function (e) {
              e.preventDefault();
              console.log(this.value);
            },
          }),
        ],
      }),
      Elem.Create({
        tag: "div",
        attrs: { class: "endDate-container", id: "endDate-container" },
        children: [
          Elem.Create({
            tag: "label",
            attrs: {
              class: "endDate-lable",
            },
            content: "Befejező dátum: ",
          }),
          Elem.Create({
            tag: "input",
            attrs: {
              type: "date",
              class: "endDate",
              id: "endDate",
            },
            eventStarter: "change",
            eventFunction: function (e) {
              e.preventDefault();
              console.log(this.value);
            },
          }),
        ],
      }),
    ],
  })
);

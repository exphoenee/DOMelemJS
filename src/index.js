"use strict";
import DOMElem from "./view/DOMElem.mjs";

/* használata */

let myDOM = {};

/* 1. Úgy is haszálhatom, hogy változóba hozom létre, és azt appendolom külön */

myDOM.selectControlContainer = new DOMElem({
  tag: "div",
  attrs: { class: "első próbálkozás" },
}).elem;

console.log(myDOM.selectControlContainer);

document.body.appendChild(myDOM.selectControlContainer);

/* 2. Úgy is használhatom, hogy a szülőelemet már az Elem létrehozásakor megadom neki, és akkor befűzi oda. */

function generateOption(options) {
  return options.map(
    (option) =>
      new DOMElem({
        tag: "option",
        text: option,
      })
  );
}

let animals = ["Maci", "Nyuszi", "Cica", "Kutya"];
let animalOption = generateOption(animals);

myDOM.selectControl = new DOMElem({
  tag: "label",
  text: "állatkák:",
  attrs: { for: "selectControl" },
  parent: myDOM.selectControlContainer,
}).elem;

myDOM.selectControl = new DOMElem({
  tag: "select",
  attrs: { id: "selectControl" },
  style: { color: "red" },
  parent: myDOM.selectControlContainer,
  children: animalOption,
});

/* 3. Úgy is haszálhatom, hogy egyből appendolom és azt változónak adom */

let plants = ["Fenyő", "Juhar", "Cédrus", "Mahagóni"];

myDOM.selectControl = myDOM.selectControl.appendChild(
  new DOMElem({
    tag: "label",
    text: "fák:",
    attrs: { for: "selectControl" },
    parent: myDOM.selectControlContainer,
  }).elem
).elem;

myDOM.selectControl = myDOM.selectControl.appendChild(
  new DOMElem({
    tag: "select",
    attrs: { id: "selectControl" },
    parent: myDOM.selectControlContainer,
    children: generateOption(plants),
  }).elem
);

/* Példa egy komplexebb struktúra előállítására */

myDOM.dateFilterContainer = document.body.appendChild(
  new DOMElem({
    tag: "div",
    attrs: { class: "dateFilter-Container", id: "dateFilter-Container" },
    children: [
      new DOMElem({
        tag: "div",
        attrs: {
          class: "beginDate-container",
          id: "beginDate-container",
        },
        children: [
          new DOMElem({
            tag: "label",
            attrs: {
              class: "beginDate-lable",
            },
            text: "Kezdő dátum: ",
          }).elem,
          new DOMElem({
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
          }).elem,
        ],
      }).elem,
      new DOMElem({
        tag: "div",
        attrs: { class: "endDate-container", id: "endDate-container" },
        children: [
          new DOMElem({
            tag: "label",
            attrs: {
              class: "endDate-lable",
            },
            text: "Befejező dátum: ",
          }).elem,
          new DOMElem({
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
          }).elem,
        ],
      }),
    ],
  }).elem
);

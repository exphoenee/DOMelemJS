# DOMelemJS

This lightweight tool is allow you to render HTML lements dynamically form JavaScript!

There is two approach and two to use it:

1. is the Object approach:
   This is a tiny object with name DOMElem!

Whit this approach you can create HTML element as follows:

```
Elem.Create({
      tag: "div",
      attrs: { class: "app" },
    });
```

that gives you a div with a class: app:

```
<div class="app"></div>
```

2 the second way is through a function that named: createDOMElem()

With this approach you should use as follows:

```
const app = createDOMElem({
  tag: "div",
  attrs: { id: "app" },
});
```

that gives you a div with a id: app:

```
<div id="app"></div>
```

With this renderer you will be able to add eventListeners and styles in the moment as the DOM is created!
e.g.:

```
createDOMElem({
  tag: "h2",
  text: "It's amazing",
  parent: app,
  style: { color: "red", "background-color": "green" },
  attrs: { id: "title" },
  handleEvent: {
    event: "click",
    cb: (e) => console.log(e.target.id),
  },
});
```

Handle event is an object or an array of object, that should be conain:

- event, what will fire the event?
- and a cb, that is the callback function
- you can ad as many events as you want easily in an array!

You can add the children of the element same time as the element is created:

```
const select = createDOMElem({
  tag: "select",
  parent: app,
  attrs: { id: "selector" },
  children: [
    {
      tag: "option",
      content: "foo",
      attr: { value: "foo" },
    },
    {
      tag: "option",
      content: "bar",
      attr: { value: "bar" },
    },
  ],
  handleEvent: {
    event: "change",
    cb: (e) => console.log(e.target.value),
  },
});
```

Adding stye is also possible as:

- a string, with a bunch of style properties, it can be:
  - CCS style (e.g. background-color) or
  - JS/camelCase (e.g. backgroundColor) style formatted version also.
- or an object formatted (e.g. style: { backgroundColor: red })
- or an array with multiple style strings with CSS or JS vesrion, or mixed

And a complex structure semms like this here:

```
dateFilterContainer = document.body.appendChild(
  Elem.Create({
    tag: "div",
    attrs: { class: "dateFilter-Container", id: "dateFilter-Container" },
    children: [
      Elem.Create({
        tag: "div",
        attrs: {
          class: "beginDate-container",
          id: "beginDate-container",
        },
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
```

# DOMelemJS

A lightweight, zero-dependency TypeScript library for dynamically creating HTML elements from JavaScript.

[![npm version](https://img.shields.io/npm/v/domelemjs)](https://www.npmjs.com/package/domelemjs)
[![license](https://img.shields.io/npm/l/domelemjs)](https://github.com/exphoenee/DOMelemJS/blob/main/LICENSE)

[Magyar README](README-hu.md) | [English README](README.md)

## Installation

### npm

```bash
npm install domelemjs
```

### CDN (unpkg)

No build tools needed — include directly in your HTML:

```html
<script src="https://unpkg.com/domelemjs/dist/index.browser.js"></script>
<script>
  const { createDOMElem, DOMElem } = DOMElemJS;

  const app = createDOMElem({
    tag: "div",
    attrs: { id: "app" },
    text: "Hello from CDN!",
  });
</script>
```

Pin a specific version:

```html
<script src="https://unpkg.com/domelemjs@2.0.0/dist/index.browser.js"></script>
```

## Quick Start

```ts
import { createDOMElem } from "domelemjs";

const app = createDOMElem({
  tag: "div",
  attrs: { id: "app" },
});
```

## API

### `createDOMElem(options)`

The core function. Creates a DOM element and returns the `HTMLElement`.

```ts
const el = createDOMElem({
  tag: "h1",
  text: "Hello World",
  attrs: { class: "title" },
  style: { color: "blue" },
  parent: "#app",
});
```

### `new DOMElem(options)`

Class-based wrapper. The created element is available on `.elem`.

```ts
import { DOMElem } from "domelemjs";

const div = new DOMElem({
  tag: "div",
  text: "Hello",
  attrs: { class: "container" },
});

document.body.appendChild(div.elem);
```

## Options

| Option | Type | Description |
|---|---|---|
| `tag` | `string` | **Required.** HTML tag name (e.g. `"div"`, `"span"`, `"input"`). |
| `text` | `string` | Plain text content (`textContent`). |
| `content` | `string` | Raw HTML content (`innerHTML`). |
| `attrs` | `object \| object[]` | HTML attributes to set. Supports `class`, `id`, `data-*`, `checked`, etc. |
| `style` | `string \| object \| array` | Inline CSS styles (see [Styling](#styling)). |
| `children` | `array` | Child elements — either options objects or `HTMLElement`s. |
| `parent` | `HTMLElement \| string` | Parent to append to. Accepts an element or a CSS selector (`"#app"`, `".container"`, `"app"`). Defaults to `document.body`. |
| `handleEvent` | `object \| object[]` | Event listeners to attach (see [Events](#events)). |
| `append` | `boolean` | Whether to append the element to its parent. Defaults to `true`. |
| `stripDiacritics` | `boolean` | Whether to strip diacritics from `class` and `id` attributes. Defaults to `true`. Set to `false` to preserve Unicode characters. |

## Styling

Styles can be provided in multiple formats:

```ts
// CSS string
createDOMElem({
  tag: "div",
  style: "color: red; background-color: blue",
});

// Object
createDOMElem({
  tag: "div",
  style: { color: "red", backgroundColor: "blue" },
});

// Array (mixed)
createDOMElem({
  tag: "div",
  style: ["color: red", { backgroundColor: "blue" }],
});
```

## Events

Attach event listeners via `handleEvent`:

```ts
createDOMElem({
  tag: "button",
  text: "Click me",
  handleEvent: {
    event: "click",
    cb: (e) => console.log("clicked!"),
  },
});
```

Multiple events can be passed as an array:

```ts
createDOMElem({
  tag: "input",
  handleEvent: [
    { event: "focus", cb: () => console.log("focused") },
    { event: "blur", cb: () => console.log("blurred") },
  ],
});
```

## Attributes

Attributes can be a single object or an array:

```ts
createDOMElem({
  tag: "input",
  attrs: [
    { id: "myInput", type: "text" },
    { class: "form-control" },
  ],
});
```

Special attribute handling:
- **`checked`** — sets the checked property on inputs
- **`dataset`** — merges `data-*` attributes (e.g. `{ dataset: { id: "foo" } }` becomes `data-id="foo"`)
- **`class` / `id`** — special characters (diacritics) are automatically stripped by default. Set `stripDiacritics: false` to preserve them.

> **Note:** If both `text` and `content` are provided, `text` takes precedence and a warning is logged.

## Managing Event Listeners

The `DOMElem` class tracks event listeners and supports removal:

```ts
import { DOMElem } from "domelemjs";

const btn = new DOMElem({
  tag: "button",
  text: "Click me",
});

const handler = () => console.log("clicked!");
btn.addEventListener("click", handler);
btn.removeEventListener("click", handler);

// Remove all tracked listeners at once
btn.removeAllListeners();
```

## HTML Tags

DOMelemJS exports a list of valid HTML tag names:

```ts
import { HTML_TAGS } from "domelemjs";

if (HTML_TAGS.includes(tag)) {
  // valid HTML tag
}
```

## Children

Children can be nested options objects or existing `HTMLElement`s:

```ts
createDOMElem({
  tag: "select",
  attrs: { id: "selector" },
  children: [
    { tag: "option", text: "Foo", attrs: { value: "foo" } },
    { tag: "option", text: "Bar", attrs: { value: "bar" } },
  ],
});
```

## Complex Example

```ts
import { createDOMElem } from "domelemjs";

const container = createDOMElem({
  tag: "div",
  attrs: { class: "date-filter" },
  children: [
    {
      tag: "div",
      attrs: { class: "date-group" },
      children: [
        {
          tag: "label",
          text: "Start date:",
          attrs: { for: "startDate" },
        },
        {
          tag: "input",
          attrs: { type: "date", id: "startDate" },
          handleEvent: {
            event: "change",
            cb: (e) => console.log("Start:", (e.target as HTMLInputElement).value),
          },
        },
      ],
    },
    {
      tag: "div",
      attrs: { class: "date-group" },
      children: [
        {
          tag: "label",
          text: "End date:",
          attrs: { for: "endDate" },
        },
        {
          tag: "input",
          attrs: { type: "date", id: "endDate" },
          handleEvent: {
            event: "change",
            cb: (e) => console.log("End:", (e.target as HTMLInputElement).value),
          },
        },
      ],
    },
  ],
});
```

## TypeScript

DOMelemJS is written in TypeScript and ships with full type definitions.

```ts
import { createDOMElem, type CreateDOMElemOptions } from "domelemjs";

const options: CreateDOMElemOptions = {
  tag: "div",
  text: "Typed!",
};

const el = createDOMElem(options);
```

## License

MIT

# DOMelemJS

Könnyű, függőségmentes TypeScript könyvtár HTML elemek dinamikus létrehozásához JavaScript-ből.

[![npm version](https://img.shields.io/npm/v/domelemjs)](https://www.npmjs.com/package/domelemjs)
[![license](https://img.shields.io/npm/l/domelemjs)](https://github.com/exphoenee/DOMelemJS/blob/main/LICENSE)

## Telepítés

### npm

```bash
npm install domelemjs
```

### CDN (unpkg)

Build eszközök nélkül — közvetlenül az HTML-be ágyazható:

```html
<script src="https://unpkg.com/domelemjs/dist/index.browser.js"></script>
<script>
  const { createDOMElem, DOMElem } = DOMElemJS;

  const app = createDOMElem({
    tag: "div",
    attrs: { id: "app" },
    text: "Helló CDN-ről!",
  });
</script>
```

Adott verzió megadása:

```html
<script src="https://unpkg.com/domelemjs@2.0.0/dist/index.browser.js"></script>
```

## Gyors Kezdés

```ts
import { createDOMElem } from "domelemjs";

const app = createDOMElem({
  tag: "div",
  attrs: { id: "app" },
});
```

## API

### `createDOMElem(options)`

A fő függvény. Létrehoz egy DOM elemet és visszaadja az `HTMLElement`-et.

```ts
const el = createDOMElem({
  tag: "h1",
  text: "Helló Világ",
  attrs: { class: "title" },
  style: { color: "blue" },
  parent: "#app",
});
```

### `new DOMElem(options)`

Osztályalapú burkoló. A létrehozott elem a `.elem` tulajdonságon érhető el.

```ts
import { DOMElem } from "domelemjs";

const div = new DOMElem({
  tag: "div",
  text: "Helló",
  attrs: { class: "container" },
});

document.body.appendChild(div.elem);
```

## Opciók

| Opció | Típus | Leírás |
|---|---|---|
| `tag` | `string` | **Kötelező.** HTML tag neve (pl. `"div"`, `"span"`, `"input"`). |
| `text` | `string` | Egyszerű szöveges tartalom (`textContent`). |
| `content` | `string` | Nyers HTML tartalom (`innerHTML`). |
| `attrs` | `object \| object[]` | Beállítandó HTML attribútumok. Támogatja a `class`, `id`, `data-*`, `checked` stb. |
| `style` | `string \| object \| array` | Inline CSS stílusok (lásd [Stílusok](#stílusok)). |
| `children` | `array` | Gyerekelemek — options objektumok vagy `HTMLElement`-ek. |
| `parent` | `HTMLElement \| string` | Szülő elem, amibe beillesztjük. Elfogad elemet vagy CSS szelektort (`"#app"`, `".container"`, `"app"`). Alapértelmezés: `document.body`. |
| `handleEvent` | `object \| object[]` | Eseménykezelők (lásd [Események](#események)). |
| `append` | `boolean` | Hozzá kell-e fűzni a szülőhöz. Alapértelmezés: `true`. |
| `stripDiacritics` | `boolean` | El kell-e távolítani a diakritikus jeleket a `class` és `id` attribútumokból. Alapértelmezés: `true`. Állítsd `false`-ra a Unicode karakterek megőrzéséhez. |

## Stílusok

A stílusok több formátumban megadhatók:

```ts
// CSS string
createDOMElem({
  tag: "div",
  style: "color: red; background-color: blue",
});

// Objektum
createDOMElem({
  tag: "div",
  style: { color: "red", backgroundColor: "blue" },
});

// Tömb (vegyes)
createDOMElem({
  tag: "div",
  style: ["color: red", { backgroundColor: "blue" }],
});
```

## Események

Eseménykezelők csatolása a `handleEvent` segítségével:

```ts
createDOMElem({
  tag: "button",
  text: "Kattints rám",
  handleEvent: {
    event: "click",
    cb: (e) => console.log("kattintás!"),
  },
});
```

Több esemény tömbben átadva:

```ts
createDOMElem({
  tag: "input",
  handleEvent: [
    { event: "focus", cb: () => console.log("fókusz") },
    { event: "blur", cb: () => console.log("elvesztett fókusz") },
  ],
});
```

## Attribútumok

Az attribútumok lehetnek egyetlen objektumok vagy tömbök:

```ts
createDOMElem({
  tag: "input",
  attrs: [
    { id: "myInput", type: "text" },
    { class: "form-control" },
  ],
});
```

Speciális attribútum kezelés:
- **`checked`** — beállítja a checked tulajdonságot inputokon
- **`dataset`** — egyesíti a `data-*` attribútumokat (pl. `{ dataset: { id: "foo" } }` → `data-id="foo"`)
- **`class` / `id`** — a diakritikus jelek alapértelmezésben automatikusan eltávolításra kerülnek. Állítsd `stripDiacritics: false`-ra a megőrzésükhöz.

> **Megjegyzés:** Ha mind a `text`, mind a `content` meg van adva, a `text` élvez előnyt és figyelmeztetés naplózódik.

## Eseménykezelők Kezelése

A `DOMElem` osztály nyomon követi az eseménykezelőket és támogatja az eltávolításukat:

```ts
import { DOMElem } from "domelemjs";

const btn = new DOMElem({
  tag: "button",
  text: "Kattints rám",
});

const handler = () => console.log("kattintás!");
btn.addEventListener("click", handler);
btn.removeEventListener("click", handler);

// Összes nyomon követett kezelő eltávolítása egyszerre
btn.removeAllListeners();
```

## HTML Tag-ek

A DOMelemJS exportálja az érvényes HTML tag nevek listáját:

```ts
import { HTML_TAGS } from "domelemjs";

if (HTML_TAGS.includes(tag)) {
  // érvényes HTML tag
}
```

## Gyerekelemek

A gyerekek lehetnek beágyazott options objektumok vagy meglévő `HTMLElement`-ek:

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

## Összetett Példa

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
          text: "Kezdő dátum:",
          attrs: { for: "startDate" },
        },
        {
          tag: "input",
          attrs: { type: "date", id: "startDate" },
          handleEvent: {
            event: "change",
            cb: (e) => console.log("Kezdet:", (e.target as HTMLInputElement).value),
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
          text: "Befejező dátum:",
          attrs: { for: "endDate" },
        },
        {
          tag: "input",
          attrs: { type: "date", id: "endDate" },
          handleEvent: {
            event: "change",
            cb: (e) => console.log("Vég:", (e.target as HTMLInputElement).value),
          },
        },
      ],
    },
  ],
});
```

## Komponensek

Kész, akadálymentes komponensek a `createDOMElem` fölött (a dev-portfolio oldalról portolva). Az alap stílusokat egyszer kell importálni:

```ts
import "domelemjs/styles.css"; // or <link rel="stylesheet" href=".../domelemjs.css">
import { createTabs, createGrid, createCarousel, createTimeline } from "domelemjs";
```

A tartalom (`ContentInput`) lehet szöveg, DOM node vagy `createDOMElem` opciók. Minden builder fogad `parent`, `append`, `className` opciót.

```ts
// Tabs: WAI-ARIA pattern, roving tabindex, arrows / Home / End
const tabs = createTabs({
  parent: "#app",
  tabs: [
    { id: "a", label: "Functional", content: "…" },
    { id: "b", label: "Technical", content: "…" },
  ],
  onChange: (id) => console.log(id),
});
tabs.select("b"); tabs.setLabel("a", "Funkcionális");

// Grid: responsive columns (auto-fill, minItemWidth) or a fixed column count
const grid = createGrid({ parent: "#app", items: [card1, card2], minItemWidth: 300, gap: 24 });
grid.setItems(filtered);

// Carousel: 3D coverflow, arrows, dots, drag / swipe, keyboard
const carousel = createCarousel({
  parent: "#app",
  slides: [card1, card2, card3],
  labels: { prev: "Előző", next: "Következő", dot: (n) => `Dia ${n}` },
});
carousel.goTo(2);

// Timeline: alternating cards, optional compact mode
const tl = createTimeline({
  parent: "#app",
  items: [{ period: "2021 – now", title: "Developer", subtitle: "Acme", description: "…", badge: "current" }],
});
tl.setCompact(true);
```

Stílus a `--dom-*` CSS változókkal (`--dom-accent`, `--dom-surface`, `--dom-carousel-height`, …); a `style` mostantól CSS custom property-ket is támogat.

## TypeScript

A DOMelemJS TypeScript-ben íródott és teljes típusdefíciókkal szállítódik.

```ts
import { createDOMElem, type CreateDOMElemOptions } from "domelemjs";

const options: CreateDOMElemOptions = {
  tag: "div",
  text: "Tipizált!",
};

const el = createDOMElem(options);
```

## Licenc

MIT

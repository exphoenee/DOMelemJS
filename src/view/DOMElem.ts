"use strict";

import createDOMElem from "./createDOMElem.mjs";

export default class DOMELem {
  constructor(options) {
    this.options = options;
    this.elem = this.create();
    return this;
  }
  create() {
    return createDOMElem(this.options);
  }
}

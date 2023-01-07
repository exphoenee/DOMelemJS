"use strict";

import createDOMElem from "./createDOMElem";
import optionsType from "../types/domelem.type";

export default class DOMELem {
  private options: optionsType;
  public elem: any;

  constructor(options: optionsType) {
    this.options = options;
    this.elem = this.create();
    return this;
  }
  create() {
    return createDOMElem(this.options);
  }
}

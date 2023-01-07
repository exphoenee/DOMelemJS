"use strict";
/* check is it is array do nothing, if not make it array */
export default function makeThatArray(arr) {
  return arr ? (Array.isArray(arr) ? arr : [arr]) : [];
}

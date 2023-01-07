"use strict";
/* check is it is array do nothing, if not make it array */
// this function gets a type or an array of type and returns an array of type
export default function makeThatArray<T>(arr: T | T[]): T[] {
  return arr ? (Array.isArray(arr) ? arr : [arr]) : [];
}
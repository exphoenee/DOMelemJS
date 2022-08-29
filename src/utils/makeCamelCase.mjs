"use strict";
/* removing the "-" symbol form the string adn makind the afterward word to uppercase, that is named as camelCase */
export default function makeCamelCase(s) {
  return s
    .split("-")
    .map((ss, i) => {
      return i > 0 ? ss.charAt(0).toUpperCase() + ss.slice(1) : ss;
    })
    .join("");
}

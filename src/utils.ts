/**
 * Converts a kebab-case string to camelCase.
 *
 * @example
 * makeCamelCase("background-color") // "backgroundColor"
 * makeCamelCase("font-size") // "fontSize"
 *
 * @param s - The kebab-case string to convert.
 * @returns The camelCase version of the input.
 */
export function makeCamelCase(s: string): string {
  return s
    .split("-")
    .map((part, i) => (i > 0 ? part.charAt(0).toUpperCase() + part.slice(1) : part))
    .join("");
}

/**
 * Ensures the given value is wrapped in an array.
 * Returns an empty array for `null` / `undefined`.
 *
 * @example
 * toArray("hello")    // ["hello"]
 * toArray(["a", "b"]) // ["a", "b"]
 * toArray(null)       // []
 *
 * @param value - The value to normalize.
 * @returns An array containing the value, or an empty array if falsy.
 */
export function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

/**
 * Replaces accented / special characters with their ASCII equivalents.
 *
 * Supports Hungarian, Czech, Polish, Turkish, and other Latin-script diacritics.
 *
 * @example
 * noSpecChars("árvíztűrő") // "arviztuoro"
 * noSpecChars("Árvíz", true) // "arviz"
 *
 * @param text - The input string containing special characters.
 * @param lowercase - If `true`, the result is lowercased after replacement.
 * @returns The string with special characters replaced.
 */
export function noSpecChars(text: string, lowercase = false): string {
  const map: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ö: "o", ő: "o",
    ú: "u", ü: "u", ű: "u",
    Á: "A", É: "E", Í: "I", Ó: "O", Ö: "O", Ő: "O",
    Ú: "U", Ü: "U", Ű: "U",
    à: "a", è: "e", ì: "i", ò: "o", ù: "u",
    â: "a", ê: "e", î: "i", ô: "o", û: "u",
    ă: "a", ĕ: "e", ĭ: "i", ŏ: "o", ŭ: "u",
    ā: "a", ē: "e", ī: "i", ō: "o", ū: "u",
    ǎ: "a", ě: "e", ǐ: "i", ǒ: "o", ǔ: "u",
    ä: "a", ë: "e", ï: "i",
    å: "a", ø: "o",
    ã: "a", õ: "o",
    æ: "ae",
    ç: "c", ğ: "g",
    ł: "l",
    ñ: "n",
    đ: "d",
    ß: "ss",
    ď: "d", ť: "t", ň: "n",
    ř: "r", š: "s", ž: "z",
    Ř: "R", Š: "S", Ž: "Z",
    Ç: "C", Ş: "S", Ğ: "G",
    Ł: "L", Ñ: "N", Đ: "D",
    ľ: "l", ŕ: "r", ĺ: "l",
  };

  let result = text;
  for (const [char, replacement] of Object.entries(map)) {
    result = result.split(char).join(replacement);
  }

  return lowercase ? result.toLowerCase() : result;
}

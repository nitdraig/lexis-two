import en from "./en.js";
import es from "./es.js";

export type Locale = "en" | "es";

export const locales = ["en", "es"] as const;

const dictionaries = { en, es } as const;

export type Dictionary = typeof en;

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

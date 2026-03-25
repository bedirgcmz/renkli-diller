import type { Category, SupportedLanguage } from "@/types";

/**
 * Returns the localised name of a category for the given UI language.
 * Falls back to English if the localised name is missing.
 */
export function getCategoryName(cat: Category, lang: SupportedLanguage): string {
  return (cat[`name_${lang}` as keyof Category] as string) || cat.name_en || "";
}

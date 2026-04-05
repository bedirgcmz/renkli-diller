import { getCategoryName } from "@/utils/categoryHelpers";
import type { Category, SupportedLanguage } from "@/types";

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 1,
    name_en: "Daily Conversation",
    name_tr: "Günlük Konuşma",
    name_sv: "Daglig konversation",
    name_de: "Alltagsgespräch",
    name_es: "Conversación diaria",
    name_fr: "Conversation quotidienne",
    name_pt: "Conversa diária",
    icon: "💬",
    sort_order: 1,
    is_free: true,
    ...overrides,
  };
}

describe("getCategoryName", () => {
  it("returns the correct name for each supported language", () => {
    const cat = makeCategory();
    const cases: [SupportedLanguage, string][] = [
      ["en", "Daily Conversation"],
      ["tr", "Günlük Konuşma"],
      ["sv", "Daglig konversation"],
      ["de", "Alltagsgespräch"],
      ["es", "Conversación diaria"],
      ["fr", "Conversation quotidienne"],
      ["pt", "Conversa diária"],
    ];
    cases.forEach(([lang, expected]) => {
      expect(getCategoryName(cat, lang)).toBe(expected);
    });
  });

  it("falls back to name_en when the localized name is missing", () => {
    const cat = makeCategory({ name_tr: "" });
    expect(getCategoryName(cat, "tr")).toBe("Daily Conversation");
  });

  it("returns empty string when both localized and English names are missing", () => {
    const cat = makeCategory({ name_tr: "", name_en: "" });
    expect(getCategoryName(cat, "tr")).toBe("");
  });
});

import { GoogleGenAI, Type } from "@google/genai";
import type { MenuCategory } from "@/types";

function stripResponseMarkdown(text: string | undefined): string {
  if (text == null) return "[]";
  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function normalizeToCategoryArray(data: unknown): unknown[] {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.categories)) return o.categories;
  }
  return [];
}

function normalizeSpiceLevel(v: unknown): 1 | 2 | 3 {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return 2;
  const r = Math.round(n);
  if (r < 1) return 1;
  if (r > 3) return 3;
  return r as 1 | 2 | 3;
}

const MENU_PROMPT = `You are an expert OCR and culinary strategist. Analyze the provided restaurant menu image and extract the data into a structured JSON format.

Rules for Extraction:

Categories: Group items by their headings (e.g., 'Pakistani Desi', 'Karahi').

Items & Prices: If an item has multiple prices (like Full/Half Karahi), treat them as separate items so they each get a card (e.g., 'Chicken Karahi (Full)' and 'Chicken Karahi (Half)').

Descriptions: Write one mouth-watering sentence in English and one in Roman Urdu for every item.

Vibe Stats (AI Estimates): >    - prepTime: Estimate how long it takes to serve (e.g., '10-15 min' for starters, '25-30 min' for Haleem/Karahi).

calories: Estimate calories based on the dish type.

dietaryTag: Assign one relevant tag (e.g., 'Spicy', 'Hearty', 'Protein Rich', 'Classic').

isBestseller: Randomly set this to 'true' for only 2 items per category to highlight popular dishes.

spiceLevel: For every item, set an integer 1, 2, or 3 only: 1 = mild / not spicy, 2 = medium heat, 3 = hot / very spicy. Base this on dish type and typical Pakistani restaurant expectations.

Return ONLY this JSON structure:
{
"categories": [
{
"categoryName": "string",
"items": [
{
"name": "string",
"price": "string",
"englishDescription": "string",
"romanUrduDescription": "string",
"prepTime": "string",
"calories": "number",
"dietaryTag": "string",
"isBestseller": boolean,
"spiceLevel": 1
}
]
}
]
}`;

export async function parseMenuFromImageBase64(
  base64: string,
  mimeType: string,
  apiKey: string
): Promise<MenuCategory[]> {
  const data = base64.includes(",") ? (base64.split(",")[1] || base64) : base64;
  const model = "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        parts: [
          { text: MENU_PROMPT },
          {
            inlineData: {
              mimeType: mimeType && mimeType.length > 0 ? mimeType : "image/jpeg",
              data: data,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.OBJECT,
              properties: {
                en: { type: Type.STRING },
                ur: { type: Type.STRING },
              },
              required: ["en", "ur"],
            },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  price: { type: Type.STRING },
                  description: {
                    type: Type.OBJECT,
                    properties: {
                      en: { type: Type.STRING },
                      ur: { type: Type.STRING },
                    },
                    required: ["en", "ur"],
                  },
                  prepTime: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  isBestseller: { type: Type.BOOLEAN },
                  spiceLevel: { type: Type.INTEGER, minimum: 1, maximum: 3 },
                },
                required: ["name", "price", "description"],
              },
            },
          },
          required: ["title", "items"],
        },
      },
    },
  });

  const cleaned = stripResponseMarkdown(response.text);
  const parsed: unknown = JSON.parse(cleaned || "[]");
  const result = normalizeToCategoryArray(parsed);

  return result.map((cat: any, i: number) => ({
    ...cat,
    items: (Array.isArray(cat?.items) ? cat.items : []).map((item: any, j: number) => ({
      ...item,
      id: item.id || `item-${i}-${j}`,
      spiceLevel: normalizeSpiceLevel(item?.spiceLevel),
    })),
  }));
}

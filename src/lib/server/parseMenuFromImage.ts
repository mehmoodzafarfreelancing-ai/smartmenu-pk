import { ApiError, GoogleGenAI, Type } from "@google/genai";
import type { MenuCategory } from "@/types";

const FALLBACK_MENU: MenuCategory[] = [
  {
    title: { en: "Desi BBQ Specials", ur: "Desi BBQ Specials" },
    items: [
      {
        id: "fallback-bbq-1",
        name: "Chicken Tikka (2 pcs)",
        description: {
          en: "Char-grilled chicken tikka marinated in yogurt, lemon, and house masala.",
          ur: "Dahi, lemoo aur ghar ki masalay wali juicy chicken tikka boti.",
        },
        price: "Rs. 890",
        calories: 420,
        spiceLevel: 2,
      },
      {
        id: "fallback-bbq-2",
        name: "Seekh Kebab Platter",
        description: {
          en: "Smoky minced kebabs served with mint chutney and warm naan.",
          ur: "Dhuan daar seekh kebab platter jo chutney aur garam naan ke sath serve hota hai.",
        },
        price: "Rs. 1190",
        calories: 560,
        spiceLevel: 2,
      },
      {
        id: "fallback-bbq-3",
        name: "Malai Boti",
        description: {
          en: "Creamy and mildly spiced boneless chicken cubes grilled to tenderness.",
          ur: "Creamy aur halka masalay dar boneless chicken boti jo bilkul soft hoti hai.",
        },
        price: "Rs. 1290",
        calories: 510,
        spiceLevel: 1,
      },
    ],
  },
  {
    title: { en: "Karahi House", ur: "Karahi House" },
    items: [
      {
        id: "fallback-karahi-1",
        name: "Chicken Karahi (Half)",
        description: {
          en: "Classic tomato and green chili karahi with fresh ginger finish.",
          ur: "Tamatar, hari mirch aur adrak wali traditional chicken karahi.",
        },
        price: "Rs. 1690",
        calories: 760,
        spiceLevel: 3,
      },
      {
        id: "fallback-karahi-2",
        name: "Chicken White Karahi (Half)",
        description: {
          en: "Silky white karahi with black pepper, cream, and aromatic herbs.",
          ur: "Safed creamy karahi jo kali mirch aur herbs ke zayqay se bharpoor hai.",
        },
        price: "Rs. 1790",
        calories: 820,
        spiceLevel: 2,
      },
      {
        id: "fallback-karahi-3",
        name: "Mutton Karahi (Half)",
        description: {
          en: "Slow-cooked mutton karahi with rich desi ghee flavor.",
          ur: "Ahista pakki hui mutton karahi jisme desi ghee ka lazeez touch hai.",
        },
        price: "Rs. 2490",
        calories: 980,
        spiceLevel: 3,
      },
    ],
  },
  {
    title: { en: "Rice & Comfort", ur: "Rice & Comfort" },
    items: [
      {
        id: "fallback-rice-1",
        name: "Chicken Biryani",
        description: {
          en: "Layered basmati biryani with tender chicken and fragrant saffron notes.",
          ur: "Layered basmati biryani jisme narm chicken aur zafrani khushboo hai.",
        },
        price: "Rs. 690",
        calories: 690,
        spiceLevel: 3,
      },
      {
        id: "fallback-rice-2",
        name: "Beef Pulao",
        description: {
          en: "Yakhni-style pulao with succulent beef and mellow whole spices.",
          ur: "Yakhni style beef pulao jisme naram gosht aur halka masala hai.",
        },
        price: "Rs. 840",
        calories: 740,
        spiceLevel: 2,
      },
    ],
  },
  {
    title: { en: "Drinks & Dessert", ur: "Drinks & Dessert" },
    items: [
      {
        id: "fallback-side-1",
        name: "Mint Lemon Soda",
        description: {
          en: "A chilled fizzy cooler with mint and lemon for a fresh palate reset.",
          ur: "Thandi fizzy mint lemon drink jo khanay ke sath fresh feel deti hai.",
        },
        price: "Rs. 290",
        calories: 120,
      },
      {
        id: "fallback-side-2",
        name: "Kheer Cup",
        description: {
          en: "Creamy rice pudding topped with pistachio and cardamom.",
          ur: "Creamy chawal ki kheer jo pista aur elaichi se garnish hoti hai.",
        },
        price: "Rs. 340",
        calories: 360,
      },
    ],
  },
];

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

function normalizeSpiceLevel(v: unknown): 1 | 2 | 3 | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return undefined;
  const r = Math.round(n);
  if (r < 1) return 1;
  if (r > 3) return 3;
  return r as 1 | 2 | 3;
}

function textIncludesAny(text: string, terms: string[]): boolean {
  const normalized = text.toLowerCase();
  return terms.some((term) => normalized.includes(term));
}

function shouldOmitSpiceLevel(categoryTitle: unknown, itemName: unknown): boolean {
  const category = typeof categoryTitle === "string" ? categoryTitle : "";
  const name = typeof itemName === "string" ? itemName : "";

  const nonSpicyCategoryHints = [
    "drink",
    "beverage",
    "dessert",
    "sweet",
    "mithai",
    "ice cream",
    "shake",
    "juice",
  ];
  const nonSpicyItemHints = [
    "kheer",
    "custard",
    "falooda",
    "gulab jamun",
    "zarda",
    "halwa",
    "ice cream",
    "soda",
    "lassi",
    "tea",
    "chai",
    "coffee",
    "water",
    "lemonade",
    "juice",
    "shake",
  ];

  return (
    textIncludesAny(category, nonSpicyCategoryHints) ||
    textIncludesAny(name, nonSpicyItemHints)
  );
}

/** Use cached demo menu only for rate-limit / overload (not 404 model, not auth errors). */
function shouldUseOfflineFallback(error: unknown): boolean {
  const status =
    error instanceof ApiError
      ? error.status
      : error && typeof error === "object" && "status" in error
        ? (error as { status?: number }).status
        : undefined;
  return status === 429 || status === 503;
}

const MENU_PROMPT = `You are receiving either one or two images of a restaurant menu. Extract all items from all provided images into a single unified JSON structure.

You are an expert OCR and culinary strategist. Analyze all provided menu images together and extract the data into one structured JSON format.

Rules for Extraction:

Categories: Group items by their headings (e.g., 'Pakistani Desi', 'Karahi').

Items & Prices: If an item has multiple prices (like Full/Half Karahi), treat them as separate items so they each get a card (e.g., 'Chicken Karahi (Full)' and 'Chicken Karahi (Half)').

Descriptions: Write one mouth-watering sentence in English and one in Roman Urdu for every item.

Vibe Stats (AI Estimates): >    - prepTime: Estimate how long it takes to serve (e.g., '10-15 min' for starters, '25-30 min' for Haleem/Karahi).

calories: Estimate calories based on the dish type.

dietaryTag: Assign one relevant tag (e.g., 'Spicy', 'Hearty', 'Protein Rich', 'Classic').

isBestseller: Randomly set this to 'true' for only 2 items per category to highlight popular dishes.

spiceLevel: Only include this field for dishes that are actually spicy or savory enough to warrant a heat indicator. Use integer 1, 2, or 3 only: 1 = mild, 2 = medium heat, 3 = hot / very spicy. For sweets, desserts, drinks, and clearly non-spicy dishes, omit spiceLevel entirely.

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
"spiceLevel": 2 // optional; omit for non-spicy items
}
]
}
]
}`;

/** If `response.text` is empty, concatenate text parts from the first candidate. */
function extractTextFromCandidateParts(response: {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> }; finishReason?: string }>;
}): string {
  const parts = response.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .map((p) => (typeof p?.text === "string" ? p.text : ""))
    .join("");
}

/** Decode a data URL or raw/base64-with-comma string into inline payload for Gemini. */
export function decodeImagePayload(encoded: string): { data: string; mimeType: string } {
  const s = encoded.trim();
  if (s.startsWith("data:")) {
    const comma = s.indexOf(",");
    if (comma === -1) {
      return { data: "", mimeType: "image/jpeg" };
    }
    const header = s.slice(5, comma);
    const mimeType = (header.split(";")[0]?.trim() || "image/jpeg") || "image/jpeg";
    const data = s.slice(comma + 1).replace(/\s/g, "");
    return { data, mimeType };
  }
  const data = s.includes(",") ? (s.split(",")[1] || s) : s;
  return { data, mimeType: "image/jpeg" };
}

export async function parseMenuFromImagesBase64(
  items: { data: string; mimeType: string }[],
  apiKey: string
): Promise<{ categories: MenuCategory[]; usedFallback: boolean }> {
  const normalized = items.map((item) => {
    const raw = item.data.includes(",") ? (item.data.split(",")[1] || item.data) : item.data;
    const data = raw.trim();
    const mimeType =
      item.mimeType && item.mimeType.length > 0 ? item.mimeType : "image/jpeg";
    return { data, mimeType };
  });

  const model = process.env.GEMINI_VISION_MODEL?.trim() || "gemini-2.5-flash";
  const ai = new GoogleGenAI({ apiKey });
  let response: Awaited<ReturnType<typeof ai.models.generateContent>>;
  const imageParts = normalized.map((item) => ({
    inlineData: {
      mimeType: item.mimeType,
      data: item.data,
    },
  }));
  try {
    response = await ai.models.generateContent({
      model,
      contents: [
        {
          role: "user",
          parts: [...imageParts, { text: MENU_PROMPT }],
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
                    spiceLevel: {
                      type: Type.INTEGER,
                      minimum: 1,
                      maximum: 3,
                    },
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
  } catch (error) {
    if (shouldUseOfflineFallback(error)) {
      console.error("[parseMenuFromImage] Falling back to cached menu:", error);
      return { categories: FALLBACK_MENU, usedFallback: true };
    }
    throw error;
  }

  const rawText =
    typeof response.text === "string" && response.text.trim()
      ? response.text
      : extractTextFromCandidateParts(response);
  if (!rawText?.trim()) {
    console.error("[parseMenuFromImage] Empty model response", {
      hasCandidates: Boolean(response.candidates?.length),
      finishReason: response.candidates?.[0]?.finishReason,
    });
    throw new Error("Empty response from vision model");
  }

  const cleaned = stripResponseMarkdown(rawText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned || "[]");
  } catch (e) {
    console.error("[parseMenuFromImage] JSON parse failed:", e, "snippet:", cleaned.slice(0, 500));
    throw new Error("Model returned invalid JSON");
  }
  const result = normalizeToCategoryArray(parsed);

  const categories = result.map((cat: any, i: number) => ({
    ...cat,
    items: (Array.isArray(cat?.items) ? cat.items : []).map((item: any, j: number) => {
      const categoryTitle = cat?.title?.en ?? cat?.title ?? "";
      const omitSpice = shouldOmitSpiceLevel(categoryTitle, item?.name);
      const spiceLevel = omitSpice ? undefined : normalizeSpiceLevel(item?.spiceLevel);
      return {
        ...item,
        id: item.id || `item-${i}-${j}`,
        ...(spiceLevel !== undefined ? { spiceLevel } : {}),
      };
    }),
  }));

  return { categories, usedFallback: false };
}

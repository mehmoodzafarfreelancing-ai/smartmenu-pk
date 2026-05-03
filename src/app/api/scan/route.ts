import { NextResponse } from "next/server";
import { ApiError } from "@google/genai";
import {
  decodeImagePayload,
  parseMenuFromImagesBase64,
} from "@/lib/server/parseMenuFromImage";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body === null || typeof body !== "object" || !("images" in body)) {
    return NextResponse.json({ error: "Missing images array" }, { status: 400 });
  }

  const images = (body as { images?: unknown }).images;
  if (!Array.isArray(images)) {
    return NextResponse.json({ error: "images must be an array" }, { status: 400 });
  }
  if (images.length < 1 || images.length > 2) {
    return NextResponse.json(
      { error: "images must contain 1 or 2 non-empty strings" },
      { status: 400 }
    );
  }

  const parts: { data: string; mimeType: string }[] = [];
  for (const entry of images) {
    if (typeof entry !== "string" || !entry.trim()) {
      return NextResponse.json({ error: "Each image must be a non-empty string" }, { status: 400 });
    }
    const { data, mimeType } = decodeImagePayload(entry);
    if (!data) {
      return NextResponse.json({ error: "Invalid or empty image payload" }, { status: 400 });
    }
    parts.push({ data, mimeType });
  }

  try {
    const { categories, usedFallback } = await parseMenuFromImagesBase64(parts, key);
    return NextResponse.json({ categories, usedFallback });
  } catch (error) {
    console.error("[api/scan] Gemini error:", error);
    if (error instanceof ApiError && error.status === 404) {
      return NextResponse.json(
        { error: "Invalid or unavailable GEMINI_VISION_MODEL" },
        { status: 400 }
      );
    }
    if (error && typeof error === "object" && "status" in error) {
      const s = (error as { status?: number }).status;
      if (s === 503) {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
      }
    }
    return NextResponse.json(
      { error: "Menu scan failed" },
      { status: 502 }
    );
  }
}

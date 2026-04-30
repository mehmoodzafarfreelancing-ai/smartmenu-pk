import { NextResponse } from "next/server";
import { parseMenuFromImageBase64 } from "@/lib/server/parseMenuFromImage";

export const runtime = "nodejs";
export const maxDuration = 60;

function isFileLike(
  v: FormDataEntryValue | null
): v is File {
  return (
    typeof v === "object" &&
    v !== null &&
    "arrayBuffer" in v &&
    typeof (v as File).arrayBuffer === "function" &&
    "name" in v
  );
}

export async function POST(request: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const raw = form.get("image");
  if (!isFileLike(raw) || !raw.size) {
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  const ab = await raw.arrayBuffer();
  const base64 = Buffer.from(ab).toString("base64");
  const mime = raw.type && raw.type.length > 0 ? raw.type : "image/jpeg";

  try {
    const { categories, usedFallback } = await parseMenuFromImageBase64(base64, mime, key);
    return NextResponse.json({ categories, usedFallback });
  } catch (error) {
    console.error("[api/scan] Gemini error:", error);
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

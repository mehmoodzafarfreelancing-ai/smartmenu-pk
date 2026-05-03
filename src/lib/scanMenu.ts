import type { MenuCategory } from "@/types";

export interface ScanMenuResult {
  categories: MenuCategory[];
  usedFallback: boolean;
}

export class ScanMenuError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = "ScanMenuError";
  }
}

/**
 * POST JSON: { images: string[] } — 1 or 2 data URLs or raw base64 strings.
 */
export async function scanMenuImages(imageBase64Strings: string[]): Promise<ScanMenuResult> {
  const res = await fetch("/api/scan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ images: imageBase64Strings }),
  });

  if (res.status === 503) {
    throw new ScanMenuError("unavailable", 503);
  }
  if (!res.ok) {
    let msg = "Scan failed";
    try {
      const j = (await res.json()) as { error?: string };
      if (j?.error) msg = j.error;
    } catch {
      /* ignore */
    }
    throw new ScanMenuError(msg, res.status);
  }

  const body = (await res.json()) as
    | ScanMenuResult
    | MenuCategory[];

  if (Array.isArray(body)) {
    return { categories: body, usedFallback: false };
  }

  return {
    categories: Array.isArray(body?.categories) ? body.categories : [],
    usedFallback: Boolean(body?.usedFallback),
  };
}

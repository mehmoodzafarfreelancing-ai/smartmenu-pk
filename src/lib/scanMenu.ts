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
 * POST multipart form: field `image` = File
 */
export async function scanMenuImage(file: File): Promise<ScanMenuResult> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/scan", {
    method: "POST",
    body: formData,
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

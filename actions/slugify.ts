"use server";

import { createClient } from "@/utils/supabase/server";
import slug from "slug";

// B2B-focused defaults
const DEFAULT_MAX_LENGTH = 80;
const DEFAULT_COLUMN = "slug" as const;
const DEFAULT_STOP_WORDS = new Set([
  // common fillers
  "the", "and", "for", "of", "in", "on", "at", "by", "to", "from", "with",
  // generic words to reduce noise
  "online", "store", "shop", "market", "b2b", "seller", "buy", "sell",
  // company suffixes (India-focused)
  "private", "pvt", "pvt.", "limited", "ltd", "ltd.", "llp", "inc", "co", "company",
  // geography noise
  "india", "ind",
]);

export interface SlugOptions {
  column?: string; // default 'slug'
  maxLength?: number; // default 80
  extraParts?: Array<string | undefined | null>; // e.g., category, city, business
  stopWords?: string[]; // extend/override defaults
}

function normalizeText(text: string): string {
  return text
    .replace(/[\u2019\u2013\u2014]/g, "-") // smart quotes/dashes to ASCII dash
    .replace(/[\u2018\u201C\u201D]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function removeStopWords(text: string, extraStopWords?: string[]): string {
  const stop = new Set(
    [...DEFAULT_STOP_WORDS, ...(extraStopWords ?? [])].map((s) => s.toLowerCase())
  );
  return text
    .split(/\s+/)
    .filter((w) => !stop.has(w.toLowerCase()))
    .join(" ");
}

function toSlugBase(parts: Array<string | null | undefined>, maxLength: number): string {
  const raw = parts
    .filter(Boolean)
    .map((p) => normalizeText(p!))
    .join(" ");

  // slug library handles transliteration and lowercasing
  let base = slug(raw, { lower: true });

  // collapse repeated dashes and trim
  base = base.replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (base.length <= maxLength) return base;

  // Trim preserving word boundaries
  const segments = base.split("-");
  const out: string[] = [];
  let len = 0;
  for (const seg of segments) {
    const addLen = (out.length ? 1 : 0) + seg.length; // +1 for dash
    if (len + addLen > maxLength) break;
    out.push(seg);
    len += addLen;
  }
  return out.join("-");
}

function computeNextSlug(base: string, existing: string[], maxLength: number): string {
  // If base not taken, use it
  if (!existing.includes(base)) return base;

  let maxNum = 1;
  for (const s of existing) {
    if (s === base) { maxNum = Math.max(maxNum, 1); continue; }
    const m = s.match(new RegExp(`^${base.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}-(\\d+)$`));
    if (m) {
      const n = parseInt(m[1], 10);
      if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
    }
  }
  let candidateNumber = maxNum + 1;
  // Ensure we respect max length when adding suffix
  while (true) {
    const suffix = `-${candidateNumber}`;
    const allowedBaseLen = Math.max(1, maxLength - suffix.length);
    const candidateBase = base.length > allowedBaseLen ? base.slice(0, allowedBaseLen).replace(/-+$/g, "") : base;
    const candidate = `${candidateBase}${suffix}`;
    if (!existing.includes(candidate)) return candidate;
    candidateNumber++;
  }
}

function randomSuffix(length = 4): string {
  return Math.random().toString(36).slice(2, 2 + length);
}

/**
 * Generate a unique, readable slug for a table.
 * - Cleans and de-noises B2B phrases (e.g., removes Pvt/Ltd/LLP, 'online', 'store').
 * - Optional extraParts allow contextual uniqueness (category, city, business name).
 * - Uses a single prefix query (LIKE 'base%') to find the next available variant.
 * - Keeps within max length and mitigates race conditions with a short random suffix fallback.
 */
export async function getUniqueSlug(
  tablename: string,
  text: string,
  options: SlugOptions = {}
): Promise<string> {
  const column = options.column ?? DEFAULT_COLUMN;
  const maxLength = options.maxLength ?? DEFAULT_MAX_LENGTH;
  const extraParts = options.extraParts ?? [];

  // Step 1: clean and reduce noise
  const cleaned = removeStopWords(normalizeText(text), options.stopWords);

  // If cleaning removed everything, fall back to original text
  const baseInput = cleaned || text;

  // Step 2: generate base from text + optional context parts
  const baseSlug = toSlugBase([baseInput, ...extraParts], maxLength);

  const supabase = await createClient();

  // Step 3: fetch all existing variants in one query (index-friendly prefix)
  const pattern = `${baseSlug}%`;
  const { data, error } = await supabase
    .from(tablename)
    .select(column)
    .like(column, pattern);

  if (error) {
    // In case of read failure, degrade gracefully with a random suffix
    return `${baseSlug}-${randomSuffix(4)}`.slice(0, maxLength);
  }

  // Supabase typing for select(column) can be string[] | object[] depending on inference.
  // Normalize to string[].
  const existing: string[] = Array.isArray(data)
    ? (data as any[])
        .map((row) => {
          if (row == null) return "";
          if (typeof row === "string") return row as string;
          const v = (row as any)[column];
          return typeof v === "string" ? v : "";
        })
        .filter((s: string) => s.length > 0)
    : [];

  // Step 4: compute next available
  let uniqueSlug = computeNextSlug(baseSlug, existing, maxLength);

  // Step 5: Final DB equality check to mitigate races; if taken, append short random suffix
  try {
    const { data: finalCheck } = await supabase
      .from(tablename)
      .select(column)
      .eq(column, uniqueSlug)
      .maybeSingle();

    if (finalCheck) {
      const rand = randomSuffix(4);
      const suffix = `-${rand}`; // length 5
      const allowedBaseLen = Math.max(1, maxLength - suffix.length);
      const baseTrimmed = uniqueSlug.length > allowedBaseLen
        ? uniqueSlug.slice(0, allowedBaseLen).replace(/-+$/g, "")
        : uniqueSlug;
      uniqueSlug = `${baseTrimmed}${suffix}`;
    }
  } catch {
    // On any error, still attempt a safe random suffix fallback
    const rand = randomSuffix(4);
    const suffix = `-${rand}`;
    const allowedBaseLen = Math.max(1, maxLength - suffix.length);
    const baseTrimmed = uniqueSlug.length > allowedBaseLen
      ? uniqueSlug.slice(0, allowedBaseLen).replace(/-+$/g, "")
      : uniqueSlug;
    uniqueSlug = `${baseTrimmed}${suffix}`;
  }

  return uniqueSlug;
}
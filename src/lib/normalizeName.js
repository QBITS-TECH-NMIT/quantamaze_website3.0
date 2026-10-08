/**
 * Normalize names for fuzzy matching: trim, lowercase, collapse spaces,
 * and strip punctuation plus combining accents so "vemala  prajwal"
 * matches "Vemala Prajwal".
 */
export function normalizeMatchName(value) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

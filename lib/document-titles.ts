/** Professional German contract titles by type (client-demo ready). */
export const CONTRACT_TYPE_LABELS: Record<string, string> = {
  loan_agreement: "Darlehensvertrag",
  subordinated_loan: "Nachrangdarlehensvertrag",
  amendment: "Vertragsnachtrag",
  additional: "Zusatzvereinbarung",
};

const LOREM_RE =
  /\b(lorem|ipsum|dolor|sit|amet|consectetur|adipiscing|elit|maiores|fugit|quis|eiusmod|aliquip|tempor|incididunt|labore|dolore|magna|aliqua)\b/i;

const FILENAME_RE = /\.(pdf|docx?|xlsx?|png|jpe?g)$/i;

/** True when a title looks like placeholder/lorem or a raw upload filename. */
export function isPlaceholderDocumentTitle(title?: string | null): boolean {
  const t = String(title || "").trim();
  if (!t) return true;
  if (LOREM_RE.test(t)) return true;
  if (FILENAME_RE.test(t) && (/[_\d]/.test(t) || LOREM_RE.test(t))) return true;
  if (/^[a-z0-9_\-]+\.(pdf|docx?)$/i.test(t) && !/darlehen|vertrag|nachtrag|vereinbarung/i.test(t)) {
    return true;
  }
  return false;
}

/** Display title for contracts — never show lorem/ipsum or raw filenames. */
export function displayContractTitle(
  title?: string | null,
  type?: string | null,
  index = 0
): string {
  const base = CONTRACT_TYPE_LABELS[String(type || "")] || "Darlehensvertrag";
  if (!isPlaceholderDocumentTitle(title)) {
    return String(title).trim();
  }
  return index > 0 ? `${base} ${index + 1}` : base;
}

/** Default upload title from selected contract type (not the file name). */
export function defaultContractTitleForType(type: string): string {
  return CONTRACT_TYPE_LABELS[type] || "Darlehensvertrag";
}

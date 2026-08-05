/** Display helpers for repayment models (UI labels only). */

const MODEL_LABELS: Record<string, string> = {
  amortizing: "Annuitätisch",
  interest_only: "Nur Finanzierungsgebühr",
  bullet: "Bullet (Endfälligkeit)",
  fixed_monthly_payment: "Feste Monatsrate",
};

export function formatRepaymentModel(model?: string | null) {
  if (!model) return MODEL_LABELS.amortizing;
  return MODEL_LABELS[model] || model.replace(/_/g, " ");
}

export const REPAYMENT_MODEL_OPTIONS = [
  { value: "amortizing", label: "Annuitätisch" },
  { value: "interest_only", label: "Nur Finanzierungsgebühr" },
  { value: "bullet", label: "Bullet (Endfälligkeit)" },
  { value: "fixed_monthly_payment", label: "Feste Monatsrate" },
] as const;

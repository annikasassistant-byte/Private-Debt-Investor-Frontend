/** Display helpers for repayment models (UI labels only). */

const MODEL_LABELS: Record<string, string> = {
  amortizing: "Amortizing",
  interest_only: "Financing Fee Only",
  bullet: "Bullet",
  fixed_monthly_payment: "Fixed Monthly Payment",
};

export function formatRepaymentModel(model?: string | null) {
  if (!model) return MODEL_LABELS.amortizing;
  return MODEL_LABELS[model] || model.replace(/_/g, " ");
}

export const REPAYMENT_MODEL_OPTIONS = [
  { value: "amortizing", label: "Amortizing" },
  { value: "interest_only", label: "Financing Fee Only" },
  { value: "bullet", label: "Bullet" },
  { value: "fixed_monthly_payment", label: "Fixed Monthly Payment" },
] as const;

import { formatCurrency } from "@/lib/format";
import { formatRepaymentModel } from "@/lib/repayment";

const OBJECT_ID_RE = /^[a-f0-9]{24}$/i;

export function isObjectId(value?: string | null): boolean {
  return OBJECT_ID_RE.test(String(value || "").trim());
}

/** Build Base UI Select `items` map so SelectValue never shows raw IDs. */
export function selectItems(
  entries: Array<{ value: string; label: string }>
): Record<string, string> {
  return Object.fromEntries(
    entries.map(({ value, label }) => [
      value,
      isObjectId(label) ? "—" : label || "—",
    ])
  );
}

export function investmentOptionLabel(inv: {
  principal: number;
  investorName?: string;
  repaymentModel?: string;
}): string {
  const amount = formatCurrency(inv.principal);
  const model = formatRepaymentModel(inv.repaymentModel);
  if (inv.investorName) return `${amount} · ${inv.investorName} · ${model}`;
  return `${amount} · ${model}`;
}

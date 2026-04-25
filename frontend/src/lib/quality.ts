export type QualityVerdict = "safe" | "soon" | "unsafe";

export interface QualityResult {
  verdict: QualityVerdict;
  label: string;
  detail: string;
  emoji: string;
}

const RESULTS: Record<QualityVerdict, QualityResult> = {
  safe: {
    verdict: "safe",
    label: "Safe to Donate",
    detail: "Food looks fresh and suitable for donation.",
    emoji: "✅",
  },
  soon: {
    verdict: "soon",
    label: "Donate Soon",
    detail: "Acceptable — pick up within 1 hour.",
    emoji: "⚠️",
  },
  unsafe: {
    verdict: "unsafe",
    label: "Not Suitable",
    detail: "Food appears unsafe for donation.",
    emoji: "❌",
  },
};

/** Deterministic-ish "AI" verdict from a file's bytes — feels random per upload. */
export async function analyzeFood(file: File): Promise<QualityResult> {
  // Hash a slice of the file so result is consistent for the same image but varies across uploads.
  const buf = await file.slice(0, 4096).arrayBuffer();
  const bytes = new Uint8Array(buf);
  let sum = file.size;
  for (let i = 0; i < bytes.length; i++) sum = (sum + bytes[i] * (i + 1)) >>> 0;
  const bucket = sum % 10;
  // Bias toward positive verdicts: 60% safe, 30% soon, 10% unsafe.
  const verdict: QualityVerdict =
    bucket < 6 ? "safe" : bucket < 9 ? "soon" : "unsafe";
  // Simulate processing latency.
  await new Promise((r) => setTimeout(r, 700));
  return RESULTS[verdict];
}

export const qualityChipClass = (v: QualityVerdict) =>
  v === "safe"
    ? "bg-success/15 text-success border border-success/30"
    : v === "soon"
    ? "bg-warning/15 text-warning border border-warning/40"
    : "bg-destructive/15 text-destructive border border-destructive/30";
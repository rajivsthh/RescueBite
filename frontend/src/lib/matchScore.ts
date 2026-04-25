export interface MatchScoreBreakdown {
  distance: number;   // 0–10
  urgency: number;    // 0–10
  capacity: number;   // 0–10
  final: number;      // 0–10 weighted
}

/**
 * Score the quality of a restaurant ↔ NGO match.
 * Distance: closer = higher (10 at 0km, 0 at >=15km).
 * Urgency: shorter expiry = higher (10 at <=1h, 0 at >=8h).
 * Capacity: ratio of meals fulfilled vs total (10 if NGO covers it all).
 * Final = 0.3 * distance + 0.4 * urgency + 0.3 * capacity.
 */
export function computeMatchScore(opts: {
  distanceKm: number;
  expiryHours: number;
  mealsAssigned: number;
  ngoCapacity: number;
}): MatchScoreBreakdown {
  const distance = Math.max(0, Math.min(10, 10 - (opts.distanceKm / 15) * 10));

  let urgency: number;
  if (opts.expiryHours <= 1) urgency = 10;
  else if (opts.expiryHours <= 2) urgency = 9;
  else if (opts.expiryHours <= 4) urgency = 7;
  else if (opts.expiryHours <= 6) urgency = 5;
  else if (opts.expiryHours <= 8) urgency = 3;
  else urgency = 1;

  const ratio = Math.min(1, opts.ngoCapacity / Math.max(1, opts.mealsAssigned));
  const capacity = Math.round(ratio * 10 * 10) / 10;

  const final = +(distance * 0.3 + urgency * 0.4 + capacity * 0.3).toFixed(1);

  return {
    distance: +distance.toFixed(1),
    urgency: +urgency.toFixed(1),
    capacity: +capacity.toFixed(1),
    final,
  };
}

export type ScoreTier = "high" | "medium" | "low";

export const scoreTier = (n: number): ScoreTier =>
  n >= 7.5 ? "high" : n >= 5 ? "medium" : "low";

export const scoreColor = (tier: ScoreTier) =>
  tier === "high"
    ? "text-success"
    : tier === "medium"
    ? "text-accent-foreground"
    : "text-destructive";

export const scoreBarColor = (tier: ScoreTier) =>
  tier === "high"
    ? "bg-success"
    : tier === "medium"
    ? "bg-accent"
    : "bg-destructive";
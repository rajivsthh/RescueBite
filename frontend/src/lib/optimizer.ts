import { NGO, NGOS, AreaId, distanceBetween } from "./data";

export interface Allocation {
  ngo: NGO;
  meals: number;
  distanceKm: number;
}

export interface OptimizationInput {
  fromArea: AreaId;
  quantity: number;
  expiryHours: number;
}

export interface OptimizationResult {
  allocations: Allocation[];
  unallocated: number;
  totalDistanceKm: number;
  urgent: boolean;
}

/**
 * Greedy optimizer:
 *  - Score each NGO. Lower score = better.
 *  - Score = distance (km) - urgencyBoost. Urgency increases as expiry shrinks.
 *  - Allocate meals to NGOs in score order, respecting capacity. Split if needed.
 */
export function optimize(
  input: OptimizationInput,
  ngos: NGO[] = NGOS
): OptimizationResult {
  const urgencyBoost = input.expiryHours <= 1 ? 5 : input.expiryHours <= 2 ? 3 : input.expiryHours <= 4 ? 1.5 : 0;

  const ranked = ngos
    .map((ngo) => {
      const distanceKm = distanceBetween(input.fromArea, ngo.area);
      // Larger capacity is a slight tie-breaker.
      const score = distanceKm - urgencyBoost - ngo.capacity * 0.02;
      return { ngo, distanceKm, score };
    })
    .sort((a, b) => a.score - b.score);

  const allocations: Allocation[] = [];
  let remaining = input.quantity;

  for (const { ngo, distanceKm } of ranked) {
    if (remaining <= 0) break;
    const meals = Math.min(remaining, ngo.capacity);
    if (meals <= 0) continue;
    allocations.push({ ngo, meals, distanceKm });
    remaining -= meals;
  }

  const totalDistanceKm = allocations.reduce((s, a) => s + a.distanceKm, 0);

  return {
    allocations,
    unallocated: Math.max(0, remaining),
    totalDistanceKm,
    urgent: input.expiryHours <= 2,
  };
}
export type EventType = "Wedding" | "Bratabandha" | "Party" | "Conference" | "Corporate";

export type MealType = "Veg" | "Non-Veg" | "Mixed";

/** Per-guest surplus factor (kg). */
const KG_PER_GUEST: Record<EventType, number> = {
  Wedding: 0.3,
  Corporate: 0.2,
  Party: 0.25,
  Bratabandha: 0.28,
  Conference: 0.18,
};

/**
 * Estimate event surplus in kilograms.
 * Mixed meals add a +10% multiplier.
 */
export function estimateSurplusKg(
  guests: number,
  type: EventType,
  meal: MealType
): number {
  const base = (KG_PER_GUEST[type] ?? 0.25) * Math.max(0, guests);
  const adj = meal === "Mixed" ? base * 1.1 : base;
  return Math.round(adj * 10) / 10;
}

/** Rough conversion: 1 plate ≈ 0.4 kg cooked food. */
export const kgToMeals = (kg: number) => Math.max(0, Math.round(kg / 0.4));

const SURPLUS_RATE: Record<EventType, [number, number]> = {
  Wedding: [0.22, 0.32],
  Bratabandha: [0.18, 0.28],
  Party: [0.15, 0.25],
  Conference: [0.1, 0.18],
  Corporate: [0.12, 0.2],
};

export interface SurplusPrediction {
  low: number;
  high: number;
  expected: number;
  pickupTime: string; // formatted
  pickupDate: Date;
}

/**
 * Predict surplus meals for an event based on guest count + type.
 * Suggests pickup ~30 minutes after event end.
 */
export function predictEventSurplus(
  guests: number,
  type: EventType,
  endTimeISO: string
): SurplusPrediction {
  const [lo, hi] = SURPLUS_RATE[type] ?? [0.2, 0.3];
  const low = Math.max(0, Math.round(guests * lo));
  const high = Math.max(0, Math.round(guests * hi));
  const expected = Math.round((low + high) / 2);

  const end = endTimeISO ? new Date(endTimeISO) : new Date();
  const pickup = new Date(end.getTime() + 30 * 60 * 1000);
  const pickupTime = pickup.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return { low, high, expected, pickupTime, pickupDate: pickup };
}

/**
 * Lightweight predictive suggestion for restaurant submissions.
 * Returns a hint string or null.
 */
export function restaurantSuggestion(quantity: number, expiryHours: number): string | null {
  if (quantity >= 40 && expiryHours >= 4) {
    return "Large batch detected — consider scheduling pickup in advance to reach more NGOs.";
  }
  if (expiryHours <= 2) {
    return "Short expiry window. Marking as urgent and prioritising the closest NGO.";
  }
  if (quantity >= 20) {
    return "Based on similar entries, this may split across 2 NGOs for fastest delivery.";
  }
  return null;
}
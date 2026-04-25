import { AreaId, areaName, distanceBetween } from "./data";

export interface RouteStop {
  area: AreaId;
  name: string;
  kind: "pickup" | "drop";
}

export interface OptimizedRoute {
  stops: RouteStop[];
  legDistances: number[]; // distance from stop[i] to stop[i+1]
  totalKm: number;
  totalMinutes: number; // assume 30 km/h
}

/** Nearest-neighbor ordering through pickups, then end at drop. */
export function optimizeRoute(
  pickups: { area: AreaId; name: string }[],
  drop: { area: AreaId; name: string },
  startArea?: AreaId,
): OptimizedRoute {
  if (pickups.length === 0) {
    return { stops: [{ ...drop, kind: "drop" }], legDistances: [], totalKm: 0, totalMinutes: 0 };
  }
  const remaining = [...pickups];
  const ordered: RouteStop[] = [];
  let currentArea: AreaId = startArea ?? remaining[0].area;

  while (remaining.length > 0) {
    let bestIdx = 0;
    let bestDist = Infinity;
    for (let i = 0; i < remaining.length; i++) {
      const d = distanceBetween(currentArea, remaining[i].area);
      if (d < bestDist) {
        bestDist = d;
        bestIdx = i;
      }
    }
    const next = remaining.splice(bestIdx, 1)[0];
    ordered.push({ ...next, kind: "pickup" });
    currentArea = next.area;
  }
  ordered.push({ ...drop, kind: "drop" });

  const legDistances: number[] = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    legDistances.push(distanceBetween(ordered[i].area, ordered[i + 1].area));
  }
  const totalKm = legDistances.reduce((s, x) => s + x, 0);
  const totalMinutes = Math.round((totalKm / 30) * 60);

  return { stops: ordered, legDistances, totalKm, totalMinutes };
}

export const stopAreaName = (s: RouteStop) => areaName(s.area);
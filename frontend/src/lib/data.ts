export type AreaId = "thamel" | "baneshwor" | "lalitpur" | "kirtipur" | "bhaktapur";

export interface Area {
  id: AreaId;
  name: string;
}

export const AREAS: Area[] = [
  { id: "thamel", name: "Thamel" },
  { id: "baneshwor", name: "Baneshwor" },
  { id: "lalitpur", name: "Lalitpur" },
  { id: "kirtipur", name: "Kirtipur" },
  { id: "bhaktapur", name: "Bhaktapur" },
];

export interface NGO {
  id: string;
  name: string;
  area: AreaId;
  capacity: number; // meals per pickup
  contact: string;
}

export const NGOS: NGO[] = [
  { id: "ngo-a", name: "NGO A — Sahayog Kitchen", area: "thamel", capacity: 20, contact: "+977 980-0000001" },
  { id: "ngo-b", name: "NGO B — Maitri Foundation", area: "baneshwor", capacity: 15, contact: "+977 980-0000002" },
  { id: "ngo-c", name: "NGO C — Annapurna Trust", area: "lalitpur", capacity: 25, contact: "+977 980-0000003" },
];

// Approximate inter-area distances in km (symmetric).
const DISTANCE: Record<AreaId, Record<AreaId, number>> = {
  thamel:    { thamel: 0.3, baneshwor: 4.8, lalitpur: 6.2, kirtipur: 8.1, bhaktapur: 13.5 },
  baneshwor: { thamel: 4.8, baneshwor: 0.3, lalitpur: 4.1, kirtipur: 9.0, bhaktapur: 9.6 },
  lalitpur:  { thamel: 6.2, baneshwor: 4.1, lalitpur: 0.3, kirtipur: 5.4, bhaktapur: 11.0 },
  kirtipur:  { thamel: 8.1, baneshwor: 9.0, lalitpur: 5.4, kirtipur: 0.3, bhaktapur: 14.2 },
  bhaktapur: { thamel: 13.5, baneshwor: 9.6, lalitpur: 11.0, kirtipur: 14.2, bhaktapur: 0.3 },
};

export const distanceBetween = (a: AreaId, b: AreaId) => DISTANCE[a][b];
export const areaName = (a: AreaId) => AREAS.find((x) => x.id === a)?.name ?? a;

/** Pick the closest NGO to a given area. */
export const nearestNGO = (a: AreaId): NGO =>
  [...NGOS].sort((x, y) => distanceBetween(a, x.area) - distanceBetween(a, y.area))[0];
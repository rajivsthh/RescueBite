import { AreaId } from "./data";

export type LatLng = [number, number];

export const KATHMANDU_CENTER: LatLng = [27.7172, 85.324];

export const AREA_COORDS: Record<AreaId, LatLng> = {
  thamel: [27.7154, 85.3123],
  baneshwor: [27.6882, 85.335],
  lalitpur: [27.671, 85.324],
  kirtipur: [27.6792, 85.2756],
  bhaktapur: [27.671, 85.4298],
};

export const DEMO_COORDS = {
  thamel: [27.7154, 85.3123] as LatLng,
  lazimpat: [27.7278, 85.3247] as LatLng,
  baneshwor: [27.6882, 85.335] as LatLng,
  patan: [27.671, 85.324] as LatLng,
};

export const interpolate = (from: LatLng, to: LatLng, t: number): LatLng => [
  from[0] + (to[0] - from[0]) * t,
  from[1] + (to[1] - from[1]) * t,
];

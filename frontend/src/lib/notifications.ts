export interface SimNotification {
  id: string;
  to: "ngo" | "volunteer";
  recipientName: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export const formatTime = (ts: number) =>
  new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export const buildUrgentNgoMsg = (
  restaurant: string,
  area: string,
  meals: number,
  expiryHours: number,
  matchId: string,
) =>
  `🍱 URGENT: ${meals} meals available at ${restaurant}, ${area}. Expires in ${expiryHours}hr. Accept here: foodwaste.app/match/${matchId}`;

export const buildVolunteerMsg = (
  restaurant: string,
  ngoName: string,
) =>
  `🚗 New delivery task assigned. Pickup from ${restaurant}, drop to ${ngoName}. Tap to view route.`;
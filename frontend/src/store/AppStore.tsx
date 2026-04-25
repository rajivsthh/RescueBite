import { createContext, useContext, useMemo, useState, ReactNode, useCallback } from "react";
import { AreaId, NGO } from "@/lib/data";
import { EventType } from "@/lib/predict";
import { QualityVerdict } from "@/lib/quality";

export type RequestStatus = "pending" | "accepted" | "rejected" | "delivered";
export type DeliveryStatus = "available" | "in_transit" | "delivered";
export type TrackerStage = "matched" | "assigned" | "picked_up" | "delivered";
export type SourceKind = "restaurant" | "event";

export interface FoodRequest {
  id: string;
  restaurantName: string;     // source display name (restaurant or event)
  sourceKind: SourceKind;
  fromArea: AreaId;
  foodType: string;
  meals: number;        // meals assigned to this NGO
  totalMeals: number;   // total meals in the original drop
  expiryHours: number;
  distanceKm: number;
  ngo: NGO;
  createdAt: number;
  status: RequestStatus;
  scheduledFor?: number; // epoch ms; if set, this is an upcoming pickup
  quality?: QualityVerdict;
  trackerStage: TrackerStage;
}

export interface DeliveryStop {
  area: AreaId;
  sourceName: string;
  meals: number;
}

export interface Delivery {
  id: string;
  requestIds: string[];
  pickups: DeliveryStop[];          // 1+ stops (multi-source supported)
  dropArea: AreaId;
  ngoName: string;
  meals: number;
  status: DeliveryStatus;
  scheduledFor?: number;
  volunteer: string;       // assigned (mock) volunteer name
  completedAt?: number;    // epoch ms
}

export interface EventEntry {
  id: string;
  name: string;
  area: AreaId;
  guests: number;
  eventType: EventType;
  endTime: string;            // ISO
  expectedSurplus: number;
  notified: boolean;
  createdAt: number;
}

interface AppState {
  requests: FoodRequest[];
  deliveries: Delivery[];
  events: EventEntry[];
  addRequests: (r: Omit<FoodRequest, "id" | "createdAt" | "status" | "trackerStage">[]) => void;
  setRequestStatus: (id: string, status: RequestStatus) => void;
  setRequestStage: (id: string, stage: TrackerStage) => void;
  acceptDelivery: (id: string) => void;
  completeDelivery: (id: string) => void;
  addEvent: (e: Omit<EventEntry, "id" | "createdAt" | "notified">) => EventEntry;
  notifyEventNGOs: (id: string) => void;
  totals: {
    mealsSaved: number;
    ngosConnected: number;
    deliveriesCompleted: number;
    scheduledPickups: number;
    eventContributions: number;
    predictedWastePrevented: number;
  };
}

const Ctx = createContext<AppState | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [events, setEvents] = useState<EventEntry[]>([]);

  const addRequests: AppState["addRequests"] = useCallback((items) => {
    const now = Date.now();
    setRequests((prev) => [
      ...items.map((i) => ({
        ...i,
        id: uid(),
        createdAt: now,
        status: "pending" as const,
        trackerStage: "matched" as const,
      })),
      ...prev,
    ]);
  }, []);

  const setRequestStatus: AppState["setRequestStatus"] = useCallback((id, status) => {
    setRequests((prev) => {
      const next = prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              trackerStage:
                status === "accepted" && r.trackerStage === "matched"
                  ? ("assigned" as const)
                  : status === "delivered"
                  ? ("delivered" as const)
                  : r.trackerStage,
            }
          : r,
      );
      if (status === "accepted") {
        const r = next.find((x) => x.id === id);
        if (r) {
          setDeliveries((d) => {
            // Multi-source batching: if there is an existing AVAILABLE delivery
            // heading to the same NGO, merge this pickup as an extra stop.
            const idx = d.findIndex(
              (x) => x.status === "available" && x.ngoName === r.ngo.name && !x.scheduledFor
            );
            if (idx >= 0) {
              const existing = d[idx];
              const merged: Delivery = {
                ...existing,
                requestIds: [...existing.requestIds, r.id],
                pickups: [
                  ...existing.pickups,
                  { area: r.fromArea, sourceName: r.restaurantName, meals: r.meals },
                ],
                meals: existing.meals + r.meals,
              };
              const copy = [...d];
              copy[idx] = merged;
              return copy;
            }
            const VOLUNTEERS = ["Aarav Shrestha", "Sita Tamang", "Bishal Rai", "Pooja Karki"];
            const volunteer = VOLUNTEERS[d.length % VOLUNTEERS.length];
            return [
              {
                id: uid(),
                requestIds: [r.id],
                pickups: [{ area: r.fromArea, sourceName: r.restaurantName, meals: r.meals }],
                dropArea: r.ngo.area,
                ngoName: r.ngo.name,
                meals: r.meals,
                status: "available",
                scheduledFor: r.scheduledFor,
                volunteer,
              },
              ...d,
            ];
          });
        }
      }
      return next;
    });
  }, []);

  const setRequestStage: AppState["setRequestStage"] = useCallback((id, stage) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, trackerStage: stage } : r)));
  }, []);

  const acceptDelivery: AppState["acceptDelivery"] = useCallback((id) => {
    setDeliveries((prev) => prev.map((d) => (d.id === id ? { ...d, status: "in_transit" } : d)));
  }, []);

  const completeDelivery: AppState["completeDelivery"] = useCallback((id) => {
    setDeliveries((prev) => {
      const next = prev.map((d) =>
        d.id === id ? { ...d, status: "delivered" as const, completedAt: Date.now() } : d
      );
      const completed = next.find((d) => d.id === id);
      if (completed) {
        setRequests((rs) =>
          rs.map((r) =>
            completed.requestIds.includes(r.id)
              ? { ...r, status: "delivered" as const, trackerStage: "delivered" as const }
              : r,
          )
        );
      }
      return next;
    });
  }, []);

  const addEvent: AppState["addEvent"] = useCallback((e) => {
    const entry: EventEntry = { ...e, id: uid(), createdAt: Date.now(), notified: false };
    setEvents((prev) => [entry, ...prev]);
    return entry;
  }, []);

  const notifyEventNGOs: AppState["notifyEventNGOs"] = useCallback((id) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, notified: true } : e)));
  }, []);

  const totals = useMemo(() => {
    const mealsSaved = requests
      .filter((r) => r.status === "accepted" || r.status === "delivered")
      .reduce((s, r) => s + r.meals, 0);
    const ngosConnected = new Set(
      requests.filter((r) => r.status !== "rejected").map((r) => r.ngo.id)
    ).size;
    const deliveriesCompleted = deliveries.filter((d) => d.status === "delivered").length;
    const scheduledPickups = requests.filter(
      (r) => r.scheduledFor && (r.status === "pending" || r.status === "accepted")
    ).length;
    const eventContributions = requests
      .filter((r) => r.sourceKind === "event" && (r.status === "accepted" || r.status === "delivered"))
      .reduce((s, r) => s + r.meals, 0);
    const predictedWastePrevented = events.reduce((s, e) => s + e.expectedSurplus, 0);
    return {
      mealsSaved,
      ngosConnected,
      deliveriesCompleted,
      scheduledPickups,
      eventContributions,
      predictedWastePrevented,
    };
  }, [requests, deliveries, events]);

  const value = useMemo<AppState>(
    () => ({
      requests,
      deliveries,
      events,
      addRequests,
      setRequestStatus,
      setRequestStage,
      acceptDelivery,
      completeDelivery,
      addEvent,
      notifyEventNGOs,
      totals,
    }),
    [
      requests,
      deliveries,
      events,
      addRequests,
      setRequestStatus,
      setRequestStage,
      acceptDelivery,
      completeDelivery,
      addEvent,
      notifyEventNGOs,
      totals,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAppStore = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppStore must be used inside AppStoreProvider");
  return v;
};
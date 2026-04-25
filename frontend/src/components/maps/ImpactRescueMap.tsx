import { useEffect, useMemo, useState } from "react";
import { Marker, Polyline, Popup, TileLayer, MapContainer } from "react-leaflet";
import { divIcon } from "leaflet";
import { DEMO_COORDS, interpolate, KATHMANDU_CENTER, LatLng } from "@/lib/mapData";

type RescueStatus = "active" | "completed";

interface RescueItem {
  id: string;
  donorName: string;
  donorCoord: LatLng;
  ngoName: string;
  ngoCoord: LatLng;
  foodQty: number;
  rescueTime: string;
  status: RescueStatus;
}

const rescues: RescueItem[] = [
  {
    id: "rescue-1",
    donorName: "Thamel Bento Hub",
    donorCoord: DEMO_COORDS.thamel,
    ngoName: "Sahayog Kitchen, Lazimpat",
    ngoCoord: DEMO_COORDS.lazimpat,
    foodQty: 42,
    rescueTime: "Today, 10:20 AM",
    status: "active",
  },
  {
    id: "rescue-2",
    donorName: "Baneshwor Family Diner",
    donorCoord: DEMO_COORDS.baneshwor,
    ngoName: "Maitri Foundation, Patan",
    ngoCoord: DEMO_COORDS.patan,
    foodQty: 34,
    rescueTime: "Today, 9:05 AM",
    status: "completed",
  },
  {
    id: "rescue-3",
    donorName: "Lazimpat Courtyard",
    donorCoord: DEMO_COORDS.lazimpat,
    ngoName: "Annapurna Trust, Baneshwor",
    ngoCoord: DEMO_COORDS.baneshwor,
    foodQty: 27,
    rescueTime: "Today, 11:10 AM",
    status: "active",
  },
  {
    id: "rescue-4",
    donorName: "Patan Heritage Kitchen",
    donorCoord: DEMO_COORDS.patan,
    ngoName: "Community Shelter, Thamel",
    ngoCoord: DEMO_COORDS.thamel,
    foodQty: 31,
    rescueTime: "Yesterday, 7:45 PM",
    status: "completed",
  },
];

const donorIcon = divIcon({
  className: "emoji-marker-wrap",
  html: '<div class="emoji-marker emoji-donor">🍱</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const ngoIcon = divIcon({
  className: "emoji-marker-wrap",
  html: '<div class="emoji-marker emoji-ngo">🏠</div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const carIcon = divIcon({
  className: "emoji-marker-wrap",
  html: '<div class="emoji-marker emoji-car pulse">🚗</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const ImpactRescueMap = () => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((t) => t + 1), 1200);
    return () => window.clearInterval(timer);
  }, []);

  const activeRescues = useMemo(() => rescues.filter((r) => r.status === "active"), []);
  const completedRescues = useMemo(() => rescues.filter((r) => r.status === "completed"), []);

  return (
    <section className="panel p-5 md:p-6 mt-6 border border-primary/25" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="font-display text-2xl md:text-3xl font-semibold mb-4">Live Food Rescues Across the City</h3>

      <div className="overflow-hidden rounded-2xl border border-primary/20 h-[320px] md:h-[400px]">
        <MapContainer center={KATHMANDU_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {rescues.map((r) => (
            <Marker key={`${r.id}-donor`} position={r.donorCoord} icon={donorIcon}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div><strong>Name:</strong> {r.donorName}</div>
                  <div><strong>Status:</strong> {r.status === "active" ? "Active" : "Completed"}</div>
                  <div><strong>Food quantity:</strong> {r.foodQty} meals</div>
                  <div><strong>Time of rescue:</strong> {r.rescueTime}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {rescues.map((r) => (
            <Marker key={`${r.id}-ngo`} position={r.ngoCoord} icon={ngoIcon}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div><strong>Name:</strong> {r.ngoName}</div>
                  <div><strong>Status:</strong> {r.status === "active" ? "Active" : "Completed"}</div>
                  <div><strong>Food quantity:</strong> {r.foodQty} meals</div>
                  <div><strong>Time of rescue:</strong> {r.rescueTime}</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {completedRescues.map((r) => (
            <Polyline
              key={`${r.id}-completed-line`}
              positions={[r.donorCoord, r.ngoCoord]}
              pathOptions={{
                color: "hsl(var(--success))",
                opacity: 0.4,
                weight: 3,
                dashArray: "5 8",
              }}
            />
          ))}

          {activeRescues.map((r, idx) => {
            const phase = ((tick * 0.08 + idx * 0.3) % 1 + 1) % 1;
            const pos = interpolate(r.donorCoord, r.ngoCoord, phase);
            return (
              <Marker key={`${r.id}-car`} position={pos} icon={carIcon}>
                <Popup>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> Delivery Vehicle {idx + 1}</div>
                    <div><strong>Status:</strong> Active</div>
                    <div><strong>Food quantity:</strong> {r.foodQty} meals</div>
                    <div><strong>Time of rescue:</strong> {r.rescueTime}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">🍱 Donor</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">🏠 NGO</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">🚗 Active delivery</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">⋯ Completed route</span>
      </div>
    </section>
  );
};

export default ImpactRescueMap;

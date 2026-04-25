import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import { areaName, AreaId } from "@/lib/data";
import { AREA_COORDS, KATHMANDU_CENTER } from "@/lib/mapData";

export interface VolunteerRouteStop {
  name: string;
  area: AreaId;
  kind: "pickup" | "drop";
  meals: number;
}

interface Props {
  volunteerName: string;
  stops: VolunteerRouteStop[];
  completedStops: Record<number, boolean>;
}

const currentIcon = divIcon({
  className: "emoji-marker-wrap",
  html: '<div class="emoji-marker emoji-current">📍</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const stopIcon = (idx: number, done: boolean) =>
  divIcon({
    className: "emoji-marker-wrap",
    html: `<div class="map-number-marker ${done ? "done" : ""}">${idx + 1}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const VolunteerRouteMap = ({ volunteerName, stops, completedStops }: Props) => {
  if (stops.length === 0) return null;

  const currentLocation = AREA_COORDS[stops[0].area];

  return (
    <section className="panel p-5 md:p-6 border border-primary/25" style={{ boxShadow: "var(--shadow-card)" }}>
      <h3 className="font-display text-2xl font-semibold mb-1">Optimized Route Map</h3>
      <p className="text-sm text-muted-foreground mb-4">{volunteerName}'s active rescue route</p>

      <div className="overflow-hidden rounded-2xl border border-primary/20 h-[320px] md:h-[400px]">
        <MapContainer center={KATHMANDU_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          <Marker position={currentLocation} icon={currentIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{volunteerName}</strong><br />
                Status: Active<br />
                Current location
              </div>
            </Popup>
          </Marker>

          {stops.map((s, i) => {
            const done = !!completedStops[i];
            const address = `${areaName(s.area)}, Kathmandu`;
            return (
              <Marker key={`${s.name}-${i}`} position={AREA_COORDS[s.area]} icon={stopIcon(i, done)}>
                <Popup>
                  <div className="space-y-1 text-sm">
                    <div><strong>Name:</strong> {s.name}</div>
                    <div><strong>Address:</strong> {address}</div>
                    <div><strong>Food quantity:</strong> {s.meals} meals</div>
                    <div><strong>Label:</strong> {s.kind === "pickup" ? "Pickup" : "Dropoff"}</div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {stops.slice(0, -1).map((s, i) => {
            const next = stops[i + 1];
            const faded = !!completedStops[i];
            return (
              <Polyline
                key={`seg-${i}`}
                positions={[AREA_COORDS[s.area], AREA_COORDS[next.area]]}
                pathOptions={{
                  color: "hsl(var(--primary))",
                  weight: 4,
                  opacity: faded ? 0.2 : 0.8,
                }}
              />
            );
          })}
        </MapContainer>
      </div>
    </section>
  );
};

export default VolunteerRouteMap;

import { MapContainer, Marker, Popup, Polyline, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import { areaName, NGOS } from "@/lib/data";
import { AREA_COORDS, DEMO_COORDS, KATHMANDU_CENTER } from "@/lib/mapData";

const donorIcon = divIcon({
  className: "emoji-marker-wrap",
  html: '<div class="emoji-marker emoji-donor">🍱</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const ngoIcon = divIcon({
  className: "emoji-marker-wrap",
  html: '<div class="emoji-marker emoji-ngo">🏠</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const donors = [
  { id: "d-thamel", name: "Thamel Bento Hub", area: "thamel", coord: DEMO_COORDS.thamel, meals: 26 },
  { id: "d-baneshwor", name: "Baneshwor Family Diner", area: "baneshwor", coord: DEMO_COORDS.baneshwor, meals: 18 },
  { id: "d-patan", name: "Patan Courtyard Kitchen", area: "lalitpur", coord: DEMO_COORDS.patan, meals: 22 },
] as const;

const routes = [
  { donorId: "d-thamel", ngoId: "ngo-a" },
  { donorId: "d-baneshwor", ngoId: "ngo-b" },
  { donorId: "d-patan", ngoId: "ngo-c" },
];

const RescueMap = () => {
  return (
    <section className="panel p-5 md:p-6 border border-primary/20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-3xl font-semibold">Rescue Network Map</h2>
          <p className="text-sm text-muted-foreground">Live donor and NGO points across Kathmandu Valley</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="chip">{donors.length} active donors</span>
          <span className="chip">{NGOS.length} NGOs</span>
        </div>
      </div>

      <div className="h-[360px] md:h-[420px] overflow-hidden rounded-2xl border border-primary/20 shadow-inner">
        <MapContainer center={KATHMANDU_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

          {routes.map((r) => {
            const donor = donors.find((d) => d.id === r.donorId);
            const ngo = NGOS.find((n) => n.id === r.ngoId);
            if (!donor || !ngo) return null;
            return (
              <Polyline
                key={`${r.donorId}-${r.ngoId}`}
                positions={[donor.coord, AREA_COORDS[ngo.area]]}
                pathOptions={{ color: "hsl(var(--primary))", weight: 3.5, opacity: 0.55, dashArray: "6 7" }}
              />
            );
          })}

          {donors.map((donor) => (
            <Marker key={donor.id} position={donor.coord} icon={donorIcon}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">{donor.name}</div>
                  <div>Type: Donor</div>
                  <div>Area: {areaName(donor.area)}</div>
                  <div>Food ready: {donor.meals} meals</div>
                </div>
              </Popup>
            </Marker>
          ))}

          {NGOS.map((ngo) => (
            <Marker key={ngo.id} position={AREA_COORDS[ngo.area]} icon={ngoIcon}>
              <Popup>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">{ngo.name}</div>
                  <div>Type: NGO</div>
                  <div>Area: {areaName(ngo.area)}</div>
                  <div>Capacity: {ngo.capacity} meals</div>
                  <div>Contact: {ngo.contact}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">🍱 Donor kitchens</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">🏠 NGO centers</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1">⋯ Active rescue lanes</span>
      </div>
    </section>
  );
};

export default RescueMap;

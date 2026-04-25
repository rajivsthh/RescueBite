import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import { areaName, NGOS } from "@/lib/data";
import { AREA_COORDS, KATHMANDU_CENTER } from "@/lib/mapData";

const ngoIcon = divIcon({
  className: "emoji-marker-wrap",
  html: '<div class="emoji-marker emoji-ngo">🏠</div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const RescueMap = () => {
  return (
    <section className="panel p-5 md:p-6 border border-primary/20">
      <div className="mb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">Rescue Map</h2>
          <p className="text-sm text-muted-foreground">NGO pickup points across Kathmandu Valley</p>
        </div>
      </div>

      <div className="h-[320px] md:h-[380px] overflow-hidden rounded-2xl border border-primary/20 shadow-inner">
        <MapContainer center={KATHMANDU_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />

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
    </section>
  );
};

export default RescueMap;

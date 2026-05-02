import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { divIcon } from "leaflet";
import { areaName, NGOS } from "@/lib/data";
import { AREA_COORDS, KATHMANDU_CENTER } from "@/lib/mapData";

const ngoIcon = divIcon({
  className: "marker-wrap",
  html: '<div class="marker marker-ngo"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const RescueMap = () => {
  return (
    <section className="rescue-card p-5 md:p-6">
      <div className="mb-4">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-semibold">Rescue Map</h2>
          <p className="text-sm text-muted-foreground">NGO pickup points across Kathmandu Valley</p>
        </div>
      </div>

      <div className="h-[320px] md:h-[380px] overflow-hidden rounded-2xl">
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

      <div className="map-legend">
        <div className="legend-item"><span className="legend-dot ngo" /> NGO</div>
        <div className="legend-item"><span className="legend-dot restaurant" /> Restaurant</div>
        <div className="legend-item"><span className="legend-dot event" /> Event</div>
      </div>
    </section>
  );
};

export default RescueMap;

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import { areaName, AreaId, NGOS } from "@/lib/data";

const KATHMANDU_CENTER: LatLngExpression = [27.7172, 85.324];

const AREA_COORDS: Record<AreaId, LatLngExpression> = {
  thamel: [27.7154, 85.3123],
  baneshwor: [27.6882, 85.335],
  lalitpur: [27.671, 85.324],
  kirtipur: [27.6792, 85.2756],
  bhaktapur: [27.671, 85.4298],
};

const ngoIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RescueMap = () => {
  return (
    <div className="panel p-4 md:p-5">
      <div className="mb-3">
        <h2 className="font-display text-2xl font-semibold">Live Rescue Map</h2>
        <p className="text-sm text-muted-foreground">NGO pickup points across Kathmandu Valley</p>
      </div>

      <div className="h-[320px] overflow-hidden rounded-xl border border-border">
        <MapContainer center={KATHMANDU_CENTER} zoom={12} scrollWheelZoom className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {NGOS.map((ngo) => (
            <Marker key={ngo.id} position={AREA_COORDS[ngo.area]} icon={ngoIcon}>
              <Popup>
                <div className="space-y-1">
                  <div className="font-semibold">{ngo.name}</div>
                  <div>Area: {areaName(ngo.area)}</div>
                  <div>Capacity: {ngo.capacity} meals</div>
                  <div>Contact: {ngo.contact}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default RescueMap;

import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import CitizenLayout from "./CitizenLayout";

const demoLocations = [
  { position: [12.9716, 77.5946] as [number, number], title: "Blocked drain · Market Street", color: "#dc2626" },
  { position: [12.9762, 77.5993] as [number, number], title: "Overflowing drain · Lake View Road", color: "#d97706" },
  { position: [12.9679, 77.5895] as [number, number], title: "Cleaning completed · Park Avenue", color: "#059669" },
];

export default function NearbyMapPage() {
  return (
    <CitizenLayout title="Nearby drainage map" description="Explore sample drainage reports and completed work on an interactive map.">
      <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        Demo map: these sample points are illustrative and are not live citizen reports. Map tiles are provided by OpenStreetMap.
      </div>
      <MapContainer
        center={[12.9716, 77.5946]}
        zoom={14}
        scrollWheelZoom
        aria-label="Map showing illustrative drainage reports"
        className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm sm:h-[560px]"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {demoLocations.map((issue) => (
          <CircleMarker
            key={issue.title}
            center={issue.position}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: issue.color,
              fillOpacity: 1,
            }}
          >
            <Popup>{issue.title}</Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-red-600" /> Needs attention</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-amber-600" /> Under review</span>
        <span className="inline-flex items-center gap-2"><i className="h-3 w-3 rounded-full bg-emerald-600" /> Work completed</span>
      </div>
    </CitizenLayout>
  );
}

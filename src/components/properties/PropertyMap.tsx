'use client'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useEffect } from 'react';

// Fix for Leaflet default icons in Next.js
const customIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function PropertyMap({ lat, lng, title }: { lat: number, lng: number, title: string }) {
  useEffect(() => {
    const href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.crossOrigin = '';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div className="h-[450px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white">
      <MapContainer 
        center={[lat, lng]} 
        zoom={14} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Clean high-end map style
          attribution='&copy; OpenStreetMap'
        />
        <Marker position={[lat, lng]} icon={customIcon}>
          <Popup className="font-bebas text-lg">{title}</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
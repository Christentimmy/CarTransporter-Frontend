import { useEffect, useRef } from "react";

// Add Leaflet types
declare global {
  interface Window {
    L: any;
  }
}

interface AuctionMapProps {
  pickupLocation: {
    coordinates: number[]; // [longitude, latitude]
    address?: string;
  };
  deliveryLocation: {
    coordinates: number[]; // [longitude, latitude]
    address?: string;
  };
  className?: string;
}

export const AuctionMap = ({ pickupLocation, deliveryLocation, className = "" }: AuctionMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || !pickupLocation.coordinates || !deliveryLocation.coordinates) return;

    const [pickupLng, pickupLat] = pickupLocation.coordinates;
    const [deliveryLng, deliveryLat] = deliveryLocation.coordinates;

    // Initialize map
    const map = window.L.map(mapRef.current, {
      center: [(pickupLat + deliveryLat) / 2, (pickupLng + deliveryLng) / 2],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Add tile layer using LocationIQ
    window.L.tileLayer(
      `https://tiles.locationiq.com/v2/streets/r/{z}/{x}/{y}.png?key=${import.meta.env.VITE_LOCATIONIQ_ACCESS_TOKEN}`,
      {
        maxZoom: 18,
        attribution: '© <a href="https://locationiq.com/">LocationIQ</a>',
      }
    ).addTo(map);

    // Create custom icons
    const pickupIcon = window.L.divIcon({
      html: `
        <div style="
          background-color: #22c55e;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    const deliveryIcon = window.L.divIcon({
      html: `
        <div style="
          background-color: #ef4444;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        ">
          <div style="
            width: 8px;
            height: 8px;
            background-color: white;
            border-radius: 50%;
          "></div>
        </div>
      `,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    // Add markers
    const pickupMarker = window.L.marker([pickupLat, pickupLng], { icon: pickupIcon })
      .bindPopup(`<strong>Pickup:</strong><br>${pickupLocation.address || 'Pickup Location'}`)
      .addTo(map);

    const deliveryMarker = window.L.marker([deliveryLat, deliveryLng], { icon: deliveryIcon })
      .bindPopup(`<strong>Delivery:</strong><br>${deliveryLocation.address || 'Delivery Location'}`)
      .addTo(map);

    // Draw polyline between points
    const polyline = window.L.polyline(
      [[pickupLat, pickupLng], [deliveryLat, deliveryLng]],
      {
        color: '#3b82f6',
        weight: 3,
        opacity: 0.7,
        dashArray: '10, 10',
      }
    ).addTo(map);

    // Fit map to show both markers
    const group = new window.L.featureGroup([pickupMarker, deliveryMarker, polyline]);
    map.fitBounds(group.getBounds().pad(0.1));

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [pickupLocation, deliveryLocation]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-64 rounded-lg overflow-hidden ${className}`}
      style={{ minHeight: '256px' }}
    />
  );
};

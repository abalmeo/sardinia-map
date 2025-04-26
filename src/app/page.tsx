"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent } from "@/components/ui/card";

const locations = [
  { name: "La Pelosa (Stintino)", lat: 40.9592, lng: 8.2262 },
  { name: "Cala Mariolu (Golfo di Orosei)", lat: 40.1291, lng: 9.6496 },
  { name: "Spiaggia del Principe (Costa Smeralda)", lat: 41.1158, lng: 9.5384 },
  { name: "Berchida Beach (East Coast)", lat: 40.4869, lng: 9.7870 },
  { name: "Piscinni Beach (Southwest)", lat: 38.8733, lng: 8.8417 },
];

export default function SardiniaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
    });

    loader.load().then(() => {
      if (mapRef.current) {
        const mapInstance = new google.maps.Map(mapRef.current, {
          center: { lat: 40.0, lng: 9.0 },
          zoom: 7,
        });

        locations.forEach((location) => {
          new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstance,
            title: location.name,
          });
        });

        setMap(mapInstance);
      }
    });
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 p-4">
      <Card>
        <CardContent>
          <h1 className="text-2xl font-bold mb-4">Sardinia Beaches Map</h1>
          <div ref={mapRef} className="w-full h-[600px] rounded-2xl shadow-md" />
        </CardContent>
      </Card>
    </div>
  );
}

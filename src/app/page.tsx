"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Card, CardContent } from "@/components/ui/card";

const beaches = [
  { name: "La Pelosa (Stintino)", lat: 40.9592, lng: 8.2262 },
  { name: "Cala Mariolu (Golfo di Orosei)", lat: 40.1291, lng: 9.6496 },
  { name: "Spiaggia del Principe (Costa Smeralda)", lat: 41.1158, lng: 9.5384 },
  { name: "Berchida Beach (East Coast)", lat: 40.4869, lng: 9.7870 },
  { name: "Piscinni Beach (Southwest)", lat: 38.8733, lng: 8.8417 },
];

const cities = [
  { name: "Alghero", lat: 40.5589, lng: 8.3197, description: "Historic city with Catalan influences" },
  { name: "Cagliari", lat: 39.2238, lng: 9.1217, description: "Island's capital with vibrant culture" },
  { name: "Olbia", lat: 40.9234, lng: 9.4980, description: "Gateway to Costa Smeralda" },
  { name: "Santa Teresa di Gallura", lat: 41.2389, lng: 9.1892, description: "Charming town with stunning sea views" },
];

const restaurants = [
  { name: "Culurgiones", lat: 40.5589, lng: 8.3197, description: "Stuffed pasta with potato, mint, and cheese" },
  { name: "Porceddu", lat: 39.2238, lng: 9.1217, description: "Traditional roasted suckling pig" },
  { name: "Fregola", lat: 40.9234, lng: 9.4980, description: "Toasted semolina pasta with seafood" },
  { name: "Seadas", lat: 41.2389, lng: 9.1892, description: "Fried pastry with cheese and honey" },
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
          zoom: 8,
          minZoom: 7,
          maxZoom: 15,
        });

        // Add beach markers
        beaches.forEach((location) => {
          new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstance,
            title: location.name,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            },
          });
        });

        // Add city markers
        cities.forEach((location) => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstance,
            title: location.name,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            },
          });

          // Add info window for cities
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${location.name}</strong><br>${location.description}</div>`,
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
          });
        });

        // Add restaurant markers
        restaurants.forEach((location) => {
          const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: mapInstance,
            title: location.name,
            icon: {
              url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
              scaledSize: new google.maps.Size(32, 32),
            },
          });

          // Add info window for restaurants
          const infoWindow = new google.maps.InfoWindow({
            content: `<div><strong>${location.name}</strong><br>${location.description}</div>`,
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
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
          <h1 className="text-2xl font-bold mb-4">Sardinia Map</h1>
          <div className="flex gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
              <span>Beaches</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <span>Cities</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <span>Restaurants</span>
            </div>
          </div>
          <div ref={mapRef} className="w-full h-[600px] rounded-2xl shadow-md" />
        </CardContent>
      </Card>
    </div>
  );
}

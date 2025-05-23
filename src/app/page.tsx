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

interface Restaurant {
  name: string;
  lat: number;
  lng: number;
  description: string;
  placeId: string;
  rating?: number;
  photos?: google.maps.places.PlacePhoto[];
}

export default function SardiniaMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [restaurantPhotos, setRestaurantPhotos] = useState<{[key: string]: string}>({});

  const searchRestaurants = (service: google.maps.places.PlacesService, location: { lat: number; lng: number }) => {
    const request = {
      location: new google.maps.LatLng(location.lat, location.lng),
      radius: 500, // Search within 500 meters
      type: 'restaurant',
      keyword: 'sardinian cuisine'
    };

    service.nearbySearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        // Get details for each restaurant
        results.forEach(place => {
          if (!place.place_id) return;
          
          service.getDetails(
            {
              placeId: place.place_id,
              fields: ['name', 'geometry', 'photos', 'rating', 'reviews', 'formatted_address']
            },
            (placeDetails, detailsStatus) => {
              if (detailsStatus === google.maps.places.PlacesServiceStatus.OK && placeDetails) {
                const location = placeDetails.geometry?.location;
                if (!location) return;

                const newRestaurant: Restaurant = {
                  name: placeDetails.name || '',
                  lat: location.lat(),
                  lng: location.lng(),
                  description: placeDetails.formatted_address || '',
                  placeId: placeDetails.place_id || '',
                  rating: placeDetails.rating,
                  photos: placeDetails.photos
                };

                setRestaurants(prev => [...prev, newRestaurant]);

                // Store the photo URL if available
                if (placeDetails.photos && placeDetails.photos.length > 0) {
                  const photoUrl = placeDetails.photos[0].getUrl({ maxWidth: 400, maxHeight: 300 });
                  setRestaurantPhotos(prev => ({
                    ...prev,
                    [placeDetails.place_id || '']: photoUrl
                  }));
                }
              }
            }
          );
        });
      }
    });
  };

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      version: "weekly",
      libraries: ["places"],
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
            content: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0;">${location.name}</h3>
                <p style="margin: 0;">${location.description}</p>
              </div>
            `,
          });

          marker.addListener("click", () => {
            infoWindow.open(mapInstance, marker);
          });
        });

        // Create Places service
        const service = new google.maps.places.PlacesService(mapInstance);

        // Search for restaurants in each city
        cities.forEach(city => {
          searchRestaurants(service, { lat: city.lat, lng: city.lng });
        });

        setMap(mapInstance);
      }
    });
  }, []);

  // Add restaurant markers when restaurants are found
  useEffect(() => {
    if (map && restaurants.length > 0) {
      restaurants.forEach((location) => {
        const marker = new google.maps.Marker({
          position: { lat: location.lat, lng: location.lng },
          map: map,
          title: location.name,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
            scaledSize: new google.maps.Size(32, 32),
          },
        });

        // Add info window for restaurants with image
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 300px;">
              <h3 style="margin: 0 0 5px 0;">${location.name}</h3>
              ${restaurantPhotos[location.placeId] ? 
                `<img src="${restaurantPhotos[location.placeId]}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin-bottom: 5px;">` 
                : ''}
              <p style="margin: 0 0 5px 0;">${location.description}</p>
              ${location.rating ? 
                `<div style="display: flex; align-items: center; gap: 5px;">
                  <span style="color: #FFB800;">${'★'.repeat(Math.round(location.rating))}${'☆'.repeat(5 - Math.round(location.rating))}</span>
                  <span>(${location.rating.toFixed(1)})</span>
                </div>`
                : ''}
            </div>
          `,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [map, restaurants, restaurantPhotos]);

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

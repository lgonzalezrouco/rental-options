/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { MapContainer, TileLayer, Marker, Popup, GeoJSON, Circle, Pane } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { PathOptions } from 'leaflet';
import { useEffect, useState } from 'react';
import { MapIcon } from '@heroicons/react/24/outline';
import { Property } from '@/types/property';

// Create icons for normal and highlighted states
const createIcon = (highlighted: boolean) => L.divIcon({
  className: 'custom-div-icon',
  html: `<div style="
    background-color: ${highlighted ? '#EF4444' : '#3B82F6'}; 
    width: ${highlighted ? '24px' : '16px'}; 
    height: ${highlighted ? '24px' : '16px'}; 
    border-radius: 50%; 
    border: 2px solid white;
    transition: all 0.2s ease-in-out;
  "></div>`,
  iconSize: highlighted ? [24, 24] : [16, 16],
  iconAnchor: highlighted ? [12, 12] : [8, 8]
});

// Barcelona coordinates
const BARCELONA_CENTER = {
  lat: 41.3851,
  lng: 2.1734
};

type MapProps = {
  properties: Property[];
  hoveredPropertyId?: number | null;
  onMarkerHover?: (propertyId: number | null) => void;
}

export default function Map({ properties, hoveredPropertyId, onMarkerHover }: MapProps) {
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [showDistricts, setShowDistricts] = useState(true);

  useEffect(() => {
    fetch('/districts.geojson')
      .then(response => response.json())
      .then(data => setGeoJsonData(data))
      .catch(error => console.error('Error loading GeoJSON:', error));
  }, []);

  // Style for the GeoJSON layer
  const geoJSONStyle: PathOptions = {
    fillColor: '#22c55e',
    weight: 1.5,
    opacity: 0.8,
    color: '#16a34a',
    dashArray: '3, 6',
    fillOpacity: 0.1,
    pane: 'districtsPane'
  };

  // Hover effect handlers
  const onEachFeature = (feature: any, layer: any) => {
    if (feature.properties && feature.properties.NOM) {
      const popupContent = `
        <div style="
          font-family: Arial, sans-serif;
          font-size: 14px;
          font-weight: 600;
          background: white;
          padding: 8px 12px;
        ">
          ${feature.properties.NOM}
        </div>
      `;
      
      layer.bindPopup(popupContent, {
        closeButton: true
      });
    }

    // Add hover effects
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#4b5563',
          dashArray: '',
          fillOpacity: 0.2
        });
        layer.bringToFront();
      },
      mouseout: (e: any) => {
        const layer = e.target;
        layer.setStyle(geoJSONStyle);
      },
      click: (e: any) => {
        const layer = e.target;
        layer.openPopup();
      }
    });
  };

  return (
    <div className="relative h-full z-0">
      {/* Single Toggle Button for Districts */}
      <div className="absolute top-4 right-4 z-[100]">
        <button
          onClick={() => setShowDistricts(!showDistricts)}
          className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
            showDistricts 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 hover:bg-gray-200'
          }`}
          title="Toggle districts"
        >
          <MapIcon className="h-5 w-5" />
          <span className="text-sm">Districts</span>
        </button>
      </div>

      <MapContainer
        center={[BARCELONA_CENTER.lat, BARCELONA_CENTER.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <Pane name="districtsPane" style={{ zIndex: 200 }} className="z-0" />
        <Pane name="markersPane" style={{ zIndex: 400 }} className="z-0" />
        <Pane name="approximatedPane" style={{ zIndex: 300 }} className="z-0" />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Districts Layer */}
        {showDistricts && geoJsonData && (
          <GeoJSON 
            data={geoJsonData} 
            style={geoJSONStyle}
            onEachFeature={onEachFeature}
          />
        )}

        {/* Properties Layer - Always visible */}
        {properties.map((property) => {
          const isHovered = hoveredPropertyId === property.id;
          
          return (
            <div key={property.id}>
              {/* Only show marker for non-approximated locations */}
              {!property.is_approximated && (
                <Marker 
                  position={[property.latitude, property.longitude]}
                  icon={createIcon(isHovered)}
                  eventHandlers={{
                    mouseover: () => onMarkerHover?.(property.id),
                    mouseout: () => onMarkerHover?.(null),
                  }}
                  pane="markersPane"
                >
                  <Popup>
                    <div className="text-sm">
                      <h3 className="font-semibold">{property.name}</h3>
                      <p className="font-bold">${property.price_per_month}/month</p>
                      <p>{property.location}</p>
                      <p>{property.rooms} rooms • {property.bathrooms} baths</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Circle for approximated locations */}
              {property.is_approximated && (
                <Circle
                  center={[property.latitude, property.longitude]}
                  radius={200}
                  pathOptions={{
                    color: isHovered ? '#EF4444' : '#3B82F6',
                    fillColor: isHovered ? '#EF4444' : '#3B82F6',
                    fillOpacity: isHovered ? 0.2 : 0.1,
                    weight: isHovered ? 2 : 1
                  }}
                  eventHandlers={{
                    mouseover: () => onMarkerHover?.(property.id),
                    mouseout: () => onMarkerHover?.(null),
                  }}
                  pane="approximatedPane"
                >
                  <Popup
                    position={[property.latitude, property.longitude]}
                  >
                    <div className="text-sm">
                      <h3 className="font-semibold">{property.name}</h3>
                      <p className="font-bold">${property.price_per_month}/month</p>
                      <p>{property.location}</p>
                      <p>{property.rooms} rooms • {property.bathrooms} baths</p>
                      <p className="text-red-600 text-xs mt-1">* Approximate location</p>
                    </div>
                  </Popup>
                </Circle>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
} 
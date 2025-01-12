'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import PropertyCard from '@/components/PropertyCard';
import AddPropertyModal from '@/components/AddPropertyModal';
import EditPropertyModal from '@/components/EditPropertyModal';
import { Property } from '@/types/property';
import { PlusIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Dynamic import of map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
});

export default function Home() {
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await fetch('/api/properties');
      if (!response.ok) throw new Error('Failed to fetch properties');
      const data = await response.json();
      setPropertiesList(data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (propertyId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');
      
      const updatedProperty = await response.json();
      setPropertiesList(currentProperties => 
        currentProperties.map(property => 
          property.id === propertyId ? updatedProperty : property
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (property: Property) => {
    setSelectedProperty(property);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (propertyId: number, data: { service_charge: number; cleaning_fee: number; commission_charge: number }) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update property');
      
      const updatedProperty = await response.json();
      setPropertiesList(currentProperties =>
        currentProperties.map(property =>
          property.id === propertyId ? updatedProperty : property
        )
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating property:', error);
    }
  };

  const handleExport = () => {
    // Define CSV headers
    const headers = [
      'ID',
      'Name',
      'Price per Month',
      'Location',
      'Rooms',
      'Bathrooms',
      'Square Meters',
      'Status',
      'Service Charge',
      'Cleaning Fee',
      'Commission Charge',
      'Is Approximated',
      'URL'
    ].join(',');

    // Convert properties to CSV rows
    const csvRows = propertiesList.map(property => {
      const values = [
        property.id,
        `"${property.name}"`,
        property.price_per_month,
        `"${property.location}"`,
        property.rooms,
        property.bathrooms,
        property.square_meters,
        `"${property.status}"`,
        property.service_charge,
        property.cleaning_fee,
        property.commission_charge,
        property.is_approximated,
        `"${property.url}"`
      ];
      return values.join(',');
    });

    // Combine headers and rows
    const csvContent = [headers, ...csvRows].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'properties.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddProperty = () => {
    setIsAddModalOpen(true);
  };

  const handleAddPropertySubmit = async (data: Omit<Property, 'id' | 'status' | 'service_charge' | 'cleaning_fee' | 'commission_charge' | 'latitude' | 'longitude'>) => {
    try {
      const response = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to add property');
      
      const addedProperty = await response.json();
      setPropertiesList(current => [...current, addedProperty]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding property:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">Loading properties...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <div className="w-full lg:w-2/5 h-1/2 lg:h-screen flex flex-col bg-white">
        <div className="sticky top-0 z-10 bg-white p-4 shadow-sm flex-shrink-0">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Available Properties</h1>
            <div className="flex gap-3">
              <button
                onClick={handleAddProperty}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Property</span>
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                title="Export properties"
              >
                <ArrowDownTrayIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {propertiesList.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onMouseEnter={() => setHoveredPropertyId(property.id)}
                onMouseLeave={() => setHoveredPropertyId(null)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="w-full lg:w-3/5 h-1/2 lg:h-screen">
        <MapWithNoSSR 
          properties={propertiesList} 
          hoveredPropertyId={hoveredPropertyId}
        />
      </div>

      {/* Add Property Modal */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPropertySubmit}
      />

      {/* Edit Property Modal */}
      <EditPropertyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        property={selectedProperty}
      />
    </div>
  );
}

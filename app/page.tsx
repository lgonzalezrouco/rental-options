'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import PropertyCard from '@/components/PropertyCard';
import AddPropertyModal from '@/components/AddPropertyModal';
import EditPropertyModal from '@/components/EditPropertyModal';
import { Property } from '@/types/property';
import { PlusIcon, ArrowDownTrayIcon, FunnelIcon } from '@heroicons/react/24/outline';
import FilterPanel from '@/components/FilterPanel';
import FilterChips from '@/components/FilterChips';
import { ActiveFilters } from '@/types/property';
import { StatusOption } from '@/types/property';

// Dynamic import of map component to avoid SSR issues
const MapWithNoSSR = dynamic(() => import('../components/Map'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-100 flex items-center justify-center">Loading map...</div>
});

// Add statusOptions constant
const statusOptions: StatusOption[] = [
  {
    value: 'available',
    label: 'Available',
    color: 'text-green-700',
    bgColor: 'bg-green-100'
  },
  {
    value: 'contacted',
    label: 'Contacted',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100'
  },
  {
    value: 'talking',
    label: 'Talking',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100'
  },
  {
    value: 'reserved',
    label: 'Reserved',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100'
  },
  {
    value: 'deleted',
    label: 'Deleted',
    color: 'text-red-700',
    bgColor: 'bg-red-100'
  }
];

export default function Home() {
  const [propertiesList, setPropertiesList] = useState<Property[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredPropertyId, setHoveredPropertyId] = useState<number | null>(null);
  const propertyRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    sort: null,
    filters: {
      status: [],
      showFavorites: false,
      rooms: null
    }
  });

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

  const handleEditSubmit = async (propertyId: number, data: { service_charge?: number | null; cleaning_fee?: number | null; commission_charge?: number | null }) => {
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
      'URL',
      'Is Favorite'
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
        property.square_meters !== null ? property.square_meters : 'Not set',
        `"${property.status}"`,
        property.service_charge !== null ? property.service_charge : 'Not set',
        property.cleaning_fee !== null ? property.cleaning_fee : 'Not set',
        property.commission_charge !== null ? property.commission_charge : 'Not set',
        property.is_approximated ? 'Yes' : 'No',
        `"${property.url}"`,
        property.is_favorite ? 'Yes' : 'No'
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

  const handleAddPropertySubmit = async (data: Omit<Property, 'id' | 'status' | 'service_charge' | 'cleaning_fee' | 'commission_charge' | 'latitude' | 'longitude' | 'is_favorite'>) => {
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

  const handleMapMarkerHover = (propertyId: number | null) => {
    setHoveredPropertyId(propertyId);
    if (propertyId && propertyRefs.current[propertyId]) {
      propertyRefs.current[propertyId]?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const handleFavoriteToggle = async (propertyId: number, isFavorite: boolean) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: isFavorite }),
      });

      if (!response.ok) throw new Error('Failed to update favorite status');
      
      const updatedProperty = await response.json();
      setPropertiesList(currentProperties =>
        currentProperties.map(property =>
          property.id === propertyId ? updatedProperty : property
        )
      );
    } catch (error) {
      console.error('Error updating favorite status:', error);
    }
  };

  const handleFiltersApply = (newFilters: ActiveFilters) => {
    setActiveFilters(newFilters);
  };

  const handleRemoveFilter = (type: 'sort' | 'status' | 'favorites' | 'rooms') => {
    setActiveFilters(prev => {
      if (type === 'sort') {
        return { ...prev, sort: null };
      }
      if (type === 'status') {
        return { ...prev, filters: { ...prev.filters, status: [] } };
      }
      if (type === 'favorites') {
        return { ...prev, filters: { ...prev.filters, showFavorites: false } };
      }
      if (type === 'rooms') {
        return { ...prev, filters: { ...prev.filters, rooms: null } };
      }
      return prev;
    });
  };

  const handleRemoveStatusFilter = (status: string) => {
    setActiveFilters(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        status: prev.filters.status.filter(s => s !== status)
      }
    }));
  };

  const filteredAndSortedProperties = useMemo(() => {
    let result = [...propertiesList];

    // Apply filters
    if (activeFilters.filters.showFavorites) {
      result = result.filter(p => p.is_favorite);
    }
    if (activeFilters.filters.status.length > 0) {
      result = result.filter(p => activeFilters.filters.status.includes(p.status));
    }
    if (activeFilters.filters.rooms) {
      result = result.filter(p => p.rooms === activeFilters.filters.rooms);
    }

    // Apply sort
    if (activeFilters.sort) {
      const { field, direction } = activeFilters.sort;
      result.sort((a, b) => {
        const aValue = a[field];
        const bValue = b[field];
        
        if (direction === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    return result;
  }, [propertiesList, activeFilters]);

  // Fix the type check for filters
  const hasActiveFilters = activeFilters.sort !== null || 
    activeFilters.filters.showFavorites || 
    activeFilters.filters.rooms !== null ||
    activeFilters.filters.status.length > 0;

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
        <div className="sticky top-0 z-10 bg-white shadow-sm flex-shrink-0">
          <div className="p-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-800">Available Properties</h1>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    isFilterPanelOpen || hasActiveFilters
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FunnelIcon className="h-5 w-5" />
                  <span>Filters</span>
                </button>
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

          <FilterPanel
            isOpen={isFilterPanelOpen}
            statusOptions={statusOptions}
            onApply={handleFiltersApply}
            onClose={() => setIsFilterPanelOpen(false)}
            activeFilters={activeFilters}
          />

          <FilterChips
            activeFilters={activeFilters}
            statusOptions={statusOptions}
            onRemoveFilter={handleRemoveFilter}
            onRemoveStatusFilter={handleRemoveStatusFilter}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4 p-4">
            {filteredAndSortedProperties.map((property) => (
              <div
                key={property.id}
                ref={(el) => {
                  if (el) {
                    propertyRefs.current[property.id] = el;
                  }
                }}
              >
                <PropertyCard
                  property={property}
                  onStatusChange={handleStatusChange}
                  onEdit={handleEdit}
                  onMouseEnter={() => setHoveredPropertyId(property.id)}
                  onMouseLeave={() => setHoveredPropertyId(null)}
                  isHovered={hoveredPropertyId === property.id}
                  onFavoriteToggle={(isFavorite) => handleFavoriteToggle(property.id, isFavorite)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map section */}
      <div className="w-full lg:w-3/5 h-1/2 lg:h-screen">
        <MapWithNoSSR 
          properties={filteredAndSortedProperties}
          hoveredPropertyId={hoveredPropertyId}
          onMarkerHover={handleMapMarkerHover}
        />
      </div>

      {/* Modals */}
      <AddPropertyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddPropertySubmit}
      />

      <EditPropertyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        property={selectedProperty}
      />
    </div>
  );
}

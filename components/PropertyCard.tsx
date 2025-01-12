'use client';

import { 
  HomeIcon, 
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  SparklesIcon,
  CalculatorIcon,
  PencilSquareIcon,
  MapPinIcon,
  LinkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { PropertyCardProps, StatusOption } from '@/types/property';

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

export default function PropertyCard({ 
  property, 
  onStatusChange, 
  onEdit,
  onMouseEnter,
  onMouseLeave,
  isHovered 
}: PropertyCardProps) {
  const [isFeesOpen, setIsFeesOpen] = useState(false);

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border-2 transition-all duration-200 ${
        isHovered ? 'border-blue-500 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-gray-200'
      }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="p-4">
        {/* Header - Name, Status, and Edit */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <HomeIcon className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">{property.name}</h2>
          </div>
          <div className="flex items-center gap-2">
            <select 
              title="Status"
              className={`px-3 py-1 rounded-full text-sm border-0 cursor-pointer focus:ring-2 focus:ring-offset-2 transition-colors ${
                statusOptions.find(opt => opt.value === property.status)?.bgColor || 'bg-gray-100'
              } ${
                statusOptions.find(opt => opt.value === property.status)?.color || 'text-gray-700'
              }`}
              value={property.status}
              onChange={(e) => onStatusChange(property.id, e.target.value)}
            >
              {statusOptions.map((option) => (
                <option 
                  key={option.value} 
                  value={option.value}
                  className="text-gray-900 bg-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
            <button 
              onClick={() => onEdit(property)}
              className="p-1.5 rounded-full hover:bg-gray-200 transition-colors"
              title="Edit property"
            >
              <PencilSquareIcon className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-2">
          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
            <div>
              <span className="text-2xl font-bold text-blue-600">${property.price_per_month}</span>
              <span className="text-sm font-normal text-gray-600 ml-1">/month</span>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <MapPinIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{property.location}</span>
          </div>

          {/* Rooms */}
          <div className="flex items-center gap-2">
            <BuildingOfficeIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{property.rooms} rooms</span>
          </div>

          {/* Bathrooms */}
          <div className="flex items-center gap-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              strokeWidth={1.5} 
              stroke="currentColor" 
              className="h-4 w-4 text-gray-500"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <span className="text-gray-600">{property.bathrooms} bathrooms</span>
          </div>

          {/* Square Meters */}
          <div className="flex items-center gap-2">
            <ChartBarIcon className="h-4 w-4 text-gray-500" />
            <span className="text-gray-600">{property.square_meters}m²</span>
          </div>

          <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-gray-500" />
              <a 
                href={property.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 hover:underline truncate"
              >
                View listing
              </a>
          </div>

          {/* Additional Fees Section */}
          <div className="mt-4 border-t pt-2">
            <button
              onClick={() => setIsFeesOpen(!isFeesOpen)}
              className="w-full flex items-center justify-between text-gray-600 hover:text-gray-800 transition-colors"
            >
              <span className="text-sm font-medium">Additional Fees</span>
              <ChevronDownIcon 
                className={`h-4 w-4 transition-transform duration-200 ${
                  isFeesOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>
            
            {/* Collapsible Content */}
            <div className={`space-y-2 overflow-hidden transition-all duration-200 ${
              isFeesOpen ? 'max-h-40 mt-2' : 'max-h-0'
            }`}>
              {/* Service Charge */}
              <div className="flex items-center gap-2">
                <WrenchScrewdriverIcon className="h-4 w-4 text-gray-500" />
                <div className="flex justify-between w-full">
                  <span className="text-gray-600">Service Charge</span>
                  <span className="font-medium text-gray-700">${property.service_charge}</span>
                </div>
              </div>

              {/* Cleaning Fee */}
              <div className="flex items-center gap-2">
                <SparklesIcon className="h-4 w-4 text-gray-500" />
                <div className="flex justify-between w-full">
                  <span className="text-gray-600">Cleaning Fee</span>
                  <span className="font-medium text-gray-700">${property.cleaning_fee}</span>
                </div>
              </div>

              {/* Commission */}
              <div className="flex items-center gap-2">
                <CalculatorIcon className="h-4 w-4 text-gray-500" />
                <div className="flex justify-between w-full">
                  <span className="text-gray-600">Commission</span>
                  <span className="font-medium text-gray-700">${property.commission_charge}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
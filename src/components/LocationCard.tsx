import React from 'react';
import { MapPin, Package, ChevronRight } from 'lucide-react';
import type { Location } from '../types';

interface LocationCardProps {
  location: Location;
  onClick: () => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({ location, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 hover:border-blue-300 transform hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <MapPin className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
            </div>
            
            {location.address && (
              <p className="text-sm text-gray-600 mb-3">
                {location.address}
                {location.city && `, ${location.city}`}
                {location.state && `, ${location.state}`}
              </p>
            )}
            
            <div className="flex items-center text-sm text-gray-500">
              <Package className="w-4 h-4 mr-1" />
              <span>{location.assets_count || 0} assets</span>
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
};
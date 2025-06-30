import React, { useState, useEffect } from 'react';
import { MapPin, Package, RefreshCw, Search } from 'lucide-react';
import type { Location } from '../types';
import { snipeAPI } from '../services/snipeApi';
import { LocationCard } from './LocationCard';

interface LocationsListProps {
  onLocationSelect: (location: Location) => void;
}

export const LocationsList: React.FC<LocationsListProps> = ({ onLocationSelect }) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await snipeAPI.getLocations();
      setLocations(response.rows || []);
    } catch (err) {
      setError('Failed to load locations. Please check your API configuration.');
      console.error('Failed to load locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalAssets = locations.reduce((sum, location) => sum + (location.assets_count || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading locations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <div className="text-red-600 mb-4">
          <MapPin className="w-12 h-12 mx-auto mb-2" />
          <p className="font-medium">{error}</p>
        </div>
        <button
          onClick={loadLocations}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Inventory System</h1>
            <p className="text-gray-600">Manage and verify your asset locations</p>
          </div>
          <button
            onClick={loadLocations}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Locations</p>
                <p className="text-2xl font-bold text-blue-700">{locations.length}</p>
              </div>
              <MapPin className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Total Assets</p>
                <p className="text-2xl font-bold text-green-700">{totalAssets}</p>
              </div>
              <Package className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">Avg per Location</p>
                <p className="text-2xl font-bold text-purple-700">
                  {locations.length > 0 ? Math.round(totalAssets / locations.length) : 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Locations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map(location => (
          <LocationCard
            key={location.id}
            location={location}
            onClick={() => onLocationSelect(location)}
          />
        ))}
      </div>

      {filteredLocations.length === 0 && searchTerm && (
        <div className="text-center py-12">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No locations found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};
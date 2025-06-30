import React, { useState } from 'react';
import type { Location } from './types';
import { LocationsList } from './components/LocationsList';
import { InventorySession } from './components/InventorySession';

function App() {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleBackToLocations = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="py-8 px-4 sm:px-6 lg:px-8">
        {selectedLocation ? (
          <InventorySession
            location={selectedLocation}
            onBack={handleBackToLocations}
          />
        ) : (
          <LocationsList onLocationSelect={handleLocationSelect} />
        )}
      </div>
    </div>
  );
}

export default App;
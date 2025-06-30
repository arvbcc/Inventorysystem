import React, { useState, useEffect } from 'react';
import { ArrowLeft, Scan, Package, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import type { Location, Asset, ScannedAsset, AssetDiscrepancy } from '../types';
import { snipeAPI } from '../services/snipeApi';
import { Scanner } from './Scanner';
import { AssetCard } from './AssetCard';

interface InventorySessionProps {
  location: Location;
  onBack: () => void;
}

export const InventorySession: React.FC<InventorySessionProps> = ({ location, onBack }) => {
  const [registeredAssets, setRegisteredAssets] = useState<Asset[]>([]);
  const [scannedAssets, setScannedAssets] = useState<ScannedAsset[]>([]);
  const [discrepancies, setDiscrepancies] = useState<AssetDiscrepancy[]>([]);
  const [loading, setLoading] = useState(true);
  const [scannerActive, setScannerActive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  useEffect(() => {
    loadLocationAssets();
  }, [location.id]);

  useEffect(() => {
    if (sessionStarted) {
      calculateDiscrepancies();
    }
  }, [scannedAssets, registeredAssets, sessionStarted]);

  const loadLocationAssets = async () => {
    try {
      setLoading(true);
      const response = await snipeAPI.getAssetsByLocation(location.id);
      setRegisteredAssets(response.rows || []);
    } catch (error) {
      console.error('Failed to load assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async (code: string) => {
    setScannerActive(false);
    
    // Check if already scanned
    if (scannedAssets.some(sa => sa.code === code)) {
      return;
    }

    try {
      const asset = await snipeAPI.getAssetByTag(code);
      const scannedAsset: ScannedAsset = {
        code,
        timestamp: new Date(),
        asset
      };
      setScannedAssets(prev => [...prev, scannedAsset]);
    } catch (error) {
      // Asset not found in system - add as unexpected
      const scannedAsset: ScannedAsset = {
        code,
        timestamp: new Date()
      };
      setScannedAssets(prev => [...prev, scannedAsset]);
    }
  };

  const calculateDiscrepancies = () => {
    const newDiscrepancies: AssetDiscrepancy[] = [];
    
    // Find missing assets (registered but not scanned)
    registeredAssets.forEach(asset => {
      const isScanned = scannedAssets.some(sa => sa.asset?.asset_tag === asset.asset_tag);
      if (!isScanned) {
        newDiscrepancies.push({ type: 'missing', asset });
      } else {
        newDiscrepancies.push({ type: 'match', asset });
      }
    });

    // Find unexpected assets (scanned but not registered at this location)
    scannedAssets.forEach(scannedAsset => {
      if (!scannedAsset.asset) {
        // Asset not found in system
        newDiscrepancies.push({
          type: 'unexpected',
          asset: {
            id: 0,
            name: 'Unknown Asset',
            asset_tag: scannedAsset.code
          } as Asset,
          scannedCode: scannedAsset.code
        });
      } else if (scannedAsset.asset.location?.id !== location.id) {
        // Asset belongs to different location
        newDiscrepancies.push({
          type: 'unexpected',
          asset: scannedAsset.asset,
          scannedCode: scannedAsset.code
        });
      }
    });

    setDiscrepancies(newDiscrepancies);
  };

  const startSession = () => {
    setSessionStarted(true);
    setScannedAssets([]);
    setDiscrepancies([]);
  };

  const resetSession = () => {
    setSessionStarted(false);
    setScannedAssets([]);
    setDiscrepancies([]);
  };

  const updateAssetLocation = async (assetId: number) => {
    try {
      await snipeAPI.updateAssetLocation(assetId, location.id);
      // Refresh data
      loadLocationAssets();
      calculateDiscrepancies();
    } catch (error) {
      console.error('Failed to update asset location:', error);
    }
  };

  const getDiscrepancyCounts = () => {
    const missing = discrepancies.filter(d => d.type === 'missing').length;
    const unexpected = discrepancies.filter(d => d.type === 'unexpected').length;
    const matches = discrepancies.filter(d => d.type === 'match').length;
    return { missing, unexpected, matches };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading location assets...</p>
        </div>
      </div>
    );
  }

  const { missing, unexpected, matches } = getDiscrepancyCounts();

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{location.name}</h1>
              <p className="text-gray-600">{registeredAssets.length} registered assets</p>
            </div>
          </div>

          {!sessionStarted ? (
            <button
              onClick={startSession}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Package className="w-5 h-5 mr-2" />
              Start Inventory
            </button>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={() => setScannerActive(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Scan className="w-4 h-4 mr-2" />
                Scan Asset
              </button>
              <button
                onClick={resetSession}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {sessionStarted && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Scanned</p>
                  <p className="text-2xl font-bold text-blue-700">{scannedAssets.length}</p>
                </div>
                <Scan className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Matches</p>
                  <p className="text-2xl font-bold text-green-700">{matches}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Missing</p>
                  <p className="text-2xl font-bold text-red-700">{missing}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-600 font-medium">Unexpected</p>
                  <p className="text-2xl font-bold text-amber-700">{unexpected}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assets Grid */}
      {sessionStarted && discrepancies.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Asset Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discrepancies.map((discrepancy, index) => (
              <div key={index} className="relative">
                <AssetCard
                  asset={discrepancy.asset}
                  isHighlighted={true}
                  highlightType={discrepancy.type}
                />
                {discrepancy.type === 'unexpected' && discrepancy.asset.id > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() => updateAssetLocation(discrepancy.asset.id)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Move to This Location
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : !sessionStarted ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Registered Assets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {registeredAssets.map(asset => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Start Scanning</h3>
          <p className="text-gray-600 mb-6">Click "Scan Asset" to begin verifying your inventory</p>
        </div>
      )}

      <Scanner
        isActive={scannerActive}
        onScan={handleScan}
        onClose={() => setScannerActive(false)}
      />
    </div>
  );
};
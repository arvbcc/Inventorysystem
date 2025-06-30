import React from 'react';
import { Package, Tag, Calendar, MapPin } from 'lucide-react';
import type { Asset } from '../types';

interface AssetCardProps {
  asset: Asset;
  showLocation?: boolean;
  isHighlighted?: boolean;
  highlightType?: 'missing' | 'unexpected' | 'match';
}

export const AssetCard: React.FC<AssetCardProps> = ({ 
  asset, 
  showLocation = false, 
  isHighlighted = false,
  highlightType 
}) => {
  const getHighlightColor = () => {
    if (!isHighlighted) return 'border-gray-200';
    
    switch (highlightType) {
      case 'missing':
        return 'border-red-300 bg-red-50';
      case 'unexpected':
        return 'border-amber-300 bg-amber-50';
      case 'match':
        return 'border-green-300 bg-green-50';
      default:
        return 'border-gray-200';
    }
  };

  const getStatusColor = () => {
    switch (asset.status_label?.status_type) {
      case 'deployable':
        return 'bg-green-100 text-green-800';
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'broken':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg border-2 ${getHighlightColor()} p-4 transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <Package className="w-5 h-5 text-gray-600 mr-2" />
          <h4 className="font-medium text-gray-900 truncate">{asset.name}</h4>
        </div>
        
        {asset.status_label && (
          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor()}`}>
            {asset.status_label.name}
          </span>
        )}
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center">
          <Tag className="w-4 h-4 mr-2" />
          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs">
            {asset.asset_tag}
          </span>
        </div>

        {asset.serial && (
          <div className="flex items-center">
            <span className="w-4 h-4 mr-2 flex items-center justify-center text-xs font-bold">#</span>
            <span className="font-mono text-xs">{asset.serial}</span>
          </div>
        )}

        {asset.model?.name && (
          <div className="text-xs text-gray-500">
            {asset.model.name}
          </div>
        )}

        {showLocation && asset.location && (
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="w-3 h-3 mr-1" />
            <span>{asset.location.name}</span>
          </div>
        )}

        {asset.assigned_to && (
          <div className="text-xs text-blue-600">
            Assigned to: {asset.assigned_to.name}
          </div>
        )}
      </div>
    </div>
  );
};
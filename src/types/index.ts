export interface Location {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zip?: string;
  assets_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Asset {
  id: number;
  name: string;
  asset_tag: string;
  serial?: string;
  model?: {
    id: number;
    name: string;
  };
  status_label?: {
    id: number;
    name: string;
    status_type: string;
  };
  assigned_to?: {
    id: number;
    name: string;
    type: string;
  };
  location?: {
    id: number;
    name: string;
  };
  category?: {
    id: number;
    name: string;
  };
  purchase_date?: string;
  purchase_cost?: string;
  notes?: string;
  last_checkout?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScannedAsset {
  code: string;
  timestamp: Date;
  asset?: Asset;
}

export interface AssetDiscrepancy {
  type: 'missing' | 'unexpected' | 'match';
  asset: Asset;
  scannedCode?: string;
}

export interface InventorySession {
  id: string;
  locationId: number;
  startTime: Date;
  endTime?: Date;
  scannedAssets: ScannedAsset[];
  discrepancies: AssetDiscrepancy[];
  status: 'active' | 'completed';
}
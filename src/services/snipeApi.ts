// Snipe-IT API service
class SnipeITAPI {
  private baseUrl: string;
  private apiToken: string;

  constructor(baseUrl: string, apiToken: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.apiToken = apiToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Unable to connect to Snipe-IT server. Please check your network connection and API configuration.');
      }
      throw error;
    }
  }

  async getLocations(): Promise<any> {
    return this.request('/api/v1/locations?limit=500');
  }

  async getLocation(id: number): Promise<any> {
    return this.request(`/api/v1/locations/${id}`);
  }

  async getAssetsByLocation(locationId: number): Promise<any> {
    return this.request(`/api/v1/hardware?location_id=${locationId}&limit=500`);
  }

  async getAssetByTag(assetTag: string): Promise<any> {
    return this.request(`/api/v1/hardware/bytag/${assetTag}`);
  }

  async updateAssetLocation(assetId: number, locationId: number): Promise<any> {
    return this.request(`/api/v1/hardware/${assetId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        rtd_location_id: locationId
      }),
    });
  }

  async bulkUpdateAssets(updates: Array<{ id: number; location_id: number }>): Promise<any> {
    const results = await Promise.allSettled(
      updates.map(update => this.updateAssetLocation(update.id, update.location_id))
    );
    return results;
  }
}

// Mock API for development/fallback
class MockSnipeITAPI {
  private mockLocations = [
    {
      id: 1,
      name: 'Main Office',
      address: '123 Business St',
      city: 'San Francisco',
      state: 'CA',
      assets_count: 45
    },
    {
      id: 2,
      name: 'Warehouse A',
      address: '456 Storage Ave',
      city: 'Oakland',
      state: 'CA',
      assets_count: 78
    },
    {
      id: 3,
      name: 'Remote Office',
      address: '789 Work Blvd',
      city: 'Austin',
      state: 'TX',
      assets_count: 23
    }
  ];

  private mockAssets = [
    {
      id: 1,
      name: 'Dell Laptop #001',
      asset_tag: 'LT001',
      serial: 'DL123456',
      model: { id: 1, name: 'Dell Latitude 7420' },
      status_label: { id: 1, name: 'Ready to Deploy', status_type: 'deployable' },
      location: { id: 1, name: 'Main Office' },
      category: { id: 1, name: 'Laptops' }
    },
    {
      id: 2,
      name: 'Monitor #002',
      asset_tag: 'MN002',
      serial: 'MN789012',
      model: { id: 2, name: 'Dell 24" Monitor' },
      status_label: { id: 1, name: 'Ready to Deploy', status_type: 'deployable' },
      location: { id: 1, name: 'Main Office' },
      category: { id: 2, name: 'Monitors' }
    },
    {
      id: 3,
      name: 'Server Rack #001',
      asset_tag: 'SR001',
      serial: 'SR345678',
      model: { id: 3, name: 'Dell PowerEdge R730' },
      status_label: { id: 2, name: 'Deployed', status_type: 'deployed' },
      location: { id: 2, name: 'Warehouse A' },
      category: { id: 3, name: 'Servers' }
    }
  ];

  async getLocations(): Promise<any> {
    await this.delay(500);
    return {
      total: this.mockLocations.length,
      rows: this.mockLocations
    };
  }

  async getAssetsByLocation(locationId: number): Promise<any> {
    await this.delay(300);
    const assets = this.mockAssets.filter(asset => asset.location.id === locationId);
    return {
      total: assets.length,
      rows: assets
    };
  }

  async getAssetByTag(assetTag: string): Promise<any> {
    await this.delay(200);
    const asset = this.mockAssets.find(a => a.asset_tag === assetTag);
    if (!asset) {
      throw new Error('Asset not found');
    }
    return asset;
  }

  async updateAssetLocation(assetId: number, locationId: number): Promise<any> {
    await this.delay(300);
    const asset = this.mockAssets.find(a => a.id === assetId);
    if (asset) {
      const location = this.mockLocations.find(l => l.id === locationId);
      if (location) {
        asset.location = { id: locationId, name: location.name };
      }
    }
    return { status: 'success' };
  }

  async bulkUpdateAssets(updates: Array<{ id: number; location_id: number }>): Promise<any> {
    await this.delay(300);
    return updates.map(() => ({ status: 'success' }));
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Smart API client that falls back to mock when real API is unavailable
class SmartSnipeITAPI {
  private realAPI: SnipeITAPI;
  private mockAPI: MockSnipeITAPI;
  private useMock: boolean;
  private apiAvailable: boolean | null = null;

  constructor() {
    const apiUrl = import.meta.env.VITE_SNIPE_API_URL || '/api';
    const apiToken = import.meta.env.VITE_SNIPE_API_TOKEN || '';
    this.useMock = import.meta.env.VITE_USE_MOCK_API === 'true' || !apiToken;
    
    this.realAPI = new SnipeITAPI(apiUrl, apiToken);
    this.mockAPI = new MockSnipeITAPI();
  }

  private async checkAPIAvailability(): Promise<boolean> {
    if (this.useMock) return false;
    if (this.apiAvailable !== null) return this.apiAvailable;

    try {
      await this.realAPI.getLocations();
      this.apiAvailable = true;
      return true;
    } catch (error) {
      console.warn('Real API unavailable, falling back to mock API:', error);
      this.apiAvailable = false;
      return false;
    }
  }

  private async getAPI() {
    const isAvailable = await this.checkAPIAvailability();
    return isAvailable ? this.realAPI : this.mockAPI;
  }

  async getLocations(): Promise<any> {
    const api = await this.getAPI();
    return api.getLocations();
  }

  async getLocation(id: number): Promise<any> {
    const api = await this.getAPI();
    return api.getLocation ? api.getLocation(id) : { id, name: `Location ${id}` };
  }

  async getAssetsByLocation(locationId: number): Promise<any> {
    const api = await this.getAPI();
    return api.getAssetsByLocation(locationId);
  }

  async getAssetByTag(assetTag: string): Promise<any> {
    const api = await this.getAPI();
    return api.getAssetByTag(assetTag);
  }

  async updateAssetLocation(assetId: number, locationId: number): Promise<any> {
    const api = await this.getAPI();
    return api.updateAssetLocation(assetId, locationId);
  }

  async bulkUpdateAssets(updates: Array<{ id: number; location_id: number }>): Promise<any> {
    const api = await this.getAPI();
    return api.bulkUpdateAssets(updates);
  }
}

// Export the smart API client
export const snipeAPI = new SmartSnipeITAPI();
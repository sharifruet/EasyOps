import api from './api';

export interface Product {
  id: string;
  organizationId: string;
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  brand?: string;
  manufacturer?: string;
  productType: string;
  itemType: string;
  costPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  currency: string;
  uom: string;
  reorderLevel: number;
  minStockLevel: number;
  maxStockLevel?: number;
  safetyStock: number;
  trackInventory: boolean;
  trackBatch: boolean;
  trackSerial: boolean;
  isActive: boolean;
  status: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Warehouse {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  warehouseType: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  status: string;
}

export interface Stock {
  id: string;
  organizationId: string;
  productId: string;
  warehouseId: string;
  quantityOnHand: number;
  quantityAllocated: number;
  quantityAvailable: number;
  quantityOnOrder: number;
  unitCost: number;
  totalCost: number;
  status: string;
  batchNumber?: string;
  expiryDate?: string;
}

export interface StockMovement {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  transactionType: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  sourceType?: string;
  status: string;
}

const inventoryService = {
  // Products
  async getProducts(organizationId: string, activeOnly?: boolean): Promise<Product[]> {
    const response = await api.get('/api/inventory/products', {
      params: { organizationId, activeOnly }
    });
    return response.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/api/inventory/products/${id}`);
    return response.data;
  },

  async getProductBySku(organizationId: string, sku: string): Promise<Product> {
    const response = await api.get(`/api/inventory/products/sku/${sku}`, {
      params: { organizationId }
    });
    return response.data;
  },

  async searchProducts(organizationId: string, keyword: string): Promise<Product[]> {
    const response = await api.get('/api/inventory/products/search', {
      params: { organizationId, keyword }
    });
    return response.data;
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const response = await api.post('/api/inventory/products', product);
    return response.data;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const response = await api.put(`/api/inventory/products/${id}`, product);
    return response.data;
  },

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/api/inventory/products/${id}`);
  },

  // Warehouses
  async getWarehouses(organizationId: string, activeOnly?: boolean): Promise<Warehouse[]> {
    const response = await api.get('/api/inventory/warehouses', {
      params: { organizationId, activeOnly }
    });
    return response.data;
  },

  async getWarehouseById(id: string): Promise<Warehouse> {
    const response = await api.get(`/api/inventory/warehouses/${id}`);
    return response.data;
  },

  async createWarehouse(warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.post('/api/inventory/warehouses', warehouse);
    return response.data;
  },

  async updateWarehouse(id: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
    const response = await api.put(`/api/inventory/warehouses/${id}`, warehouse);
    return response.data;
  },

  // Stock
  async getStock(organizationId: string, productId?: string, warehouseId?: string): Promise<Stock[]> {
    const response = await api.get('/api/inventory/stock', {
      params: { organizationId, productId, warehouseId }
    });
    return response.data;
  },

  async getAvailableQuantity(productId: string, warehouseId: string): Promise<number> {
    const response = await api.get('/api/inventory/stock/available', {
      params: { productId, warehouseId }
    });
    return response.data.availableQuantity;
  },

  async getLowStockItems(organizationId: string): Promise<Stock[]> {
    const response = await api.get('/api/inventory/stock/low-stock', {
      params: { organizationId }
    });
    return response.data;
  },

  async getOutOfStockItems(organizationId: string): Promise<Stock[]> {
    const response = await api.get('/api/inventory/stock/out-of-stock', {
      params: { organizationId }
    });
    return response.data;
  },

  async receiveStock(request: {
    organizationId: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    unitCost: number;
    sourceType?: string;
    sourceId?: string;
    createdBy?: string;
  }): Promise<Stock> {
    const response = await api.post('/api/inventory/stock/receive', request);
    return response.data;
  },

  async issueStock(request: {
    organizationId: string;
    productId: string;
    warehouseId: string;
    quantity: number;
    sourceType?: string;
    sourceId?: string;
    createdBy?: string;
  }): Promise<Stock> {
    const response = await api.post('/api/inventory/stock/issue', request);
    return response.data;
  },

  async adjustStock(request: {
    organizationId: string;
    productId: string;
    warehouseId: string;
    newQuantity: number;
    reason: string;
    createdBy?: string;
  }): Promise<Stock> {
    const response = await api.post('/api/inventory/stock/adjust', request);
    return response.data;
  }
};

export default inventoryService;


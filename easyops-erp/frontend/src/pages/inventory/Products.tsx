import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Product } from '../../services/inventoryService';
import './Inventory.css';

const Products: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [currentOrganizationId, showActiveOnly]);

  const loadProducts = async () => {
    console.log('loadProducts called, currentOrganizationId:', currentOrganizationId);
    if (!currentOrganizationId) {
      console.log('No organization ID, returning early');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Calling inventoryService.getProducts with orgId:', currentOrganizationId);
      const data = await inventoryService.getProducts(currentOrganizationId, showActiveOnly);
      console.log('Products loaded:', data);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!currentOrganizationId || !searchTerm) return;
    
    try {
      setLoading(true);
      const data = await inventoryService.searchProducts(currentOrganizationId, searchTerm);
      setProducts(data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowDialog(true);
  };

  const handleSave = async (product: Partial<Product>) => {
    try {
      if (product.id) {
        await inventoryService.updateProduct(product.id, product);
      } else {
        await inventoryService.createProduct({ ...product, organizationId: currentOrganizationId });
      }
      setShowDialog(false);
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  const filteredProducts = searchTerm
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products;

  if (loading) return <div className="loading">Loading products...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Products</h1>
        <button className="btn-primary" onClick={() => { setSelectedProduct(null); setShowDialog(true); }}>
          + Add Product
        </button>
      </div>

      <div className="filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showActiveOnly}
            onChange={(e) => setShowActiveOnly(e.target.checked)}
          />
          Active Only
        </label>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Type</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>UOM</th>
              <th>Min Stock</th>
              <th>Reorder Level</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>{product.sku}</td>
                <td>{product.name}</td>
                <td>{product.categoryId || '-'}</td>
                <td>{product.productType}</td>
                <td>${product.costPrice.toFixed(2)}</td>
                <td>${product.sellingPrice.toFixed(2)}</td>
                <td>{product.uom}</td>
                <td>{product.minStockLevel}</td>
                <td>{product.reorderLevel}</td>
                <td>
                  <span className={`status-badge ${product.status.toLowerCase()}`}>
                    {product.status}
                  </span>
                </td>
                <td>
                  <button className="btn-small" onClick={() => handleEdit(product)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="no-data">No products found</div>
        )}
      </div>

      {/* Product Dialog */}
      {showDialog && (
        <div className="modal-overlay" onClick={() => setShowDialog(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="close-btn" onClick={() => setShowDialog(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                const productData = {
                  sku: formData.get('sku') as string,
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  costPrice: parseFloat(formData.get('costPrice') as string) || 0,
                  sellingPrice: parseFloat(formData.get('sellingPrice') as string) || 0,
                  uom: formData.get('uom') as string,
                  reorderLevel: parseFloat(formData.get('reorderLevel') as string) || 0,
                  minStockLevel: parseFloat(formData.get('minStockLevel') as string) || 0,
                  productType: formData.get('productType') as string,
                  status: formData.get('status') as string,
                };
                handleSave(productData);
              }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>SKU *</label>
                    <input 
                      name="sku" 
                      defaultValue={selectedProduct?.sku || ''} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Name *</label>
                    <input 
                      name="name" 
                      defaultValue={selectedProduct?.name || ''} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    name="description" 
                    defaultValue={selectedProduct?.description || ''} 
                    rows={3}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Cost Price *</label>
                    <input 
                      name="costPrice" 
                      type="number" 
                      step="0.01" 
                      defaultValue={selectedProduct?.costPrice || ''} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Selling Price *</label>
                    <input 
                      name="sellingPrice" 
                      type="number" 
                      step="0.01" 
                      defaultValue={selectedProduct?.sellingPrice || ''} 
                      required 
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>UOM *</label>
                    <select name="uom" defaultValue={selectedProduct?.uom || 'PCS'} required>
                      <option value="PCS">PCS</option>
                      <option value="BOX">BOX</option>
                      <option value="REAM">REAM</option>
                      <option value="HOUR">HOUR</option>
                      <option value="LICENSE">LICENSE</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Product Type *</label>
                    <select name="productType" defaultValue={selectedProduct?.productType || 'GOODS'} required>
                      <option value="GOODS">GOODS</option>
                      <option value="SERVICE">SERVICE</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Reorder Level</label>
                    <input 
                      name="reorderLevel" 
                      type="number" 
                      step="0.01" 
                      defaultValue={selectedProduct?.reorderLevel || ''} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Stock Level</label>
                    <input 
                      name="minStockLevel" 
                      type="number" 
                      step="0.01" 
                      defaultValue={selectedProduct?.minStockLevel || ''} 
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" defaultValue={selectedProduct?.status || 'ACTIVE'}>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn-secondary" onClick={() => setShowDialog(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {selectedProduct ? 'Update Product' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;


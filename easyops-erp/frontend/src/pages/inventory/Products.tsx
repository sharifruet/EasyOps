import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Product } from '../../services/inventoryService';
import './Inventory.css';

const Products: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [currentOrganization, showActiveOnly]);

  const loadProducts = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const data = await inventoryService.getProducts(currentOrganization.id, showActiveOnly);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!currentOrganization?.id || !searchTerm) return;
    
    try {
      setLoading(true);
      const data = await inventoryService.searchProducts(currentOrganization.id, searchTerm);
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
        await inventoryService.createProduct({ ...product, organizationId: currentOrganization?.id });
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
    </div>
  );
};

export default Products;


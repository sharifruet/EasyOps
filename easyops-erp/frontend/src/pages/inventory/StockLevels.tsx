import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Stock, Warehouse, Product } from '../../services/inventoryService';
import './Inventory.css';

const StockLevels: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [stock, setStock] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: '',
    warehouseId: '',
    currentQuantity: 0,
    newQuantity: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    loadWarehouses();
    loadProducts();
  }, [currentOrganizationId]);

  useEffect(() => {
    loadStock();
  }, [currentOrganizationId, selectedWarehouse, showLowStockOnly]);

  const loadWarehouses = async () => {
    console.log('loadWarehouses called, currentOrganizationId:', currentOrganizationId);
    if (!currentOrganizationId) {
      console.log('No organization ID, returning early');
      return;
    }
    
    try {
      const data = await inventoryService.getWarehouses(currentOrganizationId, true);
      console.log('Warehouses loaded:', data);
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  };

  const loadStock = async () => {
    console.log('loadStock called, currentOrganizationId:', currentOrganizationId);
    if (!currentOrganizationId) {
      console.log('No organization ID, returning early');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      let data;
      if (showLowStockOnly) {
        console.log('Loading low stock items...');
        data = await inventoryService.getLowStockItems(currentOrganizationId);
      } else {
        console.log('Loading all stock...');
        data = await inventoryService.getStock(
          currentOrganizationId,
          undefined,
          selectedWarehouse || undefined
        );
      }
      console.log('Stock loaded:', data);
      setStock(data);
    } catch (error) {
      console.error('Failed to load stock:', error);
      alert('Failed to load stock levels');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    if (!currentOrganizationId) return;
    
    try {
      const data = await inventoryService.getProducts(currentOrganizationId);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleAdjustStock = (stockItem: Stock) => {
    setAdjustmentForm({
      productId: stockItem.productId,
      warehouseId: stockItem.warehouseId,
      currentQuantity: stockItem.quantityOnHand,
      newQuantity: stockItem.quantityOnHand.toString(),
      reason: '',
      notes: ''
    });
    setShowAdjustModal(true);
  };

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !user?.id) return;

    try {
      await inventoryService.adjustStock({
        organizationId: currentOrganizationId,
        productId: adjustmentForm.productId,
        warehouseId: adjustmentForm.warehouseId,
        newQuantity: parseFloat(adjustmentForm.newQuantity),
        reason: adjustmentForm.reason,
        createdBy: user.id
      });

      setShowAdjustModal(false);
      setAdjustmentForm({
        productId: '',
        warehouseId: '',
        currentQuantity: 0,
        newQuantity: '',
        reason: '',
        notes: ''
      });
      loadStock();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Failed to adjust stock');
    }
  };

  const getStockStatusClass = (item: Stock): string => {
    if (item.quantityAvailable <= 0) return 'critical';
    if (item.quantityAvailable <= 5) return 'low';
    if (item.quantityAvailable <= 10) return 'warning';
    return 'good';
  };

  if (loading) return <div className="loading">Loading stock levels...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Stock Levels</h1>
        <button className="btn-primary" onClick={() => setShowAdjustModal(true)}>
          Adjust Stock
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Warehouse:</label>
          <select 
            value={selectedWarehouse} 
            onChange={(e) => setSelectedWarehouse(e.target.value)}
          >
            <option value="">All Warehouses</option>
            {warehouses.map(wh => (
              <option key={wh.id} value={wh.id}>{wh.name}</option>
            ))}
          </select>
        </div>
        
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showLowStockOnly}
            onChange={(e) => setShowLowStockOnly(e.target.checked)}
          />
          Show Low Stock Only
        </label>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Warehouse</th>
              <th>On Hand</th>
              <th>Allocated</th>
              <th>Available</th>
              <th>On Order</th>
              <th>Unit Cost</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stock.map((item) => (
              <tr key={item.id} className={getStockStatusClass(item)}>
                <td>{item.productId.substring(0, 8)}...</td>
                <td>{item.warehouseId.substring(0, 8)}...</td>
                <td>{item.quantityOnHand.toFixed(2)}</td>
                <td>{item.quantityAllocated.toFixed(2)}</td>
                <td><strong>{item.quantityAvailable.toFixed(2)}</strong></td>
                <td>{item.quantityOnOrder.toFixed(2)}</td>
                <td>${item.unitCost.toFixed(2)}</td>
                <td>${item.totalCost.toFixed(2)}</td>
                <td>
                  <span className={`stock-status ${getStockStatusClass(item)}`}>
                    {item.quantityAvailable <= 0 ? 'OUT' : 
                     item.quantityAvailable <= 5 ? 'CRITICAL' :
                     item.quantityAvailable <= 10 ? 'LOW' : 'OK'}
                  </span>
                </td>
                <td>{new Date(item.updatedAt || '').toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn-small btn-primary" 
                    onClick={() => handleAdjustStock(item)}
                    title="Adjust Stock"
                  >
                    📊 Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {stock.length === 0 && (
          <div className="no-data">No stock records found</div>
        )}
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Items</h3>
          <div className="summary-value">{stock.length}</div>
        </div>
        <div className="summary-card critical">
          <h3>Out of Stock</h3>
          <div className="summary-value">{stock.filter(s => s.quantityAvailable <= 0).length}</div>
        </div>
        <div className="summary-card warning">
          <h3>Low Stock</h3>
          <div className="summary-value">{stock.filter(s => s.quantityAvailable > 0 && s.quantityAvailable <= 10).length}</div>
        </div>
        <div className="summary-card">
          <h3>Total Value</h3>
          <div className="summary-value">
            ${stock.reduce((sum, s) => sum + s.totalCost, 0).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showAdjustModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Adjust Stock</h2>
              <button className="modal-close" onClick={() => setShowAdjustModal(false)}>×</button>
            </div>
            <form onSubmit={handleAdjustmentSubmit} className="adjustment-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="productId">Product</label>
                  <select
                    id="productId"
                    value={adjustmentForm.productId}
                    onChange={(e) => {
                      const product = products.find(p => p.id === e.target.value);
                      const stockItem = stock.find(s => s.productId === e.target.value && s.warehouseId === adjustmentForm.warehouseId);
                      setAdjustmentForm({
                        ...adjustmentForm,
                        productId: e.target.value,
                        currentQuantity: stockItem?.quantityOnHand || 0,
                        newQuantity: stockItem?.quantityOnHand.toString() || '0'
                      });
                    }}
                    required
                  >
                    <option value="">Select Product</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="warehouseId">Warehouse</label>
                  <select
                    id="warehouseId"
                    value={adjustmentForm.warehouseId}
                    onChange={(e) => {
                      const stockItem = stock.find(s => s.productId === adjustmentForm.productId && s.warehouseId === e.target.value);
                      setAdjustmentForm({
                        ...adjustmentForm,
                        warehouseId: e.target.value,
                        currentQuantity: stockItem?.quantityOnHand || 0,
                        newQuantity: stockItem?.quantityOnHand.toString() || '0'
                      });
                    }}
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name} ({warehouse.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="currentQuantity">Current Quantity</label>
                  <input
                    type="number"
                    id="currentQuantity"
                    value={adjustmentForm.currentQuantity}
                    disabled
                    className="disabled-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="newQuantity">New Quantity *</label>
                  <input
                    type="number"
                    id="newQuantity"
                    value={adjustmentForm.newQuantity}
                    onChange={(e) => setAdjustmentForm({...adjustmentForm, newQuantity: e.target.value})}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Reason for Adjustment *</label>
                <select
                  id="reason"
                  value={adjustmentForm.reason}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, reason: e.target.value})}
                  required
                >
                  <option value="">Select Reason</option>
                  <option value="PHYSICAL_COUNT">Physical Count</option>
                  <option value="DAMAGE">Damage</option>
                  <option value="THEFT">Theft</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="RETURN">Return</option>
                  <option value="ADJUSTMENT">General Adjustment</option>
                  <option value="CORRECTION">Correction</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm({...adjustmentForm, notes: e.target.value})}
                  rows={3}
                  placeholder="Additional details about this adjustment..."
                />
              </div>

              <div className="adjustment-summary">
                <h4>Adjustment Summary</h4>
                <div className="summary-row">
                  <span>Current Quantity:</span>
                  <span>{adjustmentForm.currentQuantity}</span>
                </div>
                <div className="summary-row">
                  <span>New Quantity:</span>
                  <span>{adjustmentForm.newQuantity || '0'}</span>
                </div>
                <div className="summary-row">
                  <span>Difference:</span>
                  <span className={parseFloat(adjustmentForm.newQuantity || '0') - adjustmentForm.currentQuantity >= 0 ? 'positive' : 'negative'}>
                    {parseFloat(adjustmentForm.newQuantity || '0') - adjustmentForm.currentQuantity >= 0 ? '+' : ''}
                    {(parseFloat(adjustmentForm.newQuantity || '0') - adjustmentForm.currentQuantity).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAdjustModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockLevels;


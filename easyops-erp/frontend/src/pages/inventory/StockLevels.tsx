import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Stock, Warehouse } from '../../services/inventoryService';
import './Inventory.css';

const StockLevels: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [stock, setStock] = useState<Stock[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  useEffect(() => {
    loadWarehouses();
  }, [currentOrganization]);

  useEffect(() => {
    loadStock();
  }, [currentOrganization, selectedWarehouse, showLowStockOnly]);

  const loadWarehouses = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      const data = await inventoryService.getWarehouses(currentOrganization.id, true);
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  };

  const loadStock = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      let data;
      if (showLowStockOnly) {
        data = await inventoryService.getLowStockItems(currentOrganization.id);
      } else {
        data = await inventoryService.getStock(
          currentOrganization.id,
          undefined,
          selectedWarehouse || undefined
        );
      }
      setStock(data);
    } catch (error) {
      console.error('Failed to load stock:', error);
      alert('Failed to load stock levels');
    } finally {
      setLoading(false);
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
        <button className="btn-primary" onClick={() => alert('Adjust Stock functionality coming soon')}>
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
    </div>
  );
};

export default StockLevels;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import inventoryService, { Warehouse } from '../../services/inventoryService';
import './Inventory.css';

const Warehouses: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarehouses();
  }, [currentOrganization]);

  const loadWarehouses = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const data = await inventoryService.getWarehouses(currentOrganization.id);
      setWarehouses(data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
      alert('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading warehouses...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Warehouses</h1>
        <button className="btn-primary" onClick={() => alert('Add Warehouse functionality coming soon')}>
          + Add Warehouse
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Type</th>
              <th>City</th>
              <th>State</th>
              <th>Country</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((warehouse) => (
              <tr key={warehouse.id}>
                <td><strong>{warehouse.code}</strong></td>
                <td>{warehouse.name}</td>
                <td>{warehouse.warehouseType}</td>
                <td>{warehouse.city || '-'}</td>
                <td>{warehouse.state || '-'}</td>
                <td>{warehouse.country || '-'}</td>
                <td>{warehouse.phone || '-'}</td>
                <td>
                  <span className={`status-badge ${warehouse.status.toLowerCase()}`}>
                    {warehouse.status}
                  </span>
                </td>
                <td>
                  {warehouse.isActive ? (
                    <span className="badge-success">Yes</span>
                  ) : (
                    <span className="badge-danger">No</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {warehouses.length === 0 && (
          <div className="no-data">No warehouses found</div>
        )}
      </div>
    </div>
  );
};

export default Warehouses;


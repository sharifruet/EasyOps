import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Inventory.css';

interface SerialNumber {
  id: string;
  productId: string;
  serialNumber: string;
  warehouseId?: string;
  batchNumber?: string;
  purchaseDate?: string;
  warrantyStartDate?: string;
  warrantyEndDate?: string;
  status: string;
  customerId?: string;
  saleDate?: string;
  saleInvoiceNumber?: string;
}

const SerialTracking: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [serials, setSerials] = useState<SerialNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadSerials();
  }, [currentOrganization, filterStatus]);

  const loadSerials = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const params: any = { organizationId: currentOrganization.id };
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.get('/api/inventory/serials', { params });
      setSerials(response.data);
    } catch (error) {
      console.error('Failed to load serial numbers:', error);
      alert('Failed to load serial numbers');
    } finally {
      setLoading(false);
    }
  };

  const isUnderWarranty = (warrantyEndDate?: string): boolean => {
    if (!warrantyEndDate) return false;
    return new Date(warrantyEndDate) > new Date();
  };

  if (loading) return <div className="loading">Loading serial numbers...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Serial Number Tracking</h1>
        <button className="btn-primary" onClick={() => alert('Register Serial functionality coming soon')}>
          + Register Serial
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="IN_STOCK">In Stock</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="SOLD">Sold</option>
            <option value="IN_SERVICE">In Service</option>
            <option value="RETURNED">Returned</option>
            <option value="SCRAPPED">Scrapped</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Serial Number</th>
              <th>Product ID</th>
              <th>Batch</th>
              <th>Purchase Date</th>
              <th>Warranty End</th>
              <th>Warranty Status</th>
              <th>Status</th>
              <th>Customer</th>
              <th>Sale Date</th>
              <th>Invoice</th>
            </tr>
          </thead>
          <tbody>
            {serials.map((serial) => (
              <tr key={serial.id}>
                <td><strong>{serial.serialNumber}</strong></td>
                <td>{serial.productId.substring(0, 8)}...</td>
                <td>{serial.batchNumber || '-'}</td>
                <td>{serial.purchaseDate ? new Date(serial.purchaseDate).toLocaleDateString() : '-'}</td>
                <td>{serial.warrantyEndDate ? new Date(serial.warrantyEndDate).toLocaleDateString() : '-'}</td>
                <td>
                  {serial.warrantyEndDate && (
                    <span className={`warranty-badge ${isUnderWarranty(serial.warrantyEndDate) ? 'valid' : 'expired'}`}>
                      {isUnderWarranty(serial.warrantyEndDate) ? 'Valid' : 'Expired'}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${serial.status.toLowerCase().replace('_', '-')}`}>
                    {serial.status.replace('_', ' ')}
                  </span>
                </td>
                <td>{serial.customerId ? serial.customerId.substring(0, 8) + '...' : '-'}</td>
                <td>{serial.saleDate ? new Date(serial.saleDate).toLocaleDateString() : '-'}</td>
                <td>{serial.saleInvoiceNumber || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {serials.length === 0 && (
          <div className="no-data">No serial numbers found</div>
        )}
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Serials</h3>
          <div className="summary-value">{serials.length}</div>
        </div>
        <div className="summary-card">
          <h3>In Stock</h3>
          <div className="summary-value">
            {serials.filter(s => s.status === 'IN_STOCK').length}
          </div>
        </div>
        <div className="summary-card warning">
          <h3>Allocated</h3>
          <div className="summary-value">
            {serials.filter(s => s.status === 'ALLOCATED').length}
          </div>
        </div>
        <div className="summary-card">
          <h3>Sold</h3>
          <div className="summary-value">
            {serials.filter(s => s.status === 'SOLD').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SerialTracking;


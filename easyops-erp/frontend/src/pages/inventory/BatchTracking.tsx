import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Inventory.css';

interface BatchLot {
  id: string;
  organizationId: string;
  productId: string;
  batchNumber: string;
  lotNumber?: string;
  manufactureDate?: string;
  expiryDate?: string;
  initialQuantity: number;
  currentQuantity: number;
  status: string;
  poNumber?: string;
  notes?: string;
}

const BatchTracking: React.FC = () => {
  const { currentOrganization } = useAuth();
  const [batches, setBatches] = useState<BatchLot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExpiringOnly, setShowExpiringOnly] = useState(false);

  useEffect(() => {
    loadBatches();
  }, [currentOrganization, showExpiringOnly]);

  const loadBatches = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const endpoint = showExpiringOnly 
        ? `/api/inventory/batches/expiring?organizationId=${currentOrganization.id}`
        : `/api/inventory/batches?organizationId=${currentOrganization.id}`;
      
      const response = await api.get(endpoint);
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to load batches:', error);
      alert('Failed to load batch information');
    } finally {
      setLoading(false);
    }
  };

  const getDaysUntilExpiry = (expiryDate: string): number => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatusClass = (expiryDate?: string): string => {
    if (!expiryDate) return '';
    const days = getDaysUntilExpiry(expiryDate);
    if (days < 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'good';
  };

  if (loading) return <div className="loading">Loading batches...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Batch/Lot Tracking</h1>
        <button className="btn-primary" onClick={() => alert('Add Batch functionality coming soon')}>
          + Register Batch
        </button>
      </div>

      <div className="filters">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showExpiringOnly}
            onChange={(e) => setShowExpiringOnly(e.target.checked)}
          />
          Show Expiring Batches Only (Next 30 Days)
        </label>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Batch Number</th>
              <th>Lot Number</th>
              <th>Product ID</th>
              <th>Manufacture Date</th>
              <th>Expiry Date</th>
              <th>Days Until Expiry</th>
              <th>Initial Qty</th>
              <th>Current Qty</th>
              <th>PO Number</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {batches.map((batch) => (
              <tr key={batch.id} className={getExpiryStatusClass(batch.expiryDate)}>
                <td><strong>{batch.batchNumber}</strong></td>
                <td>{batch.lotNumber || '-'}</td>
                <td>{batch.productId.substring(0, 8)}...</td>
                <td>{batch.manufactureDate ? new Date(batch.manufactureDate).toLocaleDateString() : '-'}</td>
                <td>{batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : '-'}</td>
                <td>
                  {batch.expiryDate ? (
                    <span className={`expiry-badge ${getExpiryStatusClass(batch.expiryDate)}`}>
                      {getDaysUntilExpiry(batch.expiryDate)} days
                    </span>
                  ) : '-'}
                </td>
                <td>{batch.initialQuantity.toFixed(2)}</td>
                <td><strong>{batch.currentQuantity.toFixed(2)}</strong></td>
                <td>{batch.poNumber || '-'}</td>
                <td>
                  <span className={`status-badge ${batch.status.toLowerCase()}`}>
                    {batch.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {batches.length === 0 && (
          <div className="no-data">No batches found</div>
        )}
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Batches</h3>
          <div className="summary-value">{batches.length}</div>
        </div>
        <div className="summary-card critical">
          <h3>Expired</h3>
          <div className="summary-value">
            {batches.filter(b => b.expiryDate && getDaysUntilExpiry(b.expiryDate) < 0).length}
          </div>
        </div>
        <div className="summary-card warning">
          <h3>Expiring Soon</h3>
          <div className="summary-value">
            {batches.filter(b => b.expiryDate && getDaysUntilExpiry(b.expiryDate) >= 0 && getDaysUntilExpiry(b.expiryDate) <= 30).length}
          </div>
        </div>
        <div className="summary-card">
          <h3>Active</h3>
          <div className="summary-value">
            {batches.filter(b => b.status === 'ACTIVE').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTracking;


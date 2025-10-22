import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Inventory.css';

interface StockCount {
  id: string;
  countNumber: string;
  countDate: string;
  countType: string;
  warehouseId: string;
  status: string;
  totalVarianceValue: number;
  countedBy?: string;
  approvedBy?: string;
  completedAt?: string;
}

const StockCounting: React.FC = () => {
  const { currentOrganization, user } = useAuth();
  const [counts, setCounts] = useState<StockCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadCounts();
  }, [currentOrganization, filterStatus]);

  const loadCounts = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const params: any = { organizationId: currentOrganization.id };
      if (filterStatus) params.status = filterStatus;
      
      const response = await api.get('/api/inventory/stock-counts', { params });
      setCounts(response.data);
    } catch (error) {
      console.error('Failed to load stock counts:', error);
      alert('Failed to load stock counts');
    } finally {
      setLoading(false);
    }
  };

  const handleStartCount = async (countId: string) => {
    if (!user?.id) return;
    
    try {
      await api.post(`/api/inventory/stock-counts/${countId}/start`, null, {
        params: { userId: user.id }
      });
      loadCounts();
      alert('Stock count started successfully');
    } catch (error) {
      console.error('Failed to start count:', error);
      alert('Failed to start count');
    }
  };

  const handleCompleteCount = async (countId: string) => {
    try {
      await api.post(`/api/inventory/stock-counts/${countId}/complete`);
      loadCounts();
      alert('Stock count completed');
    } catch (error) {
      console.error('Failed to complete count:', error);
      alert('Failed to complete count');
    }
  };

  const handleApproveCount = async (countId: string) => {
    if (!user?.id) return;
    
    if (!confirm('This will apply adjustments to stock levels. Are you sure?')) return;
    
    try {
      await api.post(`/api/inventory/stock-counts/${countId}/approve`, null, {
        params: { approvedBy: user.id }
      });
      loadCounts();
      alert('Stock count approved and adjustments applied');
    } catch (error) {
      console.error('Failed to approve count:', error);
      alert('Failed to approve count');
    }
  };

  if (loading) return <div className="loading">Loading stock counts...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Stock Counting</h1>
        <button className="btn-primary" onClick={() => alert('Create Count functionality coming soon')}>
          + New Stock Count
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="APPROVED">Approved</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Count Number</th>
              <th>Count Type</th>
              <th>Count Date</th>
              <th>Warehouse ID</th>
              <th>Status</th>
              <th>Variance Value</th>
              <th>Completed At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {counts.map((count) => (
              <tr key={count.id}>
                <td><strong>{count.countNumber}</strong></td>
                <td>{count.countType}</td>
                <td>{new Date(count.countDate).toLocaleDateString()}</td>
                <td>{count.warehouseId.substring(0, 8)}...</td>
                <td>
                  <span className={`status-badge ${count.status.toLowerCase().replace('_', '-')}`}>
                    {count.status.replace('_', ' ')}
                  </span>
                </td>
                <td className={count.totalVarianceValue < 0 ? 'text-danger' : count.totalVarianceValue > 0 ? 'text-success' : ''}>
                  ${Math.abs(count.totalVarianceValue).toFixed(2)}
                </td>
                <td>{count.completedAt ? new Date(count.completedAt).toLocaleString() : '-'}</td>
                <td>
                  {count.status === 'SCHEDULED' && (
                    <button className="btn-small" onClick={() => handleStartCount(count.id)}>Start</button>
                  )}
                  {count.status === 'IN_PROGRESS' && (
                    <button className="btn-small" onClick={() => handleCompleteCount(count.id)}>Complete</button>
                  )}
                  {count.status === 'COMPLETED' && (
                    <button className="btn-small btn-primary" onClick={() => handleApproveCount(count.id)}>Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {counts.length === 0 && (
          <div className="no-data">No stock counts found</div>
        )}
      </div>
    </div>
  );
};

export default StockCounting;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Inventory.css';

interface StockTransfer {
  id: string;
  transferNumber: string;
  transferDate: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  status: string;
  priority: string;
  transferType: string;
  trackingNumber?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  requestedBy?: string;
  approvedAt?: string;
  shippedAt?: string;
  receivedAt?: string;
  lines: TransferLine[];
}

interface TransferLine {
  id: string;
  productId: string;
  requestedQuantity: number;
  shippedQuantity: number;
  receivedQuantity: number;
  varianceQuantity: number;
  status: string;
}

const StockTransfers: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    loadTransfers();
  }, [currentOrganizationId, filterStatus, showPendingOnly]);

  const loadTransfers = async () => {
    if (!currentOrganizationId) return;
    
    try {
      setLoading(true);
      const params: any = { organizationId: currentOrganizationId };
      if (filterStatus) params.status = filterStatus;
      if (showPendingOnly) params.pendingOnly = true;
      
      const response = await api.get('/api/inventory/transfers', { params });
      setTransfers(response.data);
    } catch (error) {
      console.error('Failed to load transfers:', error);
      alert('Failed to load stock transfers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTransfer = async (transferId: string) => {
    if (!user?.id) return;
    
    try {
      await api.post(`/api/inventory/transfers/${transferId}/submit`, {
        userId: user.id
      });
      loadTransfers();
      alert('Transfer submitted for approval');
    } catch (error) {
      console.error('Failed to submit transfer:', error);
      alert('Failed to submit transfer');
    }
  };

  const handleApproveTransfer = async (transferId: string) => {
    if (!user?.id) return;
    
    try {
      await api.post(`/api/inventory/transfers/${transferId}/approve`, {
        approvedBy: user.id
      });
      loadTransfers();
      alert('Transfer approved successfully');
    } catch (error) {
      console.error('Failed to approve transfer:', error);
      alert('Failed to approve transfer');
    }
  };

  const handleShipTransfer = async (transferId: string) => {
    if (!user?.id) return;
    
    const trackingNumber = prompt('Enter tracking number (optional):');
    
    try {
      await api.post(`/api/inventory/transfers/${transferId}/ship`, {
        shippedBy: user.id,
        trackingNumber: trackingNumber || undefined
      });
      loadTransfers();
      alert('Transfer shipped successfully');
    } catch (error) {
      console.error('Failed to ship transfer:', error);
      alert('Failed to ship transfer');
    }
  };

  const handleReceiveTransfer = async (transferId: string) => {
    if (!user?.id) return;
    
    if (!confirm('Confirm receipt of this transfer?')) return;
    
    try {
      await api.post(`/api/inventory/transfers/${transferId}/receive`, {
        receivedBy: user.id
      });
      loadTransfers();
      alert('Transfer received successfully');
    } catch (error) {
      console.error('Failed to receive transfer:', error);
      alert('Failed to receive transfer');
    }
  };

  const handleCancelTransfer = async (transferId: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (!reason) return;
    
    try {
      await api.post(`/api/inventory/transfers/${transferId}/cancel`, {
        reason
      });
      loadTransfers();
      alert('Transfer cancelled');
    } catch (error) {
      console.error('Failed to cancel transfer:', error);
      alert('Failed to cancel transfer');
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'DRAFT': return 'draft';
      case 'SUBMITTED': return 'submitted';
      case 'APPROVED': return 'approved';
      case 'IN_TRANSIT': return 'in-progress';
      case 'RECEIVED': return 'completed';
      case 'CANCELLED': return 'cancelled';
      default: return '';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'URGENT': return 'critical';
      case 'HIGH': return 'high';
      case 'NORMAL': return '';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading transfers...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Stock Transfers</h1>
        <button className="btn-primary" onClick={() => alert('Create transfer functionality coming soon')}>
          + New Transfer
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="RECEIVED">Received</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showPendingOnly}
            onChange={(e) => setShowPendingOnly(e.target.checked)}
          />
          Show Pending Only
        </label>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Transfer #</th>
              <th>Date</th>
              <th>From Warehouse</th>
              <th>To Warehouse</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Expected Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((transfer) => (
              <tr key={transfer.id} className={getPriorityColor(transfer.priority)}>
                <td><strong>{transfer.transferNumber}</strong></td>
                <td>{new Date(transfer.transferDate).toLocaleDateString()}</td>
                <td>{transfer.fromWarehouseId.substring(0, 8)}...</td>
                <td>{transfer.toWarehouseId.substring(0, 8)}...</td>
                <td>
                  <span className={`priority-badge ${transfer.priority.toLowerCase()}`}>
                    {transfer.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${getStatusColor(transfer.status)}`}>
                    {transfer.status}
                  </span>
                </td>
                <td>{transfer.trackingNumber || '-'}</td>
                <td>
                  {transfer.expectedDeliveryDate 
                    ? new Date(transfer.expectedDeliveryDate).toLocaleDateString()
                    : '-'}
                </td>
                <td>
                  {transfer.status === 'DRAFT' && (
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => handleSubmitTransfer(transfer.id)}
                    >
                      Submit
                    </button>
                  )}
                  {transfer.status === 'SUBMITTED' && (
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => handleApproveTransfer(transfer.id)}
                    >
                      Approve
                    </button>
                  )}
                  {transfer.status === 'APPROVED' && (
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => handleShipTransfer(transfer.id)}
                    >
                      Ship
                    </button>
                  )}
                  {transfer.status === 'IN_TRANSIT' && (
                    <button 
                      className="btn-small btn-primary"
                      onClick={() => handleReceiveTransfer(transfer.id)}
                    >
                      Receive
                    </button>
                  )}
                  {(transfer.status === 'DRAFT' || transfer.status === 'SUBMITTED') && (
                    <>
                      {' '}
                      <button 
                        className="btn-small"
                        onClick={() => handleCancelTransfer(transfer.id)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {transfers.length === 0 && (
          <div className="no-data">No stock transfers found</div>
        )}
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Transfers</h3>
          <div className="summary-value">{transfers.length}</div>
        </div>
        <div className="summary-card">
          <h3>Pending Approval</h3>
          <div className="summary-value">
            {transfers.filter(t => t.status === 'SUBMITTED').length}
          </div>
        </div>
        <div className="summary-card warning">
          <h3>In Transit</h3>
          <div className="summary-value">
            {transfers.filter(t => t.status === 'IN_TRANSIT').length}
          </div>
        </div>
        <div className="summary-card">
          <h3>Completed</h3>
          <div className="summary-value">
            {transfers.filter(t => t.status === 'RECEIVED').length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockTransfers;


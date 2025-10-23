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

interface Warehouse {
  id: string;
  code: string;
  name: string;
  type: string;
  address: string;
  contact: string;
  capacity: number;
  status: string;
  isActive: boolean;
}

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  currentStock: number;
}

const StockTransfers: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [transfers, setTransfers] = useState<StockTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    transferNumber: '',
    transferDate: new Date().toISOString().split('T')[0],
    fromWarehouseId: '',
    toWarehouseId: '',
    priority: 'NORMAL',
    transferType: 'STANDARD',
    expectedDeliveryDate: '',
    shippingMethod: '',
    notes: '',
    reason: ''
  });
  const [transferLines, setTransferLines] = useState<Array<{
    productId: string;
    requestedQuantity: number;
    notes: string;
  }>>([{ productId: '', requestedQuantity: 0, notes: '' }]);

  useEffect(() => {
    loadTransfers();
    loadWarehouses();
    loadProducts();
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

  const loadWarehouses = async () => {
    if (!currentOrganizationId) return;
    
    try {
      const response = await api.get('/api/inventory/warehouses', {
        params: { organizationId: currentOrganizationId, activeOnly: true }
      });
      setWarehouses(response.data);
    } catch (error) {
      console.error('Failed to load warehouses:', error);
    }
  };

  const loadProducts = async () => {
    if (!currentOrganizationId) return;
    
    try {
      const response = await api.get('/api/inventory/products', {
        params: { organizationId: currentOrganizationId, activeOnly: true }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !user?.id) return;

    // Validate that we have at least one transfer line with a product
    const validLines = transferLines.filter(line => line.productId && line.requestedQuantity > 0);
    if (validLines.length === 0) {
      alert('Please add at least one product to transfer');
      return;
    }

    try {
      const transferData = {
        ...formData,
        organizationId: currentOrganizationId,
        requestedBy: user.id,
        createdBy: user.id,
        status: 'DRAFT',
        lines: validLines.map(line => ({
          productId: line.productId,
          requestedQuantity: line.requestedQuantity,
          notes: line.notes
        }))
      };

      await api.post('/api/inventory/transfers', transferData);
      setShowModal(false);
      resetForm();
      loadTransfers();
      alert('Stock transfer created successfully');
    } catch (error) {
      console.error('Failed to create transfer:', error);
      alert('Failed to create stock transfer');
    }
  };

  const resetForm = () => {
    setFormData({
      transferNumber: '',
      transferDate: new Date().toISOString().split('T')[0],
      fromWarehouseId: '',
      toWarehouseId: '',
      priority: 'NORMAL',
      transferType: 'STANDARD',
      expectedDeliveryDate: '',
      shippingMethod: '',
      notes: '',
      reason: ''
    });
    setTransferLines([{ productId: '', requestedQuantity: 0, notes: '' }]);
  };

  const openModal = () => {
    // Generate a unique transfer number
    const transferNumber = `TR-${Date.now()}`;
    setFormData(prev => ({ ...prev, transferNumber }));
    setShowModal(true);
  };

  const addTransferLine = () => {
    setTransferLines([...transferLines, { productId: '', requestedQuantity: 0, notes: '' }]);
  };

  const removeTransferLine = (index: number) => {
    if (transferLines.length > 1) {
      setTransferLines(transferLines.filter((_, i) => i !== index));
    }
  };

  const updateTransferLine = (index: number, field: string, value: any) => {
    const updatedLines = [...transferLines];
    updatedLines[index] = { ...updatedLines[index], [field]: value };
    setTransferLines(updatedLines);
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
        <button className="btn-primary" onClick={openModal}>
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

      {/* Create Transfer Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content large">
            <div className="modal-header">
              <h2>Create New Stock Transfer</h2>
              <button className="btn-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="transferNumber">Transfer Number *</label>
                  <input
                    type="text"
                    id="transferNumber"
                    value={formData.transferNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, transferNumber: e.target.value }))}
                    required
                    placeholder="e.g., TR-20240101-001"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="transferDate">Transfer Date *</label>
                  <input
                    type="date"
                    id="transferDate"
                    value={formData.transferDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fromWarehouseId">From Warehouse *</label>
                  <select
                    id="fromWarehouseId"
                    value={formData.fromWarehouseId}
                    onChange={(e) => setFormData(prev => ({ ...prev, fromWarehouseId: e.target.value }))}
                    required
                  >
                    <option value="">Select Source Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.code} - {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="toWarehouseId">To Warehouse *</label>
                  <select
                    id="toWarehouseId"
                    value={formData.toWarehouseId}
                    onChange={(e) => setFormData(prev => ({ ...prev, toWarehouseId: e.target.value }))}
                    required
                  >
                    <option value="">Select Destination Warehouse</option>
                    {warehouses.map(warehouse => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.code} - {warehouse.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="priority">Priority *</label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                    required
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="transferType">Transfer Type *</label>
                  <select
                    id="transferType"
                    value={formData.transferType}
                    onChange={(e) => setFormData(prev => ({ ...prev, transferType: e.target.value }))}
                    required
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="REPLENISHMENT">Replenishment</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expectedDeliveryDate">Expected Delivery Date</label>
                  <input
                    type="date"
                    id="expectedDeliveryDate"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryDate: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="shippingMethod">Shipping Method</label>
                  <input
                    type="text"
                    id="shippingMethod"
                    value={formData.shippingMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, shippingMethod: e.target.value }))}
                    placeholder="e.g., Ground, Express, Air"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reason">Transfer Reason *</label>
                <input
                  type="text"
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  required
                  placeholder="e.g., Stock replenishment, Emergency transfer"
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Additional notes for this transfer..."
                />
              </div>

              {/* Transfer Lines */}
              <div className="transfer-lines">
                <div className="section-header">
                  <h3>Transfer Items</h3>
                  <button type="button" className="btn-small btn-primary" onClick={addTransferLine}>
                    + Add Item
                  </button>
                </div>

                {transferLines.map((line, index) => (
                  <div key={index} className="transfer-line">
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product *</label>
                        <select
                          value={line.productId}
                          onChange={(e) => updateTransferLine(index, 'productId', e.target.value)}
                          required
                        >
                          <option value="">Select Product</option>
                          {products.map(product => (
                            <option key={product.id} value={product.id}>
                              {product.sku} - {product.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Quantity *</label>
                        <input
                          type="number"
                          min="1"
                          value={line.requestedQuantity}
                          onChange={(e) => updateTransferLine(index, 'requestedQuantity', parseInt(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Notes</label>
                        <input
                          type="text"
                          value={line.notes}
                          onChange={(e) => updateTransferLine(index, 'notes', e.target.value)}
                          placeholder="Line notes"
                        />
                      </div>
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <button
                          type="button"
                          className="btn-small btn-danger"
                          onClick={() => removeTransferLine(index)}
                          disabled={transferLines.length === 1}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTransfers;


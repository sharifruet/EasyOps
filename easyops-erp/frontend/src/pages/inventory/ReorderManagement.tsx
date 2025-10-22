import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import './Inventory.css';

interface ReorderRule {
  id: string;
  productId: string;
  warehouseId: string;
  reorderPoint: number;
  reorderQuantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  leadTimeDays?: number;
  safetyStock: number;
  isActive: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
}

interface ReorderAlert {
  id: string;
  productId: string;
  warehouseId: string;
  currentQuantity: number;
  reorderPoint: number;
  suggestedOrderQty: number;
  alertStatus: string;
  priority: string;
  createdAt: string;
  acknowledgedAt?: string;
}

const ReorderManagement: React.FC = () => {
  const { currentOrganization, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'rules' | 'alerts'>('alerts');
  const [rules, setRules] = useState<ReorderRule[]>([]);
  const [alerts, setAlerts] = useState<ReorderAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlyOpen, setShowOnlyOpen] = useState(true);

  useEffect(() => {
    if (activeTab === 'rules') {
      loadRules();
    } else {
      loadAlerts();
    }
  }, [currentOrganization, activeTab, showOnlyOpen]);

  const loadRules = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get('/api/inventory/reorder/rules', {
        params: { organizationId: currentOrganization.id, activeOnly: true }
      });
      setRules(response.data);
    } catch (error) {
      console.error('Failed to load reorder rules:', error);
      alert('Failed to load reorder rules');
    } finally {
      setLoading(false);
    }
  };

  const loadAlerts = async () => {
    if (!currentOrganization?.id) return;
    
    try {
      setLoading(true);
      const response = await api.get('/api/inventory/reorder/alerts', {
        params: { organizationId: currentOrganization.id, openOnly: showOnlyOpen }
      });
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to load reorder alerts:', error);
      alert('Failed to load reorder alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    if (!user?.id) return;
    
    try {
      await api.post(`/api/inventory/reorder/alerts/${alertId}/acknowledge`, {
        userId: user.id
      });
      loadAlerts();
      alert('Alert acknowledged successfully');
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      alert('Failed to acknowledge alert');
    }
  };

  const handleCloseAlert = async (alertId: string) => {
    try {
      await api.post(`/api/inventory/reorder/alerts/${alertId}/close`);
      loadAlerts();
      alert('Alert closed successfully');
    } catch (error) {
      console.error('Failed to close alert:', error);
      alert('Failed to close alert');
    }
  };

  const getPriorityClass = (priority: string): string => {
    switch (priority) {
      case 'CRITICAL': return 'critical';
      case 'HIGH': return 'high';
      case 'MEDIUM': return 'warning';
      default: return '';
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Reorder Management</h1>
        <button className="btn-primary" onClick={() => alert('Create rule functionality coming soon')}>
          + New Reorder Rule
        </button>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Reorder Alerts ({alerts.filter(a => a.alertStatus === 'OPEN').length})
        </button>
        <button
          className={`tab ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
        >
          Reorder Rules ({rules.length})
        </button>
      </div>

      {activeTab === 'alerts' && (
        <>
          <div className="filters">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showOnlyOpen}
                onChange={(e) => setShowOnlyOpen(e.target.checked)}
              />
              Show Open Alerts Only
            </label>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Product ID</th>
                  <th>Warehouse</th>
                  <th>Current Qty</th>
                  <th>Reorder Point</th>
                  <th>Suggested Order</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className={getPriorityClass(alert.priority)}>
                    <td>
                      <span className={`priority-badge ${alert.priority.toLowerCase()}`}>
                        {alert.priority}
                      </span>
                    </td>
                    <td>{alert.productId.substring(0, 8)}...</td>
                    <td>{alert.warehouseId.substring(0, 8)}...</td>
                    <td><strong>{alert.currentQuantity.toFixed(2)}</strong></td>
                    <td>{alert.reorderPoint.toFixed(2)}</td>
                    <td className="text-success"><strong>{alert.suggestedOrderQty.toFixed(2)}</strong></td>
                    <td>
                      <span className={`status-badge ${alert.alertStatus.toLowerCase()}`}>
                        {alert.alertStatus}
                      </span>
                    </td>
                    <td>{new Date(alert.createdAt).toLocaleDateString()}</td>
                    <td>
                      {alert.alertStatus === 'OPEN' && (
                        <>
                          <button 
                            className="btn-small"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            Acknowledge
                          </button>
                          {' '}
                          <button 
                            className="btn-small"
                            onClick={() => handleCloseAlert(alert.id)}
                          >
                            Close
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {alerts.length === 0 && (
              <div className="no-data">No reorder alerts found</div>
            )}
          </div>

          <div className="summary-cards">
            <div className="summary-card critical">
              <h3>Critical Alerts</h3>
              <div className="summary-value">
                {alerts.filter(a => a.priority === 'CRITICAL' && a.alertStatus === 'OPEN').length}
              </div>
            </div>
            <div className="summary-card high">
              <h3>High Priority</h3>
              <div className="summary-value">
                {alerts.filter(a => a.priority === 'HIGH' && a.alertStatus === 'OPEN').length}
              </div>
            </div>
            <div className="summary-card warning">
              <h3>Medium Priority</h3>
              <div className="summary-value">
                {alerts.filter(a => a.priority === 'MEDIUM' && a.alertStatus === 'OPEN').length}
              </div>
            </div>
            <div className="summary-card">
              <h3>Total Open</h3>
              <div className="summary-value">
                {alerts.filter(a => a.alertStatus === 'OPEN').length}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'rules' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Warehouse</th>
                <th>Reorder Point</th>
                <th>Reorder Qty</th>
                <th>Safety Stock</th>
                <th>Lead Time</th>
                <th>Status</th>
                <th>Last Triggered</th>
                <th>Trigger Count</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id}>
                  <td>{rule.productId.substring(0, 8)}...</td>
                  <td>{rule.warehouseId.substring(0, 8)}...</td>
                  <td><strong>{rule.reorderPoint.toFixed(2)}</strong></td>
                  <td>{rule.reorderQuantity.toFixed(2)}</td>
                  <td>{rule.safetyStock.toFixed(2)}</td>
                  <td>{rule.leadTimeDays || '-'} days</td>
                  <td>
                    <span className={`status-badge ${rule.isActive ? 'active' : 'inactive'}`}>
                      {rule.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleDateString() : 'Never'}</td>
                  <td>{rule.triggerCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {rules.length === 0 && (
            <div className="no-data">No reorder rules configured</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReorderManagement;


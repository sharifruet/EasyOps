import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getReimbursements, createReimbursement } from '../../services/hrService';
import './Hr.css';

const ReimbursementManagement: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [reimbursements, setReimbursements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    expenseDate: '',
  });

  useEffect(() => {
    if (currentOrganizationId) {
      loadReimbursements();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadReimbursements = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const response = await getReimbursements(currentOrganizationId);
      setReimbursements(response.data);
    } catch (err) {
      console.error('Failed to load reimbursements:', err);
      setError('Failed to load reimbursements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId || !user?.id) return;

    try {
      await createReimbursement({
        ...formData,
        amount: parseFloat(formData.amount),
        employeeId: user.id,
        organizationId: currentOrganizationId,
      } as any);
      setShowForm(false);
      setFormData({ category: '', amount: '', description: '', expenseDate: '' });
      loadReimbursements();
      alert('Reimbursement request submitted successfully!');
    } catch (err) {
      console.error('Failed to submit reimbursement:', err);
      alert('Failed to submit reimbursement request');
    }
  };

  if (loading) return <div className="loading">Loading reimbursements...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const totalPending = reimbursements.filter(r => r.status === 'PENDING').reduce((sum, r) => sum + (r.amount || 0), 0);
  const totalApproved = reimbursements.filter(r => r.status === 'APPROVED').reduce((sum, r) => sum + (r.amount || 0), 0);

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Reimbursement Management</h1>
        <p>Submit and track expense reimbursements</p>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Reimbursement Request
        </button>
      </div>

      <div className="hr-summary-cards">
        <div className="hr-summary-card">
          <h3>Pending Requests</h3>
          <div className="hr-card-value">${totalPending.toLocaleString()}</div>
          <small>{reimbursements.filter(r => r.status === 'PENDING').length} requests</small>
        </div>
        <div className="hr-summary-card">
          <h3>Approved (This Month)</h3>
          <div className="hr-card-value">${totalApproved.toLocaleString()}</div>
          <small>{reimbursements.filter(r => r.status === 'APPROVED').length} requests</small>
        </div>
      </div>

      {showForm && (
        <div className="hr-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Reimbursement Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select category</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="MEALS">Meals</option>
                  <option value="OFFICE_SUPPLIES">Office Supplies</option>
                  <option value="TRAINING">Training</option>
                  <option value="ENTERTAINMENT">Entertainment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div className="form-row">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Expense Date *</label>
                <input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="hr-section">
        <h2>My Reimbursement Requests</h2>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Expense Date</th>
              <th>Description</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Approved/Rejected</th>
            </tr>
          </thead>
          <tbody>
            {reimbursements.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>
                  No reimbursement requests found. Submit your first request to get started.
                </td>
              </tr>
            ) : (
              reimbursements.map((req) => (
                <tr key={req.reimbursementId}>
                  <td>{req.category}</td>
                  <td>${req.amount?.toLocaleString() || '0'}</td>
                  <td>{req.expenseDate ? new Date(req.expenseDate).toLocaleDateString() : '-'}</td>
                  <td>{req.description || '-'}</td>
                  <td>
                    <span className={`status-badge status-${req.status?.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : '-'}</td>
                  <td>{req.processedAt ? new Date(req.processedAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReimbursementManagement;


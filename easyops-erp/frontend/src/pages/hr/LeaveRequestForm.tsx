import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getLeaveRequests, createLeaveRequest, getLeaveTypes } from '../../services/hrService';
import './Hr.css';

const LeaveRequestForm: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: '',
    isHalfDay: false,
  });

  useEffect(() => {
    if (currentOrganizationId) {
      loadData();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadData = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const [requestsRes, typesRes] = await Promise.all([
        getLeaveRequests(currentOrganizationId),
        getLeaveTypes(currentOrganizationId),
      ]);
      setRequests(requestsRes.data);
      setLeaveTypes(typesRes.data);
    } catch (err) {
      console.error('Failed to load leave data:', err);
      setError('Failed to load leave data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId) return;

    try {
      await createLeaveRequest({
        ...formData,
        employeeId: user?.id || '',
        organizationId: currentOrganizationId,
      } as any);
      setShowForm(false);
      setFormData({ leaveTypeId: '', startDate: '', endDate: '', reason: '', isHalfDay: false });
      loadData();
      alert('Leave request submitted successfully!');
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      alert('Failed to submit leave request');
    }
  };

  if (loading) return <div className="loading">Loading leave requests...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Leave Requests</h1>
        <p>Submit and track your leave requests</p>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + Request Leave
        </button>
      </div>

      {showForm && (
        <div className="hr-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Leave Request</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Leave Type *</label>
                <select
                  value={formData.leaveTypeId}
                  onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
                  required
                >
                  <option value="">Select leave type</option>
                  {leaveTypes.map((type) => (
                    <option key={type.leaveTypeId} value={type.leaveTypeId}>
                      {type.name} ({type.availableDays} days available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <label>Start Date *</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>End Date *</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isHalfDay}
                    onChange={(e) => setFormData({ ...formData, isHalfDay: e.target.checked })}
                  />
                  Half Day
                </label>
              </div>

              <div className="form-row">
                <label>Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
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
        <h2>My Leave Requests</h2>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  No leave requests found
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.leaveRequestId}>
                  <td>{req.leaveTypeName || 'N/A'}</td>
                  <td>{new Date(req.startDate).toLocaleDateString()}</td>
                  <td>{new Date(req.endDate).toLocaleDateString()}</td>
                  <td>{req.totalDays || 0}</td>
                  <td>
                    <span className={`status-badge status-${req.status?.toLowerCase()}`}>
                      {req.status}
                    </span>
                  </td>
                  <td>{req.requestedAt ? new Date(req.requestedAt).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveRequestForm;


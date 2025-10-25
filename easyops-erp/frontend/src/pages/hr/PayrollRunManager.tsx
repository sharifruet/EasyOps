import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPayrollRuns, createPayrollRun, processPayrollRun } from '../../services/hrService';
import './Hr.css';

const PayrollRunManager: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    periodStart: '',
    periodEnd: '',
    paymentDate: '',
    description: '',
  });

  useEffect(() => {
    if (currentOrganizationId) {
      loadPayrollRuns();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadPayrollRuns = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const response = await getPayrollRuns(currentOrganizationId);
      setPayrollRuns(response.data);
    } catch (err) {
      console.error('Failed to load payroll runs:', err);
      setError('Failed to load payroll runs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrganizationId) return;

    try {
      await createPayrollRun({
        ...formData,
        organizationId: currentOrganizationId,
      } as any);
      setShowForm(false);
      setFormData({ periodStart: '', periodEnd: '', paymentDate: '', description: '' });
      loadPayrollRuns();
      alert('Payroll run created successfully!');
    } catch (err) {
      console.error('Failed to create payroll run:', err);
      alert('Failed to create payroll run');
    }
  };

  const handleProcess = async (runId: string) => {
    if (!confirm('Are you sure you want to process this payroll run?')) return;

    try {
      await processPayrollRun(runId);
      loadPayrollRuns();
      alert('Payroll run processed successfully!');
    } catch (err) {
      console.error('Failed to process payroll run:', err);
      alert('Failed to process payroll run');
    }
  };

  if (loading) return <div className="loading">Loading payroll runs...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Payroll Runs</h1>
        <p>Create and manage payroll processing runs</p>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Payroll Run
        </button>
      </div>

      {showForm && (
        <div className="hr-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Payroll Run</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <label>Period Start *</label>
                <input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => setFormData({ ...formData, periodStart: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Period End *</label>
                <input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => setFormData({ ...formData, periodEnd: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Run
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="hr-section">
        <table className="hr-table">
          <thead>
            <tr>
              <th>Run ID</th>
              <th>Period</th>
              <th>Payment Date</th>
              <th>Employees</th>
              <th>Gross Amount</th>
              <th>Net Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollRuns.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center' }}>
                  No payroll runs found. Create your first payroll run to get started.
                </td>
              </tr>
            ) : (
              payrollRuns.map((run) => (
                <tr key={run.payrollRunId}>
                  <td>#{run.runNumber || run.payrollRunId?.substring(0, 8)}</td>
                  <td>
                    {new Date(run.periodStart).toLocaleDateString()} - {new Date(run.periodEnd).toLocaleDateString()}
                  </td>
                  <td>{new Date(run.paymentDate).toLocaleDateString()}</td>
                  <td>{run.employeeCount || 0}</td>
                  <td>${run.totalGross?.toLocaleString() || '0'}</td>
                  <td>${run.totalNet?.toLocaleString() || '0'}</td>
                  <td>
                    <span className={`status-badge status-${run.status?.toLowerCase()}`}>
                      {run.status}
                    </span>
                  </td>
                  <td>
                    {run.status === 'DRAFT' && (
                      <button onClick={() => handleProcess(run.payrollRunId)} className="btn-sm btn-primary">
                        Process
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayrollRunManager;


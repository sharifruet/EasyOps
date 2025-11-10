import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getPayrollRuns, createPayrollRun, processPayrollRun } from '../../services/hrService';
import './Hr.css';

const PayrollRunManager: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [payrollRuns, setPayrollRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    runName: '',
    payPeriodStart: '',
    payPeriodEnd: '',
    paymentDate: '',
    notes: '',
  });
  const [formError, setFormError] = useState<string | null>(null);

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

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganizationId) {
      setFormError('No organization selected.');
      return;
    }

    if (!formData.payPeriodStart || !formData.payPeriodEnd || !formData.paymentDate) {
      setFormError('Please provide pay period start, end, and payment date.');
      return;
    }

    const start = new Date(formData.payPeriodStart);
    const end = new Date(formData.payPeriodEnd);
    if (end < start) {
      setFormError('Pay period end cannot be earlier than the start date.');
      return;
    }

    const runName =
      formData.runName.trim() ||
      `Payroll ${formData.payPeriodStart} - ${formData.payPeriodEnd}`;

    const payload = {
      organizationId: currentOrganizationId,
      runName,
      payPeriodStart: formData.payPeriodStart,
      payPeriodEnd: formData.payPeriodEnd,
      paymentDate: formData.paymentDate,
      notes: formData.notes.trim() || undefined,
    };

    try {
      setFormError(null);
      await createPayrollRun(payload as any);
      setShowForm(false);
      setFormData({
        runName: '',
        payPeriodStart: '',
        payPeriodEnd: '',
        paymentDate: '',
        notes: '',
      });
      loadPayrollRuns();
      alert('Payroll run created successfully!');
    } catch (err) {
      console.error('Failed to create payroll run:', err);
      setFormError('Failed to create payroll run. Please verify the details and try again.');
    }
  };

  const handleProcess = async (runId: string) => {
    if (!confirm('Are you sure you want to process this payroll run?')) return;
    if (!user?.id) {
      alert('Unable to process payroll run: missing user context.');
      return;
    }

    try {
      await processPayrollRun(runId, user.id);
      loadPayrollRuns();
      alert('Payroll run processed successfully!');
    } catch (err) {
      console.error('Failed to process payroll run:', err);
      alert('Failed to process payroll run');
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString();
  };

  const formatCurrency = (value?: number | string) => {
    const amount = Number(value ?? 0);
    if (Number.isNaN(amount)) return '$0';
    return amount.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
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
                <label>Run Name *</label>
                <input
                  type="text"
                  value={formData.runName}
                  onChange={(e) => setFormData({ ...formData, runName: e.target.value })}
                  placeholder="e.g. November 2025 Payroll"
                />
              </div>

              <div className="form-row">
                <label>Period Start *</label>
                <input
                  type="date"
                  value={formData.payPeriodStart}
                  onChange={(e) => setFormData({ ...formData, payPeriodStart: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <label>Period End *</label>
                <input
                  type="date"
                  value={formData.payPeriodEnd}
                  onChange={(e) => setFormData({ ...formData, payPeriodEnd: e.target.value })}
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
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              {formError && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  {formError}
                </div>
              )}

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
                  <td title={run.runName || undefined}>
                    {run.runName || `#${run.payrollRunId?.substring(0, 8)}`}
                  </td>
                  <td>
                    {formatDate(run.payPeriodStart || run.periodStart)} - {formatDate(run.payPeriodEnd || run.periodEnd)}
                  </td>
                  <td>{formatDate(run.paymentDate)}</td>
                  <td>{run.employeeCount || 0}</td>
                  <td>{formatCurrency(run.totalGrossPay ?? run.totalGross)}</td>
                  <td>{formatCurrency(run.totalNetPay ?? run.totalNet)}</td>
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


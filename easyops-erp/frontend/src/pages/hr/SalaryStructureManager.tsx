import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  getSalaryStructures,
  getEmployeeSalaryDetails,
  createSalaryStructure,
  getPositions,
} from '../../services/hrService';
import './Hr.css';

const SalaryStructureManager: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [structures, setStructures] = useState<any[]>([]);
  const [employeeSalaries, setEmployeeSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structures' | 'employees'>('structures');
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [structureFormError, setStructureFormError] = useState<string | null>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [structureForm, setStructureForm] = useState({
    structureName: '',
    baseSalary: '',
    currency: 'BDT',
    payFrequency: 'monthly',
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
    positionId: '',
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
      const [structuresRes, salariesRes, positionsRes] = await Promise.all([
        getSalaryStructures(currentOrganizationId),
        getEmployeeSalaryDetails(currentOrganizationId),
        getPositions(currentOrganizationId, { activeOnly: true }),
      ]);
      setStructures(structuresRes.data);
      setEmployeeSalaries(salariesRes.data);
      setPositions(positionsRes.data || []);
    } catch (err) {
      console.error('Failed to load salary data:', err);
      setError('Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  const resetStructureForm = () => {
    setStructureForm({
      structureName: '',
      baseSalary: '',
      currency: 'BDT',
      payFrequency: 'monthly',
      effectiveFrom: new Date().toISOString().split('T')[0],
      effectiveTo: '',
      positionId: '',
    });
    setStructureFormError(null);
  };

  const handleStructureSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!currentOrganizationId) {
      setStructureFormError('No organization selected.');
      return;
    }

    if (!structureForm.structureName.trim()) {
      setStructureFormError('Structure name is required.');
      return;
    }
    const baseSalary = parseFloat(structureForm.baseSalary);
    if (Number.isNaN(baseSalary) || baseSalary <= 0) {
      setStructureFormError('Base salary must be a positive number.');
      return;
    }

    try {
      setStructureFormError(null);
      await createSalaryStructure({
        organizationId: currentOrganizationId,
        structureName: structureForm.structureName.trim(),
        baseSalary,
        currency: structureForm.currency || 'BDT',
        payFrequency: structureForm.payFrequency,
        effectiveFrom: structureForm.effectiveFrom,
        effectiveTo: structureForm.effectiveTo || undefined,
        positionId: structureForm.positionId || undefined,
        isActive: true,
      });
      resetStructureForm();
      setShowStructureForm(false);
      await loadData();
      alert('Salary structure created successfully!');
    } catch (err) {
      console.error('Failed to create salary structure:', err);
      setStructureFormError('Failed to create salary structure. Please try again.');
    }
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    const curr = currency || 'BDT';
    if (typeof amount !== 'number' || Number.isNaN(amount)) {
      return curr === 'BDT' ? '৳0.00' : `${curr} 0.00`;
    }
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 2,
      }).format(amount);
    } catch (err) {
      const symbol = curr === 'BDT' ? '৳' : `${curr} `;
      return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  if (loading) return <div className="loading">Loading salary data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Salary Management</h1>
        <p>Manage salary structures and employee compensation</p>
        <div className="header-actions">
          <button className="btn-secondary" onClick={loadData}>
            Refresh
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              resetStructureForm();
              setShowStructureForm(true);
            }}
          >
            + New Salary Structure
          </button>
        </div>
      </div>

      {showStructureForm && (
        <div
          className="hr-modal-overlay"
          onClick={() => {
            setShowStructureForm(false);
            resetStructureForm();
          }}
        >
          <div className="hr-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Create Salary Structure</h2>
            <form onSubmit={handleStructureSubmit}>
              <div className="form-row">
                <label>Structure Name *</label>
                <input
                  type="text"
                  value={structureForm.structureName}
                  onChange={(event) =>
                    setStructureForm({ ...structureForm, structureName: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Base Salary *</label>
                <input
                  type="number"
                  step="0.01"
                  value={structureForm.baseSalary}
                  onChange={(event) =>
                    setStructureForm({ ...structureForm, baseSalary: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Currency</label>
                <select
                  value={structureForm.currency}
                  onChange={(event) =>
                    setStructureForm({ ...structureForm, currency: event.target.value })
                  }
                >
                  <option value="BDT">BDT - Bangladeshi Taka</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>

              <div className="form-row">
                <label>Pay Frequency</label>
                <select
                  value={structureForm.payFrequency}
                  onChange={(event) =>
                    setStructureForm({ ...structureForm, payFrequency: event.target.value })
                  }
                >
                  <option value="monthly">Monthly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="weekly">Weekly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              <div className="form-row">
                <label>Effective From *</label>
                <input
                  type="date"
                  value={structureForm.effectiveFrom}
                  onChange={(event) =>
                    setStructureForm({ ...structureForm, effectiveFrom: event.target.value })
                  }
                  required
                />
              </div>

              <div className="form-row">
                <label>Effective To</label>
                <input
                  type="date"
                  value={structureForm.effectiveTo}
                  onChange={(event) =>
                    setStructureForm({ ...structureForm, effectiveTo: event.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Position</label>
                <select
                  value={structureForm.positionId}
                  onChange={(event) =>
                    setStructureForm({ ...structureForm, positionId: event.target.value })
                  }
                >
                  <option value="">-- Optional: Link to Position --</option>
                  {positions.map((position) => (
                    <option key={position.positionId} value={position.positionId}>
                      {position.title || position.positionName || 'Untitled Position'}
                    </option>
                  ))}
                </select>
              </div>

              {structureFormError && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  {structureFormError}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowStructureForm(false);
                    resetStructureForm();
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="tabs">
        <button
          className={activeTab === 'structures' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('structures')}
        >
          Salary Structures
        </button>
        <button
          className={activeTab === 'employees' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('employees')}
        >
          Employee Salaries
        </button>
      </div>

      {activeTab === 'structures' && (
        <div className="hr-section">
          <h2>Salary Structures</h2>
          <table className="hr-table">
            <thead>
              <tr>
                <th>Structure Name</th>
                <th>Base Salary</th>
                <th>Currency</th>
                <th>Pay Frequency</th>
                <th>Effective From</th>
                <th>Effective To</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {structures.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center' }}>
                    No salary structures found. Create salary structures to define compensation templates.
                  </td>
                </tr>
              ) : (
                structures.map((structure) => (
                  <tr key={structure.salaryStructureId}>
                    <td><strong>{structure.structureName}</strong></td>
                    <td>{formatCurrency(structure.baseSalary, structure.currency)}</td>
                    <td>{structure.currency || 'USD'}</td>
                    <td>{structure.payFrequency || 'monthly'}</td>
                    <td>{structure.effectiveFrom ? new Date(structure.effectiveFrom).toLocaleDateString() : '-'}</td>
                    <td>{structure.effectiveTo ? new Date(structure.effectiveTo).toLocaleDateString() : '-'}</td>
                    <td>
                      <span className={`status-badge status-${structure.isActive ? 'active' : 'inactive'}`}>
                        {structure.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="hr-section">
          <h2>Employee Salary Details</h2>
          <table className="hr-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Employee #</th>
                <th>Position</th>
                <th>Salary Structure</th>
                <th>Base Salary</th>
                <th>Allowances</th>
                <th>Gross Salary</th>
                <th>Effective Date</th>
              </tr>
            </thead>
            <tbody>
              {employeeSalaries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    No employee salary records found. Assign salary structures to employees to see details.
                  </td>
                </tr>
              ) : (
                employeeSalaries.map((salary) => (
                  <tr key={salary.salaryDetailId}>
                    <td>{salary.employeeName || salary.employeeId}</td>
                    <td>{salary.employeeNumber || '-'}</td>
                    <td>{salary.positionTitle || '-'}</td>
                    <td>{salary.structureName || salary.salaryStructureId || '-'}</td>
                    <td>{formatCurrency(salary.baseSalary, salary.currency)}</td>
                    <td>{formatCurrency(salary.totalAllowances, salary.currency)}</td>
                    <td>
                      <strong>{formatCurrency(salary.grossSalary, salary.currency)}</strong>
                    </td>
                    <td>{salary.effectiveDate ? new Date(salary.effectiveDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalaryStructureManager;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getSalaryStructures, getEmployeeSalaryDetails } from '../../services/hrService';
import './Hr.css';

const SalaryStructureManager: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [structures, setStructures] = useState<any[]>([]);
  const [employeeSalaries, setEmployeeSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structures' | 'employees'>('structures');

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
      const [structuresRes, salariesRes] = await Promise.all([
        getSalaryStructures(currentOrganizationId),
        getEmployeeSalaryDetails(currentOrganizationId),
      ]);
      setStructures(structuresRes.data);
      setEmployeeSalaries(salariesRes.data);
    } catch (err) {
      console.error('Failed to load salary data:', err);
      setError('Failed to load salary data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading salary data...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Salary Management</h1>
        <p>Manage salary structures and employee compensation</p>
      </div>

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
                <th>Code</th>
                <th>Base Salary</th>
                <th>Currency</th>
                <th>Grade</th>
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
                    <td>{structure.code}</td>
                    <td>${structure.baseSalary?.toLocaleString() || '0'}</td>
                    <td>{structure.currency || 'USD'}</td>
                    <td>{structure.salaryGrade || '-'}</td>
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
                    <td>{salary.employeeName || 'N/A'}</td>
                    <td>{salary.employeeNumber || '-'}</td>
                    <td>{salary.positionTitle || '-'}</td>
                    <td>{salary.structureName || '-'}</td>
                    <td>${salary.baseSalary?.toLocaleString() || '0'}</td>
                    <td>${salary.totalAllowances?.toLocaleString() || '0'}</td>
                    <td>
                      <strong>${salary.grossSalary?.toLocaleString() || '0'}</strong>
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


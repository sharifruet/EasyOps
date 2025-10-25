import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCases, deleteCase } from '../../services/crmService';
import './Crm.css';

interface Case {
  caseId: string;
  caseNumber: string;
  subject: string;
  status: string;
  priority: string;
  assignedTo?: string;
}

const CaseList: React.FC = () => {
  const navigate = useNavigate();
  const [cases, setCases] = useState<Case[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';

  useEffect(() => {
    loadCases();
  }, [statusFilter, priorityFilter]);

  const loadCases = async () => {
    try {
      setLoading(true);
      const data = await getCases(organizationId, statusFilter, priorityFilter);
      setCases(data);
    } catch (error) {
      console.error('Error loading cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this case?')) {
      try {
        await deleteCase(id);
        loadCases();
      } catch (error) {
        console.error('Error deleting case:', error);
      }
    }
  };

  if (loading) {
    return <div className="crm-loading">Loading cases...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Support Cases</h1>
        <button className="crm-btn-primary" onClick={() => navigate('/crm/cases/new')}>
          + New Case
        </button>
      </div>

      <div className="crm-filters">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="crm-filter-select">
          <option value="">All Statuses</option>
          <option value="NEW">New</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="crm-filter-select">
          <option value="">All Priorities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
      </div>

      <div className="crm-table-container">
        {cases.length === 0 ? (
          <div className="crm-empty-state">
            <p>No cases found</p>
            <button className="crm-btn-primary" onClick={() => navigate('/crm/cases/new')}>
              Create First Case
            </button>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Case Number</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem) => (
                <tr key={caseItem.caseId}>
                  <td>{caseItem.caseNumber}</td>
                  <td><strong>{caseItem.subject}</strong></td>
                  <td><span className={`crm-badge crm-badge-${caseItem.status.toLowerCase()}`}>{caseItem.status}</span></td>
                  <td><span className={`crm-badge crm-badge-${caseItem.priority.toLowerCase()}`}>{caseItem.priority}</span></td>
                  <td>
                    <div className="crm-action-buttons">
                      <button className="crm-btn-link" onClick={() => navigate(`/crm/cases/${caseItem.caseId}`)}>View</button>
                      <button className="crm-btn-link" onClick={() => navigate(`/crm/cases/${caseItem.caseId}/edit`)}>Edit</button>
                      <button className="crm-btn-link crm-btn-danger" onClick={() => handleDelete(caseItem.caseId)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CaseList;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCases, getCaseStats } from '../../services/crmService';
import './Crm.css';

interface CaseStats {
  totalCases: number;
  newCases: number;
  openCases: number;
  activeCases: number;
  resolvedCases: number;
  closedCases: number;
}

const CaseDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<CaseStats | null>(null);
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, casesData] = await Promise.all([
        getCaseStats(organizationId),
        getCases(organizationId)
      ]);
      setStats(statsData);
      setRecentCases(casesData.slice(0, 10));
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="crm-loading">Loading support dashboard...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Support Dashboard</h1>
        <button className="crm-btn-primary" onClick={() => navigate('/crm/cases/new')}>
          + New Case
        </button>
      </div>

      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <h3>Active Cases</h3>
          <p className="crm-stat-value">{stats?.activeCases || 0}</p>
        </div>
        <div className="crm-stat-card">
          <h3>New Cases</h3>
          <p className="crm-stat-value">{stats?.newCases || 0}</p>
        </div>
        <div className="crm-stat-card success">
          <h3>Resolved</h3>
          <p className="crm-stat-value">{stats?.resolvedCases || 0}</p>
        </div>
        <div className="crm-stat-card info">
          <h3>Closed</h3>
          <p className="crm-stat-value">{stats?.closedCases || 0}</p>
        </div>
      </div>

      <div className="crm-section">
        <h2>Recent Cases</h2>
        {recentCases.length === 0 ? (
          <p className="crm-empty-state">No cases found</p>
        ) : (
          <div className="crm-table-container">
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
                {recentCases.map((caseItem) => (
                  <tr key={caseItem.caseId}>
                    <td>{caseItem.caseNumber}</td>
                    <td><strong>{caseItem.subject}</strong></td>
                    <td><span className={`crm-badge crm-badge-${caseItem.status.toLowerCase()}`}>{caseItem.status}</span></td>
                    <td><span className={`crm-badge crm-badge-${caseItem.priority.toLowerCase()}`}>{caseItem.priority}</span></td>
                    <td>
                      <button className="crm-btn-link" onClick={() => navigate(`/crm/cases/${caseItem.caseId}`)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseDashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPipelineStats, getOpportunities, getClosingSoon } from '../../services/crmService';
import './Crm.css';

interface PipelineStats {
  totalOpen: number;
  totalWon: number;
  totalLost: number;
  totalOpportunities: number;
  winRate: number;
}

interface Opportunity {
  opportunityId: string;
  opportunityNumber: string;
  opportunityName: string;
  amount: number;
  expectedRevenue: number;
  expectedCloseDate: string;
  status: string;
}

const OpportunityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PipelineStats | null>(null);
  const [closingSoon, setClosingSoon] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000'; // Replace with actual org ID

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, closingSoonData] = await Promise.all([
        getPipelineStats(organizationId),
        getClosingSoon(organizationId, 30)
      ]);
      setStats(statsData);
      setClosingSoon(closingSoonData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return <div className="crm-loading">Loading dashboard...</div>;
  }

  return (
    <div className="crm-dashboard">
      <div className="crm-header">
        <h1>Opportunity Pipeline Dashboard</h1>
        <button 
          className="crm-btn-primary"
          onClick={() => navigate('/crm/opportunities/new')}
        >
          + New Opportunity
        </button>
      </div>

      {/* Stats Cards */}
      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <h3>Open Opportunities</h3>
          <p className="crm-stat-value">{stats?.totalOpen || 0}</p>
          <span className="crm-stat-label">Active Deals</span>
        </div>

        <div className="crm-stat-card success">
          <h3>Won Opportunities</h3>
          <p className="crm-stat-value">{stats?.totalWon || 0}</p>
          <span className="crm-stat-label">Closed Won</span>
        </div>

        <div className="crm-stat-card danger">
          <h3>Lost Opportunities</h3>
          <p className="crm-stat-value">{stats?.totalLost || 0}</p>
          <span className="crm-stat-label">Closed Lost</span>
        </div>

        <div className="crm-stat-card info">
          <h3>Win Rate</h3>
          <p className="crm-stat-value">{stats?.winRate || 0}%</p>
          <span className="crm-stat-label">Conversion Rate</span>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="crm-quick-actions">
        <button 
          className="crm-action-btn"
          onClick={() => navigate('/crm/opportunities')}
        >
          View All Opportunities
        </button>
        <button 
          className="crm-action-btn"
          onClick={() => navigate('/crm/pipeline')}
        >
          Pipeline View
        </button>
        <button 
          className="crm-action-btn"
          onClick={() => navigate('/crm/forecast')}
        >
          Sales Forecast
        </button>
      </div>

      {/* Closing Soon */}
      <div className="crm-section">
        <h2>Closing in Next 30 Days</h2>
        {closingSoon.length === 0 ? (
          <p className="crm-empty-state">No opportunities closing soon</p>
        ) : (
          <div className="crm-table-container">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Amount</th>
                  <th>Expected Revenue</th>
                  <th>Close Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {closingSoon.map((opp) => (
                  <tr key={opp.opportunityId}>
                    <td>
                      <div className="crm-opportunity-info">
                        <strong>{opp.opportunityName}</strong>
                        <small>{opp.opportunityNumber}</small>
                      </div>
                    </td>
                    <td>{formatCurrency(opp.amount)}</td>
                    <td>{formatCurrency(opp.expectedRevenue)}</td>
                    <td>{formatDate(opp.expectedCloseDate)}</td>
                    <td>
                      <button
                        className="crm-btn-link"
                        onClick={() => navigate(`/crm/opportunities/${opp.opportunityId}`)}
                      >
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

export default OpportunityDashboard;


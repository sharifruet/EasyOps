import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpportunities, deleteOpportunity } from '../../services/crmService';
import './Crm.css';

interface Opportunity {
  opportunityId: string;
  opportunityNumber: string;
  opportunityName: string;
  amount: number;
  expectedRevenue: number;
  expectedCloseDate: string;
  status: string;
  priority?: string;
  stageName?: string;
}

const OpportunityList: React.FC = () => {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000'; // Replace with actual org ID

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    filterOpportunities();
  }, [searchTerm, statusFilter, opportunities]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const data = await getOpportunities(organizationId);
      setOpportunities(data);
      setFilteredOpportunities(data);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = opportunities;

    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.opportunityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        opp.opportunityNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(opp => opp.status === statusFilter);
    }

    setFilteredOpportunities(filtered);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      try {
        await deleteOpportunity(id);
        loadOpportunities();
      } catch (error) {
        console.error('Error deleting opportunity:', error);
        alert('Failed to delete opportunity');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClass = status.toLowerCase();
    return <span className={`crm-badge crm-badge-${statusClass}`}>{status}</span>;
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    const priorityClass = priority.toLowerCase();
    return <span className={`crm-badge crm-badge-${priorityClass}`}>{priority}</span>;
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
    return <div className="crm-loading">Loading opportunities...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Opportunities</h1>
        <button 
          className="crm-btn-primary"
          onClick={() => navigate('/crm/opportunities/new')}
        >
          + New Opportunity
        </button>
      </div>

      {/* Filters */}
      <div className="crm-filters">
        <input
          type="text"
          className="crm-search"
          placeholder="Search opportunities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="crm-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
          <option value="ABANDONED">Abandoned</option>
        </select>
      </div>

      {/* Opportunities Table */}
      <div className="crm-table-container">
        {filteredOpportunities.length === 0 ? (
          <div className="crm-empty-state">
            <p>No opportunities found</p>
            <button 
              className="crm-btn-primary"
              onClick={() => navigate('/crm/opportunities/new')}
            >
              Create Your First Opportunity
            </button>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Opportunity Number</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Expected Revenue</th>
                <th>Expected Close</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.map((opp) => (
                <tr key={opp.opportunityId}>
                  <td>{opp.opportunityNumber}</td>
                  <td>
                    <strong>{opp.opportunityName}</strong>
                  </td>
                  <td>{formatCurrency(opp.amount)}</td>
                  <td>{formatCurrency(opp.expectedRevenue)}</td>
                  <td>{opp.expectedCloseDate ? formatDate(opp.expectedCloseDate) : '-'}</td>
                  <td>{getStatusBadge(opp.status)}</td>
                  <td>{getPriorityBadge(opp.priority)}</td>
                  <td>
                    <div className="crm-action-buttons">
                      <button
                        className="crm-btn-link"
                        onClick={() => navigate(`/crm/opportunities/${opp.opportunityId}`)}
                      >
                        View
                      </button>
                      <button
                        className="crm-btn-link"
                        onClick={() => navigate(`/crm/opportunities/${opp.opportunityId}/edit`)}
                      >
                        Edit
                      </button>
                      <button
                        className="crm-btn-link crm-btn-danger"
                        onClick={() => handleDelete(opp.opportunityId)}
                      >
                        Delete
                      </button>
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

export default OpportunityList;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getLeads, deleteLead, assignLead, qualifyLead, disqualifyLead, Lead } from '../../services/crmService';
import './Crm.css';

const LeadList: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const navigate = useNavigate();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    if (currentOrganizationId) {
      loadLeads();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadLeads = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const response = await getLeads(currentOrganizationId, {
        status: statusFilter || undefined,
        search: searchTerm || undefined,
      });
      setLeads(response.data);
    } catch (err) {
      console.error('Failed to load leads:', err);
      setError('Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;
    try {
      await deleteLead(id);
      loadLeads();
    } catch (err) {
      alert('Failed to delete lead');
    }
  };

  const handleQualify = async (id: string) => {
    if (!user?.id) return;
    try {
      await qualifyLead(id, user.id);
      loadLeads();
      alert('Lead qualified successfully!');
    } catch (err) {
      alert('Failed to qualify lead');
    }
  };

  if (loading) return <div className="loading">Loading leads...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const filteredLeads = leads.filter(lead => {
    if (ratingFilter && lead.rating !== ratingFilter) return false;
    return true;
  });

  return (
    <div className="crm-page">
      <div className="page-header">
        <h1>Leads</h1>
        <p>Manage and track your sales leads</p>
        <button onClick={() => navigate('/crm/leads/new')} className="btn-primary">
          + New Lead
        </button>
      </div>

      <div className="filters">
        <div className="filters-grid">
          <div className="form-row">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, email, company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="QUALIFIED">Qualified</option>
              <option value="UNQUALIFIED">Unqualified</option>
              <option value="CONVERTED">Converted</option>
              <option value="LOST">Lost</option>
            </select>
          </div>
          <div className="form-row">
            <label>Rating</label>
            <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
              <option value="">All Ratings</option>
              <option value="HOT">Hot</option>
              <option value="WARM">Warm</option>
              <option value="COLD">Cold</option>
            </select>
          </div>
        </div>
        <button onClick={loadLeads} className="btn-primary">
          Search
        </button>
      </div>

      <table className="crm-table">
        <thead>
          <tr>
            <th>Lead #</th>
            <th>Name</th>
            <th>Company</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Score</th>
            <th>Source</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeads.length === 0 ? (
            <tr>
              <td colSpan={11} className="no-data">
                No leads found
              </td>
            </tr>
          ) : (
            filteredLeads.map((lead) => (
              <tr key={lead.leadId}>
                <td>{lead.leadNumber}</td>
                <td>{lead.firstName} {lead.lastName}</td>
                <td>{lead.company || '-'}</td>
                <td>{lead.email || '-'}</td>
                <td>{lead.phone || '-'}</td>
                <td>
                  <span className={`status-badge status-${lead.status?.toLowerCase()}`}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  {lead.rating && (
                    <span className={`rating-${lead.rating?.toLowerCase()}`}>
                      {lead.rating}
                    </span>
                  )}
                </td>
                <td>
                  <span className={`lead-score lead-score-${(lead.leadScore || 0) >= 70 ? 'high' : (lead.leadScore || 0) >= 40 ? 'medium' : 'low'}`}>
                    {lead.leadScore || 0}
                  </span>
                </td>
                <td>{lead.leadSourceId || '-'}</td>
                <td>{new Date(lead.createdAt || '').toLocaleDateString()}</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => navigate(`/crm/leads/${lead.leadId}`)} className="btn-sm btn-primary">
                      View
                    </button>
                    {lead.status === 'CONTACTED' && (
                      <button onClick={() => handleQualify(lead.leadId!)} className="btn-sm btn-qualify">
                        Qualify
                      </button>
                    )}
                    <button onClick={() => handleDelete(lead.leadId!)} className="btn-sm btn-disqualify">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default LeadList;






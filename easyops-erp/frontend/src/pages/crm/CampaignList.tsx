import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaigns, deleteCampaign } from '../../services/crmService';
import './Crm.css';

interface Campaign {
  campaignId: string;
  campaignNumber: string;
  campaignName: string;
  campaignType: string;
  status: string;
  budgetedCost: number;
  actualCost: number;
}

const CampaignList: React.FC = () => {
  const navigate = useNavigate();
  const [campaigns, setcamp

aigns] = useState<Campaign[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getCampaigns(organizationId, statusFilter);
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await deleteCampaign(id);
        loadCampaigns();
      } catch (error) {
        console.error('Error deleting campaign:', error);
      }
    }
  };

  if (loading) {
    return <div className="crm-loading">Loading campaigns...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Campaigns</h1>
        <button 
          className="crm-btn-primary"
          onClick={() => navigate('/crm/campaigns/new')}
        >
          + New Campaign
        </button>
      </div>

      <div className="crm-filters">
        <select
          className="crm-filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="crm-table-container">
        {campaigns.length === 0 ? (
          <div className="crm-empty-state">
            <p>No campaigns found</p>
            <button className="crm-btn-primary" onClick={() => navigate('/crm/campaigns/new')}>
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <table className="crm-table">
            <thead>
              <tr>
                <th>Campaign</th>
                <th>Type</th>
                <th>Status</th>
                <th>Budget</th>
                <th>Actual Cost</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.campaignId}>
                  <td>
                    <strong>{campaign.campaignName}</strong>
                    <br />
                    <small>{campaign.campaignNumber}</small>
                  </td>
                  <td>{campaign.campaignType}</td>
                  <td><span className={`crm-badge crm-badge-${campaign.status.toLowerCase()}`}>{campaign.status}</span></td>
                  <td>${campaign.budgetedCost}</td>
                  <td>${campaign.actualCost}</td>
                  <td>
                    <div className="crm-action-buttons">
                      <button className="crm-btn-link" onClick={() => navigate(`/crm/campaigns/${campaign.campaignId}`)}>View</button>
                      <button className="crm-btn-link" onClick={() => navigate(`/crm/campaigns/${campaign.campaignId}/edit`)}>Edit</button>
                      <button className="crm-btn-link crm-btn-danger" onClick={() => handleDelete(campaign.campaignId)}>Delete</button>
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

export default CampaignList;


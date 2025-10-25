import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCampaigns, getCampaignStats } from '../../services/crmService';
import './Crm.css';

interface Campaign {
  campaignId: string;
  campaignNumber: string;
  campaignName: string;
  campaignType: string;
  status: string;
  startDate: string;
  endDate: string;
  budgetedCost: number;
  actualCost: number;
}

const CampaignDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await getCampaigns(organizationId, 'ACTIVE');
      setActiveCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="crm-loading">Loading campaigns...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Campaign Dashboard</h1>
        <button 
          className="crm-btn-primary"
          onClick={() => navigate('/crm/campaigns/new')}
        >
          + New Campaign
        </button>
      </div>

      <div className="crm-stats-grid">
        <div className="crm-stat-card">
          <h3>Active Campaigns</h3>
          <p className="crm-stat-value">{activeCampaigns.length}</p>
        </div>
      </div>

      <div className="crm-section">
        <h2>Active Campaigns</h2>
        {activeCampaigns.length === 0 ? (
          <p className="crm-empty-state">No active campaigns</p>
        ) : (
          <div className="crm-table-container">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Budget</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeCampaigns.map((campaign) => (
                  <tr key={campaign.campaignId}>
                    <td>
                      <strong>{campaign.campaignName}</strong>
                      <br />
                      <small>{campaign.campaignNumber}</small>
                    </td>
                    <td><span className="crm-badge">{campaign.campaignType}</span></td>
                    <td>{campaign.startDate}</td>
                    <td>{campaign.endDate}</td>
                    <td>${campaign.budgetedCost}</td>
                    <td>
                      <button
                        className="crm-btn-link"
                        onClick={() => navigate(`/crm/campaigns/${campaign.campaignId}`)}
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

export default CampaignDashboard;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpportunityStages, getOpportunities } from '../../services/crmService';
import './Crm.css';

interface Stage {
  stageId: string;
  stageName: string;
  stageOrder: number;
  probability: number;
}

interface Opportunity {
  opportunityId: string;
  opportunityName: string;
  opportunityNumber: string;
  amount: number;
  expectedRevenue: number;
  stageId: string;
  priority?: string;
}

const PipelineKanban: React.FC = () => {
  const navigate = useNavigate();
  const [stages, setStages] = useState<Stage[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000'; // Replace with actual org ID

  useEffect(() => {
    loadPipelineData();
  }, []);

  const loadPipelineData = async () => {
    try {
      setLoading(true);
      const [stagesData, oppsData] = await Promise.all([
        getOpportunityStages(organizationId),
        getOpportunities(organizationId, 'OPEN')
      ]);
      setStages(stagesData.sort((a, b) => a.stageOrder - b.stageOrder));
      setOpportunities(oppsData);
    } catch (error) {
      console.error('Error loading pipeline data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOpportunitiesByStage = (stageId: string) => {
    return opportunities.filter(opp => opp.stageId === stageId);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateStageTotal = (stageId: string) => {
    const stageOpps = getOpportunitiesByStage(stageId);
    return stageOpps.reduce((sum, opp) => sum + (opp.expectedRevenue || 0), 0);
  };

  if (loading) {
    return <div className="crm-loading">Loading pipeline...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Sales Pipeline</h1>
        <button 
          className="crm-btn-primary"
          onClick={() => navigate('/crm/opportunities/new')}
        >
          + New Opportunity
        </button>
      </div>

      <div className="crm-pipeline-kanban">
        {stages.map(stage => {
          const stageOpps = getOpportunitiesByStage(stage.stageId);
          const stageTotal = calculateStageTotal(stage.stageId);

          return (
            <div key={stage.stageId} className="crm-kanban-column">
              <div className="crm-kanban-header">
                <h3>{stage.stageName}</h3>
                <div className="crm-kanban-meta">
                  <span className="crm-kanban-count">{stageOpps.length} deals</span>
                  <span className="crm-kanban-total">{formatCurrency(stageTotal)}</span>
                  <span className="crm-kanban-probability">{stage.probability}%</span>
                </div>
              </div>
              
              <div className="crm-kanban-cards">
                {stageOpps.length === 0 ? (
                  <div className="crm-kanban-empty">No opportunities</div>
                ) : (
                  stageOpps.map(opp => (
                    <div 
                      key={opp.opportunityId}
                      className="crm-kanban-card"
                      onClick={() => navigate(`/crm/opportunities/${opp.opportunityId}`)}
                    >
                      <div className="crm-kanban-card-header">
                        <h4>{opp.opportunityName}</h4>
                        {opp.priority && (
                          <span className={`crm-badge crm-badge-${opp.priority.toLowerCase()}`}>
                            {opp.priority}
                          </span>
                        )}
                      </div>
                      <p className="crm-kanban-card-number">{opp.opportunityNumber}</p>
                      <div className="crm-kanban-card-footer">
                        <strong>{formatCurrency(opp.amount)}</strong>
                        <span className="crm-kanban-card-expected">
                          Expected: {formatCurrency(opp.expectedRevenue)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {stages.length === 0 && (
        <div className="crm-empty-state">
          <p>No pipeline stages configured</p>
          <p className="crm-help-text">Contact your administrator to set up sales stages</p>
        </div>
      )}
    </div>
  );
};

export default PipelineKanban;


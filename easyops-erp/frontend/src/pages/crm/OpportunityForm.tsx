import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  getOpportunityById, 
  createOpportunity, 
  updateOpportunity,
  getAccounts,
  getOpportunityStages
} from '../../services/crmService';
import './Crm.css';

interface OpportunityFormData {
  opportunityId?: string;
  organizationId: string;
  opportunityName: string;
  accountId: string;
  stageId: string;
  type: string;
  amount: number;
  currency: string;
  probability: number;
  expectedCloseDate: string;
  ownerId?: string;
  status: string;
  description?: string;
  nextStep?: string;
  priority?: string;
}

const OpportunityForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const organizationId = '123e4567-e89b-12d3-a456-426614174000'; // Replace with actual org ID

  const [formData, setFormData] = useState<OpportunityFormData>({
    organizationId,
    opportunityName: '',
    accountId: '',
    stageId: '',
    type: 'NEW_BUSINESS',
    amount: 0,
    currency: 'USD',
    probability: 0,
    expectedCloseDate: '',
    status: 'OPEN',
    priority: 'MEDIUM'
  });

  const [accounts, setAccounts] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadFormData();
  }, [id]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const [accountsData, stagesData] = await Promise.all([
        getAccounts(organizationId),
        getOpportunityStages(organizationId)
      ]);
      setAccounts(accountsData);
      setStages(stagesData);

      if (isEdit && id) {
        const opportunity = await getOpportunityById(id);
        setFormData(opportunity);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setLoading(true);

    try {
      if (isEdit && id) {
        await updateOpportunity(id, formData);
      } else {
        await createOpportunity(formData);
      }
      navigate('/crm/opportunities');
    } catch (error: any) {
      console.error('Error saving opportunity:', error);
      setSubmitError(error.message || 'Failed to save opportunity');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>{isEdit ? 'Edit Opportunity' : 'New Opportunity'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="crm-form">
        {submitError && (
          <div className="crm-error-message">{submitError}</div>
        )}

        <div className="crm-form-grid">
          <div className="crm-form-group">
            <label>Opportunity Name *</label>
            <input
              type="text"
              name="opportunityName"
              value={formData.opportunityName}
              onChange={handleChange}
              required
              placeholder="Enter opportunity name"
            />
          </div>

          <div className="crm-form-group">
            <label>Account *</label>
            <select
              name="accountId"
              value={formData.accountId}
              onChange={handleChange}
              required
            >
              <option value="">Select Account</option>
              {accounts.map(account => (
                <option key={account.accountId} value={account.accountId}>
                  {account.accountName}
                </option>
              ))}
            </select>
          </div>

          <div className="crm-form-group">
            <label>Stage *</label>
            <select
              name="stageId"
              value={formData.stageId}
              onChange={handleChange}
              required
            >
              <option value="">Select Stage</option>
              {stages.map(stage => (
                <option key={stage.stageId} value={stage.stageId}>
                  {stage.stageName} ({stage.probability}%)
                </option>
              ))}
            </select>
          </div>

          <div className="crm-form-group">
            <label>Type *</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="NEW_BUSINESS">New Business</option>
              <option value="EXISTING_BUSINESS">Existing Business</option>
              <option value="RENEWAL">Renewal</option>
              <option value="UPSELL">Upsell</option>
              <option value="CROSS_SELL">Cross-sell</option>
            </select>
          </div>

          <div className="crm-form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleNumberChange}
              required
              step="0.01"
              min="0"
            />
          </div>

          <div className="crm-form-group">
            <label>Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
          </div>

          <div className="crm-form-group">
            <label>Probability (%)</label>
            <input
              type="number"
              name="probability"
              value={formData.probability}
              onChange={handleNumberChange}
              min="0"
              max="100"
              step="1"
            />
          </div>

          <div className="crm-form-group">
            <label>Expected Close Date *</label>
            <input
              type="date"
              name="expectedCloseDate"
              value={formData.expectedCloseDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="crm-form-group">
            <label>Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>

          <div className="crm-form-group crm-form-group-full">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              placeholder="Enter opportunity description"
            />
          </div>

          <div className="crm-form-group crm-form-group-full">
            <label>Next Step</label>
            <textarea
              name="nextStep"
              value={formData.nextStep || ''}
              onChange={handleChange}
              rows={2}
              placeholder="What's the next action?"
            />
          </div>
        </div>

        <div className="crm-form-actions">
          <button
            type="button"
            className="crm-btn-secondary"
            onClick={() => navigate('/crm/opportunities')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="crm-btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEdit ? 'Update Opportunity' : 'Create Opportunity')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OpportunityForm;


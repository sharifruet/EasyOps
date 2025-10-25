import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getBonuses } from '../../services/hrService';
import './Hr.css';

const BonusManagement: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [bonuses, setBonuses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganizationId) {
      loadBonuses();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadBonuses = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const response = await getBonuses(currentOrganizationId);
      setBonuses(response.data);
    } catch (err) {
      console.error('Failed to load bonuses:', err);
      setError('Failed to load bonuses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading bonuses...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const totalYTD = bonuses.reduce((sum, b) => sum + (b.amount || 0), 0);
  const pendingBonuses = bonuses.filter(b => b.status === 'PENDING');
  const approvedBonuses = bonuses.filter(b => b.status === 'APPROVED');

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Bonus Management</h1>
        <p>View and track employee bonuses</p>
      </div>

      <div className="hr-summary-cards">
        <div className="hr-summary-card">
          <h3>Total Bonuses (YTD)</h3>
          <div className="hr-card-value">${totalYTD.toLocaleString()}</div>
          <small>{bonuses.length} bonuses</small>
        </div>
        <div className="hr-summary-card">
          <h3>Pending</h3>
          <div className="hr-card-value">{pendingBonuses.length}</div>
          <small>Awaiting approval</small>
        </div>
        <div className="hr-summary-card">
          <h3>Approved</h3>
          <div className="hr-card-value">{approvedBonuses.length}</div>
          <small>Ready for payout</small>
        </div>
      </div>

      <div className="hr-section">
        <h2>My Bonuses</h2>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Period</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Approved By</th>
              <th>Payment Date</th>
            </tr>
          </thead>
          <tbody>
            {bonuses.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>
                  No bonuses found.
                </td>
              </tr>
            ) : (
              bonuses.map((bonus) => (
                <tr key={bonus.bonusId}>
                  <td>{bonus.bonusType}</td>
                  <td><strong>${bonus.amount?.toLocaleString() || '0'}</strong></td>
                  <td>
                    {bonus.periodStart && bonus.periodEnd
                      ? `${new Date(bonus.periodStart).toLocaleDateString()} - ${new Date(bonus.periodEnd).toLocaleDateString()}`
                      : '-'}
                  </td>
                  <td>{bonus.reason || '-'}</td>
                  <td>
                    <span className={`status-badge status-${bonus.status?.toLowerCase()}`}>
                      {bonus.status}
                    </span>
                  </td>
                  <td>{bonus.approvedByName || '-'}</td>
                  <td>{bonus.paymentDate ? new Date(bonus.paymentDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="hr-section">
        <h2>Bonus Information</h2>
        <div className="info-cards">
          <div className="info-card">
            <h3>📊 Performance Bonus</h3>
            <p>Awarded based on individual or team performance metrics and goal achievements.</p>
          </div>
          <div className="info-card">
            <h3>🎯 Annual Bonus</h3>
            <p>Yearly bonus based on company performance and individual contributions.</p>
          </div>
          <div className="info-card">
            <h3>🌟 Spot Bonus</h3>
            <p>One-time bonus for exceptional work or going above and beyond.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusManagement;


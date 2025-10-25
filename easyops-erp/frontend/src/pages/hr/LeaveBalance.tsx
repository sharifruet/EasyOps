import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getLeaveBalances, getLeaveTypes } from '../../services/hrService';
import './Hr.css';

const LeaveBalance: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [balances, setBalances] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganizationId) {
      loadData();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadData = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const [balancesRes, typesRes] = await Promise.all([
        getLeaveBalances(currentOrganizationId),
        getLeaveTypes(currentOrganizationId),
      ]);
      setBalances(balancesRes.data);
      setLeaveTypes(typesRes.data);
    } catch (err) {
      console.error('Failed to load leave balances:', err);
      setError('Failed to load leave balances');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading leave balances...</div>;
  if (error) return <div className="error-message">{error}</div>;

  const calculateUsedPercentage = (used: number, total: number) => {
    if (!total) return 0;
    return Math.round((used / total) * 100);
  };

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Leave Balance</h1>
        <p>View your available leave balances</p>
      </div>

      <div className="hr-summary-cards">
        {balances.map((balance) => {
          const usedPercent = calculateUsedPercentage(balance.usedDays || 0, balance.totalDays || 0);
          return (
            <div key={balance.leaveBalanceId} className="hr-summary-card">
              <h3>{balance.leaveTypeName || 'Leave Type'}</h3>
              <div className="leave-balance-details">
                <div className="balance-stat">
                  <span className="stat-label">Total</span>
                  <span className="stat-value">{balance.totalDays || 0} days</span>
                </div>
                <div className="balance-stat">
                  <span className="stat-label">Used</span>
                  <span className="stat-value">{balance.usedDays || 0} days</span>
                </div>
                <div className="balance-stat">
                  <span className="stat-label">Available</span>
                  <span className="stat-value highlight">{balance.remainingDays || 0} days</span>
                </div>
                <div className="balance-stat">
                  <span className="stat-label">Pending</span>
                  <span className="stat-value">{balance.pendingDays || 0} days</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${usedPercent}%`, backgroundColor: usedPercent > 80 ? '#f44336' : '#4caf50' }}
                  />
                </div>
                <small>{usedPercent}% used</small>
              </div>
            </div>
          );
        })}
      </div>

      {balances.length === 0 && (
        <div className="hr-section">
          <p style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
            No leave balances found. Leave balances are automatically created when employees are added.
          </p>
        </div>
      )}

      <div className="hr-section">
        <h2>Leave Types Information</h2>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Code</th>
              <th>Annual Quota</th>
              <th>Carry Forward</th>
              <th>Paid/Unpaid</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((type) => (
              <tr key={type.leaveTypeId}>
                <td><strong>{type.name}</strong></td>
                <td>{type.code}</td>
                <td>{type.annualQuota} days</td>
                <td>{type.allowCarryForward ? 'Yes' : 'No'}</td>
                <td>
                  <span className={type.isPaid ? 'status-badge status-active' : 'status-badge status-inactive'}>
                    {type.isPaid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
              </tr>
            ))}
            {leaveTypes.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No leave types configured
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveBalance;


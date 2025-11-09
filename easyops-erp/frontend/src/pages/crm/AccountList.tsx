import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getAccounts, deleteAccount, Account } from '../../services/crmService';
import './Crm.css';

const AccountList: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    if (currentOrganizationId) {
      loadAccounts();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadAccounts = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const response = await getAccounts(currentOrganizationId, {
        accountType: typeFilter || undefined,
        search: searchTerm || undefined,
      });
      setAccounts(response.data);
    } catch (err) {
      console.error('Failed to load accounts:', err);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    try {
      await deleteAccount(id);
      loadAccounts();
    } catch (err) {
      alert('Failed to delete account');
    }
  };

  if (loading) return <div className="loading">Loading accounts...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="crm-page">
      <div className="page-header">
        <h1>Accounts</h1>
        <p>Manage customer accounts and companies</p>
        <button onClick={() => navigate('/crm/accounts/new')} className="btn-primary">
          + New Account
        </button>
      </div>

      <div className="filters">
        <div className="filters-grid">
          <div className="form-row">
            <label>Search</label>
            <input
              type="text"
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">All Types</option>
              <option value="CUSTOMER">Customer</option>
              <option value="PROSPECT">Prospect</option>
              <option value="PARTNER">Partner</option>
            </select>
          </div>
        </div>
        <button onClick={loadAccounts} className="btn-primary">
          Search
        </button>
      </div>

      <table className="crm-table">
        <thead>
          <tr>
            <th>Account #</th>
            <th>Name</th>
            <th>Type</th>
            <th>Industry</th>
            <th>Phone</th>
            <th>Email</th>
            <th>City</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.length === 0 ? (
            <tr>
              <td colSpan={9} className="no-data">
                No accounts found
              </td>
            </tr>
          ) : (
            accounts.map((account) => (
              <tr key={account.accountId}>
                <td>{account.accountNumber}</td>
                <td><strong>{account.accountName}</strong></td>
                <td>{account.accountType || '-'}</td>
                <td>{account.industry || '-'}</td>
                <td>{account.phone || '-'}</td>
                <td>{account.email || '-'}</td>
                <td>{account.billingCity || '-'}</td>
                <td>
                  <span className={`status-badge ${account.isActive ? 'status-qualified' : 'status-unqualified'}`}>
                    {account.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => navigate(`/crm/accounts/${account.accountId}`)} className="btn-sm btn-primary">
                      View
                    </button>
                    <button onClick={() => navigate(`/crm/accounts/${account.accountId}/edit`)} className="btn-sm btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(account.accountId!)} className="btn-sm btn-disqualify">
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

export default AccountList;








import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getContacts, deleteContact, Contact } from '../../services/crmService';
import './Crm.css';

const ContactList: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (currentOrganizationId) {
      loadContacts();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadContacts = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const response = await getContacts(currentOrganizationId, {
        search: searchTerm || undefined,
      });
      setContacts(response.data);
    } catch (err) {
      console.error('Failed to load contacts:', err);
      setError('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await deleteContact(id);
      loadContacts();
    } catch (err) {
      alert('Failed to delete contact');
    }
  };

  if (loading) return <div className="loading">Loading contacts...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="crm-page">
      <div className="page-header">
        <h1>Contacts</h1>
        <p>Manage individual contacts</p>
        <button onClick={() => navigate('/crm/contacts/new')} className="btn-primary">
          + New Contact
        </button>
      </div>

      <div className="filters">
        <div className="form-row">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button onClick={loadContacts} className="btn-primary">
          Search
        </button>
      </div>

      <table className="crm-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Job Title</th>
            <th>Account</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Mobile</th>
            <th>Primary</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {contacts.length === 0 ? (
            <tr>
              <td colSpan={9} className="no-data">
                No contacts found
              </td>
            </tr>
          ) : (
            contacts.map((contact) => (
              <tr key={contact.contactId}>
                <td><strong>{contact.firstName} {contact.lastName}</strong></td>
                <td>{contact.jobTitle || '-'}</td>
                <td>{contact.accountId || '-'}</td>
                <td>{contact.email || '-'}</td>
                <td>{contact.phone || '-'}</td>
                <td>{contact.mobile || '-'}</td>
                <td>{contact.isPrimary ? '⭐' : ''}</td>
                <td>
                  <span className={`status-badge ${contact.isActive ? 'status-qualified' : 'status-unqualified'}`}>
                    {contact.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => navigate(`/crm/contacts/${contact.contactId}`)} className="btn-sm btn-primary">
                      View
                    </button>
                    <button onClick={() => navigate(`/crm/contacts/${contact.contactId}/edit`)} className="btn-sm btn-secondary">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(contact.contactId!)} className="btn-sm btn-disqualify">
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

export default ContactList;





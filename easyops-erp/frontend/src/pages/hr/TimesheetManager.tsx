import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getTimesheets, createTimesheet, submitTimesheet } from '../../services/hrService';
import './Hr.css';

const TimesheetManager: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (currentOrganizationId) {
      loadTimesheets();
    } else {
      setLoading(false);
      setError('No organization selected');
    }
  }, [currentOrganizationId]);

  const loadTimesheets = async () => {
    if (!currentOrganizationId) return;
    try {
      setLoading(true);
      const response = await getTimesheets(currentOrganizationId);
      setTimesheets(response.data);
    } catch (err) {
      console.error('Failed to load timesheets:', err);
      setError('Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (timesheetId: string) => {
    try {
      await submitTimesheet(timesheetId);
      loadTimesheets();
      alert('Timesheet submitted successfully!');
    } catch (err) {
      console.error('Failed to submit timesheet:', err);
      alert('Failed to submit timesheet');
    }
  };

  if (loading) return <div className="loading">Loading timesheets...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Timesheet Management</h1>
        <p>Track and submit your weekly timesheets</p>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          + New Timesheet
        </button>
      </div>

      <div className="hr-section">
        <h2>My Timesheets</h2>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Period</th>
              <th>Total Hours</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {timesheets.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  No timesheets found. Create your first timesheet to get started.
                </td>
              </tr>
            ) : (
              timesheets.map((ts) => (
                <tr key={ts.timesheetId}>
                  <td>Week {ts.weekNumber}</td>
                  <td>
                    {new Date(ts.periodStart).toLocaleDateString()} - {new Date(ts.periodEnd).toLocaleDateString()}
                  </td>
                  <td>{ts.totalHours || 0} hrs</td>
                  <td>
                    <span className={`status-badge status-${ts.status?.toLowerCase()}`}>
                      {ts.status}
                    </span>
                  </td>
                  <td>{ts.submittedAt ? new Date(ts.submittedAt).toLocaleDateString() : '-'}</td>
                  <td>
                    {ts.status === 'DRAFT' && (
                      <button onClick={() => handleSubmit(ts.timesheetId)} className="btn-sm btn-primary">
                        Submit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimesheetManager;


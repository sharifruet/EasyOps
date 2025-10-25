import React, { useState, useEffect } from 'react';
import { getTodayAttendance, clockIn, clockOut } from '../../services/hrService';
import { useAuth } from '../../contexts/AuthContext';
import '../hr/Hr.css';

const AttendanceDashboard: React.FC = () => {
  const { currentOrganizationId, user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [currentRecord, setCurrentRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [workLocation, setWorkLocation] = useState('Office');

  useEffect(() => {
    if (currentOrganizationId) {
      loadTodayAttendance();
    }
  }, [currentOrganizationId]);

  const loadTodayAttendance = async () => {
    if (!currentOrganizationId) return;
    try {
      const response = await getTodayAttendance(currentOrganizationId);
      setTodayAttendance(response.data);
      
      // Find current user's record
      const myRecord = response.data.find((r: any) => r.employeeId === user?.id);
      setCurrentRecord(myRecord);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const handleClockIn = async () => {
    if (!user?.id || !currentOrganizationId) return;
    setLoading(true);
    try {
      await clockIn(user.id, currentOrganizationId, workLocation);
      loadTodayAttendance();
      alert('Clocked in successfully!');
    } catch (error) {
      console.error('Clock in failed:', error);
      alert('Failed to clock in');
    }
    setLoading(false);
  };

  const handleClockOut = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      await clockOut(user.id);
      loadTodayAttendance();
      alert('Clocked out successfully!');
    } catch (error) {
      console.error('Clock out failed:', error);
      alert('Failed to clock out');
    }
    setLoading(false);
  };

  const formatTime = (dateTime: string) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleTimeString();
  };

  const calculateHours = (record: any) => {
    if (!record.clockInTime || !record.clockOutTime) return '-';
    return record.totalHours || '-';
  };

  const presentCount = todayAttendance.filter(r => r.status === 'present').length;
  const absentCount = todayAttendance.filter(r => r.status === 'absent').length;
  const lateCount = todayAttendance.filter(r => r.status === 'late').length;

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>Attendance Dashboard</h1>
        <p>Track daily attendance and clock in/out</p>
      </div>

      <div className="hr-summary-cards">
        <div className="hr-summary-card">
          <h3>Present Today</h3>
          <div className="hr-card-value">{presentCount}</div>
        </div>
        <div className="hr-summary-card">
          <h3>Absent</h3>
          <div className="hr-card-value">{absentCount}</div>
        </div>
        <div className="hr-summary-card">
          <h3>Late</h3>
          <div className="hr-card-value">{lateCount}</div>
        </div>
        <div className="hr-summary-card">
          <h3>Total</h3>
          <div className="hr-card-value">{todayAttendance.length}</div>
        </div>
      </div>

      {/* Clock In/Out Section */}
      <div className="hr-section">
        <h2>My Attendance</h2>
        <div className="clock-in-out-panel">
          {!currentRecord?.clockInTime ? (
            <div>
              <h3>Start Your Day</h3>
              <div className="form-row">
                <label>Work Location:</label>
                <select value={workLocation} onChange={(e) => setWorkLocation(e.target.value)}>
                  <option value="Office">Office</option>
                  <option value="Remote">Remote</option>
                  <option value="Client Site">Client Site</option>
                </select>
              </div>
              <button onClick={handleClockIn} disabled={loading} className="btn-primary">
                🕐 Clock In
              </button>
            </div>
          ) : !currentRecord?.clockOutTime ? (
            <div>
              <h3>You're Clocked In</h3>
              <p>Clock In: {formatTime(currentRecord.clockInTime)}</p>
              <p>Location: {currentRecord.workLocation}</p>
              <button onClick={handleClockOut} disabled={loading} className="btn-danger">
                🕐 Clock Out
              </button>
            </div>
          ) : (
            <div>
              <h3>✅ Day Complete</h3>
              <p>Clock In: {formatTime(currentRecord.clockInTime)}</p>
              <p>Clock Out: {formatTime(currentRecord.clockOutTime)}</p>
              <p>Total Hours: {calculateHours(currentRecord)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Attendance Table */}
      <div className="hr-section">
        <h2>Today's Attendance</h2>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Clock In</th>
              <th>Clock Out</th>
              <th>Total Hours</th>
              <th>Status</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody>
            {todayAttendance.map((record) => (
              <tr key={record.attendanceId}>
                <td>{record.employeeNumber || 'N/A'}</td>
                <td>{formatTime(record.clockInTime)}</td>
                <td>{formatTime(record.clockOutTime)}</td>
                <td>{calculateHours(record)}</td>
                <td>
                  <span className={`status-badge status-${record.status}`}>
                    {record.status}
                  </span>
                </td>
                <td>{record.workLocation || '-'}</td>
              </tr>
            ))}
            {todayAttendance.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  No attendance records for today
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceDashboard;


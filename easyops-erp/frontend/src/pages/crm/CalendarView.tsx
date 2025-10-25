import React, { useState, useEffect } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/crmService';
import './Crm.css';

interface Event {
  eventId?: string;
  organizationId: string;
  subject: string;
  description?: string;
  eventType?: string;
  startDatetime: string;
  endDatetime: string;
  location?: string;
  status: string;
}

const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  const userId = '123e4567-e89b-12d3-a456-426614174001';

  const [formData, setFormData] = useState<Event>({
    organizationId,
    subject: '',
    description: '',
    eventType: 'MEETING',
    startDatetime: '',
    endDatetime: '',
    location: '',
    status: 'PLANNED'
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents(organizationId, userId);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.eventId) {
        await updateEvent(formData.eventId, formData);
      } else {
        await createEvent(formData);
      }
      setShowForm(false);
      resetForm();
      loadEvents();
    } catch (error) {
      console.error('Error saving event:', error);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (window.confirm('Delete this event?')) {
      try {
        await deleteEvent(eventId);
        loadEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      organizationId,
      subject: '',
      description: '',
      eventType: 'MEETING',
      startDatetime: '',
      endDatetime: '',
      location: '',
      status: 'PLANNED'
    });
  };

  if (loading) {
    return <div className="crm-loading">Loading calendar...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Calendar</h1>
        <button className="crm-btn-primary" onClick={() => setShowForm(true)}>
          + New Event
        </button>
      </div>

      {showForm && (
        <div className="crm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{formData.eventId ? 'Edit Event' : 'New Event'}</h2>
            <form onSubmit={handleSubmit} className="crm-form">
              <div className="crm-form-group">
                <label>Subject *</label>
                <input type="text" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} required />
              </div>
              <div className="crm-form-group">
                <label>Event Type</label>
                <select value={formData.eventType} onChange={(e) => setFormData({...formData, eventType: e.target.value})}>
                  <option value="MEETING">Meeting</option>
                  <option value="CALL">Call</option>
                  <option value="WEBINAR">Webinar</option>
                  <option value="CONFERENCE">Conference</option>
                  <option value="DEMO">Demo</option>
                </select>
              </div>
              <div className="crm-form-group">
                <label>Start *</label>
                <input type="datetime-local" value={formData.startDatetime} onChange={(e) => setFormData({...formData, startDatetime: e.target.value})} required />
              </div>
              <div className="crm-form-group">
                <label>End *</label>
                <input type="datetime-local" value={formData.endDatetime} onChange={(e) => setFormData({...formData, endDatetime: e.target.value})} required />
              </div>
              <div className="crm-form-group crm-form-group-full">
                <label>Location</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="crm-form-group crm-form-group-full">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <div className="crm-form-actions">
                <button type="button" className="crm-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="crm-btn-primary">Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="crm-event-list">
        {events.length === 0 ? (
          <p className="crm-empty-state">No events scheduled</p>
        ) : (
          events.map((event) => (
            <div key={event.eventId} className="crm-event-item">
              <div className="crm-event-header">
                <h4>{event.subject}</h4>
                <span className="crm-badge">{event.eventType}</span>
              </div>
              <p className="crm-event-time">
                {new Date(event.startDatetime).toLocaleString()} - {new Date(event.endDatetime).toLocaleString()}
              </p>
              {event.location && <p className="crm-event-location">📍 {event.location}</p>}
              {event.description && <p>{event.description}</p>}
              <div className="crm-event-actions">
                <button className="crm-btn-link" onClick={() => event.eventId && handleDelete(event.eventId)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CalendarView;


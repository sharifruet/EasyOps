import React, { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask, completeTask } from '../../services/crmService';
import './Crm.css';

interface Task {
  taskId?: string;
  organizationId: string;
  subject: string;
  description?: string;
  taskType?: string;
  status: string;
  priority: string;
  dueDate?: string;
  assignedTo?: string;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const organizationId = '123e4567-e89b-12d3-a456-426614174000';
  const userId = '123e4567-e89b-12d3-a456-426614174001';

  const [formData, setFormData] = useState<Task>({
    organizationId,
    subject: '',
    description: '',
    taskType: 'TODO',
    status: 'NOT_STARTED',
    priority: 'MEDIUM',
    dueDate: '',
    assignedTo: userId
  });

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getTasks(organizationId, userId);
      setTasks(data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.taskId) {
        await updateTask(formData.taskId, formData);
      } else {
        await createTask(formData);
      }
      setShowForm(false);
      resetForm();
      loadTasks();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleComplete = async (taskId: string) => {
    try {
      await completeTask(taskId, userId, 'Completed');
      loadTasks();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    if (window.confirm('Delete this task?')) {
      try {
        await deleteTask(taskId);
        loadTasks();
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      organizationId,
      subject: '',
      description: '',
      taskType: 'TODO',
      status: 'NOT_STARTED',
      priority: 'MEDIUM',
      dueDate: '',
      assignedTo: userId
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'crm-badge-high';
      case 'MEDIUM': return 'crm-badge-medium';
      case 'LOW': return 'crm-badge-low';
      default: return '';
    }
  };

  if (loading) {
    return <div className="crm-loading">Loading tasks...</div>;
  }

  return (
    <div className="crm-container">
      <div className="crm-header">
        <h1>Task Manager</h1>
        <button className="crm-btn-primary" onClick={() => setShowForm(true)}>
          + New Task
        </button>
      </div>

      {showForm && (
        <div className="crm-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="crm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{formData.taskId ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSubmit} className="crm-form">
              <div className="crm-form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  required
                />
              </div>
              <div className="crm-form-group">
                <label>Type</label>
                <select value={formData.taskType} onChange={(e) => setFormData({...formData, taskType: e.target.value})}>
                  <option value="TODO">To-Do</option>
                  <option value="CALL">Call</option>
                  <option value="EMAIL">Email</option>
                  <option value="MEETING">Meeting</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                </select>
              </div>
              <div className="crm-form-group">
                <label>Priority</label>
                <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="crm-form-group">
                <label>Due Date</label>
                <input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <div className="crm-form-group crm-form-group-full">
                <label>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
              </div>
              <div className="crm-form-actions">
                <button type="button" className="crm-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="crm-btn-primary">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="crm-task-list">
        {tasks.length === 0 ? (
          <p className="crm-empty-state">No tasks found</p>
        ) : (
          tasks.map((task) => (
            <div key={task.taskId} className="crm-task-item">
              <div className="crm-task-header">
                <h4>{task.subject}</h4>
                <span className={`crm-badge ${getPriorityColor(task.priority)}`}>{task.priority}</span>
              </div>
              {task.description && <p>{task.description}</p>}
              <div className="crm-task-meta">
                <span className="crm-task-type">{task.taskType}</span>
                {task.dueDate && <span className="crm-task-due">Due: {task.dueDate}</span>}
                <span className={`crm-badge crm-badge-${task.status?.toLowerCase()}`}>{task.status}</span>
              </div>
              <div className="crm-task-actions">
                {task.status !== 'COMPLETED' && (
                  <button className="crm-btn-link" onClick={() => task.taskId && handleComplete(task.taskId)}>
                    Complete
                  </button>
                )}
                <button className="crm-btn-link" onClick={() => task.taskId && handleDelete(task.taskId)}>
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

export default TaskManager;


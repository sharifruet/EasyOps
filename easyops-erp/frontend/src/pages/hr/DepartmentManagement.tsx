import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getDepartments, 
  createDepartment, 
  updateDepartment, 
  deleteDepartment,
  getEmployees,
  Department,
  Employee
} from '../../services/hrService';
import './Hr.css';

const DepartmentManagement: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    managerId: '',
    parentDepartmentId: '',
  });

  useEffect(() => {
    if (currentOrganizationId) {
      loadData();
    }
  }, [currentOrganizationId]);

  const loadData = async () => {
    if (!currentOrganizationId) return;

    try {
      setLoading(true);
      setError(null);

      const [departmentsRes, employeesRes] = await Promise.all([
        getDepartments(currentOrganizationId),
        getEmployees(currentOrganizationId, { status: 'ACTIVE' })
      ]);

      setDepartments(departmentsRes.data);
      setEmployees(employeesRes.data);
    } catch (err: any) {
      console.error('Failed to load departments:', err);
      setError(err.response?.data?.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      managerId: '',
      parentDepartmentId: '',
    });
    setShowModal(true);
  };

  const openEditModal = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description || '',
      managerId: department.managerId || '',
      parentDepartmentId: department.parentDepartmentId || '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDepartment(null);
    setFormData({
      name: '',
      description: '',
      managerId: '',
      parentDepartmentId: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganizationId) return;

    try {
      const departmentData: Department = {
        organizationId: currentOrganizationId,
        name: formData.name,
        description: formData.description || undefined,
        managerId: formData.managerId || undefined,
        parentDepartmentId: formData.parentDepartmentId || undefined,
      };

      if (editingDepartment) {
        await updateDepartment(editingDepartment.departmentId!, departmentData);
      } else {
        await createDepartment(departmentData);
      }

      closeModal();
      loadData();
    } catch (err: any) {
      console.error('Failed to save department:', err);
      alert(err.response?.data?.message || 'Failed to save department');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this department?')) {
      return;
    }

    try {
      await deleteDepartment(id, currentOrganizationId);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete department:', err);
      alert(err.response?.data?.message || 'Failed to delete department');
    }
  };

  const getManagerName = (managerId?: string) => {
    if (!managerId) return '-';
    const manager = employees.find(e => e.employeeId === managerId);
    return manager ? `${manager.firstName} ${manager.lastName}` : '-';
  };

  const getParentDepartmentName = (parentId?: string) => {
    if (!parentId) return '-';
    const parent = departments.find(d => d.departmentId === parentId);
    return parent?.name || '-';
  };

  const getEmployeeCount = (departmentId?: string) => {
    if (!departmentId) return 0;
    return employees.filter(e => e.departmentId === departmentId).length;
  };

  if (loading) {
    return <div className="loading">Loading departments...</div>;
  }

  return (
    <div className="hr-page">
      <div className="page-header">
        <div>
          <h1>Department Management</h1>
          <p>Manage organizational departments and structure</p>
        </div>
        <button className="btn-primary" onClick={openCreateModal}>
          + Add Department
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Departments Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Department Name</th>
              <th>Description</th>
              <th>Parent Department</th>
              <th>Manager</th>
              <th>Employee Count</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data">
                  No departments found. Click "Add Department" to create one.
                </td>
              </tr>
            ) : (
              departments.map((dept) => (
                <tr key={dept.departmentId}>
                  <td><strong>{dept.name}</strong></td>
                  <td>{dept.description || '-'}</td>
                  <td>{getParentDepartmentName(dept.parentDepartmentId)}</td>
                  <td>{getManagerName(dept.managerId)}</td>
                  <td>{getEmployeeCount(dept.departmentId)}</td>
                  <td>
                    <span className={dept.isActive ? 'status-badge status-active' : 'status-badge status-inactive'}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button 
                      className="btn-sm btn-edit"
                      onClick={() => openEditModal(dept)}
                    >
                      Edit
                    </button>
                    {dept.isActive && (
                      <button 
                        className="btn-sm btn-delete"
                        onClick={() => handleDelete(dept.departmentId!)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Department Form Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingDepartment ? 'Edit Department' : 'Add New Department'}</h2>
              <button className="modal-close" onClick={closeModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Department Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Engineering, Sales, HR, etc."
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Department description..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Parent Department</label>
                <select
                  value={formData.parentDepartmentId}
                  onChange={(e) => setFormData({...formData, parentDepartmentId: e.target.value})}
                >
                  <option value="">None (Root Department)</option>
                  {departments
                    .filter(d => d.departmentId !== editingDepartment?.departmentId)
                    .map(dept => (
                      <option key={dept.departmentId} value={dept.departmentId}>
                        {dept.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="form-group">
                <label>Manager</label>
                <select
                  value={formData.managerId}
                  onChange={(e) => setFormData({...formData, managerId: e.target.value})}
                >
                  <option value="">Select Manager</option>
                  {employees.map(emp => (
                    <option key={emp.employeeId} value={emp.employeeId}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingDepartment ? 'Update Department' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentManagement;


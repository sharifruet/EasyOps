import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getEmployees, deleteEmployee, Employee, getDepartments, Department, getPositions, Position } from '../../services/hrService';
import './Hr.css';

const EmployeeList: React.FC = () => {
  const { currentOrganizationId } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

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

      const [employeesRes, departmentsRes, positionsRes] = await Promise.all([
        getEmployees(currentOrganizationId),
        getDepartments(currentOrganizationId, { activeOnly: true }),
        getPositions(currentOrganizationId, { activeOnly: true })
      ]);

      setEmployees(employeesRes.data);
      setDepartments(departmentsRes.data);
      setPositions(positionsRes.data);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!currentOrganizationId) return;

    try {
      setLoading(true);
      const params: any = {};
      
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.departmentId = departmentFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await getEmployees(currentOrganizationId, params);
      setEmployees(response.data);
    } catch (err: any) {
      console.error('Failed to search employees:', err);
      setError(err.response?.data?.message || 'Failed to search employees');
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDepartmentFilter('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to deactivate this employee?')) {
      return;
    }

    try {
      await deleteEmployee(id);
      loadData();
    } catch (err: any) {
      console.error('Failed to delete employee:', err);
      alert(err.response?.data?.message || 'Failed to delete employee');
    }
  };

  const getDepartmentName = (departmentId?: string) => {
    if (!departmentId) return '-';
    const dept = departments.find(d => d.departmentId === departmentId);
    return dept?.name || '-';
  };

  const getPositionTitle = (positionId?: string) => {
    if (!positionId) return '-';
    const pos = positions.find(p => p.positionId === positionId);
    return pos?.title || '-';
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'ACTIVE': return 'status-badge status-active';
      case 'ON_LEAVE': return 'status-badge status-on-leave';
      case 'TERMINATED': return 'status-badge status-terminated';
      default: return 'status-badge';
    }
  };

  if (loading) {
    return <div className="loading">Loading employees...</div>;
  }

  return (
    <div className="hr-page">
      <div className="page-header">
        <div>
          <h1>Employee Management</h1>
          <p>Manage employee information and records</p>
        </div>
        <button className="btn-primary" onClick={() => navigate('/hr/employees/new')}>
          + Add Employee
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search by name, email, or employee number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On Leave</option>
            <option value="TERMINATED">Terminated</option>
          </select>

          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.name}
              </option>
            ))}
          </select>

          <button className="btn-secondary" onClick={handleSearch}>Search</button>
          <button className="btn-outline" onClick={handleClearFilters}>Clear</button>
        </div>
      </div>

      {/* Employee Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Employee #</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Department</th>
              <th>Position</th>
              <th>Type</th>
              <th>Status</th>
              <th>Hire Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={10} className="no-data">
                  No employees found. Click "Add Employee" to create one.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.employeeId}>
                  <td>{employee.employeeNumber}</td>
                  <td>
                    <strong>{employee.firstName} {employee.lastName}</strong>
                  </td>
                  <td>{employee.email}</td>
                  <td>{employee.phone || '-'}</td>
                  <td>{getDepartmentName(employee.departmentId)}</td>
                  <td>{getPositionTitle(employee.positionId)}</td>
                  <td>{employee.employmentType || '-'}</td>
                  <td>
                    <span className={getStatusBadgeClass(employee.employmentStatus)}>
                      {employee.employmentStatus || 'UNKNOWN'}
                    </span>
                  </td>
                  <td>{new Date(employee.hireDate).toLocaleDateString()}</td>
                  <td className="action-buttons">
                    <button 
                      className="btn-sm btn-view"
                      onClick={() => navigate(`/hr/employees/${employee.employeeId}`)}
                    >
                      View
                    </button>
                    <button 
                      className="btn-sm btn-edit"
                      onClick={() => navigate(`/hr/employees/${employee.employeeId}/edit`)}
                    >
                      Edit
                    </button>
                    {employee.employmentStatus === 'ACTIVE' && (
                      <button 
                        className="btn-sm btn-delete"
                        onClick={() => handleDelete(employee.employeeId!)}
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
    </div>
  );
};

export default EmployeeList;


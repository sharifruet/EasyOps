import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  createEmployee, 
  updateEmployee, 
  getEmployeeById, 
  getDepartments, 
  getPositions,
  getEmployees,
  Employee,
  Department,
  Position
} from '../../services/hrService';
import userService from '../../services/userService';
import { User } from '../../types';
import './Hr.css';

const EmployeeForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentOrganizationId } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  
  const [formData, setFormData] = useState<Partial<Employee>>({
    organizationId: currentOrganizationId || '',
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    hireDate: new Date().toISOString().split('T')[0],
    departmentId: '',
    positionId: '',
    managerId: '',
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    userId: '',
  });

  useEffect(() => {
    if (!currentOrganizationId) {
      return;
    }

    const initialize = async () => {
      try {
        setLoading(true);
        let selectedUserId: string | undefined;
        if (id) {
          selectedUserId = await loadEmployee(id);
        }
        await loadFormData(selectedUserId);
      } catch (err: any) {
        console.error('Failed to initialize employee form:', err);
        setError(err.response?.data?.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganizationId, id]);

  const loadFormData = async (selectedUserId?: string) => {
    if (!currentOrganizationId) return;

    try {
      const [departmentsRes, positionsRes, employeesRes, usersPage] = await Promise.all([
        getDepartments(currentOrganizationId, { activeOnly: true }),
        getPositions(currentOrganizationId, { activeOnly: true }),
        getEmployees(currentOrganizationId, { status: 'ACTIVE' }),
        userService.getAllUsers({ page: 0, size: 200 })
      ]);

      setDepartments(departmentsRes.data);
      setPositions(positionsRes.data);
      setManagers(employeesRes.data);

      const linkedUserIds = new Set(
        (employeesRes.data || [])
          .filter(emp => !!emp.userId)
          .map(emp => emp.userId as string)
      );

      if (selectedUserId) {
        linkedUserIds.delete(selectedUserId);
      }

      let userOptions = (usersPage.content || []).filter(
        user => !linkedUserIds.has(user.id)
      );

      if (selectedUserId && !userOptions.some(user => user.id === selectedUserId)) {
        try {
          const selectedUser = await userService.getUserById(selectedUserId);
          userOptions = [...userOptions, selectedUser];
        } catch (fetchErr) {
          console.warn('Unable to fetch selected user for employee form', fetchErr);
        }
      }

      userOptions.sort((a, b) => {
        const left = (a.firstName || a.username || '').toLowerCase();
        const right = (b.firstName || b.username || '').toLowerCase();
        if (left < right) return -1;
        if (left > right) return 1;
        return 0;
      });

      setAvailableUsers(userOptions);
    } catch (err) {
      console.error('Failed to load form data:', err);
    }
  };

  const loadEmployee = async (employeeId: string) => {
    try {
      const response = await getEmployeeById(employeeId);
      const employee = response.data;
      
      setFormData({
        ...employee,
        dateOfBirth: employee.dateOfBirth || '',
        hireDate: employee.hireDate || '',
        terminationDate: employee.terminationDate || '',
        userId: employee.userId || '',
      });
      return employee.userId || undefined;
    } catch (err: any) {
      console.error('Failed to load employee:', err);
      setError(err.response?.data?.message || 'Failed to load employee');
    }
    return undefined;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentOrganizationId) {
      setError('No organization selected');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const employeeData: Employee = {
        ...formData,
        userId: formData.userId ? formData.userId : undefined,
        managerId: formData.managerId ? formData.managerId : undefined,
        departmentId: formData.departmentId ? formData.departmentId : undefined,
        positionId: formData.positionId ? formData.positionId : undefined,
        organizationId: currentOrganizationId,
      } as Employee;

      if (id) {
        await updateEmployee(id, employeeData);
      } else {
        await createEmployee(employeeData);
      }

      navigate('/hr/employees');
    } catch (err: any) {
      console.error('Failed to save employee:', err);
      setError(err.response?.data?.message || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hr-page">
      <div className="page-header">
        <h1>{id ? 'Edit Employee' : 'Add New Employee'}</h1>
        <p>Enter employee information below</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="hr-form">
        {/* Basic Information */}
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Employee Number *</label>
              <input
                type="text"
                name="employeeNumber"
                value={formData.employeeNumber}
                onChange={handleChange}
                required
                disabled={!!id}
                placeholder="EMP001"
              />
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="employee@example.com"
              />
            </div>

            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="John"
              />
            </div>

            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Doe"
              />
            </div>

            <div className="form-group">
              <label>Linked User Account</label>
              <select
                name="userId"
                value={formData.userId || ''}
                onChange={handleChange}
              >
                <option value="">No linked user</option>
                {availableUsers.map(user => {
                  const displayName = [user.firstName, user.lastName]
                    .filter(Boolean)
                    .join(' ')
                    .trim();
                  return (
                    <option key={user.id} value={user.id}>
                      {displayName || user.username}
                      {user.email ? ` (${user.email})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
                <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employment Information */}
        <div className="form-section">
          <h2>Employment Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Hire Date *</label>
              <input
                type="date"
                name="hireDate"
                value={formData.hireDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <select name="departmentId" value={formData.departmentId} onChange={handleChange}>
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.departmentId} value={dept.departmentId}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Position</label>
              <select name="positionId" value={formData.positionId} onChange={handleChange}>
                <option value="">Select Position</option>
                {positions.map(pos => (
                  <option key={pos.positionId} value={pos.positionId}>
                    {pos.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Manager</label>
              <select name="managerId" value={formData.managerId} onChange={handleChange}>
                <option value="">Select Manager</option>
                {managers.map(mgr => (
                  <option key={mgr.employeeId} value={mgr.employeeId}>
                    {mgr.firstName} {mgr.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Employment Type *</label>
              <select 
                name="employmentType" 
                value={formData.employmentType} 
                onChange={handleChange}
                required
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="CONTRACT">Contract</option>
                <option value="INTERN">Intern</option>
              </select>
            </div>

            <div className="form-group">
              <label>Employment Status *</label>
              <select 
                name="employmentStatus" 
                value={formData.employmentStatus} 
                onChange={handleChange}
                required
              >
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On Leave</option>
                <option value="TERMINATED">Terminated</option>
              </select>
            </div>

            {formData.employmentStatus === 'TERMINATED' && (
              <div className="form-group">
                <label>Termination Date</label>
                <input
                  type="date"
                  name="terminationDate"
                  value={formData.terminationDate}
                  onChange={handleChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h2>Address Information</h2>
          <div className="form-grid">
            <div className="form-group form-group-full">
              <label>Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleChange}
                placeholder="123 Main Street"
              />
            </div>

            <div className="form-group form-group-full">
              <label>Address Line 2</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleChange}
                placeholder="Apt 4B"
              />
            </div>

            <div className="form-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="New York"
              />
            </div>

            <div className="form-group">
              <label>State/Province</label>
              <input
                type="text"
                name="stateProvince"
                value={formData.stateProvince}
                onChange={handleChange}
                placeholder="NY"
              />
            </div>

            <div className="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="10001"
              />
            </div>

            <div className="form-group">
              <label>Country</label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="USA"
              />
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h2>Emergency Contact</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Emergency Contact Name</label>
              <input
                type="text"
                name="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={handleChange}
                placeholder="Jane Doe"
              />
            </div>

            <div className="form-group">
              <label>Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergencyContactPhone"
                value={formData.emergencyContactPhone}
                onChange={handleChange}
                placeholder="+1 (555) 987-6543"
              />
            </div>

            <div className="form-group">
              <label>Relationship</label>
              <input
                type="text"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                placeholder="Spouse, Parent, etc."
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button 
            type="button" 
            className="btn-outline" 
            onClick={() => navigate('/hr/employees')}
            disabled={loading}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
          >
            {loading ? 'Saving...' : (id ? 'Update Employee' : 'Create Employee')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;


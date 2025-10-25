import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

const hrApi = axios.create({
  baseURL: `${API_BASE_URL}/api/hr`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Employee interfaces
export interface Employee {
  employeeId?: string;
  organizationId: string;
  userId?: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  hireDate: string;
  terminationDate?: string;
  departmentId?: string;
  positionId?: string;
  managerId?: string;
  employmentType?: string;
  employmentStatus?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface Department {
  departmentId?: string;
  organizationId: string;
  name: string;
  description?: string;
  managerId?: string;
  parentDepartmentId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Position {
  positionId?: string;
  organizationId: string;
  title: string;
  description?: string;
  departmentId?: string;
  level?: string;
  salaryRangeMin?: number;
  salaryRangeMax?: number;
  currency?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HrDashboardStats {
  total_employees: number;
  active_employees: number;
  on_leave_employees: number;
  terminated_employees: number;
  full_time_employees: number;
  part_time_employees: number;
  contract_employees: number;
  intern_employees: number;
  recent_hires_30d: number;
  recent_terminations_30d: number;
  avg_tenure_years: number;
  department_count: number;
  position_count: number;
}

// Employee API
export const getEmployees = (organizationId: string, params?: {
  status?: string;
  departmentId?: string;
  search?: string;
}) => {
  return hrApi.get<Employee[]>('/employees', {
    params: { organizationId, ...params }
  });
};

export const getEmployeeById = (id: string) => {
  return hrApi.get<Employee>(`/employees/${id}`);
};

export const createEmployee = (employee: Employee) => {
  return hrApi.post<Employee>('/employees', employee);
};

export const updateEmployee = (id: string, employee: Employee) => {
  return hrApi.put<Employee>(`/employees/${id}`, employee);
};

export const deleteEmployee = (id: string) => {
  return hrApi.delete(`/employees/${id}`);
};

export const getEmployeeCount = (organizationId: string, status?: string) => {
  return hrApi.get<number>('/employees/count', {
    params: { organizationId, status }
  });
};

// Department API
export const getDepartments = (organizationId: string, params?: {
  activeOnly?: boolean;
  parentDepartmentId?: string;
}) => {
  return hrApi.get<Department[]>('/departments', {
    params: { organizationId, ...params }
  });
};

export const getRootDepartments = (organizationId: string) => {
  return hrApi.get<Department[]>('/departments/root', {
    params: { organizationId }
  });
};

export const getDepartmentById = (id: string) => {
  return hrApi.get<Department>(`/departments/${id}`);
};

export const createDepartment = (department: Department) => {
  return hrApi.post<Department>('/departments', department);
};

export const updateDepartment = (id: string, department: Department) => {
  return hrApi.put<Department>(`/departments/${id}`, department);
};

export const deleteDepartment = (id: string) => {
  return hrApi.delete(`/departments/${id}`);
};

// Position API
export const getPositions = (organizationId: string, params?: {
  activeOnly?: boolean;
  departmentId?: string;
}) => {
  return hrApi.get<Position[]>('/positions', {
    params: { organizationId, ...params }
  });
};

export const getPositionById = (id: string) => {
  return hrApi.get<Position>(`/positions/${id}`);
};

export const createPosition = (position: Position) => {
  return hrApi.post<Position>('/positions', position);
};

export const updatePosition = (id: string, position: Position) => {
  return hrApi.put<Position>(`/positions/${id}`, position);
};

export const deletePosition = (id: string) => {
  return hrApi.delete(`/positions/${id}`);
};

// Dashboard API
export const getDashboardStats = (organizationId: string) => {
  return hrApi.get<HrDashboardStats>('/dashboard/stats', {
    params: { organizationId }
  });
};

export const getHeadcountByDepartment = (organizationId: string) => {
  return hrApi.get<any[]>('/dashboard/headcount-by-department', {
    params: { organizationId }
  });
};

export const getRecentHires = (organizationId: string, limit: number = 5) => {
  return hrApi.get<any[]>('/dashboard/recent-hires', {
    params: { organizationId, limit }
  });
};

export const getEmployeeSummary = (employeeId: string) => {
  return hrApi.get<any>(`/dashboard/employee-summary/${employeeId}`);
};

// =====================================================
// PHASE 5.2: TIME & ATTENDANCE API
// =====================================================

// Attendance API
export const getAttendance = (organizationId: string, params?: {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return hrApi.get('/attendance', { params: { organizationId, ...params } });
};

export const getTodayAttendance = (organizationId: string, date?: string) => {
  return hrApi.get('/attendance/today', { params: { organizationId, date } });
};

export const clockIn = (employeeId: string, organizationId: string, workLocation: string) => {
  return hrApi.post('/attendance/clock-in', { employeeId, organizationId, workLocation });
};

export const clockOut = (employeeId: string) => {
  return hrApi.post('/attendance/clock-out', { employeeId });
};

export const startBreak = (employeeId: string) => {
  return hrApi.post('/attendance/break-start', { employeeId });
};

export const endBreak = (employeeId: string) => {
  return hrApi.post('/attendance/break-end', { employeeId });
};

// Timesheet API
export const getTimesheets = (organizationId: string, params?: {
  employeeId?: string;
  status?: string;
}) => {
  return hrApi.get('/timesheets', { params: { organizationId, ...params } });
};

export const createTimesheet = (timesheet: any) => {
  return hrApi.post('/timesheets', timesheet);
};

export const updateTimesheet = (id: string, timesheet: any) => {
  return hrApi.put(`/timesheets/${id}`, timesheet);
};

export const submitTimesheet = (id: string) => {
  return hrApi.post(`/timesheets/${id}/submit`);
};

export const approveTimesheet = (id: string, approvedBy: string) => {
  return hrApi.post(`/timesheets/${id}/approve`, { approvedBy });
};

export const rejectTimesheet = (id: string, rejectedBy: string, rejectionReason: string) => {
  return hrApi.post(`/timesheets/${id}/reject`, { rejectedBy, rejectionReason });
};

// Leave API
export const getLeaveTypes = (organizationId: string) => {
  return hrApi.get('/leave/types', { params: { organizationId } });
};

export const createLeaveType = (leaveType: any) => {
  return hrApi.post('/leave/types', leaveType);
};

export const getLeaveRequests = (organizationId: string, params?: {
  employeeId?: string;
  status?: string;
}) => {
  return hrApi.get('/leave/requests', { params: { organizationId, ...params } });
};

export const createLeaveRequest = (leaveRequest: any) => {
  return hrApi.post('/leave/requests', leaveRequest);
};

export const approveLeaveRequest = (id: string, approvedBy: string) => {
  return hrApi.post(`/leave/requests/${id}/approve`, { approvedBy });
};

export const rejectLeaveRequest = (id: string, rejectedBy: string, rejectionReason: string) => {
  return hrApi.post(`/leave/requests/${id}/reject`, { rejectedBy, rejectionReason });
};

export const getLeaveBalances = (organizationId: string, employeeId?: string) => {
  return hrApi.get('/leave/balances', { params: { organizationId, employeeId } });
};

// =====================================================
// PHASE 5.3: PAYROLL & BENEFITS API
// =====================================================

// Payroll API
export const getPayrollRuns = (organizationId: string, status?: string) => {
  return hrApi.get('/payroll/runs', { params: { organizationId, status } });
};

export const createPayrollRun = (payrollRun: any) => {
  return hrApi.post('/payroll/runs', payrollRun);
};

export const processPayrollRun = (id: string, processedBy: string) => {
  return hrApi.post(`/payroll/runs/${id}/process`, { processedBy });
};

export const approvePayrollRun = (id: string, approvedBy: string) => {
  return hrApi.post(`/payroll/runs/${id}/approve`, { approvedBy });
};

export const getPayrollDetails = (payrollRunId: string) => {
  return hrApi.get(`/payroll/runs/${payrollRunId}/details`);
};

export const getEmployeePayrollHistory = (employeeId: string, organizationId: string) => {
  return hrApi.get(`/payroll/details/employee/${employeeId}`, { params: { organizationId } });
};

export const getPayrollStats = (organizationId: string) => {
  return hrApi.get('/payroll/stats', { params: { organizationId } });
};

// Salary API
export const getSalaryStructures = (organizationId: string) => {
  return hrApi.get('/salary/structures', { params: { organizationId } });
};

export const createSalaryStructure = (structure: any) => {
  return hrApi.post('/salary/structures', structure);
};

export const getSalaryComponents = (organizationId: string) => {
  return hrApi.get('/salary/components', { params: { organizationId } });
};

export const createSalaryComponent = (component: any) => {
  return hrApi.post('/salary/components', component);
};

export const getEmployeeSalaryDetails = (organizationId: string, employeeId?: string) => {
  return hrApi.get('/salary/details', { params: { organizationId, employeeId } });
};

// Benefits API
export const getBenefits = (organizationId: string) => {
  return hrApi.get('/benefits', { params: { organizationId } });
};

export const createBenefit = (benefit: any) => {
  return hrApi.post('/benefits', benefit);
};

export const getEmployeeBenefits = (employeeId: string, organizationId: string) => {
  return hrApi.get('/benefits/enrollments', { params: { employeeId, organizationId } });
};

export const enrollBenefit = (enrollment: any) => {
  return hrApi.post('/benefits/enrollments', enrollment);
};

export const enrollEmployeeBenefit = enrollBenefit; // Alias

// Compensation API
export const getReimbursements = (organizationId: string, params?: {
  employeeId?: string;
  status?: string;
}) => {
  return hrApi.get('/compensation/reimbursements', { params: { organizationId, ...params } });
};

export const createReimbursement = (reimbursement: any) => {
  return hrApi.post('/compensation/reimbursements', reimbursement);
};

export const approveReimbursement = (id: string, approvedBy: string) => {
  return hrApi.post(`/compensation/reimbursements/${id}/approve`, { approvedBy });
};

export const getBonuses = (organizationId: string, params?: {
  employeeId?: string;
  status?: string;
}) => {
  return hrApi.get('/compensation/bonuses', { params: { organizationId, ...params } });
};

export const createBonus = (bonus: any) => {
  return hrApi.post('/compensation/bonuses', bonus);
};

export const approveBonus = (id: string, approvedBy: string) => {
  return hrApi.post(`/compensation/bonuses/${id}/approve`, { approvedBy });
};

// =====================================================
// PHASE 5.4: PERFORMANCE MANAGEMENT API
// =====================================================

// Performance Cycles API
export const getPerformanceCycles = (organizationId: string) => {
  return hrApi.get('/performance/cycles', { params: { organizationId } });
};

export const createPerformanceCycle = (cycle: any) => {
  return hrApi.post('/performance/cycles', cycle);
};

// Goals API
export const getGoals = (organizationId: string, params?: {
  employeeId?: string;
  status?: string;
}) => {
  return hrApi.get('/goals', { params: { organizationId, ...params } });
};

export const createGoal = (goal: any) => {
  return hrApi.post('/goals', goal);
};

export const updateGoalProgress = (id: string, update: any) => {
  return hrApi.post(`/goals/${id}/update-progress`, update);
};

export const completeGoal = (id: string) => {
  return hrApi.post(`/goals/${id}/complete`);
};

// Performance Reviews API
export const getPerformanceReviews = (organizationId: string, employeeId?: string) => {
  return hrApi.get('/performance/reviews', { params: { organizationId, employeeId } });
};

export const createPerformanceReview = (review: any) => {
  return hrApi.post('/performance/reviews', review);
};

export const submitPerformanceReview = (id: string) => {
  return hrApi.post(`/performance/reviews/${id}/submit`);
};

export const approvePerformanceReview = (id: string, approvedBy: string) => {
  return hrApi.post(`/performance/reviews/${id}/approve`, { approvedBy });
};

// Competencies API
export const getCompetencies = (organizationId: string) => {
  return hrApi.get('/performance/competencies', { params: { organizationId } });
};

// Development API
export const getDevelopmentPlans = (organizationId: string, employeeId?: string) => {
  return hrApi.get('/development/plans', { params: { organizationId, employeeId } });
};

export const createDevelopmentPlan = (plan: any) => {
  return hrApi.post('/development/plans', plan);
};

export const getTrainings = (organizationId: string, employeeId?: string) => {
  return hrApi.get('/development/training', { params: { organizationId, employeeId } });
};

export const createTraining = (training: any) => {
  return hrApi.post('/development/training', training);
};

export const getOneOnOnes = (organizationId: string, employeeId?: string) => {
  return hrApi.get('/development/one-on-ones', { params: { organizationId, employeeId } });
};

export const createOneOnOne = (meeting: any) => {
  return hrApi.post('/development/one-on-ones', meeting);
};

export const getFeedback360 = (employeeId: string, organizationId: string) => {
  return hrApi.get('/development/feedback360', { params: { employeeId, organizationId } });
};

export const submitFeedback360 = (feedback: any) => {
  return hrApi.post('/development/feedback360', feedback);
};

export const getTrainingCertifications = (organizationId: string, params?: {
  employeeId?: string;
  type?: string;
}) => {
  return hrApi.get('/development/training', { params: { organizationId, ...params } });
};

export default hrApi;


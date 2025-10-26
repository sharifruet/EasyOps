import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { AuthProvider } from '@contexts/AuthContext';
import ProtectedRoute from '@components/ProtectedRoute';
import MainLayout from '@components/Layout/MainLayout';
import Login from '@pages/Login';
import Dashboard from '@pages/Dashboard';
import Organizations from '@pages/Organizations';
import OrganizationDetails from '@pages/OrganizationDetails';
import Users from '@pages/Users';
import Roles from '@pages/Roles';
import Permissions from '@pages/Permissions';
import ChartOfAccounts from '@pages/accounting/ChartOfAccounts';
import JournalEntry from '@pages/accounting/JournalEntry';
import TrialBalance from '@pages/accounting/TrialBalance';
import GeneralLedger from '@pages/accounting/GeneralLedger';
import ProfitLoss from '@pages/accounting/ProfitLoss';
import BalanceSheet from '@pages/accounting/BalanceSheet';
import CashFlow from '@pages/accounting/CashFlow';
import Invoices from '@pages/accounting/Invoices';
import Bills from '@pages/accounting/Bills';
import BankReconciliation from '@pages/accounting/BankReconciliation';
import BankAccounts from '@pages/accounting/BankAccounts';
import BankTransactions from '@pages/accounting/BankTransactions';
import AgingReports from '@pages/accounting/AgingReports';
import ARAgingReport from '@pages/accounting/ARAgingReport';
import APAgingReport from '@pages/accounting/APAgingReport';
import CreditNotes from '@pages/accounting/CreditNotes';
import CustomerStatements from '@pages/accounting/CustomerStatements';
import VendorStatements from '@pages/accounting/VendorStatements';
import PaymentReminders from '@pages/accounting/PaymentReminders';
import AccountingDashboard from '@pages/accounting/Dashboard';
import Quotations from '@pages/sales/Quotations';
import SalesOrders from '@pages/sales/SalesOrders';
import SalesDashboard from '@pages/sales/SalesDashboard';
import Products from '@pages/sales/Products';
import SalesCustomers from '@pages/sales/Customers';
import InventoryProducts from '@pages/inventory/Products';
import StockLevels from '@pages/inventory/StockLevels';
import Warehouses from '@pages/inventory/Warehouses';
import BatchTracking from '@pages/inventory/BatchTracking';
import SerialTracking from '@pages/inventory/SerialTracking';
import StockCounting from '@pages/inventory/StockCounting';
import InventoryValuation from '@pages/inventory/InventoryValuation';
import InventoryReports from '@pages/inventory/InventoryReports';
import ReorderManagement from '@pages/inventory/ReorderManagement';
import StockTransfers from '@pages/inventory/StockTransfers';
import PurchaseDashboard from '@pages/purchase/PurchaseDashboard';
import PurchaseOrders from '@pages/purchase/PurchaseOrders';
import PurchaseReceipts from '@pages/purchase/PurchaseReceipts';
import PurchaseInvoices from '@pages/purchase/PurchaseInvoices';
import PurchaseReports from '@pages/purchase/PurchaseReports';
import VarianceManagement from '@pages/purchase/VarianceManagement';
import HrDashboard from '@pages/hr/HrDashboard';
import EmployeeList from '@pages/hr/EmployeeList';
import EmployeeForm from '@pages/hr/EmployeeForm';
import EmployeeDetail from '@pages/hr/EmployeeDetail';
import DepartmentManagement from '@pages/hr/DepartmentManagement';
import PositionManagement from '@pages/hr/PositionManagement';
import AttendanceDashboard from '@pages/hr/AttendanceDashboard';
import TimesheetManager from '@pages/hr/TimesheetManager';
import LeaveRequestForm from '@pages/hr/LeaveRequestForm';
import LeaveBalance from '@pages/hr/LeaveBalance';
import PayrollDashboard from '@pages/hr/PayrollDashboard';
import PayrollRunManager from '@pages/hr/PayrollRunManager';
import SalaryStructureManager from '@pages/hr/SalaryStructureManager';
import BenefitsManagement from '@pages/hr/BenefitsManagement';
import ReimbursementManagement from '@pages/hr/ReimbursementManagement';
import BonusManagement from '@pages/hr/BonusManagement';
import PerformanceManagement from '@pages/hr/PerformanceManagement';
import GoalManagement from '@pages/hr/GoalManagement';
import DevelopmentPlan from '@pages/hr/DevelopmentPlan';
import TrainingManagement from '@pages/hr/TrainingManagement';
import LeadDashboard from '@pages/crm/LeadDashboard';
import LeadList from '@pages/crm/LeadList';
import LeadForm from '@pages/crm/LeadForm';
import LeadDetail from '@pages/crm/LeadDetail';
import AccountList from '@pages/crm/AccountList';
import AccountForm from '@pages/crm/AccountForm';
import AccountDetail from '@pages/crm/AccountDetail';
import ContactList from '@pages/crm/ContactList';
import ContactForm from '@pages/crm/ContactForm';
import ContactDetail from '@pages/crm/ContactDetail';
import OpportunityDashboard from '@pages/crm/OpportunityDashboard';
import OpportunityList from '@pages/crm/OpportunityList';
import OpportunityForm from '@pages/crm/OpportunityForm';
import OpportunityDetail from '@pages/crm/OpportunityDetail';
import PipelineKanban from '@pages/crm/PipelineKanban';
import SalesForecast from '@pages/crm/SalesForecast';
import CampaignDashboard from '@pages/crm/CampaignDashboard';
import CampaignList from '@pages/crm/CampaignList';
import CampaignForm from '@pages/crm/CampaignForm';
import TaskManager from '@pages/crm/TaskManager';
import CalendarView from '@pages/crm/CalendarView';
import EmailTemplateManager from '@pages/crm/EmailTemplateManager';
import CaseDashboard from '@pages/crm/CaseDashboard';
import CaseList from '@pages/crm/CaseList';
import CaseForm from '@pages/crm/CaseForm';
import CaseDetail from '@pages/crm/CaseDetail';
import KnowledgeBaseList from '@pages/crm/KnowledgeBaseList';
import KnowledgeBaseForm from '@pages/crm/KnowledgeBaseForm';
import CrmReports from '@pages/crm/CrmReports';

// Manufacturing Module
import ManufacturingDashboard from '@pages/manufacturing/ManufacturingDashboard';
import BomList from '@pages/manufacturing/BomList';
import BomForm from '@pages/manufacturing/BomForm';
import BomTreeView from '@pages/manufacturing/BomTreeView';
import ProductRoutingList from '@pages/manufacturing/ProductRoutingList';
import ProductRoutingForm from '@pages/manufacturing/ProductRoutingForm';
import WorkOrderList from '@pages/manufacturing/WorkOrderList';
import ProductionTracking from '@pages/manufacturing/ProductionTracking';
import WorkOrderWizard from '@pages/manufacturing/WorkOrderWizard';
import WorkOrderDetail from '@pages/manufacturing/WorkOrderDetail';
import ShopFloorDashboard from '@pages/manufacturing/ShopFloorDashboard';
import QualityInspectionList from '@pages/manufacturing/quality/QualityInspectionList';
import QualityInspectionForm from '@pages/manufacturing/quality/QualityInspectionForm';
import NonConformanceList from '@pages/manufacturing/quality/NonConformanceList';
import NonConformanceForm from '@pages/manufacturing/quality/NonConformanceForm';
import WorkCenterList from '@pages/manufacturing/WorkCenterList';
import WorkCenterForm from '@pages/manufacturing/WorkCenterForm';
import MaintenanceList from '@pages/manufacturing/MaintenanceList';
import MaintenanceCalendar from '@pages/manufacturing/MaintenanceCalendar';
import ManufacturingAnalytics from '@pages/manufacturing/ManufacturingAnalytics';
import AnalyticsDashboard from '@pages/manufacturing/AnalyticsDashboard';

// Create MUI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              
              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="organizations" element={<Organizations />} />
                <Route path="organizations/:id" element={<OrganizationDetails />} />
                <Route path="users" element={<Users />} />
                <Route path="roles" element={<Roles />} />
                <Route path="permissions" element={<Permissions />} />
                
                {/* Accounting Routes - Phase 1.1 */}
                <Route path="accounting/dashboard" element={<AccountingDashboard />} />
                <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />
                <Route path="accounting/journal-entry" element={<JournalEntry />} />
                <Route path="accounting/trial-balance" element={<TrialBalance />} />
                <Route path="accounting/general-ledger" element={<GeneralLedger />} />
                <Route path="accounting/profit-loss" element={<ProfitLoss />} />
                <Route path="accounting/balance-sheet" element={<BalanceSheet />} />
                <Route path="accounting/cash-flow" element={<CashFlow />} />
                
                {/* Accounting Routes - Phase 1.2 */}
                <Route path="accounting/invoices" element={<Invoices />} />
                <Route path="accounting/credit-notes" element={<CreditNotes />} />
                <Route path="accounting/bills" element={<Bills />} />
                <Route path="accounting/bank-accounts" element={<BankAccounts />} />
                <Route path="accounting/bank-transactions" element={<BankTransactions />} />
                <Route path="accounting/bank-reconciliation" element={<BankReconciliation />} />
                <Route path="accounting/aging-reports" element={<AgingReports />} />
                <Route path="accounting/ar-aging-report" element={<ARAgingReport />} />
                <Route path="accounting/ap-aging-report" element={<APAgingReport />} />
                <Route path="accounting/customer-statements" element={<CustomerStatements />} />
                <Route path="accounting/vendor-statements" element={<VendorStatements />} />
                <Route path="accounting/payment-reminders" element={<PaymentReminders />} />
                
                {/* Sales Routes - Phase 2.0 */}
                <Route path="sales/dashboard" element={<SalesDashboard />} />
                <Route path="sales/products" element={<Products />} />
                <Route path="sales/customers" element={<SalesCustomers />} />
                <Route path="sales/quotations" element={<Quotations />} />
                <Route path="sales/orders" element={<SalesOrders />} />
                
                {/* Inventory Routes - Phase 3 Complete */}
                <Route path="inventory/products" element={<InventoryProducts />} />
                <Route path="inventory/stock" element={<StockLevels />} />
                <Route path="inventory/warehouses" element={<Warehouses />} />
                <Route path="inventory/batches" element={<BatchTracking />} />
                <Route path="inventory/serials" element={<SerialTracking />} />
                <Route path="inventory/counting" element={<StockCounting />} />
                <Route path="inventory/valuation" element={<InventoryValuation />} />
                <Route path="inventory/reports" element={<InventoryReports />} />
                <Route path="inventory/reorder" element={<ReorderManagement />} />
                <Route path="inventory/transfers" element={<StockTransfers />} />
                
                {/* Purchase Routes - Phase 4 */}
                <Route path="purchase/dashboard" element={<PurchaseDashboard />} />
                <Route path="purchase/orders" element={<PurchaseOrders />} />
                <Route path="purchase/receipts" element={<PurchaseReceipts />} />
                <Route path="purchase/invoices" element={<PurchaseInvoices />} />
                <Route path="purchase/variances" element={<VarianceManagement />} />
                <Route path="purchase/reports" element={<PurchaseReports />} />
                
                {/* HR Routes - Phase 5.1 */}
                <Route path="hr/dashboard" element={<HrDashboard />} />
                <Route path="hr/employees" element={<EmployeeList />} />
                <Route path="hr/employees/new" element={<EmployeeForm />} />
                <Route path="hr/employees/:id" element={<EmployeeDetail />} />
                <Route path="hr/employees/:id/edit" element={<EmployeeForm />} />
                <Route path="hr/departments" element={<DepartmentManagement />} />
                <Route path="hr/positions" element={<PositionManagement />} />
                <Route path="hr/attendance" element={<AttendanceDashboard />} />
                <Route path="hr/timesheets" element={<TimesheetManager />} />
                <Route path="hr/leave-requests" element={<LeaveRequestForm />} />
                <Route path="hr/leave-balance" element={<LeaveBalance />} />
                <Route path="hr/payroll" element={<PayrollDashboard />} />
                <Route path="hr/payroll-runs" element={<PayrollRunManager />} />
                <Route path="hr/salary" element={<SalaryStructureManager />} />
                <Route path="hr/benefits" element={<BenefitsManagement />} />
                <Route path="hr/reimbursements" element={<ReimbursementManagement />} />
                <Route path="hr/bonuses" element={<BonusManagement />} />
                <Route path="hr/performance" element={<PerformanceManagement />} />
                <Route path="hr/goals" element={<GoalManagement />} />
                <Route path="hr/development" element={<DevelopmentPlan />} />
                <Route path="hr/training" element={<TrainingManagement />} />
                
                {/* CRM Routes - Phase 6.1, 6.2, 6.3 & 6.4 Complete */}
                <Route path="crm" element={<LeadDashboard />} />
                <Route path="crm/dashboard" element={<LeadDashboard />} />
                <Route path="crm/leads" element={<LeadList />} />
                <Route path="crm/leads/new" element={<LeadForm />} />
                <Route path="crm/leads/:id" element={<LeadDetail />} />
                <Route path="crm/leads/:id/edit" element={<LeadForm />} />
                <Route path="crm/accounts" element={<AccountList />} />
                <Route path="crm/accounts/new" element={<AccountForm />} />
                <Route path="crm/accounts/:id" element={<AccountDetail />} />
                <Route path="crm/accounts/:id/edit" element={<AccountForm />} />
                <Route path="crm/contacts" element={<ContactList />} />
                <Route path="crm/contacts/new" element={<ContactForm />} />
                <Route path="crm/contacts/:id" element={<ContactDetail />} />
                <Route path="crm/contacts/:id/edit" element={<ContactForm />} />
                <Route path="crm/opportunities" element={<OpportunityList />} />
                <Route path="crm/opportunities/new" element={<OpportunityForm />} />
                <Route path="crm/opportunities/:id" element={<OpportunityDetail />} />
                <Route path="crm/opportunities/:id/edit" element={<OpportunityForm />} />
                <Route path="crm/opportunity-dashboard" element={<OpportunityDashboard />} />
                <Route path="crm/pipeline" element={<PipelineKanban />} />
                <Route path="crm/forecast" element={<SalesForecast />} />
                <Route path="crm/campaigns" element={<CampaignList />} />
                <Route path="crm/campaigns/new" element={<CampaignForm />} />
                <Route path="crm/campaigns/:id/edit" element={<CampaignForm />} />
                <Route path="crm/campaign-dashboard" element={<CampaignDashboard />} />
                <Route path="crm/tasks" element={<TaskManager />} />
                <Route path="crm/calendar" element={<CalendarView />} />
                <Route path="crm/email-templates" element={<EmailTemplateManager />} />
                <Route path="crm/cases" element={<CaseList />} />
                <Route path="crm/cases/new" element={<CaseForm />} />
                <Route path="crm/cases/:id" element={<CaseDetail />} />
                <Route path="crm/cases/:id/edit" element={<CaseForm />} />
                <Route path="crm/support" element={<CaseDashboard />} />
                <Route path="crm/knowledge-base" element={<KnowledgeBaseList />} />
                <Route path="crm/knowledge-base/new" element={<KnowledgeBaseForm />} />
                <Route path="crm/knowledge-base/:id/edit" element={<KnowledgeBaseForm />} />
                <Route path="crm/analytics" element={<CrmReports />} />
                
                {/* Manufacturing Module Routes */}
                <Route path="manufacturing" element={<ManufacturingDashboard />} />
                <Route path="manufacturing/dashboard" element={<ManufacturingDashboard />} />
                
                {/* BOM Routes */}
                <Route path="manufacturing/boms" element={<BomList />} />
                <Route path="manufacturing/boms/new" element={<BomForm />} />
                <Route path="manufacturing/boms/:bomId" element={<BomTreeView />} />
                <Route path="manufacturing/boms/:bomId/edit" element={<BomForm />} />
                
                {/* Routing Routes */}
                <Route path="manufacturing/routings" element={<ProductRoutingList />} />
                <Route path="manufacturing/routings/new" element={<ProductRoutingForm />} />
                <Route path="manufacturing/routings/:routingId" element={<ProductRoutingForm />} />
                <Route path="manufacturing/routings/:routingId/edit" element={<ProductRoutingForm />} />
                
                {/* Work Order Routes */}
                <Route path="manufacturing/work-orders" element={<WorkOrderList />} />
                <Route path="manufacturing/work-orders/new" element={<WorkOrderWizard />} />
                <Route path="manufacturing/work-orders/:workOrderId" element={<WorkOrderDetail />} />
                <Route path="manufacturing/shop-floor" element={<ShopFloorDashboard />} />
                <Route path="manufacturing/production-tracking" element={<ProductionTracking />} />
                
                {/* Quality Routes */}
                <Route path="manufacturing/quality/inspections" element={<QualityInspectionList />} />
                <Route path="manufacturing/quality/inspections/new" element={<QualityInspectionForm />} />
                <Route path="manufacturing/quality/inspections/:inspectionId" element={<QualityInspectionForm />} />
                <Route path="manufacturing/quality/non-conformances" element={<NonConformanceList />} />
                <Route path="manufacturing/quality/non-conformances/new" element={<NonConformanceForm />} />
                <Route path="manufacturing/quality/non-conformances/:ncId" element={<NonConformanceForm />} />
                
                {/* Work Center & Maintenance Routes */}
                <Route path="manufacturing/work-centers" element={<WorkCenterList />} />
                <Route path="manufacturing/work-centers/new" element={<WorkCenterForm />} />
                <Route path="manufacturing/work-centers/:workCenterId" element={<WorkCenterForm />} />
                <Route path="manufacturing/maintenance" element={<MaintenanceCalendar />} />
                
                {/* Analytics Routes */}
                <Route path="manufacturing/analytics" element={<AnalyticsDashboard />} />
                
                <Route path="profile" element={<Dashboard />} />
                <Route path="settings" element={<Dashboard />} />
              </Route>

              {/* Catch all */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  );
};

export default App;


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


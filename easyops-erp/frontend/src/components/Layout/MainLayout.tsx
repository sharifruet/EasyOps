import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  Business as BusinessIcon,
  AccountCircle,
  Logout,
  Settings,
  AccountBalance as AccountingIcon,
  AccountTree as CoAIcon,
  Receipt as JournalIcon,
  Assessment as ReportIcon,
  Notifications as NotificationIcon,
  Campaign as CampaignIcon,
  Factory as ManufacturingIcon,
  Work as WorkOrderIcon,
  Build as BomIcon,
  FactCheck as QualityIcon,
  Engineering as WorkCenterIcon,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useAuth } from '@contexts/AuthContext';

const drawerWidth = 240;

interface MenuItem {
  text: string;
  icon: React.ReactElement;
  path: string;
}

interface MenuItemType {
  text: string;
  icon: React.ReactElement;
  path: string;
  children?: MenuItemType[];
}

const menuItems: MenuItemType[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Organizations', icon: <BusinessIcon />, path: '/organizations' },
  { 
    text: 'Accounting', 
    icon: <AccountingIcon />, 
    path: '/accounting',
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/accounting/dashboard' },
      { text: '---accounting-div1' as any, icon: <></>, path: '' }, // Divider
      { text: 'Chart of Accounts', icon: <CoAIcon />, path: '/accounting/chart-of-accounts' },
      { text: 'Journal Entry', icon: <JournalIcon />, path: '/accounting/journal-entry' },
      { text: 'Trial Balance', icon: <ReportIcon />, path: '/accounting/trial-balance' },
      { text: 'General Ledger', icon: <ReportIcon />, path: '/accounting/general-ledger' },
      { text: 'Profit & Loss', icon: <ReportIcon />, path: '/accounting/profit-loss' },
      { text: 'Balance Sheet', icon: <ReportIcon />, path: '/accounting/balance-sheet' },
      { text: 'Cash Flow', icon: <ReportIcon />, path: '/accounting/cash-flow' },
      { text: '---accounting-div2' as any, icon: <></>, path: '' }, // Divider - AR/AP/Bank features below
      { text: 'Customer Invoices', icon: <JournalIcon />, path: '/accounting/invoices' },
      { text: 'Credit Notes', icon: <JournalIcon />, path: '/accounting/credit-notes' },
      { text: 'Vendor Bills', icon: <JournalIcon />, path: '/accounting/bills' },
      { text: 'Bank Accounts', icon: <AccountingIcon />, path: '/accounting/bank-accounts' },
      { text: 'Bank Transactions', icon: <JournalIcon />, path: '/accounting/bank-transactions' },
      { text: 'Bank Reconciliation', icon: <AccountingIcon />, path: '/accounting/bank-reconciliation' },
      { text: 'Aging Reports', icon: <ReportIcon />, path: '/accounting/aging-reports' },
      { text: 'AR Aging Report', icon: <ReportIcon />, path: '/accounting/ar-aging-report' },
      { text: 'AP Aging Report', icon: <ReportIcon />, path: '/accounting/ap-aging-report' },
      { text: 'Customer Statements', icon: <ReportIcon />, path: '/accounting/customer-statements' },
      { text: 'Vendor Statements', icon: <ReportIcon />, path: '/accounting/vendor-statements' },
      { text: 'Payment Reminders', icon: <ReportIcon />, path: '/accounting/payment-reminders' },
    ]
  },
  { 
    text: 'Sales', 
    icon: <BusinessIcon />, 
    path: '/sales',
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/sales/dashboard' },
      { text: '---sales-div1' as any, icon: <></>, path: '' }, // Divider
      { text: 'Customers', icon: <PeopleIcon />, path: '/sales/customers' },
      { text: '---sales-div2' as any, icon: <></>, path: '' }, // Divider
      { text: 'Quotations', icon: <ReportIcon />, path: '/sales/quotations' },
      { text: 'Sales Orders', icon: <JournalIcon />, path: '/sales/orders' },
    ]
  },
  { 
    text: 'Inventory', 
    icon: <BusinessIcon />, 
    path: '/inventory',
    children: [
      { text: 'Products', icon: <BusinessIcon />, path: '/inventory/products' },
      { text: 'Stock Levels', icon: <ReportIcon />, path: '/inventory/stock' },
      { text: 'Warehouses', icon: <BusinessIcon />, path: '/inventory/warehouses' },
      { text: '---inventory-div1' as any, icon: <></>, path: '' }, // Divider
      { text: 'Batch/Lot Tracking', icon: <ReportIcon />, path: '/inventory/batches' },
      { text: 'Serial Numbers', icon: <ReportIcon />, path: '/inventory/serials' },
      { text: '---inventory-div2' as any, icon: <></>, path: '' }, // Divider
      { text: 'Stock Counting', icon: <ReportIcon />, path: '/inventory/counting' },
      { text: 'Stock Transfers', icon: <JournalIcon />, path: '/inventory/transfers' },
      { text: '---inventory-div3' as any, icon: <></>, path: '' }, // Divider
      { text: 'Inventory Valuation', icon: <ReportIcon />, path: '/inventory/valuation' },
      { text: 'Reports & Analytics', icon: <ReportIcon />, path: '/inventory/reports' },
      { text: 'Reorder Management', icon: <ReportIcon />, path: '/inventory/reorder' },
    ]
  },
  { 
    text: 'Purchase', 
    icon: <BusinessIcon />, 
    path: '/purchase',
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/purchase/dashboard' },
      { text: '---purchase-div1' as any, icon: <></>, path: '' }, // Divider
      { text: 'Purchase Orders', icon: <JournalIcon />, path: '/purchase/orders' },
      { text: 'Purchase Receipts', icon: <ReportIcon />, path: '/purchase/receipts' },
      { text: 'Purchase Invoices', icon: <JournalIcon />, path: '/purchase/invoices' },
      { text: 'Variance Management', icon: <SecurityIcon />, path: '/purchase/variances' },
      { text: '---purchase-div2' as any, icon: <></>, path: '' }, // Divider
      { text: 'Reports & Analytics', icon: <ReportIcon />, path: '/purchase/reports' },
    ]
  },
  { 
    text: 'HR', 
    icon: <PeopleIcon />, 
    path: '/hr',
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/hr/dashboard' },
      { text: '---hr-div1' as any, icon: <></>, path: '' }, // Divider - Employee Management
      { text: 'Employees', icon: <PeopleIcon />, path: '/hr/employees' },
      { text: 'Departments', icon: <BusinessIcon />, path: '/hr/departments' },
      { text: 'Positions', icon: <AdminIcon />, path: '/hr/positions' },
      { text: '---hr-div2' as any, icon: <></>, path: '' }, // Divider - Time & Attendance
      { text: 'Attendance', icon: <DashboardIcon />, path: '/hr/attendance' },
      { text: 'Timesheets', icon: <JournalIcon />, path: '/hr/timesheets' },
      { text: 'Leave Requests', icon: <ReportIcon />, path: '/hr/leave-requests' },
      { text: 'Leave Balance', icon: <ReportIcon />, path: '/hr/leave-balance' },
      { text: '---hr-div3' as any, icon: <></>, path: '' }, // Divider - Payroll & Benefits
      { text: 'Payroll Dashboard', icon: <DashboardIcon />, path: '/hr/payroll' },
      { text: 'Payroll Runs', icon: <JournalIcon />, path: '/hr/payroll-runs' },
      { text: 'Salary Management', icon: <AccountingIcon />, path: '/hr/salary' },
      { text: 'Benefits', icon: <BusinessIcon />, path: '/hr/benefits' },
      { text: 'Reimbursements', icon: <ReportIcon />, path: '/hr/reimbursements' },
      { text: 'Bonuses', icon: <ReportIcon />, path: '/hr/bonuses' },
      { text: '---hr-div4' as any, icon: <></>, path: '' }, // Divider - Performance
      { text: 'Performance Reviews', icon: <ReportIcon />, path: '/hr/performance' },
      { text: 'Goals', icon: <ReportIcon />, path: '/hr/goals' },
      { text: 'Development Plans', icon: <BusinessIcon />, path: '/hr/development' },
      { text: 'Training', icon: <ReportIcon />, path: '/hr/training' },
    ]
  },
  { 
    text: 'CRM', 
    icon: <BusinessIcon />, 
    path: '/crm',
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/crm/dashboard' },
      { text: '---crm-div1' as any, icon: <></>, path: '' }, // Divider
      { text: 'Leads', icon: <PeopleIcon />, path: '/crm/leads' },
      { text: 'Accounts', icon: <BusinessIcon />, path: '/crm/accounts' },
      { text: 'Contacts', icon: <PeopleIcon />, path: '/crm/contacts' },
      { text: '---crm-div2' as any, icon: <></>, path: '' }, // Divider
      { text: 'Opportunities', icon: <ReportIcon />, path: '/crm/opportunities' },
      { text: 'Pipeline', icon: <DashboardIcon />, path: '/crm/pipeline' },
      { text: 'Forecast', icon: <ReportIcon />, path: '/crm/forecast' },
      { text: '---crm-div3' as any, icon: <></>, path: '' }, // Divider
      { text: 'Campaigns', icon: <CampaignIcon />, path: '/crm/campaigns' },
      { text: 'Tasks', icon: <ReportIcon />, path: '/crm/tasks' },
      { text: 'Calendar', icon: <DashboardIcon />, path: '/crm/calendar' },
      { text: '---crm-div4' as any, icon: <></>, path: '' }, // Divider
      { text: 'Support', icon: <ReportIcon />, path: '/crm/support' },
      { text: 'Cases', icon: <ReportIcon />, path: '/crm/cases' },
      { text: 'Knowledge Base', icon: <ReportIcon />, path: '/crm/knowledge-base' },
      { text: '---crm-div5' as any, icon: <></>, path: '' }, // Divider
      { text: 'Analytics', icon: <ReportIcon />, path: '/crm/analytics' },
    ]
  },
  { 
    text: 'Manufacturing', 
    icon: <ManufacturingIcon />, 
    path: '/manufacturing',
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/manufacturing/dashboard' },
      { text: '---mfg-div1' as any, icon: <></>, path: '' }, // Divider
      { text: 'BOMs', icon: <BomIcon />, path: '/manufacturing/boms' },
      { text: 'Routings', icon: <WorkCenterIcon />, path: '/manufacturing/routings' },
      { text: '---mfg-div2' as any, icon: <></>, path: '' }, // Divider
      { text: 'Work Orders', icon: <WorkOrderIcon />, path: '/manufacturing/work-orders' },
      { text: 'Shop Floor', icon: <DashboardIcon />, path: '/manufacturing/shop-floor' },
      { text: 'Production Tracking', icon: <ReportIcon />, path: '/manufacturing/production-tracking' },
      { text: '---mfg-div3' as any, icon: <></>, path: '' }, // Divider
      { text: 'Quality Inspections', icon: <QualityIcon />, path: '/manufacturing/quality/inspections' },
      { text: 'Non-Conformances', icon: <NotificationIcon />, path: '/manufacturing/quality/non-conformances' },
      { text: '---mfg-div4' as any, icon: <></>, path: '' }, // Divider
      { text: 'Work Centers', icon: <WorkCenterIcon />, path: '/manufacturing/work-centers' },
      { text: 'Maintenance', icon: <WorkOrderIcon />, path: '/manufacturing/maintenance' },
      { text: '---mfg-div5' as any, icon: <></>, path: '' }, // Divider
      { text: 'Analytics', icon: <AnalyticsIcon />, path: '/manufacturing/analytics' },
    ]
  },
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Roles', icon: <SecurityIcon />, path: '/roles' },
  { text: 'Permissions', icon: <AdminIcon />, path: '/permissions' },
];

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (menuText: string) => {
    setExpandedMenus(prev => {
      const isCurrentlyExpanded = prev[menuText];
      // Collapse all other menus and toggle current one
      const newState: Record<string, boolean> = {};
      newState[menuText] = !isCurrentlyExpanded;
      return newState;
    });
  };

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          EasyOps ERP
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => {
                  if (item.children) {
                    toggleMenu(item.text);
                  } else {
                    handleNavigation(item.path);
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
                {item.children && (
                  <Typography variant="caption">
                    {expandedMenus[item.text] ? '▼' : '▶'}
                  </Typography>
                )}
              </ListItemButton>
            </ListItem>
            {item.children && expandedMenus[item.text] && (
              <List component="div" disablePadding>
                {item.children.map((child) => (
                  <ListItem key={child.text} disablePadding sx={{ pl: 4 }}>
                    <ListItemButton onClick={() => handleNavigation(child.path)}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {child.icon}
                      </ListItemIcon>
                      <ListItemText primary={child.text} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </React.Fragment>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => window.location.pathname.includes(item.path))?.text || 'Dashboard'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {user?.firstName || user?.username}
            </Typography>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32 }}>
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </Avatar>
            </IconButton>
          </Box>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate('/settings'); }}>
              <ListItemIcon>
                <Settings fontSize="small" />
              </ListItemIcon>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;


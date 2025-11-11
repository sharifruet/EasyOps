import React, { useCallback, useMemo, useState } from 'react';
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

type MenuAction = 'view' | 'manage' | 'admin';

interface MenuPermission {
  resource: string;
  action?: MenuAction;
}

interface MenuItemType {
  text: string;
  icon: React.ReactElement;
  path: string;
  permission?: MenuPermission;
  children?: MenuItemType[];
}

const menuItems: MenuItemType[] = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: { resource: 'dashboard', action: 'view' } },
  { text: 'Organizations', icon: <BusinessIcon />, path: '/organizations', permission: { resource: 'organizations', action: 'view' } },
  { 
    text: 'Accounting', 
    icon: <AccountingIcon />, 
    path: '/accounting',
    permission: { resource: 'accounting', action: 'view' },
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/accounting/dashboard', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Chart of Accounts', icon: <CoAIcon />, path: '/accounting/chart-of-accounts', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Journal Entry', icon: <JournalIcon />, path: '/accounting/journal-entry', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Trial Balance', icon: <ReportIcon />, path: '/accounting/trial-balance', permission: { resource: 'accounting', action: 'view' } },
      { text: 'General Ledger', icon: <ReportIcon />, path: '/accounting/general-ledger', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Profit & Loss', icon: <ReportIcon />, path: '/accounting/profit-loss', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Balance Sheet', icon: <ReportIcon />, path: '/accounting/balance-sheet', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Cash Flow', icon: <ReportIcon />, path: '/accounting/cash-flow', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Customer Invoices', icon: <JournalIcon />, path: '/accounting/invoices', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Credit Notes', icon: <JournalIcon />, path: '/accounting/credit-notes', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Vendor Bills', icon: <JournalIcon />, path: '/accounting/bills', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Bank Accounts', icon: <AccountingIcon />, path: '/accounting/bank-accounts', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Bank Transactions', icon: <JournalIcon />, path: '/accounting/bank-transactions', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Bank Reconciliation', icon: <AccountingIcon />, path: '/accounting/bank-reconciliation', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Aging Reports', icon: <ReportIcon />, path: '/accounting/aging-reports', permission: { resource: 'accounting', action: 'view' } },
      { text: 'AR Aging Report', icon: <ReportIcon />, path: '/accounting/ar-aging-report', permission: { resource: 'accounting', action: 'view' } },
      { text: 'AP Aging Report', icon: <ReportIcon />, path: '/accounting/ap-aging-report', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Customer Statements', icon: <ReportIcon />, path: '/accounting/customer-statements', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Vendor Statements', icon: <ReportIcon />, path: '/accounting/vendor-statements', permission: { resource: 'accounting', action: 'view' } },
      { text: 'Payment Reminders', icon: <ReportIcon />, path: '/accounting/payment-reminders', permission: { resource: 'accounting', action: 'view' } },
    ]
  },
  { 
    text: 'Sales', 
    icon: <BusinessIcon />, 
    path: '/sales',
    permission: { resource: 'sales', action: 'view' },
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/sales/dashboard', permission: { resource: 'sales', action: 'view' } },
      { text: 'Customers', icon: <PeopleIcon />, path: '/sales/customers', permission: { resource: 'sales', action: 'view' } },
      { text: 'Quotations', icon: <ReportIcon />, path: '/sales/quotations', permission: { resource: 'sales', action: 'view' } },
      { text: 'Sales Orders', icon: <JournalIcon />, path: '/sales/orders', permission: { resource: 'sales', action: 'view' } },
    ]
  },
  { 
    text: 'Inventory', 
    icon: <BusinessIcon />, 
    path: '/inventory',
    permission: { resource: 'inventory', action: 'view' },
    children: [
      { text: 'Products', icon: <BusinessIcon />, path: '/inventory/products', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Stock Levels', icon: <ReportIcon />, path: '/inventory/stock', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Warehouses', icon: <BusinessIcon />, path: '/inventory/warehouses', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Batch/Lot Tracking', icon: <ReportIcon />, path: '/inventory/batches', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Serial Numbers', icon: <ReportIcon />, path: '/inventory/serials', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Stock Counting', icon: <ReportIcon />, path: '/inventory/counting', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Stock Transfers', icon: <JournalIcon />, path: '/inventory/transfers', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Inventory Valuation', icon: <ReportIcon />, path: '/inventory/valuation', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Reports & Analytics', icon: <ReportIcon />, path: '/inventory/reports', permission: { resource: 'inventory', action: 'view' } },
      { text: 'Reorder Management', icon: <ReportIcon />, path: '/inventory/reorder', permission: { resource: 'inventory', action: 'view' } },
    ]
  },
  { 
    text: 'Purchase', 
    icon: <BusinessIcon />, 
    path: '/purchase',
    permission: { resource: 'purchase', action: 'view' },
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/purchase/dashboard', permission: { resource: 'purchase', action: 'view' } },
      { text: 'Purchase Orders', icon: <JournalIcon />, path: '/purchase/orders', permission: { resource: 'purchase', action: 'view' } },
      { text: 'Purchase Receipts', icon: <ReportIcon />, path: '/purchase/receipts', permission: { resource: 'purchase', action: 'view' } },
      { text: 'Purchase Invoices', icon: <JournalIcon />, path: '/purchase/invoices', permission: { resource: 'purchase', action: 'view' } },
      { text: 'Variance Management', icon: <SecurityIcon />, path: '/purchase/variances', permission: { resource: 'purchase', action: 'view' } },
      { text: 'Reports & Analytics', icon: <ReportIcon />, path: '/purchase/reports', permission: { resource: 'purchase', action: 'view' } },
    ]
  },
  { 
    text: 'HR', 
    icon: <PeopleIcon />, 
    path: '/hr',
    permission: { resource: 'hr', action: 'view' },
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/hr/dashboard', permission: { resource: 'hr', action: 'view' } },
      { text: 'Employees', icon: <PeopleIcon />, path: '/hr/employees', permission: { resource: 'hr', action: 'view' } },
      { text: 'Departments', icon: <BusinessIcon />, path: '/hr/departments', permission: { resource: 'hr', action: 'view' } },
      { text: 'Positions', icon: <AdminIcon />, path: '/hr/positions', permission: { resource: 'hr', action: 'view' } },
      { text: 'Attendance', icon: <DashboardIcon />, path: '/hr/attendance', permission: { resource: 'hr', action: 'view' } },
      { text: 'Timesheets', icon: <JournalIcon />, path: '/hr/timesheets', permission: { resource: 'hr', action: 'view' } },
      { text: 'Leave Requests', icon: <ReportIcon />, path: '/hr/leave-requests', permission: { resource: 'hr', action: 'view' } },
      { text: 'Leave Balance', icon: <ReportIcon />, path: '/hr/leave-balance', permission: { resource: 'hr', action: 'view' } },
      { text: 'Payroll Dashboard', icon: <DashboardIcon />, path: '/hr/payroll', permission: { resource: 'hr', action: 'view' } },
      { text: 'Payroll Runs', icon: <JournalIcon />, path: '/hr/payroll-runs', permission: { resource: 'hr', action: 'view' } },
      { text: 'Salary Management', icon: <AccountingIcon />, path: '/hr/salary', permission: { resource: 'hr', action: 'view' } },
      { text: 'Benefits', icon: <BusinessIcon />, path: '/hr/benefits', permission: { resource: 'hr', action: 'view' } },
      { text: 'Reimbursements', icon: <ReportIcon />, path: '/hr/reimbursements', permission: { resource: 'hr', action: 'view' } },
      { text: 'Bonuses', icon: <ReportIcon />, path: '/hr/bonuses', permission: { resource: 'hr', action: 'view' } },
      { text: 'Performance Reviews', icon: <ReportIcon />, path: '/hr/performance', permission: { resource: 'hr', action: 'view' } },
      { text: 'Goals', icon: <ReportIcon />, path: '/hr/goals', permission: { resource: 'hr', action: 'view' } },
      { text: 'Development Plans', icon: <BusinessIcon />, path: '/hr/development', permission: { resource: 'hr', action: 'view' } },
      { text: 'Training', icon: <ReportIcon />, path: '/hr/training', permission: { resource: 'hr', action: 'view' } },
    ]
  },
  { 
    text: 'CRM', 
    icon: <BusinessIcon />, 
    path: '/crm',
    permission: { resource: 'crm', action: 'view' },
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/crm/dashboard', permission: { resource: 'crm', action: 'view' } },
      { text: 'Leads', icon: <PeopleIcon />, path: '/crm/leads', permission: { resource: 'crm', action: 'view' } },
      { text: 'Accounts', icon: <BusinessIcon />, path: '/crm/accounts', permission: { resource: 'crm', action: 'view' } },
      { text: 'Contacts', icon: <PeopleIcon />, path: '/crm/contacts', permission: { resource: 'crm', action: 'view' } },
      { text: 'Opportunities', icon: <ReportIcon />, path: '/crm/opportunities', permission: { resource: 'crm', action: 'view' } },
      { text: 'Pipeline', icon: <DashboardIcon />, path: '/crm/pipeline', permission: { resource: 'crm', action: 'view' } },
      { text: 'Forecast', icon: <ReportIcon />, path: '/crm/forecast', permission: { resource: 'crm', action: 'view' } },
      { text: 'Campaigns', icon: <CampaignIcon />, path: '/crm/campaigns', permission: { resource: 'crm', action: 'view' } },
      { text: 'Tasks', icon: <ReportIcon />, path: '/crm/tasks', permission: { resource: 'crm', action: 'view' } },
      { text: 'Calendar', icon: <DashboardIcon />, path: '/crm/calendar', permission: { resource: 'crm', action: 'view' } },
      { text: 'Support', icon: <ReportIcon />, path: '/crm/support', permission: { resource: 'crm', action: 'view' } },
      { text: 'Cases', icon: <ReportIcon />, path: '/crm/cases', permission: { resource: 'crm', action: 'view' } },
      { text: 'Knowledge Base', icon: <ReportIcon />, path: '/crm/knowledge-base', permission: { resource: 'crm', action: 'view' } },
      { text: 'Analytics', icon: <ReportIcon />, path: '/crm/analytics', permission: { resource: 'crm', action: 'view' } },
    ]
  },
  { 
    text: 'Manufacturing', 
    icon: <ManufacturingIcon />, 
    path: '/manufacturing',
    permission: { resource: 'manufacturing', action: 'view' },
    children: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/manufacturing/dashboard', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'BOMs', icon: <BomIcon />, path: '/manufacturing/boms', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Routings', icon: <WorkCenterIcon />, path: '/manufacturing/routings', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Work Orders', icon: <WorkOrderIcon />, path: '/manufacturing/work-orders', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Shop Floor', icon: <DashboardIcon />, path: '/manufacturing/shop-floor', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Production Tracking', icon: <ReportIcon />, path: '/manufacturing/production-tracking', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Quality Inspections', icon: <QualityIcon />, path: '/manufacturing/quality/inspections', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Non-Conformances', icon: <NotificationIcon />, path: '/manufacturing/quality/non-conformances', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Work Centers', icon: <WorkCenterIcon />, path: '/manufacturing/work-centers', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Maintenance', icon: <WorkOrderIcon />, path: '/manufacturing/maintenance', permission: { resource: 'manufacturing', action: 'view' } },
      { text: 'Analytics', icon: <AnalyticsIcon />, path: '/manufacturing/analytics', permission: { resource: 'manufacturing', action: 'view' } },
    ]
  },
  { text: 'Users', icon: <PeopleIcon />, path: '/users', permission: { resource: 'users', action: 'view' } },
  { text: 'Roles', icon: <SecurityIcon />, path: '/roles', permission: { resource: 'roles', action: 'view' } },
  { text: 'Permissions', icon: <AdminIcon />, path: '/permissions', permission: { resource: 'permissions', action: 'view' } },
];

const MainLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const { user, logout, canViewResource, canManageResource } = useAuth();

  const hasAccess = useCallback(
    (permission?: MenuPermission) => {
      if (!permission) {
        return true;
      }

      const action = permission.action ?? 'view';
      if (action === 'manage' || action === 'admin') {
        return canManageResource(permission.resource);
      }

      return canViewResource(permission.resource) || canManageResource(permission.resource);
    },
    [canManageResource, canViewResource]
  );

  const accessibleMenuItems = useMemo(() => {
    const filterItems = (items: MenuItemType[]): MenuItemType[] =>
      items
        .map((item) => {
          const childItems = item.children ? filterItems(item.children) : undefined;
          const hasChildren = childItems && childItems.length > 0;
          const isAllowed = hasAccess(item.permission) && (!item.children || hasChildren);

          if (!isAllowed) {
            return null;
          }

          return {
            ...item,
            children: childItems,
          };
        })
        .filter((entry): entry is MenuItemType => entry !== null);

    return filterItems(menuItems);
  }, [hasAccess]);

  const flattenedMenuItems = useMemo(() => {
    const flatten = (items: MenuItemType[]): MenuItemType[] =>
      items.flatMap((item) => {
        const children = item.children ?? [];
        if (children.length > 0) {
          return [item, ...flatten(children)];
        }
        return [item];
      });

    return flatten(accessibleMenuItems);
  }, [accessibleMenuItems]);

  const currentPath =
    typeof window !== 'undefined' && window.location ? window.location.pathname : '/dashboard';

  const activeMenuItem = useMemo(() => {
    const exactMatch = flattenedMenuItems.find(
      (item) => item.path !== '' && currentPath === item.path
    );
    if (exactMatch) {
      return exactMatch;
    }

    return flattenedMenuItems.find(
      (item) => item.path !== '' && currentPath.startsWith(item.path)
    );
  }, [currentPath, flattenedMenuItems]);

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
        {accessibleMenuItems.length === 0 ? (
          <ListItem>
            <ListItemText
              primary="No modules available"
              primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
            />
          </ListItem>
        ) : (
          accessibleMenuItems.map((item) => (
            <React.Fragment key={item.text}>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (item.children && item.children.length > 0) {
                      toggleMenu(item.text);
                    } else {
                      handleNavigation(item.path);
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                  {item.children && item.children.length > 0 && (
                    <Typography variant="caption">
                      {expandedMenus[item.text] ? '▼' : '▶'}
                    </Typography>
                  )}
                </ListItemButton>
              </ListItem>
              {item.children && item.children.length > 0 && expandedMenus[item.text] && (
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem key={child.text} disablePadding sx={{ pl: 4 }}>
                      <ListItemButton onClick={() => handleNavigation(child.path)}>
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          {child.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={child.text}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </React.Fragment>
          ))
        )}
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
            {activeMenuItem?.text || 'Dashboard'}
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


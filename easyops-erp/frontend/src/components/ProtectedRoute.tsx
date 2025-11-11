import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';
import { getAccessRequirementForPath } from '@utils/accessControl';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const {
    isAuthenticated,
    isLoading,
    canViewResource,
    canManageResource,
  } = useAuth();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const requirement = getAccessRequirementForPath(location.pathname);

  if (requirement) {
    const { resource, action } = requirement;
    const needsManage = action === 'manage' || action === 'admin';
    const hasAccess = needsManage
      ? canManageResource(resource)
      : canViewResource(resource) || canManageResource(resource);

    if (!hasAccess) {
      return <Navigate to="/forbidden" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;


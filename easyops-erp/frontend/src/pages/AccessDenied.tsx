import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="60vh"
      textAlign="center"
      gap={3}
    >
      <Typography variant="h3" component="h1" fontWeight="bold">
        Access Denied
      </Typography>
      <Typography variant="body1" color="text.secondary" maxWidth={480}>
        You do not have the required permissions to view this page. If you think this is a mistake,
        please contact your system administrator to request access.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </Box>
  );
};

export default AccessDenied;


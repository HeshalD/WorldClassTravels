import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const { data } = await authAPI.getMe();
        if (data && data.admin) {
          setIsAuthenticated(true);
          setIsAdmin(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, [location]);

  if (isAuthenticated === null) {
    // Show loading state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    // Redirect to home if not admin
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

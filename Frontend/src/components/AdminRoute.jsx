// components/AdminRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMe } from '../lib/api/auth';

const AdminRoute = ({ children }) => {
  const { token } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const user = await getMe(); // No need to pass api parameter
        setIsAdmin(user?.isAdmin === true);
        setError(null);
      } catch (error) {
        console.error('Failed to verify admin status:', error);
        setError(error.message);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    console.error('Admin route error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p>Failed to verify admin status</p>
          <p className="text-sm text-gray-600 mt-2">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return children;
};

export default AdminRoute;
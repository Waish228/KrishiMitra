import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Sprout } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps a route to require authentication.
 * - Shows a full-screen spinner while resolving the initial session.
 * - Redirects to /auth (preserving the intended URL) if not authenticated.
 * - Renders children when authenticated.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-card-gradient-green rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
            <Sprout className="w-8 h-8 text-white" />
          </div>
          <div className="flex gap-1.5 justify-center">
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <p className="text-sm text-gray-400 mt-3">Loading KrishiMitra...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    // Preserve the intended URL so we can redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

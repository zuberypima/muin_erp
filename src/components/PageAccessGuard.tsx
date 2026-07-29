import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isPageAllowedForUser } from '../utils/permissionsUtils';
import { resolveDepartmentRoute } from '../utils/departmentUtils';

interface PageAccessGuardProps {
  routePath?: string;
  children?: React.ReactNode;
}

const PageAccessGuard: React.FC<PageAccessGuardProps> = ({ routePath, children }) => {
  const { user } = useAuth();
  const location = useLocation();

  const pathToCheck = routePath || location.pathname;

  const isAllowed = isPageAllowedForUser(user, pathToCheck);

  if (!isAllowed) {
    const targetRoute = resolveDepartmentRoute(user);
    // If user is already on target route or target route is also unallowed, fallback to /services
    const safeTarget = targetRoute !== pathToCheck ? targetRoute : '/services';
    return <Navigate to={safeTarget} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PageAccessGuard;

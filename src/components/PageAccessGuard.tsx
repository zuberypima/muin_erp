import React from 'react';
import { useLocation, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  isPageAllowedForUser,
  ALL_SYSTEM_PAGES,
  getFirstAllowedRouteForModule
} from '../utils/permissionsUtils';
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
    // If user is trying to access a root module route (like /procurement, /hr, /finance, /logistics, /assets, /it)
    // but they have partial access (some sub-page is allowed, but not overview),
    // redirect them to their first allowed page in that module!
    const matchedSystemPage = ALL_SYSTEM_PAGES.find(p => p.route === pathToCheck);
    if (matchedSystemPage) {
      const fallbackModuleRoute = getFirstAllowedRouteForModule(user, matchedSystemPage.module);
      if (fallbackModuleRoute && fallbackModuleRoute !== pathToCheck) {
        return <Navigate to={fallbackModuleRoute} replace />;
      }
    }

    const targetRoute = resolveDepartmentRoute(user);
    // If user is already on target route or target route is also unallowed, fallback to /services
    const safeTarget = targetRoute !== pathToCheck ? targetRoute : '/services';
    return <Navigate to={safeTarget} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default PageAccessGuard;


import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import SidebarNav from './SidebarNav';

const PortalLayout = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (user?.role) {
    const rolePath = user.role === 'ADMIN' ? '/admin' : user.role === 'EMPLOYER' ? '/employer' : '/candidate';
    if (
      (location.pathname.startsWith('/candidate') && user.role !== 'CANDIDATE') ||
      (location.pathname.startsWith('/employer') && user.role !== 'EMPLOYER') ||
      (location.pathname.startsWith('/admin') && user.role !== 'ADMIN')
    ) {
      return <Navigate to={rolePath} replace />;
    }
  }

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div className="portal-app-layout">
        <aside className="portal-sidebar">
          <SidebarNav />
        </aside>

        <main className="portal-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;

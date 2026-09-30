import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Alert, Button, Spin } from 'antd';
import { fetchCurrentUser, logout } from '../store/authSlice';
import SidebarNav from './SidebarNav';

const PortalLayout = () => {
  const { isAuthenticated, user, sessionChecked, loading, error } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (!sessionChecked) {
    return <div className="portal-p-24">{error && !loading
      ? <Alert type="error" message="We couldn’t check your session. Please retry." action={<><Button onClick={() => dispatch(fetchCurrentUser())}>Retry</Button><Button onClick={() => dispatch(logout())}>Sign in again</Button></>} />
      : <Spin tip="Checking your session…"><div className="portal-py-80" /></Spin>}</div>;
  }

  if (user?.role === 'EMPLOYER' && user.onboarding?.required && !['/employer/organisation', '/employer/profile'].includes(location.pathname)) {
    return <Navigate to="/employer/organisation" replace />;
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

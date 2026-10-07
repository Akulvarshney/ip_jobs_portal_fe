import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectTheme, logout, syncGuestTheme } from './store/authSlice';
import { millisecondsUntilNextThemeChange } from './utils/istTheme';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import AuthEntry from './pages/AuthEntry';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import './styles/portal-ui.css';
import ScrollToTop from './components/ScrollToTop';

import JobDetails from './pages/public/JobDetails';
import CompanyProfile from './pages/public/CompanyProfile';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import TermsOfService from './pages/public/TermsOfService';
import Security from './pages/public/Security';

import PortalLayout from './components/PortalLayout';
import CandidateProfile from './pages/candidate/CandidateProfile';
import CandidateResume from './pages/candidate/CandidateResume';
import CandidateJobs from './pages/candidate/CandidateJobs';
import CandidateApplications from './pages/candidate/CandidateApplications';
import CandidateSavedJobs from './pages/candidate/CandidateSavedJobs';
import CandidateInterviews from './pages/candidate/CandidateInterviews';
import CandidateSettings from './pages/candidate/CandidateSettings';

import OrganisationProfile from './pages/employer/OrganisationProfile';
import Team from './pages/employer/Team';
import InviteAcceptance from './pages/employer/InviteAcceptance';
import ManageJobs from './pages/employer/ManageJobs';
import ManageApplications from './pages/employer/ManageApplications';
import EmployerJobDetails from './pages/employer/EmployerJobDetails';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEmployers from './pages/admin/ManageEmployers';
import EmployerDetails from './pages/admin/EmployerDetails';
import EmployerDirectory from './pages/admin/EmployerDirectory';
import AdminManageJobs from './pages/admin/ManageJobs';
import AdminManageApplications from './pages/admin/ManageApplications';

function App() {
  const dispatch = useDispatch();
  const mode = useSelector(selectTheme);
  const { token, isAuthenticated, user, sessionChecked } = useSelector((state) => state.auth);
  const isDark = mode === 'dark';

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    if (token && !sessionChecked) dispatch(fetchCurrentUser());
  }, [dispatch, token, sessionChecked]);

  useEffect(() => {
    const expire = () => dispatch(logout());
    window.addEventListener('portal:session-expired', expire);
    return () => window.removeEventListener('portal:session-expired', expire);
  }, [dispatch]);

  useEffect(() => {
    let timer;
    const syncAtNextBoundary = () => {
      dispatch(syncGuestTheme());
      clearTimeout(timer);
      timer = setTimeout(syncAtNextBoundary, millisecondsUntilNextThemeChange() + 50);
    };
    const syncWhenVisible = () => {
      if (!document.hidden) syncAtNextBoundary();
    };
    syncAtNextBoundary();
    document.addEventListener('visibilitychange', syncWhenVisible);
    window.addEventListener('focus', syncAtNextBoundary);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', syncWhenVisible);
      window.removeEventListener('focus', syncAtNextBoundary);
    };
  }, [dispatch]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#a3a3a3' : '#0284c7',
          colorBgBase: isDark ? '#0b0b0b' : '#f8fafc',
          colorBgContainer: isDark ? '#171717' : '#ffffff',
          colorBgElevated: isDark ? '#171717' : '#ffffff',
          colorText: isDark ? '#e5e5e5' : '#1e293b',
          colorTextSecondary: isDark ? '#a3a3a3' : '#475569',
          colorTextLightSolid: isDark ? '#090909' : '#ffffff',
          colorBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
          borderRadius: 12,
        },
        components: isDark ? {
          Tooltip: {
            colorBgSpotlight: '#ffffff',
            colorTextLightSolid: '#090909',
          },
        } : undefined,
      }}
    >
      <BrowserRouter>
        <ScrollToTop />
        <div className="portal-app-root">
          <Navbar />
          <main className="portal-main-area">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={
                isAuthenticated ? (
                  <Navigate to={user?.role === 'ADMIN' ? '/admin' : user?.role === 'EMPLOYER' ? '/employer' : '/candidate'} replace />
                ) : (
                  <Home />
                )
              } />
              <Route path="/login" element={<AuthEntry />} />
              <Route path="/candidate/login" element={<Login audience="CANDIDATE" />} />
              <Route path="/candidate/signup" element={<Login audience="CANDIDATE" />} />
              <Route path="/employee/login" element={<Login audience="EMPLOYEE" />} />
              <Route path="/employee/signup" element={<Navigate to="/employee/login" replace />} />
              <Route path="/organisation/login" element={<Login audience="ORG_ADMIN" />} />
              <Route path="/organisation/signup" element={<Login audience="ORG_ADMIN" />} />
              <Route path="/employer/login" element={<Navigate to="/organisation/login" replace />} />
              <Route path="/employer/signup" element={<Navigate to="/organisation/signup" replace />} />
              <Route path="/admin/login" element={<Login audience="ADMIN" />} />
              <Route path="/invite/:token/login" element={<InviteAcceptance />} />
              <Route path="/invite/:token/signup" element={<InviteAcceptance />} />
              <Route path="/invite/:token" element={<InviteAcceptance />} />
              <Route path="/jobs" element={<Navigate to="/candidate/jobs" replace />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/companies/:id" element={<CompanyProfile />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/security" element={<Security />} />

              {/* Single Unified Layout for All Portal Roles */}
              <Route element={<PortalLayout />}>
                {/* Candidate Routes */}
                <Route path="/candidate" element={<CandidateDashboard />} />
                <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
                <Route path="/candidate/profile" element={<CandidateProfile />} />
                <Route path="/candidate/education" element={<CandidateProfile />} />
                <Route path="/candidate/experience" element={<CandidateProfile />} />
                <Route path="/candidate/skills" element={<CandidateProfile />} />
                <Route path="/candidate/certifications" element={<CandidateProfile />} />
                <Route path="/candidate/resume" element={<CandidateProfile />} />
                <Route path="/candidate/jobs" element={<CandidateJobs />} />
                <Route path="/candidate/applications" element={<CandidateApplications />} />
                <Route path="/candidate/saved-jobs" element={<CandidateSavedJobs />} />
                <Route path="/candidate/interviews" element={<CandidateInterviews />} />
                <Route path="/candidate/settings" element={<CandidateSettings />} />

                {/* Employer Routes */}
                <Route path="/employer" element={<EmployerDashboard />} />
                <Route path="/employer/dashboard" element={<EmployerDashboard />} />
                <Route path="/employer/profile" element={<Navigate to="/employer/organisation" replace />} />
                <Route path="/employer/organisation" element={<OrganisationProfile />} />
                <Route path="/employer/team" element={<Team />} />
                <Route path="/employer/jobs" element={<ManageJobs />} />
                <Route path="/employer/jobs/:id" element={<EmployerJobDetails />} />
                <Route path="/employer/applications" element={<ManageApplications />} />
                <Route path="/employer/settings" element={<CandidateSettings />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/employers" element={<ManageEmployers />} />
                <Route path="/admin/employers/:id" element={<EmployerDetails />} />
                <Route path="/admin/employers/:id/people" element={<EmployerDirectory kind="people" />} />
                <Route path="/admin/employers/:id/jobs" element={<EmployerDirectory kind="jobs" />} />
                <Route path="/admin/jobs" element={<AdminManageJobs />} />
                <Route path="/admin/applications" element={<AdminManageApplications />} />
                <Route path="/admin/settings" element={<CandidateSettings />} />
              </Route>

              <Route path="/settings" element={<Navigate to="/candidate/settings" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          {!isAuthenticated && <Footer />}
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

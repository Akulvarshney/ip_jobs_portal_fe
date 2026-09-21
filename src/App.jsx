import React, { useEffect, useLayoutEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectTheme } from './store/authSlice';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import './styles/portal-ui.css';

import JobSearch from './pages/public/JobSearch';
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
import ManageJobs from './pages/employer/ManageJobs';
import ManageApplications from './pages/employer/ManageApplications';
import EmployerJobDetails from './pages/employer/EmployerJobDetails';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageEmployers from './pages/admin/ManageEmployers';
import AdminManageJobs from './pages/admin/ManageJobs';
import AdminManageApplications from './pages/admin/ManageApplications';
import AdminManageReports from './pages/admin/ManageReports';

function App() {
  const dispatch = useDispatch();
  const mode = useSelector(selectTheme);
  const token = useSelector((state) => state.auth.token);
  const isDark = mode === 'dark';

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  useEffect(() => {
    if (token) dispatch(fetchCurrentUser());
  }, [dispatch, token]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDark ? '#0ea5e9' : '#0284c7',
          colorBgBase: isDark ? '#0f172a' : '#f8fafc',
          colorBgContainer: isDark ? '#1e293b' : '#ffffff',
          colorBgElevated: isDark ? '#1e293b' : '#ffffff',
          colorText: isDark ? '#f3f4f6' : '#1e293b',
          colorTextSecondary: isDark ? '#9ca3af' : '#475569',
          colorBorder: isDark ? 'rgba(255, 255, 255, 0.12)' : '#cbd5e1',
          borderRadius: 12,
        },
      }}
    >
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
          <Navbar />
          <main style={{ flex: 1, width: '100%', minWidth: 0 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/jobs" element={<JobSearch />} />
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
                <Route path="/employer/organisation" element={<OrganisationProfile />} />
                <Route path="/employer/jobs" element={<ManageJobs />} />
                <Route path="/employer/jobs/:id" element={<EmployerJobDetails />} />
                <Route path="/employer/applications" element={<ManageApplications />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<ManageUsers />} />
                <Route path="/admin/employers" element={<ManageEmployers />} />
                <Route path="/admin/jobs" element={<AdminManageJobs />} />
                <Route path="/admin/applications" element={<AdminManageApplications />} />
                <Route path="/admin/reports" element={<AdminManageReports />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;

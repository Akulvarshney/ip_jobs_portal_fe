import React from 'react';
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
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#0ea5e9',
          colorBgBase: '#0f172a',
          colorBgContainer: '#1e293b',
          colorBgElevated: '#1e293b',
          colorText: '#f3f4f6',
          colorTextSecondary: '#9ca3af',
          colorBorder: 'rgba(255, 255, 255, 0.12)',
          borderRadius: 12,
        },
        components: {
          Modal: {
            contentBg: '#1e293b',
            headerBg: '#1e293b',
            titleColor: '#ffffff',
          },
          Table: {
            colorBgContainer: 'transparent',
            headerBg: 'rgba(15, 23, 42, 0.6)',
            headerColor: '#9ca3af',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          },
          Select: {
            colorBgContainer: 'rgba(255, 255, 255, 0.05)',
            colorBgElevated: '#1e293b',
            colorText: '#ffffff',
            colorBorder: 'rgba(255, 255, 255, 0.12)',
          },
          Input: {
            colorBgContainer: 'rgba(255, 255, 255, 0.05)',
            colorText: '#ffffff',
            colorBorder: 'rgba(255, 255, 255, 0.12)',
          },
        },
      }}
    >
      <BrowserRouter>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/jobs" element={<JobSearch />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/companies/:id" element={<CompanyProfile />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/security" element={<Security />} />
              
              {/* Candidate Routes */}
              <Route path="/candidate" element={<CandidateDashboard />} />
              <Route path="/candidate/dashboard" element={<CandidateDashboard />} />
              <Route path="/candidate/profile" element={<CandidateProfile />} />
              <Route path="/candidate/education" element={<CandidateProfile />} />
              <Route path="/candidate/experience" element={<CandidateProfile />} />
              <Route path="/candidate/skills" element={<CandidateProfile />} />
              <Route path="/candidate/certifications" element={<CandidateProfile />} />
              <Route path="/candidate/resume" element={<CandidateResume />} />
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

              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<ManageUsers />} />
              <Route path="/admin/employers" element={<ManageEmployers />} />
              <Route path="/admin/jobs" element={<AdminManageJobs />} />
              <Route path="/admin/applications" element={<AdminManageApplications />} />
              <Route path="/admin/reports" element={<AdminManageReports />} />
              
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

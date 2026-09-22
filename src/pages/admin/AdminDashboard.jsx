import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminDashboard } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import { 
  UserOutlined, 
  BankOutlined, 
  FileTextOutlined, 
  SolutionOutlined, 
  AlertOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ClockCircleOutlined,
  ArrowRightOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Tag, Table, Button, Progress, message, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboard: reduxDashboard, loading } = useSelector((state) => state.admin);

  const fetchStats = async () => {
    try {
      await dispatch(fetchAdminDashboard()).unwrap();
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Failed to load dashboard metrics');
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dispatch]);

  const stats = reduxDashboard;

  const statCards = [
    {
      title: 'Total Candidates',
      count: stats?.totalCandidates ?? 0,
      icon: <UserOutlined className="portal-stat-icon-cyan" />,
      subtitle: 'Registered IPs & Professionals',
      link: '/admin/users?role=CANDIDATE',
    },
    {
      title: 'Total Employers',
      count: stats?.totalEmployers ?? 0,
      icon: <BankOutlined className="portal-stat-icon-cyan" />,
      subtitle: `${stats?.pendingEmployers ?? 0} pending approvals`,
      link: '/admin/employers',
    },
    {
      title: 'Active Job Mandates',
      count: stats?.activeJobs ?? 0,
      icon: <FileTextOutlined className="portal-stat-icon-cyan" />,
      subtitle: `${(stats?.pausedJobs ?? 0) + (stats?.closedJobs ?? 0)} paused/closed`,
      link: '/admin/jobs',
    },
    {
      title: 'Applications Logged',
      count: stats?.totalApplications ?? 0,
      icon: <SolutionOutlined className="portal-stat-icon-cyan" />,
      subtitle: 'Total candidate submissions',
      link: '/admin/applications',
    },
    {
      title: 'Moderation Reports',
      count: stats?.totalReports ?? 0,
      icon: <AlertOutlined className="portal-stat-icon-cyan" />,
      subtitle: `${stats?.openReports ?? 0} open investigation(s)`,
      link: '/admin/reports',
    },
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader 
          title="Platform Governance & Analytics" 
          subtitle="System overview of registered insolvency professionals, corporate employers, active mandates, and safety moderation."
          actions={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchStats}
              loading={loading}
              className="portal-btn-secondary portal-inline-flex-center"
            >
              Refresh Data
            </Button>
          }
        />

        {/* Top Metric Cards */}
        <div className="portal-stats-grid-auto portal-mb-32">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="portal-glass-card portal-admin-stat-card"
              onClick={() => navigate(card.link)}
            >
              <div className="portal-admin-stat-top">
                <span className="portal-admin-stat-title">
                  {card.title}
                </span>
                <div className="portal-admin-stat-icon-wrapper">
                  {card.icon}
                </div>
              </div>

              <div>
                <div className="portal-admin-stat-count">
                  {card.count}
                </div>
                <div className="portal-admin-stat-bottom">
                  <span className="portal-text-detail portal-text-12">{card.subtitle}</span>
                  <ArrowRightOutlined className="portal-text-link portal-text-12" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Activity Feeds Grid */}
        <div className="portal-grid-2col-gap-24 portal-mb-32">
          
          {/* Recent Employers & Organisations */}
          <div className="portal-glass-card portal-p-24">
            <div className="portal-flex-between-center portal-mb-20">
              <div>
                <h3 className="portal-text-18 font-bold portal-text-heading m-0">
                  Recent Organisations
                </h3>
                <span className="portal-text-13 portal-text-muted">Entities and firms onboarding onto the platform</span>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/employers')}
                className="portal-btn-link-p0"
              >
                View All →
              </Button>
            </div>

            {stats?.recentEmployers && stats.recentEmployers.length > 0 ? (
              <div className="portal-flex-col-gap-12">
                {stats.recentEmployers.map((emp) => (
                  <div 
                    key={emp.id}
                    className="portal-admin-list-item"
                  >
                    <div>
                      <div className="portal-text-14 font-semibold portal-text-heading">{emp.name}</div>
                      <div className="portal-text-12 portal-text-muted mt-2">
                        {emp.type || 'N/A'} • {emp.location || 'India'}
                      </div>
                    </div>
                    <div className="portal-flex-center-gap-8">
                      <Tag color={emp.status === 'APPROVED' ? 'green' : (emp.status === 'PENDING' ? 'gold' : 'red')}>
                        {emp.status}
                      </Tag>
                      <Tag color="cyan">{emp._count?.jobs || 0} Jobs</Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="portal-text-muted m-0">No recent organisations found.</p>
            )}
          </div>

          {/* Latest Job Mandates */}
          <div className="portal-glass-card portal-p-24">
            <div className="portal-flex-between-center portal-mb-20">
              <div>
                <h3 className="portal-text-18 font-bold portal-text-heading m-0">
                  Latest Mandates & Jobs
                </h3>
                <span className="portal-text-13 portal-text-muted">CIRP, Liquidation, and Restructuring listings</span>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/jobs')}
                className="portal-btn-link-p0"
              >
                View All →
              </Button>
            </div>

            {stats?.recentJobs && stats.recentJobs.length > 0 ? (
              <div className="portal-flex-col-gap-12">
                {stats.recentJobs.map((job) => (
                  <div 
                    key={job.id}
                    className="portal-admin-list-item"
                  >
                    <div>
                      <div className="portal-text-14 font-semibold portal-text-heading">{job.title}</div>
                      <div className="portal-text-12 portal-text-muted mt-2">
                        {job.employer?.name || 'Unknown Entity'}
                      </div>
                    </div>
                    <div className="portal-flex-center-gap-8">
                      <Tag color={job.status === 'ACTIVE' ? 'blue' : (job.status === 'PAUSED' ? 'orange' : 'default')}>
                        {job.status}
                      </Tag>
                      <Tag color="purple">{job._count?.applications || 0} Apps</Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="portal-text-muted m-0">No recent jobs found.</p>
            )}
          </div>

        </div>

        {/* Live Moderation & Safety Alerts */}
        <div className="portal-glass-card portal-p-24">
          <div className="portal-flex-between-center portal-mb-20">
            <div>
              <h3 className="portal-text-18 font-bold portal-text-heading m-0 portal-inline-flex-center-gap-8">
                <WarningOutlined className="portal-text-warning" /> Active Safety & Moderation Feed
              </h3>
              <span className="portal-text-13 portal-text-muted">User reports regarding spam, duplicate mandates, and platform integrity</span>
            </div>
            <Button 
              type="link" 
              onClick={() => navigate('/admin/reports')}
              className="portal-btn-link-p0"
            >
              Manage All Reports →
            </Button>
          </div>

          {stats?.recentReports && stats.recentReports.length > 0 ? (
            <div className="portal-reports-grid">
              {stats.recentReports.map((rep) => (
                <div 
                  key={rep.id}
                  className="portal-report-card-alert"
                >
                  <div className="portal-flex-between-center portal-mb-8">
                    <Tag color={rep.type === 'Fake job' ? 'red' : (rep.type === 'Spam' ? 'orange' : 'volcano')}>
                      {rep.type}
                    </Tag>
                    <Tag color={rep.status === 'OPEN' ? 'error' : (rep.status === 'INVESTIGATING' ? 'warning' : 'success')}>
                      {rep.status}
                    </Tag>
                  </div>
                  <p className="portal-report-desc">
                    {rep.description}
                  </p>
                  <div className="portal-report-meta-row">
                    <span>Report #{rep.id}</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="portal-reports-empty-state">
              <CheckCircleOutlined className="portal-empty-check-icon" />
              All moderation queues are clear! No pending issues.
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminDashboard;

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
      icon: <UserOutlined style={{ fontSize: '22px', color: 'var(--theme-link)' }} />,
      subtitle: 'Registered IPs & Professionals',
      color: 'rgba(var(--theme-surface-rgb), 0.7)',
      borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)',
      link: '/admin/users?role=CANDIDATE',
    },
    {
      title: 'Total Employers',
      count: stats?.totalEmployers ?? 0,
      icon: <BankOutlined style={{ fontSize: '22px', color: 'var(--theme-link)' }} />,
      subtitle: `${stats?.pendingEmployers ?? 0} pending approvals`,
      color: 'rgba(var(--theme-surface-rgb), 0.7)',
      borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)',
      link: '/admin/employers',
    },
    {
      title: 'Active Job Mandates',
      count: stats?.activeJobs ?? 0,
      icon: <FileTextOutlined style={{ fontSize: '22px', color: 'var(--theme-link)' }} />,
      subtitle: `${(stats?.pausedJobs ?? 0) + (stats?.closedJobs ?? 0)} paused/closed`,
      color: 'rgba(var(--theme-surface-rgb), 0.7)',
      borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)',
      link: '/admin/jobs',
    },
    {
      title: 'Applications Logged',
      count: stats?.totalApplications ?? 0,
      icon: <SolutionOutlined style={{ fontSize: '22px', color: 'var(--theme-link)' }} />,
      subtitle: 'Total candidate submissions',
      color: 'rgba(var(--theme-surface-rgb), 0.7)',
      borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)',
      link: '/admin/applications',
    },
    {
      title: 'Moderation Reports',
      count: stats?.totalReports ?? 0,
      icon: <AlertOutlined style={{ fontSize: '22px', color: 'var(--theme-link)' }} />,
      subtitle: `${stats?.openReports ?? 0} open investigation(s)`,
      color: 'rgba(var(--theme-surface-rgb), 0.7)',
      borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)',
      link: '/admin/reports',
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <AdminHeader 
          title="Platform Governance & Analytics" 
          subtitle="System overview of registered insolvency professionals, corporate employers, active mandates, and safety moderation."
          actions={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchStats}
              loading={loading}
              className="portal-btn-secondary"
              style={{ display: 'inline-flex', alignItems: 'center' }}
            >
              Refresh Data
            </Button>
          }
        />

        {/* Top Metric Cards */}
        <div 
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '18px',
            marginBottom: '32px'
          }}
        >
          {statCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="portal-glass-card"
              style={{
                background: card.color,
                borderColor: card.borderColor,
                padding: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
              onClick={() => navigate(card.link)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <span style={{ color: 'var(--theme-muted)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.title}
                </span>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(var(--theme-contrast-rgb), 0.06)' }}>
                  {card.icon}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--theme-heading)', lineHeight: 1 }}>
                  {card.count}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--theme-detail)' }}>{card.subtitle}</span>
                  <ArrowRightOutlined style={{ color: 'var(--theme-link)', fontSize: '12px' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dashboard Activity Feeds Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
          
          {/* Recent Employers & Organisations */}
          <div className="portal-glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--theme-heading)', fontSize: '18px', fontWeight: 700 }}>
                  Recent Organisations
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--theme-muted)' }}>Entities and firms onboarding onto the platform</span>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/employers')}
                style={{ color: 'var(--theme-link)', padding: 0 }}
              >
                View All →
              </Button>
            </div>

            {stats?.recentEmployers && stats.recentEmployers.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentEmployers.map((emp) => (
                  <div 
                    key={emp.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: 'rgba(var(--theme-contrast-rgb), 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--theme-heading)', fontSize: '14px' }}>{emp.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--theme-muted)', marginTop: '2px' }}>
                        {emp.type || 'N/A'} • {emp.location || 'India'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag color={emp.status === 'APPROVED' ? 'green' : (emp.status === 'PENDING' ? 'gold' : 'red')}>
                        {emp.status}
                      </Tag>
                      <Tag color="cyan">{emp._count?.jobs || 0} Jobs</Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--theme-muted)', margin: 0 }}>No recent organisations found.</p>
            )}
          </div>

          {/* Latest Job Mandates */}
          <div className="portal-glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: 'var(--theme-heading)', fontSize: '18px', fontWeight: 700 }}>
                  Latest Mandates & Jobs
                </h3>
                <span style={{ fontSize: '13px', color: 'var(--theme-muted)' }}>CIRP, Liquidation, and Restructuring listings</span>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/jobs')}
                style={{ color: 'var(--theme-link)', padding: 0 }}
              >
                View All →
              </Button>
            </div>

            {stats?.recentJobs && stats.recentJobs.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.recentJobs.map((job) => (
                  <div 
                    key={job.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      background: 'rgba(var(--theme-contrast-rgb), 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--theme-heading)', fontSize: '14px' }}>{job.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--theme-muted)', marginTop: '2px' }}>
                        {job.employer?.name || 'Unknown Entity'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Tag color={job.status === 'ACTIVE' ? 'blue' : (job.status === 'PAUSED' ? 'orange' : 'default')}>
                        {job.status}
                      </Tag>
                      <Tag color="purple">{job._count?.applications || 0} Apps</Tag>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--theme-muted)', margin: 0 }}>No recent jobs found.</p>
            )}
          </div>

        </div>

        {/* Live Moderation & Safety Alerts */}
        <div className="portal-glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, color: 'var(--theme-heading)', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WarningOutlined style={{ color: '#f59e0b' }} /> Active Safety & Moderation Feed
              </h3>
              <span style={{ fontSize: '13px', color: 'var(--theme-muted)' }}>User reports regarding spam, duplicate mandates, and platform integrity</span>
            </div>
            <Button 
              type="link" 
              onClick={() => navigate('/admin/reports')}
              style={{ color: 'var(--theme-link)', padding: 0 }}
            >
              Manage All Reports →
            </Button>
          </div>

          {stats?.recentReports && stats.recentReports.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {stats.recentReports.map((rep) => (
                <div 
                  key={rep.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(239, 68, 68, 0.06)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    borderRadius: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <Tag color={rep.type === 'Fake job' ? 'red' : (rep.type === 'Spam' ? 'orange' : 'volcano')}>
                      {rep.type}
                    </Tag>
                    <Tag color={rep.status === 'OPEN' ? 'error' : (rep.status === 'INVESTIGATING' ? 'warning' : 'success')}>
                      {rep.status}
                    </Tag>
                  </div>
                  <p style={{ color: 'var(--theme-text)', fontSize: '13px', margin: '8px 0', lineHeight: 1.4 }}>
                    {rep.description}
                  </p>
                  <div style={{ fontSize: '11px', color: 'var(--theme-muted)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Report #{rep.id}</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--theme-muted)' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px', display: 'block' }} />
              All moderation queues are clear! No pending issues.
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminDashboard;

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
      icon: <UserOutlined style={{ fontSize: '24px', color: '#38bdf8' }} />,
      subtitle: 'Registered IPs & Professionals',
      color: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderColor: 'rgba(14, 165, 233, 0.3)',
      link: '/admin/users?role=CANDIDATE',
    },
    {
      title: 'Total Employers',
      count: stats?.totalEmployers ?? 0,
      icon: <BankOutlined style={{ fontSize: '24px', color: '#a855f7' }} />,
      subtitle: `${stats?.pendingEmployers ?? 0} pending approvals`,
      color: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderColor: 'rgba(168, 85, 247, 0.3)',
      link: '/admin/employers',
    },
    {
      title: 'Active Job Mandates',
      count: stats?.activeJobs ?? 0,
      icon: <FileTextOutlined style={{ fontSize: '24px', color: '#10b981' }} />,
      subtitle: `${(stats?.pausedJobs ?? 0) + (stats?.closedJobs ?? 0)} paused/closed`,
      color: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      link: '/admin/jobs',
    },
    {
      title: 'Applications Logged',
      count: stats?.totalApplications ?? 0,
      icon: <SolutionOutlined style={{ fontSize: '24px', color: '#f59e0b' }} />,
      subtitle: 'Total candidate submissions',
      color: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      link: '/admin/applications',
    },
    {
      title: 'Moderation Reports',
      count: stats?.totalReports ?? 0,
      icon: <AlertOutlined style={{ fontSize: '24px', color: '#ef4444' }} />,
      subtitle: `${stats?.openReports ?? 0} open investigation(s)`,
      color: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(30, 41, 59, 0.8) 100%)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      link: '/admin/reports',
    },
  ];

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
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
                <span style={{ color: '#9ca3af', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {card.title}
                </span>
                <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.06)' }}>
                  {card.icon}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '36px', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>
                  {card.count}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '12px', color: '#cbd5e1' }}>{card.subtitle}</span>
                  <ArrowRightOutlined style={{ color: '#38bdf8', fontSize: '12px' }} />
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
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>
                  Recent Organisations
                </h3>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>Entities and firms onboarding onto the platform</span>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/employers')}
                style={{ color: '#38bdf8', padding: 0 }}
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
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>{emp.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
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
              <p style={{ color: '#9ca3af', margin: 0 }}>No recent organisations found.</p>
            )}
          </div>

          {/* Latest Job Mandates */}
          <div className="portal-glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700 }}>
                  Latest Mandates & Jobs
                </h3>
                <span style={{ fontSize: '13px', color: '#9ca3af' }}>CIRP, Liquidation, and Restructuring listings</span>
              </div>
              <Button 
                type="link" 
                onClick={() => navigate('/admin/jobs')}
                style={{ color: '#38bdf8', padding: 0 }}
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
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>{job.title}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
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
              <p style={{ color: '#9ca3af', margin: 0 }}>No recent jobs found.</p>
            )}
          </div>

        </div>

        {/* Live Moderation & Safety Alerts */}
        <div className="portal-glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#ffffff', fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <WarningOutlined style={{ color: '#f59e0b' }} /> Active Safety & Moderation Feed
              </h3>
              <span style={{ fontSize: '13px', color: '#9ca3af' }}>User reports regarding spam, duplicate mandates, and platform integrity</span>
            </div>
            <Button 
              type="link" 
              onClick={() => navigate('/admin/reports')}
              style={{ color: '#38bdf8', padding: 0 }}
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
                  <p style={{ color: '#f3f4f6', fontSize: '13px', margin: '8px 0', lineHeight: 1.4 }}>
                    {rep.description}
                  </p>
                  <div style={{ fontSize: '11px', color: '#9ca3af', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Report #{rep.id}</span>
                    <span>{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '24px', color: '#9ca3af' }}>
              <CheckCircleOutlined style={{ fontSize: '32px', color: '#10b981', marginBottom: '8px', display: 'block' }} />
              All moderation queues are clear! No pending issues.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

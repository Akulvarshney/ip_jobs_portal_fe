import React, { useCallback, useEffect } from 'react';
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
  ArrowRightOutlined,
  ReloadOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { Alert, Tag, Button, Skeleton } from 'antd';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { dashboard: reduxDashboard, dashboardLoading, dashboardError } = useSelector((state) => state.admin);
  const showSkeleton = !reduxDashboard && !dashboardError;

  const fetchStats = useCallback(() => {
    dispatch(fetchAdminDashboard());
  }, [dispatch]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

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
      title: 'Active Job Jobs',
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
    }
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader
        title="Dashboard"
        subtitle=""
      />

      {dashboardError && (
        <Alert
          type="error"
          showIcon
          message="Dashboard metrics could not be loaded"
          description={dashboardError}
          action={<Button onClick={fetchStats} loading={dashboardLoading}>Retry</Button>}
          className="portal-mb-20"
        />
      )}

      {showSkeleton && <p role="status" className="portal-text-muted-14 portal-mb-20">Loading dashboard metrics…</p>}

      {(showSkeleton || reduxDashboard) && <div aria-busy={showSkeleton}>

        {/* Top Metric Cards */}
        <div className="portal-stats-grid-auto portal-mb-32">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`portal-glass-card portal-admin-stat-card${showSkeleton ? ' portal-admin-stat-card-loading' : ''}`}
              onClick={showSkeleton ? undefined : () => navigate(card.link)}
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
                  {showSkeleton ? <Skeleton.Input active size="small" style={{ width: 76, height: 36 }} /> : card.count}
                </div>
                <div className="portal-admin-stat-bottom">
                  {showSkeleton ? <Skeleton.Input active size="small" style={{ width: 132 }} /> : <><span className="portal-text-detail portal-text-12">{card.subtitle}</span><ArrowRightOutlined className="portal-text-link portal-text-12" /></>}
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

            {showSkeleton ? (
              <div className="portal-flex-col-gap-12" aria-hidden="true">
                {[0, 1, 2].map((item) => <div key={item} className="portal-admin-list-item portal-admin-skeleton-row"><Skeleton active avatar={{ size: 32 }} title={{ width: 130 }} paragraph={{ rows: 1, width: 90 }} /></div>)}
              </div>
            ) : stats?.recentEmployers && stats.recentEmployers.length > 0 ? (
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

          {/* Latest Job Jobs */}
          <div className="portal-glass-card portal-p-24">
            <div className="portal-flex-between-center portal-mb-20">
              <div>
                <h3 className="portal-text-18 font-bold portal-text-heading m-0">
                  Latest Jobs & Jobs
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

            {showSkeleton ? (
              <div className="portal-flex-col-gap-12" aria-hidden="true">
                {[0, 1, 2].map((item) => <div key={item} className="portal-admin-list-item portal-admin-skeleton-row"><Skeleton active title={{ width: 150 }} paragraph={{ rows: 1, width: 110 }} /></div>)}
              </div>
            ) : stats?.recentJobs && stats.recentJobs.length > 0 ? (
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


      </div>}
    </div>
  );
};

export default AdminDashboard;

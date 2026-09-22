import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SearchOutlined,
  SendOutlined,
  BookOutlined,
  CalendarOutlined,
  SettingOutlined,
  BankOutlined,
  TeamOutlined,
  SolutionOutlined,
  AlertOutlined,
  CompassOutlined
} from '@ant-design/icons';

const ROLE_NAV_CONFIGS = {
  CANDIDATE: {
    portalLabel: 'Candidate Portal',
    portalSubtext: 'Insolvency Professional',
    groups: [
      {
        title: 'Main',
        items: [
          { path: '/candidate', exact: true, label: 'Dashboard', icon: <DashboardOutlined /> },
          { path: '/candidate/profile', label: 'My Profile', icon: <UserOutlined /> },
        ]
      },
      {
        title: 'Mandates',
        items: [
          { path: '/candidate/jobs', label: 'Search Mandates', icon: <SearchOutlined /> },
          { path: '/candidate/applications', label: 'My Applications', icon: <SendOutlined /> },
          { path: '/candidate/saved-jobs', label: 'Saved Mandates', icon: <BookOutlined /> },
          { path: '/candidate/interviews', label: 'Interviews', icon: <CalendarOutlined /> },
        ]
      },
      {
        title: 'Account',
        items: [
          { path: '/candidate/settings', label: 'Settings', icon: <SettingOutlined /> },
        ]
      }
    ]
  },
  EMPLOYER: {
    portalLabel: 'Employer Portal',
    portalSubtext: 'Corporate & Practice',
    groups: [
      {
        title: 'Overview',
        items: [
          { path: '/employer', exact: true, label: 'Entity Dashboard', icon: <DashboardOutlined /> },
        ]
      },
      {
        title: 'Recruitment',
        items: [
          { path: '/employer/jobs', label: 'Manage Mandates', icon: <FileTextOutlined /> },
          { path: '/employer/applications', label: 'Submissions', icon: <TeamOutlined /> },
        ]
      },
      {
        title: 'Organisation',
        items: [
          { path: '/employer/organisation', label: 'Organisation Profile', icon: <BankOutlined /> },
        ]
      },
      {
        title: 'Account',
        items: [
          { path: '/employer/settings', label: 'Settings', icon: <SettingOutlined /> },
        ]
      }
    ]
  },
  ADMIN: {
    portalLabel: 'Admin Console',
    portalSubtext: 'Platform Governance',
    groups: [
      {
        title: 'Analytics',
        items: [
          { path: '/admin', exact: true, label: 'Platform Analytics', icon: <DashboardOutlined /> },
        ]
      },
      {
        title: 'Governance',
        items: [
          { path: '/admin/users', label: 'User Governance', icon: <UserOutlined /> },
          { path: '/admin/employers', label: 'Employer Approvals', icon: <BankOutlined /> },
          { path: '/admin/jobs', label: 'Mandates Directory', icon: <FileTextOutlined /> },
          { path: '/admin/applications', label: 'All Applications', icon: <SolutionOutlined /> },
        ]
      },
      {
        title: 'System & Safety',
        items: [
          { path: '/admin/reports', label: 'Moderation Reports', icon: <AlertOutlined /> },
          { path: '/admin/settings', label: 'Settings', icon: <SettingOutlined /> },
        ]
      }
    ]
  }
};

const SidebarNav = ({ activeKey }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Detect role from path prefix or fallback to authenticated user role
  const getActiveRole = () => {
    if (location.pathname.startsWith('/admin')) return 'ADMIN';
    if (location.pathname.startsWith('/employer')) return 'EMPLOYER';
    if (location.pathname.startsWith('/candidate')) return 'CANDIDATE';
    return user?.role || 'CANDIDATE';
  };

  const currentRole = getActiveRole();
  const config = ROLE_NAV_CONFIGS[currentRole] || ROLE_NAV_CONFIGS.CANDIDATE;

  const isItemActive = (item) => {
    if (activeKey) return activeKey === item.path;
    if (item.exact) {
      return (
        location.pathname === item.path ||
        location.pathname === `${item.path}/` ||
        location.pathname === `${item.path}/dashboard`
      );
    }
    return location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
  };

  const getUserInitials = () => {
    if (user?.name) {
      const parts = user.name.trim().split(' ');
      if (parts.length > 1) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.name.slice(0, 2).toUpperCase();
    }
    if (currentRole === 'ADMIN') return 'AD';
    if (currentRole === 'EMPLOYER') return 'EM';
    return 'IP';
  };

  return (
    <div className="portal-sidebar-card">
      {/* Sidebar Role Profile Header */}
      <div className="portal-sidebar-user">
        <div className="portal-sidebar-user-avatar">
          {getUserInitials()}
        </div>
        <div className="portal-sidebar-user-info">
          <div className="portal-sidebar-user-name" title={user?.name || config.portalLabel}>
            {user?.name || (currentRole === 'ADMIN' ? 'Platform Admin' : (currentRole === 'EMPLOYER' ? 'Corporate Recruiter' : 'Insolvency Professional'))}
          </div>
          <div className="portal-sidebar-user-role">
            <span>{config.portalLabel}</span>
          </div>
        </div>
      </div>

      {/* Role Navigation Links (Grouped & Scrollable) */}
      <div className="portal-sidebar-links-container">
        {config.groups.map((group, groupIdx) => (
          <React.Fragment key={group.title || groupIdx}>
            {group.title && (
              <div className="portal-sidebar-section-title">
                {group.title}
              </div>
            )}
            {group.items.map((item) => {
              const active = isItemActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`portal-sidebar-link ${active ? 'active' : ''}`}
                >
                  <span className="portal-sidebar-icon">{item.icon}</span>
                  <span className="portal-sidebar-text">{item.label}</span>
                  {active && <span className="portal-sidebar-active-indicator" />}
                </Link>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Sidebar Secondary Navigation / Quick Links & Status */}
      <div className="portal-sidebar-footer">
        <Link
          to="/jobs"
          className="portal-sidebar-link portal-sidebar-sublink"
        >
          <span className="portal-sidebar-icon"><CompassOutlined /></span>
          <span className="portal-sidebar-text">Mandates Directory</span>
        </Link>

        <div className="portal-sidebar-status-card">
          <span>
            <span className="portal-sidebar-status-dot" />
            Portal Active
          </span>
          <span className="portal-sidebar-version">v2.4</span>
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;

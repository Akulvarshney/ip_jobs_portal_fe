import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SearchOutlined,
  SendOutlined,
  BookOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';

const navItems = [
  { path: '/candidate', exact: true, label: 'Dashboard', icon: <DashboardOutlined /> },
  { path: '/candidate/profile', label: 'My Profile', icon: <UserOutlined /> },
  { path: '/candidate/resume', label: 'Resume', icon: <FileTextOutlined /> },
  { path: '/candidate/jobs', label: 'Search Mandates', icon: <SearchOutlined /> },
  { path: '/candidate/applications', label: 'Applications', icon: <SendOutlined /> },
  { path: '/candidate/saved-jobs', label: 'Saved Mandates', icon: <BookOutlined /> },
  { path: '/candidate/interviews', label: 'Interviews', icon: <CalendarOutlined /> },
  { path: '/candidate/settings', label: 'Settings', icon: <SettingOutlined /> },
];

const CandidateNav = ({ activeKey }) => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const isItemActive = (item) => {
    if (activeKey) return activeKey === item.path;
    if (item.exact) {
      return location.pathname === '/candidate' || location.pathname === '/candidate/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'IP';
    const parts = user.name.trim().split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="candidate-sidebar-card">
      {/* Sidebar Candidate Profile Header */}
      <div className="candidate-sidebar-user">
        <div className="candidate-sidebar-user-avatar">
          {getUserInitials()}
        </div>
        <div className="candidate-sidebar-user-info">
          <div className="candidate-sidebar-user-name" title={user?.name || 'Professional'}>
            {user?.name || 'Professional'}
          </div>
          <div className="candidate-sidebar-user-role">
            Candidate Portal
          </div>
        </div>
      </div>

      {/* Sidebar Nav Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`candidate-sidebar-link ${active ? 'active' : ''}`}
            >
              <span className="candidate-sidebar-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateNav;

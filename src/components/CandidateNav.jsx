import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  { path: '/candidate/profile', label: 'Profile', icon: <UserOutlined /> },
  { path: '/candidate/resume', label: 'Resume', icon: <FileTextOutlined /> },
  { path: '/candidate/jobs', label: 'Search Jobs', icon: <SearchOutlined /> },
  { path: '/candidate/applications', label: 'Applications', icon: <SendOutlined /> },
  { path: '/candidate/saved-jobs', label: 'Saved Jobs', icon: <BookOutlined /> },
  { path: '/candidate/interviews', label: 'Interviews', icon: <CalendarOutlined /> },
  { path: '/candidate/settings', label: 'Settings', icon: <SettingOutlined /> },
];

const CandidateNav = ({ activeKey }) => {
  const location = useLocation();

  const isItemActive = (item) => {
    if (activeKey) return activeKey === item.path;
    if (item.exact) {
      return location.pathname === '/candidate' || location.pathname === '/candidate/dashboard';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      marginBottom: '32px',
      position: 'sticky',
      top: '64px',
      zIndex: 40
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        scrollbarWidth: 'none',
      }}>
        {navItems.map((item) => {
          const active = isItemActive(item);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 16px',
                fontSize: '14px',
                fontWeight: active ? '600' : '500',
                color: active ? '#38bdf8' : '#9ca3af',
                borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent',
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                background: active ? 'rgba(56, 189, 248, 0.06)' : 'transparent',
                borderRadius: '8px 8px 0 0',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default CandidateNav;

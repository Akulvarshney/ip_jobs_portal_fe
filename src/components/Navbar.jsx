import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Tag, Avatar, Dropdown } from 'antd';
import { 
  RocketOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined, 
  SafetyCertificateOutlined,
  SendOutlined,
  BookOutlined,
  CalendarOutlined,
  SettingOutlined
} from '@ant-design/icons';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getUserDashboardPath = () => {
    if (user?.role === 'ADMIN') return '/admin';
    if (user?.role === 'EMPLOYER') return '/employer';
    return '/candidate';
  };

  const getUserDashboardLabel = () => {
    if (user?.role === 'ADMIN') return 'Admin Dashboard';
    if (user?.role === 'EMPLOYER') return 'Employer Dashboard';
    return 'Candidate Dashboard';
  };

  const getCandidateMenuItems = () => [
    {
      key: 'dashboard',
      icon: <DashboardOutlined style={{ color: '#38bdf8' }} />,
      label: 'Candidate Dashboard',
      onClick: () => navigate('/candidate'),
    },
    {
      key: 'profile',
      icon: <UserOutlined style={{ color: '#38bdf8' }} />,
      label: 'My Profile',
      onClick: () => navigate('/candidate/profile'),
    },
    {
      key: 'applications',
      icon: <SendOutlined style={{ color: '#38bdf8' }} />,
      label: 'Applications',
      onClick: () => navigate('/candidate/applications'),
    },
    {
      key: 'saved-jobs',
      icon: <BookOutlined style={{ color: '#38bdf8' }} />,
      label: 'Saved Jobs',
      onClick: () => navigate('/candidate/saved-jobs'),
    },
    {
      key: 'interviews',
      icon: <CalendarOutlined style={{ color: '#38bdf8' }} />,
      label: 'Interviews',
      onClick: () => navigate('/candidate/interviews'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined style={{ color: '#38bdf8' }} />,
      label: 'Settings',
      onClick: () => navigate('/candidate/settings'),
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      danger: true,
      onClick: handleLogout,
    },
  ];

  const userMenuItems = user?.role === 'CANDIDATE' 
    ? getCandidateMenuItems()
    : [
        {
          key: 'dashboard',
          icon: <DashboardOutlined style={{ color: '#38bdf8' }} />,
          label: getUserDashboardLabel(),
          onClick: () => navigate(getUserDashboardPath()),
        },
        {
          type: 'divider',
        },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Logout',
          danger: true,
          onClick: handleLogout,
        },
      ];

  const getDashboardLinkLabel = () => {
    if (user?.role === 'ADMIN') return 'Admin Portal';
    if (user?.role === 'EMPLOYER') return 'Post & Manage Jobs';
    return 'Candidate Portal';
  };

  return (
    <header className="portal-navbar">
      <div className="portal-nav-container">
        <Link to="/" className="portal-logo">
          <div className="portal-logo-icon">
            <RocketOutlined />
          </div>
          <span>Res<span style={{ color: "#38bdf8" }}>olve</span></span>
        </Link>

        <nav className="portal-nav-links">
          <Link to="/" className={`portal-nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Home
          </Link>
          <Link 
            to={getUserDashboardPath()} 
            className={`portal-nav-link ${location.pathname.startsWith('/candidate') || location.pathname.startsWith('/employer') || location.pathname.startsWith('/admin') ? 'active' : ''}`}
          >
            {getDashboardLinkLabel()}
          </Link>
          <Link to="/jobs" className={`portal-nav-link ${location.pathname.startsWith('/jobs') ? 'active' : ''}`}>
            Mandates Directory
          </Link>
        </nav>

        <div className="portal-nav-actions">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <Tag 
                style={{ 
                  borderRadius: '12px', 
                  padding: '2px 10px', 
                  fontSize: '12px', 
                  fontWeight: 600,
                  background: 'rgba(14, 165, 233, 0.12)',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8'
                }}
              >
                {user?.role === 'ADMIN' ? 'Platform Admin' : (user?.role === 'EMPLOYER' ? 'Employer' : 'Professional')}
              </Tag>
              
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: 'rgba(255, 255, 255, 0.08)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    style={{ backgroundColor: '#0ea5e9', color: '#ffffff' }} 
                  />
                  <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                </div>
              </Dropdown>
            </div>
          ) : (
            <>
              <Link to="/login" className="portal-btn-secondary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                Log In
              </Link>
              <Link to="/login?mode=signup" className="portal-btn-primary" style={{ padding: '8px 18px', fontSize: '14px' }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

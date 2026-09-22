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
import { getFileUrl } from '../utils/fileUrl';

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
    if (user?.role === 'ADMIN') return 'Admin Console';
    if (user?.role === 'EMPLOYER') return 'Employer Dashboard';
    return 'Candidate Dashboard';
  };

  const getCandidateMenuItems = () => [
    {
      key: 'dashboard',
      icon: <DashboardOutlined className="portal-menu-icon" />,
      label: 'Candidate Dashboard',
      onClick: () => navigate('/candidate'),
    },
    {
      key: 'profile',
      icon: <UserOutlined className="portal-menu-icon" />,
      label: 'My Profile',
      onClick: () => navigate('/candidate/profile'),
    },
    {
      key: 'applications',
      icon: <SendOutlined className="portal-menu-icon" />,
      label: 'Applications',
      onClick: () => navigate('/candidate/applications'),
    },
    {
      key: 'saved-jobs',
      icon: <BookOutlined className="portal-menu-icon" />,
      label: 'Saved Jobs',
      onClick: () => navigate('/candidate/saved-jobs'),
    },
    {
      key: 'interviews',
      icon: <CalendarOutlined className="portal-menu-icon" />,
      label: 'Interviews',
      onClick: () => navigate('/candidate/interviews'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined className="portal-menu-icon" />,
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
          icon: <DashboardOutlined className="portal-menu-icon" />,
          label: getUserDashboardLabel(),
          onClick: () => navigate(getUserDashboardPath()),
        },
        {
          key: 'settings',
          icon: <SettingOutlined className="portal-menu-icon" />,
          label: 'Settings',
          onClick: () => navigate(user?.role === 'EMPLOYER' ? '/employer/settings' : '/admin/settings'),
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
          <span>Res<span className="portal-logo-highlight">olve</span></span>
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
            <div className="portal-nav-user-wrap">
              <Tag className="portal-nav-role-tag">
                {user?.role === 'ADMIN' ? 'Platform Admin' : (user?.role === 'EMPLOYER' ? 'Employer' : 'Professional')}
              </Tag>
              
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
                <div className="portal-nav-user-pill">
                  <Avatar 
                    size="small" 
                    icon={<UserOutlined />} 
                    src={getFileUrl(user?.profilePhoto || user?.candidateProfile?.profilePhoto)}
                    className="portal-nav-avatar"
                  />
                  <span className="portal-nav-user-name">
                    {user?.name || user?.email?.split('@')[0]}
                  </span>
                </div>
              </Dropdown>
            </div>
          ) : (
            <>
              <Link to="/login" className="portal-btn-secondary portal-nav-btn">
                Log In
              </Link>
              <Link to="/login?mode=signup" className="portal-btn-primary portal-nav-btn">
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

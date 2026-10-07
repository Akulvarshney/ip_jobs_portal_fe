import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { Tag, Avatar, Dropdown } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  SendOutlined,
  BookOutlined,
  CalendarOutlined,
  SettingOutlined,
  DownOutlined,
  BankOutlined
} from '@ant-design/icons';
import { getFileUrl } from '../utils/fileUrl';
import logoWithName from '../assets/logo_with_name.png';

const Navbar = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    const signIn = user?.role === 'ADMIN' ? '/admin/login' : user?.role === 'EMPLOYER' ? user?.onboarding?.memberRole === 'RECRUITER' ? '/employee/login' : '/organisation/login' : '/candidate/login';
    dispatch(logout());
    navigate(signIn);
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

  const loginMenuItems = [
    { key: 'candidate-login', icon: <UserOutlined />, label: <Link to="/candidate/login">Candidate login</Link> },
    { key: 'organisation-login', icon: <BankOutlined />, label: <Link to="/organisation/login">Organisation admin login</Link> },
    { key: 'employee-login', icon: <BankOutlined />, label: <Link to="/employee/login">Invited employee login</Link> },
  ];

  return (
    <header className="portal-navbar">
      <div className="portal-nav-container">
        <Link to="/" className="portal-logo" style={{ textDecoration: 'none' }}>
          <img src={logoWithName} alt="Resolve Logo" style={{ height: '32px', display: 'block' }} />
        </Link>

        <div className="portal-nav-actions">
          {isAuthenticated ? (
            <div className="portal-nav-user-wrap">
              {/* <Tag className="portal-nav-role-tag">
                {user?.role === 'ADMIN' ? 'Platform Admin' : (user?.role === 'EMPLOYER' ? 'Employer' : 'Candidate')}
              </Tag> */}

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
            <Dropdown menu={{ items: loginMenuItems }} placement="bottomRight" trigger={['click']}>
              <button type="button" className="portal-btn-primary portal-nav-btn" aria-label="Choose login type" aria-haspopup="menu">
                Log in <DownOutlined aria-hidden="true" />
              </button>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

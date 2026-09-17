import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  DashboardOutlined, 
  UserOutlined, 
  BankOutlined, 
  FileTextOutlined, 
  SolutionOutlined, 
  AlertOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { Badge } from 'antd';

const AdminHeader = ({ title, subtitle, stats, actions }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <DashboardOutlined /> },
    { path: '/admin/users', label: 'Users', icon: <UserOutlined /> },
    { path: '/admin/employers', label: 'Employers', icon: <BankOutlined /> },
    { path: '/admin/jobs', label: 'Jobs & Mandates', icon: <FileTextOutlined /> },
    { path: '/admin/applications', label: 'Applications', icon: <SolutionOutlined /> },
    { path: '/admin/reports', label: 'Moderation Reports', icon: <AlertOutlined /> },
  ];

  return (
    <div style={{ marginBottom: '28px' }}>
      {/* Top Banner / Breadcrumb Bar */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}
      >
        <div>
          <h1 className="portal-section-title" style={{ fontSize: '32px', margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p className="portal-section-subtitle" style={{ marginTop: '6px', fontSize: '15px' }}>
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {actions}
          </div>
        )}
      </div>

      {/* Admin Navigation Tab Bar */}
      <div 
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          padding: '6px',
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '14px',
          scrollbarWidth: 'none',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin'
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#ffffff' : '#9ca3af',
                background: isActive ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)' : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(14, 165, 233, 0.35)' : 'none',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default AdminHeader;

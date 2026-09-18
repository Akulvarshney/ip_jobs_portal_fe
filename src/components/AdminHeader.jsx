import React from 'react';

const AdminHeader = ({ title, subtitle, stats, actions }) => {
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
        }}
      >
        <div>
          <h1 className="portal-section-title" style={{ fontSize: '30px', margin: 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p className="portal-section-subtitle" style={{ marginTop: '6px', fontSize: '14px' }}>
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
    </div>
  );
};

export default AdminHeader;

import React from 'react';

const AdminHeader = ({ title, subtitle, stats, actions }) => {
  return (
    <div className="portal-admin-header-wrap">
      {/* Top Banner / Breadcrumb Bar */}
      <div className="portal-admin-header-banner">
        <div>
          <h1 className="portal-section-title portal-admin-header-title">
            {title}
          </h1>
        </div>

        {actions && (
          <div className="portal-admin-header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;

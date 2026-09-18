import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarNav from './SidebarNav';

const PortalLayout = () => {
  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div className="portal-app-layout">
        <aside className="portal-sidebar">
          <SidebarNav />
        </aside>

        <main className="portal-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;

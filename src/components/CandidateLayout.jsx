import React from 'react';
import { Outlet } from 'react-router-dom';
import CandidateNav from './CandidateNav';

const CandidateLayout = () => {
  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div className="candidate-portal-layout">
        <aside className="candidate-portal-sidebar">
          <CandidateNav />
        </aside>

        <main className="candidate-portal-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default CandidateLayout;

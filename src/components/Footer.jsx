import React from 'react';
import { Link } from 'react-router-dom';
import { RocketOutlined, GithubOutlined, TwitterOutlined, LinkedinOutlined, SendOutlined } from '@ant-design/icons';
import { Input, Button, message } from 'antd';

const Footer = () => {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@resolveportal.com';

  const handleSubscribe = (e) => {
    e.preventDefault();
    message.success('Thank you for subscribing to Resolve updates!');
  };

  return (
    <footer className="portal-footer">
      <div className="portal-footer-container">
        <div className="portal-footer-brand">
          <Link to="/" className="portal-logo">
            <div className="portal-logo-icon">
              <RocketOutlined />
            </div>
            <span>Res<span style={{ color: "#38bdf8" }}>olve</span></span>
          </Link>
          <p>
            Connecting world-class talent with pioneering tech organizations. Experience seamless applications and direct employer matching powered by Resolve UI.
          </p>
          <div style={{ display: 'flex', gap: '14px', marginTop: '20px' }}>
            <a href="#" style={{ color: '#9ca3af', fontSize: '20px', transition: 'color 0.2s' }}><GithubOutlined /></a>
            <a href="#" style={{ color: '#9ca3af', fontSize: '20px', transition: 'color 0.2s' }}><TwitterOutlined /></a>
            <a href="#" style={{ color: '#9ca3af', fontSize: '20px', transition: 'color 0.2s' }}><LinkedinOutlined /></a>
          </div>
        </div>

        <div>
          <h4 className="portal-footer-title">For Candidates</h4>
          <ul className="portal-footer-links">
            <li><Link to="/candidate">Browse All Jobs</Link></li>
            <li><Link to="/candidate">Remote Opportunities</Link></li>
            <li><Link to="/candidate">Full-Stack Roles</Link></li>
            <li><Link to="/candidate">Salary Calculator</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="portal-footer-title">For Employers</h4>
          <ul className="portal-footer-links">
            <li><Link to="/employer">Post a Job</Link></li>
            <li><Link to="/employer">Manage Applicants</Link></li>
            <li><Link to="/employer">Employer Branding</Link></li>
            <li><Link to="/employer">Special Invites</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="portal-footer-title">Stay Updated</h4>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '14px' }}>
            Get weekly curated tech jobs sent directly to your inbox.
          </p>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
            <Input 
              placeholder="Enter your email" 
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: 'white', borderRadius: '10px' }} 
            />
            <button className="portal-btn-primary" type="submit" style={{ padding: '8px 14px' }}>
              <SendOutlined />
            </button>
          </form>
        </div>
      </div>

      <div className="portal-footer-bottom">
        <div>© {new Date().getFullYear()} Resolve Portal. All rights reserved. • Support: <a href={`mailto:${supportEmail}`} style={{ color: '#38bdf8', textDecoration: 'none' }}>{supportEmail}</a></div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/privacy" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Privacy Policy</Link>
          <Link to="/terms" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Terms of Service</Link>
          <Link to="/security" style={{ color: '#9ca3af', textDecoration: 'none', transition: 'color 0.2s' }}>Security</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

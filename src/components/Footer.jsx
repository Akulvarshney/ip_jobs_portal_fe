import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RocketOutlined, GithubOutlined, TwitterOutlined, LinkedinOutlined, SendOutlined, CheckCircleFilled, SyncOutlined } from '@ant-design/icons';
import { Input, Button, Tag, message } from 'antd';
import { useSelector } from 'react-redux';
import api from '../api';

const Footer = () => {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@resolveportal.com';
  const { user } = useSelector((state) => state.auth);

  const [emailInput, setEmailInput] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);

  // Prefill email if user is logged in
  useEffect(() => {
    if (user?.email) {
      setEmailInput(user.email);
      if (user.stayUpdated) {
        setIsRegistered(true);
      }
    }
  }, [user]);

  // Check Stay Updated registration status from API
  useEffect(() => {
    const checkStatus = async () => {
      const emailToCheck = user?.email || (emailInput.trim().includes('@') ? emailInput.trim() : null);
      if (!emailToCheck && !user) return;

      try {
        setCheckingStatus(true);
        const url = emailToCheck ? `/api/stay-updated/status?email=${encodeURIComponent(emailToCheck)}` : '/api/stay-updated/status';
        const res = await api.get(url);
        if (res.data?.success && res.data.isRegistered) {
          setIsRegistered(true);
        }
      } catch (err) {
        // Silent catch for guest status check
      } finally {
        setCheckingStatus(false);
      }
    };

    if (user?.email) {
      checkStatus();
    }
  }, [user]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    const targetEmail = (emailInput || user?.email || '').trim();

    if (!targetEmail) {
      message.warning('Please enter an email address to stay updated.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/api/stay-updated/subscribe', { email: targetEmail });
      if (res.data?.success) {
        setIsRegistered(true);
        if (res.data.alreadyRegistered) {
          message.info(res.data.message || "You are already registered in the Stay Tuned program!");
        } else {
          message.success(res.data.message || "Successfully registered for Stay Updated!");
        }
      }
    } catch (error) {
      console.error('Failed to subscribe:', error);
      message.error(error?.response?.data?.message || 'Failed to register for Stay Updated');
    } finally {
      setSubmitting(false);
    }
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
            Connecting world-class insolvency, restructuring, and legal professionals with premier advisory firms and corporate debtors.
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
            <li><Link to="/candidate">Browse CIRP Roles</Link></li>
            <li><Link to="/candidate/jobs">Insolvency Mandates</Link></li>
            <li><Link to="/candidate/profile">Profile Completeness</Link></li>
            <li><Link to="/candidate/resume">Upload Resume</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="portal-footer-title">For Employers</h4>
          <ul className="portal-footer-links">
            <li><Link to="/employer">Post a Mandate</Link></li>
            <li><Link to="/employer">Manage Applicants</Link></li>
            <li><Link to="/employer/organisation">Entity Profile</Link></li>
            <li><Link to="/employer">Special Invites</Link></li>
          </ul>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <h4 className="portal-footer-title" style={{ margin: 0 }}>Stay Updated</h4>
            {isRegistered && (
              <Tag color="success" style={{ borderRadius: '10px', fontSize: '11px', margin: 0 }}>
                ✓ Registered
              </Tag>
            )}
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px', marginBottom: '14px' }}>
            {isRegistered
              ? "You're registered in our Stay Tuned program for curated insolvency mandates and regulatory alerts."
              : "Get weekly curated IBC mandates and restructuring opportunities sent to your inbox."}
          </p>

          {isRegistered ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '10px',
              color: '#34d399',
              fontSize: '13px'
            }}>
              <CheckCircleFilled style={{ fontSize: '16px' }} />
              <div>
                <strong style={{ color: '#e2e8f0', display: 'block' }}>Already Registered</strong>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{emailInput || user?.email || 'Your account is active in Stay Tuned'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '8px' }}>
              <Input 
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.05)', 
                  border: '1px solid rgba(255, 255, 255, 0.12)', 
                  color: 'white', 
                  borderRadius: '10px' 
                }} 
              />
              <button 
                className="portal-btn-primary" 
                type="submit" 
                disabled={submitting}
                style={{ padding: '8px 14px', cursor: submitting ? 'not-allowed' : 'pointer' }}
              >
                {submitting ? <SyncOutlined spin /> : <SendOutlined />}
              </button>
            </form>
          )}
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

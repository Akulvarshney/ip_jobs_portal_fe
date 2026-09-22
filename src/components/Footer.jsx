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
            <span>Res<span className="portal-logo-highlight">olve</span></span>
          </Link>
          <p>
            Connecting world-class insolvency, restructuring, and legal professionals with premier advisory firms and corporate debtors.
          </p>
          <div className="portal-footer-socials">
            <a href="#" className="portal-footer-social-link"><GithubOutlined /></a>
            <a href="#" className="portal-footer-social-link"><TwitterOutlined /></a>
            <a href="#" className="portal-footer-social-link"><LinkedinOutlined /></a>
          </div>
        </div>

        <div>
          <div className="portal-footer-newsletter-header">
            <h4 className="portal-footer-title portal-footer-newsletter-title">Stay Updated</h4>
            {isRegistered && (
              <Tag color="success" className="portal-footer-registered-tag">
                ✓ Registered
              </Tag>
            )}
          </div>
          <p className="portal-footer-newsletter-desc">
            {isRegistered
              ? "You're registered in our Stay Tuned program for curated insolvency mandates and regulatory alerts."
              : "Get weekly curated IBC mandates and restructuring opportunities sent to your inbox."}
          </p>

          {isRegistered ? (
            <div className="portal-footer-enrolled-banner">
              <CheckCircleFilled className="portal-footer-enrolled-icon" />
              <div>
                <strong className="portal-footer-enrolled-title">Already Registered</strong>
                <span className="portal-footer-enrolled-sub">{emailInput || user?.email || 'Your account is active in Stay Tuned'}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="portal-footer-form">
              <Input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email"
                className="portal-footer-input"
              />
              <button
                className="portal-btn-primary portal-footer-submit-btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? <SyncOutlined spin /> : <SendOutlined />}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="portal-footer-bottom">
        <div>© {new Date().getFullYear()} Resolve Portal. All rights reserved. • Support: <a href={`mailto:${supportEmail}`} className="portal-footer-link-highlight">{supportEmail}</a></div>
        <div className="portal-footer-legal-links">
          <Link to="/privacy" className="portal-footer-legal-link">Privacy Policy</Link>
          <Link to="/terms" className="portal-footer-legal-link">Terms of Service</Link>
          <Link to="/security" className="portal-footer-legal-link">Security</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Modal,
  Radio,
  Switch,
  Button,
  message,
  Divider,
  Row,
  Col,
  Popconfirm,
  Tag,
  Spin
} from 'antd';
import {
  SettingOutlined,
  LockOutlined,
  EyeOutlined,
  BellOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  BgColorsOutlined,
  SunOutlined,
  MoonOutlined,
  CheckCircleFilled,
  FileProtectOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout, saveTheme, selectTheme } from '../../store/authSlice';
import { fetchCandidateSettings, updateCandidateSettings } from '../../store/candidateSlice';
import api from '../../api';
import './SettingsResources.css';

const CandidateSettings = () => {
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [savingNotificationKey, setSavingNotificationKey] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordOtpRequested, setPasswordOtpRequested] = useState(false);
  const [sendingPasswordOtp, setSendingPasswordOtp] = useState(false);
  const [passwordOtpCountdown, setPasswordOtpCountdown] = useState(0);
  const [devPasswordOtp, setDevPasswordOtp] = useState('');

  const [visibility, setVisibility] = useState('PUBLIC');
  const [jobAlerts, setJobAlerts] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [stayUpdated, setStayUpdated] = useState(false);
  const [checkingStayUpdated, setCheckingStayUpdated] = useState(true);

  const [passwordForm] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, themeSaving } = useSelector((state) => state.auth);
  const currentTheme = useSelector(selectTheme);
  const { settings, loading } = useSelector((state) => state.candidate);
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@resolveportal.com';

  useEffect(() => {
    if (user?.role === 'CANDIDATE') {
      dispatch(fetchCandidateSettings());
    }
  }, [dispatch, user?.role]);

  useEffect(() => {
    if (settings && user?.role === 'CANDIDATE') {
      if (settings.visibility) {
        setVisibility(settings.visibility);
      }
      if (settings.jobAlerts !== undefined) setJobAlerts(settings.jobAlerts);
      if (settings.applicationUpdates !== undefined) setApplicationUpdates(settings.applicationUpdates);
      if (settings.interviewReminders !== undefined) setInterviewReminders(settings.interviewReminders);
      if (settings.stayUpdated !== undefined) setStayUpdated(settings.stayUpdated);

      if (settings.notifications) {
        if (settings.notifications.jobAlerts !== undefined) setJobAlerts(settings.notifications.jobAlerts);
        if (settings.notifications.applicationUpdates !== undefined) setApplicationUpdates(settings.notifications.applicationUpdates);
        if (settings.notifications.interviewReminders !== undefined) setInterviewReminders(settings.notifications.interviewReminders);
        if (settings.notifications.stayUpdated !== undefined) setStayUpdated(settings.notifications.stayUpdated);
      }
    }
  }, [settings, user?.role]);

  useEffect(() => {
    if (!user?.role || user.role === 'CANDIDATE') return;
    let active = true;
    api.get('/api/stay-updated/status')
      .then((response) => { if (active) setStayUpdated(Boolean(response.data?.isRegistered)); })
      .catch(() => { if (active) message.error('Could not check your Stay Updated subscription.'); })
      .finally(() => { if (active) setCheckingStayUpdated(false); });
    return () => { active = false; };
  }, [user?.email, user?.role]);

  useEffect(() => {
    if (passwordOtpCountdown <= 0) return;
    const timer = setTimeout(() => setPasswordOtpCountdown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [passwordOtpCountdown]);

  const handleVisibilityChange = async (newVisibility) => {
    if (newVisibility === visibility || savingVisibility) return;
    const prevVisibility = visibility;
    setVisibility(newVisibility);
    setSavingVisibility(true);
    try {
      await dispatch(updateCandidateSettings({ visibility: newVisibility })).unwrap();
      const labels = {
        PUBLIC: 'Public (Recommended)',
        CONFIDENTIAL: 'Confidential Mode',
        PRIVATE: 'Private'
      };
      message.success(`Profile visibility updated to ${labels[newVisibility] || newVisibility}`);
    } catch (error) {
      setVisibility(prevVisibility);
      message.error(typeof error === 'string' ? error : 'Failed to update profile visibility');
    } finally {
      setSavingVisibility(false);
    }
  };

  const handleToggleNotification = async (key, newValue) => {
    if (savingNotificationKey) return;

    // Optimistic local update
    if (key === 'jobAlerts') setJobAlerts(newValue);
    if (key === 'applicationUpdates') setApplicationUpdates(newValue);
    if (key === 'interviewReminders') setInterviewReminders(newValue);
    if (key === 'stayUpdated') setStayUpdated(newValue);

    setSavingNotificationKey(key);

    const labels = {
      jobAlerts: 'New Job Alerts',
      applicationUpdates: 'Application Status Updates',
      interviewReminders: 'Interview Schedule Reminders',
      stayUpdated: 'Stay Updated & Insolvency Insights'
    };

    try {
      if (key === 'stayUpdated' && user?.role !== 'CANDIDATE') {
        await api.post(`/api/stay-updated/${newValue ? 'subscribe' : 'unsubscribe'}`, { email: user?.email });
      } else {
        await dispatch(updateCandidateSettings({ [key]: newValue })).unwrap();
      }
      message.success(`${labels[key] || 'Notification preference'} ${newValue ? 'enabled' : 'disabled'}`);
    } catch (error) {
      // Revert upon failure
      if (key === 'jobAlerts') setJobAlerts(!newValue);
      if (key === 'applicationUpdates') setApplicationUpdates(!newValue);
      if (key === 'interviewReminders') setInterviewReminders(!newValue);
      if (key === 'stayUpdated') setStayUpdated(!newValue);

      message.error(typeof error === 'string' ? error : 'Failed to update notification preference');
    } finally {
      setSavingNotificationKey(null);
    }
  };

  const handleThemeChange = async (newTheme) => {
    if (newTheme === currentTheme) return;
    if (!isAuthenticated) return;
    try {
      await dispatch(saveTheme(newTheme)).unwrap();
      message.success(`Appearance updated to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    } catch (error) {
      if (error?.name !== 'ConditionError') {
        message.error(typeof error === 'string' ? error : 'Failed to save theme preference');
      }
    }
  };

  const getPortalTitle = () => {
    if (user?.role === 'EMPLOYER') return 'Employer Settings';
    if (user?.role === 'ADMIN') return 'Admin Console Settings';
    return 'Candidate Settings';
  };

  const getPortalSubtitle = () => {
    if (user?.role === 'EMPLOYER') {
      return 'Manage corporate recruiter credentials, appearance theme, and account security.';
    }
    if (user?.role === 'ADMIN') {
      return 'Manage platform administrator credentials, appearance theme, and security settings.';
    }
    return 'Manage profile privacy, recruiter discovery modes, notification alerts, appearance theme, and account security.';
  };

  const handleSendPasswordOtp = async () => {
    setSendingPasswordOtp(true);
    try {
      const response = await api.post('/api/auth/password/otp');
      setPasswordOtpRequested(true);
      setPasswordOtpCountdown(60);
      setDevPasswordOtp(response.data?.otp || '');
      passwordForm.setFieldsValue({ otp: '' });
      message.success('Verification code sent to your account email.');
    } catch (error) {
      message.error(error?.response?.data?.error || 'Could not send the verification code.');
    } finally {
      setSendingPasswordOtp(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setSavingPassword(true);
      const res = await api.put('/api/auth/password', {
        otp: values.otp.trim(),
        newPassword: values.newPassword
      });
      if (res.data?.success) {
        message.success('Password updated successfully!');
        passwordForm.resetFields();
        setPasswordModalOpen(false);
        setPasswordOtpRequested(false);
        setPasswordOtpCountdown(0);
        setDevPasswordOtp('');
      }
    } catch (error) {
      message.error(error?.response?.data?.error || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-glass-card portal-settings-card"
      >
        <div className="portal-settings-header">
          <h1 className="portal-settings-title">
            {getPortalTitle()}
          </h1>
          <p className="portal-settings-subtitle">
            {getPortalSubtitle()}
          </p>
        </div>

        {/* Account Overview */}
        <div className="portal-settings-account-card">
          <div>
            <div className="portal-settings-account-badge">
              Active Account
            </div>
            <div className="portal-settings-account-name">
              {user?.name || 'Professional'}
            </div>
            <div className="portal-settings-account-email">
              {user?.email}
            </div>
          </div>
          {(!user?.role || user?.role === 'CANDIDATE') && (
            <Button 
              type="primary" 
              onClick={() => navigate('/candidate/profile')} 
              className="portal-btn-cyan"
            >
              Manage My Profile
            </Button>
          )}
        </div>

        {/* Appearance & Interface Theme */}
        <div className="portal-settings-section">
          <div className="portal-settings-section-header">
            <h3 className="portal-settings-section-title">
              <BgColorsOutlined className="portal-settings-icon" /> Appearance & Interface Theme
            </h3>
            <p className="portal-settings-section-desc">
              Customize the look and feel of your portal. Preference is synced directly to your account.
            </p>
          </div>

          <Row gutter={[16, 16]}>
            {/* Dark Theme Card */}
            <Col xs={24} sm={12}>
              <div
                onClick={() => handleThemeChange('dark')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleThemeChange('dark')}
                className={`portal-theme-card dark-theme ${currentTheme === 'dark' ? 'active' : ''}`}
              >
                {/* Dark Mockup Preview */}
                <div className="portal-theme-mockup dark-mockup">
                  <div className="portal-theme-mockup-bar">
                    <div className="portal-theme-mockup-left">
                      <div className="portal-theme-mockup-dot dark-accent" />
                      <div className="portal-theme-mockup-pill dark-pill" />
                    </div>
                    <div className="portal-theme-mockup-action dark-action" />
                  </div>
                  <div className="portal-theme-mockup-content">
                    <div className="portal-theme-mockup-sidebar dark-side" />
                    <div className="portal-theme-mockup-main dark-main">
                      <div className="portal-theme-mockup-line-1 dark-line" />
                      <div className="portal-theme-mockup-line-2 dark-line" />
                    </div>
                  </div>
                </div>

                <div className="portal-theme-card-footer">
                  <div className="portal-theme-card-title-wrap">
                    <MoonOutlined className="portal-menu-icon" />
                    <span className="portal-theme-card-title">Dark Mode</span>
                  </div>
                  {currentTheme === 'dark' ? (
                    <Tag color="blue" className="portal-theme-card-tag">Active</Tag>
                  ) : (
                    <span className="portal-theme-card-select-text">Select</span>
                  )}
                </div>
                <p className="portal-theme-card-desc">
                  Near-black surfaces with soft gray accents. Designed for high contrast and intensive document review.
                </p>
              </div>
            </Col>

            {/* Light Theme Card */}
            <Col xs={24} sm={12}>
              <div
                onClick={() => handleThemeChange('light')}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleThemeChange('light')}
                className={`portal-theme-card light-theme ${currentTheme === 'light' ? 'active' : ''}`}
              >
                {/* Light Mockup Preview */}
                <div className="portal-theme-mockup light-mockup">
                  <div className="portal-theme-mockup-bar">
                    <div className="portal-theme-mockup-left">
                      <div className="portal-theme-mockup-dot light-accent" />
                      <div className="portal-theme-mockup-pill light-pill" />
                    </div>
                    <div className="portal-theme-mockup-action light-action" />
                  </div>
                  <div className="portal-theme-mockup-content">
                    <div className="portal-theme-mockup-sidebar light-side" />
                    <div className="portal-theme-mockup-main light-main">
                      <div className="portal-theme-mockup-line-1 light-line" />
                      <div className="portal-theme-mockup-line-2 light-line" />
                    </div>
                  </div>
                </div>

                <div className="portal-theme-card-footer">
                  <div className="portal-theme-card-title-wrap">
                    <SunOutlined className="portal-menu-icon" />
                    <span className="portal-theme-card-title">Light Mode</span>
                  </div>
                  {currentTheme === 'light' ? (
                    <Tag color="blue" className="portal-theme-card-tag">Active</Tag>
                  ) : (
                    <span className="portal-theme-card-select-text">Select</span>
                  )}
                </div>
                <p className="portal-theme-card-desc">
                  Clean, high-legibility corporate appearance. Crisp white cards with blue highlights for daytime productivity.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        <Divider className="portal-settings-divider" />

        {(!user?.role || user?.role === 'CANDIDATE') && (
          <>
            {/* Profile Visibility */}
            <div className="portal-settings-section">
              <div className="portal-settings-section-header-flex">
                <div>
                  <h3 className="portal-settings-section-title">
                    <EyeOutlined className="portal-settings-icon" /> Profile Discovery & Visibility
                  </h3>
                  <p className="portal-settings-section-desc">
                    Click your preferred visibility mode below. Your selection is recorded and saved automatically.
                  </p>
                </div>
                {savingVisibility && (
                  <div className="portal-settings-saving-status">
                    <Spin size="small" /> Recording change...
                  </div>
                )}
              </div>

              <div className="portal-visibility-list">
                {/* Public Option */}
                <div
                  onClick={() => handleVisibilityChange('PUBLIC')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleVisibilityChange('PUBLIC')}
                  className={`portal-visibility-card ${visibility === 'PUBLIC' ? 'active' : ''}`}
                >
                  <Radio checked={visibility === 'PUBLIC'} className="portal-visibility-radio" />
                  <div className="portal-visibility-content">
                    <div className="portal-visibility-title-row">
                      <span className="portal-visibility-title">Public</span>
                      <Tag color="green" className="portal-visibility-tag">Recommended</Tag>
                      {visibility === 'PUBLIC' && (
                        <Tag color="blue" className="portal-visibility-tag">Active</Tag>
                      )}
                    </div>
                    <div className="portal-visibility-desc">
                      Visible to all verified banks, ARCs, and insolvency practice firms. Maximizes interview invitations and direct job outreach.
                    </div>
                  </div>
                </div>

                {/* Confidential Option */}
                <div
                  onClick={() => handleVisibilityChange('CONFIDENTIAL')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleVisibilityChange('CONFIDENTIAL')}
                  className={`portal-visibility-card ${visibility === 'CONFIDENTIAL' ? 'active' : ''}`}
                >
                  <Radio checked={visibility === 'CONFIDENTIAL'} className="portal-visibility-radio" />
                  <div className="portal-visibility-content">
                    <div className="portal-visibility-title-row">
                      <span className="portal-visibility-title">Confidential Mode</span>
                      {visibility === 'CONFIDENTIAL' && (
                        <Tag color="blue" className="portal-visibility-tag">Active</Tag>
                      )}
                    </div>
                    <div className="portal-visibility-desc">
                      Recruiters see your qualifications, credentials, and experience, but your personal identity and current employer stay masked until you apply.
                    </div>
                  </div>
                </div>

                {/* Private Option */}
                <div
                  onClick={() => handleVisibilityChange('PRIVATE')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleVisibilityChange('PRIVATE')}
                  className={`portal-visibility-card ${visibility === 'PRIVATE' ? 'active' : ''}`}
                >
                  <Radio checked={visibility === 'PRIVATE'} className="portal-visibility-radio" />
                  <div className="portal-visibility-content">
                    <div className="portal-visibility-title-row">
                      <span className="portal-visibility-title">Private</span>
                      {visibility === 'PRIVATE' && (
                        <Tag color="blue" className="portal-visibility-tag">Active</Tag>
                      )}
                    </div>
                    <div className="portal-visibility-desc">
                      Hidden from talent searches. Your profile and resumes are only accessible to jobs you explicitly submit an application for.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Divider className="portal-settings-divider" />

            {/* Notification Preferences */}
            <div className="portal-settings-section">
              <div className="portal-settings-section-header-flex">
                <div>
                  <h3 className="portal-settings-section-title">
                    <BellOutlined className="portal-settings-icon" /> Notification Preferences
                  </h3>
                  <p className="portal-settings-section-desc">
                    Customize alerts for job postings and application status. Changes are recorded automatically.
                  </p>
                </div>
                {savingNotificationKey && (
                  <div className="portal-settings-saving-status">
                    <Spin size="small" /> Recording change...
                  </div>
                )}
              </div>

              <div className="portal-notification-list">
                <div className="portal-notification-row">
                  <div>
                    <div className="portal-notification-title">New Job Alerts</div>
                    <div className="portal-notification-desc">Receive emails when new jobs matching your professional category are posted.</div>
                  </div>
                  <Switch
                    checked={jobAlerts}
                    loading={savingNotificationKey === 'jobAlerts'}
                    onChange={(checked) => handleToggleNotification('jobAlerts', checked)}
                  />
                </div>

                <div className="portal-notification-row">
                  <div>
                    <div className="portal-notification-title">Application Status Updates</div>
                    <div className="portal-notification-desc">Get notified when a recruiter shortlists, selects, or reviews your application.</div>
                  </div>
                  <Switch
                    checked={applicationUpdates}
                    loading={savingNotificationKey === 'applicationUpdates'}
                    onChange={(checked) => handleToggleNotification('applicationUpdates', checked)}
                  />
                </div>

                <div className="portal-notification-row">
                  <div>
                    <div className="portal-notification-title">Interview Schedule Reminders</div>
                    <div className="portal-notification-desc">Receive calendar notifications and reminders 1 hour before scheduled video calls.</div>
                  </div>
                  <Switch
                    checked={interviewReminders}
                    loading={savingNotificationKey === 'interviewReminders'}
                    onChange={(checked) => handleToggleNotification('interviewReminders', checked)}
                  />
                </div>

              </div>
            </div>

            <Divider className="portal-settings-divider" />
          </>
        )}

        {/* Stay Updated is available to every signed-in account. */}
        <div className="portal-settings-section">
          <div className="portal-settings-section-header">
            <h3 className="portal-settings-section-title">
              <BellOutlined className="portal-settings-icon" /> Stay Updated
            </h3>
            <p className="portal-settings-section-desc">
              Get curated insolvency jobs and restructuring updates at your account email.
            </p>
          </div>
          <div className="portal-settings-stay-updated">
            <div>
              <div className="portal-notification-title portal-notification-title-with-tag">
                Weekly updates
                {stayUpdated && <Tag color="success" className="portal-notification-enrolled-tag">Enrolled</Tag>}
              </div>
              <div className="portal-notification-desc">{user?.email || 'Your account email'}</div>
            </div>
            <Switch
              aria-label="Stay Updated subscription"
              checked={stayUpdated}
              loading={savingNotificationKey === 'stayUpdated' || (user?.role !== 'CANDIDATE' && checkingStayUpdated)}
              disabled={user?.role !== 'CANDIDATE' && checkingStayUpdated}
              onChange={(checked) => handleToggleNotification('stayUpdated', checked)}
            />
          </div>
        </div>

        <Divider className="portal-settings-divider" />

        {/* Change Password */}
        <div className="portal-settings-section">
          <h3 className="portal-settings-section-title">
            <LockOutlined className="portal-settings-icon" /> Account Security & Password
          </h3>
          <p className="portal-settings-section-desc">
            Verify your account email with a one-time code before choosing a new password.
          </p>
          <div className="portal-settings-password-action">
            <div>
              <div className="portal-notification-title">Password</div>
              <div className="portal-notification-desc">A code will be sent to {user?.email || 'your account email'}.</div>
            </div>
            <Button type="primary" icon={<LockOutlined />} onClick={() => setPasswordModalOpen(true)} className="portal-btn-theme-primary">
              Change Password
            </Button>
          </div>
        </div>

        <Divider className="portal-settings-divider" />

        {/* Platform information formerly shown in the signed-in footer. */}
        <div className="portal-settings-section">
          <h3 className="portal-settings-section-title">
            <SafetyCertificateOutlined className="portal-settings-icon" /> About & Support
          </h3>
          <p className="portal-settings-section-desc portal-settings-about-copy">
            Connecting insolvency, restructuring, and legal professionals with advisory firms and corporate debtors.
          </p>
          <div className="portal-settings-resource-links">
            <Link to="/privacy"><FileProtectOutlined /> Privacy Policy</Link>
            <Link to="/terms"><FileTextOutlined /> Terms of Service</Link>
            <Link to="/security"><SafetyCertificateOutlined /> Security</Link>
          </div>
          <div className="portal-settings-support-meta">
            <span>Support: <a href={`mailto:${supportEmail}`}>{supportEmail}</a></span>
            <span>© {new Date().getFullYear()} Resolve Portal. All rights reserved.</span>
          </div>
        </div>

        <Divider className="portal-settings-divider" />

        {/* Sign Out */}
        <div className="portal-session-row">
          <div>
            <div className="portal-session-title">Session Management</div>
            <div className="portal-session-desc">Sign out of your account on this device.</div>
          </div>
          <Popconfirm
            title="Sign out of your account?"
            onConfirm={handleLogout}
            okText="Sign Out"
            cancelText="Cancel"
          >
            <Button danger icon={<LogoutOutlined />} className="portal-session-btn">
              Log Out
            </Button>
          </Popconfirm>
        </div>

      </motion.div>
      <Modal
        title={<span><LockOutlined /> Change Password</span>}
        open={passwordModalOpen}
        onCancel={() => {
          if (sendingPasswordOtp || savingPassword) return;
          passwordForm.resetFields();
          setPasswordModalOpen(false);
        }}
        footer={null}
        destroyOnHidden
        maskClosable={!sendingPasswordOtp && !savingPassword}
        className="portal-password-modal"
      >
        <p className="portal-password-modal-intro">
          {passwordOtpRequested
            ? <>Enter the six-digit code sent to <strong>{user?.email}</strong>. It expires in 10 minutes.</>
            : <>Send a one-time verification code to <strong>{user?.email || 'your account email'}</strong> to update your password.</>}
        </p>
        {!passwordOtpRequested ? (
          <Button type="primary" block loading={sendingPasswordOtp} onClick={handleSendPasswordOtp}>
            Send Verification Code
          </Button>
        ) : (
          <>
            {devPasswordOtp && <p className="portal-password-dev-code">Development code: <strong>{devPasswordOtp}</strong></p>}
            <Form form={passwordForm} layout="vertical" onFinish={handlePasswordChange}>
              <Form.Item
                label="Verification code"
                name="otp"
                rules={[
                  { required: true, message: 'Enter the verification code.' },
                  { pattern: /^\d{6}$/, message: 'Enter the six-digit code.' }
                ]}
              >
                <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="6-digit code" />
              </Form.Item>
              <Form.Item
                label="New password"
                name="newPassword"
                rules={[
                  { required: true, message: 'Enter a new password.' },
                  { min: 8, max: 128, message: 'Use 8 to 128 characters.' }
                ]}
              >
                <Input.Password autoComplete="new-password" placeholder="New password" />
              </Form.Item>
              <Form.Item
                label="Confirm new password"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Confirm your new password.' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      return !value || getFieldValue('newPassword') === value
                        ? Promise.resolve()
                        : Promise.reject(new Error('Passwords do not match.'));
                    }
                  })
                ]}
              >
                <Input.Password autoComplete="new-password" placeholder="Confirm new password" />
              </Form.Item>
              <div className="portal-password-modal-actions">
                <Button type="link" disabled={passwordOtpCountdown > 0 || sendingPasswordOtp} loading={sendingPasswordOtp} onClick={handleSendPasswordOtp}>
                  {passwordOtpCountdown > 0 ? `Resend code in ${passwordOtpCountdown}s` : 'Resend code'}
                </Button>
                <Button type="primary" htmlType="submit" loading={savingPassword}>Update Password</Button>
              </div>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CandidateSettings;

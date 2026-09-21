import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Radio, 
  Switch, 
  Button, 
  message, 
  Divider, 
  Row, 
  Col, 
  Popconfirm,
  Tag
} from 'antd';
import { 
  SettingOutlined, 
  LockOutlined, 
  EyeOutlined, 
  BellOutlined, 
  LogoutOutlined, 
  CheckCircleOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/authSlice';
import { fetchCandidateSettings, updateCandidateSettings } from '../../store/candidateSlice';
import api from '../../api';

const CandidateSettings = () => {
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [visibility, setVisibility] = useState('PUBLIC');
  const [jobAlerts, setJobAlerts] = useState(true);
  const [applicationUpdates, setApplicationUpdates] = useState(true);
  const [interviewReminders, setInterviewReminders] = useState(true);
  const [stayUpdated, setStayUpdated] = useState(false);

  const [passwordForm] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { settings, loading } = useSelector((state) => state.candidate);

  useEffect(() => {
    dispatch(fetchCandidateSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
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
  }, [settings]);

  const handleSaveVisibilityAndNotifications = async () => {
    try {
      setSavingSettings(true);
      await dispatch(updateCandidateSettings({ 
        visibility,
        jobAlerts,
        applicationUpdates,
        interviewReminders,
        stayUpdated
      })).unwrap();
      message.success('Preferences updated and saved successfully');
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to update preferences');
    } finally {
      setSavingSettings(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setSavingPassword(true);
      const res = await api.put('/api/candidate/settings', {
        currentPassword: values.currentPassword,
        password: values.newPassword
      });
      if (res.data?.success) {
        message.success('Password updated successfully!');
        passwordForm.resetFields();
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to change password');
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
        className="portal-glass-card"
        style={{ padding: '36px' }}
      >
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-heading)', margin: 0 }}>Candidate Settings</h1>
            <p style={{ color: 'var(--theme-muted)', fontSize: '14px', margin: '4px 0 0' }}>
              Manage profile privacy, recruiter discovery modes, notification alerts, and account security.
            </p>
          </div>

          {/* Account Overview */}
          <div style={{
            background: 'rgba(var(--theme-contrast-rgb), 0.03)',
            border: '1px solid rgba(var(--theme-contrast-rgb), 0.08)',
            borderRadius: '14px',
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <div style={{ color: 'var(--theme-link)', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase' }}>
                Active Account
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--theme-heading)', marginTop: '2px' }}>
                {user?.name || 'Professional'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--theme-subtle)' }}>
                {user?.email}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag color="cyan" style={{ borderRadius: '8px', padding: '4px 12px', fontSize: '12px' }}>
                Role: {user?.role || 'CANDIDATE'}
              </Tag>
              {user?.authProvider === 'GOOGLE' ? (
                <Tag color="blue" style={{ borderRadius: '8px', padding: '4px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600 }}>Google Sign-In</span>
                </Tag>
              ) : (
                <Tag color="purple" style={{ borderRadius: '8px', padding: '4px 12px', fontSize: '12px' }}>
                  Email & Password
                </Tag>
              )}
            </div>
          </div>

          {/* Profile Visibility */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <EyeOutlined style={{ color: 'var(--theme-link)' }} /> Profile Discovery & Visibility
            </h3>
            <p style={{ color: 'var(--theme-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Choose how employers and insolvency recruiters discover your profile during database searches.
            </p>

            <Radio.Group
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <Radio value="PUBLIC" style={{ color: 'var(--theme-heading)' }}>
                <div>
                  <strong style={{ color: 'var(--theme-heading)' }}>Public (Recommended)</strong>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px' }}>
                    Visible to all verified banks, ARCs, and IP firms. Increases interview invitations.
                  </div>
                </div>
              </Radio>

              <Radio value="CONFIDENTIAL" style={{ color: 'var(--theme-heading)' }}>
                <div>
                  <strong style={{ color: 'var(--theme-heading)' }}>Confidential Mode</strong>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px' }}>
                    Recruiters see your qualifications, skills, and experience, but your name and current employer remain masked until you apply.
                  </div>
                </div>
              </Radio>

              <Radio value="PRIVATE" style={{ color: 'var(--theme-heading)' }}>
                <div>
                  <strong style={{ color: 'var(--theme-heading)' }}>Private</strong>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px' }}>
                    Hidden from candidate search databases. Your profile is only visible to jobs you explicitly apply for.
                  </div>
                </div>
              </Radio>
            </Radio.Group>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)' }} />

          {/* Notification Preferences */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BellOutlined style={{ color: 'var(--theme-link)' }} /> Notification Preferences
            </h3>
            <p style={{ color: 'var(--theme-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Customize alerts for new mandate postings and application status transitions.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--theme-heading)', fontWeight: 500, fontSize: '14px' }}>New Mandate Alerts</div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px' }}>Receive emails when new jobs matching your professional category are posted.</div>
                </div>
                <Switch checked={jobAlerts} onChange={setJobAlerts} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--theme-heading)', fontWeight: 500, fontSize: '14px' }}>Application Status Updates</div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px' }}>Get notified when a recruiter shortlists, selects, or reviews your application.</div>
                </div>
                <Switch checked={applicationUpdates} onChange={setApplicationUpdates} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--theme-heading)', fontWeight: 500, fontSize: '14px' }}>Interview Schedule Reminders</div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px' }}>Receive calendar notifications and reminders 1 hour before scheduled video calls.</div>
                </div>
                <Switch checked={interviewReminders} onChange={setInterviewReminders} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: 'var(--theme-heading)', fontWeight: 500, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Stay Updated & Insolvency Insights
                    {stayUpdated && <Tag color="success" style={{ borderRadius: '10px', fontSize: '11px' }}>Enrolled</Tag>}
                  </div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px' }}>Receive curated weekly IBC restructuring alerts, NCLT jurisprudence digests, and executive job digests.</div>
                </div>
                <Switch checked={stayUpdated} onChange={setStayUpdated} />
              </div>
            </div>

            <Button
              type="primary"
              loading={savingSettings}
              onClick={handleSaveVisibilityAndNotifications}
              style={{ background: '#0ea5e9', borderRadius: '8px', marginTop: '20px' }}
            >
              Save Preferences
            </Button>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)' }} />

          {/* Change Password */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LockOutlined style={{ color: 'var(--theme-link)' }} /> Account Security & Password
            </h3>
            <p style={{ color: 'var(--theme-muted)', fontSize: '13px', marginBottom: '16px' }}>
              Update your login password regularly to protect your profile data.
            </p>

            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
              style={{ maxWidth: '500px' }}
            >
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Current Password</span>}
                name="currentPassword"
                rules={[{ required: true, message: 'Please enter current password' }]}
              >
                <Input.Password placeholder="••••••••" style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)' }} />
              </Form.Item>

              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>New Password</span>}
                name="newPassword"
                rules={[
                  { required: true, message: 'Please enter new password' },
                  { min: 6, message: 'Password must be at least 6 characters' }
                ]}
              >
                <Input.Password placeholder="••••••••" style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)' }} />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={savingPassword}
                style={{ background: '#0ea5e9', borderRadius: '8px' }}
              >
                Update Password
              </Button>
            </Form>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)' }} />

          {/* Sign Out */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: 'var(--theme-heading)', fontWeight: 600, fontSize: '15px' }}>Session Management</div>
              <div style={{ color: 'var(--theme-muted)', fontSize: '13px' }}>Sign out of your candidate portal on this device.</div>
            </div>
            <Popconfirm
              title="Sign out of your account?"
              onConfirm={handleLogout}
              okText="Sign Out"
              cancelText="Cancel"
            >
              <Button danger icon={<LogoutOutlined />} style={{ borderRadius: '8px' }}>
                Log Out
              </Button>
            </Popconfirm>
          </div>

        </motion.div>
    </div>
  );
};

export default CandidateSettings;

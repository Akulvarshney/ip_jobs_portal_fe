import React, { useState } from 'react';
import { Button, message } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, logout } from '../../store/authSlice';

export default function EmployerPending({ suspended = false }) {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const [checking, setChecking] = useState(false);
  const check = async () => {
    setChecking(true);
    try {
      const latest = await dispatch(fetchCurrentUser()).unwrap();
      if (latest.onboarding?.stage !== 'READY') message.info(latest.onboarding?.stage === 'SUSPENDED' ? 'Organisation access is still paused.' : 'Your organisation is still awaiting approval.');
    } catch { message.error('Could not check your approval status.'); }
    finally { setChecking(false); }
  };
  return <div className="portal-page-wrapper" style={{ minHeight: '75vh', display: 'grid', placeItems: 'center', padding: 24 }}>
    <div className="portal-glass-card portal-p-32" style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
      {suspended ? <ClockCircleOutlined style={{ fontSize: 42, color: '#f59e0b' }} /> : <CheckCircleOutlined style={{ fontSize: 42, color: '#0ea5e9' }} />}
      <h1 className="portal-text-heading" style={{ marginTop: 20 }}>{suspended ? 'Organisation access is paused' : 'You are in line for approval'}</h1>
      <p className="portal-text-muted-sm">{suspended ? 'Please contact the platform team about your organisation.' : `${user?.onboarding?.organisation || 'Your organisation'} has been submitted. Please wait until the platform admin approves it. We will email the organisation admin when it is confirmed.`}</p>
      <div className="portal-flex-center-gap-10" style={{ justifyContent: 'center', marginTop: 24 }}>
        <Button type="primary" onClick={check} loading={checking}>Check status</Button>
        <Button onClick={() => dispatch(logout())}>Sign out</Button>
      </div>
    </div>
  </div>;
}

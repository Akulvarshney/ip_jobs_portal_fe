import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Spin, message } from 'antd';
import { CheckCircleFilled, LockOutlined } from '@ant-design/icons';
import { motion, useReducedMotion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { loginSuccess } from '../../store/authSlice';

export default function InviteAcceptance() {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const reduceMotion = useReducedMotion();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    api.get(`/api/employer/invitations/${token}`)
      .then(({ data }) => { if (active) setInvite(data.data); })
      .catch(err => { if (active) setError(err.response?.data?.error || 'Invitation could not be loaded.'); });
    return () => { active = false; };
  }, [token]);

  const finish = async ({ password }) => {
    setAccepting(true);
    setError('');
    try {
      const { data } = await api.post(`/api/employer/invitations/${token}/accept`, { password });
      dispatch(loginSuccess({ token: data.token, user: data.user }));
      message.success(`Welcome to ${invite.organisation}!`);
      navigate('/employer/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Could not complete your invitation.');
    } finally {
      setAccepting(false);
    }
  };

  return <div className="portal-page-wrapper" style={{ minHeight: '76vh', display: 'grid', placeItems: 'center', padding: 24 }}>
    <div className="portal-glass-card portal-p-32" style={{ width: '100%', maxWidth: 560, textAlign: 'center', overflow: 'hidden' }}>
      {!invite && !error && <Spin tip="Checking invitation"><div style={{ minHeight: 80 }} /></Spin>}
      {invite && <>
        <motion.div initial={reduceMotion ? false : { scale: 0.5, opacity: 0, rotate: -24 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 170, damping: 13 }}>
          <CheckCircleFilled style={{ fontSize: 72, color: '#16a34a', marginBottom: 16 }} aria-hidden="true" />
        </motion.div>
        <motion.div initial={reduceMotion ? false : { y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.18 }}>
          <h1 className="portal-text-heading">Welcome to {invite.organisation}!</h1>
          <p className="portal-text-muted-sm">Congratulations, {invite.name}. Your invitation is ready.</p>
          <p className="portal-text-muted-sm">{invite.designation || 'Recruiter'}{invite.branch ? ` · ${invite.branch}` : ''} · {invite.email}</p>
        </motion.div>
        <Form layout="vertical" onFinish={finish} style={{ textAlign: 'left', marginTop: 28 }} requiredMark={false}>
          <Form.Item label="Set your password" name="password" rules={[{ required: true, message: 'Enter a password' }, { min: 8, message: 'Use at least 8 characters' }, { max: 128, message: 'Use at most 128 characters' }]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" size="large" />
          </Form.Item>
          <Form.Item label="Confirm password" name="confirm" dependencies={['password']} rules={[{ required: true, message: 'Confirm your password' }, ({ getFieldValue }) => ({ validator(_, value) { return value === getFieldValue('password') ? Promise.resolve() : Promise.reject(new Error('Passwords do not match')); } })]}>
            <Input.Password prefix={<LockOutlined />} autoComplete="new-password" size="large" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block loading={accepting}>Join {invite.organisation}</Button>
        </Form>
        <p className="portal-text-muted-sm" style={{ marginTop: 18 }}>Your name and work details were provided by your organisation admin.</p>
      </>}
      {error && <Alert type="error" showIcon message={error} style={{ marginTop: 16, textAlign: 'left' }} />}
      {!invite && error && <p style={{ marginTop: 20 }}><Link to="/employee/login">Employee sign in</Link></p>}
    </div>
  </div>;
}

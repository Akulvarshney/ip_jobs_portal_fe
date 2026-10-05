import React, { useEffect, useState } from 'react';
import { Button, Spin, message } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api';
import { fetchCurrentUser } from '../../store/authSlice';

export default function InviteAcceptance() {
  const { token } = useParams();
  const [invite, setInvite] = useState(null);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);
  const { user, isAuthenticated, sessionChecked } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(() => { api.get(`/api/employer/invitations/${token}`).then(({ data }) => setInvite(data.data)).catch(err => setError(err.response?.data?.error || 'Invitation could not be loaded.')); }, [token]);
  const accept = async () => {
    setAccepting(true);
    try { await api.post(`/api/employer/invitations/${token}/accept`); await dispatch(fetchCurrentUser()).unwrap(); message.success('Welcome to the team!'); navigate('/employer', { replace: true }); }
    catch (err) { setError(err.response?.data?.error || 'Could not accept this invitation.'); }
    finally { setAccepting(false); }
  };
  const loginUrl = `/invite/${token}/login`;
  const signupUrl = `/invite/${token}/signup`;
  return <div className="portal-page-wrapper" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}><div className="portal-glass-card portal-p-32" style={{ width: '100%', maxWidth: 540, textAlign: 'center' }}>
    <h1 className="portal-text-heading">Join your organisation</h1>
    {!invite && !error && <Spin />}
    {invite && <><p className="portal-text-muted-sm">You were invited to join <strong>{invite.organisation}</strong> as an HR employee with <strong>{invite.email}</strong>.</p>{!sessionChecked ? <Spin /> : !isAuthenticated ? <div className="portal-flex-center-gap-10" style={{ justifyContent: 'center' }}><Link to={loginUrl}><Button type="primary">Sign in</Button></Link><Link to={signupUrl}><Button>Create your HR account</Button></Link></div> : <><p className="portal-text-muted-sm">Signed in as {user?.email}</p><Button type="primary" onClick={accept} loading={accepting} disabled={user?.email?.toLowerCase() !== invite.email}>Accept invitation</Button>{user?.email?.toLowerCase() !== invite.email && <p><Link to={loginUrl}>Sign in with {invite.email}</Link></p>}</>}</>}
    {error && <p style={{ color: '#ef4444' }}>{error}</p>}
  </div></div>;
}

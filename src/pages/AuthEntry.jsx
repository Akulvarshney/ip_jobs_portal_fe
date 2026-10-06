import React from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { BankOutlined, UserOutlined } from '@ant-design/icons';

export default function AuthEntry() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '';
  const role = params.get('role');
  const signup = params.get('mode') === 'signup';
  const audience = role === 'EMPLOYEE' ? 'employee' : role === 'EMPLOYER' || role === 'ORG_ADMIN' ? 'organisation' : role === 'ADMIN' || redirect.startsWith('/admin') ? 'admin' : role === 'CANDIDATE' || redirect.startsWith('/candidate') || redirect.startsWith('/jobs') ? 'candidate' : null;
  const invite = /^\/invite\/[a-f0-9]{64}$/.test(redirect);
  if (invite) return <Navigate to={`${redirect}/${signup ? 'signup' : 'login'}`} replace />;
  if (audience) return <Navigate to={`/${audience}/${signup && audience !== 'admin' && audience !== 'employee' ? 'signup' : 'login'}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} replace />;
  const withRedirect = path => `${path}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
  return <div className="portal-page-wrapper" style={{ minHeight: '75vh', display: 'grid', placeItems: 'center', padding: 24 }}>
    <div style={{ maxWidth: 800, width: '100%' }}>
      <h1 className="portal-text-heading portal-text-center">How will you use Resolve?</h1>
      <p className="portal-text-muted-sm portal-text-center">Choose the space that matches your work.</p>
      <div className="portal-grid-2col-gap-10" style={{ marginTop: 28 }}>
        <div className="portal-glass-card portal-p-32"><UserOutlined className="portal-text-link" style={{ fontSize: 30 }} /><h2 className="portal-text-heading">Candidate</h2><p className="portal-text-muted-sm">Search opportunities and manage applications.</p><Link to={withRedirect('/candidate/login')} className="portal-btn-primary portal-btn-auth-full" style={{ display: 'block', textAlign: 'center' }}>Candidate sign in</Link><p className="portal-text-muted-sm">New here? <Link to={withRedirect('/candidate/signup')}>Create a candidate account</Link></p></div>
        <div className="portal-glass-card portal-p-32"><BankOutlined className="portal-text-link" style={{ fontSize: 30 }} /><h2 className="portal-text-heading">Organisation admin</h2><p className="portal-text-muted-sm">Sign in to manage hiring. New organisations can start registration from the login page.</p><Link to={withRedirect('/organisation/login')} className="portal-btn-primary portal-btn-auth-full" style={{ display: 'block', textAlign: 'center' }}>Organisation admin login</Link></div>
      </div>
      <div className="portal-glass-card portal-p-32" style={{ marginTop: 12 }}><h2 className="portal-text-heading">Invited employee</h2><p className="portal-text-muted-sm">Accept your organisation's invitation and set a password first. Then sign in here.</p><Link to={withRedirect('/employee/login')}>Employee sign in</Link></div>
    </div>
  </div>;
}

import React from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { BankOutlined, UserOutlined } from '@ant-design/icons';

export default function AuthEntry() {
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '';
  const role = params.get('role');
  const signup = params.get('mode') === 'signup';
  const audience = role === 'EMPLOYER' || redirect.startsWith('/employer') ? 'employer' : role === 'ADMIN' || redirect.startsWith('/admin') ? 'admin' : role === 'CANDIDATE' || redirect.startsWith('/candidate') || redirect.startsWith('/jobs') ? 'candidate' : null;
  const invite = /^\/invite\/[a-f0-9]{64}$/.test(redirect);
  if (invite) return <Navigate to={`${redirect}/${signup ? 'signup' : 'login'}`} replace />;
  if (audience) return <Navigate to={`/${audience}/${signup && audience !== 'admin' ? 'signup' : 'login'}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} replace />;
  return <div className="portal-page-wrapper" style={{ minHeight: '75vh', display: 'grid', placeItems: 'center', padding: 24 }}>
    <div style={{ maxWidth: 800, width: '100%' }}>
      <h1 className="portal-text-heading portal-text-center">How will you use Resolve?</h1>
      <p className="portal-text-muted-sm portal-text-center">Choose the space that matches your work.</p>
      <div className="portal-grid-2col-gap-10" style={{ marginTop: 28 }}>
        <div className="portal-glass-card portal-p-32"><UserOutlined className="portal-text-link" style={{ fontSize: 30 }} /><h2 className="portal-text-heading">Find work</h2><p className="portal-text-muted-sm">Search opportunities and manage applications as a candidate.</p><Link to="/candidate/login" className="portal-btn-primary portal-btn-auth-full" style={{ display: 'block', textAlign: 'center' }}>Candidate sign in</Link><p className="portal-text-muted-sm">New here? <Link to="/candidate/signup">Create a candidate account</Link></p></div>
        <div className="portal-glass-card portal-p-32"><BankOutlined className="portal-text-link" style={{ fontSize: 30 }} /><h2 className="portal-text-heading">Hire talent</h2><p className="portal-text-muted-sm">Set up an organisation or sign in as an invited HR employee.</p><Link to="/employer/login" className="portal-btn-primary portal-btn-auth-full" style={{ display: 'block', textAlign: 'center' }}>Employer sign in</Link><p className="portal-text-muted-sm">Setting up a new organisation? <Link to="/employer/signup">Create an organisation account</Link></p></div>
      </div>
      <p className="portal-text-muted-sm portal-text-center" style={{ marginTop: 24 }}><Link to="/admin/login">Platform admin sign in</Link></p>
    </div>
  </div>;
}

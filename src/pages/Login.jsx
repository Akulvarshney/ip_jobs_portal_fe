import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, message, Alert, Divider, Avatar, Tag, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/authSlice';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  RocketOutlined, 
  MailOutlined, 
  LockOutlined, 
  KeyOutlined, 
  CheckCircleOutlined,
  CheckCircleFilled,
  ThunderboltOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  UserOutlined,
  BankOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Custom Google G Icon SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '10px' }}>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

const Login = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google Onboarding State for new users
  const [googleOnboardingUser, setGoogleOnboardingUser] = useState(null); // { email, name, photoUrl }
  const [googleRole, setGoogleRole] = useState('CANDIDATE'); // 'CANDIDATE' | 'EMPLOYER'

  // Register multi-step state (Self Email OTP flow)
  // Step 0: Enter Email -> Step 1: Verify OTP -> Step 2: Name, Role & Password
  const [registerStep, setRegisterStep] = useState(0);
  const [registerEmail, setRegisterEmail] = useState('');
  const [manualRole, setManualRole] = useState('CANDIDATE');
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [devOtpHint, setDevOtpHint] = useState('');

  // Forgot Password State & Form
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0: Email -> 1: OTP -> 2: New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotSending, setForgotSending] = useState(false);
  const [forgotVerifying, setForgotVerifying] = useState(false);
  const [forgotResetting, setForgotResetting] = useState(false);
  const [forgotCountdown, setForgotCountdown] = useState(0);
  const [forgotDevOtp, setForgotDevOtp] = useState('');
  const [forgotError, setForgotError] = useState('');

  const [loginForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [googleProfileForm] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') {
      setIsLogin(false);
    }
  }, [searchParams]);

  // Countdown timer for registration OTP resend
  useEffect(() => {
    let timer;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Countdown timer for forgot password OTP resend
  useEffect(() => {
    let timer;
    if (forgotCountdown > 0) {
      timer = setTimeout(() => setForgotCountdown(forgotCountdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [forgotCountdown]);

  // Handle Standard Sign In
  const onLoginFinish = async (values) => {
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/login', values);
      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
      message.success('Welcome back! Sign in successful.');
      redirectUser(res.data.user.role);
    } catch (error) {
      const msg = error.response?.data?.error || 'Authentication failed. Please check your email and password.';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Registration Step 1: Send OTP to email
  const handleSendOtp = async () => {
    if (!registerEmail || !registerEmail.includes('@')) {
      message.warning('Please enter a valid email address');
      return;
    }
    setSendingOtp(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/send-otp', { email: registerEmail });
      if (res.data?.success) {
        message.success(res.data.message);
        if (res.data.otp) {
          setDevOtpHint(res.data.otp);
        }
        setRegisterStep(1);
        setOtpCountdown(60);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to send verification code';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setSendingOtp(false);
    }
  };

  // Registration Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length < 4) {
      message.warning('Please enter the 6-digit verification code');
      return;
    }
    setVerifyingOtp(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/verify-otp', { email: registerEmail, otp: otpCode });
      if (res.data?.success) {
        message.success('Email verified! Please complete your profile and set password.');
        setRegisterStep(2);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid verification code';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Registration Step 3: Complete registration with profile, role & password
  const onCompleteRegistration = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error('Passwords do not match');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/register', {
        email: registerEmail,
        password: values.password,
        name: values.name,
        role: manualRole,
        companyName: values.companyName
      });

      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
      message.success('Account created successfully! Welcome to Resolve.');
      redirectUser(res.data.user.role);
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Live Google OAuth Login Popup Hook
  const googleLoginTrigger = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setErrorMessage('');
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const googleUser = await userInfoRes.json();

        const res = await api.post('/api/auth/google', {
          email: googleUser.email,
          name: googleUser.name || googleUser.given_name,
          photoUrl: googleUser.picture,
          googleId: googleUser.sub
        });

        if (res.data.isNewUser) {
          setGoogleOnboardingUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.given_name || googleUser.email.split('@')[0],
            photoUrl: googleUser.picture
          });
          setGoogleRole('CANDIDATE');
          googleProfileForm.setFieldsValue({
            name: googleUser.name || googleUser.given_name || googleUser.email.split('@')[0],
            companyName: ''
          });
          message.info('Google verified! Please select your profile type to finish setup.');
        } else {
          dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
          message.success(`Signed in with Google as ${res.data.user.name || googleUser.email}!`);
          redirectUser(res.data.user.role);
        }
      } catch (err) {
        console.error('Google OAuth error:', err);
        const errorMsg = err.response?.data?.error || 'Failed to authenticate with Google. Please try again.';
        setErrorMessage(errorMsg);
        message.error(errorMsg);
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (error) => {
      console.error('Google OAuth error:', error);
      message.error('Google authorization failed or was closed.');
    }
  });

  // Submit Google Onboarding (Name + Role + Company)
  const onCompleteGoogleOnboarding = async (values) => {
    if (!googleOnboardingUser) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/google', {
        email: googleOnboardingUser.email,
        name: values.name || googleOnboardingUser.name,
        photoUrl: googleOnboardingUser.photoUrl,
        role: googleRole,
        companyName: values.companyName
      });

      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
      message.success(`Welcome to Resolve, ${res.data.user.name}!`);
      redirectUser(res.data.user.role);
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to complete profile setup';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // FORGOT PASSWORD WORKFLOW HANDLERS (Nodemailer)
  // -------------------------------------------------------------
  const openForgotPasswordModal = () => {
    const currentEmail = loginForm.getFieldValue('email') || '';
    setForgotEmail(currentEmail);
    setForgotStep(0);
    setForgotOtp('');
    setForgotDevOtp('');
    setForgotError('');
    resetPasswordForm.resetFields();
    setShowForgotModal(true);
  };

  // Step 1: Send Reset OTP
  const handleSendForgotOtp = async () => {
    if (!forgotEmail || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address');
      return;
    }
    setForgotSending(true);
    setForgotError('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      if (res.data?.success) {
        message.success(res.data.message);
        if (res.data.otp) {
          setForgotDevOtp(res.data.otp);
        }
        setForgotStep(1);
        setForgotCountdown(60);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to send password reset code';
      setForgotError(msg);
    } finally {
      setForgotSending(false);
    }
  };

  // Step 2: Verify Reset OTP
  const handleVerifyForgotOtp = async () => {
    if (!forgotOtp || forgotOtp.trim().length < 4) {
      setForgotError('Please enter the 6-digit OTP code');
      return;
    }
    setForgotVerifying(true);
    setForgotError('');
    try {
      const res = await api.post('/api/auth/verify-reset-otp', { email: forgotEmail, otp: forgotOtp });
      if (res.data?.success) {
        message.success('Code verified! Please set your new password.');
        setForgotStep(2);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid or expired OTP code';
      setForgotError(msg);
    } finally {
      setForgotVerifying(false);
    }
  };

  // Step 3: Reset Password in DB
  const handleResetPassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }

    setForgotResetting(true);
    setForgotError('');
    try {
      const res = await api.post('/api/auth/reset-password', {
        email: forgotEmail,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword
      });

      if (res.data?.success) {
        message.success('Password updated successfully! Please sign in.');
        setShowForgotModal(false);
        loginForm.setFieldsValue({ email: forgotEmail, password: '' });
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to reset password';
      setForgotError(msg);
    } finally {
      setForgotResetting(false);
    }
  };

  const redirectUser = (userRole) => {
    if (userRole === 'ADMIN') {
      navigate('/admin');
    } else if (userRole === 'EMPLOYER') {
      navigate('/employer');
    } else {
      navigate('/candidate');
    }
  };

  const autofillDemo = (demoRole) => {
    setErrorMessage('');
    setIsLogin(true);
    setGoogleOnboardingUser(null);
    if (demoRole === 'ADMIN') {
      loginForm.setFieldsValue({
        email: 'admin@resolve.com',
        password: 'password123',
      });
      message.info('Loaded Platform Admin demo credentials');
    } else if (demoRole === 'CANDIDATE') {
      loginForm.setFieldsValue({
        email: 'rajesh.mehta@example.com',
        password: 'password123',
      });
      message.info('Loaded Insolvency Professional demo credentials');
    } else {
      loginForm.setFieldsValue({
        email: 'hr@arcil.co.in',
        password: 'password123',
      });
      message.info('Loaded Arcil Entity demo credentials');
    }
  };

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '520px', width: '100%', margin: '40px auto', padding: '0 16px', position: 'relative', zIndex: 10 }}>
        
        {/* Top Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '8px 18px', borderRadius: '50px', marginBottom: '12px' }}>
            <RocketOutlined style={{ color: '#38bdf8', fontSize: '18px' }} />
            <span style={{ color: '#38bdf8', fontWeight: 700, letterSpacing: '1px', fontSize: '13px' }}>RESOLVE PLATFORM AUTH</span>
          </div>
          <Title level={2} style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '28px' }}>
            {googleOnboardingUser 
              ? 'Complete Your Profile'
              : isLogin 
                ? 'Welcome Back' 
                : 'Join the Network'
            }
          </Title>
          <Text style={{ color: '#9ca3af', fontSize: '14px', marginTop: '6px', display: 'block' }}>
            {googleOnboardingUser
              ? 'Select how you want to use the Insolvency & Valuation ecosystem'
              : isLogin
                ? 'Sign in to access your specialized professional ecosystem'
                : 'Fast, OTP-verified registration for professionals & recruiters'
            }
          </Text>
        </div>

        {/* Card Container */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="portal-card"
          style={{ padding: '32px', background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}
        >
          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
              style={{ marginBottom: '20px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* CASE A: GOOGLE ONBOARDING SCREEN (New user after Google OAuth)  */}
          {/* ------------------------------------------------------------- */}
          {googleOnboardingUser ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              {/* Google Verified Banner */}
              <div style={{ 
                background: 'rgba(56, 189, 248, 0.08)', 
                border: '1px solid rgba(56, 189, 248, 0.25)', 
                borderRadius: '14px', 
                padding: '16px', 
                marginBottom: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '14px' 
              }}>
                <Avatar 
                  size={48} 
                  src={googleOnboardingUser.photoUrl} 
                  icon={<UserOutlined />} 
                  style={{ border: '2px solid #38bdf8', backgroundColor: '#0284c7' }} 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <Tag color="cyan" style={{ margin: 0, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleFilled /> Google Verified
                    </Tag>
                  </div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                    {googleOnboardingUser.email}
                  </div>
                </div>
              </div>

              <Form
                form={googleProfileForm}
                layout="vertical"
                onFinish={onCompleteGoogleOnboarding}
                requiredMark={false}
              >
                {/* Full Name */}
                <Form.Item
                  label={<span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Your Full Name</span>}
                  name="name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                  style={{ marginBottom: '20px' }}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#38bdf8' }} />}
                    placeholder="e.g. Adv. Rahul Sharma"
                    size="large"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                  />
                </Form.Item>

                {/* Role Selection Cards */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '10px' }}>
                    How would you like to register?
                  </label>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Role Option 1: CANDIDATE / PROFESSIONAL */}
                    <div
                      onClick={() => setGoogleRole('CANDIDATE')}
                      style={{
                        padding: '16px 14px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        border: googleRole === 'CANDIDATE' 
                          ? '2px solid #38bdf8' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: googleRole === 'CANDIDATE' 
                          ? 'rgba(56, 189, 248, 0.12)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        boxShadow: googleRole === 'CANDIDATE' ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none',
                        textAlign: 'center'
                      }}
                    >
                      <UserOutlined style={{ fontSize: '24px', color: googleRole === 'CANDIDATE' ? '#38bdf8' : '#9ca3af', marginBottom: '8px', display: 'block' }} />
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                        Job Seeker / IP
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.3 }}>
                        Insolvency Professional, Valuer, CA, CS, Legal Expert
                      </div>
                    </div>

                    {/* Role Option 2: EMPLOYER / RECRUITER */}
                    <div
                      onClick={() => setGoogleRole('EMPLOYER')}
                      style={{
                        padding: '16px 14px',
                        borderRadius: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease',
                        border: googleRole === 'EMPLOYER' 
                          ? '2px solid #38bdf8' 
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        background: googleRole === 'EMPLOYER' 
                          ? 'rgba(56, 189, 248, 0.12)' 
                          : 'rgba(255, 255, 255, 0.03)',
                        boxShadow: googleRole === 'EMPLOYER' ? '0 0 15px rgba(56, 189, 248, 0.2)' : 'none',
                        textAlign: 'center'
                      }}
                    >
                      <BankOutlined style={{ fontSize: '24px', color: googleRole === 'EMPLOYER' ? '#38bdf8' : '#9ca3af', marginBottom: '8px', display: 'block' }} />
                      <div style={{ color: 'white', fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                        Employer / Entity
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px', lineHeight: 1.3 }}>
                        IPE, Bank, ARC, Law Firm hiring professionals
                      </div>
                    </div>
                  </div>
                </div>

                {/* If Employer selected, prompt Company Name */}
                {googleRole === 'EMPLOYER' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginBottom: '20px' }}>
                    <Form.Item
                      label={<span style={{ color: '#e2e8f0', fontSize: '13px', fontWeight: 600 }}>Organization / Company Name</span>}
                      name="companyName"
                      rules={[{ required: true, message: 'Please enter your company / firm name' }]}
                    >
                      <Input
                        prefix={<BankOutlined style={{ color: '#38bdf8' }} />}
                        placeholder="e.g. Arcil Resolution Services Pvt Ltd"
                        size="large"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                      />
                    </Form.Item>
                  </motion.div>
                )}

                <button
                  type="submit"
                  className="portal-btn-primary"
                  style={{ width: '100%', padding: '13px', fontSize: '15px', borderRadius: '10px', marginTop: '10px' }}
                  disabled={loading}
                >
                  {loading ? 'Creating Profile...' : 'Complete Setup & Enter Portal →'}
                </button>

                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                  By completing setup, you agree to our{' '}
                  <Link to="/terms" style={{ color: '#38bdf8' }}>Terms</Link> and{' '}
                  <Link to="/privacy" style={{ color: '#38bdf8' }}>Privacy Policy</Link>.
                </div>

                <div style={{ textAlign: 'center', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => { setGoogleOnboardingUser(null); setIsLogin(true); }}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <ArrowLeftOutlined /> Use a different account
                  </button>
                </div>
              </Form>
            </motion.div>
          ) : isLogin ? (

            /* ------------------------------------------------------------- */
            /* CASE B: LOGIN SCREEN (Google OAuth + Email Password)           */
            /* ------------------------------------------------------------- */
            <div>
              {/* Google Live OAuth Button */}
              <button
                type="button"
                className="google-btn"
                onClick={() => googleLoginTrigger()}
                disabled={googleLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '20px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                <GoogleIcon />
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </button>

              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: '#64748b', fontSize: '12px', margin: '20px 0' }}>
                OR SIGN IN WITH EMAIL
              </Divider>

              <Form form={loginForm} layout="vertical" onFinish={onLoginFinish} requiredMark={false}>
                <Form.Item
                  label={<span style={{ color: '#e2e8f0', fontSize: '13px' }}>Email Address</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email' }
                  ]}
                  style={{ marginBottom: '16px' }}
                >
                  <Input
                    prefix={<MailOutlined style={{ color: '#38bdf8' }} />}
                    placeholder="name@example.com"
                    size="large"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                      <span style={{ color: '#e2e8f0', fontSize: '13px' }}>Password</span>
                      <button
                        type="button"
                        onClick={openForgotPasswordModal}
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer', padding: 0, fontWeight: 500 }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  }
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                  style={{ marginBottom: '24px' }}
                >
                  <Input.Password
                    prefix={<LockOutlined style={{ color: '#38bdf8' }} />}
                    placeholder="••••••••"
                    size="large"
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                  />
                </Form.Item>

                <button
                  type="submit"
                  className="portal-btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '10px' }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                </button>
              </Form>

              {/* Quick Demo Login Fillers */}
              <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                <div style={{ color: '#64748b', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px', textAlign: 'center' }}>
                  ⚡ Quick Demo Accounts
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => autofillDemo('CANDIDATE')}
                    style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '7px 4px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Candidate
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillDemo('EMPLOYER')}
                    style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '7px 4px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Employer
                  </button>
                  <button
                    type="button"
                    onClick={() => autofillDemo('ADMIN')}
                    style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '7px 4px', borderRadius: '8px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>
          ) : (

            /* ------------------------------------------------------------- */
            /* CASE C: MULTI-STEP SIGN UP FLOW (Google or Self-Email OTP)    */
            /* ------------------------------------------------------------- */
            <div>
              {/* Google Live OAuth Button */}
              <button
                type="button"
                className="google-btn"
                onClick={() => googleLoginTrigger()}
                disabled={googleLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: 'white',
                  fontSize: '15px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  marginBottom: '20px'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
              >
                <GoogleIcon />
                {googleLoading ? 'Connecting to Google...' : 'Sign Up with Google'}
              </button>

              <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.12)', color: '#64748b', fontSize: '12px', margin: '20px 0' }}>
                OR REGISTER WITH EMAIL OTP
              </Divider>

              {/* Progress Indicator for Email OTP Flow */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', background: 'rgba(255, 255, 255, 0.03)', padding: '10px 14px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: registerStep >= 0 ? '#38bdf8' : '#64748b', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: registerStep >= 0 ? '#38bdf8' : '#334155', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>1</span>
                  Email
                </div>
                <div style={{ width: '20px', height: '1px', background: registerStep >= 1 ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: registerStep >= 1 ? '#38bdf8' : '#64748b', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: registerStep >= 1 ? '#38bdf8' : '#334155', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>2</span>
                  OTP Verify
                </div>
                <div style={{ width: '20px', height: '1px', background: registerStep >= 2 ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: registerStep >= 2 ? '#38bdf8' : '#64748b', fontSize: '12px', fontWeight: 600 }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: registerStep >= 2 ? '#38bdf8' : '#334155', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700 }}>3</span>
                  Profile
                </div>
              </div>

              {/* STEP 0: Email Input */}
              {registerStep === 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#e2e8f0', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                      Enter Your Email
                    </label>
                    <Input
                      prefix={<MailOutlined style={{ color: '#38bdf8' }} />}
                      placeholder="e.g. insolvency.specialist@domain.com"
                      size="large"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      onPressEnter={handleSendOtp}
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                    />
                  </div>

                  <button
                    type="button"
                    className="portal-btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '10px' }}
                    onClick={handleSendOtp}
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? 'Sending Verification Code...' : 'Send Verification OTP →'}
                  </button>
                </motion.div>
              )}

              {/* STEP 1: Enter 6-digit OTP */}
              {registerStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ color: '#e2e8f0', fontSize: '13px' }}>
                        Enter 6-Digit OTP Code
                      </label>
                      <button 
                        type="button" 
                        onClick={() => setRegisterStep(0)} 
                        style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}
                      >
                        Change Email ({registerEmail})
                      </button>
                    </div>

                    <Input
                      prefix={<KeyOutlined style={{ color: '#38bdf8' }} />}
                      placeholder="Enter 6-digit OTP code"
                      size="large"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      onPressEnter={handleVerifyOtp}
                      style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px', letterSpacing: '4px', fontSize: '18px', textAlign: 'center' }}
                    />

                    {devOtpHint && (
                      <div style={{ marginTop: '8px', fontSize: '12px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>⚡ Development OTP: <strong>{devOtpHint}</strong></span>
                        <button 
                          type="button" 
                          onClick={() => setOtpCode(devOtpHint)} 
                          style={{ background: '#38bdf8', border: 'none', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                        >
                          Auto Fill
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <span style={{ color: '#64748b', fontSize: '13px' }}>
                      {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : "Didn't receive code?"}
                    </span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpCountdown > 0 || sendingOtp}
                      style={{ background: 'none', border: 'none', color: otpCountdown > 0 ? '#64748b' : '#38bdf8', cursor: otpCountdown > 0 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
                    >
                      Resend OTP
                    </button>
                  </div>

                  <button
                    type="button"
                    className="portal-btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '10px' }}
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                  >
                    {verifyingOtp ? 'Verifying...' : 'Verify & Continue →'}
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Name, Role Selection, Password & Confirm Password */}
              {registerStep === 2 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#10b981', fontSize: '13px', fontWeight: 500 }}>
                    <CheckCircleOutlined /> Email verified: {registerEmail}
                  </div>

                  <Form form={passwordForm} layout="vertical" onFinish={onCompleteRegistration} requiredMark={false}>
                    {/* Full Name */}
                    <Form.Item
                      label={<span style={{ color: '#e2e8f0', fontSize: '13px' }}>Your Full Name</span>}
                      name="name"
                      rules={[{ required: true, message: 'Please enter your name' }]}
                      style={{ marginBottom: '16px' }}
                    >
                      <Input
                        prefix={<UserOutlined style={{ color: '#38bdf8' }} />}
                        placeholder="e.g. Adv. Rajesh Mehta"
                        size="large"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                      />
                    </Form.Item>

                    {/* Role Selection */}
                    <div style={{ marginBottom: '16px' }}>
                      <label style={{ color: '#e2e8f0', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                        Register As:
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div
                          onClick={() => setManualRole('CANDIDATE')}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: manualRole === 'CANDIDATE' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: manualRole === 'CANDIDATE' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            textAlign: 'center'
                          }}
                        >
                          <UserOutlined style={{ color: manualRole === 'CANDIDATE' ? '#38bdf8' : '#9ca3af', fontSize: '18px', marginBottom: '4px', display: 'block' }} />
                          <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>Candidate / IP</div>
                          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Job Seeker / Specialist</div>
                        </div>

                        <div
                          onClick={() => setManualRole('EMPLOYER')}
                          style={{
                            padding: '12px 10px',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            border: manualRole === 'EMPLOYER' ? '2px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.1)',
                            background: manualRole === 'EMPLOYER' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                            textAlign: 'center'
                          }}
                        >
                          <BankOutlined style={{ color: manualRole === 'EMPLOYER' ? '#38bdf8' : '#9ca3af', fontSize: '18px', marginBottom: '4px', display: 'block' }} />
                          <div style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>Employer / Entity</div>
                          <div style={{ color: '#94a3b8', fontSize: '10px' }}>Hiring Organization</div>
                        </div>
                      </div>
                    </div>

                    {/* If Employer selected, Organization Name */}
                    {manualRole === 'EMPLOYER' && (
                      <Form.Item
                        label={<span style={{ color: '#e2e8f0', fontSize: '13px' }}>Company / Organization Name</span>}
                        name="companyName"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                        style={{ marginBottom: '16px' }}
                      >
                        <Input
                          prefix={<BankOutlined style={{ color: '#38bdf8' }} />}
                          placeholder="e.g. Insolvency Advisory Partners"
                          size="large"
                          style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                        />
                      </Form.Item>
                    )}

                    <Form.Item
                      label={<span style={{ color: '#e2e8f0', fontSize: '13px' }}>Set Account Password</span>}
                      name="password"
                      rules={[
                        { required: true, message: 'Please enter password' },
                        { min: 6, message: 'Password must be at least 6 characters' }
                      ]}
                      style={{ marginBottom: '16px' }}
                    >
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#38bdf8' }} />}
                        placeholder="••••••••"
                        size="large"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                      />
                    </Form.Item>

                    <Form.Item
                      label={<span style={{ color: '#e2e8f0', fontSize: '13px' }}>Confirm Password</span>}
                      name="confirmPassword"
                      rules={[
                        { required: true, message: 'Please confirm password' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('The two passwords do not match'));
                          },
                        }),
                      ]}
                      style={{ marginBottom: '24px' }}
                    >
                      <Input.Password
                        prefix={<LockOutlined style={{ color: '#38bdf8' }} />}
                        placeholder="••••••••"
                        size="large"
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
                      />
                    </Form.Item>

                    <button
                      type="submit"
                      className="portal-btn-primary"
                      style={{ width: '100%', padding: '12px', fontSize: '15px', borderRadius: '10px' }}
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Complete Registration →'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#64748b' }}>
                      By registering, you agree to our{' '}
                      <Link to="/terms" style={{ color: '#38bdf8' }}>Terms</Link> and{' '}
                      <Link to="/privacy" style={{ color: '#38bdf8' }}>Privacy Policy</Link>.
                    </div>
                  </Form>
                </motion.div>
              )}
            </div>
          )}

          {/* Toggle Login/Register footer (Hidden when in Google onboarding) */}
          {!googleOnboardingUser && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <span style={{ color: '#9ca3af', fontSize: '14px' }}>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button 
                type="button" 
                onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); setRegisterStep(0); }}
                style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer', fontSize: '14px' }}
              >
                {isLogin ? 'Sign Up' : 'Log In'}
              </button>
            </div>
          )}

        </motion.div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FORGOT PASSWORD MODAL (Nodemailer Email OTP Flow)             */}
      {/* ------------------------------------------------------------- */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '17px', fontWeight: 700 }}>
            <KeyOutlined style={{ color: '#38bdf8' }} /> Reset Your Password
          </div>
        }
        open={showForgotModal}
        onCancel={() => setShowForgotModal(false)}
        footer={null}
        destroyOnClose
        centered
        styles={{
          mask: { backdropFilter: 'blur(8px)', background: 'rgba(0, 0, 0, 0.75)' },
          content: { background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px', padding: '28px', color: 'white' }
        }}
      >
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' }}>
          {forgotStep === 0 && 'Enter your registered email address to receive a 6-digit password reset OTP via Nodemailer.'}
          {forgotStep === 1 && `Enter the 6-digit verification code sent to ${forgotEmail}.`}
          {forgotStep === 2 && 'Set a strong new password for your account.'}
        </p>

        {forgotError && (
          <Alert
            message={forgotError}
            type="error"
            showIcon
            closable
            onClose={() => setForgotError('')}
            style={{ marginBottom: '16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
          />
        )}

        {/* Step 0: Enter Registered Email */}
        {forgotStep === 0 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ color: '#e2e8f0', fontSize: '13px', display: 'block', marginBottom: '8px' }}>
                Account Email Address
              </label>
              <Input
                prefix={<MailOutlined style={{ color: '#38bdf8' }} />}
                placeholder="name@example.com"
                size="large"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onPressEnter={handleSendForgotOtp}
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
              />
            </div>

            <button
              type="button"
              className="portal-btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px' }}
              onClick={handleSendForgotOtp}
              disabled={forgotSending}
            >
              {forgotSending ? 'Sending Reset Code...' : 'Send Reset Code via Email →'}
            </button>
          </div>
        )}

        {/* Step 1: Verify OTP */}
        {forgotStep === 1 && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ color: '#e2e8f0', fontSize: '13px' }}>
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setForgotStep(0)}
                  style={{ background: 'none', border: 'none', color: '#38bdf8', fontSize: '12px', cursor: 'pointer' }}
                >
                  Change Email
                </button>
              </div>

              <Input
                prefix={<KeyOutlined style={{ color: '#38bdf8' }} />}
                placeholder="123456"
                size="large"
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                onPressEnter={handleVerifyForgotOtp}
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px', letterSpacing: '4px', fontSize: '18px', textAlign: 'center' }}
              />

              {forgotDevOtp && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '6px 10px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>⚡ Development OTP: <strong>{forgotDevOtp}</strong></span>
                  <button 
                    type="button" 
                    onClick={() => setForgotOtp(forgotDevOtp)} 
                    style={{ background: '#38bdf8', border: 'none', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                  >
                    Auto Fill
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ color: '#64748b', fontSize: '13px' }}>
                {forgotCountdown > 0 ? `Resend code in ${forgotCountdown}s` : "Didn't receive email?"}
              </span>
              <button
                type="button"
                onClick={handleSendForgotOtp}
                disabled={forgotCountdown > 0 || forgotSending}
                style={{ background: 'none', border: 'none', color: forgotCountdown > 0 ? '#64748b' : '#38bdf8', cursor: forgotCountdown > 0 ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600 }}
              >
                Resend Code
              </button>
            </div>

            <button
              type="button"
              className="portal-btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px' }}
              onClick={handleVerifyForgotOtp}
              disabled={forgotVerifying}
            >
              {forgotVerifying ? 'Verifying...' : 'Verify Code & Proceed →'}
            </button>
          </div>
        )}

        {/* Step 2: Set New Password */}
        {forgotStep === 2 && (
          <Form form={resetPasswordForm} layout="vertical" onFinish={handleResetPassword} requiredMark={false}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#10b981', fontSize: '13px', fontWeight: 500 }}>
              <CheckCircleOutlined /> Resetting password for: {forgotEmail}
            </div>

            <Form.Item
              label={<span style={{ color: '#e2e8f0', fontSize: '13px' }}>New Password</span>}
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
              style={{ marginBottom: '16px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#38bdf8' }} />}
                placeholder="••••••••"
                size="large"
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
              />
            </Form.Item>

            <Form.Item
              label={<span style={{ color: '#e2e8f0', fontSize: '13px' }}>Confirm New Password</span>}
              name="confirmPassword"
              rules={[
                { required: true, message: 'Please confirm new password' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The two passwords do not match'));
                  },
                }),
              ]}
              style={{ marginBottom: '24px' }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: '#38bdf8' }} />}
                placeholder="••••••••"
                size="large"
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
              />
            </Form.Item>

            <button
              type="submit"
              className="portal-btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '14px', borderRadius: '10px' }}
              disabled={forgotResetting}
            >
              {forgotResetting ? 'Updating Password...' : 'Save New Password & Sign In →'}
            </button>
          </Form>
        )}
      </Modal>

    </div>
  );
};

export default Login;

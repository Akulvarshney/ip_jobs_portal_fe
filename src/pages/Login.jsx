import React, { useState, useEffect } from 'react';
import { Form, Input, Typography, message, Alert, Divider, Avatar, Tag, Modal } from 'antd';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser, loginSuccess } from '../store/authSlice';
import { useNavigate, useSearchParams, useLocation, useParams, Link } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import {
  MailOutlined,
  LockOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  ArrowLeftOutlined,
  UserOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Custom Google G Icon SVG
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" className="portal-mr-10">
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

const Login = ({ audience = 'CANDIDATE' }) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { token: inviteToken } = useParams();
  const isLogin = !location.pathname.endsWith('/signup');
  const isInvite = audience === 'HR';
  const accountRole = audience === 'CANDIDATE' ? 'CANDIDATE' : 'EMPLOYER';
  const basePath = isInvite ? `/invite/${inviteToken}` : audience === 'ADMIN' ? '/admin' : accountRole === 'CANDIDATE' ? '/candidate' : '/employer';
  const [invite, setInvite] = useState(null);
  const [inviteError, setInviteError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Google Onboarding State for new users
  const [googleOnboardingUser, setGoogleOnboardingUser] = useState(null); // { email, name, photoUrl }

  // Register multi-step state (Self Email OTP flow)
  // Account details -> verify email and create account.
  const [registerStep, setRegisterStep] = useState(0);
  const [registerEmail, setRegisterEmail] = useState('');
  const [registrationDetails, setRegistrationDetails] = useState(null);
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
    if (!isInvite) return;
    let active = true;
    api.get(`/api/employer/invitations/${inviteToken}`)
      .then(({ data }) => { if (active) { setInvite(data.data); passwordForm.setFieldsValue({ email: data.data.email }); loginForm.setFieldsValue({ email: data.data.email }); } })
      .catch(error => { if (active) setInviteError(error.response?.data?.error || 'This invitation could not be loaded.'); });
    return () => { active = false; };
  }, [isInvite, inviteToken, passwordForm, loginForm]);

  const correctAudience = user => audience === 'ADMIN' ? user.role === 'ADMIN' : user.role === accountRole && (!isInvite || user.email?.toLowerCase() === invite?.email?.toLowerCase());
  const audienceError = () => isInvite ? `Sign in with the invited employer account (${invite?.email}).` : audience === 'CANDIDATE' ? 'This account is for hiring. Use employer sign in.' : audience === 'ADMIN' ? 'This is not a platform admin account.' : 'This is a candidate account. Use candidate sign in.';

  const finishRegistration = async (payload) => {
    dispatch(loginSuccess({ token: payload.token, user: payload.user }));
    if (!isInvite) {
      message.success(accountRole === 'EMPLOYER' ? 'Account created. Complete your organisation details for approval.' : 'Candidate account created.');
      redirectUser(payload.user);
      return;
    }
    try {
      await api.post(`/api/employer/invitations/${inviteToken}/accept`);
      await dispatch(fetchCurrentUser()).unwrap();
      message.success(`You have joined ${invite.organisation} as an HR employee.`);
      navigate('/employer', { replace: true });
    } catch (error) {
      message.warning(error.response?.data?.error || 'Your account was created, but the invitation could not be accepted. Please retry from the invitation page.');
      navigate(`/invite/${inviteToken}`, { replace: true });
    }
  };


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
      if (!correctAudience(res.data.user)) { setErrorMessage(audienceError()); return; }
      dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
      message.success('Welcome back! Sign in successful.');
      redirectUser(res.data.user);
    } catch (error) {
      const msg = error.response?.data?.error || 'Authentication failed. Please check your email and password.';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Registration Step 1: Send OTP to email
  const handleSendOtp = async (details) => {
    if (sendingOtp) return;
    const account = details?.email ? details : registrationDetails;
    const email = (isInvite ? invite?.email : account?.email || registerEmail)?.trim().toLowerCase() || '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.warning('Please enter a valid email address');
      return;
    }
    setSendingOtp(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/send-otp', { email });
      if (res.data?.success) {
        message.success(res.data.message);
        if (res.data.otp) {
          setDevOtpHint(res.data.otp);
        }
        setRegisterEmail(email);
        if (account) setRegistrationDetails(account);
        setOtpCode('');
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
    if (verifyingOtp || loading) return;
    if (!/^\d{6}$/.test(otpCode.trim())) {
      message.warning('Please enter the 6-digit verification code');
      return;
    }
    setVerifyingOtp(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/verify-otp', { email: registerEmail, otp: otpCode });
      if (res.data?.success) {
        await onCompleteRegistration(registrationDetails, res.data.verificationToken);
      }
    } catch (error) {
      const msg = error.response?.data?.error || 'Invalid verification code';
      setErrorMessage(msg);
      message.error(msg);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Finish registration after email verification.
  const onCompleteRegistration = async (values, verificationToken) => {
    if (!values?.password) {
      message.error('Please return to account details and enter a password.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/register', {
        email: registerEmail,
        password: values.password,
        name: values.name,
        role: accountRole,
        verificationToken
      });

      await finishRegistration(res.data);
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
        const res = await api.post('/api/auth/google', { accessToken: tokenResponse.access_token });
        const googleUser = { email: res.data.email || res.data.user?.email, name: res.data.name || res.data.user?.name, picture: res.data.photoUrl };

        if (isInvite && googleUser.email?.toLowerCase() !== invite?.email?.toLowerCase()) { setErrorMessage(`Use the invited Google account (${invite?.email}).`); return; }
        if (res.data.isNewUser) {
          if (audience === 'ADMIN') { setErrorMessage('Platform admin accounts cannot be created here.'); return; }
          setGoogleOnboardingUser({
            email: googleUser.email,
            name: googleUser.name || googleUser.given_name || googleUser.email.split('@')[0],
            photoUrl: googleUser.picture,
            accessToken: tokenResponse.access_token
          });

          googleProfileForm.setFieldsValue({
            name: googleUser.name || googleUser.given_name || googleUser.email.split('@')[0]
          });
          message.info('Google verified. Finish creating your account.');
        } else {
          if (!correctAudience(res.data.user)) { setErrorMessage(audienceError()); return; }
          dispatch(loginSuccess({ token: res.data.token, user: res.data.user }));
          message.success(`Signed in with Google as ${res.data.user.name || googleUser.email}!`);
          redirectUser(res.data.user);
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

  // Finish Google signup in the account flow the user entered.
  const onCompleteGoogleOnboarding = async (values) => {
    if (!googleOnboardingUser) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post('/api/auth/google', {
        accessToken: googleOnboardingUser.accessToken,
        name: values.name || googleOnboardingUser.name,
        photoUrl: googleOnboardingUser.photoUrl,
        role: accountRole
      });

      if (!correctAudience(res.data.user)) { setErrorMessage(audienceError()); return; }
      await finishRegistration(res.data);
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

  const redirectUser = (user) => {
    const userRole = user.role;
    const redirectUrl = isInvite ? `/invite/${inviteToken}` : searchParams.get('redirect');
    if (userRole === 'EMPLOYER' && /^\/invite\/[a-f0-9]{64}$/.test(redirectUrl || '')) {
      navigate(redirectUrl, { replace: true });
      return;
    }
    if (user.onboarding?.required) {
      navigate(user.onboarding.path, { replace: true });
      return;
    }
    if (redirectUrl?.startsWith('/') && !redirectUrl.startsWith('//') && !redirectUrl.includes('\\') && !redirectUrl.startsWith('/login')) {
      navigate(redirectUrl, { replace: true });
      return;
    }

    if (userRole === 'ADMIN') {
      navigate('/admin');
    } else if (userRole === 'EMPLOYER') {
      navigate('/employer');
    } else {
      navigate('/candidate');
    }
  };


  if (isInvite && (!invite || inviteError)) return <div className="portal-page-wrapper" style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 24 }}><div className="portal-glass-card portal-p-32"><h1 className="portal-text-heading">HR invitation</h1><p className="portal-text-muted-sm">{inviteError || 'Checking your invitation…'}</p>{inviteError && <Link to="/login">Return to sign in</Link>}</div></div>;

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div className="portal-auth-page-container">

        {/* Top Logo / Brand */}
        <div className="portal-auth-brand-header">

          <Title level={2} className="portal-auth-title">
            {googleOnboardingUser
              ? isInvite ? 'Create your HR account' : 'Complete your account'
              : isInvite ? (isLogin ? 'Sign in to join the team' : 'Create your HR account')
              : audience === 'ADMIN' ? 'Platform admin sign in'
              : accountRole === 'CANDIDATE' ? (isLogin ? 'Candidate sign in' : 'Create your candidate account')
              : (isLogin ? 'Employer sign in' : 'Set up your organisation')
            }
          </Title>
          <Text className="portal-auth-subtitle">
            {googleOnboardingUser
              ? isInvite ? `Join ${invite?.organisation} as an HR employee.` : 'Confirm your details to continue.'
              : isInvite ? `Use ${invite?.email} to join ${invite?.organisation}.`
              : audience === 'ADMIN' ? 'Access platform governance.'
              : accountRole === 'CANDIDATE' ? 'Find opportunities and manage applications.'
              : 'Create or access your organisation workspace.'
            }
          </Text>
        </div>

        {/* Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="portal-card portal-auth-card"
        >
          {errorMessage && (
            <Alert
              message={errorMessage}
              type="error"
              showIcon
              closable
              onClose={() => setErrorMessage('')}
              className="portal-alert-error-custom"
            />
          )}

          {/* ------------------------------------------------------------- */}
          {/* CASE A: GOOGLE ONBOARDING SCREEN (New user after Google OAuth)  */}
          {/* ------------------------------------------------------------- */}
          {googleOnboardingUser ? (
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              {/* Google Verified Banner */}
              <div className="portal-google-verified-banner">
                <Avatar
                  size={48}
                  src={googleOnboardingUser.photoUrl || null}
                  icon={<UserOutlined />}
                  className="portal-avatar-blue-border"
                />
                <div className="portal-flex-1">
                  <div className="portal-flex-center-gap-6 portal-mb-2">
                    <Tag color="cyan" className="portal-tag-verified">
                      <CheckCircleFilled /> Google Verified
                    </Tag>
                  </div>
                  <div className="portal-verified-email-text">
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
                  label={<span className="portal-form-label-bold">Your Full Name</span>}
                  name="name"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                  className="portal-mb-20"
                >
                  <Input
                    prefix={<UserOutlined className="portal-text-link" />}
                    placeholder="e.g. Adv. Rahul Sharma"
                    size="large"
                    className="portal-auth-input"
                  />
                </Form.Item>

                <p className="portal-text-muted-sm">{isInvite ? `You will join ${invite?.organisation} as an HR employee.` : accountRole === 'CANDIDATE' ? 'Your account is for finding and applying to jobs.' : 'Your account is for organisation hiring.'}</p>

                <button
                  type="submit"
                  className="portal-btn-primary portal-btn-auth-submit"
                  disabled={loading}
                >
                  {loading ? 'Creating Profile...' : 'Complete Setup & Enter Portal →'}
                </button>

                <div className="portal-auth-terms-note">
                  By completing setup, you agree to our{' '}
                  <Link to="/terms" className="portal-text-link">Terms</Link> and{' '}
                  <Link to="/privacy" className="portal-text-link">Privacy Policy</Link>.
                </div>

                <div className="portal-text-center portal-mt-14">
                  <button
                    type="button"
                    onClick={() => { setGoogleOnboardingUser(null); navigate(`${basePath}/login`); }}
                    className="portal-btn-link-switch"
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
                className="google-btn portal-google-login-btn"
                onClick={() => googleLoginTrigger()}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
              </button>

              <Divider className="portal-auth-divider">
                OR SIGN IN WITH EMAIL
              </Divider>

              <Form form={loginForm} layout="vertical" onFinish={onLoginFinish} requiredMark={false}>
                <Form.Item
                  label={<span className="portal-form-label">Email Address</span>}
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter your email' },
                    { type: 'email', message: 'Enter a valid email' }
                  ]}
                  className="portal-mb-16"
                >
                  <Input
                    prefix={<MailOutlined className="portal-text-link" />}
                    placeholder="name@example.com"
                    size="large"
                    className="portal-auth-input"
                    readOnly={isInvite}
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <div className="portal-between-row portal-w-full">
                      <span className="portal-form-label">Password</span>
                      <button
                        type="button"
                        onClick={openForgotPasswordModal}
                        className="portal-btn-forgot-password"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  }
                  name="password"
                  rules={[{ required: true, message: 'Please enter your password' }]}
                  className="portal-mb-24 portal-full-width-label"
                >
                  <Input.Password
                    prefix={<LockOutlined className="portal-text-link" />}
                    placeholder="••••••••"
                    size="large"
                    className="portal-auth-input"
                  />
                </Form.Item>

                <button
                  type="submit"
                  className="portal-btn-primary portal-btn-auth-full"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                </button>
              </Form>

            </div>
          ) : (

            /* ------------------------------------------------------------- */
            /* CASE C: MULTI-STEP SIGN UP FLOW (Google or Self-Email OTP)    */
            /* ------------------------------------------------------------- */
            <div>
              {/* Google Live OAuth Button */}
              <button
                type="button"
                className="google-btn portal-google-login-btn"
                onClick={() => googleLoginTrigger()}
                disabled={googleLoading}
              >
                <GoogleIcon />
                {googleLoading ? 'Connecting to Google...' : 'Sign Up with Google'}
              </button>

              <Divider className="portal-auth-divider">
                OR CONTINUE WITH EMAIL
              </Divider>

              <div className="portal-otp-step-bar" aria-label={`Step ${registerStep + 1} of 2`}>
                <span className="portal-step-item active">1. Account details</span>
                <span className="portal-step-line active" />
                <span className={`portal-step-item ${registerStep === 1 ? 'active' : ''}`}>2. Verify email</span>
              </div>
              {registerStep === 0 && <div>
                <Form form={passwordForm} layout="vertical" onFinish={handleSendOtp} initialValues={{ email: isInvite ? invite?.email : registerEmail }} requiredMark={false}>
                  <Form.Item label="Email address" name="email" rules={[{ required: true, message: 'Enter your email address' }, { type: 'email', message: 'Enter a valid email address' }]}>
                    <Input autoComplete="email" type="email" size="large" className="portal-auth-input" placeholder="you@example.com" readOnly={isInvite} />
                  </Form.Item>
                  {/* Full Name */}
                  <Form.Item
                    label={<span className="portal-form-label">Your Full Name</span>}
                    name="name"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                    className="portal-mb-16"
                  >
                    <Input
                      prefix={<UserOutlined className="portal-text-link" />}
                      placeholder="e.g. Adv. Rajesh Mehta"
                      size="large"
                      className="portal-auth-input"
                    />
                  </Form.Item>

                  <p className="portal-text-muted-sm">{isInvite ? `This account will join ${invite?.organisation} as an HR employee.` : accountRole === 'CANDIDATE' ? 'Create a personal candidate account.' : 'Create an organisation admin account. Organisation details are reviewed before access. If you were invited as HR, use your invitation link instead.'}</p>

                  <Form.Item
                    label={<span className="portal-form-label">Set Account Password</span>}
                    name="password"
                    rules={[
                      { required: true, message: 'Please enter password' },
                      { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                    className="portal-mb-16"
                  >
                    <Input.Password autoComplete="new-password"
                      prefix={<LockOutlined className="portal-text-link" />}
                      placeholder="••••••••"
                      size="large"
                      className="portal-auth-input"
                    />
                  </Form.Item>



                  <button
                    type="submit"
                    className="portal-btn-primary portal-btn-auth-full"
                    disabled={sendingOtp}
                  >
                    {sendingOtp ? 'Sending code...' : 'Continue to email verification →'}
                  </button>

                  <div className="portal-auth-terms-note">
                    By registering, you agree to our{' '}
                    <Link to="/terms" className="portal-text-link">Terms</Link> and{' '}
                    <Link to="/privacy" className="portal-text-link">Privacy Policy</Link>.
                  </div>
                </Form>
              </div>}

              {/* STEP 1: Enter 6-digit OTP */}
              {registerStep === 1 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="portal-mb-16">
                    <div className="portal-between-row portal-mb-8">
                      <label className="portal-form-label">
                        Enter the code from your email
                      </label>
                      <button
                        type="button"
                        onClick={() => { setRegisterStep(0); setErrorMessage(''); }}
                        className="portal-btn-change-email"
                      >
                        Change Email ({registerEmail})
                      </button>
                    </div>

                    <Input
                      prefix={<KeyOutlined className="portal-text-link" />}
                      placeholder="Enter 6-digit OTP code"
                      size="large"
                      maxLength={6}
                      inputMode="numeric" autoComplete="one-time-code" aria-label="Email verification code"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      onPressEnter={handleVerifyOtp}
                      className="portal-otp-input"
                    />

                    {devOtpHint && (
                      <div className="portal-dev-otp-box">
                        <span>⚡ Development OTP: <strong>{devOtpHint}</strong></span>
                        <button
                          type="button"
                          onClick={() => setOtpCode(devOtpHint)}
                          className="portal-btn-autofill-otp"
                        >
                          Auto Fill
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="portal-resend-row">
                    <span className="portal-text-muted-13">
                      {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : "Didn't receive code?"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      disabled={otpCountdown > 0 || sendingOtp}
                      className={`portal-btn-resend ${otpCountdown > 0 ? 'disabled' : ''}`}
                    >
                      Resend code
                    </button>
                  </div>

                  <button
                    type="button"
                    className="portal-btn-primary portal-btn-auth-full"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || loading}
                  >
                    {verifyingOtp || loading ? 'Creating your account...' : 'Verify email & create account →'}
                  </button>
                </motion.div>
              )}


            </div>
          )}

          {/* Toggle Login/Register footer (Hidden when in Google onboarding) */}
          {!googleOnboardingUser && audience !== 'ADMIN' && (
            <div className="portal-auth-switch-row">
              <span className="portal-text-muted-14">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
              </span>
              <button
                type="button"
                onClick={() => { navigate(`${basePath}/${isLogin ? 'signup' : 'login'}${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`); setErrorMessage(''); }}
                className="portal-auth-switch-btn"
              >
                {isLogin ? (isInvite ? 'Create your HR account' : 'Sign Up') : 'Log In'}
              </button>
            </div>
          )}

          {!googleOnboardingUser && !isInvite && audience !== 'ADMIN' && (
            <div className="portal-auth-switch-row">
              <span className="portal-text-muted-14">{accountRole === 'CANDIDATE' ? 'Hiring for an organisation?' : 'Looking for a job?'}</span>{' '}
              <Link className="portal-auth-switch-btn" to={accountRole === 'CANDIDATE' ? '/employer/login' : '/candidate/login'}>
                {accountRole === 'CANDIDATE' ? 'Employer sign in' : 'Candidate sign in'}
              </Link>
            </div>
          )}

        </motion.div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* FORGOT PASSWORD MODAL (Nodemailer Email OTP Flow)             */}
      {/* ------------------------------------------------------------- */}
      <Modal
        title={
          <div className="portal-modal-header-row">
            <KeyOutlined className="portal-text-link" /> Reset Your Password
          </div>
        }
        open={showForgotModal}
        onCancel={() => setShowForgotModal(false)}
        footer={null}
        destroyOnClose
        centered
      >
        <p className="portal-modal-subtitle-13">
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
            className="portal-alert-error-custom portal-mb-16"
          />
        )}

        {/* Step 0: Enter Registered Email */}
        {forgotStep === 0 && (
          <div>
            <div className="portal-mb-16">
              <label className="portal-form-label-block-8">
                Account Email Address
              </label>
              <Input
                prefix={<MailOutlined className="portal-text-link" />}
                placeholder="name@example.com"
                size="large"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                onPressEnter={handleSendForgotOtp}
                className="portal-auth-input"
              />
            </div>

            <button
              type="button"
              className="portal-btn-primary portal-btn-auth-full"
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
            <div className="portal-mb-16">
              <div className="portal-between-row portal-mb-8">
                <label className="portal-form-label">
                  6-Digit OTP Code
                </label>
                <button
                  type="button"
                  onClick={() => setForgotStep(0)}
                  className="portal-btn-change-email"
                >
                  Change Email
                </button>
              </div>

              <Input
                prefix={<KeyOutlined className="portal-text-link" />}
                placeholder="123456"
                size="large"
                maxLength={6}
                value={forgotOtp}
                onChange={(e) => setForgotOtp(e.target.value)}
                onPressEnter={handleVerifyForgotOtp}
                className="portal-otp-input"
              />

              {forgotDevOtp && (
                <div className="portal-dev-otp-box">
                  <span>⚡ Development OTP: <strong>{forgotDevOtp}</strong></span>
                  <button
                    type="button"
                    onClick={() => setForgotOtp(forgotDevOtp)}
                    className="portal-btn-autofill-otp"
                  >
                    Auto Fill
                  </button>
                </div>
              )}
            </div>

            <div className="portal-resend-row">
              <span className="portal-text-muted-13">
                {forgotCountdown > 0 ? `Resend code in ${forgotCountdown}s` : "Didn't receive email?"}
              </span>
              <button
                type="button"
                onClick={handleSendForgotOtp}
                disabled={forgotCountdown > 0 || forgotSending}
                className={`portal-btn-resend ${forgotCountdown > 0 ? 'disabled' : ''}`}
              >
                Resend Code
              </button>
            </div>

            <button
              type="button"
              className="portal-btn-primary portal-btn-auth-full"
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
            <div className="portal-verified-email-banner">
              <CheckCircleOutlined /> Resetting password for: {forgotEmail}
            </div>

            <Form.Item
              label={<span className="portal-form-label">New Password</span>}
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter new password' },
                { min: 6, message: 'Password must be at least 6 characters' }
              ]}
              className="portal-mb-16"
            >
              <Input.Password
                prefix={<LockOutlined className="portal-text-link" />}
                placeholder="••••••••"
                size="large"
                className="portal-auth-input"
              />
            </Form.Item>

            <Form.Item
              label={<span className="portal-form-label">Confirm New Password</span>}
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
              className="portal-mb-24"
            >
              <Input.Password
                prefix={<LockOutlined className="portal-text-link" />}
                placeholder="••••••••"
                size="large"
                className="portal-auth-input"
              />
            </Form.Item>

            <button
              type="submit"
              className="portal-btn-primary portal-btn-auth-full"
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

import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Tag, 
  Divider, 
  Modal, 
  Input, 
  message, 
  Spin, 
  Row, 
  Col, 
  Avatar, 
  Breadcrumb, 
  Tooltip 
} from 'antd';
import { 
  EnvironmentOutlined, 
  DollarOutlined, 
  CalendarOutlined, 
  BankOutlined, 
  ShareAltOutlined, 
  HeartOutlined, 
  HeartFilled, 
  CheckCircleOutlined, 
  SendOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  GlobalOutlined, 
  RocketOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../../store/jobsSlice';
import { fetchSavedJobs, fetchCandidateApplications, toggleSaveJob, applyToJob } from '../../store/candidateSlice';

const JobDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState(null);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const jobData = await dispatch(fetchJobById(id)).unwrap();
      setJob(jobData);

      if (isAuthenticated && user?.role === 'CANDIDATE') {
        const [savedRes, appsRes] = await Promise.all([
          dispatch(fetchSavedJobs()).unwrap().catch(() => []),
          dispatch(fetchCandidateApplications()).unwrap().catch(() => [])
        ]);

        const savedList = Array.isArray(savedRes) ? savedRes : savedRes?.data || [];
        const found = savedList.some(s => (s.jobId || s.job?.id || s.id) === Number(id));
        setIsSaved(found);

        const appsList = Array.isArray(appsRes) ? appsRes : appsRes?.data || [];
        const app = appsList.find(a => (a.jobId || a.job?.id) === Number(id));
        if (app) setAppliedStatus(app.status);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      message.error('Failed to load mandate details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [id, isAuthenticated, dispatch]);

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      message.info('Please log in as a candidate to save jobs');
      return navigate('/login');
    }
    try {
      const res = await dispatch(toggleSaveJob(id)).unwrap();
      setIsSaved(res.isSaved);
      message.success(res.message || 'Bookmark updated');
    } catch (error) {
      message.error('Failed to update bookmark');
    }
  };

  const handleOpenApplyModal = () => {
    if (!isAuthenticated) {
      message.info('Please log in or sign up to apply');
      return navigate('/login?mode=signup');
    }
    if (user?.role !== 'CANDIDATE') {
      message.warning('Only candidate accounts can apply to mandates');
      return;
    }
    setCoverNote('');
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async () => {
    try {
      setSubmittingApply(true);
      await dispatch(applyToJob({ jobId: Number(id), coverNote })).unwrap();
      message.success('Application submitted successfully!');
      setAppliedStatus('APPLIED');
      setApplyModalOpen(false);
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to submit application');
    } finally {
      setSubmittingApply(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    message.success('Mandate link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="portal-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="portal-page-wrapper">
        <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <h2 style={{ color: 'white' }}>Mandate Not Found</h2>
          <p style={{ color: '#9ca3af' }}>The job posting you are looking for may have been closed or removed.</p>
          <Link to="/jobs">
            <Button type="primary">Back to Mandates Directory</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
        
        {/* Breadcrumb Navigation */}
        <div style={{ marginBottom: '24px' }}>
          <Breadcrumb
            items={[
              { title: <Link to="/" style={{ color: '#9ca3af' }}>Home</Link> },
              { title: <Link to="/jobs" style={{ color: '#9ca3af' }}>Mandates</Link> },
              { title: <span style={{ color: '#38bdf8' }}>{job.title}</span> }
            ]}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '32px' }}>
          
          {/* Main Job Details Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="portal-glass-card"
            style={{ padding: '36px' }}
          >
            {/* Header / Org */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.05))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#38bdf8',
                  fontSize: '24px',
                  boxShadow: '0 4px 16px rgba(14, 165, 233, 0.2)'
                }}>
                  {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Tag color="cyan" style={{ borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                      {job.employer?.type || 'VERIFIED ENTITY'}
                    </Tag>
                    <Tag color="purple" style={{ borderRadius: '6px', fontSize: '11px' }}>Full-time</Tag>
                  </div>
                  <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'white', margin: 0 }}>
                    {job.title}
                  </h1>
                  <Link to={`/companies/${job.employer?.id}`} style={{ color: '#38bdf8', fontSize: '15px', fontWeight: 500 }}>
                    {job.employer?.name || 'Insolvency Entity'} ↗
                  </Link>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  onClick={handleToggleSave}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isSaved ? '#ef4444' : '#9ca3af',
                    fontSize: '18px'
                  }}
                >
                  {isSaved ? <HeartFilled /> : <HeartOutlined />}
                </button>

                <Button
                  icon={<ShareAltOutlined />}
                  onClick={handleCopyLink}
                  style={{ borderRadius: '10px', height: '40px', background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.12)', color: 'white' }}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Quick Metadata Highlights */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '18px 20px',
              marginBottom: '32px'
            }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Location / Bench</div>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                  <EnvironmentOutlined style={{ color: '#38bdf8', marginRight: '6px' }} />
                  {job.employer?.location || 'India'}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Posted Date</div>
                <div style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                  <CalendarOutlined style={{ color: '#38bdf8', marginRight: '6px' }} />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Status</div>
                <div style={{ color: '#10b981', fontSize: '14px', fontWeight: 600, marginTop: '2px' }}>
                  ● Active Accepting Applications
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>
                Mandate Overview & Scope
              </h2>
              <div style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.7', whiteSpace: 'pre-line' }}>
                {job.description}
              </div>
            </div>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Requirements & Compliance */}
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>
                Key Responsibilities & Eligibility
              </h2>
              <div style={{
                background: 'rgba(56, 189, 248, 0.04)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                padding: '20px',
                borderRadius: '12px',
                color: '#e2e8f0',
                fontSize: '14px',
                lineHeight: '1.7',
                whiteSpace: 'pre-line'
              }}>
                {job.requirements}
              </div>
            </div>

            {/* Required IBC Skills */}
            {job.skills?.length > 0 && (
              <div style={{ marginBottom: '36px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>
                  Target Competencies & Registrations
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {job.skills.map((s) => (
                    <Tag
                      key={s.skill?.id || s.skillId}
                      style={{
                        padding: '6px 14px',
                        fontSize: '13px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.2)'
                      }}
                    >
                      {s.skill?.name || 'Insolvency'}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Apply Action Bar */}
            <div style={{
              paddingTop: '24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                  Interested in this Insolvency & Restructuring assignment?
                </span>
              </div>

              {appliedStatus ? (
                <Tag 
                  color={appliedStatus === 'SHORTLISTED' ? 'purple' : 'cyan'} 
                  icon={<CheckCircleOutlined />}
                  style={{ padding: '8px 18px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }}
                >
                  Application Status: {appliedStatus}
                </Tag>
              ) : (
                <button
                  className="portal-btn-primary"
                  style={{ padding: '12px 32px', fontSize: '15px' }}
                  onClick={handleOpenApplyModal}
                >
                  Apply for this Mandate
                </button>
              )}
            </div>
          </motion.div>

          {/* Right Sidebar: About Organisation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="portal-glass-card" style={{ padding: '28px' }}>
              <h3 style={{ color: 'white', fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BankOutlined style={{ color: '#38bdf8' }} /> About the Organisation
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#38bdf8',
                  fontSize: '16px',
                  fontWeight: 700
                }}>
                  {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                </div>
                <div>
                  <div style={{ color: 'white', fontWeight: 600, fontSize: '15px' }}>
                    {job.employer?.name}
                  </div>
                  <Tag color="purple" style={{ borderRadius: '4px', fontSize: '11px', marginTop: '2px' }}>
                    {job.employer?.type || 'VERIFIED ENTITY'}
                  </Tag>
                </div>
              </div>

              {job.employer?.description && (
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                  {job.employer.description}
                </p>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#cbd5e1', marginBottom: '20px' }}>
                {job.employer?.location && (
                  <div>
                    <EnvironmentOutlined style={{ color: '#38bdf8', marginRight: '8px' }} />
                    {job.employer.location}
                  </div>
                )}
                {job.employer?.website && (
                  <div>
                    <GlobalOutlined style={{ color: '#38bdf8', marginRight: '8px' }} />
                    <a href={job.employer.website} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                      {job.employer.website}
                    </a>
                  </div>
                )}
              </div>

              <Link to={`/companies/${job.employer?.id}`} style={{ display: 'block' }}>
                <Button block style={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
                  View Organisation Profile ↗
                </Button>
              </Link>
            </div>

            {/* Quick Safety / IBC compliance note */}
            <div className="portal-glass-card" style={{ padding: '24px' }}>
              <h4 style={{ color: 'white', fontSize: '14px', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <SafetyCertificateOutlined style={{ color: '#10b981' }} /> Verified Mandate
              </h4>
              <p style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5', margin: 0 }}>
                This assignment is verified for IBC 2016 statutory guidelines. Recruiters directly receive candidate IBBI registration and credentials.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* Apply Modal */}
      <Modal
        title={`Apply for ${job.title}`}
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setApplyModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={submittingApply} 
            onClick={handleConfirmApply}
            style={{ background: '#0ea5e9' }}
          >
            Submit Application
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Organisation: <strong>{job.employer?.name}</strong>
          </p>
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              Cover Note & Insolvency Experience Summary (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant CIRP, liquidation, resolution plan, or forensic assignments..."
              style={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(56, 189, 248, 0.08)', padding: '10px 12px', borderRadius: '8px', marginTop: '12px' }}>
            ℹ️ Your profile details and active resume will be submitted to the recruiter.
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default JobDetails;

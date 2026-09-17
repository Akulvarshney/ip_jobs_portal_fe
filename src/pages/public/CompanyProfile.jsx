import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Tag, 
  Divider, 
  Spin, 
  Row, 
  Col, 
  Breadcrumb, 
  message,
  Modal,
  Input
} from 'antd';
import { 
  BankOutlined, 
  GlobalOutlined, 
  EnvironmentOutlined, 
  RocketOutlined, 
  CheckCircleOutlined, 
  TeamOutlined, 
  CalendarOutlined,
  EyeOutlined,
  SendOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { applyToJob } from '../../store/candidateSlice';
import api from '../../api';

const CompanyProfile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/jobs/company/${id}`);
      if (res.data?.success) {
        setCompany(res.data.data);
      }
    } catch (error) {
      console.error('Error loading company profile:', error);
      message.error('Failed to load organisation profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanyDetails();
  }, [id]);

  const handleOpenApplyModal = (job) => {
    if (!isAuthenticated) {
      message.info('Please log in or sign up to apply');
      return navigate('/login?mode=signup');
    }
    if (user?.role !== 'CANDIDATE') {
      message.warning('Only candidate accounts can apply to mandates');
      return;
    }
    setSelectedJobForApply(job);
    setCoverNote('');
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedJobForApply) return;
    try {
      setSubmittingApply(true);
      await dispatch(applyToJob({
        jobId: selectedJobForApply.id,
        coverNote
      })).unwrap();
      message.success('Application submitted successfully!');
      setApplyModalOpen(false);
      fetchCompanyDetails();
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to submit application');
    } finally {
      setSubmittingApply(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="portal-page-wrapper">
        <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <h2 style={{ color: 'white' }}>Organisation Not Found</h2>
          <p style={{ color: '#9ca3af' }}>The company profile you are searching for does not exist.</p>
          <Link to="/jobs">
            <Button type="primary">Explore Mandates Directory</Button>
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
              { title: <Link to="/jobs" style={{ color: '#9ca3af' }}>Organisations</Link> },
              { title: <span style={{ color: '#38bdf8' }}>{company.name}</span> }
            ]}
          />
        </div>

        {/* Company Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card"
          style={{
            padding: '36px',
            marginBottom: '32px',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25), rgba(56, 189, 248, 0.15))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7',
                fontSize: '32px',
                fontWeight: 700,
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
              }}>
                {company.name ? company.name.substring(0, 2).toUpperCase() : 'CO'}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <Tag color="purple" style={{ borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
                    {company.type || 'IPE'}
                  </Tag>
                  <Tag color="green" icon={<CheckCircleOutlined />} style={{ borderRadius: '6px', fontSize: '12px' }}>
                    Verified Employer
                  </Tag>
                </div>
                <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'white', margin: 0 }}>
                  {company.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', color: '#cbd5e1', fontSize: '14px' }}>
                  {company.location && (
                    <span>
                      <EnvironmentOutlined style={{ color: '#38bdf8', marginRight: '6px' }} />
                      {company.location}
                    </span>
                  )}
                  {company.website && (
                    <span>
                      <GlobalOutlined style={{ color: '#38bdf8', marginRight: '6px' }} />
                      <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                        {company.website}
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '14px',
              padding: '16px 24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#38bdf8' }}>
                {company.jobs?.length || 0}
              </div>
              <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>
                Active Mandates
              </div>
            </div>
          </div>

          {company.description && (
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                About the Practice
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7', margin: 0, whiteSpace: 'pre-line' }}>
                {company.description}
              </p>
            </div>
          )}
        </motion.div>

        {/* Open Jobs Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'white', margin: 0 }}>
                Open Mandates & Opportunities ({company.jobs?.length || 0})
              </h2>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>
                Direct job openings posted by {company.name}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
            {company.jobs?.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -4 }}
                className="portal-glass-card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <Tag color="cyan" style={{ borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                      Active Role
                    </Tag>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: '0 0 10px' }}>
                    {job.title}
                  </h3>

                  <p style={{
                    color: '#94a3b8',
                    fontSize: '13px',
                    lineHeight: '1.5',
                    marginBottom: '16px',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {job.description}
                  </p>

                  {job.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                      {job.skills.slice(0, 3).map((s) => (
                        <Tag key={s.skill?.id || s.skillId} style={{ borderRadius: '6px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: 'none' }}>
                          {s.skill?.name}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Link to={`/jobs/${job.id}`} style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>
                    View Mandate ↗
                  </Link>

                  <button
                    className="portal-btn-primary"
                    style={{ padding: '7px 16px', fontSize: '13px' }}
                    onClick={() => handleOpenApplyModal(job)}
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {(!company.jobs || company.jobs.length === 0) && (
            <div className="portal-glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <RocketOutlined style={{ fontSize: '48px', color: '#38bdf8', marginBottom: '16px', opacity: 0.6 }} />
              <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>No active mandates right now</h3>
              <p style={{ color: '#9ca3af', marginTop: '8px' }}>Check back later for new openings posted by this organisation.</p>
            </div>
          )}
        </div>

      </div>

      {/* Apply Modal */}
      <Modal
        title={`Apply for ${selectedJobForApply?.title || 'Mandate'}`}
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
            Organisation: <strong>{company.name}</strong>
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

export default CompanyProfile;

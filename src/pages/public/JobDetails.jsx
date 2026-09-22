import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Tag, 
  Divider, 
  Modal, 
  Input, 
  message, 
  Spin, 
  Breadcrumb 
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
  ClockCircleOutlined, 
  UserOutlined, 
  GlobalOutlined, 
  SafetyCertificateOutlined 
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../../store/jobsSlice';
import { fetchSavedJobs, fetchCandidateApplications, toggleSaveJob, applyToJob } from '../../store/candidateSlice';
import { getJobTypeLabel, getJobTypeColor, getSalaryRangeLabel, getExperienceLevelLabel } from '../../utils/jobType';

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
      <div className="portal-page-wrapper portal-loading-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="portal-page-wrapper">
        <div className="portal-not-found-box">
          <h2 className="portal-not-found-title">Mandate Not Found</h2>
          <p className="portal-not-found-desc">The job posting you are looking for may have been closed or removed.</p>
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

      <div className="portal-public-container-1240">
        
        {/* Breadcrumb Navigation */}
        <div className="portal-mb-24">
          <Breadcrumb
            items={[
              { title: <Link to="/" className="portal-color-muted">Home</Link> },
              { title: <Link to="/jobs" className="portal-color-muted">Mandates</Link> },
              { title: <span className="portal-color-link">{job.title}</span> }
            ]}
          />
        </div>

        <div className="portal-details-layout">
          
          {/* Main Job Details Card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="portal-glass-card portal-details-main-card"
          >
            {/* Header / Org */}
            <div className="portal-details-header-flex">
              <div className="portal-details-avatar-group">
                <div className="portal-details-avatar-box">
                  {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                </div>
                <div>
                  <div className="portal-details-tags-row">
                    <Tag color="cyan" className="portal-tag-pill-11">
                      {job.employer?.type || 'VERIFIED ENTITY'}
                    </Tag>
                    <Tag color={getJobTypeColor(job.jobType)} className="portal-tag-pill-11">
                      {getJobTypeLabel(job.jobType)}
                    </Tag>
                    <Tag color="geekblue" className="portal-tag-pill-11">
                      {getExperienceLevelLabel(job.experienceLevel)}
                    </Tag>
                  </div>
                  <h1 className="portal-details-title">
                    {job.title}
                  </h1>
                  <Link to={`/companies/${job.employer?.id}`} className="portal-details-company-link">
                    {job.employer?.name || 'Insolvency Entity'} ↗
                  </Link>
                </div>
              </div>

              <div className="portal-details-actions-row">
                <button
                  onClick={handleToggleSave}
                  className={`portal-btn-bookmark ${isSaved ? 'portal-btn-bookmark-saved' : 'portal-btn-bookmark-unsaved'}`}
                  aria-label="Save Job"
                >
                  {isSaved ? <HeartFilled /> : <HeartOutlined />}
                </button>

                <Button
                  icon={<ShareAltOutlined />}
                  onClick={handleCopyLink}
                  className="portal-btn-share"
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Quick Metadata Highlights */}
            <div className="portal-details-meta-grid">
              <div>
                <div className="portal-details-meta-label">Job Type</div>
                <div className="portal-details-meta-val">
                  <ClockCircleOutlined className="portal-details-meta-icon" />
                  {getJobTypeLabel(job.jobType)}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-label">Experience</div>
                <div className="portal-details-meta-val">
                  <UserOutlined className="portal-details-meta-icon" />
                  {getExperienceLevelLabel(job.experienceLevel)}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-label">Salary / Bracket</div>
                <div className="portal-details-meta-val-success">
                  <DollarOutlined className="portal-details-meta-icon-success" />
                  {getSalaryRangeLabel(job.salaryRange)}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-label">Location / Bench</div>
                <div className="portal-details-meta-val">
                  <EnvironmentOutlined className="portal-details-meta-icon" />
                  {job.employer?.location || 'India'}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-label">Posted Date</div>
                <div className="portal-details-meta-val">
                  <CalendarOutlined className="portal-details-meta-icon" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-label">Status</div>
                <div className="portal-details-meta-val-status">
                  ● Active Accepting Applications
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="portal-mb-32">
              <h2 className="portal-details-section-title">
                Mandate Overview & Scope
              </h2>
              <div className="portal-details-desc-content">
                {job.description}
              </div>
            </div>

            <Divider className="portal-legal-divider" />

            {/* Requirements & Compliance */}
            <div className="portal-mb-32">
              <h2 className="portal-details-section-title">
                Key Responsibilities & Eligibility
              </h2>
              <div className="portal-details-requirements-box">
                {job.requirements}
              </div>
            </div>

            {/* Required IBC Skills */}
            {job.skills?.length > 0 && (
              <div className="portal-mb-36">
                <h2 className="portal-details-section-title">
                  Target Competencies & Registrations
                </h2>
                <div className="portal-details-skills-row">
                  {job.skills.map((s) => (
                    <Tag
                      key={s.skill?.id || s.skillId}
                      className="portal-details-skill-tag"
                    >
                      {s.skill?.name || 'Insolvency'}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Apply Action Bar */}
            <div className="portal-details-footer-bar">
              <div>
                <span className="portal-details-footer-note">
                  Interested in this Insolvency & Restructuring assignment?
                </span>
              </div>

              {appliedStatus ? (
                <Tag 
                  color={appliedStatus === 'SHORTLISTED' ? 'purple' : 'cyan'} 
                  icon={<CheckCircleOutlined />}
                  className="portal-details-status-tag"
                >
                  Application Status: {appliedStatus}
                </Tag>
              ) : (
                <button
                  className="portal-btn-primary portal-btn-apply-mandate"
                  onClick={handleOpenApplyModal}
                >
                  Apply for this Mandate
                </button>
              )}
            </div>
          </motion.div>

          {/* Right Sidebar: About Organisation */}
          <div className="portal-details-sidebar">
            
            <div className="portal-glass-card portal-details-org-card">
              <h3 className="portal-details-org-title">
                <BankOutlined className="portal-company-meta-icon" /> About the Organisation
              </h3>

              <div className="portal-details-org-header">
                <div className="portal-details-org-logo">
                  {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                </div>
                <div>
                  <div className="portal-details-org-name">
                    {job.employer?.name}
                  </div>
                  <Tag color="purple" className="portal-details-org-tag">
                    {job.employer?.type || 'VERIFIED ENTITY'}
                  </Tag>
                </div>
              </div>

              {job.employer?.description && (
                <p className="portal-details-org-desc">
                  {job.employer.description}
                </p>
              )}

              <div className="portal-details-org-meta-list">
                {job.employer?.location && (
                  <div>
                    <EnvironmentOutlined className="portal-company-meta-icon" />
                    {job.employer.location}
                  </div>
                )}
                {job.employer?.website && (
                  <div>
                    <GlobalOutlined className="portal-company-meta-icon" />
                    <a 
                      href={job.employer.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="portal-company-meta-link"
                    >
                      {job.employer.website}
                    </a>
                  </div>
                )}
              </div>

              <Link to={`/companies/${job.employer?.id}`} className="portal-block-link">
                <Button block className="portal-details-org-btn">
                  View Organisation Profile ↗
                </Button>
              </Link>
            </div>

            {/* Quick Safety / IBC compliance note */}
            <div className="portal-glass-card portal-details-safety-card">
              <h4 className="portal-details-safety-title">
                <SafetyCertificateOutlined className="portal-legal-icon-emerald" /> Verified Mandate
              </h4>
              <p className="portal-details-safety-desc">
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
            className="portal-btn-sky"
          >
            Submit Application
          </Button>,
        ]}
      >
        <div className="portal-apply-modal-body">
          <p className="portal-apply-modal-org">
            Organisation: <strong className="portal-legal-strong">{job.employer?.name}</strong>
          </p>
          <div className="portal-mt-16 portal-mb-8">
            <label className="portal-apply-modal-label">
              Cover Note & Insolvency Experience Summary (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant CIRP, liquidation, resolution plan, or forensic assignments..."
              className="portal-apply-modal-textarea"
            />
          </div>
          <div className="portal-apply-modal-note">
            ℹ️ Your profile details and active resume will be submitted to the recruiter.
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default JobDetails;

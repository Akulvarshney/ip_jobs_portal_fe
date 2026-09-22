import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Tag, 
  Spin, 
  Breadcrumb, 
  message,
  Modal,
  Input
} from 'antd';
import { 
  GlobalOutlined, 
  EnvironmentOutlined, 
  RocketOutlined, 
  CheckCircleOutlined, 
  DollarOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { applyToJob } from '../../store/candidateSlice';
import { getJobTypeLabel, getJobTypeColor, getSalaryRangeLabel, getExperienceLevelShortLabel } from '../../utils/jobType';
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
      <div className="portal-page-wrapper portal-loading-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="portal-page-wrapper">
        <div className="portal-not-found-box">
          <h2 className="portal-not-found-title">Organisation Not Found</h2>
          <p className="portal-not-found-desc">The company profile you are searching for does not exist.</p>
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

      <div className="portal-public-container-1240">
        
        {/* Breadcrumb Navigation */}
        <div className="portal-mb-24">
          <Breadcrumb
            items={[
              { title: <Link to="/" className="portal-color-muted">Home</Link> },
              { title: <Link to="/jobs" className="portal-color-muted">Organisations</Link> },
              { title: <span className="portal-color-link">{company.name}</span> }
            ]}
          />
        </div>

        {/* Company Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card portal-company-header-card"
        >
          <div className="portal-company-header-flex">
            <div className="portal-company-info-group">
              <div className="portal-company-avatar-box">
                {company.name ? company.name.substring(0, 2).toUpperCase() : 'CO'}
              </div>

              <div>
                <div className="portal-company-tags-row">
                  <Tag color="purple" className="portal-company-tag-pill">
                    {company.type || 'IPE'}
                  </Tag>
                  <Tag color="green" icon={<CheckCircleOutlined />} className="portal-company-tag-pill">
                    Verified Employer
                  </Tag>
                </div>
                <h1 className="portal-company-title">
                  {company.name}
                </h1>
                <div className="portal-company-meta-row">
                  {company.location && (
                    <span>
                      <EnvironmentOutlined className="portal-company-meta-icon" />
                      {company.location}
                    </span>
                  )}
                  {company.website && (
                    <span>
                      <GlobalOutlined className="portal-company-meta-icon" />
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="portal-company-meta-link"
                      >
                        {company.website}
                      </a>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="portal-company-stat-box">
              <div className="portal-company-stat-val">
                {company.jobs?.length || 0}
              </div>
              <div className="portal-company-stat-label">
                Active Mandates
              </div>
            </div>
          </div>

          {company.description && (
            <div className="portal-company-desc-box">
              <h3 className="portal-company-desc-title">
                About the Practice
              </h3>
              <p className="portal-company-desc-para">
                {company.description}
              </p>
            </div>
          )}
        </motion.div>

        {/* Open Jobs Section */}
        <div>
          <div className="portal-company-jobs-header">
            <div>
              <h2 className="portal-company-jobs-title">
                Open Mandates & Opportunities ({company.jobs?.length || 0})
              </h2>
              <p className="portal-company-jobs-subtitle">
                Direct job openings posted by {company.name}
              </p>
            </div>
          </div>

          <div className="portal-company-jobs-grid">
            {company.jobs?.map((job) => (
              <motion.div
                key={job.id}
                whileHover={{ y: -4 }}
                className="portal-glass-card portal-company-job-card"
              >
                <div>
                  <div className="portal-company-job-header">
                    <div className="portal-company-job-tags">
                      <Tag color="cyan" className="portal-tag-pill-11">
                        Active Role
                      </Tag>
                      <Tag color={getJobTypeColor(job.jobType)} className="portal-tag-pill-11">
                        {getJobTypeLabel(job.jobType)}
                      </Tag>
                      <Tag className="portal-tag-exp">
                        {getExperienceLevelShortLabel(job.experienceLevel)}
                      </Tag>
                    </div>
                    <span className="portal-company-job-date">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="portal-company-job-title">
                    {job.title}
                  </h3>

                  <div className="portal-company-job-salary">
                    <DollarOutlined /> {getSalaryRangeLabel(job.salaryRange)}
                  </div>

                  <p className="portal-company-job-desc">
                    {job.description}
                  </p>

                  {job.skills?.length > 0 && (
                    <div className="portal-company-skills-row">
                      {job.skills.slice(0, 3).map((s) => (
                        <Tag key={s.skill?.id || s.skillId} className="portal-company-skill-tag">
                          {s.skill?.name}
                        </Tag>
                      ))}
                    </div>
                  )}
                </div>

                <div className="portal-company-job-footer">
                  <Link to={`/jobs/${job.id}`} className="portal-company-view-link">
                    View Mandate ↗
                  </Link>

                  <button
                    className="portal-btn-primary portal-company-apply-btn"
                    onClick={() => handleOpenApplyModal(job)}
                  >
                    Apply Now
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {(!company.jobs || company.jobs.length === 0) && (
            <div className="portal-glass-card portal-company-empty-box">
              <RocketOutlined className="portal-company-empty-icon" />
              <h3 className="portal-company-empty-title">No active mandates right now</h3>
              <p className="portal-company-empty-desc">Check back later for new openings posted by this organisation.</p>
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
            className="portal-btn-sky"
          >
            Submit Application
          </Button>,
        ]}
      >
        <div className="portal-apply-modal-body">
          <p className="portal-apply-modal-org">
            Organisation: <strong className="portal-legal-strong">{company.name}</strong>
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

export default CompanyProfile;

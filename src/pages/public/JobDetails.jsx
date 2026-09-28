import React, { useState, useEffect } from 'react';
import { getFileUrl } from "../../utils/fileUrl";
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
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById, fetchAllJobs } from '../../store/jobsSlice';
import { fetchSavedJobs, fetchCandidateApplications, toggleSaveJob, applyToJob } from '../../store/candidateSlice';
import { getJobTypeLabel, getJobTypeColor, getSalaryRangeLabel, getExperienceLevelLabel } from '../../utils/jobType';

const JobDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [appliedStatus, setAppliedStatus] = useState(null);
  const [appliedJobsMap, setAppliedJobsMap] = useState({});

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { jobsList } = useSelector((state) => state.jobs);

  const loadJobData = async () => {
    try {
      setLoading(true);
      const jobData = await dispatch(fetchJobById(id)).unwrap();
      setJob(jobData);

      if (!jobsList || jobsList.length === 0) {
        dispatch(fetchAllJobs());
      }

      if (isAuthenticated && user?.role === 'CANDIDATE') {
        const [savedRes, appsRes] = await Promise.all([
          dispatch(fetchSavedJobs()).unwrap().catch(() => []),
          dispatch(fetchCandidateApplications()).unwrap().catch(() => [])
        ]);

        const savedList = Array.isArray(savedRes) ? savedRes : savedRes?.data || [];
        const found = savedList.some(s => (s.jobId || s.job?.id || s.id) === Number(id));
        setIsSaved(found);

        const appsList = Array.isArray(appsRes) ? appsRes : appsRes?.data || [];

        const appMap = {};
        appsList.forEach(a => {
          appMap[a.jobId || a.job?.id] = a.status;
        });
        setAppliedJobsMap(appMap);

        const app = appsList.find(a => (a.jobId || a.job?.id) === Number(id));
        if (app) setAppliedStatus(app.status);
      }
    } catch (error) {
      console.error('Error fetching job details:', error);
      message.error('Failed to load job details');
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
      return navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
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
      return navigate(`/login?mode=signup&redirect=${encodeURIComponent(location.pathname)}`);
    }
    if (user?.role !== 'CANDIDATE') {
      message.warning('Only candidate accounts can apply to jobs');
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
    message.success('Job link copied to clipboard!');
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
          <h2 className="portal-not-found-title">Job Not Found</h2>
          <p className="portal-not-found-desc">The job posting you are looking for may have been closed or removed.</p>
          <Link to="/candidate/jobs">
            <Button type="primary">Back to Jobs Directory</Button>
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
              { title: <Link to="/candidate/jobs" className="portal-color-muted">Jobs</Link> },
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
                  {job.employer?.logoUrl ? <img src={getFileUrl(job.employer?.logoUrl)} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : (job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : "CO")}
                </div>
                <div>
                  {/* <div className="portal-details-tags-row">
                    <Tag color="cyan" className="portal-tag-pill-11">
                      {job.employer?.type || 'VERIFIED ENTITY'}
                    </Tag>
                    <Tag color={getJobTypeColor(job.jobType)} className="portal-tag-pill-11">
                      {getJobTypeLabel(job.jobType)}
                    </Tag>
                    <Tag color="geekblue" className="portal-tag-pill-11">
                      {getExperienceLevelLabel(job.experienceLevel)}
                    </Tag>
                  </div> */}
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

                </Button>

                {appliedStatus ? (
                  <Tag
                    color={appliedStatus === 'SHORTLISTED' ? 'purple' : 'cyan'}
                    icon={<CheckCircleOutlined />}
                    className="portal-details-status-tag"
                  >
                    {appliedStatus}
                  </Tag>
                ) : (
                  <button
                    className="portal-btn-primary portal-btn-apply-job"
                    onClick={handleOpenApplyModal}
                  >
                    Apply for this Job
                  </button>
                )}
              </div>
            </div>

            {/* Quick Metadata Highlights */}
            <div className="portal-details-meta-grid">
              <div>
                <div className="portal-details-meta-val">
                  <ClockCircleOutlined className="portal-details-meta-icon" />
                  {getJobTypeLabel(job.jobType)}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-val">
                  <UserOutlined className="portal-details-meta-icon" />
                  {getExperienceLevelLabel(job.experienceLevel)}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-val-success">
                  <DollarOutlined className="portal-details-meta-icon-success" />
                  {getSalaryRangeLabel(job.salaryRange)}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-val">
                  <EnvironmentOutlined className="portal-details-meta-icon" />
                  {job.employer?.location || 'India'}
                </div>
              </div>

              <div>
                <div className="portal-details-meta-val">
                  <CalendarOutlined className="portal-details-meta-icon" />
                  {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>

            </div>

            {/* Job Description */}
            <div className="portal-mb-32">
              <h2 className="portal-details-section-title">
                Job Overview & Scope
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

            <Divider className="portal-legal-divider" />

            {/* About Organisation */}
            <div className="portal-mb-32">
              <h2 className="portal-details-section-title">
                About the Organisation
              </h2>

              <div className="portal-details-org-header">
                <div className="portal-details-org-logo">
                  {job.employer?.logoUrl ? <img src={getFileUrl(job.employer?.logoUrl)} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : (job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : "CO")}
                </div>
                <div>
                  <Link to={`/companies/${job.employer?.id}`} className="portal-block-link">
                    <div className="portal-details-org-name">
                      {job.employer?.name}
                    </div>

                    <Tag color="blue" className="portal-details-org-tag">
                      {job.employer?.type || 'VERIFIED ENTITY'}
                    </Tag>
                  </Link>



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


            </div>

          </motion.div>

          {/* Right Sidebar: Recommended Jobs */}
          <div className="portal-details-sidebar">
            <div className="portal-glass-card portal-recommended-jobs-card">
              <h3 className="portal-details-section-title portal-recommended-jobs-title">
                Recommended Jobs for You
              </h3>
              <div className="portal-flex-col-gap-14">
                {(() => {
                  const stored = JSON.parse(localStorage.getItem('portal_job_filters') || '{}');
                  const dbStored = user?.savedFilters || stored;

                  const searchKeyword = dbStored.searchKeyword || '';
                  const selectedLocation = dbStored.selectedLocation;
                  const selectedCategory = dbStored.selectedCategory;
                  const selectedOrgType = dbStored.selectedOrgType;
                  const selectedJobType = dbStored.selectedJobType;
                  const selectedSalaryRange = dbStored.selectedSalaryRange;
                  const selectedExpLevel = dbStored.selectedExpLevel;

                  const filteredRecommendations = (jobsList || []).filter(j => {
                    if (j.id === Number(id)) return false;

                    if (appliedJobsMap[j.id]) return false;

                    const matchesKeyword = !searchKeyword ||
                      j.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      j.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      j.requirements?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                      (j.employer?.name && j.employer.name.toLowerCase().includes(searchKeyword.toLowerCase()));

                    const matchesLocation = !selectedLocation ||
                      (j.employer?.location && j.employer.location.toLowerCase().includes(selectedLocation.toLowerCase()));

                    const matchesCategory = !selectedCategory ||
                      j.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                      j.requirements?.toLowerCase().includes(selectedCategory.toLowerCase());

                    const matchesOrgType = !selectedOrgType ||
                      j.employer?.type === selectedOrgType;

                    const matchesJobType = !selectedJobType || j.jobType === selectedJobType;
                    const matchesSalary = !selectedSalaryRange || j.salaryRange === selectedSalaryRange;
                    const matchesExp = !selectedExpLevel || j.experienceLevel === selectedExpLevel;

                    return matchesKeyword && matchesLocation && matchesCategory && matchesOrgType && matchesJobType && matchesSalary && matchesExp;
                  });

                  return (
                    <>
                      {filteredRecommendations.slice(0, 3).map((recommendedJob, index, array) => (
                        <React.Fragment key={recommendedJob.id}>
                          <div className="portal-recommended-job-item">
                            <div className="portal-card-heading portal-recommended-job-heading">
                              <Link to={`/jobs/${recommendedJob.id}`} target="_blank" rel="noopener noreferrer" className="portal-color-link">
                                {recommendedJob.title}
                              </Link>
                            </div>
                            <div className="portal-card-meta portal-flex-center-gap-8 portal-recommended-job-meta">
                              <span>{recommendedJob.employer?.name || 'Insolvency Entity'}</span>
                              <span>•</span>
                              <span className="portal-color-cyan"><DollarOutlined /> {getSalaryRangeLabel(recommendedJob.salaryRange)}</span>
                            </div>
                          </div>
                          {index < array.length - 1 && <Divider className="portal-recommended-job-divider" />}
                        </React.Fragment>
                      ))}
                      {filteredRecommendations.length === 0 && (
                        <p className="portal-color-muted">No recommended jobs found.</p>
                      )}
                    </>
                  );
                })()}
              </div>
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

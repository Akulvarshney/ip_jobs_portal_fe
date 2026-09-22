import React, { useEffect, useState } from 'react';
import { Card, Button, Typography, Tag, Progress, message, Tooltip, Badge, Modal, Input } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidateStats, toggleSaveJob, applyToJob } from '../store/candidateSlice';
import {
  SendOutlined,
  CheckCircleOutlined,
  CalendarOutlined,
  BookOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  RocketOutlined,
  VideoCameraOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  PlusOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { getJobTypeLabel, getJobTypeColor, getSalaryRangeLabel, getExperienceLevelShortLabel } from '../utils/jobType';

const { Title, Text, Paragraph } = Typography;

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { stats: reduxStats, loading } = useSelector((state) => state.candidate);

  const [applyModalVisible, setApplyModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);
  const [savedStatus, setSavedStatus] = useState({});
  const [appliedStatus, setAppliedStatus] = useState({});

  const loadData = async () => {
    try {
      const res = await dispatch(fetchCandidateStats()).unwrap();
      if (res) {
        const savedMap = {};
        const appliedMap = {};
        res.recommendedJobs?.forEach(j => {
          if (j.savedBy?.length > 0) savedMap[j.id] = true;
          if (j.applications?.length > 0) appliedMap[j.id] = true;
        });
        setSavedStatus(savedMap);
        setAppliedStatus(appliedMap);
      }
    } catch (error) {
      console.error('Failed to load candidate dashboard stats:', error);
      message.error('Failed to load dashboard data');
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setCoverNote('');
    setApplyModalVisible(true);
  };

  const submitApplication = async () => {
    if (!selectedJob) return;
    try {
      setApplying(true);
      await dispatch(applyToJob({ jobId: selectedJob.id, coverNote })).unwrap();
      message.success('Application submitted successfully!');
      setAppliedStatus(prev => ({ ...prev, [selectedJob.id]: true }));
      setApplyModalVisible(false);
      loadData();
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    try {
      const res = await dispatch(toggleSaveJob(jobId)).unwrap();
      setSavedStatus(prev => ({ ...prev, [jobId]: res.isSaved }));
      message.success(res.message || 'Bookmark updated');
      loadData();
    } catch (error) {
      message.error('Failed to update bookmark');
    }
  };

  const data = reduxStats;

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return '#38bdf8';
      case 'SHORTLISTED': return '#a855f7';
      case 'INTERVIEW': return '#eab308';
      case 'SELECTED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'WITHDRAWN': return 'var(--theme-placeholder)';
      default: return 'var(--theme-muted)';
    }
  };

  const stats = data?.stats || {
    applications: 0,
    shortlisted: 0,
    interviews: 0,
    savedJobs: 0,
    profileCompleteness: 0
  };

  const completeness = data?.completenessDetails || data?.profile?.completeness || null;
  const nextMissingItem = completeness?.missingItems?.[0] || null;

  return (
    <div className="portal-w-full portal-m-0 portal-p-0">
      {/* Header Greeting & Profile Progress Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="portal-cand-hero-banner"
      >
        <div>
          <div className="portal-flex-center-gap-10 portal-mb-8">
            <span className="portal-cand-tag-label">
              Candidate Portal
            </span>
            <Tag color="cyan" className="portal-completeness-tag portal-text-11">
              {data?.profile?.professionalCategory || 'Insolvency & Restructuring Professional'}
            </Tag>
          </div>
          <h1 className="portal-page-title">
            Welcome back, {user?.name || 'Professional'} 👋
          </h1>
          <p className="portal-page-subtitle">
            Track your Insolvency & Bankruptcy mandates, interview schedules, and employer requests.
          </p>
        </div>

        <div className="portal-cand-completeness-box">
          <div className="portal-flex-between-center portal-mb-8">
            <span className="portal-form-label portal-text-13">Profile Completeness</span>
            <span className={`portal-font-bold portal-text-14 ${stats.profileCompleteness === 100 ? 'portal-color-success' : 'portal-color-cyan'}`}>
              {stats.profileCompleteness}%
            </span>
          </div>
          <Progress
            percent={stats.profileCompleteness}
            showInfo={false}
            strokeColor={stats.profileCompleteness === 100 ? '#10b981' : { '0%': '#0ea5e9', '100%': '#38bdf8' }}
            trailColor="rgba(var(--theme-contrast-rgb), 0.1)"
          />
          <div className="portal-flex-between-center portal-mt-10 portal-gap-8">
            {stats.profileCompleteness === 100 ? (
              <span className="portal-color-success portal-text-12 portal-font-medium">
                ✓ Profile 100% Complete
              </span>
            ) : nextMissingItem ? (
              <Link to={nextMissingItem.route || '/candidate/profile'} className="portal-tag-link portal-text-12 portal-font-medium">
                + {nextMissingItem.label} (+{nextMissingItem.points - (nextMissingItem.earned || 0)}%)
              </Link>
            ) : (
              <Link to="/candidate/profile" className="portal-tag-link portal-text-12 portal-font-medium">
                + Add Experience / Skills
              </Link>
            )}
            <Link to="/candidate/profile" className="portal-text-subtle-12">
              Edit Profile →
            </Link>
          </div>
        </div>
      </motion.div>

      {/* 4 Stat Cards as defined in ProductMap 4.1 */}
      <div className="portal-cards-grid portal-mb-36">
        {/* Applications */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => navigate('/candidate/applications')}
          className="portal-glass-card portal-p-24 portal-cursor-pointer portal-border-cyan-20"
        >
          <div className="portal-flex-between-center portal-mb-16">
            <span className="portal-card-meta portal-text-14">Applications</span>
            <div className="portal-cand-stat-icon-wrap cyan">
              <SendOutlined />
            </div>
          </div>
          <div className="portal-cand-stat-num">{stats.applications}</div>
          <div className="portal-cand-stat-footer portal-color-link">
            <span>View all submitted</span> <ArrowRightOutlined className="portal-icon-11" />
          </div>
        </motion.div>

        {/* Shortlisted */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => navigate('/candidate/applications?status=SHORTLISTED')}
          className="portal-glass-card portal-p-24 portal-cursor-pointer portal-border-purple-20"
        >
          <div className="portal-flex-between-center portal-mb-16">
            <span className="portal-card-meta portal-text-14">Shortlisted</span>
            <div className="portal-cand-stat-icon-wrap purple">
              <CheckCircleOutlined />
            </div>
          </div>
          <div className="portal-cand-stat-num">{stats.shortlisted}</div>
          <div className="portal-cand-stat-footer portal-color-purple">
            <span>Recruiter interest</span> <ArrowRightOutlined className="portal-icon-11" />
          </div>
        </motion.div>

        {/* Interviews */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => navigate('/candidate/interviews')}
          className="portal-glass-card portal-p-24 portal-cursor-pointer portal-border-gold-20"
        >
          <div className="portal-flex-between-center portal-mb-16">
            <span className="portal-card-meta portal-text-14">Interviews</span>
            <div className="portal-cand-stat-icon-wrap gold">
              <CalendarOutlined />
            </div>
          </div>
          <div className="portal-cand-stat-num">{stats.interviews}</div>
          <div className="portal-cand-stat-footer portal-color-gold">
            <span>Scheduled meetings</span> <ArrowRightOutlined className="portal-icon-11" />
          </div>
        </motion.div>

        {/* Saved Jobs */}
        <motion.div
          whileHover={{ y: -4 }}
          onClick={() => navigate('/candidate/saved-jobs')}
          className="portal-glass-card portal-p-24 portal-cursor-pointer portal-border-green-20"
        >
          <div className="portal-flex-between-center portal-mb-16">
            <span className="portal-card-meta portal-text-14">Saved Jobs</span>
            <div className="portal-cand-stat-icon-wrap green">
              <BookOutlined />
            </div>
          </div>
          <div className="portal-cand-stat-num">{stats.savedJobs}</div>
          <div className="portal-cand-stat-footer portal-color-success">
            <span>Bookmarked roles</span> <ArrowRightOutlined className="portal-icon-11" />
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid: Left (Recent Applications & Jobs), Right (Upcoming Interviews & Quick Links) */}
      <div className="portal-dashboard-2col-layout">

        {/* Left Column */}
        <div className="portal-flex-col-gap-32">

          {/* Recent Applications Section */}
          <div className="portal-glass-card portal-p-28">
            <div className="portal-flex-between-center portal-mb-20">
              <div>
                <h2 className="portal-section-title">Recent Applications</h2>
                <p className="portal-section-desc">Latest updates on your job applications</p>
              </div>
              <Link to="/candidate/applications">
                <Button type="link" className="portal-tag-link portal-p-0">View All</Button>
              </Link>
            </div>

            {data?.recentApplications?.length > 0 ? (
              <div className="portal-flex-col-gap-14">
                {data.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="portal-cand-app-card"
                  >
                    <div className="portal-flex-center-gap-14">
                      <div className="portal-cand-app-avatar">
                        {app.job?.employer?.name ? app.job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <div>
                        <div className="portal-card-heading">{app.job?.title}</div>
                        <div className="portal-card-meta">
                          {app.job?.employer?.name || 'Insolvency Firm'} • Applied {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="portal-flex-center-gap-12">
                      <Tag
                        className={`portal-status-badge ${app.status?.toLowerCase() || 'default'}`}
                      >
                        {app.status}
                      </Tag>
                      <Link to={`/jobs/${app.job?.id}`}>
                        <Button size="small" type="text" icon={<EyeOutlined />} className="portal-color-muted" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="portal-empty-card">
                <SendOutlined className="portal-empty-icon" />
                <p className="portal-m-0">You have not applied to any mandates yet.</p>
                <Link to="/candidate/jobs">
                  <Button type="primary" className="portal-btn-cyan portal-mt-12">Explore Mandates</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Recommended Open Mandates Section */}
          <div className="portal-glass-card portal-p-28">
            <div className="portal-flex-between-center portal-mb-20">
              <div>
                <h2 className="portal-section-title">Recommended For You</h2>
                <p className="portal-section-desc">Latest Insolvency, CIRP & Restructuring roles</p>
              </div>
              <Link to="/candidate/jobs">
                <Button type="link" className="portal-tag-link portal-p-0">Search All</Button>
              </Link>
            </div>

            {data?.recommendedJobs?.length > 0 ? (
              <div className="portal-cand-rec-jobs-grid">
                {data.recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="portal-cand-rec-job-card"
                  >
                    <div>
                      <div className="portal-flex-between-center portal-mb-12">
                        <div className="portal-flex-center-gap-6">
                          <div className="portal-employer-type-badge">
                            {job.employer?.type || 'VERIFIED'}
                          </div>
                          <Tag color={getJobTypeColor(job.jobType)} className="portal-tag-compact">
                            {getJobTypeLabel(job.jobType)}
                          </Tag>
                          <Tag className="portal-tag-compact portal-tag-exp">
                            {getExperienceLevelShortLabel(job.experienceLevel)}
                          </Tag>
                        </div>
                        <button
                          onClick={() => handleToggleSave(job.id)}
                          className={`portal-heart-btn ${savedStatus[job.id] ? 'active' : ''}`}
                        >
                          {savedStatus[job.id] ? <HeartFilled /> : <HeartOutlined />}
                        </button>
                      </div>

                      <h3 className="portal-card-heading portal-mb-6">
                        {job.title}
                      </h3>
                      <div className="portal-card-meta portal-flex-between-center portal-mb-10 portal-flex-wrap-gap-4">
                        <span>{job.employer?.name || 'Insolvency Entity'}</span>
                        <span className="portal-salary-badge">
                          <DollarOutlined /> {getSalaryRangeLabel(job.salaryRange)}
                        </span>
                      </div>

                      <div className="portal-flex-wrap-gap-8 portal-mb-16">
                        {job.skills?.slice(0, 3).map(s => (
                          <Tag key={s.skill?.id} className="portal-skill-badge">
                            {s.skill?.name}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    <div className="portal-flex-between-center portal-pt-12 portal-border-top-subtle">
                      <Link to={`/jobs/${job.id}`} className="portal-tag-link portal-text-13">
                        View Details
                      </Link>
                      {appliedStatus[job.id] ? (
                        <Tag color="cyan" icon={<CheckCircleOutlined />}>Applied</Tag>
                      ) : (
                        <button
                          className="portal-btn-primary portal-btn-compact-apply"
                          onClick={() => handleApplyClick(job)}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="portal-empty-card">
                <CheckCircleOutlined className="portal-empty-icon-green" />
                <p className="portal-empty-title">You're all caught up!</p>
                <p className="portal-empty-desc">You have applied to all current matching active mandates.</p>
                <Link to="/candidate/jobs">
                  <Button className="portal-btn-rounded-8">Browse All Mandates</Button>
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Right Column */}
        <div className="portal-flex-col-gap-32">

          {/* Upcoming Interviews Widget */}
          <div className="portal-glass-card portal-p-28">
            <div className="portal-flex-between-center portal-mb-18">
              <h2 className="portal-card-heading portal-text-18 portal-m-0">
                <CalendarOutlined className="portal-color-gold portal-mr-8" />
                Upcoming Interviews
              </h2>
              <Link to="/candidate/interviews" className="portal-tag-link portal-text-13">
                All
              </Link>
            </div>

            {data?.upcomingInterviews?.length > 0 ? (
              <div className="portal-flex-col-gap-14">
                {data.upcomingInterviews.map((interview) => (
                  <div
                    key={interview.id}
                    className="portal-cand-interview-card"
                  >
                    <div className="portal-flex-between-center portal-mb-8">
                      <div>
                        <div className="portal-card-heading portal-text-14">{interview.job?.title || 'Mandate Interview'}</div>
                        <div className="portal-card-meta portal-text-12">{interview.employer?.name}</div>
                      </div>
                      <Tag color="gold" className="portal-tag-compact">
                        {interview.interviewType}
                      </Tag>
                    </div>

                    <div className="portal-cand-interview-time-row">
                      <span>📅 {new Date(interview.interviewDate).toLocaleDateString()}</span>
                      <span>⏰ {interview.interviewTime || 'Scheduled'}</span>
                    </div>

                    {interview.meetingLink && (
                      <a
                        href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="portal-cand-join-meeting-btn"
                      >
                        <VideoCameraOutlined className="portal-mr-6" /> Join Meeting
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="portal-empty-card portal-p-24">
                <CalendarOutlined className="portal-empty-icon" />
                <p className="portal-empty-desc portal-m-0">No upcoming interviews scheduled right now.</p>
              </div>
            )}
          </div>

          {/* Candidate Quick Action Tools */}
          <div className="portal-glass-card portal-p-28">
            <h2 className="portal-section-title portal-mb-16">Candidate Toolkit</h2>

            <div className="portal-flex-col-gap-12">
              <Link
                to="/candidate/profile"
                className="portal-cand-toolkit-link"
              >
                <div className="portal-flex-center-gap-12">
                  <UserOutlined className="portal-color-link portal-text-16" />
                  <span className="portal-font-medium portal-text-14">Update Professional Profile</span>
                </div>
                <ArrowRightOutlined className="portal-icon-12 portal-color-muted" />
              </Link>

              <Link
                to="/candidate/profile?tab=resume"
                className="portal-cand-toolkit-link"
              >
                <div className="portal-flex-center-gap-12">
                  <FileTextOutlined className="portal-color-purple portal-text-16" />
                  <span className="portal-font-medium portal-text-14">Manage Resume Document</span>
                </div>
                <ArrowRightOutlined className="portal-icon-12 portal-color-muted" />
              </Link>

              <Link
                to="/candidate/jobs"
                className="portal-cand-toolkit-link"
              >
                <div className="portal-flex-center-gap-12">
                  <RocketOutlined className="portal-color-success portal-text-16" />
                  <span className="portal-font-medium portal-text-14">Search Insolvency Mandates</span>
                </div>
                <ArrowRightOutlined className="portal-icon-12 portal-color-muted" />
              </Link>
            </div>
          </div>

        </div>

      </div>

      {/* Quick Apply Modal */}
      <Modal
        title={`Apply for ${selectedJob?.title || 'Mandate'}`}
        open={applyModalVisible}
        onCancel={() => setApplyModalVisible(false)}
        footer={[
          <Button key="back" onClick={() => setApplyModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={applying}
            onClick={submitApplication}
            className="portal-btn-cyan"
          >
            Submit Application
          </Button>,
        ]}
      >
        <div className="portal-modal-inner">
          <p className="portal-card-meta portal-text-14">
            Applying to: <strong>{selectedJob?.employer?.name}</strong>
          </p>
          <div className="portal-mt-16 portal-mb-8">
            <label className="portal-form-label portal-block portal-text-13 portal-mb-6">
              Cover Note / Insolvency & Restructuring Experience Highlight (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="E.g. Highlight your CIRP matters, liquidation experience, NCLT appearances, or IBC advisory qualifications..."
              className="portal-modal-textarea"
            />
          </div>
          <div className="portal-cand-apply-info-box">
            ℹ️ Your profile details, education, IBC skills, and active resume will be shared with the recruiter.
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CandidateDashboard;

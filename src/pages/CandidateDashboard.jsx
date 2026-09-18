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
      case 'WITHDRAWN': return '#6b7280';
      default: return '#9ca3af';
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
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      {/* Header Greeting & Profile Progress Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '28px 32px',
          marginTop: 0,
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px', color: '#38bdf8', fontWeight: 600 }}>
              Candidate Portal
            </span>
            <Tag color="cyan" style={{ borderRadius: '12px', fontSize: '11px', padding: '0 8px' }}>
              {data?.profile?.professionalCategory || 'Insolvency & Restructuring Professional'}
            </Tag>
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
            Welcome back, {user?.name || 'Professional'} 👋
          </h1>
          <p style={{ color: '#9ca3af', marginTop: '6px', marginBottom: 0, fontSize: '15px' }}>
            Track your Insolvency & Bankruptcy mandates, interview schedules, and employer requests.
          </p>
        </div>

        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '16px 20px',
          borderRadius: '16px',
          minWidth: '280px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>Profile Completeness</span>
            <span style={{ 
              fontSize: '14px', 
              color: stats.profileCompleteness === 100 ? '#34d399' : '#38bdf8', 
              fontWeight: 700 
            }}>
              {stats.profileCompleteness}%
            </span>
          </div>
          <Progress 
            percent={stats.profileCompleteness} 
            showInfo={false} 
            strokeColor={stats.profileCompleteness === 100 ? '#10b981' : { '0%': '#0ea5e9', '100%': '#38bdf8' }} 
            trailColor="rgba(255, 255, 255, 0.1)"
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', gap: '8px' }}>
            {stats.profileCompleteness === 100 ? (
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 500 }}>
                ✓ Profile 100% Complete
              </span>
            ) : nextMissingItem ? (
              <Link to={nextMissingItem.route || '/candidate/profile'} style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 500 }}>
                + {nextMissingItem.label} (+{nextMissingItem.points - (nextMissingItem.earned || 0)}%)
              </Link>
            ) : (
              <Link to="/candidate/profile" style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 500 }}>
                + Add Experience / Skills
              </Link>
            )}
            <Link to="/candidate/profile" style={{ fontSize: '12px', color: '#94a3b8' }}>
              Edit Profile →
            </Link>
          </div>
        </div>
      </motion.div>

        {/* 4 Stat Cards as defined in ProductMap 4.1 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '36px'
        }}>
          {/* Applications */}
          <motion.div 
            whileHover={{ y: -4 }} 
            onClick={() => navigate('/candidate/applications')}
            className="portal-glass-card" 
            style={{ padding: '24px', cursor: 'pointer', border: '1px solid rgba(56, 189, 248, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>Applications</span>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '20px' }}>
                <SendOutlined />
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff' }}>{stats.applications}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#38bdf8', fontSize: '13px' }}>
              <span>View all submitted</span> <ArrowRightOutlined style={{ fontSize: '11px' }} />
            </div>
          </motion.div>

          {/* Shortlisted */}
          <motion.div 
            whileHover={{ y: -4 }} 
            onClick={() => navigate('/candidate/applications?status=SHORTLISTED')}
            className="portal-glass-card" 
            style={{ padding: '24px', cursor: 'pointer', border: '1px solid rgba(168, 85, 247, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>Shortlisted</span>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7', fontSize: '20px' }}>
                <CheckCircleOutlined />
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff' }}>{stats.shortlisted}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#a855f7', fontSize: '13px' }}>
              <span>Recruiter interest</span> <ArrowRightOutlined style={{ fontSize: '11px' }} />
            </div>
          </motion.div>

          {/* Interviews */}
          <motion.div 
            whileHover={{ y: -4 }} 
            onClick={() => navigate('/candidate/interviews')}
            className="portal-glass-card" 
            style={{ padding: '24px', cursor: 'pointer', border: '1px solid rgba(234, 179, 8, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>Interviews</span>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#eab308', fontSize: '20px' }}>
                <CalendarOutlined />
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff' }}>{stats.interviews}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#eab308', fontSize: '13px' }}>
              <span>Scheduled meetings</span> <ArrowRightOutlined style={{ fontSize: '11px' }} />
            </div>
          </motion.div>

          {/* Saved Jobs */}
          <motion.div 
            whileHover={{ y: -4 }} 
            onClick={() => navigate('/candidate/saved-jobs')}
            className="portal-glass-card" 
            style={{ padding: '24px', cursor: 'pointer', border: '1px solid rgba(16, 185, 129, 0.2)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: 500 }}>Saved Jobs</span>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '20px' }}>
                <BookOutlined />
              </div>
            </div>
            <div style={{ fontSize: '36px', fontWeight: 700, color: '#ffffff' }}>{stats.savedJobs}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#10b981', fontSize: '13px' }}>
              <span>Bookmarked roles</span> <ArrowRightOutlined style={{ fontSize: '11px' }} />
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid: Left (Recent Applications & Jobs), Right (Upcoming Interviews & Quick Links) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '32px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Recent Applications Section */}
            <div className="portal-glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'white', margin: 0 }}>Recent Applications</h2>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>Latest updates on your job applications</p>
                </div>
                <Link to="/candidate/applications">
                  <Button type="link" style={{ color: '#38bdf8', padding: 0 }}>View All</Button>
                </Link>
              </div>

              {data?.recentApplications?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {data.recentApplications.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        padding: '16px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '16px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.05))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#38bdf8',
                          fontSize: '15px'
                        }}>
                          {app.job?.employer?.name ? app.job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>{app.job?.title}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                            {app.job?.employer?.name || 'Insolvency Firm'} • Applied {new Date(app.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Tag 
                          style={{
                            borderRadius: '12px',
                            padding: '4px 12px',
                            fontSize: '12px',
                            fontWeight: 600,
                            borderColor: getStatusColor(app.status),
                            color: getStatusColor(app.status),
                            background: `${getStatusColor(app.status)}15`
                          }}
                        >
                          {app.status}
                        </Tag>
                        <Link to={`/jobs/${app.job?.id}`}>
                          <Button size="small" type="text" icon={<EyeOutlined />} style={{ color: '#9ca3af' }} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '36px 16px', color: '#9ca3af' }}>
                  <SendOutlined style={{ fontSize: '32px', color: '#38bdf8', marginBottom: '12px', opacity: 0.6 }} />
                  <p style={{ margin: 0 }}>You have not applied to any mandates yet.</p>
                  <Link to="/candidate/jobs">
                    <Button type="primary" style={{ marginTop: '12px', borderRadius: '8px' }}>Explore Mandates</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Recommended Open Mandates Section */}
            <div className="portal-glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'white', margin: 0 }}>Recommended For You</h2>
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>Latest Insolvency, CIRP & Restructuring roles</p>
                </div>
                <Link to="/candidate/jobs">
                  <Button type="link" style={{ color: '#38bdf8', padding: 0 }}>Search All</Button>
                </Link>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {data?.recommendedJobs?.map((job) => (
                  <div
                    key={job.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: 'rgba(56, 189, 248, 0.1)',
                          color: '#38bdf8',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {job.employer?.type || 'VERIFIED'}
                        </div>
                        <button
                          onClick={() => handleToggleSave(job.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: savedStatus[job.id] ? '#ef4444' : '#6b7280',
                            fontSize: '16px'
                          }}
                        >
                          {savedStatus[job.id] ? <HeartFilled /> : <HeartOutlined />}
                        </button>
                      </div>

                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'white', margin: '0 0 6px' }}>
                        {job.title}
                      </h3>
                      <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '12px' }}>
                        {job.employer?.name || 'Insolvency Entity'}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                        {job.skills?.slice(0, 3).map(s => (
                          <Tag key={s.skill?.id} style={{ borderRadius: '6px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.06)', color: '#cbd5e1', border: 'none' }}>
                            {s.skill?.name}
                          </Tag>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <Link to={`/jobs/${job.id}`} style={{ fontSize: '13px', color: '#38bdf8' }}>
                        View Details
                      </Link>
                      {appliedStatus[job.id] ? (
                        <Tag color="cyan" icon={<CheckCircleOutlined />}>Applied</Tag>
                      ) : (
                        <button 
                          className="portal-btn-primary" 
                          style={{ padding: '6px 14px', fontSize: '12px' }}
                          onClick={() => handleApplyClick(job)}
                        >
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Upcoming Interviews Widget */}
            <div className="portal-glass-card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>
                  <CalendarOutlined style={{ color: '#eab308', marginRight: '8px' }} />
                  Upcoming Interviews
                </h2>
                <Link to="/candidate/interviews" style={{ fontSize: '13px', color: '#38bdf8' }}>
                  All
                </Link>
              </div>

              {data?.upcomingInterviews?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {data.upcomingInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      style={{
                        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.08) 0%, rgba(30, 41, 59, 0.6) 100%)',
                        border: '1px solid rgba(234, 179, 8, 0.25)',
                        borderRadius: '14px',
                        padding: '16px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>{interview.job?.title || 'Mandate Interview'}</div>
                          <div style={{ fontSize: '12px', color: '#cbd5e1' }}>{interview.employer?.name}</div>
                        </div>
                        <Tag color="gold" style={{ borderRadius: '8px', fontSize: '11px' }}>
                          {interview.interviewType}
                        </Tag>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: '#fde047', marginBottom: '12px' }}>
                        <span>📅 {new Date(interview.interviewDate).toLocaleDateString()}</span>
                        <span>⏰ {interview.interviewTime || 'Scheduled'}</span>
                      </div>

                      {interview.meetingLink && (
                        <a
                          href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'block',
                            textAlign: 'center',
                            background: '#eab308',
                            color: '#0f172a',
                            fontWeight: 600,
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            textDecoration: 'none'
                          }}
                        >
                          <VideoCameraOutlined style={{ marginRight: '6px' }} /> Join Meeting
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '24px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                  <CalendarOutlined style={{ fontSize: '28px', color: '#9ca3af', marginBottom: '8px', opacity: 0.5 }} />
                  <p style={{ color: '#9ca3af', fontSize: '13px', margin: 0 }}>No upcoming interviews scheduled right now.</p>
                </div>
              )}
            </div>

            {/* Candidate Quick Action Tools */}
            <div className="portal-glass-card" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Candidate Toolkit</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link
                  to="/candidate/profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <UserOutlined style={{ color: '#38bdf8', fontSize: '16px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Update Professional Profile</span>
                  </div>
                  <ArrowRightOutlined style={{ fontSize: '12px', color: '#9ca3af' }} />
                </Link>

                <Link
                  to="/candidate/resume"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileTextOutlined style={{ color: '#a855f7', fontSize: '16px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Manage Resume Document</span>
                  </div>
                  <ArrowRightOutlined style={{ fontSize: '12px', color: '#9ca3af' }} />
                </Link>

                <Link
                  to="/candidate/jobs"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <RocketOutlined style={{ color: '#10b981', fontSize: '16px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>Search Insolvency Mandates</span>
                  </div>
                  <ArrowRightOutlined style={{ fontSize: '12px', color: '#9ca3af' }} />
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
            style={{ background: '#0ea5e9' }}
          >
            Submit Application
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Applying to: <strong>{selectedJob?.employer?.name}</strong>
          </p>
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              Cover Note / Insolvency & Restructuring Experience Highlight (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="E.g. Highlight your CIRP matters, liquidation experience, NCLT appearances, or IBC advisory qualifications..."
              style={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#94a3b8', background: 'rgba(56, 189, 248, 0.08)', padding: '10px 12px', borderRadius: '8px', marginTop: '12px' }}>
            ℹ️ Your profile details, education, IBC skills, and active resume will be shared with the recruiter.
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CandidateDashboard;

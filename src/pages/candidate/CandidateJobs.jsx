import React, { useState, useEffect } from 'react';
import { 
  Input, 
  Select, 
  Button, 
  Tag, 
  Row, 
  Col, 
  Modal, 
  message, 
  Typography, 
  Empty, 
  Tooltip 
} from 'antd';
import { 
  SearchOutlined, 
  EnvironmentOutlined, 
  DollarOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  BookOutlined, 
  HeartOutlined, 
  HeartFilled, 
  EyeOutlined, 
  FilterOutlined,
  ClearOutlined,
  SendOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllJobs } from '../../store/jobsSlice';
import { fetchSavedJobs, fetchCandidateApplications, toggleSaveJob, applyToJob } from '../../store/candidateSlice';
import CandidateNav from '../../components/CandidateNav';

const { Option } = Select;

const professionalCategories = [
  'Insolvency Professional',
  'Chartered Accountant',
  'Company Secretary',
  'Cost & Management Accountant',
  'Lawyer / Advocate',
  'Banking professional',
  'Finance professional',
  'Restructuring professional',
  'Legal associate',
  'Insolvency analyst'
];

const CandidateJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { jobsList, loading: jobsLoading } = useSelector((state) => state.jobs);
  const { savedJobs, applications } = useSelector((state) => state.candidate);

  const [loading, setLoading] = useState(true);
  const [savedJobsMap, setSavedJobsMap] = useState({});
  const [appliedJobsMap, setAppliedJobsMap] = useState({});

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(undefined);
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [selectedOrgType, setSelectedOrgType] = useState(undefined);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  const loadJobsAndStatuses = async () => {
    try {
      setLoading(true);
      const [jobsRes, savedRes, appsRes] = await Promise.all([
        dispatch(fetchAllJobs()).unwrap(),
        dispatch(fetchSavedJobs()).unwrap().catch(() => []),
        dispatch(fetchCandidateApplications()).unwrap().catch(() => [])
      ]);

      const savedMap = {};
      (Array.isArray(savedRes) ? savedRes : savedRes?.data || []).forEach(item => {
        savedMap[item.jobId || item.job?.id || item.id] = true;
      });
      setSavedJobsMap(savedMap);

      const appsMap = {};
      (Array.isArray(appsRes) ? appsRes : appsRes?.data || []).forEach(app => {
        appsMap[app.jobId] = app.status;
      });
      setAppliedJobsMap(appsMap);

    } catch (error) {
      console.error('Error loading jobs:', error);
      message.error('Failed to load jobs list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsAndStatuses();
  }, [dispatch]);

  const handleToggleSave = async (jobId) => {
    try {
      const res = await dispatch(toggleSaveJob(jobId)).unwrap();
      setSavedJobsMap(prev => ({ ...prev, [jobId]: res.isSaved }));
      message.success(res.message || 'Bookmark updated');
    } catch (error) {
      message.error('Failed to update bookmark');
    }
  };

  const handleOpenApplyModal = (job) => {
    setSelectedJobForApply(job);
    setCoverNote('');
    setApplyModalOpen(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedJobForApply) return;
    try {
      setSubmittingApply(true);
      await dispatch(applyToJob({ jobId: selectedJobForApply.id, coverNote })).unwrap();
      message.success('Application submitted successfully!');
      setAppliedJobsMap(prev => ({ ...prev, [selectedJobForApply.id]: 'APPLIED' }));
      setApplyModalOpen(false);
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to apply');
    } finally {
      setSubmittingApply(false);
    }
  };

  const jobs = Array.isArray(jobsList) ? jobsList : [];

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedLocation(undefined);
    setSelectedCategory(undefined);
    setSelectedOrgType(undefined);
  };

  // Filter jobs logic
  const filteredJobs = jobs.filter(job => {
    const matchesKeyword = !searchKeyword || 
      job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.requirements?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (job.employer?.name && job.employer.name.toLowerCase().includes(searchKeyword.toLowerCase()));

    const matchesLocation = !selectedLocation || 
      (job.employer?.location && job.employer.location.toLowerCase().includes(selectedLocation.toLowerCase()));

    const matchesCategory = !selectedCategory ||
      job.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      job.requirements?.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesOrgType = !selectedOrgType ||
      job.employer?.type === selectedOrgType;

    return matchesKeyword && matchesLocation && matchesCategory && matchesOrgType;
  });

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <CandidateNav activeKey="/candidate/jobs" />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>
            Insolvency & Restructuring Mandates
          </h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0' }}>
            Browse open opportunities posted by verified Insolvency Professional Entities (IPEs), Banks, ARCs, and Consulting Firms.
          </p>
        </div>

        {/* Filter Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card"
          style={{ padding: '24px', marginBottom: '32px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input
                prefix={<SearchOutlined style={{ color: '#38bdf8' }} />}
                placeholder="Search keywords, CIRP, IBC, role..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', height: '42px', borderRadius: '10px' }}
              />
            </Col>

            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Location / Bench"
                allowClear
                value={selectedLocation}
                onChange={setSelectedLocation}
                style={{ width: '100%', height: '42px' }}
              >
                <Option value="Delhi NCR">Delhi NCR / Principal Bench</Option>
                <Option value="Mumbai">Mumbai Bench</Option>
                <Option value="Bengaluru">Bengaluru Bench</Option>
                <Option value="Chennai">Chennai Bench</Option>
                <Option value="Kolkata">Kolkata Bench</Option>
                <Option value="Hyderabad">Hyderabad Bench</Option>
                <Option value="Ahmedabad">Ahmedabad Bench</Option>
              </Select>
            </Col>

            <Col xs={24} sm={12} md={5}>
              <Select
                placeholder="Role / Qualification"
                allowClear
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: '100%', height: '42px' }}
              >
                {professionalCategories.map(cat => (
                  <Option key={cat} value={cat}>{cat}</Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Organisation Type"
                allowClear
                value={selectedOrgType}
                onChange={setSelectedOrgType}
                style={{ width: '100%', height: '42px' }}
              >
                <Option value="BANK">Bank</Option>
                <Option value="ARC">ARC</Option>
                <Option value="IPE">IPE (Insolvency Entity)</Option>
                <Option value="CONSULTING_FIRM">Consulting Firm</Option>
                <Option value="LAW_FIRM">Law Firm</Option>
                <Option value="CA_FIRM">CA Firm</Option>
                <Option value="CORPORATE">Corporate</Option>
              </Select>
            </Col>

            <Col xs={24} sm={24} md={2} style={{ textAlign: 'right' }}>
              <Button 
                icon={<ClearOutlined />} 
                onClick={handleResetFilters}
                style={{ height: '42px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.06)', color: '#9ca3af', borderColor: 'rgba(255, 255, 255, 0.12)' }}
              >
                Reset
              </Button>
            </Col>
          </Row>
        </motion.div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: '#94a3b8', fontSize: '14px' }}>
          <span>Showing <strong>{filteredJobs.length}</strong> active mandates</span>
        </div>

        {/* Jobs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          <AnimatePresence>
            {filteredJobs.map((job) => {
              const isSaved = Boolean(savedJobsMap[job.id]);
              const applicationStatus = appliedJobsMap[job.id];

              return (
                <motion.div
                  key={job.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -5 }}
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(14, 165, 233, 0.05))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#38bdf8',
                          fontSize: '16px'
                        }}>
                          {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600 }}>
                            {job.employer?.type || 'VERIFIED ORG'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 500 }}>
                            {job.employer?.name || 'Insolvency Entity'}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleSave(job.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSaved ? '#ef4444' : '#9ca3af',
                          fontSize: '16px'
                        }}
                      >
                        {isSaved ? <HeartFilled /> : <HeartOutlined />}
                      </button>
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

                    {job.requirements && (
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#cbd5e1',
                        marginBottom: '16px'
                      }}>
                        <strong>Requirements:</strong> {job.requirements}
                      </div>
                    )}
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/jobs/${job.id}`} style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>
                      View Mandate ↗
                    </Link>

                    {applicationStatus ? (
                      <Tag 
                        color={applicationStatus === 'SHORTLISTED' ? 'purple' : 'cyan'} 
                        icon={<CheckCircleOutlined />}
                        style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '12px' }}
                      >
                        {applicationStatus}
                      </Tag>
                    ) : (
                      <button
                        className="portal-btn-primary"
                        style={{ padding: '7px 16px', fontSize: '13px' }}
                        onClick={() => handleOpenApplyModal(job)}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredJobs.length === 0 && !loading && (
          <div className="portal-glass-card" style={{ padding: '60px', textAlign: 'center', marginTop: '20px' }}>
            <SearchOutlined style={{ fontSize: '48px', color: '#38bdf8', marginBottom: '16px', opacity: 0.6 }} />
            <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>No matching mandates found</h3>
            <p style={{ color: '#9ca3af', marginTop: '8px' }}>Try adjusting your filters or keyword query.</p>
            <Button type="primary" onClick={handleResetFilters} style={{ marginTop: '12px', borderRadius: '8px' }}>
              Clear All Filters
            </Button>
          </div>
        )}

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
            Organisation: <strong>{selectedJobForApply?.employer?.name}</strong>
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

export default CandidateJobs;

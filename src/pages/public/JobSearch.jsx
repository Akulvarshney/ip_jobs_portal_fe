import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Button,
  Tag,
  Row,
  Col,
  Modal,
  Drawer,
  Badge,
  message,
  Spin,
  Tooltip,
  Divider
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
  ClearOutlined,
  BankOutlined,
  RocketOutlined,
  FilterOutlined,
  CloseOutlined,
  CompassOutlined,
  AppstoreOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AuditOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllJobs } from '../../store/jobsSlice';
import { fetchSavedJobs, fetchCandidateApplications, toggleSaveJob, applyToJob } from '../../store/candidateSlice';
import { 
  JOB_TYPES, 
  SALARY_RANGES, 
  EXPERIENCE_LEVELS, 
  getJobTypeLabel, 
  getJobTypeColor, 
  getSalaryRangeLabel, 
  getExperienceLevelLabel, 
  getExperienceLevelShortLabel 
} from '../../utils/jobEnums';

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

const JobSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialKeyword = searchParams.get('keyword') || searchParams.get('q') || '';
  const initialLocation = searchParams.get('location') || undefined;

  const dispatch = useDispatch();
  const { jobsList, loading: jobsLoading } = useSelector((state) => state.jobs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [savedJobsMap, setSavedJobsMap] = useState({});
  const [appliedJobsMap, setAppliedJobsMap] = useState({});

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState(initialKeyword);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedJobType, setSelectedJobType] = useState(searchParams.get('jobType') || undefined);
  const [selectedSalaryRange, setSelectedSalaryRange] = useState(searchParams.get('salaryRange') || undefined);
  const [selectedExpLevel, setSelectedExpLevel] = useState(searchParams.get('experienceLevel') || undefined);
  const [selectedCategory, setSelectedCategory] = useState(undefined);
  const [selectedOrgType, setSelectedOrgType] = useState(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

  const navigate = useNavigate();

  const loadJobs = async () => {
    try {
      setLoading(true);
      await dispatch(fetchAllJobs()).unwrap();

      if (isAuthenticated && user?.role === 'CANDIDATE') {
        const [savedRes, appsRes] = await Promise.all([
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
      }
    } catch (error) {
      console.error('Error loading public jobs:', error);
      message.error('Failed to load mandates directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [dispatch, isAuthenticated]);

  const handleToggleSave = async (jobId) => {
    if (!isAuthenticated) {
      message.info('Please log in as a candidate to save jobs');
      return navigate('/login');
    }
    try {
      const res = await dispatch(toggleSaveJob(jobId)).unwrap();
      setSavedJobsMap(prev => ({ ...prev, [jobId]: res.isSaved }));
      message.success(res.message || 'Bookmark updated');
    } catch (error) {
      message.error('Failed to update bookmark');
    }
  };

  const handleOpenApplyModal = (job) => {
    if (!isAuthenticated) {
      message.info('Please log in or create an account to apply');
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
    setSelectedJobType(undefined);
    setSelectedSalaryRange(undefined);
    setSelectedExpLevel(undefined);
    setSelectedCategory(undefined);
    setSelectedOrgType(undefined);
    setSearchParams({});
  };

  const activeFiltersCount = [
    selectedLocation,
    selectedJobType,
    selectedSalaryRange,
    selectedExpLevel,
    selectedCategory,
    selectedOrgType
  ].filter(Boolean).length;

  const filteredJobs = jobs.filter(job => {
    const matchesKeyword = !searchKeyword ||
      job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.requirements?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (job.employer?.name && job.employer.name.toLowerCase().includes(searchKeyword.toLowerCase()));

    const matchesLocation = !selectedLocation ||
      (job.employer?.location && job.employer.location.toLowerCase().includes(selectedLocation.toLowerCase()));

    const matchesJobType = !selectedJobType ||
      (job.jobType && job.jobType.toLowerCase() === selectedJobType.toLowerCase());

    const matchesSalary = !selectedSalaryRange ||
      (job.salaryRange && job.salaryRange.toLowerCase() === selectedSalaryRange.toLowerCase());

    const matchesExp = !selectedExpLevel ||
      (job.experienceLevel && job.experienceLevel.toLowerCase() === selectedExpLevel.toLowerCase());

    const matchesCategory = !selectedCategory ||
      job.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      job.requirements?.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesOrgType = !selectedOrgType ||
      job.employer?.type === selectedOrgType;

    return matchesKeyword && matchesLocation && matchesJobType && matchesSalary && matchesExp && matchesCategory && matchesOrgType;
  });

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
        <div className="portal-bg-blob-3"></div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>

        {/* Header Hero */}
        <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 36px' }}>
          {/* <Tag color="cyan" style={{ borderRadius: '12px', padding: '2px 12px', fontSize: '12px', fontWeight: 600, marginBottom: '12px' }}>
            National Insolvency Mandates Directory
          </Tag> */}
          <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--theme-heading)', margin: '0 0 12px' }}>
            Explore Verified Insolvency & Restructuring Roles
          </h1>

        </div>

        {/* Clean Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card"
          style={{ padding: '16px 20px', marginBottom: '24px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px' }}>
              <Input
                prefix={<SearchOutlined style={{ color: 'var(--theme-link)' }} />}
                placeholder="Search keywords, CIRP, IBC, role, or entity name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{
                  background: 'rgba(var(--theme-contrast-rgb), 0.05)',
                  color: 'var(--theme-heading)',
                  borderColor: 'rgba(var(--theme-contrast-rgb), 0.12)',
                  height: '44px',
                  borderRadius: '10px'
                }}
              />
            </div>

            <button
              type="button"
              className={`portal-filter-trigger-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
              onClick={() => setDrawerOpen(true)}
            >
              <FilterOutlined style={{ color: activeFiltersCount > 0 ? '#38bdf8' : 'inherit' }} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span style={{
                  background: '#0ea5e9',
                  color: 'var(--theme-on-primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 7px',
                  marginLeft: '2px'
                }}>
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {(activeFiltersCount > 0 || searchKeyword) && (
              <Tooltip title="Reset all filters">
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleResetFilters}
                  style={{
                    height: '44px',
                    width: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px',
                    background: 'rgba(var(--theme-contrast-rgb), 0.06)',
                    color: 'var(--theme-muted)',
                    borderColor: 'rgba(var(--theme-contrast-rgb), 0.12)'
                  }}
                />
              </Tooltip>
            )}
          </div>

          {/* Active Filter Chips */}
          {(activeFiltersCount > 0 || selectedLocation || selectedJobType || selectedSalaryRange || selectedExpLevel || selectedCategory || selectedOrgType) && (
            <div className="portal-active-filters-bar">
              <span className="portal-active-filters-label">Active Filters:</span>

              {selectedLocation && (
                <span className="portal-filter-tag">
                  <EnvironmentOutlined /> {selectedLocation}
                  <CloseOutlined onClick={() => setSelectedLocation(undefined)} />
                </span>
              )}

              {selectedJobType && (
                <span className="portal-filter-tag">
                  <ClockCircleOutlined /> {getJobTypeLabel(selectedJobType)}
                  <CloseOutlined onClick={() => setSelectedJobType(undefined)} />
                </span>
              )}

              {selectedSalaryRange && (
                <span className="portal-filter-tag">
                  <DollarOutlined /> {getSalaryRangeLabel(selectedSalaryRange)}
                  <CloseOutlined onClick={() => setSelectedSalaryRange(undefined)} />
                </span>
              )}

              {selectedExpLevel && (
                <span className="portal-filter-tag">
                  <UserOutlined /> {getExperienceLevelShortLabel(selectedExpLevel)}
                  <CloseOutlined onClick={() => setSelectedExpLevel(undefined)} />
                </span>
              )}

              {selectedCategory && (
                <span className="portal-filter-tag">
                  <AuditOutlined /> {selectedCategory}
                  <CloseOutlined onClick={() => setSelectedCategory(undefined)} />
                </span>
              )}

              {selectedOrgType && (
                <span className="portal-filter-tag">
                  <BankOutlined /> {selectedOrgType}
                  <CloseOutlined onClick={() => setSelectedOrgType(undefined)} />
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', color: 'var(--theme-subtle)', fontSize: '14px' }}>
          <span>Showing <strong>{filteredJobs.length}</strong> available positions</span>
        </div>

        {/* Filter Drawer */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ color: 'var(--theme-link)' }} />
              <span>Filter Opportunities</span>
            </div>
          }
          placement="right"
          width={380}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                onClick={handleResetFilters}
                disabled={activeFiltersCount === 0 && !searchKeyword}
                style={{ borderRadius: '8px', background: 'transparent', color: 'var(--theme-subtle)', border: '1px solid rgba(var(--theme-contrast-rgb),0.15)' }}
              >
                Reset All
              </Button>
              <Button
                type="primary"
                onClick={() => setDrawerOpen(false)}
                style={{ borderRadius: '8px', background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 600 }}
              >
                Apply & View ({filteredJobs.length})
              </Button>
            </div>
          }
        >
          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <ClockCircleOutlined /> Job / Mandate Type
            </div>
            <Select
              placeholder="All Job Types (Full-time, Contract, Internship...)"
              allowClear
              value={selectedJobType}
              onChange={setSelectedJobType}
              style={{ width: '100%' }}
              size="large"
            >
              {JOB_TYPES.map(jt => (
                <Option key={jt.value} value={jt.value}>{jt.label}</Option>
              ))}
            </Select>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb),0.08)', margin: '18px 0' }} />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <UserOutlined /> Experience Level
            </div>
            <Select
              placeholder="All Experience Levels"
              allowClear
              value={selectedExpLevel}
              onChange={setSelectedExpLevel}
              style={{ width: '100%' }}
              size="large"
            >
              {EXPERIENCE_LEVELS.map(el => (
                <Option key={el.value} value={el.value}>{el.label}</Option>
              ))}
            </Select>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb),0.08)', margin: '18px 0' }} />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <DollarOutlined /> Salary / Compensation Bracket
            </div>
            <Select
              placeholder="All Salary Ranges"
              allowClear
              value={selectedSalaryRange}
              onChange={setSelectedSalaryRange}
              style={{ width: '100%' }}
              size="large"
            >
              {SALARY_RANGES.map(sr => (
                <Option key={sr.value} value={sr.value}>{sr.label}</Option>
              ))}
            </Select>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb),0.08)', margin: '18px 0' }} />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <CompassOutlined /> NCLT Bench / Location
            </div>
            <Select
              placeholder="All Locations & Benches"
              allowClear
              value={selectedLocation}
              onChange={setSelectedLocation}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="Delhi NCR">Delhi NCR / Principal Bench</Option>
              <Option value="Mumbai">Mumbai Bench</Option>
              <Option value="Bengaluru">Bengaluru Bench</Option>
              <Option value="Chennai">Chennai Bench</Option>
              <Option value="Kolkata">Kolkata Bench</Option>
              <Option value="Hyderabad">Hyderabad Bench</Option>
              <Option value="Ahmedabad">Ahmedabad Bench</Option>
            </Select>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb),0.08)', margin: '18px 0' }} />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <AuditOutlined /> Role / Professional Category
            </div>
            <Select
              placeholder="All Roles & Qualifications"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: '100%' }}
              size="large"
            >
              {professionalCategories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb),0.08)', margin: '18px 0' }} />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <BankOutlined /> Organisation / Entity Type
            </div>
            <Select
              placeholder="All Entity Types"
              allowClear
              value={selectedOrgType}
              onChange={setSelectedOrgType}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="BANK">Bank</Option>
              <Option value="ARC">ARC (Asset Reconstruction)</Option>
              <Option value="IPE">IPE (Insolvency Entity)</Option>
              <Option value="CONSULTING_FIRM">Consulting Firm</Option>
              <Option value="LAW_FIRM">Law Firm</Option>
              <Option value="CA_FIRM">CA Firm</Option>
              <Option value="CORPORATE">Corporate</Option>
            </Select>
          </div>
        </Drawer>

        {/* Jobs Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
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
                      border: '1px solid rgba(var(--theme-contrast-rgb), 0.1)'
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
                            color: 'var(--theme-link)',
                            fontSize: '16px'
                          }}>
                            {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--theme-link)', fontWeight: 600 }}>
                                {job.employer?.type || 'VERIFIED ORG'}
                              </span>
                              <Tag color={getJobTypeColor(job.jobType)} style={{ borderRadius: '6px', fontSize: '10px', padding: '0 6px', margin: 0, lineHeight: '18px' }}>
                                {getJobTypeLabel(job.jobType)}
                              </Tag>
                            </div>
                            <Link to={`/companies/${job.employer?.id}`} style={{ fontSize: '14px', color: 'var(--theme-detail)', fontWeight: 500 }}>
                              {job.employer?.name || 'Insolvency Entity'}
                            </Link>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleSave(job.id)}
                          style={{
                            background: 'rgba(var(--theme-contrast-rgb), 0.05)',
                            border: '1px solid rgba(var(--theme-contrast-rgb), 0.1)',
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isSaved ? '#ef4444' : 'var(--theme-muted)',
                            fontSize: '16px'
                          }}
                        >
                          {isSaved ? <HeartFilled /> : <HeartOutlined />}
                        </button>
                      </div>

                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--theme-heading)', margin: '0 0 6px' }}>
                        {job.title}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ color: 'var(--theme-success)', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <DollarOutlined /> {getSalaryRangeLabel(job.salaryRange)}
                          </span>
                          <Tag color="geekblue" style={{ borderRadius: '6px', fontSize: '11px', margin: 0 }}>
                            {getExperienceLevelShortLabel(job.experienceLevel)}
                          </Tag>
                        </div>
                        {job.employer?.location && (
                          <span style={{ color: 'var(--theme-subtle)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <EnvironmentOutlined /> {job.employer.location}
                          </span>
                        )}
                      </div>

                      <p style={{
                        color: 'var(--theme-subtle)',
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
                          background: 'rgba(var(--theme-contrast-rgb), 0.03)',
                          border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: 'var(--theme-detail)',
                          marginBottom: '16px'
                        }}>
                          <strong>Requirements:</strong> {job.requirements}
                        </div>
                      )}
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(var(--theme-contrast-rgb), 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Link to={`/jobs/${job.id}`} style={{ fontSize: '13px', color: 'var(--theme-link)', fontWeight: 500 }}>
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
        )}

        {filteredJobs.length === 0 && !loading && (
          <div className="portal-glass-card" style={{ padding: '60px', textAlign: 'center', marginTop: '20px' }}>
            <SearchOutlined style={{ fontSize: '48px', color: 'var(--theme-link)', marginBottom: '16px', opacity: 0.6 }} />
            <h3 style={{ color: 'var(--theme-heading)', fontSize: '20px', margin: 0 }}>No matching mandates found</h3>
            <p style={{ color: 'var(--theme-muted)', marginTop: '8px' }}>Try adjusting your filters or search keywords.</p>
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
          <p style={{ color: 'var(--theme-detail)', fontSize: '14px' }}>
            Organisation: <strong>{selectedJobForApply?.employer?.name}</strong>
          </p>
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: 'var(--theme-subtle)', marginBottom: '6px' }}>
              Cover Note & Insolvency Experience Summary (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant CIRP, liquidation, resolution plan, or forensic assignments..."
              style={{ borderRadius: '8px', background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }}
            />
          </div>
          <div style={{ fontSize: '12px', color: 'var(--theme-subtle)', background: 'rgba(56, 189, 248, 0.08)', padding: '10px 12px', borderRadius: '8px', marginTop: '12px' }}>
            ℹ️ Your profile details and active resume will be submitted to the recruiter.
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default JobSearch;

import React, { useState, useEffect } from 'react';
import {
  Input,
  Select,
  Button,
  Tag,
  Modal,
  Drawer,
  message,
  Spin,
  Tooltip,
  Divider
} from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  HeartOutlined,
  HeartFilled,
  ClearOutlined,
  BankOutlined,
  FilterOutlined,
  CloseOutlined,
  CompassOutlined,
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
  const { jobsList } = useSelector((state) => state.jobs);
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

      <div className="portal-public-container-1240">

        {/* Header Hero */}
        <div className="portal-search-hero-box">
          <h1 className="portal-search-hero-title">
            Explore Verified Insolvency & Restructuring Roles
          </h1>
        </div>

        {/* Clean Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card portal-search-bar-card"
        >
          <div className="portal-search-bar-flex">
            <div className="portal-search-input-col">
              <Input
                prefix={<SearchOutlined className="portal-company-meta-icon" />}
                placeholder="Search keywords, CIRP, IBC, role, or entity name..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                className="portal-search-main-input"
              />
            </div>

            <button
              type="button"
              className={`portal-filter-trigger-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
              onClick={() => setDrawerOpen(true)}
            >
              <FilterOutlined className={activeFiltersCount > 0 ? 'portal-color-link' : ''} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="portal-search-filter-badge">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {(activeFiltersCount > 0 || searchKeyword) && (
              <Tooltip title="Reset all filters">
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleResetFilters}
                  className="portal-btn-round-action"
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
        <div className="portal-search-results-header">
          <span>Showing <strong className="portal-search-results-count">{filteredJobs.length}</strong> available positions</span>
        </div>

        {/* Filter Drawer */}
        <Drawer
          title={
            <div className="portal-flex-center-gap-8">
              <FilterOutlined className="portal-color-link" />
              <span>Filter Opportunities</span>
            </div>
          }
          placement="right"
          width={380}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          footer={
            <div className="portal-search-drawer-header">
              <Button
                onClick={handleResetFilters}
                disabled={activeFiltersCount === 0 && !searchKeyword}
                className="portal-search-drawer-reset"
              >
                Reset All
              </Button>
              <Button
                type="primary"
                onClick={() => setDrawerOpen(false)}
                className="portal-search-drawer-apply"
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
              className="portal-w-full"
              size="large"
            >
              {JOB_TYPES.map(jt => (
                <Option key={jt.value} value={jt.value}>{jt.label}</Option>
              ))}
            </Select>
          </div>

          <Divider className="portal-legal-divider" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <UserOutlined /> Experience Level
            </div>
            <Select
              placeholder="All Experience Levels"
              allowClear
              value={selectedExpLevel}
              onChange={setSelectedExpLevel}
              className="portal-w-full"
              size="large"
            >
              {EXPERIENCE_LEVELS.map(el => (
                <Option key={el.value} value={el.value}>{el.label}</Option>
              ))}
            </Select>
          </div>

          <Divider className="portal-legal-divider" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <DollarOutlined /> Salary / Compensation Bracket
            </div>
            <Select
              placeholder="All Salary Ranges"
              allowClear
              value={selectedSalaryRange}
              onChange={setSelectedSalaryRange}
              className="portal-w-full"
              size="large"
            >
              {SALARY_RANGES.map(sr => (
                <Option key={sr.value} value={sr.value}>{sr.label}</Option>
              ))}
            </Select>
          </div>

          <Divider className="portal-legal-divider" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <CompassOutlined /> NCLT Bench / Location
            </div>
            <Select
              placeholder="All Locations & Benches"
              allowClear
              value={selectedLocation}
              onChange={setSelectedLocation}
              className="portal-w-full"
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

          <Divider className="portal-legal-divider" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <AuditOutlined /> Role / Professional Category
            </div>
            <Select
              placeholder="All Roles & Qualifications"
              allowClear
              value={selectedCategory}
              onChange={setSelectedCategory}
              className="portal-w-full"
              size="large"
            >
              {professionalCategories.map(cat => (
                <Option key={cat} value={cat}>{cat}</Option>
              ))}
            </Select>
          </div>

          <Divider className="portal-legal-divider" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <BankOutlined /> Organisation / Entity Type
            </div>
            <Select
              placeholder="All Entity Types"
              allowClear
              value={selectedOrgType}
              onChange={setSelectedOrgType}
              className="portal-w-full"
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
          <div className="portal-loading-center">
            <Spin size="large" />
          </div>
        ) : (
          <div className="portal-company-jobs-grid">
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
                    className="portal-glass-card portal-company-job-card"
                  >
                    <div>
                      <div className="portal-company-job-header">
                        <div className="portal-details-avatar-group">
                          <div className="portal-company-avatar-box-sm">
                            {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                          </div>
                          <div>
                            <div className="portal-details-tags-row">
                              <span className="portal-job-employer-type">
                                {job.employer?.type || 'VERIFIED ORG'}
                              </span>
                              <Tag color={getJobTypeColor(job.jobType)} className="portal-tag-pill-10">
                                {getJobTypeLabel(job.jobType)}
                              </Tag>
                            </div>
                            <Link to={`/companies/${job.employer?.id}`} className="portal-job-employer-link">
                              {job.employer?.name || 'Insolvency Entity'}
                            </Link>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleSave(job.id)}
                          className={`portal-btn-bookmark ${isSaved ? 'portal-btn-bookmark-saved' : 'portal-btn-bookmark-unsaved'}`}
                          aria-label="Save Job"
                        >
                          {isSaved ? <HeartFilled /> : <HeartOutlined />}
                        </button>
                      </div>

                      <h3 className="portal-company-job-title">
                        {job.title}
                      </h3>

                      <div className="portal-search-card-meta">
                        <div className="portal-flex-center-wrap-gap-8">
                          <span className="portal-search-card-sal-badge">
                            <DollarOutlined /> {getSalaryRangeLabel(job.salaryRange)}
                          </span>
                          <Tag color="geekblue" className="portal-search-card-exp-tag">
                            {getExperienceLevelShortLabel(job.experienceLevel)}
                          </Tag>
                        </div>
                        {job.employer?.location && (
                          <span className="portal-search-card-loc">
                            <EnvironmentOutlined /> {job.employer.location}
                          </span>
                        )}
                      </div>

                      <p className="portal-company-job-desc">
                        {job.description}
                      </p>

                      {job.requirements && (
                        <div className="portal-search-card-reqs">
                          <strong className="portal-legal-strong">Requirements:</strong> {job.requirements}
                        </div>
                      )}
                    </div>

                    <div className="portal-company-job-footer">
                      <Link to={`/jobs/${job.id}`} className="portal-company-view-link">
                        View Mandate ↗
                      </Link>

                      {applicationStatus ? (
                        <Tag
                          color={applicationStatus === 'SHORTLISTED' ? 'purple' : 'cyan'}
                          icon={<CheckCircleOutlined />}
                          className="portal-app-status-tag"
                        >
                          {applicationStatus}
                        </Tag>
                      ) : (
                        <button
                          className="portal-btn-primary portal-company-apply-btn"
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
          <div className="portal-glass-card portal-company-empty-box portal-mt-20">
            <SearchOutlined className="portal-company-empty-icon" />
            <h3 className="portal-company-empty-title">No matching mandates found</h3>
            <p className="portal-company-empty-desc">Try adjusting your filters or search keywords.</p>
            <Button type="primary" onClick={handleResetFilters} className="portal-btn-primary-reset">
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
            className="portal-btn-sky"
          >
            Submit Application
          </Button>,
        ]}
      >
        <div className="portal-apply-modal-body">
          <p className="portal-apply-modal-org">
            Organisation: <strong className="portal-legal-strong">{selectedJobForApply?.employer?.name}</strong>
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

export default JobSearch;

import CitySelect from '../../components/CitySelect';
import React, { useState, useEffect } from 'react';
import { getFileUrl } from "../../utils/fileUrl";
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
  Divider,
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
  SendOutlined,
  CloseOutlined,
  CompassOutlined,
  AuditOutlined,
  BankOutlined,
  TagOutlined,
  ClockCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllJobs } from '../../store/jobsSlice';
import { fetchSavedJobs, toggleSaveJob, applyToJob } from '../../store/candidateSlice';
import { saveFilters } from '../../store/authSlice';
import {
  JOB_TYPES,
  SALARY_RANGES,
  EXPERIENCE_LEVELS,
  getJobTypeLabel,
  getSalaryRangeLabel,
  getExperienceLevelLabel
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

const getRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

const CandidateJobs = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const { jobsList, loading: jobsLoading } = useSelector((state) => state.jobs);
  const { savedJobs, applications } = useSelector((state) => state.candidate);

  const [loading, setLoading] = useState(true);
  const [savedJobsMap, setSavedJobsMap] = useState({});
  const [appliedJobsMap, setAppliedJobsMap] = useState({});

  // Helper to read initial state from URL params first, then DB, then localStorage
  const getInitialFilter = (key, queryParam) => {
    if (queryParam) {
      const fromUrl = searchParams.get(queryParam);
      if (fromUrl) return fromUrl;
    }
    const dbStored = user?.savedFilters;
    if (dbStored && dbStored[key] !== undefined) {
      return dbStored[key];
    }
    const stored = JSON.parse(localStorage.getItem('portal_job_filters') || '{}');
    return stored[key] || undefined;
  };

  // Filter states
  const [searchKeyword, setSearchKeyword] = useState(() => getInitialFilter('searchKeyword', 'keyword') || searchParams.get('q') || '');
  const [selectedLocation, setSelectedLocation] = useState(() => getInitialFilter('selectedLocation', 'location'));
  const [selectedCategory, setSelectedCategory] = useState(() => getInitialFilter('selectedCategory', 'category'));
  const [selectedOrgType, setSelectedOrgType] = useState(() => getInitialFilter('selectedOrgType', 'orgType'));
  const [selectedJobType, setSelectedJobType] = useState(() => getInitialFilter('selectedJobType', 'jobType'));
  const [selectedSalaryRange, setSelectedSalaryRange] = useState(() => getInitialFilter('selectedSalaryRange', 'salaryRange'));
  const [selectedExpLevel, setSelectedExpLevel] = useState(() => getInitialFilter('selectedExpLevel', 'experienceLevel'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (user?.savedFilters) {
      if (user.savedFilters.searchKeyword !== undefined) setSearchKeyword(user.savedFilters.searchKeyword);
      if (user.savedFilters.selectedLocation !== undefined) setSelectedLocation(user.savedFilters.selectedLocation);
      if (user.savedFilters.selectedJobType !== undefined) setSelectedJobType(user.savedFilters.selectedJobType);
      if (user.savedFilters.selectedSalaryRange !== undefined) setSelectedSalaryRange(user.savedFilters.selectedSalaryRange);
      if (user.savedFilters.selectedExpLevel !== undefined) setSelectedExpLevel(user.savedFilters.selectedExpLevel);
      if (user.savedFilters.selectedCategory !== undefined) setSelectedCategory(user.savedFilters.selectedCategory);
      if (user.savedFilters.selectedOrgType !== undefined) setSelectedOrgType(user.savedFilters.selectedOrgType);
    }
  }, [user?.savedFilters]);

  // Persist filters to localStorage and Database whenever they change
  useEffect(() => {
    const filters = {
      searchKeyword,
      selectedLocation,
      selectedJobType,
      selectedSalaryRange,
      selectedExpLevel,
      selectedCategory,
      selectedOrgType
    };
    localStorage.setItem('portal_job_filters', JSON.stringify(filters));

    const currentDbFilters = user?.savedFilters || {};
    const hasChanged = Object.keys(filters).some(key => filters[key] !== currentDbFilters[key]);

    if (isAuthenticated && hasChanged) {
      dispatch(saveFilters(filters));
    }
  }, [searchKeyword, selectedLocation, selectedJobType, selectedSalaryRange, selectedExpLevel, selectedCategory, selectedOrgType, isAuthenticated, dispatch, user?.savedFilters]);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);

    const loadJobsAndStatuses = async () => {
    try {
      setLoading(true);
      const [jobsRes, savedRes] = await Promise.all([
        dispatch(fetchAllJobs({ location: selectedLocation || undefined })).unwrap(),
        dispatch(fetchSavedJobs()).unwrap().catch(() => [])
      ]);

      const savedMap = {};
      (Array.isArray(savedRes) ? savedRes : savedRes?.data || []).forEach(item => {
        savedMap[item.jobId || item.job?.id || item.id] = true;
      });
      setSavedJobsMap(savedMap);

      // The backend already filters out jobs the user has applied to.
      // We only keep appliedJobsMap for tracking state when applying in current session.

    } catch (error) {
      console.error('Error loading jobs:', error);
      message.error('Failed to load jobs list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobsAndStatuses();
  }, [selectedLocation, dispatch]);

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
    setSelectedLocation(null);
    setSelectedCategory(undefined);
    setSelectedOrgType(undefined);
    setSelectedJobType(undefined);
    setSelectedSalaryRange(undefined);
    setSelectedExpLevel(undefined);
  };

  const activeFiltersCount = [
    selectedLocation,
    selectedCategory,
    selectedOrgType,
    selectedJobType,
    selectedSalaryRange,
    selectedExpLevel
  ].filter(Boolean).length;

  // Filter jobs logic with unapplied-first priority sorting
  const filteredJobs = jobs
    .filter(job => {
      const isApplied = Boolean(appliedJobsMap[job.id]);

      if (isApplied) return false;

      const matchesKeyword = !searchKeyword ||
        job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        job.requirements?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (job.employer?.name && job.employer.name.toLowerCase().includes(searchKeyword.toLowerCase()));


      const matchesCategory = !selectedCategory ||
        job.title.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        job.requirements?.toLowerCase().includes(selectedCategory.toLowerCase());

      const matchesOrgType = !selectedOrgType ||
        job.employer?.type === selectedOrgType;

      const matchesJobType = !selectedJobType || job.jobType === selectedJobType;
      const matchesSalary = !selectedSalaryRange || job.salaryRange === selectedSalaryRange;
      const matchesExp = !selectedExpLevel || job.experienceLevel === selectedExpLevel;

      return matchesKeyword && matchesCategory && matchesOrgType && matchesJobType && matchesSalary && matchesExp;
    })
    .sort((a, b) => {
      // Then newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div>
      {/* Page Header */}
      <div className="portal-page-header">
        <h1 className="portal-page-title">
          Recommended jobs for you
        </h1>
      </div>

      {/* Search & Filter Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-glass-card portal-search-bar-card"
      >
        <div className="portal-search-bar-inner">
          <div className="portal-search-input-wrap">
            <Input
              prefix={<SearchOutlined className="portal-search-prefix-icon" />}
              placeholder="Search keywords, CIRP, IBC, role, or entity name..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
              className="portal-search-input-lg"
            />
          </div>

          <button
            type="button"
            className={`portal-filter-trigger-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
            onClick={() => setDrawerOpen(true)}
          >
            <FilterOutlined />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="portal-filter-badge">
                {activeFiltersCount}
              </span>
            )}
          </button>


        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div className="portal-active-filters-bar">
            <span className="portal-active-filters-label">Active Filters:</span>

            {selectedJobType && (
              <span className="portal-filter-tag">
                <ClockCircleOutlined /> {getJobTypeLabel(selectedJobType)}
                <CloseOutlined onClick={() => setSelectedJobType(undefined)} />
              </span>
            )}

            {selectedExpLevel && (
              <span className="portal-filter-tag">
                <UserOutlined /> {getExperienceLevelLabel(selectedExpLevel)}
                <CloseOutlined onClick={() => setSelectedExpLevel(undefined)} />
              </span>
            )}

            {selectedSalaryRange && (
              <span className="portal-filter-tag">
                <DollarOutlined /> {getSalaryRangeLabel(selectedSalaryRange)}
                <CloseOutlined onClick={() => setSelectedSalaryRange(undefined)} />
              </span>
            )}

            {selectedLocation && (
              <span className="portal-filter-tag">
                <EnvironmentOutlined /> {selectedLocation}
                <CloseOutlined onClick={() => setSelectedLocation(null)} />
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

      {/* Results Counter & Quick Status Tabs */}
      {/* <div className="portal-jobs-results-header">
        <div>
          Showing <strong>{filteredJobs.length}</strong> jobs
        </div>
      </div> */}

      {/* Filter Drawer */}
      <Drawer
        title={
          <div className="portal-drawer-header-title">
            <FilterOutlined className="portal-icon-theme-link" />
            <span>Filter Opportunities</span>
          </div>
        }
        placement="right"
        width={380}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="portal-drawer-footer-wrap">
            <Button
              onClick={handleResetFilters}
              disabled={activeFiltersCount === 0 && !searchKeyword}
              className="portal-drawer-reset-btn"
            >
              Reset All
            </Button>
            <Button
              type="primary"
              onClick={() => setDrawerOpen(false)}
              className="portal-drawer-apply-btn"
            >
              Apply & View ({filteredJobs.length})
            </Button>
          </div>
        }
      >
        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <CompassOutlined /> Location
          </div>
          <CitySelect
              aria-label="Filter jobs by city"
              placeholder="All cities — search worldwide"
              value={selectedLocation}
              onChange={city => setSelectedLocation(city || null)}
              className="portal-drawer-select"
              size="large"
            />
        </div>

        <Divider className="portal-drawer-divider" />

        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <AuditOutlined /> Role / Professional Category
          </div>
          <Select
            placeholder="All Roles & Qualifications"
            allowClear
            value={selectedCategory}
            onChange={setSelectedCategory}
            className="portal-drawer-select"
            size="large"
          >
            {professionalCategories.map(cat => (
              <Option key={cat} value={cat}>{cat}</Option>
            ))}
          </Select>
        </div>

        <Divider className="portal-drawer-divider" />

        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <BankOutlined /> Organisation / Entity Type
          </div>
          <Select
            placeholder="All Entity Types"
            allowClear
            value={selectedOrgType}
            onChange={setSelectedOrgType}
            className="portal-drawer-select"
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

        <Divider className="portal-drawer-divider" />

        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <ClockCircleOutlined /> Job Type
          </div>
          <Select
            placeholder="All Job Types"
            allowClear
            value={selectedJobType}
            onChange={setSelectedJobType}
            className="portal-drawer-select"
            size="large"
          >
            {JOB_TYPES.map(jt => (
              <Option key={jt.value} value={jt.value}>{jt.label}</Option>
            ))}
          </Select>
        </div>

        <Divider className="portal-drawer-divider" />

        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <UserOutlined /> Experience Level
          </div>
          <Select
            placeholder="All Experience Levels"
            allowClear
            value={selectedExpLevel}
            onChange={setSelectedExpLevel}
            className="portal-drawer-select"
            size="large"
          >
            {EXPERIENCE_LEVELS.map(el => (
              <Option key={el.value} value={el.value}>{el.label}</Option>
            ))}
          </Select>
        </div>

        <Divider className="portal-drawer-divider" />

        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <DollarOutlined /> Salary Range
          </div>
          <Select
            placeholder="All Salary Ranges"
            allowClear
            value={selectedSalaryRange}
            onChange={setSelectedSalaryRange}
            className="portal-drawer-select"
            size="large"
          >
            {SALARY_RANGES.map(sr => (
              <Option key={sr.value} value={sr.value}>{sr.label}</Option>
            ))}
          </Select>
        </div>
      </Drawer>

      {/* Jobs List */}
      <div className="portal-cards-list">
        <AnimatePresence>
          {filteredJobs.map((job) => {
            const isSaved = Boolean(savedJobsMap[job.id]);
            const applicationStatus = appliedJobsMap[job.id];

            return (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="portal-job-card-horizontal"
                onClick={() => navigate(`/jobs/${job.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="portal-job-card-h-left">
                  <div className="portal-job-card-h-logo">
                    {job.employer?.logoUrl ? (
                      <img src={getFileUrl(job.employer?.logoUrl)} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} />
                    ) : (
                      (job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : "CO")
                    )}
                  </div>
                  
                  <div className="portal-job-card-h-content">
                    <h3 className="portal-job-card-h-title">{job.title}</h3>
                    <div className="portal-job-card-h-company">
                      <BankOutlined /> {job.employer?.name || 'Insolvency Entity'} 
                      <Tag color="cyan" style={{ margin: 0, borderRadius: '12px', fontSize: '11px', border: 'none' }}>
                        {job.employer?.type || 'VERIFIED ORG'}
                      </Tag>
                    </div>
                    
                    <div className="portal-job-card-h-meta">
                      {job.salaryRange && (
                        <span><DollarOutlined /> {getSalaryRangeLabel(job.salaryRange)}</span>
                      )}
                      {job.experienceLevel && (
                        <span><UserOutlined /> {getExperienceLevelLabel(job.experienceLevel)}</span>
                      )}
                      {(job.locations?.length ? job.locations.join(", ") : job.employer?.location) && (
                        <span style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <EnvironmentOutlined /> {job.locations?.length ? job.locations.join(", ") : job.employer?.location}
                        </span>
                      )}
                      {job.createdAt && (
                        <span><ClockCircleOutlined /> {getRelativeTime(job.createdAt)}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="portal-job-card-h-right">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%', justifyContent: 'flex-end' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleToggleSave(job.id); }}
                      className={`portal-job-card-h-bookmark ${isSaved ? 'saved' : ''}`}
                    >
                      {isSaved ? <HeartFilled /> : <HeartOutlined />}
                    </button>

                    {applicationStatus ? (
                      <Tag color={applicationStatus === 'SHORTLISTED' ? 'purple' : 'cyan'} icon={<CheckCircleOutlined />} style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '20px', margin: 0 }}>
                        {applicationStatus}
                      </Tag>
                    ) : (
                      <button
                        className="portal-btn-primary"
                        style={{ padding: '8px 24px', borderRadius: '24px', fontWeight: 600, boxShadow: '0 4px 12px rgba(var(--theme-primary-rgb), 0.2)' }}
                        onClick={(e) => { e.stopPropagation(); handleOpenApplyModal(job); }}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>

                  {job.skills?.length > 0 && (
                    <div className="portal-job-card-h-skills">
                      {job.skills.slice(0, 3).map(s => (
                        <Tag key={s.skill?.id || s.skillId} color="blue" style={{ borderRadius: '12px', border: 'none', background: 'rgba(var(--theme-primary-rgb), 0.08)' }}>
                          {s.skill?.name || 'Insolvency'}
                        </Tag>
                      ))}
                      {job.skills.length > 3 && (
                        <span style={{ fontSize: '12px', color: 'var(--theme-muted)', display: 'flex', alignItems: 'center' }}>
                          +{job.skills.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredJobs.length === 0 && !loading && (
        <div className="portal-glass-card portal-empty-state-card">
          <SearchOutlined className="portal-empty-state-icon" />
          <h3 className="portal-empty-state-title">No matching jobs found</h3>
          <p className="portal-empty-state-desc">Try adjusting your filters or keyword query.</p>
          <Button type="primary" onClick={handleResetFilters} className="portal-empty-state-btn">
            Clear All Filters
          </Button>
        </div>
      )}

      {/* Apply Modal */}
      <Modal
        title={`Apply for ${selectedJobForApply?.title || 'Job'}`}
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
            className="portal-btn-theme-primary"
          >
            Submit Application
          </Button>,
        ]}
      >
        <div className="portal-modal-apply-body">
          <p className="portal-modal-apply-target">
            Organisation: <strong>{selectedJobForApply?.employer?.name}</strong>
          </p>
          <div className="portal-modal-field-group">
            <label className="portal-modal-field-label">
              Cover Note & Insolvency Experience Summary (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant CIRP, liquidation, resolution plan, or forensic assignments..."
              className="portal-modal-textarea"
            />
          </div>
          <div className="portal-modal-apply-info">
            ℹ️ Your profile details and active resume will be submitted to the recruiter.
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CandidateJobs;

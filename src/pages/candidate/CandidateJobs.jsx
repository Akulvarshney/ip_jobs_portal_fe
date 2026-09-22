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
  TagOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllJobs } from '../../store/jobsSlice';
import { fetchSavedJobs, fetchCandidateApplications, toggleSaveJob, applyToJob } from '../../store/candidateSlice';

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
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'UNAPPLIED' | 'APPLIED' | 'SAVED'
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    setStatusFilter('ALL');
  };

  const activeFiltersCount = [
    selectedLocation,
    selectedCategory,
    selectedOrgType,
    statusFilter !== 'ALL' ? statusFilter : null
  ].filter(Boolean).length;

  // Filter jobs logic with unapplied-first priority sorting
  const filteredJobs = jobs
    .filter(job => {
      const isApplied = Boolean(appliedJobsMap[job.id]);
      const isSaved = Boolean(savedJobsMap[job.id]);

      if (statusFilter === 'UNAPPLIED' && isApplied) return false;
      if (statusFilter === 'APPLIED' && !isApplied) return false;
      if (statusFilter === 'SAVED' && !isSaved) return false;

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
    })
    .sort((a, b) => {
      const aApplied = Boolean(appliedJobsMap[a.id]);
      const bApplied = Boolean(appliedJobsMap[b.id]);

      // Unapplied jobs always come first
      if (aApplied !== bApplied) {
        return aApplied ? 1 : -1;
      }

      // Then newest first
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  return (
    <div>
      {/* Page Header */}
      <div className="portal-page-header">
        <h1 className="portal-page-title">
          Insolvency & Restructuring Mandates
        </h1>
        <p className="portal-page-subtitle">
          Browse open opportunities posted by verified Insolvency Professional Entities (IPEs), Banks, ARCs, and Consulting Firms.
        </p>
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

          {(activeFiltersCount > 0 || searchKeyword) && (
            <Tooltip title="Reset all filters">
              <Button 
                icon={<ClearOutlined />} 
                onClick={handleResetFilters}
                className="portal-reset-filter-btn"
              />
            </Tooltip>
          )}
        </div>

        {/* Active Filter Chips */}
        {(activeFiltersCount > 0 || selectedLocation || selectedCategory || selectedOrgType || statusFilter !== 'ALL') && (
          <div className="portal-active-filters-bar">
            <span className="portal-active-filters-label">Active Filters:</span>
            
            {statusFilter !== 'ALL' && (
              <span className="portal-filter-tag">
                <TagOutlined /> Status: {statusFilter}
                <CloseOutlined onClick={() => setStatusFilter('ALL')} />
              </span>
            )}

            {selectedLocation && (
              <span className="portal-filter-tag">
                <EnvironmentOutlined /> {selectedLocation}
                <CloseOutlined onClick={() => setSelectedLocation(undefined)} />
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
      <div className="portal-jobs-results-header">
        <div>
          Showing <strong>{filteredJobs.length}</strong> {statusFilter === 'UNAPPLIED' ? 'unapplied' : (statusFilter === 'APPLIED' ? 'applied' : (statusFilter === 'SAVED' ? 'saved' : 'active'))} mandates
        </div>

        <div className="portal-quick-tabs-wrap">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`portal-quick-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
          >
            All Mandates ({jobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNAPPLIED')}
            className={`portal-quick-tab-btn ${statusFilter === 'UNAPPLIED' ? 'active' : ''}`}
          >
            Unapplied ({jobs.filter(j => !appliedJobsMap[j.id]).length})
          </button>
          <button
            onClick={() => setStatusFilter('SAVED')}
            className={`portal-quick-tab-btn ${statusFilter === 'SAVED' ? 'active' : ''}`}
          >
            Saved ({jobs.filter(j => savedJobsMap[j.id]).length})
          </button>
          <button
            onClick={() => setStatusFilter('APPLIED')}
            className={`portal-quick-tab-btn ${statusFilter === 'APPLIED' ? 'active' : ''}`}
          >
            Applied ({jobs.filter(j => appliedJobsMap[j.id]).length})
          </button>
        </div>
      </div>

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
            <TagOutlined /> Application Status
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            className="portal-drawer-select"
            size="large"
          >
            <Option value="ALL">All Active Mandates ({jobs.length})</Option>
            <Option value="UNAPPLIED">Unapplied Mandates Only</Option>
            <Option value="SAVED">Saved / Bookmarked Only</Option>
            <Option value="APPLIED">Applied Mandates Only</Option>
          </Select>
        </div>

        <Divider className="portal-drawer-divider" />

        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <CompassOutlined /> NCLT Bench / Location
          </div>
          <Select
            placeholder="All Locations & Benches"
            allowClear
            value={selectedLocation}
            onChange={setSelectedLocation}
            className="portal-drawer-select"
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
      </Drawer>

      {/* Jobs Grid */}
      <div className="portal-cards-grid">
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
                className="portal-glass-card portal-job-card"
              >
                <div>
                  <div className="portal-saved-card-header">
                    <div className="portal-saved-company-group">
                      <div className="portal-job-avatar">
                        {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <div>
                        <div className="portal-job-org-type">
                          {job.employer?.type || 'VERIFIED ORG'}
                        </div>
                        <div className="portal-job-org-name">
                          {job.employer?.name || 'Insolvency Entity'}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSave(job.id)}
                      className={`portal-bookmark-btn ${isSaved ? 'saved' : ''}`}
                    >
                      {isSaved ? <HeartFilled /> : <HeartOutlined />}
                    </button>
                  </div>

                  <h3 className="portal-job-card-title">
                    {job.title}
                  </h3>

                  <p className="portal-job-card-desc">
                    {job.description}
                  </p>

                  {job.requirements && (
                    <div className="portal-job-requirements-box">
                      <strong>Requirements:</strong> {job.requirements}
                    </div>
                  )}
                </div>

                <div className="portal-saved-card-footer">
                  <Link to={`/jobs/${job.id}`} className="portal-saved-view-link">
                    View Mandate ↗
                  </Link>

                  {applicationStatus ? (
                    <Tag 
                      color={applicationStatus === 'SHORTLISTED' ? 'purple' : 'cyan'} 
                      icon={<CheckCircleOutlined />}
                      className="portal-job-status-tag"
                    >
                      {applicationStatus}
                    </Tag>
                  ) : (
                    <button
                      className="portal-btn-primary portal-job-apply-btn"
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
        <div className="portal-glass-card portal-empty-state-card">
          <SearchOutlined className="portal-empty-state-icon" />
          <h3 className="portal-empty-state-title">No matching mandates found</h3>
          <p className="portal-empty-state-desc">Try adjusting your filters or keyword query.</p>
          <Button type="primary" onClick={handleResetFilters} className="portal-empty-state-btn">
            Clear All Filters
          </Button>
        </div>
      )}

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

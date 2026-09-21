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
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-heading)', margin: 0 }}>
          Insolvency & Restructuring Mandates
        </h1>
        <p style={{ color: 'var(--theme-muted)', fontSize: '14px', margin: '4px 0 0' }}>
          Browse open opportunities posted by verified Insolvency Professional Entities (IPEs), Banks, ARCs, and Consulting Firms.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px', color: 'var(--theme-subtle)', fontSize: '14px' }}>
        <div>
          Showing <strong>{filteredJobs.length}</strong> {statusFilter === 'UNAPPLIED' ? 'unapplied' : (statusFilter === 'APPLIED' ? 'applied' : (statusFilter === 'SAVED' ? 'saved' : 'active'))} mandates
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setStatusFilter('ALL')}
            style={{
              background: statusFilter === 'ALL' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(var(--theme-contrast-rgb), 0.05)',
              border: `1px solid ${statusFilter === 'ALL' ? '#38bdf8' : 'rgba(var(--theme-contrast-rgb), 0.1)'}`,
              color: statusFilter === 'ALL' ? '#38bdf8' : 'var(--theme-detail)',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            All Mandates ({jobs.length})
          </button>
          <button
            onClick={() => setStatusFilter('UNAPPLIED')}
            style={{
              background: statusFilter === 'UNAPPLIED' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(var(--theme-contrast-rgb), 0.05)',
              border: `1px solid ${statusFilter === 'UNAPPLIED' ? '#38bdf8' : 'rgba(var(--theme-contrast-rgb), 0.1)'}`,
              color: statusFilter === 'UNAPPLIED' ? '#38bdf8' : 'var(--theme-detail)',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Unapplied ({jobs.filter(j => !appliedJobsMap[j.id]).length})
          </button>
          <button
            onClick={() => setStatusFilter('SAVED')}
            style={{
              background: statusFilter === 'SAVED' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(var(--theme-contrast-rgb), 0.05)',
              border: `1px solid ${statusFilter === 'SAVED' ? '#38bdf8' : 'rgba(var(--theme-contrast-rgb), 0.1)'}`,
              color: statusFilter === 'SAVED' ? '#38bdf8' : 'var(--theme-detail)',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Saved ({jobs.filter(j => savedJobsMap[j.id]).length})
          </button>
          <button
            onClick={() => setStatusFilter('APPLIED')}
            style={{
              background: statusFilter === 'APPLIED' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(var(--theme-contrast-rgb), 0.05)',
              border: `1px solid ${statusFilter === 'APPLIED' ? '#38bdf8' : 'rgba(var(--theme-contrast-rgb), 0.1)'}`,
              color: statusFilter === 'APPLIED' ? '#38bdf8' : 'var(--theme-detail)',
              padding: '5px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Applied ({jobs.filter(j => appliedJobsMap[j.id]).length})
          </button>
        </div>
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
            <TagOutlined /> Application Status
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: '100%' }}
            size="large"
          >
            <Option value="ALL">All Active Mandates ({jobs.length})</Option>
            <Option value="UNAPPLIED">Unapplied Mandates Only</Option>
            <Option value="SAVED">Saved / Bookmarked Only</Option>
            <Option value="APPLIED">Applied Mandates Only</Option>
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
                          <div style={{ fontSize: '13px', color: 'var(--theme-link)', fontWeight: 600 }}>
                            {job.employer?.type || 'VERIFIED ORG'}
                          </div>
                          <div style={{ fontSize: '14px', color: 'var(--theme-detail)', fontWeight: 500 }}>
                            {job.employer?.name || 'Insolvency Entity'}
                          </div>
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

                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--theme-heading)', margin: '0 0 10px' }}>
                      {job.title}
                    </h3>

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

        {filteredJobs.length === 0 && !loading && (
          <div className="portal-glass-card" style={{ padding: '60px', textAlign: 'center', marginTop: '20px' }}>
            <SearchOutlined style={{ fontSize: '48px', color: 'var(--theme-link)', marginBottom: '16px', opacity: 0.6 }} />
            <h3 style={{ color: 'var(--theme-heading)', fontSize: '20px', margin: 0 }}>No matching mandates found</h3>
            <p style={{ color: 'var(--theme-muted)', marginTop: '8px' }}>Try adjusting your filters or keyword query.</p>
            <Button type="primary" onClick={handleResetFilters} style={{ marginTop: '12px', borderRadius: '8px' }}>
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

export default CandidateJobs;

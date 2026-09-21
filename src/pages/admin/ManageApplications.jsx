import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApplications, updateAdminApplicationStatus } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import { 
  SearchOutlined, 
  SolutionOutlined, 
  EyeOutlined, 
  ReloadOutlined, 
  CalendarOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, Drawer, Divider, message, Space } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageApplications = () => {
  const dispatch = useDispatch();
  const { applications: reduxApps, loading: reduxLoading } = useSelector((state) => state.admin);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await dispatch(fetchAdminApplications(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setApplications(list);
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Failed to load application activity');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const activeFiltersCount = [
    statusFilter !== 'ALL' ? statusFilter : null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, dispatch]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setActionLoadingId(appId);
    try {
      await dispatch(updateAdminApplicationStatus({ id: appId, status: newStatus })).unwrap();
      message.success(`Application status updated to ${newStatus}`);
      setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)));
      if (selectedApp?.id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update application status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openAppModal = (app) => {
    setSelectedApp(app);
    setModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPLIED': return 'blue';
      case 'SHORTLISTED': return 'gold';
      case 'INTERVIEW': return 'purple';
      case 'SELECTED': return 'green';
      case 'REJECTED': return 'red';
      case 'WITHDRAWN': return 'default';
      default: return 'blue';
    }
  };

  const columns = [
    {
      title: 'Candidate',
      key: 'candidate',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theme-link)',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            {record.candidate?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--theme-heading)', fontSize: '14px' }}>{record.candidate?.name || 'Unknown Candidate'}</div>
            <div style={{ fontSize: '12px', color: 'var(--theme-muted)' }}>{record.candidate?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mandate / Role',
      key: 'job',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--theme-heading)', fontSize: '14px' }}>{record.job?.title || 'Unknown Job'}</div>
          <div style={{ fontSize: '12px', color: 'var(--theme-link)', marginTop: '2px' }}>
            🏢 {record.job?.employer?.name || 'Unknown Entity'}
          </div>
        </div>
      ),
    },
    {
      title: 'Applied Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span style={{ color: 'var(--theme-detail)', fontSize: '13px' }}>
          <CalendarOutlined style={{ marginRight: '4px' }} />
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Pipeline Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} style={{ fontWeight: 600 }}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => openAppModal(record)}
            style={{ 
              background: 'rgba(var(--theme-contrast-rgb), 0.08)', 
              borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)', 
              color: '#e0f2fe',
              borderRadius: '6px'
            }}
          >
            Details
          </Button>

          <Select
            size="small"
            value={record.status}
            onChange={(val) => handleUpdateStatus(record.id, val)}
            loading={actionLoadingId === record.id}
            style={{ width: 130 }}
          >
            <Option value="APPLIED">Applied</Option>
            <Option value="SHORTLISTED">Shortlisted</Option>
            <Option value="INTERVIEW">Interview</Option>
            <Option value="SELECTED">Selected</Option>
            <Option value="REJECTED">Rejected</Option>
            <Option value="WITHDRAWN">Withdrawn</Option>
          </Select>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <AdminHeader 
          title="Application Pipeline & Moderation" 
          subtitle="Audit candidate submissions, track hiring pipeline health, and assist resolution support."
          actions={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchApplications}
              loading={loading}
              className="portal-btn-secondary"
            >
              Refresh
            </Button>
          }
        />

        {/* Clean Search & Filter Bar */}
        <div 
          className="portal-glass-card" 
          style={{ 
            padding: '16px 20px', 
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', gap: '8px' }}>
              <Input 
                prefix={<SearchOutlined style={{ color: 'var(--theme-muted)' }} />}
                placeholder="Search candidate, email, mandate, or entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={fetchApplications}
                style={{
                  background: 'rgba(var(--theme-contrast-rgb), 0.05)',
                  borderColor: 'rgba(var(--theme-contrast-rgb), 0.12)',
                  color: 'var(--theme-heading)',
                  borderRadius: '10px',
                  height: '44px'
                }}
                allowClear
              />
              <Button 
                type="primary" 
                onClick={fetchApplications} 
                style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '10px', height: '44px', fontWeight: 600 }}
              >
                Search
              </Button>
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

            {(activeFiltersCount > 0 || search) && (
              <Tooltip title="Reset all filters">
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={() => {
                    handleResetFilters();
                    fetchApplications();
                  }}
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
          {(activeFiltersCount > 0) && (
            <div className="portal-active-filters-bar">
              <span className="portal-active-filters-label">Active Filters:</span>
              
              {statusFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <TagOutlined /> Status: {statusFilter}
                  <CloseOutlined onClick={() => setStatusFilter('ALL')} />
                </span>
              )}
            </div>
          )}
        </div>

        {/* Filter Drawer */}
        <Drawer
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ color: 'var(--theme-link)' }} />
              <span>Filter Candidate Applications</span>
            </div>
          }
          placement="right"
          width={380}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                onClick={() => {
                  handleResetFilters();
                  setDrawerOpen(false);
                }}
                disabled={activeFiltersCount === 0 && !search}
                style={{ borderRadius: '8px', background: 'transparent', color: 'var(--theme-subtle)', border: '1px solid rgba(var(--theme-contrast-rgb),0.15)' }}
              >
                Reset All
              </Button>
              <Button 
                type="primary" 
                onClick={() => {
                  setDrawerOpen(false);
                  fetchApplications();
                }}
                style={{ borderRadius: '8px', background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 600 }}
              >
                Apply & View ({applications.length})
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
              <Option value="ALL">All Statuses</Option>
              <Option value="APPLIED">Applied / In Review</Option>
              <Option value="SHORTLISTED">Shortlisted</Option>
              <Option value="INTERVIEW">Interview Scheduled</Option>
              <Option value="SELECTED">Selected / Hired</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="WITHDRAWN">Withdrawn</Option>
            </Select>
          </div>
        </Drawer>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card" 
          style={{ padding: '20px' }}
        >
          <Table 
            columns={columns}
            dataSource={applications}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            className="portal-table"
          />
        </motion.div>

        {/* Application Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--theme-heading)', fontSize: '18px', fontWeight: 700 }}>
              <SolutionOutlined style={{ color: 'var(--theme-link)' }} /> Application Dossier #{selectedApp?.id}
            </div>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={720}
          styles={{
            content: { background: 'var(--theme-surface)', border: '1px solid rgba(var(--theme-contrast-rgb), 0.12)', borderRadius: '20px' },
            header: { background: 'var(--theme-surface)' },
          }}
        >
          {selectedApp && (
            <div style={{ color: 'var(--theme-secondary)', marginTop: '16px' }}>
              <div 
                style={{
                  padding: '16px',
                  background: 'rgba(var(--theme-contrast-rgb), 0.04)',
                  border: '1px solid rgba(var(--theme-contrast-rgb), 0.08)',
                  borderRadius: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: 'var(--theme-heading)', fontSize: '20px' }}>{selectedApp.job?.title}</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--theme-link)', fontSize: '14px', fontWeight: 500 }}>
                    🏢 {selectedApp.job?.employer?.name}
                  </p>
                </div>
                <Tag color={getStatusColor(selectedApp.status)} style={{ fontSize: '13px', padding: '4px 12px', fontWeight: 600 }}>
                  {selectedApp.status}
                </Tag>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(var(--theme-contrast-rgb),0.03)', border: '1px solid rgba(var(--theme-contrast-rgb),0.08)', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--theme-link)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Candidate Profile Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                    <div><span style={{ color: 'var(--theme-muted)' }}>Name:</span> <strong style={{ color: 'var(--theme-heading)', marginLeft: '6px' }}>{selectedApp.candidate?.name}</strong></div>
                    <div><span style={{ color: 'var(--theme-muted)' }}>Email:</span> <strong style={{ color: 'var(--theme-heading)', marginLeft: '6px' }}>{selectedApp.candidate?.email}</strong></div>
                    <div><span style={{ color: 'var(--theme-muted)' }}>Location:</span> <strong style={{ color: 'var(--theme-heading)', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.city || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--theme-muted)' }}>Experience:</span> <strong style={{ color: 'var(--theme-heading)', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.experience ? `${selectedApp.candidate.candidateProfile.experience} Yrs` : 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--theme-muted)' }}>Designation:</span> <strong style={{ color: 'var(--theme-heading)', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.designation || 'N/A'}</strong></div>
                    <div><span style={{ color: 'var(--theme-muted)' }}>Notice Period:</span> <strong style={{ color: 'var(--theme-heading)', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.noticePeriod || 'N/A'}</strong></div>
                  </div>
                </div>

                {selectedApp.candidate?.candidateProfile?.skills?.length > 0 && (
                  <div style={{ padding: '16px', background: 'rgba(var(--theme-contrast-rgb),0.03)', border: '1px solid rgba(var(--theme-contrast-rgb),0.08)', borderRadius: '12px' }}>
                    <h4 style={{ color: 'var(--theme-link)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Candidate Skills
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedApp.candidate.candidateProfile.skills.map((s) => (
                        <Tag key={s.skill.id} color="cyan" style={{ padding: '4px 10px', borderRadius: '6px' }}>
                          {s.skill.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button 
                  onClick={() => setModalOpen(false)}
                  style={{
                    background: 'rgba(var(--theme-contrast-rgb), 0.08)',
                    border: '1px solid rgba(var(--theme-contrast-rgb), 0.15)',
                    color: 'var(--theme-heading)',
                    borderRadius: '8px',
                    padding: '6px 18px'
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default ManageApplications;

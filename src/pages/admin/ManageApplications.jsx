import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApplications, updateAdminApplicationStatus } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import {
  SearchOutlined,
  SolutionOutlined,
  EyeOutlined,
  EditOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, Drawer, Divider, Dropdown, message, Space, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageApplications = () => {
  const dispatch = useDispatch();
  const { applications: reduxApps, loading: reduxLoading } = useSelector((state) => state.admin);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchApplications = async (requestedPage = page) => {
    setLoading(true);
    try {
      const params = { page: requestedPage, pageSize: 8 };
      if (submittedSearch) params.search = submittedSearch;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await dispatch(fetchAdminApplications(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setApplications(list);
      setPagination(res.pagination || { total: list.length });
    } catch (error) {
      console.error('Error fetching applications:', error);
      message.error('Failed to load application activity');
    } finally {
      setLoading(false);
    }
  };

  const activeFiltersCount = [
    statusFilter !== 'ALL' ? statusFilter : null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setSubmittedSearch('');
    setStatusFilter('ALL');
    setPage(1);
  };

  useEffect(() => {
    fetchApplications(page);
  }, [statusFilter, submittedSearch, page, dispatch]);

  const applySearch = () => {
    const nextSearch = search.trim();
    if (page === 1 && submittedSearch === nextSearch) fetchApplications(1);
    else { setSubmittedSearch(nextSearch); setPage(1); }
  };

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
        <div className="portal-flex-center-gap-10">
          <div className="portal-candidate-avatar-36">
            {record.candidate?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="portal-candidate-name-cell">{record.candidate?.name || 'Unknown Candidate'}</div>
            <div className="portal-text-muted-12">{record.candidate?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Job / Role',
      key: 'job',
      render: (_, record) => (
        <div>
          <div className="portal-job-title-cell">{record.job?.title || 'Unknown Job'}</div>
          <div className="portal-job-employer-cell">
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
        <span className="portal-text-detail-13">
          {/* <CalendarOutlined className="portal-mr-4" /> */}
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Pipeline Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)} className="portal-fw-600">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View Application Details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              aria-label="View application details"
              onClick={() => openAppModal(record)}
              className="portal-btn-review"
            />
          </Tooltip>

          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                { key: 'APPLIED', label: 'Applied' },
                { key: 'SHORTLISTED', label: 'Shortlisted' },
                { key: 'INTERVIEW', label: 'Interview' },
                { key: 'SELECTED', label: 'Selected' },
                { key: 'REJECTED', label: 'Rejected' },
                { key: 'WITHDRAWN', label: 'Withdrawn' },
              ].map((item) => ({ ...item, disabled: item.key === record.status })),
              onClick: ({ key }) => handleUpdateStatus(record.id, key),
            }}
          >
            <Tooltip title="Change application status">
              <Button size="small" icon={<EditOutlined />} loading={actionLoadingId === record.id} aria-label="Change application status" className="portal-btn-neutral" />
            </Tooltip>
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader
        title="Application Pipeline & Moderation"
        subtitle="Audit candidate submissions, track hiring pipeline health, and assist resolution support."
      />

      {/* Clean Search & Filter Bar */}
      <div className="portal-mb-24">
        <div className="portal-flex-wrap-gap-12">
          <div className="portal-flex-grow-gap-8">
            <Input
              prefix={<SearchOutlined className="portal-muted-icon" />}
              placeholder="Search candidate, email, job, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={applySearch}
              className="portal-input-h44"
              allowClear
            />
            <Button
              type="primary"
              onClick={applySearch}
              className="portal-btn-cyan-h44"
            >
              Search
            </Button>
          </div>

          <button
            type="button"
            className={`portal-filter-trigger-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
            onClick={() => setDrawerOpen(true)}
          >
            <FilterOutlined className={activeFiltersCount > 0 ? 'portal-text-cyan' : ''} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="portal-filter-badge-count">
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
                }}
                className="portal-btn-icon-h44"
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
                <CloseOutlined onClick={() => { setStatusFilter('ALL'); setPage(1); }} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <Drawer
        title={
          <div className="portal-drawer-title-row">
            <FilterOutlined className="portal-text-link" />
            <span>Filter Candidate Applications</span>
          </div>
        }
        placement="right"
        width={380}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="portal-between-row">
            <Button
              onClick={() => {
                handleResetFilters();
                setDrawerOpen(false);
              }}
              disabled={activeFiltersCount === 0 && !search}
              className="portal-btn-ghost"
            >
              Reset All
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setDrawerOpen(false);
                applySearch();
              }}
              className="portal-btn-cyan-apply"
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
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
            className="portal-w-full"
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
        className="portal-glass-card portal-p-20"
      >
        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize: 8, total: pagination.total, showSizeChanger: false, onChange: setPage }}
          className="portal-table"
        />
      </motion.div>

      {/* Application Modal */}
      <Modal
        title={
          <div className="portal-modal-header-row">
            <SolutionOutlined className="portal-text-link" /> Application Details #{selectedApp?.id}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={720}
      >
        {selectedApp && (
          <div className="portal-text-secondary portal-mt-16">
            <div className="portal-details-card-head">
              <div>
                <h3 className="portal-m-0 portal-text-heading portal-text-20">{selectedApp.job?.title}</h3>
                <p className="portal-job-sub-link">
                  🏢 {selectedApp.job?.employer?.name}
                </p>
              </div>
              <Tag color={getStatusColor(selectedApp.status)} className="portal-tag-status-lg">
                {selectedApp.status}
              </Tag>
            </div>

            <div className="portal-flex-col-gap-16">
              <div className="portal-info-bordered-box">
                <h4 className="portal-subhead-link-caps">
                  Candidate Profile Information
                </h4>
                <div className="portal-grid-2col-gap-12">
                  <div><span className="portal-text-muted">Name:</span> <strong className="portal-strong-heading">{selectedApp.candidate?.name}</strong></div>
                  <div><span className="portal-text-muted">Email:</span> <strong className="portal-strong-heading">{selectedApp.candidate?.email}</strong></div>
                  <div><span className="portal-text-muted">Location:</span> <strong className="portal-strong-heading">{selectedApp.candidate?.candidateProfile?.city || 'N/A'}</strong></div>
                  <div><span className="portal-text-muted">Experience:</span> <strong className="portal-strong-heading">{selectedApp.candidate?.candidateProfile?.experience ? `${selectedApp.candidate.candidateProfile.experience} Yrs` : 'N/A'}</strong></div>
                  <div><span className="portal-text-muted">Designation:</span> <strong className="portal-strong-heading">{selectedApp.candidate?.candidateProfile?.designation || 'N/A'}</strong></div>
                  <div><span className="portal-text-muted">Notice Period:</span> <strong className="portal-strong-heading">{selectedApp.candidate?.candidateProfile?.noticePeriod || 'N/A'}</strong></div>
                </div>
              </div>

              {selectedApp.candidate?.candidateProfile?.skills?.length > 0 && (
                <div className="portal-info-bordered-box">
                  <h4 className="portal-subhead-link-caps">
                    Candidate Skills
                  </h4>
                  <div className="portal-flex-wrap-gap-8">
                    {selectedApp.candidate.candidateProfile.skills.map((s) => (
                      <Tag key={s.skill.id} color="cyan" className="portal-tag-skill">
                        {s.skill.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="portal-flex-end-gap-10 portal-mt-24">
              <Button
                onClick={() => setModalOpen(false)}
                className="portal-btn-secondary-custom"
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

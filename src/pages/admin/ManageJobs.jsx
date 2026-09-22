import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminJobs, updateAdminJobStatus, deleteAdminJob } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import { 
  SearchOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  PauseCircleOutlined, 
  CloseCircleOutlined, 
  StopOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  ReloadOutlined, 
  BankOutlined, 
  SolutionOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, Drawer, Divider, message, Space, Popconfirm, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageJobs = () => {
  const dispatch = useDispatch();
  const { jobs: reduxJobs, loading: reduxLoading } = useSelector((state) => state.admin);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await dispatch(fetchAdminJobs(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setJobs(list);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      message.error('Failed to load job listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const activeFiltersCount = [
    statusFilter !== 'ALL' ? statusFilter : null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, dispatch]);

  const handleUpdateStatus = async (jobId, newStatus) => {
    setActionLoadingId(jobId);
    try {
      await dispatch(updateAdminJobStatus({ id: jobId, status: newStatus })).unwrap();
      message.success(`Job status changed to ${newStatus}`);
      setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: newStatus } : j)));
      if (selectedJob?.id === jobId) {
        setSelectedJob((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update job status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteJob = async (jobId) => {
    setActionLoadingId(jobId);
    try {
      await dispatch(deleteAdminJob(jobId)).unwrap();
      message.success('Job listing deleted successfully');
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      if (selectedJob?.id === jobId) {
        setModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      message.error(typeof error === 'string' ? error : 'Failed to delete job');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openJobModal = (job) => {
    setSelectedJob(job);
    setModalOpen(true);
  };

  const columns = [
    {
      title: 'Mandate / Job Title',
      key: 'title',
      render: (_, record) => (
        <div>
          <div className="portal-mandate-cell-title">{record.title}</div>
          <div className="portal-mandate-cell-sub">
            <BankOutlined /> {record.employer?.name || 'Unknown Entity'}
            {record.employer?.type && <Tag color="purple" className="portal-tag-xs-purple">{record.employer.type}</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Applications',
      key: 'applications',
      render: (_, record) => (
        <Tag color="cyan" className="portal-fw-600">
          <SolutionOutlined /> {record._count?.applications || 0} Submissions
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        if (status === 'PAUSED') color = 'gold';
        if (status === 'CLOSED') color = 'default';
        if (status === 'SUSPENDED') color = 'red';
        return <Tag color={color} className="portal-fw-600">{status}</Tag>;
      },
    },
    {
      title: 'Listed Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="portal-text-detail-13">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => openJobModal(record)}
            className="portal-btn-review"
          >
            Review
          </Button>

          {record.status !== 'ACTIVE' && (
            <Button
              size="small"
              type="primary"
              loading={actionLoadingId === record.id}
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'ACTIVE')}
              className="portal-btn-approve-sm"
            >
              Approve
            </Button>
          )}

          {record.status === 'ACTIVE' && (
            <Button
              size="small"
              loading={actionLoadingId === record.id}
              icon={<PauseCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'PAUSED')}
              className="portal-btn-pause-sm"
            >
              Pause
            </Button>
          )}

          {record.status !== 'CLOSED' && (
            <Button
              size="small"
              loading={actionLoadingId === record.id}
              icon={<CloseCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'CLOSED')}
              className="portal-btn-close-sm"
            >
              Close
            </Button>
          )}

          <Popconfirm
            title="Delete this mandate?"
            description="Are you sure you want to delete this job and related applications?"
            onConfirm={() => handleDeleteJob(record.id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              loading={actionLoadingId === record.id}
              icon={<DeleteOutlined />}
              className="portal-btn-radius-6"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader 
          title="Mandates & Job Listings Moderation" 
          subtitle="Audit, approve, pause, close, or remove insolvency and restructuring job mandates."
          actions={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchJobs}
              loading={loading}
              className="portal-btn-secondary"
            >
              Refresh
            </Button>
          }
        />

        {/* Clean Search & Filter Bar */}
        <div className="portal-glass-card portal-p-16-20 portal-mb-24">
          <div className="portal-flex-wrap-gap-12">
            <div className="portal-flex-grow-gap-8">
              <Input 
                prefix={<SearchOutlined className="portal-muted-icon" />}
                placeholder="Search mandate title, employer, requirements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={fetchJobs}
                className="portal-input-h44"
                allowClear
              />
              <Button 
                type="primary" 
                onClick={fetchJobs} 
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
                    fetchJobs();
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
                  <CloseOutlined onClick={() => setStatusFilter('ALL')} />
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
              <span>Filter Mandates & Jobs</span>
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
                  fetchJobs();
                }}
                className="portal-btn-cyan-apply"
              >
                Apply & View ({jobs.length})
              </Button>
            </div>
          }
        >
          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <TagOutlined /> Listing Status
            </div>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              className="portal-w-full"
              size="large"
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="ACTIVE">Active Mandates</Option>
              <Option value="PAUSED">Paused Listings</Option>
              <Option value="CLOSED">Closed Mandates</Option>
              <Option value="SUSPENDED">Suspended Listings</Option>
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
            dataSource={jobs}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            className="portal-table"
          />
        </motion.div>

        {/* Job Details Modal */}
        <Modal
          title={
            <div className="portal-modal-header-row">
              <FileTextOutlined className="portal-text-link" /> Mandate Review Dossier #{selectedJob?.id}
            </div>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={760}
        >
          {selectedJob && (
            <div className="portal-text-secondary portal-mt-16">
              <div className="portal-dossier-top-box">
                <div className="portal-between-start">
                  <div>
                    <h3 className="portal-m-0 portal-text-heading portal-text-22">{selectedJob.title}</h3>
                    <p className="portal-dossier-employer-sub">
                      🏢 {selectedJob.employer?.name || 'Unknown Entity'}
                    </p>
                  </div>
                  <Tag color={selectedJob.status === 'ACTIVE' ? 'green' : (selectedJob.status === 'PAUSED' ? 'gold' : 'default')}>
                    {selectedJob.status}
                  </Tag>
                </div>
              </div>

              <div className="portal-flex-col-gap-18">
                <div>
                  <h4 className="portal-dossier-section-title">
                    Mandate Scope & Description
                  </h4>
                  <div className="portal-dossier-text-box">
                    {selectedJob.description}
                  </div>
                </div>

                <div>
                  <h4 className="portal-dossier-section-title">
                    Eligibility & Statutory Requirements
                  </h4>
                  <div className="portal-dossier-text-box">
                    {selectedJob.requirements}
                  </div>
                </div>

                {selectedJob.skills?.length > 0 && (
                  <div>
                    <h4 className="portal-dossier-section-title">
                      Required Specialisations & Skills
                    </h4>
                    <div className="portal-flex-wrap-gap-6">
                      {selectedJob.skills.map((s) => (
                        <Tag key={s.skill.id} color="blue">{s.skill.name}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="portal-modal-footer-actions">
                <Button onClick={() => setModalOpen(false)}>Close</Button>
                {selectedJob.status !== 'ACTIVE' && (
                  <Button
                    type="primary"
                    className="portal-btn-approve-green"
                    onClick={() => handleUpdateStatus(selectedJob.id, 'ACTIVE')}
                    loading={actionLoadingId === selectedJob.id}
                  >
                    Approve Mandate
                  </Button>
                )}
                {selectedJob.status === 'ACTIVE' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedJob.id, 'PAUSED')}
                    loading={actionLoadingId === selectedJob.id}
                  >
                    Pause Mandate
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default ManageJobs;

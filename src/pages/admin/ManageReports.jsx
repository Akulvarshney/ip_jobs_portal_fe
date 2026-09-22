import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminReports, updateAdminReportStatus, createAdminReport } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import { 
  SearchOutlined, 
  AlertOutlined, 
  EyeOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  PlusOutlined,
  WarningOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseOutlined,
  TagOutlined,
  FlagOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, Drawer, Divider, Form, message, Space, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;
const { TextArea } = Input;

const ManageReports = () => {
  const dispatch = useDispatch();
  const { reports: reduxReports, loading: reduxLoading } = useSelector((state) => state.admin);

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [form] = Form.useForm();

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await dispatch(fetchAdminReports(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setReports(list);
    } catch (error) {
      console.error('Error fetching reports:', error);
      message.error('Failed to load moderation reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter]);

  const activeFiltersCount = [
    statusFilter !== 'ALL' ? statusFilter : null,
    typeFilter !== 'ALL' ? typeFilter : null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, typeFilter, dispatch]);

  const handleUpdateStatus = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    try {
      await dispatch(updateAdminReportStatus({ id: reportId, status: newStatus })).unwrap();
      message.success(`Report #${reportId} status updated to ${newStatus}`);
      setReports((prev) => prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)));
      if (selectedReport?.id === reportId) {
        setSelectedReport((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating report status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update report status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCreateReport = async (values) => {
    try {
      await dispatch(createAdminReport(values)).unwrap();
      message.success('Moderation report created successfully');
      setCreateModalOpen(false);
      form.resetFields();
      fetchReports();
    } catch (error) {
      console.error('Error creating report:', error);
      message.error(typeof error === 'string' ? error : 'Failed to create report');
    }
  };

  const openReportModal = (report) => {
    setSelectedReport(report);
    setDetailModalOpen(true);
  };

  const getTypeTagColor = (type) => {
    switch (type) {
      case 'Fake job': return 'red';
      case 'Fake organisation': return 'volcano';
      case 'Spam': return 'orange';
      case 'Inappropriate content': return 'magenta';
      default: return 'blue';
    }
  };

  const getStatusTagColor = (status) => {
    switch (status) {
      case 'OPEN': return 'error';
      case 'INVESTIGATING': return 'warning';
      case 'RESOLVED': return 'success';
      case 'REJECTED': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: 'Report ID & Type',
      key: 'type',
      render: (_, record) => (
        <div>
          <Tag color={getTypeTagColor(record.type)} className="portal-fw-600">
            {record.type}
          </Tag>
          <span className="portal-text-muted-12 portal-ml-6">#{record.id}</span>
        </div>
      ),
    },
    {
      title: 'Description & Concern',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span className="portal-report-desc-truncate">
          {text}
        </span>
      ),
    },
    {
      title: 'Reported Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="portal-text-detail-13">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusTagColor(status)} className="portal-fw-600">
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
            onClick={() => openReportModal(record)}
            className="portal-btn-review"
          >
            Review
          </Button>

          {record.status === 'OPEN' && (
            <Button
              size="small"
              icon={<SyncOutlined />}
              loading={actionLoadingId === record.id}
              onClick={() => handleUpdateStatus(record.id, 'INVESTIGATING')}
              className="portal-btn-pause-sm"
            >
              Investigate
            </Button>
          )}

          {record.status !== 'RESOLVED' && (
            <Button
              size="small"
              type="primary"
              icon={<CheckCircleOutlined />}
              loading={actionLoadingId === record.id}
              onClick={() => handleUpdateStatus(record.id, 'RESOLVED')}
              className="portal-btn-approve-sm"
            >
              Resolve
            </Button>
          )}

          {record.status !== 'REJECTED' && record.status !== 'RESOLVED' && (
            <Button
              size="small"
              icon={<CloseCircleOutlined />}
              loading={actionLoadingId === record.id}
              onClick={() => handleUpdateStatus(record.id, 'REJECTED')}
              className="portal-btn-close-sm"
            >
              Reject
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader 
          title="Platform Moderation & Reports" 
          subtitle="Audit reported fake jobs, unverified organisations, spam mandates, or compliance violations."
          actions={
            <div className="portal-flex-gap-10">
              <button 
                className="portal-btn-primary portal-btn-sm-13" 
                onClick={() => setCreateModalOpen(true)}
              >
                <PlusOutlined /> Log New Report
              </button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchReports}
                loading={loading}
                className="portal-btn-secondary"
              >
                Refresh
              </Button>
            </div>
          }
        />

        {/* Clean Search & Filter Bar */}
        <div className="portal-glass-card portal-p-16-20 portal-mb-24">
          <div className="portal-flex-wrap-gap-12">
            <div className="portal-flex-grow-gap-8">
              <Input 
                prefix={<SearchOutlined className="portal-muted-icon" />}
                placeholder="Search report description, reason, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={fetchReports}
                className="portal-input-h44"
                allowClear
              />
              <Button 
                type="primary" 
                onClick={fetchReports} 
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
                    fetchReports();
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

              {typeFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <FlagOutlined /> Type: {typeFilter}
                  <CloseOutlined onClick={() => setTypeFilter('ALL')} />
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
              <span>Filter Moderation Reports</span>
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
                  fetchReports();
                }}
                className="portal-btn-cyan-apply"
              >
                Apply & View ({reports.length})
              </Button>
            </div>
          }
        >
          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <TagOutlined /> Moderation Status
            </div>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              className="portal-w-full"
              size="large"
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="OPEN">Open Reports</Option>
              <Option value="INVESTIGATING">Under Investigation</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="REJECTED">Dismissed / Rejected</Option>
            </Select>
          </div>

          <Divider className="portal-divider-subtle" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <FlagOutlined /> Report Reason / Type
            </div>
            <Select 
              value={typeFilter} 
              onChange={setTypeFilter}
              className="portal-w-full"
              size="large"
            >
              <Option value="ALL">All Report Types</Option>
              <Option value="Fake job">Fake Mandate / Job</Option>
              <Option value="Fake organisation">Fake Organisation</Option>
              <Option value="Spam">Spam / Unsolicited</Option>
              <Option value="Inappropriate content">Inappropriate Content</Option>
              <Option value="Other issue">Other Issue</Option>
            </Select>
          </div>
        </Drawer>

        {/* Reports Table */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card portal-p-20"
        >
          <Table 
            columns={columns}
            dataSource={reports}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            className="portal-table"
          />
        </motion.div>

        {/* Report Review Modal */}
        <Modal
          title={
            <div className="portal-modal-header-row">
              <AlertOutlined className="portal-text-danger" /> Moderation Incident Review #{selectedReport?.id}
            </div>
          }
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          width={650}
        >
          {selectedReport && (
            <div className="portal-text-secondary portal-mt-16">
              <div className="portal-incident-box-alert">
                <div>
                  <Tag color={getTypeTagColor(selectedReport.type)} className="portal-tag-report-type">
                    {selectedReport.type}
                  </Tag>
                  <span className="portal-text-muted-13-ml8">
                    Logged on {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>
                <Tag color={getStatusTagColor(selectedReport.status)}>
                  {selectedReport.status}
                </Tag>
              </div>

              <div>
                <h4 className="portal-subhead-link-soft">
                  Reported Incident Statement
                </h4>
                <div className="portal-incident-statement-box">
                  {selectedReport.description}
                </div>
              </div>

              <div className="portal-modal-footer-actions">
                <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
                {selectedReport.status === 'OPEN' && (
                  <Button
                    onClick={() => handleUpdateStatus(selectedReport.id, 'INVESTIGATING')}
                    loading={actionLoadingId === selectedReport.id}
                  >
                    Start Investigation
                  </Button>
                )}
                {selectedReport.status !== 'RESOLVED' && (
                  <Button
                    type="primary"
                    className="portal-btn-approve-green"
                    onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                    loading={actionLoadingId === selectedReport.id}
                  >
                    Mark Resolved
                  </Button>
                )}
                {selectedReport.status !== 'REJECTED' && selectedReport.status !== 'RESOLVED' && (
                  <Button
                    danger
                    onClick={() => handleUpdateStatus(selectedReport.id, 'REJECTED')}
                    loading={actionLoadingId === selectedReport.id}
                  >
                    Dismiss / Reject Report
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Create Test Report Modal */}
        <Modal
          title={
            <div className="portal-modal-header-row">
              <WarningOutlined className="portal-text-warning" /> Log Moderation Incident
            </div>
          }
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          footer={null}
        >
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleCreateReport} 
            className="portal-mt-16"
            initialValues={{ type: 'Fake job' }}
          >
            <Form.Item 
              label="Incident / Violation Type" 
              name="type" 
              rules={[{ required: true, message: 'Select report type' }]}
            >
              <Select size="large">
                <Option value="Fake job">Fake job</Option>
                <Option value="Fake organisation">Fake organisation</Option>
                <Option value="Spam">Spam</Option>
                <Option value="Inappropriate content">Inappropriate content</Option>
                <Option value="Other issue">Other issue</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              label="Incident Description & Details" 
              name="description" 
              rules={[{ required: true, message: 'Please describe the violation' }]}
            >
              <TextArea rows={4} placeholder="Describe the suspected spam, fake CIRP mandate, or misconduct..." />
            </Form.Item>

            <Form.Item className="portal-form-item-submit">
              <button className="portal-btn-primary portal-w-full portal-p-12" type="submit">
                Submit Incident Report
              </button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};

export default ManageReports;

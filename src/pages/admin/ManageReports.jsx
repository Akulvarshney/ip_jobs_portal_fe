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
  WarningOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, Form, message, Space, Tooltip } from 'antd';
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
          <Tag color={getTypeTagColor(record.type)} style={{ fontWeight: 600 }}>
            {record.type}
          </Tag>
          <span style={{ fontSize: '12px', color: '#9ca3af', marginLeft: '6px' }}>#{record.id}</span>
        </div>
      ),
    },
    {
      title: 'Description & Concern',
      dataIndex: 'description',
      key: 'description',
      render: (text) => (
        <span style={{ color: '#e2e8f0', fontSize: '14px', maxWidth: '380px', display: 'inline-block' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Reported Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusTagColor(status)} style={{ fontWeight: 600 }}>
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
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)', 
              borderColor: 'rgba(255, 255, 255, 0.15)', 
              color: '#e0f2fe',
              borderRadius: '6px'
            }}
          >
            Review
          </Button>

          {record.status === 'OPEN' && (
            <Button
              size="small"
              icon={<SyncOutlined />}
              loading={actionLoadingId === record.id}
              onClick={() => handleUpdateStatus(record.id, 'INVESTIGATING')}
              style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde047', borderRadius: '6px' }}
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
              style={{ background: '#10b981', borderColor: '#10b981', borderRadius: '6px' }}
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
              style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#9ca3af', borderRadius: '6px' }}
            >
              Reject
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <AdminHeader 
          title="Platform Moderation & Reports" 
          subtitle="Audit reported fake jobs, unverified organisations, spam mandates, or compliance violations."
          actions={
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="portal-btn-primary" 
                style={{ padding: '8px 16px', fontSize: '13px' }}
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

        {/* Search and Filters */}
        <div 
          className="portal-glass-card" 
          style={{ 
            padding: '16px 20px', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ flex: '1 1 280px', display: 'flex', gap: '8px' }}>
            <Input 
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Search by report description, reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchReports}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: 'white',
                borderRadius: '10px'
              }}
              allowClear
            />
            <Button type="primary" onClick={fetchReports} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '10px' }}>
              Search
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Status:</span>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: 160 }}
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="OPEN">Open</Option>
              <Option value="INVESTIGATING">Investigating</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="REJECTED">Rejected</Option>
            </Select>

            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Type:</span>
            <Select 
              value={typeFilter} 
              onChange={setTypeFilter}
              style={{ width: 180 }}
            >
              <Option value="ALL">All Report Types</Option>
              <Option value="Fake job">Fake Job</Option>
              <Option value="Fake organisation">Fake Organisation</Option>
              <Option value="Spam">Spam</Option>
              <Option value="Inappropriate content">Inappropriate Content</Option>
              <Option value="Other issue">Other Issue</Option>
            </Select>
          </div>
        </div>

        {/* Reports Table */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card" 
          style={{ padding: '20px' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '18px', fontWeight: 700 }}>
              <AlertOutlined style={{ color: '#ef4444' }} /> Moderation Incident Review #{selectedReport?.id}
            </div>
          }
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          width={650}
          styles={{
            content: { background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px' },
            header: { background: '#1e293b' },
          }}
        >
          {selectedReport && (
            <div style={{ color: '#e2e8f0', marginTop: '16px' }}>
              <div 
                style={{
                  padding: '16px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <Tag color={getTypeTagColor(selectedReport.type)} style={{ fontSize: '13px', padding: '4px 10px' }}>
                    {selectedReport.type}
                  </Tag>
                  <span style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '8px' }}>
                    Logged on {new Date(selectedReport.createdAt).toLocaleString()}
                  </span>
                </div>
                <Tag color={getStatusTagColor(selectedReport.status)}>
                  {selectedReport.status}
                </Tag>
              </div>

              <div>
                <h4 style={{ color: '#bae6fd', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Reported Incident Statement
                </h4>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '10px', lineHeight: 1.6, color: '#f3f4f6' }}>
                  {selectedReport.description}
                </div>
              </div>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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
                    style={{ background: '#10b981', borderColor: '#10b981' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '18px', fontWeight: 700 }}>
              <WarningOutlined style={{ color: '#f59e0b' }} /> Log Moderation Incident
            </div>
          }
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          footer={null}
          styles={{
            content: { background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px' },
            header: { background: '#1e293b' },
          }}
        >
          <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleCreateReport} 
            style={{ marginTop: '16px' }}
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

            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <button className="portal-btn-primary" type="submit" style={{ width: '100%', padding: '12px' }}>
                Submit Incident Report
              </button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
  );
};

export default ManageReports;

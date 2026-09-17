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
  SolutionOutlined 
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, message, Space, Popconfirm, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageJobs = () => {
  const dispatch = useDispatch();
  const { jobs: reduxJobs, loading: reduxLoading } = useSelector((state) => state.admin);

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
          <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '15px' }}>{record.title}</div>
          <div style={{ fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            <BankOutlined /> {record.employer?.name || 'Unknown Entity'}
            {record.employer?.type && <Tag color="purple" style={{ fontSize: '10px', padding: '0 4px', margin: 0 }}>{record.employer.type}</Tag>}
          </div>
        </div>
      ),
    },
    {
      title: 'Applications',
      key: 'applications',
      render: (_, record) => (
        <Tag color="cyan" style={{ fontWeight: 600 }}>
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
        return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
      },
    },
    {
      title: 'Listed Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
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
            style={{ 
              background: 'rgba(255, 255, 255, 0.08)', 
              borderColor: 'rgba(255, 255, 255, 0.15)', 
              color: '#e0f2fe',
              borderRadius: '6px'
            }}
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
              style={{ background: '#10b981', borderColor: '#10b981', borderRadius: '6px' }}
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
              style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde047', borderRadius: '6px' }}
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
              style={{ background: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.15)', color: '#9ca3af', borderRadius: '6px' }}
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
              style={{ borderRadius: '6px' }}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
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

        {/* Filter and Search */}
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
              placeholder="Search mandate title, employer, requirements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchJobs}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: 'white',
                borderRadius: '10px'
              }}
              allowClear
            />
            <Button type="primary" onClick={fetchJobs} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '10px' }}>
              Search
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Status:</span>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: 160 }}
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="PAUSED">Paused</Option>
              <Option value="CLOSED">Closed</Option>
              <Option value="SUSPENDED">Suspended</Option>
            </Select>
          </div>
        </div>

        {/* Table */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card" 
          style={{ padding: '20px' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '18px', fontWeight: 700 }}>
              <FileTextOutlined style={{ color: '#38bdf8' }} /> Mandate Review Dossier #{selectedJob?.id}
            </div>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={760}
          styles={{
            content: { background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px' },
            header: { background: '#1e293b' },
          }}
        >
          {selectedJob && (
            <div style={{ color: '#e2e8f0', marginTop: '16px' }}>
              <div 
                style={{
                  padding: '18px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '14px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#ffffff', fontSize: '22px' }}>{selectedJob.title}</h3>
                    <p style={{ margin: '4px 0 0', color: '#38bdf8', fontSize: '14px', fontWeight: 600 }}>
                      🏢 {selectedJob.employer?.name || 'Unknown Entity'}
                    </p>
                  </div>
                  <Tag color={selectedJob.status === 'ACTIVE' ? 'green' : (selectedJob.status === 'PAUSED' ? 'gold' : 'default')}>
                    {selectedJob.status}
                  </Tag>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <h4 style={{ color: '#bae6fd', fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Mandate Scope & Description
                  </h4>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px' }}>
                    {selectedJob.description}
                  </div>
                </div>

                <div>
                  <h4 style={{ color: '#bae6fd', fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Eligibility & Statutory Requirements
                  </h4>
                  <div style={{ color: '#cbd5e1', lineHeight: 1.6, whiteSpace: 'pre-line', background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px' }}>
                    {selectedJob.requirements}
                  </div>
                </div>

                {selectedJob.skills?.length > 0 && (
                  <div>
                    <h4 style={{ color: '#bae6fd', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Required Specialisations & Skills
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedJob.skills.map((s) => (
                        <Tag key={s.skill.id} color="blue">{s.skill.name}</Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button onClick={() => setModalOpen(false)}>Close</Button>
                {selectedJob.status !== 'ACTIVE' && (
                  <Button
                    type="primary"
                    style={{ background: '#10b981', borderColor: '#10b981' }}
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
    </div>
  );
};

export default ManageJobs;

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminApplications, updateAdminApplicationStatus } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import { 
  SearchOutlined, 
  SolutionOutlined, 
  EyeOutlined, 
  ReloadOutlined, 
  CalendarOutlined 
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, message, Space } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageApplications = () => {
  const dispatch = useDispatch();
  const { applications: reduxApps, loading: reduxLoading } = useSelector((state) => state.admin);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '14px'
            }}
          >
            {record.candidate?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>{record.candidate?.name || 'Unknown Candidate'}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.candidate?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Mandate / Role',
      key: 'job',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>{record.job?.title || 'Unknown Job'}</div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>
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
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
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
              background: 'rgba(255, 255, 255, 0.08)', 
              borderColor: 'rgba(255, 255, 255, 0.15)', 
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
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
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
              placeholder="Search candidate, email, mandate, or entity..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={fetchApplications}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: 'white',
                borderRadius: '10px'
              }}
              allowClear
            />
            <Button type="primary" onClick={fetchApplications} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '10px' }}>
              Search
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Status:</span>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: 170 }}
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="APPLIED">Applied</Option>
              <Option value="SHORTLISTED">Shortlisted</Option>
              <Option value="INTERVIEW">Interview</Option>
              <Option value="SELECTED">Selected</Option>
              <Option value="REJECTED">Rejected</Option>
              <Option value="WITHDRAWN">Withdrawn</Option>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '18px', fontWeight: 700 }}>
              <SolutionOutlined style={{ color: '#38bdf8' }} /> Application Dossier #{selectedApp?.id}
            </div>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={720}
          styles={{
            content: { background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px' },
            header: { background: '#1e293b' },
          }}
        >
          {selectedApp && (
            <div style={{ color: '#e2e8f0', marginTop: '16px' }}>
              <div 
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px' }}>{selectedApp.job?.title}</h3>
                  <p style={{ margin: '4px 0 0', color: '#38bdf8', fontSize: '14px', fontWeight: 500 }}>
                    🏢 {selectedApp.job?.employer?.name}
                  </p>
                </div>
                <Tag color={getStatusColor(selectedApp.status)} style={{ fontSize: '13px', padding: '4px 12px', fontWeight: 600 }}>
                  {selectedApp.status}
                </Tag>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
                    Candidate Profile Information
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                    <div><span style={{ color: '#9ca3af' }}>Name:</span> <strong style={{ color: '#ffffff', marginLeft: '6px' }}>{selectedApp.candidate?.name}</strong></div>
                    <div><span style={{ color: '#9ca3af' }}>Email:</span> <strong style={{ color: '#ffffff', marginLeft: '6px' }}>{selectedApp.candidate?.email}</strong></div>
                    <div><span style={{ color: '#9ca3af' }}>Location:</span> <strong style={{ color: '#ffffff', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.city || 'N/A'}</strong></div>
                    <div><span style={{ color: '#9ca3af' }}>Experience:</span> <strong style={{ color: '#ffffff', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.experience ? `${selectedApp.candidate.candidateProfile.experience} Yrs` : 'N/A'}</strong></div>
                    <div><span style={{ color: '#9ca3af' }}>Designation:</span> <strong style={{ color: '#ffffff', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.designation || 'N/A'}</strong></div>
                    <div><span style={{ color: '#9ca3af' }}>Notice Period:</span> <strong style={{ color: '#ffffff', marginLeft: '6px' }}>{selectedApp.candidate?.candidateProfile?.noticePeriod || 'N/A'}</strong></div>
                  </div>
                </div>

                {selectedApp.candidate?.candidateProfile?.skills?.length > 0 && (
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}>
                    <h4 style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', marginBottom: '10px', fontWeight: 700, letterSpacing: '0.5px' }}>
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
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
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
    </div>
  );
};

export default ManageApplications;

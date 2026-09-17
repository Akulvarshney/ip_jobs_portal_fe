import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Input, 
  Tabs, 
  Modal, 
  message, 
  Popconfirm, 
  Tooltip,
  Divider
} from 'antd';
import { 
  SendOutlined, 
  SearchOutlined, 
  CalendarOutlined, 
  EyeOutlined, 
  StopOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidateApplications } from '../../store/candidateSlice';
import api from '../../api';
import CandidateNav from '../../components/CandidateNav';

const CandidateApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';

  const dispatch = useDispatch();
  const { applications: rawApps, loading } = useSelector((state) => state.candidate);
  const applications = Array.isArray(rawApps) ? rawApps : (rawApps?.data || []);

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected application / interview details modal
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchCandidateApplications());
  }, [dispatch]);

  const handleWithdraw = async (appId) => {
    try {
      const res = await api.post(`/api/candidate/applications/${appId}/withdraw`);
      if (res.data?.success) {
        message.success('Application withdrawn successfully');
        fetchApplications();
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to withdraw application');
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'APPLIED':
        return <Tag color="blue" icon={<ClockCircleOutlined />}>Applied</Tag>;
      case 'SHORTLISTED':
        return <Tag color="purple" icon={<CheckCircleOutlined />}>Shortlisted</Tag>;
      case 'INTERVIEW':
        return <Tag color="gold" icon={<CalendarOutlined />}>Interview Scheduled</Tag>;
      case 'SELECTED':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Selected / Hired</Tag>;
      case 'REJECTED':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Not Selected</Tag>;
      case 'WITHDRAWN':
        return <Tag color="default" icon={<StopOutlined />}>Withdrawn</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesTab = activeTab === 'ALL' || app.status === activeTab;
    const matchesSearch = !searchQuery ||
      app.job?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.job?.employer?.name && app.job.employer.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  const columns = [
    {
      title: 'Mandate / Role',
      dataIndex: ['job', 'title'],
      key: 'jobTitle',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600, color: 'white', fontSize: '15px' }}>{text}</div>
          <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
            {record.job?.employer?.name || 'Insolvency Entity'}
          </div>
        </div>
      ),
    },
    {
      title: 'Organisation Type',
      dataIndex: ['job', 'employer', 'type'],
      key: 'orgType',
      render: (type) => (
        <Tag color="cyan" style={{ borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
          {type || 'VERIFIED'}
        </Tag>
      ),
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
          {new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
        </span>
      ),
    },
    {
      title: 'Application Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Interview / Details',
      key: 'interview',
      render: (_, record) => {
        if (record.status === 'INTERVIEW' || record.interviews?.length > 0) {
          const latest = record.interviews?.[0];
          return (
            <Button
              size="small"
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => {
                setSelectedAppModal(record);
                setDetailsModalVisible(true);
              }}
              style={{ background: '#eab308', color: '#0f172a', fontWeight: 600, borderRadius: '6px' }}
            >
              View Interview
            </Button>
          );
        }
        return (
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedAppModal(record);
              setDetailsModalVisible(true);
            }}
            style={{ borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            Review Details
          </Button>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to={`/jobs/${record.jobId}`}>
            <Button size="small" type="link" style={{ color: '#38bdf8', padding: 0 }}>
              Job Details
            </Button>
          </Link>
          {record.status !== 'WITHDRAWN' && record.status !== 'REJECTED' && record.status !== 'SELECTED' && (
            <Popconfirm
              title="Withdraw this application?"
              description="Are you sure? Recruiter will be notified that you withdrew."
              onConfirm={() => handleWithdraw(record.id)}
              okText="Withdraw"
              cancelText="Cancel"
            >
              <Button size="small" type="link" danger style={{ padding: 0, marginLeft: '8px' }}>
                Withdraw
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: 'ALL', label: `All (${applications.length})` },
    { key: 'APPLIED', label: `Applied (${applications.filter(a => a.status === 'APPLIED').length})` },
    { key: 'SHORTLISTED', label: `Shortlisted (${applications.filter(a => a.status === 'SHORTLISTED').length})` },
    { key: 'INTERVIEW', label: `Interview (${applications.filter(a => a.status === 'INTERVIEW').length})` },
    { key: 'SELECTED', label: `Selected (${applications.filter(a => a.status === 'SELECTED').length})` },
    { key: 'REJECTED', label: `Not Selected (${applications.filter(a => a.status === 'REJECTED').length})` },
    { key: 'WITHDRAWN', label: `Withdrawn (${applications.filter(a => a.status === 'WITHDRAWN').length})` },
  ];

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <CandidateNav activeKey="/candidate/applications" />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card"
          style={{ padding: '32px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>Application Tracker</h1>
              <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0' }}>
                Monitor the status of your submitted IBC and restructuring applications.
              </p>
            </div>

            <div style={{ width: '280px' }}>
              <Input
                prefix={<SearchOutlined style={{ color: '#38bdf8' }} />}
                placeholder="Search role or employer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', borderRadius: '10px' }}
              />
            </div>
          </div>

          <Tabs
            activeKey={activeTab}
            onChange={(key) => {
              setActiveTab(key);
              setSearchParams(key === 'ALL' ? {} : { status: key });
            }}
            items={tabItems}
            style={{ marginBottom: '16px' }}
          />

          <Table
            dataSource={filteredApplications}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} applications` }}
            locale={{
              emptyText: (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  <SendOutlined style={{ fontSize: '36px', color: '#38bdf8', marginBottom: '12px', opacity: 0.5 }} />
                  <p>No applications match the selected criteria.</p>
                </div>
              )
            }}
          />
        </motion.div>
      </div>

      {/* Details / Interview Modal */}
      <Modal
        title={`Application: ${selectedAppModal?.job?.title || 'Mandate'}`}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailsModalVisible(false)} style={{ background: '#0ea5e9' }}>
            Close
          </Button>
        ]}
        width={650}
      >
        {selectedAppModal && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '18px' }}>{selectedAppModal.job?.title}</h3>
                <div style={{ color: '#38bdf8', fontSize: '14px', marginTop: '2px' }}>
                  {selectedAppModal.job?.employer?.name}
                </div>
              </div>
              <div>{getStatusTag(selectedAppModal.status)}</div>
            </div>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Scheduled Interview Section if available */}
            {selectedAppModal.interviews?.length > 0 && (
              <div style={{
                background: 'rgba(234, 179, 8, 0.08)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '20px'
              }}>
                <div style={{ color: '#fde047', fontWeight: 600, fontSize: '15px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarOutlined /> Scheduled Interview Details
                </div>
                {selectedAppModal.interviews.map((interview) => (
                  <div key={interview.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                      <strong>Date & Time:</strong> {new Date(interview.interviewDate).toLocaleDateString()} at {interview.interviewTime || 'Scheduled Time'}
                    </div>
                    <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                      <strong>Type:</strong> {interview.interviewType}
                    </div>
                    {interview.interviewer && (
                      <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                        <strong>Interviewer:</strong> {interview.interviewer}
                      </div>
                    )}
                    {interview.notes && (
                      <div style={{ color: '#cbd5e1', fontSize: '13px' }}>
                        <strong>Instructions:</strong> {interview.notes}
                      </div>
                    )}
                    {interview.meetingLink && (
                      <div style={{ marginTop: '8px' }}>
                        <a
                          href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '8px 16px',
                            background: '#eab308',
                            color: '#0f172a',
                            fontWeight: 600,
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontSize: '13px'
                          }}
                        >
                          <VideoCameraOutlined /> Join Interview Call
                        </a>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Application Cover Note if provided */}
            {selectedAppModal.coverNote && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                  Your Submitted Cover Note:
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6' }}>
                  {selectedAppModal.coverNote}
                </div>
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Applied on {new Date(selectedAppModal.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CandidateApplications;

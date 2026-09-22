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
  VideoCameraOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidateApplications } from '../../store/candidateSlice';
import api from '../../api';

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
          <div className="portal-app-title">{text}</div>
          <div className="portal-app-employer">
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
        <Tag color="cyan" className="portal-tag-org">
          {type || 'VERIFIED'}
        </Tag>
      ),
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="portal-app-date">
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
          return (
            <Button
              size="small"
              type="primary"
              icon={<CalendarOutlined />}
              onClick={() => {
                setSelectedAppModal(record);
                setDetailsModalVisible(true);
              }}
              className="portal-btn-interview"
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
            className="portal-btn-review"
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
        <div className="portal-app-actions-wrap">
          <Link to={`/jobs/${record.jobId}`}>
            <Tooltip title="Job Details">
              <Button size="small" type="link" icon={<FileTextOutlined />} className="portal-app-action-link" />
            </Tooltip>
          </Link>
          {record.status !== 'WITHDRAWN' && record.status !== 'REJECTED' && record.status !== 'SELECTED' && (
            <Popconfirm
              title="Withdraw this application?"
              description="Are you sure? Recruiter will be notified that you withdrew."
              onConfirm={() => handleWithdraw(record.id)}
              okText="Withdraw"
              cancelText="Cancel"
            >
              <Tooltip title="Withdraw Application">
                <Button size="small" type="link" danger icon={<StopOutlined />} className="portal-app-withdraw-btn" />
              </Tooltip>
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
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-glass-card portal-settings-card"
      >
        <div className="portal-tracker-header">
          <div>
            <h1 className="portal-page-title">Application Tracker</h1>
            <p className="portal-page-subtitle">
              Monitor the status of your submitted IBC and restructuring applications.
            </p>
          </div>

          <div className="portal-search-box-wrap">
            <Input
              prefix={<SearchOutlined className="portal-search-prefix-icon" />}
              placeholder="Search role or employer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="portal-search-input"
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
          className="portal-tabs-wrap"
        />

        <Table
          dataSource={filteredApplications}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} applications` }}
          locale={{
            emptyText: (
              <div className="portal-table-empty">
                <SendOutlined className="portal-table-empty-icon" />
                <p>No applications match the selected criteria.</p>
              </div>
            )
          }}
        />
      </motion.div>

      {/* Details / Interview Modal */}
      <Modal
        title={`Application: ${selectedAppModal?.job?.title || 'Mandate'}`}
        open={detailsModalVisible}
        onCancel={() => setDetailsModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setDetailsModalVisible(false)} className="portal-btn-theme-primary">
            Close
          </Button>
        ]}
        width={650}
      >
        {selectedAppModal && (
          <div className="portal-modal-app-details">
            <div className="portal-modal-app-header">
              <div>
                <h3 className="portal-modal-app-title">{selectedAppModal.job?.title}</h3>
                <div className="portal-modal-app-employer">
                  {selectedAppModal.job?.employer?.name}
                </div>
              </div>
              <div>{getStatusTag(selectedAppModal.status)}</div>
            </div>

            <Divider className="portal-settings-divider" />

            {/* Scheduled Interview Section if available */}
            {selectedAppModal.interviews?.length > 0 && (
              <div className="portal-interview-alert-box">
                <div className="portal-interview-alert-title">
                  <CalendarOutlined /> Scheduled Interview Details
                </div>
                {selectedAppModal.interviews.map((interview) => (
                  <div key={interview.id} className="portal-interview-content">
                    <div className="portal-interview-row">
                      <strong>Date & Time:</strong> {new Date(interview.interviewDate).toLocaleDateString()} at {interview.interviewTime || 'Scheduled Time'}
                    </div>
                    <div className="portal-interview-row">
                      <strong>Type:</strong> {interview.interviewType}
                    </div>
                    {interview.interviewer && (
                      <div className="portal-interview-row">
                        <strong>Interviewer:</strong> {interview.interviewer}
                      </div>
                    )}
                    {interview.notes && (
                      <div className="portal-interview-row">
                        <strong>Instructions:</strong> {interview.notes}
                      </div>
                    )}
                    {interview.meetingLink && (
                      <div className="portal-mt-8">
                        <a
                          href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="portal-interview-join-btn"
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
              <div className="portal-modal-cover-note-wrap">
                <div className="portal-modal-cover-note-title">
                  Your Submitted Cover Note:
                </div>
                <div className="portal-modal-cover-note-box">
                  {selectedAppModal.coverNote}
                </div>
              </div>
            )}

            <div className="portal-modal-applied-time">
              Applied on {new Date(selectedAppModal.createdAt).toLocaleString()}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default CandidateApplications;

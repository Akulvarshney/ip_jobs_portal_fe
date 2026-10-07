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
  const { applications: rawApps, pagination, listLoading } = useSelector((state) => state.candidate);
  const applications = Array.isArray(rawApps) ? rawApps : (rawApps?.data || []);
  const loading = listLoading.applications;

  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Selected application / interview details modal
  const [selectedAppModal, setSelectedAppModal] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => dispatch(fetchCandidateApplications({ page, pageSize: 5, status: activeTab, search: searchQuery.trim() })), 250);
    return () => clearTimeout(timer);
  }, [dispatch, page, activeTab, searchQuery]);



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

  const filteredApplications = applications;

  const columns = [
    {
      title: 'Job Title',
      dataIndex: ['job', 'title'],
      key: 'jobTitle',
      render: (text, record) => (
        <Link to={`/jobs/${record.jobId}`} className="portal-app-title portal-color-link" style={{ textDecoration: 'none' }}>{text}</Link>
      ),
    },
    {
      title: 'Organisation',
      key: 'organisation',
      render: (_, record) => record.job?.employer?.name || 'Insolvency Entity',
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
      title: 'Actions',
      key: 'interview',
      render: (_, record) => {
        if (record.status === 'INTERVIEW' || record.interviews?.length > 0) {
          return (
            <Tooltip title="View interview details">
              <Button
                size="small"
                type="primary"
                icon={<CalendarOutlined />}
                aria-label="View interview details"
                onClick={() => {
                  setSelectedAppModal(record);
                  setDetailsModalVisible(true);
                }}
                className="portal-btn-interview"
              />
            </Tooltip>
          );
        }
        return (
          <Tooltip title="Review application details">
            <Button
              size="small"
              icon={<EyeOutlined />}
              aria-label="Review application details"
              onClick={() => {
                setSelectedAppModal(record);
                setDetailsModalVisible(true);
              }}
              className="portal-btn-review"
            />
          </Tooltip>
        );
      },
    },

  ];

  const tabItems = [
    { key: 'ALL', label: 'All' },
    { key: 'APPLIED', label: 'Applied' },
    { key: 'SHORTLISTED', label: 'Shortlisted' },
    { key: 'INTERVIEW', label: 'Interview' },
    { key: 'SELECTED', label: 'Selected' },
    { key: 'REJECTED', label: 'Not Selected' },
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
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="portal-search-input"
            />
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1);
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
          pagination={{ current: page, pageSize: 5, total: pagination.applications?.total || 0, showSizeChanger: false, onChange: setPage, showTotal: (total) => `Total ${total} applications` }}
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
        title={`Application: ${selectedAppModal?.job?.title || 'Job'}`}
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

import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Input, 
  Select, 
  Tabs, 
  Modal, 
  Drawer,
  message, 
  Row, 
  Col, 
  Avatar, 
  Divider, 
  DatePicker, 
  Form, 
  Popconfirm,
  Badge,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  SearchOutlined, 
  CalendarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined, 
  FileTextOutlined, 
  BankOutlined, 
  BookOutlined, 
  SafetyCertificateOutlined, 
  VideoCameraOutlined,
  FilterOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClearOutlined,
  CloseOutlined,
  AuditOutlined,
  TagOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getFileUrl } from '../../utils/fileUrl';
import { fetchEmployerApplications, fetchEmployerJobs, updateApplicationStatus, scheduleInterview } from '../../store/employerSlice';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const ManageApplications = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialJobId = searchParams.get('jobId') || 'ALL';

  const dispatch = useDispatch();
  const { applications: reduxApps, jobs: reduxJobs, loading: empLoading } = useSelector((state) => state.employer);

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [selectedJobFilter, setSelectedJobFilter] = useState(initialJobId);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Modals state
  const [candidateModalVisible, setCandidateModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [interviewModalVisible, setInterviewModalVisible] = useState(false);
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [interviewForm] = Form.useForm();
  const [submittingInterview, setSubmittingInterview] = useState(false);

  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      const [appsRes, jobsRes] = await Promise.all([
        dispatch(fetchEmployerApplications()).unwrap(),
        dispatch(fetchEmployerJobs()).unwrap()
      ]);

      const appsList = Array.isArray(appsRes) ? appsRes : appsRes?.data || [];
      const jobsList = Array.isArray(jobsRes) ? jobsRes : jobsRes?.data || [];
      setApplications(appsList);
      setJobs(jobsList);
    } catch (error) {
      console.error('Error loading employer applications:', error);
      message.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dispatch]);

  const handleUpdateStatus = async (appId, status) => {
    try {
      await dispatch(updateApplicationStatus({ id: appId, status })).unwrap();
      message.success(`Status updated to ${status}`);
      loadData();
      if (selectedApp && selectedApp.id === appId) {
        setSelectedApp({ ...selectedApp, status });
      }
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to update status');
    }
  };

  const handleOpenInterviewModal = (app) => {
    setSchedulingApp(app);
    interviewForm.resetFields();
    interviewForm.setFieldsValue({
      interviewDate: dayjs().add(1, 'day'),
      interviewTime: '11:00 AM',
      interviewType: 'ONLINE',
      meetingLink: 'https://meet.google.com/new',
      interviewer: 'Insolvency Partner / Lead'
    });
    setInterviewModalVisible(true);
  };

  const handleScheduleInterview = async () => {
    try {
      const values = await interviewForm.validateFields();
      setSubmittingInterview(true);

      const payload = {
        interviewDate: values.interviewDate.toISOString(),
        interviewTime: values.interviewTime,
        interviewType: values.interviewType,
        meetingLink: values.meetingLink,
        interviewer: values.interviewer,
        notes: values.notes,
      };

      await dispatch(scheduleInterview({ id: schedulingApp.id, interviewData: payload })).unwrap();
      message.success('Interview scheduled and candidate notified!');
      setInterviewModalVisible(false);
      loadData();
    } catch (error) {
      if (error?.errorFields) return;
      message.error(typeof error === 'string' ? error : 'Failed to schedule interview');
    } finally {
      setSubmittingInterview(false);
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'APPLIED':
        return <Tag color="blue">Applied</Tag>;
      case 'SHORTLISTED':
        return <Tag color="purple">Shortlisted</Tag>;
      case 'INTERVIEW':
        return <Tag color="gold">Interview Scheduled</Tag>;
      case 'SELECTED':
        return <Tag color="green">Selected / Hired</Tag>;
      case 'REJECTED':
        return <Tag color="red">Rejected</Tag>;
      case 'WITHDRAWN':
        return <Tag color="default">Withdrawn</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesTab = activeTab === 'ALL' || app.status === activeTab;
    const matchesJob = selectedJobFilter === 'ALL' || app.jobId === Number(selectedJobFilter);
    const matchesSearch = !searchQuery ||
      app.candidate?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.candidate?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesJob && matchesSearch;
  });

  const columns = [
    {
      title: 'Candidate Name',
      key: 'candidateName',
      render: (_, record) => {
        const profile = record.candidate?.candidateProfile;
        return (
          <div className="portal-flex-center-gap-12">
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              src={getFileUrl(profile?.profilePhoto)}
              className="portal-avatar-purple"
            />
            <div>
              <div 
                className="portal-card-link-title"
                onClick={() => {
                  setSelectedApp(record);
                  setCandidateModalVisible(true);
                }}
              >
                {record.candidate?.name || 'Candidate'}
              </div>
              <div className="portal-text-subtle-12">
                {profile?.professionalCategory || profile?.designation || record.candidate?.email}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'Applied Mandate',
      dataIndex: ['job', 'title'],
      key: 'jobTitle',
      render: (title, record) => (
        <div>
          <span className="portal-card-heading portal-text-14">{title}</span>
          <div className="portal-card-meta portal-text-12 portal-mt-2">
            Applied {new Date(record.createdAt).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: 'Experience & Qualifications',
      key: 'exp',
      render: (_, record) => {
        const profile = record.candidate?.candidateProfile;
        const topEdu = profile?.educations?.[0];
        return (
          <div>
            <div className="portal-font-medium portal-text-13 portal-color-detail">
              {profile?.experience ? `${profile.experience} Yrs Experience` : 'Exp not specified'}
            </div>
            {topEdu && (
              <div className="portal-text-subtle-12">
                {topEdu.qualification} • {topEdu.institution}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
    },
    {
      title: 'Recruiter Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="portal-actions-group portal-flex-wrap">
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedApp(record);
              setCandidateModalVisible(true);
            }}
            className="portal-btn-neutral portal-btn-rounded-6"
          >
            Review Profile
          </Button>

          {record.status === 'APPLIED' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'SHORTLISTED')}
              className="portal-btn-purple"
            >
              Shortlist
            </Button>
          )}

          {record.status !== 'INTERVIEW' && record.status !== 'REJECTED' && record.status !== 'WITHDRAWN' && (
            <Button
              size="small"
              icon={<CalendarOutlined />}
              onClick={() => handleOpenInterviewModal(record)}
              className="portal-btn-gold"
            >
              Interview
            </Button>
          )}

          {record.status === 'INTERVIEW' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'SELECTED')}
              className="portal-btn-green"
            >
              Select / Hire
            </Button>
          )}

          {record.status !== 'REJECTED' && record.status !== 'WITHDRAWN' && (
            <Popconfirm
              title="Reject candidate application?"
              onConfirm={() => handleUpdateStatus(record.id, 'REJECTED')}
              okText="Reject"
              cancelText="Cancel"
            >
              <Button size="small" danger className="portal-btn-rounded-6">
                Reject
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  const tabItems = [
    { key: 'ALL', label: `All Candidates (${applications.length})` },
    { key: 'APPLIED', label: `Pending Review (${applications.filter(a => a.status === 'APPLIED').length})` },
    { key: 'SHORTLISTED', label: `Shortlisted (${applications.filter(a => a.status === 'SHORTLISTED').length})` },
    { key: 'INTERVIEW', label: `Interview Stage (${applications.filter(a => a.status === 'INTERVIEW').length})` },
    { key: 'SELECTED', label: `Selected / Hired (${applications.filter(a => a.status === 'SELECTED').length})` },
    { key: 'REJECTED', label: `Rejected (${applications.filter(a => a.status === 'REJECTED').length})` },
  ];

  return (
    <div className="portal-w-full">
      {/* Page Header */}
        <div className="portal-page-header portal-mb-28">
          <div>
            <div className="portal-flex-center-gap-8 portal-mb-6">
              <Link to="/employer" className="portal-tag-link portal-text-13 portal-font-medium">
                ← Back to Employer Dashboard
              </Link>
            </div>
            <h1 className="portal-page-title">
              Candidate Applications Manager
            </h1>
            <p className="portal-page-subtitle">
              Review applicant resumes, verify IBC credentials, shortlist candidates, and schedule interviews.
            </p>
          </div>

          <Link to="/employer/jobs">
            <Button className="portal-btn-neutral portal-btn-rounded-8">
              Manage Mandates
            </Button>
          </Link>
        </div>

        {/* Clean Search & Filter Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card portal-p-16 portal-mb-24"
        >
          <div className="portal-flex-center-gap-12 portal-flex-wrap">
            <div className="portal-search-input-wrap">
              <Input
                prefix={<SearchOutlined className="portal-color-link" />}
                placeholder="Search candidate name, email, qualifications, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                allowClear
                className="portal-search-toolbar-input"
              />
            </div>

            <button 
              type="button"
              className={`portal-filter-trigger-btn ${selectedJobFilter !== 'ALL' || activeTab !== 'ALL' ? 'active' : ''}`}
              onClick={() => setDrawerOpen(true)}
            >
              <FilterOutlined className={selectedJobFilter !== 'ALL' || activeTab !== 'ALL' ? 'portal-text-cyan' : ''} />
              <span>Filters</span>
              {(selectedJobFilter !== 'ALL' || activeTab !== 'ALL') && (
                <span className="portal-badge-counter">
                  {[selectedJobFilter !== 'ALL', activeTab !== 'ALL'].filter(Boolean).length}
                </span>
              )}
            </button>

            {(selectedJobFilter !== 'ALL' || activeTab !== 'ALL' || searchQuery) && (
              <Tooltip title="Reset all filters">
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={() => {
                    setSelectedJobFilter('ALL');
                    setActiveTab('ALL');
                    setSearchQuery('');
                    setSearchParams({});
                  }}
                  className="portal-btn-reset-filters"
                />
              </Tooltip>
            )}

            <div className="portal-search-meta-count">
              Showing <strong>{filteredApplications.length}</strong> candidate profiles
            </div>
          </div>

          {/* Active Filter Chips */}
          {(selectedJobFilter !== 'ALL' || activeTab !== 'ALL') && (
            <div className="portal-active-filters-bar">
              <span className="portal-active-filters-label">Active Filters:</span>
              
              {selectedJobFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <AuditOutlined /> Mandate: {jobs.find(j => j.id === selectedJobFilter)?.title || selectedJobFilter}
                  <CloseOutlined onClick={() => { setSelectedJobFilter('ALL'); setSearchParams(activeTab !== 'ALL' ? { status: activeTab } : {}); }} />
                </span>
              )}

              {activeTab !== 'ALL' && (
                <span className="portal-filter-tag">
                  <TagOutlined /> Stage: {activeTab}
                  <CloseOutlined onClick={() => { setActiveTab('ALL'); setSearchParams(selectedJobFilter !== 'ALL' ? { jobId: selectedJobFilter } : {}); }} />
                </span>
              )}
            </div>
          )}
        </motion.div>

        {/* Filter Drawer */}
        <Drawer
          title={
            <div className="portal-flex-center-gap-8">
              <FilterOutlined className="portal-color-link" />
              <span>Filter Candidate Applications</span>
            </div>
          }
          placement="right"
          width={380}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          footer={
            <div className="portal-drawer-footer-actions">
              <Button 
                onClick={() => {
                  setSelectedJobFilter('ALL');
                  setActiveTab('ALL');
                  setSearchQuery('');
                  setSearchParams({});
                }}
                disabled={selectedJobFilter === 'ALL' && activeTab === 'ALL' && !searchQuery}
                className="portal-btn-neutral portal-btn-rounded-8"
              >
                Reset All
              </Button>
              <Button 
                type="primary" 
                onClick={() => setDrawerOpen(false)}
                className="portal-btn-cyan portal-btn-rounded-8 portal-font-semibold"
              >
                Apply & View ({filteredApplications.length})
              </Button>
            </div>
          }
        >
          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <AuditOutlined /> Listed Mandate / Role
            </div>
            <Select
              value={selectedJobFilter}
              onChange={(val) => {
                setSelectedJobFilter(val);
                setSearchParams(val !== 'ALL' ? { jobId: val } : {});
              }}
              className="portal-w-full"
              size="large"
            >
              <Option value="ALL">All Active Mandates ({jobs.length})</Option>
              {jobs.map(j => (
                <Option key={j.id} value={j.id}>{j.title}</Option>
              ))}
            </Select>
          </div>

          <Divider className="portal-divider-subtle" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <TagOutlined /> Application Pipeline Stage
            </div>
            <Select
              value={activeTab}
              onChange={(val) => {
                setActiveTab(val);
                setSearchParams(val !== 'ALL' ? { status: val } : {});
              }}
              className="portal-w-full"
              size="large"
            >
              <Option value="ALL">All Application Stages ({applications.length})</Option>
              <Option value="APPLIED">Under Review / Applied</Option>
              <Option value="SHORTLISTED">Shortlisted Candidates</Option>
              <Option value="INTERVIEW">Interview Scheduled</Option>
              <Option value="SELECTED">Selected / Hired</Option>
              <Option value="REJECTED">Not Selected / Rejected</Option>
            </Select>
          </div>
        </Drawer>

        {/* Main Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card portal-p-32"
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            className="portal-mb-16"
          />

          <Table
            dataSource={filteredApplications}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} candidates` }}
            locale={{
              emptyText: (
                <div className="portal-empty-table-state">
                  <UserOutlined className="portal-empty-icon" />
                  <p>No candidate applications match the selected criteria.</p>
                </div>
              )
            }}
          />
        </motion.div>

      {/* Candidate Profile Details Modal */}
      <Modal
        title="Candidate Profile & Credentials"
        open={candidateModalVisible}
        onCancel={() => setCandidateModalVisible(false)}
        width={750}
        footer={[
          <Button key="close" onClick={() => setCandidateModalVisible(false)}>
            Close
          </Button>,
          selectedApp?.status === 'APPLIED' && (
            <Button
              key="shortlist"
              type="primary"
              onClick={() => handleUpdateStatus(selectedApp.id, 'SHORTLISTED')}
              className="portal-btn-purple"
            >
              Shortlist Candidate
            </Button>
          ),
          <Button
            key="interview"
            icon={<CalendarOutlined />}
            onClick={() => {
              setCandidateModalVisible(false);
              handleOpenInterviewModal(selectedApp);
            }}
            className="portal-btn-gold font-semibold"
          >
            Schedule Interview
          </Button>
        ]}
      >
        {selectedApp && (
          <div className="portal-mt-16">
            {/* Header */}
            <div className="portal-candidate-modal-header">
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={getFileUrl(selectedApp.candidate?.candidateProfile?.profilePhoto)}
                className="portal-avatar-purple"
              />
              <div className="portal-flex-1">
                <div className="portal-candidate-modal-name-row">
                  <h3 className="portal-candidate-modal-name">
                    {selectedApp.candidate?.name}
                  </h3>
                  <div>{getStatusTag(selectedApp.status)}</div>
                </div>
                <div className="portal-candidate-modal-role">
                  {selectedApp.candidate?.candidateProfile?.professionalCategory || 'Insolvency Professional'}
                </div>
                <div className="portal-candidate-modal-contact">
                  <span><MailOutlined /> {selectedApp.candidate?.email}</span>
                  {selectedApp.candidate?.candidateProfile?.phone && (
                    <span><PhoneOutlined /> {selectedApp.candidate.candidateProfile.phone}</span>
                  )}
                  {selectedApp.candidate?.candidateProfile?.city && (
                    <span><EnvironmentOutlined /> {selectedApp.candidate.candidateProfile.city}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Compensation & Notice Highlights */}
            <div className="portal-modal-comp-grid">
              <div>
                <div className="portal-modal-comp-label">Total Experience</div>
                <div className="portal-modal-comp-value">
                  {selectedApp.candidate?.candidateProfile?.experience ? `${selectedApp.candidate.candidateProfile.experience} Yrs` : 'N/A'}
                </div>
              </div>
              <div>
                <div className="portal-modal-comp-label">Current CTC</div>
                <div className="portal-modal-comp-value">
                  {selectedApp.candidate?.candidateProfile?.currentSalary ? `₹ ${selectedApp.candidate.candidateProfile.currentSalary} LPA` : 'Confidential'}
                </div>
              </div>
              <div>
                <div className="portal-modal-comp-label">Expected CTC</div>
                <div className="portal-modal-comp-value link">
                  {selectedApp.candidate?.candidateProfile?.expectedSalary ? `₹ ${selectedApp.candidate.candidateProfile.expectedSalary} LPA` : 'Negotiable'}
                </div>
              </div>
              <div>
                <div className="portal-modal-comp-label">Notice Period</div>
                <div className="portal-modal-comp-value">
                  {selectedApp.candidate?.candidateProfile?.noticePeriod || 'Immediate'}
                </div>
              </div>
            </div>

            {/* Cover Note */}
            {selectedApp.coverNote && (
              <div className="portal-mb-20">
                <div className="portal-modal-section-title-link">
                  Candidate Cover Note & Experience Highlight:
                </div>
                <div className="portal-modal-cover-note-box">
                  {selectedApp.coverNote}
                </div>
              </div>
            )}

            {/* Resume Document Link */}
            {selectedApp.candidate?.candidateProfile?.resumeUrl && (
              <div className="portal-modal-resume-box">
                <div className="portal-modal-resume-meta">
                  <FileTextOutlined className="portal-modal-resume-icon" />
                  <div>
                    <div className="portal-modal-resume-title">Candidate Resume Document</div>
                    <div className="portal-modal-resume-sub">PDF / DOCX uploaded by applicant</div>
                  </div>
                </div>
                <a href={getFileUrl(selectedApp.candidate.candidateProfile.resumeUrl)} target="_blank" rel="noopener noreferrer" download>
                  <Button type="primary" size="small" className="portal-btn-cyan">
                    Download / View ↗
                  </Button>
                </a>
              </div>
            )}

            {/* Skills */}
            {selectedApp.candidate?.candidateProfile?.skills?.length > 0 && (
              <div className="portal-mb-20">
                <div className="portal-text-muted-xs font-semibold portal-mb-8">
                  IBC & Professional Skills:
                </div>
                <div className="portal-modal-skills-row">
                  {selectedApp.candidate.candidateProfile.skills.map((s) => (
                    <Tag key={s.skill?.id} color="blue" className="portal-tag-compact">
                      {s.skill?.name}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedApp.candidate?.candidateProfile?.certifications?.length > 0 && (
              <div className="portal-mb-20">
                <div className="portal-text-muted-xs font-semibold portal-mb-8">
                  Statutory Registrations & Certifications:
                </div>
                {selectedApp.candidate.candidateProfile.certifications.map((cert) => (
                  <div key={cert.id} className="portal-modal-cert-row">
                    <SafetyCertificateOutlined className="portal-modal-cert-icon" />
                    <strong>{cert.name}</strong> ({cert.issuingOrg}) {cert.regNumber && `• Reg No: ${cert.regNumber}`}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal
        title={`Schedule Interview: ${schedulingApp?.candidate?.name}`}
        open={interviewModalVisible}
        onCancel={() => setInterviewModalVisible(false)}
        onOk={handleScheduleInterview}
        confirmLoading={submittingInterview}
        okText="Schedule & Send Invite"
      >
        <Form form={interviewForm} layout="vertical" className="portal-mt-16">
          <Form.Item
            label={<span className="portal-form-label">Interview Date</span>}
            name="interviewDate"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker className="portal-w-full" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span className="portal-form-label">Time Slot</span>}
                name="interviewTime"
                rules={[{ required: true, message: 'Please enter time' }]}
              >
                <Input placeholder="e.g. 11:30 AM IST" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span className="portal-form-label">Interview Format</span>}
                name="interviewType"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="ONLINE">Video Call (Online)</Option>
                  <Option value="IN_PERSON">In-Person (Office)</Option>
                  <Option value="PHONE">Telephonic</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={<span className="portal-form-label">Meeting Video Link / Address</span>}
            name="meetingLink"
            rules={[{ required: true, message: 'Please provide meeting link or location' }]}
          >
            <Input placeholder="https://meet.google.com/... or Office Address" />
          </Form.Item>

          <Form.Item
            label={<span className="portal-form-label">Interviewer / Hiring Panel</span>}
            name="interviewer"
          >
            <Input placeholder="e.g. Rahul Verma (Insolvency Partner)" />
          </Form.Item>

          <Form.Item
            label={<span className="portal-form-label">Instructions / Discussion Agenda (Optional)</span>}
            name="notes"
          >
            <TextArea rows={3} placeholder="Discussion regarding CIRP assignment handling and valuation experience..." />
          </Form.Item>
        </Form>
      </Modal>

    </div>
  );
};

export default ManageApplications;

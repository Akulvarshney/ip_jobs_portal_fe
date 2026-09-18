import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Tag, 
  Button, 
  Input, 
  Select, 
  Tabs, 
  Modal, 
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
  EnvironmentOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Avatar 
              size={40} 
              icon={<UserOutlined />} 
              src={profile?.profilePhoto}
              style={{ backgroundColor: '#a855f7' }}
            />
            <div>
              <div 
                style={{ fontWeight: 600, color: '#38bdf8', cursor: 'pointer', fontSize: '15px' }}
                onClick={() => {
                  setSelectedApp(record);
                  setCandidateModalVisible(true);
                }}
              >
                {record.candidate?.name || 'Candidate'}
              </div>
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
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
          <span style={{ fontWeight: 500, color: 'white', fontSize: '14px' }}>{title}</span>
          <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>
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
            <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 500 }}>
              {profile?.experience ? `${profile.experience} Yrs Experience` : 'Exp not specified'}
            </div>
            {topEdu && (
              <div style={{ color: '#94a3b8', fontSize: '12px' }}>
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
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedApp(record);
              setCandidateModalVisible(true);
            }}
            style={{ borderRadius: '6px', background: 'rgba(255, 255, 255, 0.06)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)' }}
          >
            Review Profile
          </Button>

          {record.status === 'APPLIED' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'SHORTLISTED')}
              style={{ background: '#a855f7', borderRadius: '6px' }}
            >
              Shortlist
            </Button>
          )}

          {record.status !== 'INTERVIEW' && record.status !== 'REJECTED' && record.status !== 'WITHDRAWN' && (
            <Button
              size="small"
              icon={<CalendarOutlined />}
              onClick={() => handleOpenInterviewModal(record)}
              style={{ background: 'rgba(234, 179, 8, 0.15)', borderColor: '#eab308', color: '#eab308', borderRadius: '6px' }}
            >
              Interview
            </Button>
          )}

          {record.status === 'INTERVIEW' && (
            <Button
              size="small"
              type="primary"
              onClick={() => handleUpdateStatus(record.id, 'SELECTED')}
              style={{ background: '#10b981', borderRadius: '6px' }}
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
              <Button size="small" danger style={{ borderRadius: '6px' }}>
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
    <div style={{ width: '100%' }}>
      {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Link to="/employer" style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 500 }}>
                ← Back to Employer Dashboard
              </Link>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>
              Candidate Applications Manager
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0' }}>
              Review applicant resumes, verify IBC credentials, shortlist candidates, and schedule interviews.
            </p>
          </div>

          <Link to="/employer/jobs">
            <Button style={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)' }}>
              Manage Mandates
            </Button>
          </Link>
        </div>

        {/* Filters Toolbar */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card"
          style={{ padding: '24px', marginBottom: '24px' }}
        >
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={10}>
              <Input
                prefix={<SearchOutlined style={{ color: '#38bdf8' }} />}
                placeholder="Search candidate name, email, or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.12)', height: '42px', borderRadius: '10px' }}
              />
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Select
                value={selectedJobFilter}
                onChange={setSelectedJobFilter}
                style={{ width: '100%', height: '42px' }}
              >
                <Option value="ALL">All Active Mandates ({jobs.length})</Option>
                {jobs.map(j => (
                  <Option key={j.id} value={j.id}>{j.title}</Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={24} md={6} style={{ textAlign: 'right' }}>
              <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                Showing <strong>{filteredApplications.length}</strong> candidate profiles
              </span>
            </Col>
          </Row>
        </motion.div>

        {/* Main Applications Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card"
          style={{ padding: '32px' }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            style={{ marginBottom: '16px' }}
          />

          <Table
            dataSource={filteredApplications}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8, showTotal: (total) => `Total ${total} candidates` }}
            locale={{
              emptyText: (
                <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>
                  <UserOutlined style={{ fontSize: '36px', color: '#38bdf8', marginBottom: '12px', opacity: 0.5 }} />
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
              style={{ background: '#a855f7' }}
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
            style={{ background: '#eab308', color: '#0f172a', fontWeight: 600 }}
          >
            Schedule Interview
          </Button>
        ]}
      >
        {selectedApp && (
          <div style={{ marginTop: '16px' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <Avatar
                size={64}
                icon={<UserOutlined />}
                src={selectedApp.candidate?.candidateProfile?.profilePhoto}
                style={{ backgroundColor: '#a855f7' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'white', margin: 0 }}>
                    {selectedApp.candidate?.name}
                  </h3>
                  <div>{getStatusTag(selectedApp.status)}</div>
                </div>
                <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>
                  {selectedApp.candidate?.candidateProfile?.professionalCategory || 'Insolvency Professional'}
                </div>
                <div style={{ display: 'flex', gap: '14px', fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Total Experience</div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                  {selectedApp.candidate?.candidateProfile?.experience ? `${selectedApp.candidate.candidateProfile.experience} Yrs` : 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Current CTC</div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                  {selectedApp.candidate?.candidateProfile?.currentSalary ? `₹ ${selectedApp.candidate.candidateProfile.currentSalary} LPA` : 'Confidential'}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Expected CTC</div>
                <div style={{ color: '#38bdf8', fontWeight: 600, fontSize: '14px' }}>
                  {selectedApp.candidate?.candidateProfile?.expectedSalary ? `₹ ${selectedApp.candidate.candidateProfile.expectedSalary} LPA` : 'Negotiable'}
                </div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px' }}>Notice Period</div>
                <div style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
                  {selectedApp.candidate?.candidateProfile?.noticePeriod || 'Immediate'}
                </div>
              </div>
            </div>

            {/* Cover Note */}
            {selectedApp.coverNote && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                  Candidate Cover Note & Experience Highlight:
                </div>
                <div style={{ background: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '12px 16px', borderRadius: '10px', color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>
                  {selectedApp.coverNote}
                </div>
              </div>
            )}

            {/* Resume Document Link */}
            {selectedApp.candidate?.candidateProfile?.resumeUrl && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '14px 18px',
                borderRadius: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileTextOutlined style={{ color: '#38bdf8', fontSize: '20px' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: 'white', fontSize: '14px' }}>Candidate Resume Document</div>
                    <div style={{ color: '#94a3b8', fontSize: '12px' }}>PDF / DOCX uploaded by applicant</div>
                  </div>
                </div>
                <a href={selectedApp.candidate.candidateProfile.resumeUrl} target="_blank" rel="noopener noreferrer" download>
                  <Button type="primary" size="small" style={{ background: '#0ea5e9' }}>
                    Download / View ↗
                  </Button>
                </a>
              </div>
            )}

            {/* Skills */}
            {selectedApp.candidate?.candidateProfile?.skills?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
                  IBC & Professional Skills:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {selectedApp.candidate.candidateProfile.skills.map((s) => (
                    <Tag key={s.skill?.id} color="blue" style={{ borderRadius: '6px', fontSize: '12px' }}>
                      {s.skill?.name}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications */}
            {selectedApp.candidate?.candidateProfile?.certifications?.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, marginBottom: '8px' }}>
                  Statutory Registrations & Certifications:
                </div>
                {selectedApp.candidate.candidateProfile.certifications.map((cert) => (
                  <div key={cert.id} style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '8px 12px', borderRadius: '8px', marginBottom: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                    <SafetyCertificateOutlined style={{ color: '#a855f7', marginRight: '6px' }} />
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
        <Form form={interviewForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Interview Date</span>}
            name="interviewDate"
            rules={[{ required: true, message: 'Please select date' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Time Slot</span>}
                name="interviewTime"
                rules={[{ required: true, message: 'Please enter time' }]}
              >
                <Input placeholder="e.g. 11:30 AM IST" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Interview Format</span>}
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
            label={<span style={{ color: '#e2e8f0' }}>Meeting Video Link / Address</span>}
            name="meetingLink"
            rules={[{ required: true, message: 'Please provide meeting link or location' }]}
          >
            <Input placeholder="https://meet.google.com/... or Office Address" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Interviewer / Hiring Panel</span>}
            name="interviewer"
          >
            <Input placeholder="e.g. Rahul Verma (Insolvency Partner)" />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Instructions / Discussion Agenda (Optional)</span>}
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

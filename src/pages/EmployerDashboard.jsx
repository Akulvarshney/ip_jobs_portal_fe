import CitySelect from '../components/CitySelect';
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Typography, message, Tag, Badge, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployerJobs, createJob, inviteCandidate, fetchJobApplicants, fetchOrganisationProfile } from '../store/employerSlice';
import { PlusOutlined, UserOutlined, MailOutlined, SendOutlined, CheckCircleOutlined, BankOutlined, DollarOutlined, SolutionOutlined, ArrowRightOutlined, LockOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import {
  JOB_TYPES,
  SALARY_RANGES,
  EXPERIENCE_LEVELS,
  getJobTypeLabel,
  getJobTypeColor,
  getSalaryRangeLabel,
  getExperienceLevelLabel,
  getExperienceLevelShortLabel
} from '../utils/jobEnums';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const EmployerDashboard = () => {
  const { jobs, organisation, dashboardStats, pagination, loading: orgLoading } = useSelector((state) => state.employer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [page, setPage] = useState(1);
  const [applicantsPage, setApplicantsPage] = useState(1);
  const [applicantsPagination, setApplicantsPagination] = useState({ total: 0 });
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchJobs();
  }, [dispatch, page]);

  const fetchJobs = async () => {
    try {
      if (!localStorage.getItem('token')) return navigate('/login?redirect=/employer/dashboard');
      await dispatch(fetchOrganisationProfile()).unwrap();
      await dispatch(fetchEmployerJobs({ page, pageSize: 6 })).unwrap();
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        navigate('/login?redirect=/employer/dashboard');
      }
    }
  };

  const handlePostJob = async (values) => {
    try {
      await dispatch(createJob(values)).unwrap();
      message.success('Job posted successfully');
      setIsModalVisible(false);
      form.resetFields();
      fetchJobs();
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to post job');
    }
  };

  const handleInvite = async (appId) => {
    try {
      await dispatch(inviteCandidate(appId)).unwrap();
      message.success('Invitation sent to candidate!');
      fetchJobs(); // Refresh to update status
      setApplicantsModalVisible(false); // Close to force refresh on next open
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to send invite');
    }
  };

  const viewApplicants = async (job) => {
    try {
      const res = await dispatch(fetchJobApplicants({ jobId: job.id, page: 1, pageSize: 8 })).unwrap();
      setSelectedJob({ ...job, applications: res.applications });
      setApplicantsPage(1);
      setApplicantsPagination(res.pagination);
      setApplicantsModalVisible(true);
    } catch (err) {
      message.error("Failed to load applicants");
    }
  };

  const columns = [
    {
      title: 'Role Profile',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="portal-flex-center-gap-8 portal-mb-4 portal-flex-wrap">
            <span
              className="portal-card-link-title"
              onClick={() => navigate(`/employer/jobs/${record.id}`)}
            >
              {text}
            </span>
            <Tag color={getJobTypeColor(record.jobType)} className="portal-tag-compact">
              {getJobTypeLabel(record.jobType)}
            </Tag>
            <Tag color="geekblue" className="portal-tag-compact">
              {getExperienceLevelShortLabel(record.experienceLevel)}
            </Tag>
          </div>
          <div className="portal-salary-row-meta">
            <DollarOutlined /> {getSalaryRangeLabel(record.salaryRange)}
          </div>
        </div>
      )
    },
    {
      title: 'Listed Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span className="portal-color-muted">{new Date(date).toLocaleDateString()}</span>
    },
    {
      title: 'Posted By',
      key: 'createdBy',
      render: (_, record) => (
        <div className="portal-text-13 portal-color-muted">
          {record.createdBy?.name || 'Organisation Admin'}
        </div>
      )
    },
    {
      title: 'Candidates Matched',
      key: 'applicants',
      render: (_, record) => (
        <Badge count={record._count?.applications || 0} showZero color="#0ea5e9" />
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="View Job & Applicants">
          <Button
            className="portal-btn-primary portal-btn-compact-apply"
            icon={<ArrowRightOutlined />}
            aria-label={`View ${record.title} and applicants`}
            onClick={() => navigate(`/employer/jobs/${record.id}`)}
          />
        </Tooltip>
      )
    }
  ];

  const branchStats = dashboardStats?.branches || [];

  if (orgLoading && !organisation) {
    return <div className="portal-loading-container portal-py-80"><Typography.Text>Loading Dashboard...</Typography.Text></div>;
  }

  if (!organisation) {
    return (
      <div className="portal-w-full portal-flex-col-center portal-py-80 text-center">
        <BankOutlined style={{ fontSize: 64, color: '#0ea5e9' }} className="portal-mb-24" />
        <Title level={2}>Complete Your Organization Profile</Title>
        <Text type="secondary" className="portal-mb-24 portal-max-w-600">
          Add your organisation details to start hiring. We will guide you through the information needed for review.
        </Text>
        <Button type="primary" size="large" onClick={() => navigate('/employer/organisation')}>
          Setup Organization Profile
        </Button>
      </div>
    );
  }


  return (
    <div className="portal-w-full">
      {organisation.status === 'PENDING' && <div className="portal-card portal-p-24 portal-mb-24" role="status">
        <h2>Organisation submitted for review</h2>
        <p>You can update your organisation details and explore your dashboard. Publishing jobs becomes available after approval.</p>
        <Button onClick={() => navigate('/employer/organisation')}>Review organisation details</Button>
      </div>}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="portal-page-header-row portal-mb-32"
      >
        <div>
          <h1 className="portal-section-title portal-text-36">Entity Dashboard</h1>
        </div>

        <button className="portal-btn-primary" disabled={organisation.status !== 'APPROVED'} onClick={() => setIsModalVisible(true)}>
          <PlusOutlined />
          <span>List New Job</span>
        </button>
      </motion.div>

      <div className="portal-grid-3col-gap-12 portal-mb-24" aria-label="Hiring key performance indicators">
        {[
          ['My jobs', dashboardStats?.myJobs || 0],
          ['Organisation jobs', dashboardStats?.organisationJobs || 0],
          ['Active jobs', dashboardStats?.activeJobs || 0],
          ['Applications', dashboardStats?.applications || 0],
          ['Shortlisted', dashboardStats?.shortlisted || 0],
          ['Interviews', dashboardStats?.interviews || 0],
        ].map(([label, value]) => <div className="portal-glass-card portal-p-24" key={label}><div className="portal-text-muted-sm">{label}</div><strong className="portal-text-heading" style={{ fontSize: 30 }}>{value}</strong></div>)}
      </div>
      <div className="portal-glass-card portal-p-24 portal-mb-24">
        <h2 className="portal-text-heading">Branch performance</h2>
        <Table size="small" rowKey="branch" dataSource={branchStats} pagination={false} locale={{ emptyText: 'No jobs have been posted yet.' }} columns={[{ title: 'Branch', dataIndex: 'branch' }, { title: 'Total jobs', dataIndex: 'jobs' }, { title: 'Active jobs', dataIndex: 'active' }, { title: 'Applications', dataIndex: 'applications' }]} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="portal-glass-card portal-p-24"
      >
        <Table
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          pagination={{ current: page, pageSize: 6, total: pagination.jobs?.total || 0, showSizeChanger: false, onChange: setPage }}
          className="portal-table"
        />
      </motion.div>

      {/* Post Job Modal */}
      <Modal
        title={<span className="portal-modal-title">List a New Job/Role</span>}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={640}
        className="portal-modal-top-30"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handlePostJob}
          initialValues={{
            jobType: 'FULL_TIME',
            salaryRange: 'NEGOTIABLE',
            experienceLevel: 'MID_LEVEL'
          }}
          className="portal-modal-form"
        >
          <Form.Item label="Role Title" name="title" rules={[{ required: true, message: 'Please enter job title' }]}>
            <Input placeholder="e.g. Resolution Professional for MSME" size="large" />
          </Form.Item>

          <div className="portal-grid-3col-gap-12">
            <Form.Item label="Job Type" name="jobType" rules={[{ required: true, message: 'Required' }]}>
              <Select size="large" placeholder="Job type">
                {JOB_TYPES.map(jt => (
                  <Option key={jt.value} value={jt.value}>{jt.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Salary Bracket" name="salaryRange" rules={[{ required: true, message: 'Required' }]}>
              <Select size="large" placeholder="Salary bracket">
                {SALARY_RANGES.map(sr => (
                  <Option key={sr.value} value={sr.value}>{sr.label}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Experience Level" name="experienceLevel" rules={[{ required: true, message: 'Required' }]}>
              <Select size="large" placeholder="Experience">
                {EXPERIENCE_LEVELS.map(el => (
                  <Option key={el.value} value={el.value}>{el.label}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item label="Job locations" name="locations" rules={[{ required: true, message: 'Select at least one city where this job is based' }]} extra="Choose the job’s cities, which may differ from your headquarters.">
            <CitySelect aria-label="Job locations" size="large" mode="multiple" />
          </Form.Item>
          <Form.Item label="Job Description" name="description" rules={[{ required: true, message: 'Please enter description' }]}>
            <TextArea rows={4} placeholder="Describe the CIRP/Liquidation scope, ticket size, and expectations..." />
          </Form.Item>
          <Form.Item label="Eligibility & Compliance Requirements" name="requirements" rules={[{ required: true, message: 'Please enter requirements' }]}>
            <TextArea rows={3} placeholder="e.g. 5+ years experience, Valid AFA, past NCLT experience in real estate..." />
          </Form.Item>
          <Form.Item className="portal-mb-0 portal-mt-24">
            <button className="portal-btn-primary portal-w-full portal-p-12 portal-text-15" type="submit">
              Publish Listing
            </button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Applicants Modal */}
      <Modal
        title={<span className="portal-modal-title">Candidates for "{selectedJob?.title}"</span>}
        open={applicantsModalVisible}
        onCancel={() => setApplicantsModalVisible(false)}
        footer={null}
        width={820}
      >
        <Table
          dataSource={selectedJob?.applications || []}
          rowKey="id"
          pagination={{ current: applicantsPage, pageSize: 8, total: applicantsPagination.total, showSizeChanger: false, onChange: async (nextPage) => {
            const result = await dispatch(fetchJobApplicants({ jobId: selectedJob.id, page: nextPage, pageSize: 8 })).unwrap();
            setSelectedJob(current => ({ ...current, applications: result.applications }));
            setApplicantsPage(nextPage);
            setApplicantsPagination(result.pagination);
          } }}
          columns={[
            { title: 'Candidate Name', key: 'name', render: (_, record) => <span className="portal-font-semibold">{record.candidate?.name || 'Candidate'}</span> },
            { title: 'Email', key: 'email', render: (_, record) => <span>{record.candidate?.email || 'N/A'}</span> },
            {
              title: 'Status',
              dataIndex: 'status',
              key: 'status',
              render: (status) => (
                <Tag color={status === 'INVITED' ? 'green' : 'blue'}>
                  {status || 'APPLIED'}
                </Tag>
              )
            },
            { title: 'Applied Date', dataIndex: 'createdAt', key: 'createdAt', render: (date) => new Date(date).toLocaleDateString() },
            {
              title: 'Actions',
              key: 'action',
              render: (_, record) => (
                record.status !== 'INVITED' ? (
                  <Tooltip title="Send Interview Invite">
                    <Button type="primary" size="small" icon={<SendOutlined />} aria-label="Send interview invite" onClick={() => handleInvite(record.id)} className="portal-btn-cyan" />
                  </Tooltip>
                ) : (
                  <Tooltip title="Interview Invitation Sent">
                    <span className="portal-color-success portal-font-semibold portal-inline-flex-center-gap-4" aria-label="Interview invitation sent">
                      <CheckCircleOutlined />
                    </span>
                  </Tooltip>
                )
              )
            }
          ]}
        />
      </Modal>
    </div>
  );
};

export default EmployerDashboard;

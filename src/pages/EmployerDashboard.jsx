import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Typography, message, Tag, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployerJobs, createJob, inviteCandidate, fetchJobApplicants } from '../store/employerSlice';
import { PlusOutlined, UserOutlined, MailOutlined, SendOutlined, CheckCircleOutlined, BankOutlined, DollarOutlined, SolutionOutlined } from '@ant-design/icons';
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
  const { jobs } = useSelector((state) => state.employer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    fetchJobs();
  }, [dispatch]);

  const fetchJobs = async () => {
    try {
      if (!localStorage.getItem('token')) return navigate('/login');
      await dispatch(fetchEmployerJobs()).unwrap();
    } catch (error) {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        navigate('/login');
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
      const res = await dispatch(fetchJobApplicants(job.id)).unwrap();
      setSelectedJob({ ...job, applications: res.applications });
      setApplicantsModalVisible(true);
    } catch(err) {
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
      title: 'Candidates Matched', 
      key: 'applicants', 
      render: (_, record) => (
        <Badge count={record.applications?.length || 0} showZero color="#0ea5e9" />
      )
    },
    { 
      title: 'Action', 
      key: 'action', 
      render: (_, record) => (
        <button 
          className="portal-btn-primary portal-btn-compact-apply" 
          onClick={() => navigate(`/employer/jobs/${record.id}`)}
        >
          View Mandate & Applicants
        </button>
      )
    }
  ];

  return (
    <div className="portal-w-full">
      <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="portal-page-header"
        >
          <div>
            <h1 className="portal-section-title portal-text-36">Entity Dashboard</h1>
            <p className="portal-section-subtitle">Manage mandates, review IBBI verified candidates, and send direct interview invitations.</p>
          </div>

          <button className="portal-btn-primary" onClick={() => setIsModalVisible(true)}>
            <PlusOutlined />
            <span>List New Mandate</span>
          </button>
        </motion.div>

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
            pagination={{ pageSize: 6 }}
            className="portal-table"
          />
        </motion.div>

        {/* Post Job Modal */}
        <Modal 
          title={<span className="portal-modal-title">List a New Mandate/Role</span>} 
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

            <Form.Item label="Mandate Description" name="description" rules={[{ required: true, message: 'Please enter description' }]}>
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
                title: 'Action', 
                key: 'action', 
                render: (_, record) => (
                  record.status !== 'INVITED' ? (
                    <Button type="primary" size="small" icon={<SendOutlined />} onClick={() => handleInvite(record.id)} className="portal-btn-cyan">
                      Send Interview Invite
                    </Button>
                  ) : (
                    <span className="portal-color-success portal-font-semibold portal-inline-flex-center-gap-4">
                      <CheckCircleOutlined /> Invited
                    </span>
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

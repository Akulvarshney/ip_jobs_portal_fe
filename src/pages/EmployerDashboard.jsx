import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Typography, message, Tag, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployerJobs, createJob, inviteCandidate, fetchJobApplicants } from '../store/employerSlice';
import { PlusOutlined, UserOutlined, MailOutlined, SendOutlined, CheckCircleOutlined, BankOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Title, Text } = Typography;
const { TextArea } = Input;

const EmployerDashboard = () => {
  const { jobs } = useSelector((state) => state.employer);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [applicantsModalVisible, setApplicantsModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
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
        <span 
          style={{ fontWeight: 600, color: '#38bdf8', cursor: 'pointer' }}
          onClick={() => navigate(`/employer/jobs/${record.id}`)}
        >
          {text}
        </span>
      )
    },
    { 
      title: 'Listed Date', 
      dataIndex: 'createdAt', 
      key: 'createdAt', 
      render: (date) => <span style={{ color: '#9ca3af' }}>{new Date(date).toLocaleDateString()}</span>
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
          className="portal-btn-primary" 
          style={{ padding: '6px 14px', fontSize: '13px' }}
          onClick={() => navigate(`/employer/jobs/${record.id}`)}
        >
          View Mandate & Applicants
        </button>
      )
    }
  ];

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}
        >
          <div>
            <h1 className="portal-section-title" style={{ fontSize: '36px' }}>Entity Dashboard</h1>
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
          className="portal-glass-card" style={{ padding: '24px' }}
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
          title={<span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>List a New Mandate/Role</span>} 
          open={isModalVisible} 
          onCancel={() => setIsModalVisible(false)} 
          footer={null}
          style={{ top: 40 }}
        >
          <Form layout="vertical" onFinish={handlePostJob} style={{ marginTop: '16px' }}>
            <Form.Item label="Role Title" name="title" rules={[{ required: true, message: 'Please enter job title' }]}>
              <Input placeholder="e.g. Resolution Professional for MSME" size="large" />
            </Form.Item>
            <Form.Item label="Mandate Description" name="description" rules={[{ required: true, message: 'Please enter description' }]}>
              <TextArea rows={4} placeholder="Describe the CIRP/Liquidation scope, ticket size, and expectations..." />
            </Form.Item>
            <Form.Item label="Eligibility & Compliance Requirements" name="requirements" rules={[{ required: true, message: 'Please enter requirements' }]}>
              <TextArea rows={3} placeholder="e.g. 5+ years experience, Valid AFA, past NCLT experience in real estate..." />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: '24px' }}>
              <button className="portal-btn-primary" type="submit" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
                Publish Listing
              </button>
            </Form.Item>
          </Form>
        </Modal>

        {/* Applicants Modal */}
        <Modal 
          title={<span style={{ color: 'white', fontSize: '20px', fontWeight: 700 }}>Candidates for "{selectedJob?.title}"</span>} 
          open={applicantsModalVisible} 
          onCancel={() => setApplicantsModalVisible(false)} 
          footer={null} 
          width={820}
        >
          <Table 
            dataSource={selectedJob?.applications || []} 
            rowKey="id"
            columns={[
              { title: 'Candidate Name', key: 'name', render: (_, record) => <span style={{ fontWeight: 600 }}>{record.candidate?.name || 'Candidate'}</span> },
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
                    <Button type="primary" size="small" icon={<SendOutlined />} onClick={() => handleInvite(record.id)} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '8px' }}>
                      Send Interview Invite
                    </Button>
                  ) : (
                    <span style={{ color: '#34d399', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircleOutlined /> Invited
                    </span>
                  )
                )
              }
            ]} 
          />
        </Modal>
      </div>
    </div>
  );
};

export default EmployerDashboard;

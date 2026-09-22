import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Badge, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployerJobs } from '../../store/employerSlice';
import { PlusOutlined, FileTextOutlined, ArrowRightOutlined, DollarOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { 
  getJobTypeLabel, 
  getJobTypeColor, 
  getSalaryRangeLabel, 
  getExperienceLevelShortLabel 
} from '../../utils/jobEnums';

const ManageJobs = () => {
  const { jobs } = useSelector((state) => state.employer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadJobs();
  }, [dispatch]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      await dispatch(fetchEmployerJobs()).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mandate / Role Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="portal-flex-center-gap-8 portal-flex-wrap">
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
          <div className="portal-flex-center-gap-12 portal-text-12 portal-color-muted portal-mt-4">
            <span>Listed on {new Date(record.createdAt).toLocaleDateString()}</span>
            <span className="portal-color-success portal-font-medium">
              <DollarOutlined /> {getSalaryRangeLabel(record.salaryRange)}
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'ACTIVE' ? 'green' : (status === 'PAUSED' ? 'gold' : 'default')}>
          {status || 'ACTIVE'}
        </Tag>
      )
    },
    {
      title: 'Applications Received',
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
          className="portal-btn-primary portal-btn-compact-apply portal-inline-flex-center-gap-6"
          onClick={() => navigate(`/employer/jobs/${record.id}`)}
        >
          <span>View Candidates & Details</span>
          <ArrowRightOutlined className="portal-icon-11" />
        </button>
      )
    }
  ];

  return (
    <div className="portal-w-full">
      <div className="portal-page-header portal-mb-28">
        <div>
          <h1 className="portal-section-title portal-text-30">Active Mandates</h1>
          <p className="portal-section-subtitle">Manage your listed CIRP & Liquidation roles and review candidate submissions.</p>
        </div>
        <button className="portal-btn-primary" onClick={() => navigate('/employer')}>
          <PlusOutlined />
          <span>Post New Mandate</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-glass-card portal-p-24"
      >
        <Table 
          dataSource={jobs}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 8 }}
          className="portal-table"
        />
      </motion.div>
    </div>
  );
};

export default ManageJobs;

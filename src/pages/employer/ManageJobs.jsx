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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span 
              style={{ fontWeight: 600, color: 'var(--theme-link)', cursor: 'pointer', fontSize: '15px' }}
              onClick={() => navigate(`/employer/jobs/${record.id}`)}
            >
              {text}
            </span>
            <Tag color={getJobTypeColor(record.jobType)} style={{ borderRadius: '6px', fontSize: '11px', margin: 0 }}>
              {getJobTypeLabel(record.jobType)}
            </Tag>
            <Tag color="geekblue" style={{ borderRadius: '6px', fontSize: '11px', margin: 0 }}>
              {getExperienceLevelShortLabel(record.experienceLevel)}
            </Tag>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--theme-muted)', marginTop: '4px' }}>
            <span>Listed on {new Date(record.createdAt).toLocaleDateString()}</span>
            <span style={{ color: 'var(--theme-success)', fontWeight: 500 }}>
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
          className="portal-btn-primary"
          style={{ padding: '6px 14px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={() => navigate(`/employer/jobs/${record.id}`)}
        >
          <span>View Candidates & Details</span>
          <ArrowRightOutlined style={{ fontSize: '11px' }} />
        </button>
      )
    }
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="portal-section-title" style={{ fontSize: '30px' }}>Active Mandates</h1>
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
        className="portal-glass-card" 
        style={{ padding: '24px' }}
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

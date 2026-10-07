import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Badge, message, Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEmployerJobs } from '../../store/employerSlice';
import { PlusOutlined, FileTextOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';
import { 
  getJobTypeLabel, 
  getJobTypeColor, 
  getSalaryRangeLabel, 
  getExperienceLevelShortLabel 
} from '../../utils/jobEnums';

const ManageJobs = () => {
  const { jobs, pagination } = useSelector((state) => state.employer);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadJobs();
  }, [dispatch, page]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      await dispatch(fetchEmployerJobs({ page, pageSize: 5 })).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Job Title',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <span className="portal-card-link-title" onClick={() => navigate(`/employer/jobs/${record.id}`)}>{text}</span>
      )
    },
    {
      title: 'Job Type',
      dataIndex: 'jobType',
      key: 'jobType',
      render: (jobType) => <Tag color={getJobTypeColor(jobType)} className="portal-tag-compact">{getJobTypeLabel(jobType)}</Tag>
    },
    {
      title: 'Experience',
      dataIndex: 'experienceLevel',
      key: 'experienceLevel',
      render: (experienceLevel) => getExperienceLevelShortLabel(experienceLevel)
    },
    {
      title: 'Listed Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (createdAt) => new Date(createdAt).toLocaleDateString()
    },
    {
      title: 'Salary',
      dataIndex: 'salaryRange',
      key: 'salaryRange',
      render: (salaryRange) => getSalaryRangeLabel(salaryRange)
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
      title: 'Posted By',
      key: 'createdBy',
      render: (_, record) => (
        <div className="portal-text-13 portal-color-muted">
          {record.createdBy?.name || 'Organisation Admin'}
        </div>
      )
    },
    {
      title: 'Applications Received',
      key: 'applicants',
      render: (_, record) => (
        <Badge count={record._count?.applications || 0} showZero color="var(--theme-accent)" />
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="View Candidates & Details">
          <Button 
            className="portal-btn-primary portal-btn-compact-apply"
            icon={<ArrowRightOutlined />}
            aria-label={`View ${record.title} candidates and details`}
            onClick={() => navigate(`/employer/jobs/${record.id}`)}
          />
        </Tooltip>
      )
    }
  ];

  return (
    <div className="portal-w-full">
      <div className="portal-page-header-row portal-mb-28">
        <div>
          <h1 className="portal-section-title portal-text-30">Active Jobs</h1>
        </div>
        <button className="portal-btn-primary" onClick={() => navigate('/employer')}>
          <PlusOutlined />
          <span>Post New Job</span>
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
          pagination={{ current: page, pageSize: 5, total: pagination.jobs?.total || 0, showSizeChanger: false, onChange: setPage }}
          className="portal-table"
        />
      </motion.div>
    </div>
  );
};

export default ManageJobs;

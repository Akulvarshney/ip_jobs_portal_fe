import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Badge, message, Tooltip } from 'antd';
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
      await dispatch(fetchEmployerJobs({ page, pageSize: 8 })).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Job / Role Title',
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
        <Badge count={record._count?.applications || 0} showZero color="#0ea5e9" />
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
          pagination={{ current: page, pageSize: 8, total: pagination.jobs?.total || 0, showSizeChanger: false, onChange: setPage }}
          className="portal-table"
        />
      </motion.div>
    </div>
  );
};

export default ManageJobs;

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchAdminEmployers } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import {
  SearchOutlined,
  BankOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tabs, Tag, Button, Drawer, message, Tooltip } from 'antd';
import { motion } from 'framer-motion';
import './ManageEmployers.css';

const { Option } = Select;

const ManageEmployers = () => {
  const dispatch = useDispatch();

  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchEmployers = async (requestedPage = page) => {
    setLoading(true);
    try {
      const params = { page: requestedPage, pageSize: 8 };
      if (submittedSearch) params.search = submittedSearch;
      params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await dispatch(fetchAdminEmployers(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setEmployers(list);
      setPagination(res.pagination || { total: list.length });
    } catch (error) {
      console.error('Error fetching employers:', error);
      message.error('Failed to load organisations');
    } finally {
      setLoading(false);
    }
  };

  const activeFiltersCount = Number(typeFilter !== 'ALL');

  const handleResetFilters = () => {
    setSearch('');
    setSubmittedSearch('');
    setTypeFilter('ALL');
    setPage(1);
  };

  useEffect(() => {
    fetchEmployers(page);
  }, [statusFilter, typeFilter, submittedSearch, page, dispatch]);

  const applySearch = () => {
    const nextSearch = search.trim();
    if (page === 1 && submittedSearch === nextSearch) fetchEmployers(1);
    else { setSubmittedSearch(nextSearch); setPage(1); }
  };

  const columns = [
    {
      title: 'Organisation Name',
      key: 'name',
      render: (_, record) => (
        <div className="portal-flex-center-gap-12">
          <div className="portal-avatar-init">
            <BankOutlined />
          </div>
          <div>
            <Link className="portal-candidate-name portal-employer-name-link" to={`/admin/employers/${record.id}`}>{record.name}</Link>
            <div className="portal-text-muted-xs portal-flex-center-gap-6 mt-2">
              <EnvironmentOutlined /> {record.location || 'India'}
              {record.website && (
                <a href={record.website} target="_blank" rel="noopener noreferrer" className="portal-text-link ml-6">
                  <GlobalOutlined /> Website
                </a>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag className="portal-tag-more font-semibold">
          {type || 'OTHER'}
        </Tag>
      ),
    },
    {
      title: 'Jobs Posted',
      key: 'jobs',
      render: (_, record) => (
        <Tag color="cyan" className="font-semibold portal-p-2-8">
          {record._count?.jobs || 0} Jobs
        </Tag>
      ),
    },
    {
      title: 'Members',
      key: 'members',
      render: (_, record) => (
        <span className="portal-text-detail-sm">
          <TeamOutlined /> {record._count?.members || 0} User(s)
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        if (status === 'PENDING') color = 'gold';
        if (status === 'SUSPENDED') color = 'red';
        return <Tag color={color} className="font-semibold">{status}</Tag>;
      },
    },
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader
        title="Employer Organisation Management"
        subtitle="Review, approve, and govern Banks, ARCs, Law Firms, CA Firms, and Insolvency Entities."
      />

      <Tabs
        className="portal-employer-status-tabs"
        activeKey={statusFilter}
        onChange={(status) => { setStatusFilter(status); setPage(1); }}
        items={[
          { key: 'PENDING', label: 'Pending' },
          { key: 'SUSPENDED', label: 'Suspended' },
          { key: 'APPROVED', label: 'Approved' },
        ]}
      />

      {/* Clean Search & Filter Bar */}
      <div className="portal-mb-24">
        <div className="portal-flex-center-gap-12 flex-wrap">
          <div className="portal-admin-search-form">
            <Input
              prefix={<SearchOutlined className="portal-text-muted" />}
              placeholder="Search organisation name, bench location, description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={applySearch}
              className="portal-search-toolbar-input"
              allowClear
            />
            <Button
              type="primary"
              onClick={applySearch}
              className="portal-btn-cyan-h44"
            >
              Search
            </Button>
          </div>

          <button
            type="button"
            className={`portal-filter-trigger-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
            onClick={() => setDrawerOpen(true)}
          >
            <FilterOutlined className={activeFiltersCount > 0 ? 'portal-text-cyan' : ''} />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="portal-badge-counter">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {(activeFiltersCount > 0 || search || submittedSearch) && (
            <Tooltip title="Reset all filters">
              <Button
                icon={<ClearOutlined />}
                onClick={() => {
                  handleResetFilters();
                }}
                className="portal-btn-reset-filters"
              />
            </Tooltip>
          )}
        </div>

        {/* Active Filter Chips */}
        {(activeFiltersCount > 0) && (
          <div className="portal-active-filters-bar">
            <span className="portal-active-filters-label">Active Filters:</span>

            {typeFilter !== 'ALL' && (
              <span className="portal-filter-tag">
                <ApartmentOutlined /> Type: {typeFilter}
                <CloseOutlined onClick={() => { setTypeFilter('ALL'); setPage(1); }} />
              </span>
            )}
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <Drawer
        title={
          <div className="portal-drawer-title-row">
            <FilterOutlined className="portal-text-link" />
            <span>Filter Organisations</span>
          </div>
        }
        placement="right"
        width={380}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        footer={
          <div className="portal-flex-between-center">
            <Button
              onClick={() => {
                handleResetFilters();
                setDrawerOpen(false);
              }}
              disabled={activeFiltersCount === 0 && !search}
              className="portal-btn-ghost"
            >
              Reset All
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setDrawerOpen(false);
                applySearch();
              }}
              className="portal-btn-cyan-apply"
            >
              Apply & View ({employers.length})
            </Button>
          </div>
        }
      >
        <div className="portal-filter-section">
          <div className="portal-filter-section-title">
            <ApartmentOutlined /> Entity Type
          </div>
          <Select
            value={typeFilter}
            onChange={(val) => { setTypeFilter(val); setPage(1); }}
            className="portal-w-full"
            size="large"
          >
            <Option value="ALL">All Entity Types</Option>
            <Option value="BANK">Bank</Option>
            <Option value="ARC">ARC (Asset Reconstruction)</Option>
            <Option value="IPE">Insolvency Professional Entity (IPE)</Option>
            <Option value="CONSULTING_FIRM">Consulting Firm</Option>
            <Option value="LAW_FIRM">Law Firm</Option>
            <Option value="CA_FIRM">CA Firm</Option>
            <Option value="RESOLUTION_APPLICANT">Resolution Applicant</Option>
            <Option value="IP">Insolvency Professional</Option>
            <Option value="CORPORATE">Corporate</Option>
            <Option value="OTHER">Other</Option>
          </Select>
        </div>
      </Drawer>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-glass-card portal-p-20"
      >
        <Table
          columns={columns}
          dataSource={employers}
          rowKey="id"
          loading={loading}
          pagination={{ current: page, pageSize: 8, total: pagination.total, showSizeChanger: false, onChange: setPage }}
          className="portal-table"
        />
      </motion.div>

    </div>
  );
};

export default ManageEmployers;

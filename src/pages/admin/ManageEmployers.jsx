import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminEmployers, updateAdminEmployerStatus } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import { 
  SearchOutlined, 
  BankOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  EyeOutlined,
  ReloadOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseOutlined,
  TagOutlined,
  ApartmentOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, Drawer, Divider, message, Space, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageEmployers = () => {
  const dispatch = useDispatch();
  const { employers: reduxEmployers, loading: reduxLoading } = useSelector((state) => state.admin);

  const [employers, setEmployers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchEmployers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (typeFilter !== 'ALL') params.type = typeFilter;

      const res = await dispatch(fetchAdminEmployers(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setEmployers(list);
    } catch (error) {
      console.error('Error fetching employers:', error);
      message.error('Failed to load organisations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, [statusFilter, typeFilter]);

  const activeFiltersCount = [
    statusFilter !== 'ALL' ? statusFilter : null,
    typeFilter !== 'ALL' ? typeFilter : null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  useEffect(() => {
    fetchEmployers();
  }, [statusFilter, typeFilter, dispatch]);

  const handleUpdateStatus = async (employerId, newStatus) => {
    setActionLoadingId(employerId);
    try {
      await dispatch(updateAdminEmployerStatus({ id: employerId, status: newStatus })).unwrap();
      message.success(`Organisation status updated to ${newStatus}`);
      setEmployers((prev) => prev.map((e) => (e.id === employerId ? { ...e, status: newStatus } : e)));
      if (selectedEmployer?.id === employerId) {
        setSelectedEmployer((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating employer status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openDossier = (employer) => {
    setSelectedEmployer(employer);
    setModalOpen(true);
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
            <div className="portal-candidate-name">{record.name}</div>
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
          {record._count?.jobs || 0} Mandates
        </Tag>
      ),
    },
    {
      title: 'Members',
      key: 'members',
      render: (_, record) => (
        <span className="portal-text-detail-sm">
          <TeamOutlined /> {record.members?.length || 0} User(s)
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
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => openDossier(record)}
            className="portal-btn-neutral"
          >
            Dossier
          </Button>

          {record.status !== 'APPROVED' && (
            <Button
              size="small"
              type="primary"
              loading={actionLoadingId === record.id}
              icon={<CheckCircleOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'APPROVED')}
              className="portal-btn-success font-medium"
            >
              Approve
            </Button>
          )}

          {record.status === 'APPROVED' && (
            <Button
              size="small"
              danger
              loading={actionLoadingId === record.id}
              icon={<StopOutlined />}
              onClick={() => handleUpdateStatus(record.id, 'SUSPENDED')}
              className="portal-btn-danger-soft"
            >
              Suspend
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader 
          title="Employer Organisation Management" 
          subtitle="Review, approve, and govern Banks, ARCs, Law Firms, CA Firms, and Insolvency Entities."
          actions={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchEmployers}
              loading={loading}
              className="portal-btn-secondary"
            >
              Refresh
            </Button>
          }
        />

        {/* Clean Search & Filter Bar */}
        <div className="portal-glass-card portal-p-16-20 portal-mb-24">
          <div className="portal-flex-center-gap-12 flex-wrap">
            <div className="portal-admin-search-form">
              <Input 
                prefix={<SearchOutlined className="portal-text-muted" />}
                placeholder="Search organisation name, bench location, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={fetchEmployers}
                className="portal-search-toolbar-input"
                allowClear
              />
              <Button 
                type="primary" 
                onClick={fetchEmployers} 
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

            {(activeFiltersCount > 0 || search) && (
              <Tooltip title="Reset all filters">
                <Button 
                  icon={<ClearOutlined />} 
                  onClick={() => {
                    handleResetFilters();
                    fetchEmployers();
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
              
              {statusFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <TagOutlined /> Status: {statusFilter}
                  <CloseOutlined onClick={() => setStatusFilter('ALL')} />
                </span>
              )}

              {typeFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <ApartmentOutlined /> Type: {typeFilter}
                  <CloseOutlined onClick={() => setTypeFilter('ALL')} />
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
                  fetchEmployers();
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
              <TagOutlined /> Approval Status
            </div>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              className="portal-w-full"
              size="large"
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="APPROVED">Approved Organisations</Option>
              <Option value="PENDING">Pending Verification</Option>
              <Option value="SUSPENDED">Suspended Entities</Option>
            </Select>
          </div>

          <Divider className="portal-divider-subtle portal-my-18" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <ApartmentOutlined /> Entity Type
            </div>
            <Select 
              value={typeFilter} 
              onChange={setTypeFilter}
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
            pagination={{ pageSize: 8 }}
            className="portal-table"
          />
        </motion.div>

        {/* Organisation Dossier Modal */}
        <Modal
          title={
            <div className="portal-modal-title-row">
              <BankOutlined className="portal-text-purple" /> Organisation Dossier #{selectedEmployer?.id}
            </div>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={700}
        >
          {selectedEmployer && (
            <div className="portal-mt-16 text-secondary">
              <div className="portal-dossier-header-card">
                <div>
                  <h3 className="portal-text-20 font-bold portal-text-heading m-0">{selectedEmployer.name}</h3>
                  <p className="portal-text-muted-sm mt-4 m-0">
                    {selectedEmployer.location || 'India'}
                  </p>
                </div>
                <div className="portal-flex-gap-8">
                  <Tag color="purple">{selectedEmployer.type || 'N/A'}</Tag>
                  <Tag color={selectedEmployer.status === 'APPROVED' ? 'green' : (selectedEmployer.status === 'PENDING' ? 'gold' : 'red')}>
                    {selectedEmployer.status}
                  </Tag>
                </div>
              </div>

              <div className="portal-flex-col-gap-16">
                <div>
                  <h4 className="portal-text-link-soft portal-text-13 uppercase portal-mb-6 font-semibold">
                    Entity Overview & Mandate Scope
                  </h4>
                  <p className="portal-text-detail leading-relaxed m-0">
                    {selectedEmployer.description || 'No detailed description provided by entity.'}
                  </p>
                </div>

                {selectedEmployer.website && (
                  <div>
                    <h4 className="portal-text-link-soft portal-text-13 uppercase portal-mb-6 font-semibold">
                      Official Website
                    </h4>
                    <a 
                      href={selectedEmployer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="portal-text-link break-all"
                    >
                      {selectedEmployer.website}
                    </a>
                  </div>
                )}

                {selectedEmployer.members?.length > 0 && (
                  <div>
                    <h4 className="portal-text-link-soft portal-text-13 uppercase portal-mb-8 font-semibold">
                      Key Registered Representatives ({selectedEmployer.members.length})
                    </h4>
                    <div className="portal-flex-col-gap-8">
                      {selectedEmployer.members.map((m) => (
                        <div 
                          key={m.id}
                          className="portal-admin-list-item portal-p-10-12"
                        >
                          <div>
                            <span className="portal-text-heading font-semibold">{m.user?.name}</span>
                            <span className="portal-text-muted portal-text-12 ml-8">{m.user?.email}</span>
                          </div>
                          <Tag color="cyan">{m.role || 'MEMBER'}</Tag>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEmployer.jobs?.length > 0 && (
                  <div>
                    <h4 className="portal-text-link-soft portal-text-13 uppercase portal-mb-8 font-semibold">
                      Active Mandates ({selectedEmployer.jobs.length})
                    </h4>
                    <div className="portal-flex-col-gap-6">
                      {selectedEmployer.jobs.map((j) => (
                        <div key={j.id} className="portal-text-detail-sm">
                          • <strong>{j.title}</strong> — <Tag color={j.status === 'ACTIVE' ? 'blue' : 'default'} className="portal-text-11">{j.status}</Tag>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="portal-flex-end-gap-10 mt-28">
                <Button onClick={() => setModalOpen(false)}>Close</Button>
                {selectedEmployer.status !== 'APPROVED' && (
                  <Button
                    type="primary"
                    className="portal-btn-success"
                    onClick={() => handleUpdateStatus(selectedEmployer.id, 'APPROVED')}
                    loading={actionLoadingId === selectedEmployer.id}
                  >
                    Approve Organisation
                  </Button>
                )}
                {selectedEmployer.status === 'APPROVED' && (
                  <Button
                    danger
                    onClick={() => handleUpdateStatus(selectedEmployer.id, 'SUSPENDED')}
                    loading={actionLoadingId === selectedEmployer.id}
                  >
                    Suspend Organisation
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default ManageEmployers;

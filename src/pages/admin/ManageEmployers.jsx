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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(14, 165, 233, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theme-link)',
              fontWeight: 700,
              fontSize: '18px'
            }}
          >
            <BankOutlined />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--theme-heading)', fontSize: '15px' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--theme-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
              <EnvironmentOutlined /> {record.location || 'India'}
              {record.website && (
                <a href={record.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-link)', marginLeft: '6px' }}>
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
        <Tag style={{ background: 'rgba(var(--theme-contrast-rgb), 0.06)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)', color: 'var(--theme-detail)', fontWeight: 600 }}>
          {type || 'OTHER'}
        </Tag>
      ),
    },
    {
      title: 'Jobs Posted',
      key: 'jobs',
      render: (_, record) => (
        <Tag color="cyan" style={{ fontWeight: 600, padding: '2px 8px' }}>
          {record._count?.jobs || 0} Mandates
        </Tag>
      ),
    },
    {
      title: 'Members',
      key: 'members',
      render: (_, record) => (
        <span style={{ color: 'var(--theme-detail)', fontSize: '13px' }}>
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
        return <Tag color={color} style={{ fontWeight: 600 }}>{status}</Tag>;
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
            style={{ 
              background: 'rgba(var(--theme-contrast-rgb), 0.08)', 
              borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)', 
              color: '#e0f2fe',
              borderRadius: '6px'
            }}
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
              style={{
                borderRadius: '6px',
                background: '#10b981',
                borderColor: '#10b981',
                color: 'var(--theme-on-primary)'
              }}
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
              style={{
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.15)',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                color: 'var(--theme-danger)'
              }}
            >
              Suspend
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
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
        <div 
          className="portal-glass-card" 
          style={{ 
            padding: '16px 20px', 
            marginBottom: '24px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 300px', display: 'flex', gap: '8px' }}>
              <Input 
                prefix={<SearchOutlined style={{ color: 'var(--theme-muted)' }} />}
                placeholder="Search organisation name, bench location, description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={fetchEmployers}
                style={{
                  background: 'rgba(var(--theme-contrast-rgb), 0.05)',
                  borderColor: 'rgba(var(--theme-contrast-rgb), 0.12)',
                  color: 'var(--theme-heading)',
                  borderRadius: '10px',
                  height: '44px'
                }}
                allowClear
              />
              <Button 
                type="primary" 
                onClick={fetchEmployers} 
                style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '10px', height: '44px', fontWeight: 600 }}
              >
                Search
              </Button>
            </div>

            <button 
              type="button"
              className={`portal-filter-trigger-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
              onClick={() => setDrawerOpen(true)}
            >
              <FilterOutlined style={{ color: activeFiltersCount > 0 ? '#38bdf8' : 'inherit' }} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span style={{
                  background: '#0ea5e9',
                  color: 'var(--theme-on-primary)',
                  fontSize: '11px',
                  fontWeight: 700,
                  borderRadius: '10px',
                  padding: '1px 7px',
                  marginLeft: '2px'
                }}>
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
                  style={{ 
                    height: '44px', 
                    width: '44px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '10px', 
                    background: 'rgba(var(--theme-contrast-rgb), 0.06)', 
                    color: 'var(--theme-muted)', 
                    borderColor: 'rgba(var(--theme-contrast-rgb), 0.12)' 
                  }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterOutlined style={{ color: 'var(--theme-link)' }} />
              <span>Filter Organisations</span>
            </div>
          }
          placement="right"
          width={380}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button 
                onClick={() => {
                  handleResetFilters();
                  setDrawerOpen(false);
                }}
                disabled={activeFiltersCount === 0 && !search}
                style={{ borderRadius: '8px', background: 'transparent', color: 'var(--theme-subtle)', border: '1px solid rgba(var(--theme-contrast-rgb),0.15)' }}
              >
                Reset All
              </Button>
              <Button 
                type="primary" 
                onClick={() => {
                  setDrawerOpen(false);
                  fetchEmployers();
                }}
                style={{ borderRadius: '8px', background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 600 }}
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
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="APPROVED">Approved Organisations</Option>
              <Option value="PENDING">Pending Verification</Option>
              <Option value="SUSPENDED">Suspended Entities</Option>
            </Select>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb),0.08)', margin: '18px 0' }} />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <ApartmentOutlined /> Entity Type
            </div>
            <Select 
              value={typeFilter} 
              onChange={setTypeFilter}
              style={{ width: '100%' }}
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
          className="portal-glass-card" 
          style={{ padding: '20px' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--theme-heading)', fontSize: '18px', fontWeight: 700 }}>
              <BankOutlined style={{ color: '#c084fc' }} /> Organisation Dossier #{selectedEmployer?.id}
            </div>
          }
          open={modalOpen}
          onCancel={() => setModalOpen(false)}
          footer={null}
          width={700}
          styles={{
            content: { background: 'var(--theme-surface)', border: '1px solid rgba(var(--theme-contrast-rgb), 0.12)', borderRadius: '20px' },
            header: { background: 'var(--theme-surface)' },
          }}
        >
          {selectedEmployer && (
            <div style={{ color: 'var(--theme-secondary)', marginTop: '16px' }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(var(--theme-contrast-rgb), 0.04)',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: 'var(--theme-heading)', fontSize: '20px' }}>{selectedEmployer.name}</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--theme-muted)', fontSize: '14px' }}>
                    {selectedEmployer.location || 'India'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Tag color="purple">{selectedEmployer.type || 'N/A'}</Tag>
                  <Tag color={selectedEmployer.status === 'APPROVED' ? 'green' : (selectedEmployer.status === 'PENDING' ? 'gold' : 'red')}>
                    {selectedEmployer.status}
                  </Tag>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h4 style={{ color: 'var(--theme-link-soft)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Entity Overview & Mandate Scope
                  </h4>
                  <p style={{ color: 'var(--theme-detail)', lineHeight: 1.6, margin: 0 }}>
                    {selectedEmployer.description || 'No detailed description provided by entity.'}
                  </p>
                </div>

                {selectedEmployer.website && (
                  <div>
                    <h4 style={{ color: 'var(--theme-link-soft)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '6px' }}>
                      Official Website
                    </h4>
                    <a 
                      href={selectedEmployer.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--theme-link)', wordBreak: 'break-all' }}
                    >
                      {selectedEmployer.website}
                    </a>
                  </div>
                )}

                {selectedEmployer.members?.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--theme-link-soft)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Key Registered Representatives ({selectedEmployer.members.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedEmployer.members.map((m) => (
                        <div 
                          key={m.id}
                          style={{
                            padding: '10px 12px',
                            background: 'rgba(var(--theme-contrast-rgb),0.02)',
                            border: '1px solid rgba(var(--theme-contrast-rgb),0.06)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--theme-heading)' }}>{m.user?.name}</span>
                            <span style={{ color: 'var(--theme-muted)', marginLeft: '8px', fontSize: '12px' }}>{m.user?.email}</span>
                          </div>
                          <Tag color="cyan">{m.role || 'MEMBER'}</Tag>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedEmployer.jobs?.length > 0 && (
                  <div>
                    <h4 style={{ color: 'var(--theme-link-soft)', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Active Mandates ({selectedEmployer.jobs.length})
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedEmployer.jobs.map((j) => (
                        <div key={j.id} style={{ fontSize: '13px', color: 'var(--theme-detail)' }}>
                          • <strong>{j.title}</strong> — <Tag color={j.status === 'ACTIVE' ? 'blue' : 'default'} style={{ fontSize: '11px' }}>{j.status}</Tag>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button onClick={() => setModalOpen(false)}>Close</Button>
                {selectedEmployer.status !== 'APPROVED' && (
                  <Button
                    type="primary"
                    style={{ background: '#10b981', borderColor: '#10b981' }}
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

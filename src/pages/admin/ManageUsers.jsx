import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminUsers, updateAdminUserStatus } from '../../store/adminSlice';
import AdminHeader from '../../components/AdminHeader';
import { 
  SearchOutlined, 
  UserOutlined, 
  CheckCircleOutlined, 
  StopOutlined, 
  EyeOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  BankOutlined,
  SolutionOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseOutlined,
  TagOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, Drawer, Divider, message, Badge, Descriptions, Space } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { users: reduxUsers, loading: reduxLoading } = useSelector((state) => state.admin);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await dispatch(fetchAdminUsers(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsers(list);
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const activeFiltersCount = [
    roleFilter !== 'ALL' ? roleFilter : null,
    statusFilter !== 'ALL' ? statusFilter : null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setSearchParams({});
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, dispatch]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setActionLoadingId(user.id);
    try {
      await dispatch(updateAdminUserStatus({ id: user.id, status: newStatus })).unwrap();
      message.success(`User ${user.name} has been ${newStatus === 'ACTIVE' ? 'activated' : 'suspended'}`);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
      if (selectedUser?.id === user.id) {
        setSelectedUser((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openUserDetails = (user) => {
    setSelectedUser(user);
    setDetailModalOpen(true);
  };

  const columns = [
    {
      title: 'User / Identity',
      key: 'name',
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div 
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--theme-link)',
              fontWeight: 700,
              fontSize: '15px'
            }}
          >
            {record.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--theme-heading)', fontSize: '14px' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: 'var(--theme-muted)' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        let color = 'cyan';
        if (role === 'EMPLOYER') color = 'purple';
        if (role === 'ADMIN') color = 'gold';
        return <Tag color={color} style={{ fontWeight: 600 }}>{role}</Tag>;
      },
    },
    {
      title: 'Affiliation / Profile',
      key: 'profile',
      render: (_, record) => {
        if (record.role === 'EMPLOYER') {
          return (
            <span style={{ color: 'var(--theme-detail)', fontSize: '13px' }}>
              {record.employerMember?.employer?.name ? (
                <span>🏢 {record.employerMember.employer.name}</span>
              ) : (
                <span style={{ color: 'var(--theme-muted)' }}>No entity attached</span>
              )}
            </span>
          );
        }
        if (record.role === 'CANDIDATE') {
          return (
            <span style={{ color: 'var(--theme-detail)', fontSize: '13px' }}>
              {record.candidateProfile?.designation || `${record.candidateProfile?.experience || 0} yrs exp`}
              {record.candidateProfile?.city && ` • ${record.candidateProfile.city}`}
            </span>
          );
        }
        return <span style={{ color: 'var(--theme-muted)' }}>System Administrator</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'ACTIVE' ? 'success' : 'error'}
          style={{ fontWeight: 600 }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => openUserDetails(record)}
            style={{ 
              background: 'rgba(var(--theme-contrast-rgb), 0.08)', 
              borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)', 
              color: '#e0f2fe',
              borderRadius: '6px'
            }}
          >
            View
          </Button>

          {record.role !== 'ADMIN' && (
            <Button
              size="small"
              danger={record.status === 'ACTIVE'}
              loading={actionLoadingId === record.id}
              icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
              onClick={() => handleToggleStatus(record)}
              style={{
                borderRadius: '6px',
                background: record.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                borderColor: record.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)',
                color: record.status === 'ACTIVE' ? '#fca5a5' : '#6ee7b7'
              }}
            >
              {record.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <AdminHeader 
          title="User Governance" 
          subtitle="Directory of insolvency candidates, employer representatives, and administrative accounts."
          actions={
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchUsers}
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
            <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 300px', display: 'flex', gap: '8px' }}>
              <Input 
                prefix={<SearchOutlined style={{ color: 'var(--theme-muted)' }} />}
                placeholder="Search candidate or employer by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                onClick={fetchUsers} 
                style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '10px', height: '44px', fontWeight: 600 }}
              >
                Search
              </Button>
            </form>

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
                    fetchUsers();
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
              
              {roleFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <UserOutlined /> Role: {roleFilter}
                  <CloseOutlined onClick={() => { setRoleFilter('ALL'); setSearchParams({}); }} />
                </span>
              )}

              {statusFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <TagOutlined /> Status: {statusFilter}
                  <CloseOutlined onClick={() => setStatusFilter('ALL')} />
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
              <span>Filter User Accounts</span>
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
                  fetchUsers();
                }}
                style={{ borderRadius: '8px', background: '#0ea5e9', borderColor: '#0ea5e9', fontWeight: 600 }}
              >
                Apply & View ({users.length})
              </Button>
            </div>
          }
        >
          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <UserOutlined /> User Role
            </div>
            <Select 
              value={roleFilter} 
              onChange={(val) => { 
                setRoleFilter(val); 
                setSearchParams(val !== 'ALL' ? { role: val } : {}); 
              }}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="ALL">All Roles</Option>
              <Option value="CANDIDATE">Candidate Accounts</Option>
              <Option value="EMPLOYER">Employer Accounts</Option>
              <Option value="ADMIN">Administrative Accounts</Option>
            </Select>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb),0.08)', margin: '18px 0' }} />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <TagOutlined /> Account Status
            </div>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              size="large"
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="ACTIVE">Active Users</Option>
              <Option value="SUSPENDED">Suspended Users</Option>
            </Select>
          </div>
        </Drawer>

        {/* Users Table */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card" 
          style={{ padding: '20px' }}
        >
          <Table 
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 8 }}
            className="portal-table"
          />
        </motion.div>

        {/* User Dossier Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--theme-heading)', fontSize: '18px', fontWeight: 700 }}>
              <UserOutlined /> User Profile Dossier #{selectedUser?.id}
            </div>
          }
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          width={720}
          styles={{
            content: { background: 'var(--theme-surface)', border: '1px solid rgba(var(--theme-contrast-rgb), 0.12)', borderRadius: '20px' },
            header: { background: 'var(--theme-surface)' },
          }}
        >
          {selectedUser && (
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
                  <h3 style={{ margin: 0, color: 'var(--theme-heading)', fontSize: '20px' }}>{selectedUser.name}</h3>
                  <p style={{ margin: '4px 0 0', color: 'var(--theme-muted)', fontSize: '14px' }}>{selectedUser.email}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Tag color={selectedUser.role === 'ADMIN' ? 'gold' : (selectedUser.role === 'EMPLOYER' ? 'purple' : 'cyan')}>
                    {selectedUser.role}
                  </Tag>
                  <Tag color={selectedUser.status === 'ACTIVE' ? 'green' : 'red'}>
                    {selectedUser.status}
                  </Tag>
                </div>
              </div>

              {selectedUser.role === 'CANDIDATE' && selectedUser.candidateProfile && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ padding: '12px', background: 'rgba(var(--theme-contrast-rgb),0.02)', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--theme-muted)', fontSize: '12px' }}>Designation</span>
                      <div style={{ fontWeight: 600, color: 'var(--theme-heading)' }}>{selectedUser.candidateProfile.designation || 'N/A'}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(var(--theme-contrast-rgb),0.02)', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--theme-muted)', fontSize: '12px' }}>Experience</span>
                      <div style={{ fontWeight: 600, color: 'var(--theme-heading)' }}>{selectedUser.candidateProfile.experience ? `${selectedUser.candidateProfile.experience} Years` : 'N/A'}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(var(--theme-contrast-rgb),0.02)', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--theme-muted)', fontSize: '12px' }}>City / Location</span>
                      <div style={{ fontWeight: 600, color: 'var(--theme-heading)' }}>{selectedUser.candidateProfile.city || 'N/A'}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(var(--theme-contrast-rgb),0.02)', borderRadius: '8px' }}>
                      <span style={{ color: 'var(--theme-muted)', fontSize: '12px' }}>Notice Period</span>
                      <div style={{ fontWeight: 600, color: 'var(--theme-heading)' }}>{selectedUser.candidateProfile.noticePeriod || 'N/A'}</div>
                    </div>
                  </div>

                  {selectedUser.candidateProfile.skills?.length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--theme-link-soft)', fontSize: '14px', marginBottom: '8px' }}>Skills & Expertise</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedUser.candidateProfile.skills.map((s) => (
                          <Tag key={s.skill.id} color="blue">{s.skill.name}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.candidateProfile.educations?.length > 0 && (
                    <div>
                      <h4 style={{ color: 'var(--theme-link-soft)', fontSize: '14px', marginBottom: '8px' }}>Education & Qualifications</h4>
                      {selectedUser.candidateProfile.educations.map((edu) => (
                        <div key={edu.id} style={{ fontSize: '13px', color: 'var(--theme-detail)', marginBottom: '4px' }}>
                          • <strong>{edu.qualification}</strong> ({edu.degree}) — {edu.institution}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedUser.role === 'EMPLOYER' && selectedUser.employerMember && (
                <div style={{ padding: '16px', background: 'rgba(var(--theme-contrast-rgb),0.03)', borderRadius: '12px' }}>
                  <h4 style={{ color: 'var(--theme-link-soft)', fontSize: '14px', marginBottom: '8px' }}>Organisation Membership</h4>
                  <p style={{ margin: '4px 0' }}><strong>Organisation:</strong> {selectedUser.employerMember.employer?.name}</p>
                  <p style={{ margin: '4px 0' }}><strong>Type:</strong> {selectedUser.employerMember.employer?.type}</p>
                  <p style={{ margin: '4px 0' }}><strong>Status:</strong> {selectedUser.employerMember.employer?.status}</p>
                </div>
              )}

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
                {selectedUser.role !== 'ADMIN' && (
                  <Button
                    type="primary"
                    danger={selectedUser.status === 'ACTIVE'}
                    onClick={() => handleToggleStatus(selectedUser)}
                    loading={actionLoadingId === selectedUser.id}
                  >
                    {selectedUser.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default ManageUsers;

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
import { Table, Input, Select, Tag, Button, Modal, Drawer, Divider, message, Badge, Descriptions, Space, Tooltip } from 'antd';
import { motion } from 'framer-motion';

const { Option } = Select;

const ManageUsers = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { users: reduxUsers, loading: reduxLoading } = useSelector((state) => state.admin);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0 });
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState(searchParams.get('role') || 'ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchUsers = async (requestedPage = page) => {
    setLoading(true);
    try {
      const params = { page: requestedPage, pageSize: 8 };
      if (submittedSearch) params.search = submittedSearch;
      if (roleFilter !== 'ALL') params.role = roleFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;

      const res = await dispatch(fetchAdminUsers(params)).unwrap();
      const list = Array.isArray(res) ? res : res?.data || [];
      setUsers(list);
      setPagination(res.pagination || { total: list.length });
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const activeFiltersCount = [
    roleFilter !== 'ALL' ? roleFilter : null,
    statusFilter !== 'ALL' ? statusFilter : null
  ].filter(Boolean).length;

  const handleResetFilters = () => {
    setSearch('');
    setSubmittedSearch('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setPage(1);
    setSearchParams({});
  };

  useEffect(() => {
    fetchUsers(page);
  }, [roleFilter, statusFilter, submittedSearch, page, dispatch]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const nextSearch = search.trim();
    if (page === 1 && submittedSearch === nextSearch) fetchUsers(1);
    else { setSubmittedSearch(nextSearch); setPage(1); }
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
        <div className="portal-flex-center-gap-12">
          <div className="portal-avatar-init">
            {record.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="portal-candidate-name">{record.name}</div>
            <div className="portal-text-muted-xs">{record.email}</div>
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
        return <Tag color={color} className="font-semibold">{role}</Tag>;
      },
    },
    {
      title: 'Affiliation / Profile',
      key: 'profile',
      render: (_, record) => {
        if (record.role === 'EMPLOYER') {
          return (
            <span className="portal-text-detail-sm">
              {record.employerMember?.employer?.name ? (
                <span>🏢 {record.employerMember.employer.name}</span>
              ) : (
                <span className="portal-text-muted">No entity attached</span>
              )}
            </span>
          );
        }
        if (record.role === 'CANDIDATE') {
          return (
            <span className="portal-text-detail-sm">
              {record.candidateProfile?.designation || `${record.candidateProfile?.experience || 0} yrs exp`}
              {record.candidateProfile?.city && ` • ${record.candidateProfile.city}`}
            </span>
          );
        }
        return <span className="portal-text-muted">System Administrator</span>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag 
          color={status === 'ACTIVE' ? 'success' : 'error'}
          className="font-semibold"
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
          <Tooltip title="View Details">
            <Button 
              size="small" 
              icon={<EyeOutlined />}
              aria-label={`View ${record.name} details`}
              onClick={() => openUserDetails(record)}
              className="portal-btn-neutral"
            />
          </Tooltip>

          {record.role !== 'ADMIN' && (
            <Tooltip title={record.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}>
              <Button
                size="small"
                danger={record.status === 'ACTIVE'}
                loading={actionLoadingId === record.id}
                icon={record.status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />}
                aria-label={`${record.status === 'ACTIVE' ? 'Suspend' : 'Activate'} ${record.name}`}
                onClick={() => handleToggleStatus(record)}
                className={record.status === 'ACTIVE' ? 'portal-btn-danger-soft' : 'portal-btn-success-soft'}
              />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="portal-w-full">
      <AdminHeader 
          title="User Governance" 
          subtitle="Directory of insolvency candidates, employer representatives, and administrative accounts."
        />

        {/* Clean Search & Filter Bar */}
        <div className="portal-mb-24">
          <div className="portal-flex-center-gap-12 flex-wrap">
            <form onSubmit={handleSearchSubmit} className="portal-admin-search-form">
              <Input 
                prefix={<SearchOutlined className="portal-text-muted" />}
                placeholder="Search candidate or employer by name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="portal-search-toolbar-input"
                allowClear
              />
              <Button 
                type="primary" 
                onClick={() => fetchUsers(page)}
                className="portal-btn-cyan-h44"
              >
                Search
              </Button>
            </form>

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
              
              {roleFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <UserOutlined /> Role: {roleFilter}
                  <CloseOutlined onClick={() => { setRoleFilter('ALL'); setPage(1); setSearchParams({}); }} />
                </span>
              )}

              {statusFilter !== 'ALL' && (
                <span className="portal-filter-tag">
                  <TagOutlined /> Status: {statusFilter}
                  <CloseOutlined onClick={() => { setStatusFilter('ALL'); setPage(1); }} />
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
              <span>Filter User Accounts</span>
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
                  handleSearchSubmit();
                }}
                className="portal-btn-cyan-apply"
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
                setPage(1);
                setSearchParams(val !== 'ALL' ? { role: val } : {}); 
              }}
              className="portal-w-full"
              size="large"
            >
              <Option value="ALL">All Roles</Option>
              <Option value="CANDIDATE">Candidate Accounts</Option>
              <Option value="EMPLOYER">Employer Accounts</Option>
              <Option value="ADMIN">Administrative Accounts</Option>
            </Select>
          </div>

          <Divider className="portal-divider-subtle portal-my-18" />

          <div className="portal-filter-section">
            <div className="portal-filter-section-title">
              <TagOutlined /> Account Status
            </div>
            <Select 
              value={statusFilter} 
              onChange={(val) => { setStatusFilter(val); setPage(1); }}
              className="portal-w-full"
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
          className="portal-glass-card portal-p-20" 
        >
          <Table 
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{ current: page, pageSize: 8, total: pagination.total, showSizeChanger: false, onChange: setPage }}
            className="portal-table"
          />
        </motion.div>

        {/* User Details Modal */}
        <Modal
          title={
            <div className="portal-modal-title-row">
              <UserOutlined /> User Profile Details #{selectedUser?.id}
            </div>
          }
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          width={720}
        >
          {selectedUser && (
            <div className="portal-mt-16 text-secondary">
              <div className="portal-details-header-card">
                <div>
                  <h3 className="portal-text-20 font-bold portal-text-heading m-0">{selectedUser.name}</h3>
                  <p className="portal-text-muted-sm mt-4 m-0">{selectedUser.email}</p>
                </div>
                <div className="portal-flex-gap-8">
                  <Tag color={selectedUser.role === 'ADMIN' ? 'gold' : (selectedUser.role === 'EMPLOYER' ? 'purple' : 'cyan')}>
                    {selectedUser.role}
                  </Tag>
                  <Tag color={selectedUser.status === 'ACTIVE' ? 'green' : 'red'}>
                    {selectedUser.status}
                  </Tag>
                </div>
              </div>

              {selectedUser.role === 'CANDIDATE' && selectedUser.candidateProfile && (
                <div className="portal-flex-col-gap-16">
                  <div className="portal-details-grid">
                    <div className="portal-details-box">
                      <span className="portal-text-muted-xs">Designation</span>
                      <div className="portal-text-heading font-semibold">{selectedUser.candidateProfile.designation || 'N/A'}</div>
                    </div>
                    <div className="portal-details-box">
                      <span className="portal-text-muted-xs">Experience</span>
                      <div className="portal-text-heading font-semibold">{selectedUser.candidateProfile.experience ? `${selectedUser.candidateProfile.experience} Years` : 'N/A'}</div>
                    </div>
                    <div className="portal-details-box">
                      <span className="portal-text-muted-xs">City / Location</span>
                      <div className="portal-text-heading font-semibold">{selectedUser.candidateProfile.city || 'N/A'}</div>
                    </div>
                    <div className="portal-details-box">
                      <span className="portal-text-muted-xs">Notice Period</span>
                      <div className="portal-text-heading font-semibold">{selectedUser.candidateProfile.noticePeriod || 'N/A'}</div>
                    </div>
                  </div>

                  {selectedUser.candidateProfile.skills?.length > 0 && (
                    <div>
                      <h4 className="portal-text-link-soft portal-text-14 portal-mb-8">Skills & Expertise</h4>
                      <div className="portal-flex-wrap-gap-6">
                        {selectedUser.candidateProfile.skills.map((s) => (
                          <Tag key={s.skill.id} color="blue">{s.skill.name}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.candidateProfile.educations?.length > 0 && (
                    <div>
                      <h4 className="portal-text-link-soft portal-text-14 portal-mb-8">Education & Qualifications</h4>
                      {selectedUser.candidateProfile.educations.map((edu) => (
                        <div key={edu.id} className="portal-text-detail-sm portal-mb-4">
                          • <strong>{edu.qualification}</strong> ({edu.degree}) — {edu.institution}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedUser.role === 'EMPLOYER' && selectedUser.employerMember && (
                <div className="portal-card-box">
                  <h4 className="portal-text-link-soft portal-text-14 portal-mb-8">Organisation Membership</h4>
                  <p className="my-4"><strong>Organisation:</strong> {selectedUser.employerMember.employer?.name}</p>
                  <p className="my-4"><strong>Type:</strong> {selectedUser.employerMember.employer?.type}</p>
                  <p className="my-4"><strong>Status:</strong> {selectedUser.employerMember.employer?.status}</p>
                </div>
              )}

              <div className="portal-flex-end-gap-10 mt-24">
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

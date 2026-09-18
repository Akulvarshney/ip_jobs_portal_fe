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
  SolutionOutlined
} from '@ant-design/icons';
import { Table, Input, Select, Tag, Button, Modal, message, Badge, Descriptions, Space } from 'antd';
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
              color: '#38bdf8',
              fontWeight: 700,
              fontSize: '15px'
            }}
          >
            {record.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '14px' }}>{record.name}</div>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>{record.email}</div>
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
            <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
              {record.employerMember?.employer?.name ? (
                <span>🏢 {record.employerMember.employer.name}</span>
              ) : (
                <span style={{ color: '#9ca3af' }}>No entity attached</span>
              )}
            </span>
          );
        }
        if (record.role === 'CANDIDATE') {
          return (
            <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
              {record.candidateProfile?.designation || `${record.candidateProfile?.experience || 0} yrs exp`}
              {record.candidateProfile?.city && ` • ${record.candidateProfile.city}`}
            </span>
          );
        }
        return <span style={{ color: '#9ca3af' }}>System Administrator</span>;
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
              background: 'rgba(255, 255, 255, 0.08)', 
              borderColor: 'rgba(255, 255, 255, 0.15)', 
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

        {/* Filter & Search Bar */}
        <div 
          className="portal-glass-card" 
          style={{ 
            padding: '16px 20px', 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 280px', display: 'flex', gap: '8px' }}>
            <Input 
              prefix={<SearchOutlined style={{ color: '#9ca3af' }} />}
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'rgba(255, 255, 255, 0.12)',
                color: 'white',
                borderRadius: '10px'
              }}
              allowClear
            />
            <Button type="primary" onClick={fetchUsers} style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '10px' }}>
              Search
            </Button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Role:</span>
            <Select 
              value={roleFilter} 
              onChange={(val) => { setRoleFilter(val); setSearchParams(val !== 'ALL' ? { role: val } : {}); }}
              style={{ width: 140 }}
            >
              <Option value="ALL">All Roles</Option>
              <Option value="CANDIDATE">Candidate</Option>
              <Option value="EMPLOYER">Employer</Option>
              <Option value="ADMIN">Admin</Option>
            </Select>

            <span style={{ color: '#9ca3af', fontSize: '13px' }}>Status:</span>
            <Select 
              value={statusFilter} 
              onChange={setStatusFilter}
              style={{ width: 140 }}
            >
              <Option value="ALL">All Statuses</Option>
              <Option value="ACTIVE">Active</Option>
              <Option value="SUSPENDED">Suspended</Option>
            </Select>
          </div>
        </div>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '18px', fontWeight: 700 }}>
              <UserOutlined /> User Profile Dossier #{selectedUser?.id}
            </div>
          }
          open={detailModalOpen}
          onCancel={() => setDetailModalOpen(false)}
          footer={null}
          width={720}
          styles={{
            content: { background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px' },
            header: { background: '#1e293b' },
          }}
        >
          {selectedUser && (
            <div style={{ color: '#e2e8f0', marginTop: '16px' }}>
              <div 
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px' }}>{selectedUser.name}</h3>
                  <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '14px' }}>{selectedUser.email}</p>
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
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>Designation</span>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{selectedUser.candidateProfile.designation || 'N/A'}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>Experience</span>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{selectedUser.candidateProfile.experience ? `${selectedUser.candidateProfile.experience} Years` : 'N/A'}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>City / Location</span>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{selectedUser.candidateProfile.city || 'N/A'}</div>
                    </div>
                    <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                      <span style={{ color: '#9ca3af', fontSize: '12px' }}>Notice Period</span>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{selectedUser.candidateProfile.noticePeriod || 'N/A'}</div>
                    </div>
                  </div>

                  {selectedUser.candidateProfile.skills?.length > 0 && (
                    <div>
                      <h4 style={{ color: '#bae6fd', fontSize: '14px', marginBottom: '8px' }}>Skills & Expertise</h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {selectedUser.candidateProfile.skills.map((s) => (
                          <Tag key={s.skill.id} color="blue">{s.skill.name}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedUser.candidateProfile.educations?.length > 0 && (
                    <div>
                      <h4 style={{ color: '#bae6fd', fontSize: '14px', marginBottom: '8px' }}>Education & Qualifications</h4>
                      {selectedUser.candidateProfile.educations.map((edu) => (
                        <div key={edu.id} style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>
                          • <strong>{edu.qualification}</strong> ({edu.degree}) — {edu.institution}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedUser.role === 'EMPLOYER' && selectedUser.employerMember && (
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#bae6fd', fontSize: '14px', marginBottom: '8px' }}>Organisation Membership</h4>
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

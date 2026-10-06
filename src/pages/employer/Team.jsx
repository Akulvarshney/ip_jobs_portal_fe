import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Tag, Tooltip, message } from 'antd';
import { DeleteOutlined, StopOutlined } from '@ant-design/icons';
import api from '../../api';

export default function Team() {
  const [team, setTeam] = useState({ members: [], invitations: [] });
  const [membersPage, setMembersPage] = useState(1);
  const [invitationsPage, setInvitationsPage] = useState(1);
  const [pagination, setPagination] = useState({ members: { total: 0 }, invitations: { total: 0 } });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [latestLink, setLatestLink] = useState('');
  const [form] = Form.useForm();
  const load = async () => {
    setLoading(true);
    try { const response = (await api.get('/api/employer/team', { params: { membersPage, invitationsPage, pageSize: 8 } })).data; setTeam(response.data); setPagination(response.pagination); }
    catch (error) { message.error(error.response?.data?.error || 'Could not load the team.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, [membersPage, invitationsPage]);
  const invite = async (details) => {
    setSending(true);
    setLatestLink('');
    try {
      const response = await api.post('/api/employer/team/invitations', details);
      setLatestLink(response.data.data.inviteUrl);
      form.resetFields();
      if (response.data.data.emailAccepted) message.success('The mail server accepted the invitation. Ask the recipient to check Spam or Promotions too.');
      else message.warning(response.data.message || 'Email could not be sent. Copy the invitation link below.');
      await load();
    }
    catch (error) {
      message.error(error.response?.data?.error || 'Could not send the invitation.');
    }
    finally { setSending(false); }
  };
  const remove = async (path) => {
    try { await api.delete(path); message.success('Team access updated.'); await load(); }
    catch (error) { message.error(error.response?.data?.error || 'Could not update team access.'); }
  };
  return <div className="portal-w-full">
    <div className="portal-page-header-row portal-mb-32"><div><h1 className="portal-text-28 font-bold portal-text-heading m-0">Organisation team</h1><p className="portal-text-muted-sm">Invite HR employees to manage jobs and applications. Only the organisation admin can manage this team and edit the organisation.</p></div></div>
    <div className="portal-glass-card portal-p-32 portal-mb-24"><h2 className="portal-text-heading">Invite a recruiter</h2><p className="portal-text-muted-sm">Enter the employee's details. They will only set their password after opening the email link.</p><Form form={form} layout="vertical" onFinish={invite} style={{ maxWidth: 640 }}><Form.Item label="Full name" name="name" rules={[{ required: true, message: 'Enter the employee name' }]}><Input maxLength={120} placeholder="Employee name" /></Form.Item><Form.Item label="New email address" name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid new email' }]}><Input type="email" placeholder="colleague@company.com" /></Form.Item><div className="portal-grid-2col-gap-10"><Form.Item label="Phone" name="phone" rules={[{ required: true, message: 'Enter the work phone' }]}><Input maxLength={30} placeholder="Work phone" /></Form.Item><Form.Item label="Designation" name="designation" rules={[{ required: true, message: 'Enter the designation' }]}><Input maxLength={120} placeholder="Recruiter" /></Form.Item></div><Form.Item label="Branch" name="branch" rules={[{ required: true, message: 'Enter the branch' }]}><Input maxLength={120} placeholder="Office or branch" /></Form.Item><Button type="primary" htmlType="submit" loading={sending}>Send invitation</Button></Form><p className="portal-text-muted-sm">Invites expire after seven days. An email address can have only one account and one organisation.</p>{latestLink && <div><p className="portal-text-muted-sm">Keep this link until your colleague joins. It is shown only now.{latestLink.includes('127.0.0.1') && ' This local link works only on this computer; set a public FRONTEND_URL for remote employees.'}</p><Input value={latestLink} readOnly addonAfter={<Button type="link" onClick={async () => { await navigator.clipboard.writeText(latestLink); message.success('Invite link copied.'); }}>Copy</Button>} /></div>}</div>
    <div className="portal-glass-card portal-p-32 portal-mb-24"><h2 className="portal-text-heading">Members</h2><Table rowKey="id" loading={loading} dataSource={team.members} pagination={{ current: membersPage, pageSize: 8, total: pagination.members?.total || 0, showSizeChanger: false, onChange: setMembersPage }} columns={[{ title: 'Name', dataIndex: 'name' }, { title: 'Email', dataIndex: 'email' }, { title: 'Designation', dataIndex: 'designation' }, { title: 'Branch', dataIndex: 'branch' }, { title: 'Access', dataIndex: 'role', render: role => <Tag>{role === 'ADMIN' ? 'Organisation admin' : 'Recruiter'}</Tag> }, { title: 'Actions', render: (_, row) => row.role === 'ADMIN' ? null : <Popconfirm title="Remove this employee from the organisation?" onConfirm={() => remove(`/api/employer/team/members/${row.id}`)}><Tooltip title="Remove member"><Button danger size="small" icon={<DeleteOutlined />} aria-label={`Remove ${row.name} from the organisation`} /></Tooltip></Popconfirm> }]} /></div>
    <div className="portal-glass-card portal-p-32"><h2 className="portal-text-heading">Pending invitations</h2><Table rowKey="id" loading={loading} dataSource={team.invitations} pagination={{ current: invitationsPage, pageSize: 8, total: pagination.invitations?.total || 0, showSizeChanger: false, onChange: setInvitationsPage }} columns={[{ title: 'Name', dataIndex: 'name' }, { title: 'Email', dataIndex: 'email' }, { title: 'Branch', dataIndex: 'branch' }, { title: 'Expires', dataIndex: 'expiresAt', render: date => new Date(date).toLocaleDateString() }, { title: 'Actions', render: (_, row) => <Popconfirm title="Revoke this invitation?" onConfirm={() => remove(`/api/employer/team/invitations/${row.id}`)}><Tooltip title="Revoke invitation"><Button danger size="small" icon={<StopOutlined />} aria-label={`Revoke invitation for ${row.name}`} /></Tooltip></Popconfirm> }]} /></div>
  </div>;
}

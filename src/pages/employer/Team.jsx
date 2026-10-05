import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Popconfirm, Table, Tag, message } from 'antd';
import api from '../../api';

export default function Team() {
  const [team, setTeam] = useState({ members: [], invitations: [] });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [latestLink, setLatestLink] = useState('');
  const [form] = Form.useForm();
  const load = async () => {
    setLoading(true);
    try { setTeam((await api.get('/api/employer/team')).data.data); }
    catch (error) { message.error(error.response?.data?.error || 'Could not load the team.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  const invite = async ({ email }) => {
    setSending(true);
    setLatestLink('');
    try {
      const response = await api.post('/api/employer/team/invitations', { email });
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
    <div className="portal-glass-card portal-p-32 portal-mb-24"><h2 className="portal-text-heading">Invite an HR employee</h2><Form form={form} layout="inline" onFinish={invite}><Form.Item name="email" rules={[{ required: true, type: 'email', message: 'Enter a valid email' }]} style={{ flex: 1, minWidth: 240 }}><Input placeholder="colleague@company.com" /></Form.Item><Button type="primary" htmlType="submit" loading={sending}>Send invite</Button></Form><p className="portal-text-muted-sm">Invites expire after seven days. An email can join only one organisation at a time.</p>{latestLink && <div><p className="portal-text-muted-sm">Keep this link until your colleague joins. It is shown only now.{latestLink.includes('127.0.0.1') && ' This local link works only on this computer; set a public FRONTEND_URL for remote employees.'}</p><Input value={latestLink} readOnly addonAfter={<Button type="link" onClick={async () => { await navigator.clipboard.writeText(latestLink); message.success('Invite link copied.'); }}>Copy</Button>} /></div>}</div>
    <div className="portal-glass-card portal-p-32 portal-mb-24"><h2 className="portal-text-heading">Members</h2><Table rowKey="id" loading={loading} dataSource={team.members} pagination={false} columns={[{ title: 'Name', dataIndex: 'name' }, { title: 'Email', dataIndex: 'email' }, { title: 'Access', dataIndex: 'role', render: role => <Tag>{role === 'ADMIN' ? 'Organisation admin' : 'HR employee'}</Tag> }, { title: '', render: (_, row) => row.role === 'ADMIN' ? null : <Popconfirm title="Remove this employee from the organisation?" onConfirm={() => remove(`/api/employer/team/members/${row.id}`)}><Button danger size="small">Remove</Button></Popconfirm> }]} /></div>
    <div className="portal-glass-card portal-p-32"><h2 className="portal-text-heading">Pending invitations</h2><Table rowKey="id" loading={loading} dataSource={team.invitations} pagination={false} columns={[{ title: 'Email', dataIndex: 'email' }, { title: 'Expires', dataIndex: 'expiresAt', render: date => new Date(date).toLocaleDateString() }, { title: '', render: (_, row) => <Popconfirm title="Revoke this invitation?" onConfirm={() => remove(`/api/employer/team/invitations/${row.id}`)}><Button danger size="small">Revoke</Button></Popconfirm> }]} /></div>
  </div>;
}

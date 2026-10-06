import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Button, Empty, Input, Select, Table, Tag } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import api from '../../api';
import { getJobTypeLabel } from '../../utils/jobType';
import './EmployerDetails.css';

const PAGE_SIZE = 20;
const dateLabel = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : '—';

const peopleColumns = [
  { title: 'Name', key: 'name', render: (_, row) => <strong className="portal-employer-table-name">{row.user?.name || 'Unnamed member'}</strong> },
  { title: 'Contact', key: 'contact', render: (_, row) => <div className="portal-employer-table-contact">{row.user?.email ? <a href={`mailto:${row.user.email}`}>{row.user.email}</a> : <span>—</span>}{row.phone && <a href={`tel:${row.phone}`}>{row.phone}</a>}</div> },
  { title: 'Designation', dataIndex: 'designation', render: (value) => value || '—' },
  { title: 'Branch', dataIndex: 'branch', render: (value) => value || '—' },
  { title: 'Access', dataIndex: 'role', render: (value) => <Tag color={value === 'ADMIN' ? 'blue' : 'cyan'}>{value || 'MEMBER'}</Tag> },
  { title: 'Account', key: 'account', render: (_, row) => <Tag color={row.user?.status === 'ACTIVE' ? 'green' : 'red'}>{row.user?.status || 'UNKNOWN'}</Tag> },
];

const jobsColumns = [
  { title: 'Job title', dataIndex: 'title', render: (value) => <strong className="portal-employer-table-name">{value}</strong> },
  { title: 'Location', key: 'location', render: (_, row) => row.locations?.length ? row.locations.join(', ') : '—' },
  { title: 'Branch', dataIndex: 'branch', render: (value) => value || '—' },
  { title: 'Type', dataIndex: 'jobType', render: (value) => getJobTypeLabel(value) },
  { title: 'Posted', dataIndex: 'createdAt', render: dateLabel },
  { title: 'Status', dataIndex: 'status', render: (value) => <Tag color={value === 'ACTIVE' ? 'blue' : value === 'PAUSED' ? 'gold' : 'default'}>{value}</Tag> },
];

export default function EmployerDirectory({ kind }) {
  const { id } = useParams();
  return <EmployerDirectoryContent key={`${id}-${kind}`} id={id} kind={kind} />;
}

function EmployerDirectoryContent({ id, kind }) {
  const isPeople = kind === 'people';
  const [employerName, setEmployerName] = useState('Organisation');
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ total: 0 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    const params = { page, pageSize: PAGE_SIZE };
    if (submittedSearch) params.search = submittedSearch;
    if (!isPeople && status !== 'ALL') params.status = status;
    api.get(`/api/admin/employers/${encodeURIComponent(id)}/${isPeople ? 'members' : 'jobs'}`, { params })
      .then((response) => {
        if (!active) return;
        setEmployerName(response.data.employer?.name || 'Organisation');
        setRows(response.data.data || []);
        setPagination(response.data.pagination || { total: 0 });
        setError('');
      })
      .catch((requestError) => {
        if (!active) return;
        setError(requestError.response?.status === 404 ? 'This organisation could not be found.' : `We could not load ${isPeople ? 'people' : 'jobs'}. Please try again.`);
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, isPeople, page, submittedSearch, status, retry]);

  const submitSearch = (value) => {
    const nextSearch = value.trim();
    setLoading(true);
    setError('');
    setPage(1);
    setSubmittedSearch(nextSearch);
    if (page === 1 && submittedSearch === nextSearch) setRetry((count) => count + 1);
  };

  const retryLoad = () => {
    setLoading(true);
    setError('');
    setRetry((count) => count + 1);
  };

  return (
    <div className="portal-employer-detail-page portal-employer-directory-page">
      <Link to={`/admin/employers/${id}`} className="portal-employer-back"><ArrowLeftOutlined /> {employerName}</Link>
      <header className="portal-employer-directory-header">
        <div><span className="portal-employer-eyebrow">Organisation directory</span><h1>{isPeople ? 'People' : 'Jobs'}</h1><p>{isPeople ? 'Search registered representatives and review their access.' : 'Find roles and review their current status.'}</p></div>
        <span className="portal-employer-directory-total">{pagination.total.toLocaleString('en-IN')} {isPeople ? 'people' : 'jobs'}</span>
      </header>

      <div className="portal-employer-directory-toolbar">
        <Input.Search
          aria-label={isPeople ? 'Search people' : 'Search jobs'}
          placeholder={isPeople ? 'Search name, email, designation or branch' : 'Search job title'}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onSearch={submitSearch}
          enterButton="Search"
          allowClear
        />
        {!isPeople && <Select aria-label="Filter job status" value={status} onChange={(value) => { setLoading(true); setError(''); setStatus(value); setPage(1); }} options={[{ value: 'ALL', label: 'All statuses' }, { value: 'ACTIVE', label: 'Active' }, { value: 'PAUSED', label: 'Paused' }, { value: 'CLOSED', label: 'Closed' }]} />}
      </div>

      {error && <Alert className="portal-employer-inline-error" type="error" showIcon message={error} action={<Button size="small" icon={<ReloadOutlined />} onClick={retryLoad}>Retry</Button>} />}
      <div className="portal-employer-directory-table">
        <Table
          rowKey="id"
          columns={isPeople ? peopleColumns : jobsColumns}
          dataSource={rows}
          loading={loading}
          scroll={{ x: isPeople ? 820 : 760 }}
          locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={submittedSearch || status !== 'ALL' ? 'No matching results' : isPeople ? 'No people found' : 'No jobs found'} /> }}
          pagination={{ current: page, pageSize: PAGE_SIZE, total: pagination.total, showSizeChanger: false, showTotal: (total, range) => `${range[0]}–${range[1]} of ${total}`, onChange: (nextPage) => { setLoading(true); setError(''); setPage(nextPage); } }}
        />
      </div>
    </div>
  );
}

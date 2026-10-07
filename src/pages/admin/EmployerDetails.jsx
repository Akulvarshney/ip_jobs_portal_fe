import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Alert, Button, Spin, Tag, message } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  BankOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  GlobalOutlined,
  ReloadOutlined,
  StopOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import api from '../../api';
import { updateAdminEmployerStatus } from '../../store/adminSlice';
import { getFileUrl } from '../../utils/fileUrl';
import './EmployerDetails.css';

const readable = (value) => value ? String(value).replaceAll('_', ' ') : 'Not provided';
const websiteUrl = (value) => {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
};

function DetailField({ label, children }) {
  return <div className="portal-employer-field"><dt>{label}</dt><dd>{children || 'Not provided'}</dd></div>;
}

export default function EmployerDetails() {
  const { id } = useParams();
  return <EmployerDetailsContent key={id} id={id} />;
}

function EmployerDetailsContent({ id }) {
  const dispatch = useDispatch();
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    let active = true;
    api.get(`/api/admin/employers/${encodeURIComponent(id)}`).then((response) => {
      if (!active) return;
      setEmployer(response.data.data);
      setError('');
    }).catch((requestError) => {
      if (!active) return;
      setError(requestError.response?.status === 404
        ? 'This organisation could not be found.'
        : 'We could not load this organisation. Please try again.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, retry]);

  const retryLoad = () => {
    setLoading(true);
    setError('');
    setRetry((count) => count + 1);
  };

  const updateStatus = async (status) => {
    setActionLoading(true);
    try {
      const result = await dispatch(updateAdminEmployerStatus({ id, status })).unwrap();
      setEmployer((current) => current ? { ...current, status: result.status } : current);
      if (status === 'APPROVED' && result.emailSent === false) {
        message.warning('Organisation approved, but the confirmation email could not be delivered. Check SMTP configuration.');
      } else {
        message.success(`Organisation status updated to ${status}`);
      }
    } catch (requestError) {
      message.error(typeof requestError === 'string' ? requestError : 'Failed to update organisation status');
    } finally {
      setActionLoading(false);
    }
  };

  const website = websiteUrl(employer?.website);
  const memberCount = employer?._count?.members ?? 0;
  const jobCount = employer?._count?.jobs ?? 0;

  return (
    <div className="portal-employer-detail-page">
      <Link to="/admin/employers" className="portal-employer-back"><ArrowLeftOutlined /> All organisations</Link>

      {loading && !employer ? (
        <div className="portal-employer-state" role="status"><Spin size="large" /><span>Loading organisation details…</span></div>
      ) : error && !employer ? (
        <div className="portal-employer-state">
          <Alert type="error" showIcon message={error} />
          <Button icon={<ReloadOutlined />} onClick={retryLoad}>Try again</Button>
        </div>
      ) : employer ? (
        <>
          {error && <Alert className="portal-employer-inline-error" type="error" showIcon message={error} action={<Button size="small" onClick={retryLoad}>Retry</Button>} />}
          <header className="portal-employer-hero">
            <div className="portal-employer-hero-main">
              <div className="portal-employer-logo">
                {employer.logoUrl ? <img src={getFileUrl(employer.logoUrl)} alt="" /> : <BankOutlined aria-hidden="true" />}
              </div>
              <div className="portal-employer-title-group">
                <span className="portal-employer-eyebrow">Organisation profile</span>
                <h1>{employer.name}</h1>
                <div className="portal-employer-tags">
                  <Tag>{readable(employer.type)}</Tag>
                  <Tag color={employer.status === 'APPROVED' ? 'green' : employer.status === 'PENDING' ? 'gold' : 'red'}>{readable(employer.status)}</Tag>
                </div>
              </div>
            </div>
            <div className="portal-employer-hero-actions">
              {employer.status === 'APPROVED' ? (
                <Button type="primary" danger icon={<StopOutlined />} loading={actionLoading} onClick={() => updateStatus('SUSPENDED')} className="portal-employer-status-btn portal-employer-status-btn--suspend">Suspend organisation</Button>
              ) : (
                <Button type="primary" icon={<CheckCircleOutlined />} loading={actionLoading} onClick={() => updateStatus('APPROVED')} className="portal-employer-status-btn portal-employer-status-btn--approve">Approve organisation</Button>
              )}
            </div>
          </header>

          <div className="portal-employer-directory-links" aria-label="Organisation directories">
            <Link to={`/admin/employers/${id}/people`} className="portal-employer-directory-link">
              <span className="portal-employer-directory-icon"><TeamOutlined /></span>
              <span className="portal-employer-directory-copy"><strong>People</strong><span>Browse and search registered representatives</span></span>
              <span className="portal-employer-directory-end"><strong>{memberCount.toLocaleString('en-IN')}</strong><ArrowRightOutlined /></span>
            </Link>
            <Link to={`/admin/employers/${id}/jobs`} className="portal-employer-directory-link">
              <span className="portal-employer-directory-icon"><FileTextOutlined /></span>
              <span className="portal-employer-directory-copy"><strong>Jobs</strong><span>Explore all roles posted by this organisation</span></span>
              <span className="portal-employer-directory-end"><strong>{jobCount.toLocaleString('en-IN')}</strong><ArrowRightOutlined /></span>
            </Link>
          </div>

          <div className="portal-employer-detail-grid">
            <div className="portal-employer-main-column">
              <section className="portal-employer-section" aria-labelledby="employer-overview-title">
                <div className="portal-employer-section-head"><h2 id="employer-overview-title">Overview</h2></div>
                <p className="portal-employer-description">{employer.description || 'No organisation description has been provided.'}</p>
              </section>

            </div>

            <aside className="portal-employer-side-column" aria-label="Organisation information">
              <section className="portal-employer-section" aria-labelledby="employer-information-title">
                <div className="portal-employer-section-head"><h2 id="employer-information-title">Organisation information</h2></div>
                <dl className="portal-employer-fields">
                  <DetailField label="Entity type">{readable(employer.type)}</DetailField>
                  <DetailField label="Location">{employer.location}</DetailField>
                  <DetailField label="Website">{website ? <a href={website} target="_blank" rel="noopener noreferrer"><GlobalOutlined /> {employer.website}</a> : employer.website}</DetailField>
                </dl>
              </section>
              <section className="portal-employer-section" aria-labelledby="employer-registration-title">
                <div className="portal-employer-section-head"><h2 id="employer-registration-title">Registration details</h2></div>
                <dl className="portal-employer-fields">
                  <DetailField label="PAN number">{employer.panNumber}</DetailField>
                  <DetailField label="GST number">{employer.gstNumber}</DetailField>
                </dl>
              </section>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}

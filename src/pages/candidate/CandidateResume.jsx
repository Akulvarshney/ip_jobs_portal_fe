import React, { useState, useEffect } from 'react';
import { Button, message, Popconfirm, Tag, Input, Modal, Alert, Row, Col } from 'antd';
import { 
  FileTextOutlined, 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  CheckCircleOutlined, 
  InfoCircleOutlined, 
  SyncOutlined,
  CloudUploadOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidateProfile, updateResume, deleteResume } from '../../store/candidateSlice';
import api from '../../api';
import { getFileUrl } from '../../utils/fileUrl';

const CandidateResume = () => {
  const dispatch = useDispatch();
  const { profile, loading: profileLoading } = useSelector((state) => state.candidate);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);

  const resumeUrl = profile?.resumeUrl || null;

  const loadProfile = async () => {
    try {
      setLoading(true);
      await dispatch(fetchCandidateProfile()).unwrap();
    } catch (error) {
      console.error('Error fetching resume status:', error);
      message.error('Failed to load resume details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [dispatch]);

  const handleSaveResumeUrl = async () => {
    if (!inputUrl.trim()) {
      message.warning('Please enter a valid document link or file URL');
      return;
    }
    try {
      setSaving(true);
      await dispatch(updateResume({ resumeUrl: inputUrl.trim() })).unwrap();
      setInputUrl('');
      message.success('Resume link saved successfully!');
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to save resume');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      setSaving(true);
      await dispatch(deleteResume()).unwrap();
      message.success('Resume removed successfully');
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to delete resume');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      message.error('File size exceeds the 3MB limit. Please upload a resume under 3MB.');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const res = await api.post('/api/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success(`Resume "${file.name}" uploaded successfully!`);
      loadProfile();
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to upload resume';
      message.error(errorMsg);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '32px' }}
      >
          
          {/* Main Resume Card */}
          <div className="portal-glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--theme-link)', fontSize: '20px' }}>
                <FileTextOutlined />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--theme-heading)', margin: 0 }}>Candidate Resume</h1>
                <p style={{ color: 'var(--theme-muted)', fontSize: '13px', margin: '2px 0 0' }}>Manage your primary CV for applications</p>
              </div>
            </div>

            {resumeUrl ? (
              <div style={{
                marginTop: '28px',
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '16px',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '12px',
                      background: '#0ea5e9',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--theme-on-primary)',
                      fontSize: '26px'
                    }}>
                      <FileTextOutlined />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-heading)' }}>Active Resume Document</span>
                        <Tag color="cyan" icon={<CheckCircleOutlined />}>Current</Tag>
                      </div>
                      <div style={{ color: 'var(--theme-subtle)', fontSize: '13px', marginTop: '4px' }}>
                        Shared automatically with employers when applying
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />} 
                      onClick={() => setPreviewVisible(true)}
                      style={{ background: '#0ea5e9', borderRadius: '8px' }}
                    >
                      View
                    </Button>
                    <a href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer" download="Resume.pdf">
                      <Button icon={<DownloadOutlined />} style={{ borderRadius: '8px', background: 'rgba(var(--theme-contrast-rgb), 0.06)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }}>
                        Download
                      </Button>
                    </a>
                    <Popconfirm
                      title="Remove resume from profile?"
                      onConfirm={handleDeleteResume}
                      okText="Remove"
                      cancelText="Cancel"
                    >
                      <Button danger icon={<DeleteOutlined />} style={{ borderRadius: '8px' }} />
                    </Popconfirm>
                  </div>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(var(--theme-contrast-rgb), 0.08)' }}>
                  <div style={{ color: 'var(--theme-detail)', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                    Replace Existing Resume:
                  </div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      background: 'rgba(var(--theme-contrast-rgb), 0.06)',
                      border: '1px dashed rgba(var(--theme-contrast-rgb), 0.2)',
                      borderRadius: '8px',
                      color: 'var(--theme-link)',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                      opacity: uploading ? 0.6 : 1
                    }}
                  >
                    <SyncOutlined spin={uploading} /> {uploading ? 'Uploading...' : 'Replace File (PDF, DOCX)'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      disabled={uploading}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div style={{
                marginTop: '28px',
                border: '2px dashed rgba(56, 189, 248, 0.3)',
                borderRadius: '16px',
                padding: '40px 24px',
                textAlign: 'center',
                background: 'rgba(var(--theme-contrast-rgb), 0.02)'
              }}>
                <CloudUploadOutlined style={{ fontSize: '48px', color: 'var(--theme-link)', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--theme-heading)', margin: 0 }}>
                  Upload Your Latest Resume
                </h3>
                <p style={{ color: 'var(--theme-muted)', fontSize: '14px', margin: '6px 0 20px' }}>
                  Supports PDF, DOC, DOCX up to 3MB.
                </p>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#0ea5e9',
                    borderRadius: '10px',
                    color: 'var(--theme-on-primary)',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
                    opacity: uploading ? 0.6 : 1
                  }}
                >
                  <UploadOutlined spin={uploading} /> {uploading ? 'Uploading...' : 'Select File to Upload'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    disabled={uploading}
                    onChange={handleFileUpload}
                  />
                </label>

                <div style={{ margin: '24px auto 0', maxWidth: '460px', color: '#64748b', fontSize: '13px' }}>
                  — OR provide a document link below —
                </div>

                <div style={{ display: 'flex', gap: '10px', maxWidth: '480px', margin: '14px auto 0' }}>
                  <Input
                    placeholder="https://drive.google.com/... or cloud document link"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }}
                  />
                  <Button
                    type="primary"
                    loading={saving}
                    onClick={handleSaveResumeUrl}
                    style={{ background: '#0ea5e9' }}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Guidance & Best Practices */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="portal-glass-card" style={{ padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--theme-heading)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SafetyCertificateOutlined style={{ color: 'var(--theme-link)' }} />
                IBC Resume Guidance
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(var(--theme-contrast-rgb), 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--theme-link)', fontSize: '13px', marginBottom: '4px' }}>
                    1. Highlight Mandate Values & CIRP Stages
                  </div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px', lineHeight: '1.5' }}>
                    Mention verified claim amounts, liquidation valuations, and NCLT bench jurisdictions (e.g. Principal Bench, Mumbai, NCLAT).
                  </div>
                </div>

                <div style={{ background: 'rgba(var(--theme-contrast-rgb), 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--theme-link)', fontSize: '13px', marginBottom: '4px' }}>
                    2. Section 29A Due Diligence & CoC Experience
                  </div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px', lineHeight: '1.5' }}>
                    State experience in prospective resolution applicant vetting and drafting evaluation matrices.
                  </div>
                </div>

                <div style={{ background: 'rgba(var(--theme-contrast-rgb), 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)' }}>
                  <div style={{ fontWeight: 600, color: 'var(--theme-link)', fontSize: '13px', marginBottom: '4px' }}>
                    3. Statutory Registrations
                  </div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '12px', lineHeight: '1.5' }}>
                    Include IBBI registration number, ICAI/ICSI/Bar Council enrolment ID explicitly.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </motion.div>

      {/* Preview Modal */}
      <Modal
        title="Resume Document Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
          <a key="dl" href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer">
            <Button type="primary" style={{ background: '#0ea5e9' }}>
              Open in New Window ↗
            </Button>
          </a>
        ]}
      >
        <div style={{ height: '550px', background: 'var(--theme-bg)', borderRadius: '8px', overflow: 'hidden' }}>
          {resumeUrl?.startsWith('data:') || resumeUrl?.includes('.pdf') || resumeUrl?.includes('resumes/') ? (
            <iframe
              src={getFileUrl(resumeUrl)}
              title="Resume Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--theme-subtle)' }}>
              <FileTextOutlined style={{ fontSize: '48px', color: 'var(--theme-link)', marginBottom: '16px' }} />
              <h3 style={{ color: 'var(--theme-heading)' }}>Document Link Preview</h3>
              <p>{resumeUrl}</p>
              <a href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer">
                <Button type="primary" style={{ marginTop: '12px' }}>Open External Document Link</Button>
              </a>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default CandidateResume;

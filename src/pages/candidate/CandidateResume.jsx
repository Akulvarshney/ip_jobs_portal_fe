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
import CandidateNav from '../../components/CandidateNav';

const CandidateResume = () => {
  const dispatch = useDispatch();
  const { profile, loading: profileLoading } = useSelector((state) => state.candidate);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      message.success('Resume updated successfully!');
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

  const handleSimulateLocalUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        message.error('File size exceeds 10MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Url = event.target.result;
        try {
          setSaving(true);
          await dispatch(updateResume({ resumeUrl: base64Url })).unwrap();
          message.success(`Uploaded ${file.name} successfully!`);
        } catch (error) {
          message.error(typeof error === 'string' ? error : 'Upload failed');
        } finally {
          setSaving(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <CandidateNav activeKey="/candidate/resume" />

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 24px 80px', position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '32px' }}
        >
          
          {/* Main Resume Card */}
          <div className="portal-glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8', fontSize: '20px' }}>
                <FileTextOutlined />
              </div>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', margin: 0 }}>Candidate Resume</h1>
                <p style={{ color: '#9ca3af', fontSize: '13px', margin: '2px 0 0' }}>Manage your primary CV for applications</p>
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
                      color: 'white',
                      fontSize: '26px'
                    }}>
                      <FileTextOutlined />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>Active Resume Document</span>
                        <Tag color="cyan" icon={<CheckCircleOutlined />}>Current</Tag>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>
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
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download="Resume.pdf">
                      <Button icon={<DownloadOutlined />} style={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.06)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}>
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

                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>
                    Replace Existing Resume:
                  </div>
                  <label
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px dashed rgba(255, 255, 255, 0.2)',
                      borderRadius: '8px',
                      color: '#38bdf8',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 500
                    }}
                  >
                    <SyncOutlined /> Choose New File (PDF, DOCX)
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      onChange={handleSimulateLocalUpload}
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
                background: 'rgba(255, 255, 255, 0.02)'
              }}>
                <CloudUploadOutlined style={{ fontSize: '48px', color: '#38bdf8', marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>
                  Upload Your Latest Resume
                </h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: '6px 0 20px' }}>
                  Supports PDF, DOC, DOCX up to 10MB.
                </p>

                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 24px',
                    background: '#0ea5e9',
                    borderRadius: '10px',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)'
                  }}
                >
                  <UploadOutlined /> Select File to Upload
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleSimulateLocalUpload}
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
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}
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
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SafetyCertificateOutlined style={{ color: '#38bdf8' }} />
                IBC Resume Guidance
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '13px', marginBottom: '4px' }}>
                    1. Highlight Mandate Values & CIRP Stages
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                    Mention verified claim amounts, liquidation valuations, and NCLT bench jurisdictions (e.g. Principal Bench, Mumbai, NCLAT).
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '13px', marginBottom: '4px' }}>
                    2. Section 29A Due Diligence & CoC Experience
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                    State experience in prospective resolution applicant vetting and drafting evaluation matrices.
                  </div>
                </div>

                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '13px', marginBottom: '4px' }}>
                    3. Statutory Registrations
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>
                    Include IBBI registration number, ICAI/ICSI/Bar Council enrolment ID explicitly.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>

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
          <a key="dl" href={resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button type="primary" style={{ background: '#0ea5e9' }}>
              Open in New Window ↗
            </Button>
          </a>
        ]}
      >
        <div style={{ height: '550px', background: '#0f172a', borderRadius: '8px', overflow: 'hidden' }}>
          {resumeUrl?.startsWith('data:') || resumeUrl?.endsWith('.pdf') ? (
            <iframe
              src={resumeUrl}
              title="Resume Preview"
              style={{ width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <FileTextOutlined style={{ fontSize: '48px', color: '#38bdf8', marginBottom: '16px' }} />
              <h3 style={{ color: 'white' }}>Document Link Preview</h3>
              <p>{resumeUrl}</p>
              <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
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

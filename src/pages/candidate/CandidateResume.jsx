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
        className="portal-resume-layout"
      >
          {/* Main Resume Card */}
          <div className="portal-glass-card portal-settings-card">
            <div className="portal-interview-card-title-wrap">
              <div className="portal-resume-header-icon">
                <FileTextOutlined />
              </div>
              <div>
                <h1 className="portal-page-title">Candidate Resume</h1>
                <p className="portal-page-subtitle">Manage your primary CV for applications</p>
              </div>
            </div>

            {resumeUrl ? (
              <div className="portal-resume-active-box">
                <div className="portal-saved-card-header">
                  <div className="portal-saved-company-group">
                    <div className="portal-resume-active-icon">
                      <FileTextOutlined />
                    </div>
                    <div>
                      <div className="portal-interview-card-title-wrap">
                        <span className="portal-job-card-title">Active Resume Document</span>
                        <Tag color="cyan" icon={<CheckCircleOutlined />}>Current</Tag>
                      </div>
                      <div className="portal-page-subtitle">
                        Shared automatically with employers when applying
                      </div>
                    </div>
                  </div>

                  <div className="portal-app-actions-wrap">
                    <Button 
                      type="primary" 
                      icon={<EyeOutlined />} 
                      onClick={() => setPreviewVisible(true)}
                      className="portal-btn-theme-primary"
                    >
                      View
                    </Button>
                    <a href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer" download="Resume.pdf">
                      <Button icon={<DownloadOutlined />} className="portal-btn-review">
                        Download
                      </Button>
                    </a>
                    <Popconfirm
                      title="Remove resume from profile?"
                      onConfirm={handleDeleteResume}
                      okText="Remove"
                      cancelText="Cancel"
                    >
                      <Button danger icon={<DeleteOutlined />} className="portal-delete-btn" />
                    </Popconfirm>
                  </div>
                </div>

                <div className="portal-resume-replace-bar">
                  <div className="portal-modal-cover-note-title">
                    Replace Existing Resume:
                  </div>
                  <label className={`portal-resume-replace-label ${uploading ? 'disabled' : ''}`}>
                    <SyncOutlined spin={uploading} /> {uploading ? 'Uploading...' : 'Replace File (PDF, DOCX)'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="portal-hidden-file-input"
                      disabled={uploading}
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="portal-resume-upload-dropzone">
                <CloudUploadOutlined className="portal-empty-state-icon" />
                <h3 className="portal-empty-state-title">
                  Upload Your Latest Resume
                </h3>
                <p className="portal-empty-state-desc">
                  Supports PDF, DOC, DOCX up to 3MB.
                </p>

                <label className={`portal-resume-upload-btn-label ${uploading ? 'disabled' : ''}`}>
                  <UploadOutlined spin={uploading} /> {uploading ? 'Uploading...' : 'Select File to Upload'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="portal-hidden-file-input"
                    disabled={uploading}
                    onChange={handleFileUpload}
                  />
                </label>

                <div className="portal-resume-or-divider">
                  — OR provide a document link below —
                </div>

                <div className="portal-resume-link-form">
                  <Input
                    placeholder="https://drive.google.com/... or cloud document link"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    className="portal-search-input"
                  />
                  <Button
                    type="primary"
                    loading={saving}
                    onClick={handleSaveResumeUrl}
                    className="portal-btn-theme-primary"
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Guidance & Best Practices */}
          <div className="portal-resume-sidebar-guidance">
            <div className="portal-glass-card portal-settings-card">
              <h2 className="portal-interview-card-title-wrap">
                <SafetyCertificateOutlined className="portal-icon-theme-link" />
                <span className="portal-job-card-title">IBC Resume Guidance</span>
              </h2>

              <div className="portal-resume-sidebar-guidance">
                <div className="portal-resume-tip-card">
                  <div className="portal-resume-tip-title">
                    1. Highlight Mandate Values & CIRP Stages
                  </div>
                  <div className="portal-resume-tip-desc">
                    Mention verified claim amounts, liquidation valuations, and NCLT bench jurisdictions (e.g. Principal Bench, Mumbai, NCLAT).
                  </div>
                </div>

                <div className="portal-resume-tip-card">
                  <div className="portal-resume-tip-title">
                    2. Section 29A Due Diligence & CoC Experience
                  </div>
                  <div className="portal-resume-tip-desc">
                    State experience in prospective resolution applicant vetting and drafting evaluation matrices.
                  </div>
                </div>

                <div className="portal-resume-tip-card">
                  <div className="portal-resume-tip-title">
                    3. Statutory Registrations
                  </div>
                  <div className="portal-resume-tip-desc">
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
            <Button type="primary" className="portal-btn-theme-primary">
              Open in New Window ↗
            </Button>
          </a>
        ]}
      >
        <div className="portal-resume-preview-container">
          {resumeUrl?.startsWith('data:') || resumeUrl?.includes('.pdf') || resumeUrl?.includes('resumes/') ? (
            <iframe
              src={getFileUrl(resumeUrl)}
              title="Resume Preview"
              className="portal-resume-iframe"
            />
          ) : (
            <div className="portal-table-empty">
              <FileTextOutlined className="portal-empty-state-icon" />
              <h3 className="portal-empty-state-title">Document Link Preview</h3>
              <p>{resumeUrl}</p>
              <a href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer">
                <Button type="primary" className="portal-empty-state-btn">Open External Document Link</Button>
              </a>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};

export default CandidateResume;

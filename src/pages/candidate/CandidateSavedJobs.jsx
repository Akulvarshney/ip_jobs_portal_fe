import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Tag, 
  message, 
  Popconfirm, 
  Modal, 
  Input, 
  Tooltip,
  Row,
  Col
} from 'antd';
import { 
  BookOutlined, 
  DeleteOutlined, 
  SendOutlined, 
  EyeOutlined, 
  CheckCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSavedJobs, toggleSaveJob } from '../../store/candidateSlice';
import api from '../../api';

const CandidateSavedJobs = () => {
  const dispatch = useDispatch();
  const { savedJobs: rawSavedJobs, loading } = useSelector((state) => state.candidate);
  const savedJobs = Array.isArray(rawSavedJobs) ? rawSavedJobs : (rawSavedJobs?.data || []);

  // Apply Modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverNote, setCoverNote] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    dispatch(fetchSavedJobs());
  }, [dispatch]);

  const handleRemoveSaved = async (jobId) => {
    try {
      const res = await dispatch(toggleSaveJob(jobId)).unwrap();
      message.success('Removed from bookmarks');
    } catch (error) {
      message.error(error || 'Failed to remove bookmark');
    }
  };

  const handleOpenApply = (job) => {
    setSelectedJob(job);
    setCoverNote('');
    setApplyModalOpen(true);
  };

  const submitApplication = async () => {
    if (!selectedJob) return;
    try {
      setApplying(true);
      const res = await api.post('/api/candidate/apply', {
        jobId: selectedJob.id,
        coverNote
      });
      if (res.data?.success) {
        message.success('Application submitted successfully!');
        setApplyModalOpen(false);
        fetchSavedJobs();
      }
    } catch (error) {
      message.error(error?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '28px' }}
      >
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>Saved Mandates</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0' }}>
            Bookmarked opportunities for quick reference and application.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
          <AnimatePresence>
            {savedJobs.map((item) => {
              const job = item.job;
              const hasApplied = job?.applications?.length > 0;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -4 }}
                  className="portal-glass-card"
                  style={{
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(56, 189, 248, 0.05))',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          color: '#10b981',
                          fontSize: '15px'
                        }}>
                          {job?.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                        </div>
                        <div>
                          <div style={{ fontSize: '12px', color: '#10b981', fontWeight: 600 }}>
                            {job?.employer?.type || 'VERIFIED ORG'}
                          </div>
                          <div style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: 500 }}>
                            {job?.employer?.name || 'Insolvency Entity'}
                          </div>
                        </div>
                      </div>

                      <Popconfirm
                        title="Remove from saved jobs?"
                        onConfirm={() => handleRemoveSaved(job.id)}
                        okText="Remove"
                        cancelText="Cancel"
                      >
                        <Button 
                          size="small" 
                          danger 
                          icon={<DeleteOutlined />} 
                          style={{ borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }} 
                        />
                      </Popconfirm>
                    </div>

                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'white', margin: '0 0 8px' }}>
                      {job?.title}
                    </h3>

                    <p style={{
                      color: '#9ca3af',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      marginBottom: '14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}>
                      {job?.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {job?.skills?.slice(0, 3).map(s => (
                        <Tag key={s.skill?.id} style={{ borderRadius: '6px', fontSize: '11px', background: 'rgba(255, 255, 255, 0.05)', color: '#cbd5e1', border: 'none' }}>
                          {s.skill?.name}
                        </Tag>
                      ))}
                    </div>
                  </div>

                  <div style={{ paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Link to={`/jobs/${job?.id}`} style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 500 }}>
                      View Mandate ↗
                    </Link>

                    {hasApplied ? (
                      <Tag color="cyan" icon={<CheckCircleOutlined />}>Applied</Tag>
                    ) : (
                      <button
                        className="portal-btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                        onClick={() => handleOpenApply(job)}
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {savedJobs.length === 0 && !loading && (
          <div className="portal-glass-card" style={{ padding: '60px', textAlign: 'center', marginTop: '20px' }}>
            <BookOutlined style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px', opacity: 0.6 }} />
            <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>No saved mandates yet</h3>
            <p style={{ color: '#9ca3af', marginTop: '8px' }}>Save interesting roles from the search page to apply later.</p>
            <Link to="/candidate/jobs">
              <Button type="primary" style={{ marginTop: '12px', borderRadius: '8px' }}>Explore Mandates</Button>
            </Link>
          </div>
        )}

      {/* Apply Modal */}
      <Modal
        title={`Apply for ${selectedJob?.title || 'Mandate'}`}
        open={applyModalOpen}
        onCancel={() => setApplyModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setApplyModalOpen(false)}>
            Cancel
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={applying} 
            onClick={submitApplication}
            style={{ background: '#0ea5e9' }}
          >
            Submit Application
          </Button>,
        ]}
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ color: '#cbd5e1', fontSize: '14px' }}>
            Applying to: <strong>{selectedJob?.employer?.name}</strong>
          </p>
          <div style={{ marginTop: '16px', marginBottom: '8px' }}>
            <label style={{ display: 'block', fontSize: '13px', color: '#94a3b8', marginBottom: '6px' }}>
              Cover Note (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant CIRP, liquidation, resolution plan, or forensic assignments..."
              style={{ borderRadius: '8px', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CandidateSavedJobs;

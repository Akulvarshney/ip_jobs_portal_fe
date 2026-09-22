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
        className="portal-page-header"
      >
        <h1 className="portal-page-title">Saved Mandates</h1>
        <p className="portal-page-subtitle">
          Bookmarked opportunities for quick reference and application.
        </p>
      </motion.div>

      <div className="portal-cards-grid">
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
                className="portal-glass-card portal-saved-card"
              >
                <div>
                  <div className="portal-saved-card-header">
                    <div className="portal-saved-company-group">
                      <div className="portal-saved-avatar">
                        {job?.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <div>
                        <div className="portal-saved-org-type">
                          {job?.employer?.type || 'VERIFIED ORG'}
                        </div>
                        <div className="portal-saved-org-name">
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
                        className="portal-delete-btn"
                      />
                    </Popconfirm>
                  </div>

                  <h3 className="portal-saved-job-title">
                    {job?.title}
                  </h3>

                  <p className="portal-saved-job-desc">
                    {job?.description}
                  </p>

                  <div className="portal-saved-skills-wrap">
                    {job?.skills?.slice(0, 3).map(s => (
                      <Tag key={s.skill?.id} className="portal-saved-skill-tag">
                        {s.skill?.name}
                      </Tag>
                    ))}
                  </div>
                </div>

                <div className="portal-saved-card-footer">
                  <Link to={`/jobs/${job?.id}`} className="portal-saved-view-link">
                    View Mandate ↗
                  </Link>

                  {hasApplied ? (
                    <Tag color="cyan" icon={<CheckCircleOutlined />}>Applied</Tag>
                  ) : (
                    <button
                      className="portal-btn-primary portal-saved-apply-btn"
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
        <div className="portal-glass-card portal-empty-state-card">
          <BookOutlined className="portal-empty-state-icon" />
          <h3 className="portal-empty-state-title">No saved mandates yet</h3>
          <p className="portal-empty-state-desc">Save interesting roles from the search page to apply later.</p>
          <Link to="/candidate/jobs">
            <Button type="primary" className="portal-empty-state-btn">Explore Mandates</Button>
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
            className="portal-btn-theme-primary"
          >
            Submit Application
          </Button>,
        ]}
      >
        <div className="portal-modal-apply-body">
          <p className="portal-modal-apply-target">
            Applying to: <strong>{selectedJob?.employer?.name}</strong>
          </p>
          <div className="portal-modal-field-group">
            <label className="portal-modal-field-label">
              Cover Note (Optional):
            </label>
            <Input.TextArea
              rows={4}
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              placeholder="Highlight relevant CIRP, liquidation, resolution plan, or forensic assignments..."
              className="portal-modal-textarea"
            />
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CandidateSavedJobs;

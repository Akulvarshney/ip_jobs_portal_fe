import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../../store/jobsSlice';
import { updateApplicationStatus, inviteCandidate } from '../../store/employerSlice';
import { updateAdminJobStatus } from '../../store/adminSlice';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  SendOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  EyeOutlined, 
  DownloadOutlined, 
  CalendarOutlined, 
  BankOutlined, 
  EnvironmentOutlined, 
  SolutionOutlined, 
  PauseCircleOutlined, 
  PlayCircleOutlined, 
  MailOutlined, 
  PhoneOutlined,
  DollarOutlined 
} from '@ant-design/icons';
import { Table, Button, Tag, Modal, Select, message, Space, Tooltip, Divider, Badge } from 'antd';
import { motion } from 'framer-motion';
import { getJobTypeLabel, getJobTypeColor, getSalaryRangeLabel, getExperienceLevelLabel } from '../../utils/jobType';

const { Option } = Select;

const EmployerJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchJobById(id)).unwrap();
      setJob(res);
    } catch (error) {
      console.error('Error fetching job details:', error);
      message.error('Failed to load mandate details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, dispatch]);

  const handleUpdateAppStatus = async (appId, newStatus) => {
    setActionLoadingId(appId);
    try {
      await dispatch(updateApplicationStatus({ id: appId, status: newStatus })).unwrap();
      message.success(`Candidate status updated to ${newStatus}`);
      fetchJobDetails();
      if (selectedCandidate?.appId === appId) {
        setSelectedCandidate(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendInvite = async (appId) => {
    setActionLoadingId(appId);
    try {
      await dispatch(inviteCandidate(appId)).unwrap();
      message.success('Direct interview invitation sent successfully!');
      fetchJobDetails();
      if (selectedCandidate?.appId === appId) {
        setSelectedCandidate(prev => ({ ...prev, status: 'INTERVIEW' }));
      }
    } catch (error) {
      console.error('Error sending invite:', error);
      message.error(typeof error === 'string' ? error : 'Failed to send invite');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleJobStatus = async (newStatus) => {
    try {
      await dispatch(updateAdminJobStatus({ id: job.id, status: newStatus })).unwrap();
      message.success(`Mandate status updated to ${newStatus}`);
      fetchJobDetails();
    } catch (error) {
      console.error('Error updating job status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update job status');
    }
  };

  const openCandidateDossier = (application) => {
    setSelectedCandidate({
      ...application.candidate,
      appId: application.id,
      status: application.status,
      appliedAt: application.createdAt
    });
    setCandidateModalOpen(true);
  };

  const openCVModal = (application) => {
    setSelectedCandidate({
      ...application.candidate,
      appId: application.id,
      status: application.status,
      appliedAt: application.createdAt
    });
    setCvModalOpen(true);
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 'APPLIED': return <Tag color="blue" className="font-semibold">APPLIED</Tag>;
      case 'SHORTLISTED': return <Tag color="gold" className="font-semibold">SHORTLISTED</Tag>;
      case 'INTERVIEW': return <Tag color="purple" className="font-semibold">INTERVIEW SCHEDULED</Tag>;
      case 'SELECTED': return <Tag color="green" className="font-semibold">HIRED / SELECTED</Tag>;
      case 'REJECTED': return <Tag color="red" className="font-semibold">REJECTED</Tag>;
      default: return <Tag color="blue">{status || 'APPLIED'}</Tag>;
    }
  };

  const applicantColumns = [
    {
      title: 'Candidate Profile',
      key: 'name',
      render: (_, record) => {
        const c = record.candidate;
        const profile = c?.candidateProfile;
        return (
          <div className="portal-flex-center-gap-12">
            <div className="portal-avatar-init">
              {c?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div className="portal-candidate-name">
                {c?.name || 'Candidate'}
              </div>
              <div className="portal-candidate-sub">
                {profile?.designation || 'Insolvency Professional'}
                {profile?.experience ? ` • ${profile.experience} Yrs Exp` : ''}
                {profile?.city ? ` • ${profile.city}` : ''}
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Expertise / Skills',
      key: 'skills',
      render: (_, record) => {
        const skills = record.candidate?.candidateProfile?.skills || [];
        return (
          <div className="portal-applicant-skills-box">
            {skills.slice(0, 3).map(s => (
              <Tag key={s.skill.id} color="cyan" className="portal-tag-tiny">
                {s.skill.name}
              </Tag>
            ))}
            {skills.length > 3 && (
              <Tag className="portal-tag-more">
                +{skills.length - 3} more
              </Tag>
            )}
            {skills.length === 0 && <span className="portal-text-placeholder-xs">Standard IP Profile</span>}
          </div>
        );
      }
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span className="portal-text-detail-sm">
          {new Date(date).toLocaleDateString()}
        </span>
      )
    },
    {
      title: 'Pipeline Status',
      key: 'status',
      render: (_, record) => getStatusTag(record.status)
    },
    {
      title: 'Candidate Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small" wrap>
          <Tooltip title="View CV">
            <Button 
              size="small"
              icon={<FileTextOutlined className="portal-text-link" />}
              onClick={() => openCVModal(record)}
              className="portal-btn-cyan-soft"
            />
          </Tooltip>

          <Tooltip title="Candidate Profile">
            <Button 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openCandidateDossier(record)}
              className="portal-btn-neutral"
            />
          </Tooltip>

          <Select
            size="small"
            value={record.status}
            onChange={(val) => handleUpdateAppStatus(record.id, val)}
            loading={actionLoadingId === record.id}
            className="portal-w-140"
          >
            <Option value="APPLIED">Applied</Option>
            <Option value="SHORTLISTED">Shortlist</Option>
            <Option value="INTERVIEW">Interview</Option>
            <Option value="SELECTED">Hire / Select</Option>
            <Option value="REJECTED">Reject</Option>
          </Select>
        </Space>
      )
    }
  ];

  if (loading && !job) {
    return (
      <div className="portal-loading-container">
        <p className="portal-loading-text">Loading mandate details & candidates...</p>
      </div>
    );
  }

  const applicationsList = job?.applications || [];
  const shortlistedCount = applicationsList.filter(a => a.status === 'SHORTLISTED').length;
  const interviewCount = applicationsList.filter(a => a.status === 'INTERVIEW').length;
  const selectedCount = applicationsList.filter(a => a.status === 'SELECTED').length;

  return (
    <div className="portal-w-full">
      {/* Navigation & Header */}
        <div className="portal-mb-24">
          <button 
            onClick={() => navigate('/employer')}
            className="portal-btn-secondary portal-btn-back"
          >
            <ArrowLeftOutlined /> Back to Entity Dashboard
          </button>
        </div>

        {/* Top Section: Mandate Overview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card portal-p-28 portal-mb-32" 
        >
          <div className="portal-job-details-header">
            <div>
              <div className="portal-flex-center-wrap-gap-10 portal-mb-8">
                <Tag color={job?.status === 'ACTIVE' ? 'green' : (job?.status === 'PAUSED' ? 'gold' : 'default')} className="portal-tag-badge">
                  {job?.status}
                </Tag>
                <Tag color={getJobTypeColor(job?.jobType)} className="portal-tag-badge-rounded">
                  {getJobTypeLabel(job?.jobType)}
                </Tag>
                <Tag color="geekblue" className="portal-tag-badge-rounded">
                  {getExperienceLevelLabel(job?.experienceLevel)}
                </Tag>
                <span className="portal-text-muted-sm">
                  Listed on {new Date(job?.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="portal-section-title portal-text-30 m-0">
                {job?.title}
              </h1>
              <div className="portal-job-meta-row">
                <BankOutlined /> {job?.employer?.name}
                {job?.employer?.location && (
                  <span className="portal-text-muted ml-10">
                    <EnvironmentOutlined /> {job.employer.location}
                  </span>
                )}
                <span className="portal-text-success ml-10 font-semibold">
                  <DollarOutlined /> {getSalaryRangeLabel(job?.salaryRange)}
                </span>
              </div>
            </div>

            {/* Quick Mandate Controls */}
            <div className="portal-flex-gap-10">
              {job?.status === 'ACTIVE' ? (
                <Button 
                  icon={<PauseCircleOutlined />} 
                  onClick={() => handleToggleJobStatus('PAUSED')}
                  className="portal-btn-warning-soft"
                >
                  Pause Mandate
                </Button>
              ) : (
                <Button 
                  type="primary"
                  icon={<PlayCircleOutlined />} 
                  onClick={() => handleToggleJobStatus('ACTIVE')}
                  className="portal-btn-success"
                >
                  Re-Activate Mandate
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="portal-metrics-bar">
            <div>
              <span className="portal-text-muted-xs">Total Applications</span>
              <div className="portal-metric-val link">{applicationsList.length}</div>
            </div>
            <div>
              <span className="portal-text-muted-xs">Shortlisted</span>
              <div className="portal-metric-val warning">{shortlistedCount}</div>
            </div>
            <div>
              <span className="portal-text-muted-xs">Interviews Active</span>
              <div className="portal-metric-val purple">{interviewCount}</div>
            </div>
            <div>
              <span className="portal-text-muted-xs">Hired / Selected</span>
              <div className="portal-metric-val success">{selectedCount}</div>
            </div>
          </div>

          {/* Mandate Description & Requirements */}
          <div className="portal-grid-2col-gap-20">
            <div>
              <h4 className="portal-subheading-cyan">
                Mandate Scope & Description
              </h4>
              <div className="portal-box-desc">
                {job?.description}
              </div>
            </div>
            <div>
              <h4 className="portal-subheading-cyan">
                Compliance & Statutory Requirements
              </h4>
              <div className="portal-box-desc">
                {job?.requirements}
              </div>
            </div>
          </div>

          {job?.skills?.length > 0 && (
            <div className="portal-mt-20">
              <h4 className="portal-subheading-cyan">
                Mandate Specialisations & Skills
              </h4>
              <div className="portal-flex-wrap-gap-8">
                {job.skills.map(s => (
                  <Tag key={s.skill.id} color="blue" className="portal-tag-badge-rounded">
                    {s.skill.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Section: Applied Candidates List */}
        <div className="portal-applied-header">
          <div>
            <h2 className="portal-section-title portal-text-24 m-0">
              Applied Candidates ({applicationsList.length})
            </h2>
            <p className="portal-section-subtitle portal-text-14 mt-4">
              Review applicant qualifications, inspect complete CV portfolios, and schedule direct interviews.
            </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card portal-p-20" 
        >
          <Table 
            columns={applicantColumns}
            dataSource={applicationsList}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            className="portal-table"
            locale={{
              emptyText: <div className="portal-empty-table-text">No candidates have applied to this mandate yet.</div>
            }}
          />
        </motion.div>

        {/* Candidate CV / Resume Preview Modal */}
        <Modal
          title={
            <div className="portal-modal-title-row">
              <FileTextOutlined className="portal-text-link" /> Candidate Curriculum Vitae — {selectedCandidate?.name}
            </div>
          }
          open={cvModalOpen}
          onCancel={() => setCvModalOpen(false)}
          footer={null}
          width={800}
        >
          {selectedCandidate && (
            <div className="portal-mt-16 text-secondary">
              
              {/* CV Header Banner */}
              <div className="portal-cv-header-banner">
                <div className="portal-cv-header-row">
                  <div>
                    <h3 className="portal-cv-name">
                      {selectedCandidate.name}
                    </h3>
                    <p className="portal-cv-role">
                      {selectedCandidate.candidateProfile?.designation || 'Insolvency & Restructuring Professional'}
                    </p>
                    <div className="portal-cv-contact-row">
                      <span><MailOutlined /> {selectedCandidate.email}</span>
                      {selectedCandidate.candidateProfile?.phone && (
                        <span><PhoneOutlined /> {selectedCandidate.candidateProfile.phone}</span>
                      )}
                      {selectedCandidate.candidateProfile?.city && (
                        <span><EnvironmentOutlined /> {selectedCandidate.candidateProfile.city}</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    {getStatusTag(selectedCandidate.status)}
                    <div className="portal-text-muted-xs mt-6">
                      Applied {new Date(selectedCandidate.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Sections */}
              <div className="portal-flex-col-gap-20">
                
                {/* Professional Experience Section */}
                <div className="portal-cv-section-card">
                  <h4 className="portal-cv-section-title">
                    <SolutionOutlined /> Professional Insolvency & Restructuring Experience
                  </h4>
                  {selectedCandidate.candidateProfile?.experiences?.length > 0 ? (
                    <div className="portal-flex-col-gap-14">
                      {selectedCandidate.candidateProfile.experiences.map((exp) => (
                        <div key={exp.id} className="portal-cv-exp-item">
                          <div className="portal-text-base-bold">{exp.designation}</div>
                          <div className="portal-text-link-sm font-medium">{exp.organisation}</div>
                          <div className="portal-text-muted-xs mt-2">
                            {exp.isCurrent ? 'Present' : 'Past Engagement'}
                          </div>
                          {exp.description && (
                            <p className="portal-text-detail-sm mt-6 leading-relaxed">
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="portal-text-muted-sm m-0">
                      Total Experience: {selectedCandidate.candidateProfile?.experience || 0} years in corporate restructuring and insolvency processes.
                    </p>
                  )}
                </div>

                {/* Education & IBBI Certifications */}
                <div className="portal-cv-section-card">
                  <h4 className="portal-cv-section-title">
                    <BankOutlined /> Qualifications & Certifications
                  </h4>
                  {selectedCandidate.candidateProfile?.educations?.length > 0 ? (
                    <div className="portal-flex-col-gap-10">
                      {selectedCandidate.candidateProfile.educations.map((edu) => (
                        <div key={edu.id} className="portal-cv-edu-row">
                          <div>
                            <strong className="portal-text-heading-sm">{edu.qualification}</strong> ({edu.degree})
                            <div className="portal-text-muted-xs">{edu.institution}</div>
                          </div>
                          {edu.completionYear && <Tag color="blue">{edu.completionYear}</Tag>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="portal-text-muted-sm m-0">Verified Professional Credentials recorded on portal.</p>
                  )}
                </div>

                {/* Skills Portfolio */}
                {selectedCandidate.candidateProfile?.skills?.length > 0 && (
                  <div className="portal-cv-section-card">
                    <h4 className="portal-cv-section-title mb-12">
                      Competency & Domain Skills
                    </h4>
                    <div className="portal-flex-wrap-gap-8">
                      {selectedCandidate.candidateProfile.skills.map(s => (
                        <Tag key={s.skill.id} color="cyan" className="portal-tag-badge-rounded">
                          {s.skill.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in CV Modal */}
              <div className="portal-cv-actions-row">
                <Button 
                  onClick={() => setCvModalOpen(false)}
                  className="portal-btn-neutral"
                >
                  Close CV
                </Button>

                <div className="portal-flex-gap-10">
                  {selectedCandidate.status !== 'INTERVIEW' && (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={actionLoadingId === selectedCandidate.appId}
                      onClick={() => handleSendInvite(selectedCandidate.appId)}
                      className="portal-btn-cyan font-medium"
                    >
                      Send Interview Invite
                    </Button>
                  )}
                  {selectedCandidate.status !== 'SHORTLISTED' && (
                    <Button
                      icon={<CheckCircleOutlined />}
                      loading={actionLoadingId === selectedCandidate.appId}
                      onClick={() => handleUpdateAppStatus(selectedCandidate.appId, 'SHORTLISTED')}
                      className="portal-btn-warning-soft"
                    >
                      Shortlist Candidate
                    </Button>
                  )}
                  {selectedCandidate.status !== 'SELECTED' && (
                    <Button
                      icon={<CheckCircleOutlined />}
                      loading={actionLoadingId === selectedCandidate.appId}
                      onClick={() => handleUpdateAppStatus(selectedCandidate.appId, 'SELECTED')}
                      className="portal-btn-success"
                    >
                      Select / Hire
                    </Button>
                  )}
                </div>
              </div>

            </div>
          )}
        </Modal>

        {/* Candidate Profile Dossier Modal */}
        <Modal
          title={
            <div className="portal-modal-title-row">
              <UserOutlined className="portal-text-link" /> Candidate Profile Dossier
            </div>
          }
          open={candidateModalOpen}
          onCancel={() => setCandidateModalOpen(false)}
          footer={null}
          width={720}
        >
          {selectedCandidate && (
            <div className="portal-mt-16 text-secondary">
              <div className="portal-dossier-header-card">
                <div>
                  <h3 className="portal-text-20 m-0 font-bold portal-text-heading">{selectedCandidate.name}</h3>
                  <p className="portal-text-muted-sm mt-4 m-0">{selectedCandidate.email}</p>
                </div>
                {getStatusTag(selectedCandidate.status)}
              </div>

              <div className="portal-dossier-grid">
                <div className="portal-dossier-box">
                  <span className="portal-text-muted-xs">Current Designation</span>
                  <div className="portal-text-heading font-semibold">{selectedCandidate.candidateProfile?.designation || 'N/A'}</div>
                </div>
                <div className="portal-dossier-box">
                  <span className="portal-text-muted-xs">Total Experience</span>
                  <div className="portal-text-heading font-semibold">{selectedCandidate.candidateProfile?.experience ? `${selectedCandidate.candidateProfile.experience} Years` : 'N/A'}</div>
                </div>
                <div className="portal-dossier-box">
                  <span className="portal-text-muted-xs">City / Location</span>
                  <div className="portal-text-heading font-semibold">{selectedCandidate.candidateProfile?.city || 'N/A'}</div>
                </div>
                <div className="portal-dossier-box">
                  <span className="portal-text-muted-xs">Notice Period</span>
                  <div className="portal-text-heading font-semibold">{selectedCandidate.candidateProfile?.noticePeriod || 'N/A'}</div>
                </div>
              </div>

              <div className="portal-flex-end mt-24">
                <Button 
                  onClick={() => setCandidateModalOpen(false)}
                  className="portal-btn-neutral"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
  );
};

export default EmployerJobDetails;

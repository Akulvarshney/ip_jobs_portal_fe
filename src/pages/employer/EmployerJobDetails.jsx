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
  PhoneOutlined 
} from '@ant-design/icons';
import { Table, Button, Tag, Modal, Select, message, Space, Tooltip, Divider, Badge } from 'antd';
import { motion } from 'framer-motion';

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
      case 'APPLIED': return <Tag color="blue" style={{ fontWeight: 600 }}>APPLIED</Tag>;
      case 'SHORTLISTED': return <Tag color="gold" style={{ fontWeight: 600 }}>SHORTLISTED</Tag>;
      case 'INTERVIEW': return <Tag color="purple" style={{ fontWeight: 600 }}>INTERVIEW SCHEDULED</Tag>;
      case 'SELECTED': return <Tag color="green" style={{ fontWeight: 600 }}>HIRED / SELECTED</Tag>;
      case 'REJECTED': return <Tag color="red" style={{ fontWeight: 600 }}>REJECTED</Tag>;
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.2) 0%, rgba(56, 189, 248, 0.1) 100%)',
                border: '1px solid rgba(14, 165, 233, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              {c?.name?.charAt(0) || 'C'}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: '15px' }}>
                {c?.name || 'Candidate'}
              </div>
              <div style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '280px' }}>
            {skills.slice(0, 3).map(s => (
              <Tag key={s.skill.id} color="cyan" style={{ fontSize: '11px', borderRadius: '4px', margin: 0 }}>
                {s.skill.name}
              </Tag>
            ))}
            {skills.length > 3 && (
              <Tag style={{ fontSize: '11px', background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: 'none' }}>
                +{skills.length - 3} more
              </Tag>
            )}
            {skills.length === 0 && <span style={{ color: '#6b7280', fontSize: '12px' }}>Standard IP Profile</span>}
          </div>
        );
      }
    },
    {
      title: 'Applied On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
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
          <Button 
            size="small"
            icon={<FileTextOutlined style={{ color: '#38bdf8' }} />}
            onClick={() => openCVModal(record)}
            style={{
              background: 'rgba(14, 165, 233, 0.1)',
              borderColor: 'rgba(14, 165, 233, 0.3)',
              color: '#bae6fd',
              borderRadius: '6px',
              fontWeight: 500
            }}
          >
            View CV
          </Button>

          <Button 
            size="small"
            icon={<EyeOutlined />}
            onClick={() => openCandidateDossier(record)}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              borderRadius: '6px'
            }}
          >
            Profile
          </Button>

          <Select
            size="small"
            value={record.status}
            onChange={(val) => handleUpdateAppStatus(record.id, val)}
            loading={actionLoadingId === record.id}
            style={{ width: 140 }}
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
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <p style={{ color: '#9ca3af', fontSize: '16px' }}>Loading mandate details & candidates...</p>
      </div>
    );
  }

  const applicationsList = job?.applications || [];
  const shortlistedCount = applicationsList.filter(a => a.status === 'SHORTLISTED').length;
  const interviewCount = applicationsList.filter(a => a.status === 'INTERVIEW').length;
  const selectedCount = applicationsList.filter(a => a.status === 'SELECTED').length;

  return (
    <div style={{ width: '100%' }}>
      {/* Navigation & Header */}
        <div style={{ marginBottom: '24px' }}>
          <button 
            className="portal-btn-secondary"
            onClick={() => navigate('/employer')}
            style={{ padding: '8px 16px', fontSize: '13px', marginBottom: '16px' }}
          >
            <ArrowLeftOutlined /> Back to Entity Dashboard
          </button>
        </div>

        {/* Top Section: Mandate Overview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card" 
          style={{ padding: '28px', marginBottom: '32px' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Tag color={job?.status === 'ACTIVE' ? 'green' : (job?.status === 'PAUSED' ? 'gold' : 'default')} style={{ fontSize: '13px', padding: '3px 10px', fontWeight: 600 }}>
                  {job?.status}
                </Tag>
                <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                  Listed on {new Date(job?.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h1 className="portal-section-title" style={{ fontSize: '30px', margin: 0 }}>
                {job?.title}
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '15px', marginTop: '6px', fontWeight: 500 }}>
                <BankOutlined /> {job?.employer?.name}
                {job?.employer?.location && (
                  <span style={{ color: '#9ca3af', marginLeft: '10px' }}>
                    <EnvironmentOutlined /> {job.employer.location}
                  </span>
                )}
              </div>
            </div>

            {/* Quick Mandate Controls */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {job?.status === 'ACTIVE' ? (
                <Button 
                  icon={<PauseCircleOutlined />} 
                  onClick={() => handleToggleJobStatus('PAUSED')}
                  style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde047', borderRadius: '10px' }}
                >
                  Pause Mandate
                </Button>
              ) : (
                <Button 
                  type="primary"
                  icon={<PlayCircleOutlined />} 
                  onClick={() => handleToggleJobStatus('ACTIVE')}
                  style={{ background: '#10b981', borderColor: '#10b981', borderRadius: '10px' }}
                >
                  Re-Activate Mandate
                </Button>
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '14px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              borderRadius: '14px',
              marginBottom: '24px'
            }}
          >
            <div>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Total Applications</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#38bdf8' }}>{applicationsList.length}</div>
            </div>
            <div>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Shortlisted</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fde047' }}>{shortlistedCount}</div>
            </div>
            <div>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Interviews Active</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#c084fc' }}>{interviewCount}</div>
            </div>
            <div>
              <span style={{ color: '#9ca3af', fontSize: '12px' }}>Hired / Selected</span>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#34d399' }}>{selectedCount}</div>
            </div>
          </div>

          {/* Mandate Description & Requirements */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                Mandate Scope & Description
              </h4>
              <div style={{ color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', fontSize: '14px', whiteSpace: 'pre-line' }}>
                {job?.description}
              </div>
            </div>
            <div>
              <h4 style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                Compliance & Statutory Requirements
              </h4>
              <div style={{ color: '#cbd5e1', lineHeight: 1.6, background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '10px', fontSize: '14px', whiteSpace: 'pre-line' }}>
                {job?.requirements}
              </div>
            </div>
          </div>

          {job?.skills?.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>
                Mandate Specialisations & Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {job.skills.map(s => (
                  <Tag key={s.skill.id} color="blue" style={{ padding: '4px 10px', borderRadius: '6px' }}>
                    {s.skill.name}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Section: Applied Candidates List */}
        <div style={{ marginBottom: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 className="portal-section-title" style={{ fontSize: '24px', margin: 0 }}>
              Applied Candidates ({applicationsList.length})
            </h2>
            <p className="portal-section-subtitle" style={{ fontSize: '14px', marginTop: '4px' }}>
              Review applicant qualifications, inspect complete CV portfolios, and schedule direct interviews.
            </p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="portal-glass-card" 
          style={{ padding: '20px' }}
        >
          <Table 
            columns={applicantColumns}
            dataSource={applicationsList}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            className="portal-table"
            locale={{
              emptyText: <div style={{ padding: '30px', color: '#9ca3af' }}>No candidates have applied to this mandate yet.</div>
            }}
          />
        </motion.div>

        {/* Candidate CV / Resume Preview Modal */}
        <Modal
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '18px', fontWeight: 700 }}>
              <FileTextOutlined style={{ color: '#38bdf8' }} /> Candidate Curriculum Vitae — {selectedCandidate?.name}
            </div>
          }
          open={cvModalOpen}
          onCancel={() => setCvModalOpen(false)}
          footer={null}
          width={800}
          styles={{
            content: { background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px' },
            header: { background: '#1e293b' },
          }}
        >
          {selectedCandidate && (
            <div style={{ color: '#e2e8f0', marginTop: '16px' }}>
              
              {/* CV Header Banner */}
              <div 
                style={{
                  padding: '20px',
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(30, 41, 59, 0.6) 100%)',
                  border: '1px solid rgba(14, 165, 233, 0.3)',
                  borderRadius: '14px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, color: '#ffffff', fontSize: '24px', fontWeight: 800 }}>
                      {selectedCandidate.name}
                    </h3>
                    <p style={{ margin: '4px 0 0', color: '#38bdf8', fontSize: '15px', fontWeight: 600 }}>
                      {selectedCandidate.candidateProfile?.designation || 'Insolvency & Restructuring Professional'}
                    </p>
                    <div style={{ display: 'flex', gap: '16px', marginTop: '8px', color: '#cbd5e1', fontSize: '13px', flexWrap: 'wrap' }}>
                      <span><MailOutlined /> {selectedCandidate.email}</span>
                      {selectedCandidate.candidateProfile?.phone && (
                        <span><PhoneOutlined /> {selectedCandidate.candidateProfile.phone}</span>
                      )}
                      {selectedCandidate.candidateProfile?.city && (
                        <span><EnvironmentOutlined /> {selectedCandidate.candidateProfile.city}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {getStatusTag(selectedCandidate.status)}
                    <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '6px' }}>
                      Applied {new Date(selectedCandidate.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Sections */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Professional Experience Section */}
                <div style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#38bdf8', fontSize: '14px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SolutionOutlined /> Professional Insolvency & Restructuring Experience
                  </h4>
                  {selectedCandidate.candidateProfile?.experiences?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {selectedCandidate.candidateProfile.experiences.map((exp) => (
                        <div key={exp.id} style={{ borderLeft: '2px solid #0ea5e9', paddingLeft: '14px' }}>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: '15px' }}>{exp.designation}</div>
                          <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 500 }}>{exp.organisation}</div>
                          <div style={{ color: '#9ca3af', fontSize: '12px', marginTop: '2px' }}>
                            {exp.isCurrent ? 'Present' : 'Past Engagement'}
                          </div>
                          {exp.description && (
                            <p style={{ color: '#cbd5e1', fontSize: '13px', margin: '6px 0 0', lineHeight: 1.5 }}>
                              {exp.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px' }}>
                      Total Experience: {selectedCandidate.candidateProfile?.experience || 0} years in corporate restructuring and insolvency processes.
                    </p>
                  )}
                </div>

                {/* Education & IBBI Certifications */}
                <div style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                  <h4 style={{ color: '#38bdf8', fontSize: '14px', textTransform: 'uppercase', marginBottom: '14px', fontWeight: 700, letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BankOutlined /> Qualifications & Certifications
                  </h4>
                  {selectedCandidate.candidateProfile?.educations?.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {selectedCandidate.candidateProfile.educations.map((edu) => (
                        <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#e2e8f0' }}>
                          <div>
                            <strong style={{ color: '#ffffff', fontSize: '14px' }}>{edu.qualification}</strong> ({edu.degree})
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>{edu.institution}</div>
                          </div>
                          {edu.completionYear && <Tag color="blue">{edu.completionYear}</Tag>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#9ca3af', margin: 0, fontSize: '13px' }}>Verified Professional Credentials recorded on portal.</p>
                  )}
                </div>

                {/* Skills Portfolio */}
                {selectedCandidate.candidateProfile?.skills?.length > 0 && (
                  <div style={{ padding: '18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}>
                    <h4 style={{ color: '#38bdf8', fontSize: '14px', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
                      Competency & Domain Skills
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {selectedCandidate.candidateProfile.skills.map(s => (
                        <Tag key={s.skill.id} color="cyan" style={{ padding: '5px 12px', fontSize: '13px', borderRadius: '8px' }}>
                          {s.skill.name}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons in CV Modal */}
              <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <Button 
                  onClick={() => setCvModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    borderRadius: '8px'
                  }}
                >
                  Close CV
                </Button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedCandidate.status !== 'INTERVIEW' && (
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={actionLoadingId === selectedCandidate.appId}
                      onClick={() => handleSendInvite(selectedCandidate.appId)}
                      style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '8px' }}
                    >
                      Send Interview Invite
                    </Button>
                  )}
                  {selectedCandidate.status !== 'SHORTLISTED' && (
                    <Button
                      icon={<CheckCircleOutlined />}
                      loading={actionLoadingId === selectedCandidate.appId}
                      onClick={() => handleUpdateAppStatus(selectedCandidate.appId, 'SHORTLISTED')}
                      style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fde047', borderRadius: '8px' }}
                    >
                      Shortlist Candidate
                    </Button>
                  )}
                  {selectedCandidate.status !== 'SELECTED' && (
                    <Button
                      icon={<CheckCircleOutlined />}
                      loading={actionLoadingId === selectedCandidate.appId}
                      onClick={() => handleUpdateAppStatus(selectedCandidate.appId, 'SELECTED')}
                      style={{ background: '#10b981', borderColor: '#10b981', color: '#ffffff', borderRadius: '8px' }}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'white', fontSize: '18px', fontWeight: 700 }}>
              <UserOutlined style={{ color: '#38bdf8' }} /> Candidate Profile Dossier
            </div>
          }
          open={candidateModalOpen}
          onCancel={() => setCandidateModalOpen(false)}
          footer={null}
          width={720}
          styles={{
            content: { background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '20px' },
            header: { background: '#1e293b' },
          }}
        >
          {selectedCandidate && (
            <div style={{ color: '#e2e8f0', marginTop: '16px' }}>
              <div 
                style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ margin: 0, color: '#ffffff', fontSize: '20px' }}>{selectedCandidate.name}</h3>
                  <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '14px' }}>{selectedCandidate.email}</p>
                </div>
                {getStatusTag(selectedCandidate.status)}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', marginBottom: '16px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>Current Designation</span>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedCandidate.candidateProfile?.designation || 'N/A'}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>Total Experience</span>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedCandidate.candidateProfile?.experience ? `${selectedCandidate.candidateProfile.experience} Years` : 'N/A'}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>City / Location</span>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedCandidate.candidateProfile?.city || 'N/A'}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>Notice Period</span>
                  <div style={{ fontWeight: 600, color: '#fff' }}>{selectedCandidate.candidateProfile?.noticePeriod || 'N/A'}</div>
                </div>
              </div>

              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button 
                  onClick={() => setCandidateModalOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    borderRadius: '8px'
                  }}
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

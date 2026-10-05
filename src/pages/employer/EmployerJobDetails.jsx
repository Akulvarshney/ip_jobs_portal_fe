import CitySelect from '../../components/CitySelect';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchJobById } from '../../store/jobsSlice';
import { updateApplicationStatus, inviteCandidate, updateJob } from '../../store/employerSlice';
import { 
  ArrowLeftOutlined, 
  UserOutlined, 
  FileTextOutlined, 
  SendOutlined, 
  CheckCircleOutlined, 
  EyeOutlined, 
  BankOutlined, 
  EnvironmentOutlined, 
  SolutionOutlined, 
  PauseCircleOutlined, 
  PlayCircleOutlined, 
  MailOutlined, 
  PhoneOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Table, Button, Tag, Modal, Select, Input, message, Space, Tooltip } from 'antd';
import { motion, useReducedMotion } from 'framer-motion';
import { getJobTypeLabel, getSalaryRangeLabel, getExperienceLevelLabel } from '../../utils/jobType';

const { Option } = Select;

const EmployerJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const reduceMotion = useReducedMotion();

  const [editingLocation, setEditingLocation] = useState(false);
  const [jobLocations, setJobLocations] = useState([]);
  const [savingLocations, setSavingLocations] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [cvModalOpen, setCvModalOpen] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [applicantFilter, setApplicantFilter] = useState('ALL');
  const [applicantSearch, setApplicantSearch] = useState('');

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const res = await dispatch(fetchJobById(id)).unwrap();
      setJob(res);
    } catch (error) {
      console.error('Error fetching job details:', error);
      message.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, dispatch]);

  const saveLocations = async () => {
    if (!jobLocations || jobLocations.length === 0) return message.warning('Select at least one city for this job.');
    setSavingLocations(true);
    try {
      const updated = await dispatch(updateJob({ id, jobData: { locations: jobLocations } })).unwrap();
      setJob(current => ({ ...current, ...updated, applications: current.applications }));
      setEditingLocation(false);
      message.success('Job locations updated.');
    } catch (error) { message.error(typeof error === 'string' ? error : 'Could not update job locations.'); }
    finally { setSavingLocations(false); }
  };

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
    setStatusSaving(true);
    try {
      const updated = await dispatch(updateJob({ id: job.id, jobData: { status: newStatus } })).unwrap();
      setJob(current => ({ ...current, ...updated, applications: current.applications }));
      message.success(newStatus === 'PAUSED' ? 'Job paused.' : 'Job is active again.');
    } catch (error) {
      console.error('Error updating job status:', error);
      message.error(typeof error === 'string' ? error : 'Failed to update job status');
    } finally { setStatusSaving(false); }
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
            >CV</Button>
          </Tooltip>

          <Tooltip title="Candidate Profile">
            <Button 
              size="small"
              icon={<EyeOutlined />}
              onClick={() => openCandidateDossier(record)}
              className="portal-btn-neutral"
            >Profile</Button>
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
        <p className="portal-loading-text">Loading job details & candidates...</p>
      </div>
    );
  }

  const applicationsList = job?.applications || [];
  const shortlistedCount = applicationsList.filter(a => a.status === 'SHORTLISTED').length;
  const interviewCount = applicationsList.filter(a => a.status === 'INTERVIEW').length;
  const selectedCount = applicationsList.filter(a => a.status === 'SELECTED').length;

  const filteredApplications = applicationsList.filter(application => {
    const matchesStatus = applicantFilter === 'ALL' || application.status === applicantFilter;
    const query = applicantSearch.trim().toLowerCase();
    const candidate = application.candidate;
    return matchesStatus && (!query || [candidate?.name, candidate?.email, candidate?.candidateProfile?.designation].some(value => value?.toLowerCase().includes(query)));
  });
  const locationLabel = job?.locations?.length ? job.locations.join(', ') : job?.employer?.location || 'Location not specified';
  const entrance = delay => reduceMotion ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.42, delay } };

  if (!job) return <div className="employer-job-empty portal-glass-card"><h2>Job not found</h2><p>The job may have been removed or is unavailable.</p><Button onClick={() => navigate('/employer/jobs')}>Back to jobs</Button></div>;

  return (
    <div className="portal-w-full employer-job-page">
      <div className="employer-job-breadcrumb">
        <button type="button" onClick={() => navigate('/employer/jobs')}><ArrowLeftOutlined /> All jobs</button>
        <span aria-hidden="true">/</span>
        <span>Job overview</span>
      </div>

      <motion.section className="employer-job-hero" {...entrance(0)}>
        <div className="employer-job-hero-top">
          <div className="employer-job-eyebrow">JOB <span>/</span> {job.id.slice(0, 8).toUpperCase()}</div>
          <span className={`employer-job-status employer-job-status-${(job.status || 'active').toLowerCase()}`}><span className="employer-job-status-dot" /> {job.status === 'ACTIVE' ? 'Live' : job.status === 'PAUSED' ? 'Paused' : job.status}</span>
        </div>
        <div className="employer-job-hero-main">
          <div>
            <h1>{job.title}</h1>
            <p className="employer-job-company"><BankOutlined /> {job.employer?.name || 'Organisation'}</p>
          </div>
          <div className="employer-job-actions">
            <Button onClick={() => { setJobLocations(job.locations?.length ? job.locations : (job.employer?.location ? [job.employer.location] : [])); setEditingLocation(true); }} icon={<EnvironmentOutlined />}>Edit location</Button>
            {job.status === 'ACTIVE' ? <Button onClick={() => handleToggleJobStatus('PAUSED')} icon={<PauseCircleOutlined />} loading={statusSaving}>Pause job</Button> : <Button type="primary" onClick={() => handleToggleJobStatus('ACTIVE')} icon={<PlayCircleOutlined />} loading={statusSaving}>Activate job</Button>}
          </div>
        </div>
        <div className="employer-job-facts">
          <div><small>LOCATION</small><strong>{locationLabel}</strong></div>
          <div><small>JOB TYPE</small><strong>{getJobTypeLabel(job.jobType)}</strong></div>
          <div><small>EXPERIENCE</small><strong>{getExperienceLevelLabel(job.experienceLevel)}</strong></div>
          <div><small>SALARY RANGE</small><strong>{getSalaryRangeLabel(job.salaryRange)}</strong></div>
          <div><small>POSTED</small><strong>{new Date(job.createdAt).toLocaleDateString()}</strong></div>
        </div>
      </motion.section>

      <Modal title="Job locations" open={editingLocation} onCancel={() => setEditingLocation(false)} onOk={saveLocations} confirmLoading={savingLocations} okButtonProps={{ disabled: jobLocations.length === 0 }} okText="Save locations">
        <p>Select the cities where this job is based.</p>
        <CitySelect aria-label="Job locations" value={jobLocations} onChange={setJobLocations} mode="multiple" />
      </Modal>

      <motion.section className="employer-job-metrics" aria-label="Applicant pipeline" {...entrance(0.08)}>
        {[
          { key: 'ALL', label: 'Total applicants', count: applicationsList.length, hint: 'All submissions' },
          { key: 'SHORTLISTED', label: 'Shortlisted', count: shortlistedCount, hint: 'Ready for review' },
          { key: 'INTERVIEW', label: 'Interviewing', count: interviewCount, hint: 'In conversation' },
          { key: 'SELECTED', label: 'Selected', count: selectedCount, hint: 'Offers or hires' },
        ].map(item => <button type="button" key={item.key} className={`employer-job-metric ${applicantFilter === item.key ? 'is-active' : ''}`} onClick={() => setApplicantFilter(item.key)} aria-pressed={applicantFilter === item.key}>
          <span className="employer-job-metric-label">{item.label}</span>
          <span className="employer-job-metric-count">{item.count}</span>
          <span className="employer-job-metric-hint">{item.hint}</span>
        </button>)}
      </motion.section>

      <motion.section className="employer-job-brief" {...entrance(0.15)}>
        <div className="employer-job-section-head">
          <div><span className="employer-job-kicker">THE POSITION</span><h2>About this role</h2></div>
          <Link to={`/jobs/${job.id}`} className="employer-job-public-link" target="_blank" rel="noopener noreferrer">View public listing <EyeOutlined /></Link>
        </div>
        <div className="employer-job-brief-grid">
          <div className="employer-job-copy"><h3>Description</h3><p>{job.description || 'No description has been added yet.'}</p></div>
          <div className="employer-job-copy"><h3>Requirements</h3><p>{job.requirements || 'No requirements have been added yet.'}</p></div>
        </div>
        {job.skills?.length > 0 && <div className="employer-job-skills"><h3>Specialisations</h3><div>{job.skills.map(item => <span className="employer-job-skill" key={item.skill.id}>{item.skill.name}</span>)}</div></div>}
      </motion.section>

      <motion.section className="employer-job-applicants" {...entrance(0.22)}>
        <div className="employer-job-applicants-head">
          <div><span className="employer-job-kicker">HIRING PIPELINE</span><h2>Applicants <span>{applicationsList.length}</span></h2><p>Review profiles, open CVs, and update each candidate’s stage.</p></div>
          <div className="employer-job-applicant-tools">
            <Input prefix={<SearchOutlined />} value={applicantSearch} onChange={event => setApplicantSearch(event.target.value)} placeholder="Search candidates" aria-label="Search candidates" allowClear />
            <Select value={applicantFilter} onChange={setApplicantFilter} aria-label="Filter candidate status" options={[{ value: 'ALL', label: 'All stages' }, { value: 'APPLIED', label: 'Applied' }, { value: 'SHORTLISTED', label: 'Shortlisted' }, { value: 'INTERVIEW', label: 'Interviewing' }, { value: 'SELECTED', label: 'Selected' }, { value: 'REJECTED', label: 'Rejected' }]} />
          </div>
        </div>
        <div className="employer-job-table"><Table columns={applicantColumns} dataSource={filteredApplications} rowKey="id" pagination={{ pageSize: 8, hideOnSinglePage: true }} scroll={{ x: 900 }} className="portal-table" locale={{ emptyText: <div className="portal-empty-table-text">{applicationsList.length ? 'No candidates match these filters.' : 'No candidates have applied yet.'}</div> }} /></div>
        <div className="employer-job-mobile-list">
          {filteredApplications.length ? filteredApplications.map(application => {
            const candidate = application.candidate;
            const profile = candidate?.candidateProfile;
            return <article className="employer-job-candidate-card" key={application.id}>
              <div className="employer-job-candidate-top"><div className="portal-avatar-init">{candidate?.name?.charAt(0) || 'C'}</div><div><strong>{candidate?.name || 'Candidate'}</strong><small>{profile?.designation || 'Professional'}{profile?.experience ? ` · ${profile.experience} years` : ''}{profile?.city ? ` · ${profile.city}` : ''}</small></div></div>
              <div className="employer-job-candidate-stage">{getStatusTag(application.status)} <span>Applied {new Date(application.createdAt).toLocaleDateString()}</span></div>
              <div className="employer-job-candidate-actions"><Button size="small" onClick={() => openCVModal(application)} icon={<FileTextOutlined />}>CV</Button><Button size="small" onClick={() => openCandidateDossier(application)} icon={<EyeOutlined />}>Profile</Button><Select size="small" value={application.status} onChange={value => handleUpdateAppStatus(application.id, value)} loading={actionLoadingId === application.id} options={[{ value: 'APPLIED', label: 'Applied' }, { value: 'SHORTLISTED', label: 'Shortlisted' }, { value: 'INTERVIEW', label: 'Interview' }, { value: 'SELECTED', label: 'Selected' }, { value: 'REJECTED', label: 'Rejected' }]} /></div>
            </article>;
          }) : <div className="portal-empty-table-text">{applicationsList.length ? 'No candidates match these filters.' : 'No candidates have applied yet.'}</div>}
        </div>
      </motion.section>

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

import React, { useState, useEffect, useRef } from 'react';
import {
  Tabs,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  message,
  Card,
  Modal,
  DatePicker,
  Checkbox,
  Tag,
  Popconfirm,
  Divider,
  Row,
  Col,
  Avatar,
  Upload,
  Progress
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  BookOutlined,
  BankOutlined,
  ToolOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UploadOutlined,
  EyeOutlined,
  DownloadOutlined,
  CloudUploadOutlined,
  SyncOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCandidateProfile,
  updateCandidateProfile,
  deleteEducation,
  deleteExperience,
  removeSkill,
  deleteCertification,
  updateResume,
  deleteResume
} from '../../store/candidateSlice';
import api from '../../api';
import { getFileUrl } from '../../utils/fileUrl';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const professionalCategories = [
  'Insolvency Professional',
  'Chartered Accountant',
  'Company Secretary',
  'Cost & Management Accountant',
  'Lawyer / Advocate',
  'Banking professional',
  'Finance professional',
  'Restructuring professional',
  'Legal associate',
  'Insolvency analyst',
  'Resolution Plan Specialist',
  'Valuation Specialist',
  'Forensic Auditor',
  'Other'
];

const defaultPredefinedSkills = [
  'Insolvency',
  'CIRP',
  'Liquidation',
  'NCLT',
  'NCLAT',
  'Restructuring',
  'Financial Analysis',
  'Due Diligence',
  'Legal Research',
  'Claims Management',
  'Resolution Planning',
  'Section 29A Eligibility',
  'IBC 2016 Advisory',
  'Distressed M&A',
  'Information Memorandum',
  'Committee of Creditors (CoC)'
];

const CandidateProfile = () => {
  const dispatch = useDispatch();
  const { profile: rawProfile, loading } = useSelector((state) => state.candidate);
  const profile = rawProfile?.data || rawProfile;

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const [form] = Form.useForm();

  // Modals state
  const [eduModalVisible, setEduModalVisible] = useState(false);
  const [editingEdu, setEditingEdu] = useState(null);
  const [eduForm] = Form.useForm();

  const [expModalVisible, setExpModalVisible] = useState(false);
  const [editingExp, setEditingExp] = useState(null);
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expForm] = Form.useForm();

  const [certModalVisible, setCertModalVisible] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [certForm] = Form.useForm();

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCertDoc, setUploadingCertDoc] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [savingResume, setSavingResume] = useState(false);
  const [resumeInputUrl, setResumeInputUrl] = useState('');
  const [resumePreviewVisible, setResumePreviewVisible] = useState(false);
  const [photoPreviewVisible, setPhotoPreviewVisible] = useState(false);
  const [showCompletenessDetails, setShowCompletenessDetails] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const tabsContainerRef = useRef(null);

  const resumeUrl = profile?.resumeUrl || null;
  const watchedPhoto = Form.useWatch('profilePhoto', form);
  const currentPhoto = watchedPhoto !== undefined ? watchedPhoto : (profile?.profilePhoto || form.getFieldValue('profilePhoto'));

  const scrollTabs = (direction) => {
    if (tabsContainerRef.current) {
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -240 : 240,
        behavior: 'smooth'
      });
    }
  };

  const fetchProfile = () => {
    dispatch(fetchCandidateProfile());
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      if (tabParam === 'certifications') {
        setActiveTab('education');
      } else {
        setActiveTab(tabParam);
      }
    }
  }, [location.search]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      message.error('Photo size exceeds the 3MB limit. Please upload an image under 3MB.');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingPhoto(true);
      const res = await api.post('/api/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const photoUrl = res.data?.data?.profilePhoto;
      form.setFieldsValue({ profilePhoto: photoUrl });
      message.success('Profile photo uploaded successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Photo upload failed:', error);
      message.error(error?.response?.data?.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleCertDocUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      message.error('Document size exceeds the 3MB limit. Please upload a file under 3MB.');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingCertDoc(true);
      const res = await api.post('/api/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const docUrl = res.data?.data?.documentUrl;
      certForm.setFieldsValue({ documentUrl: docUrl });
      message.success('Certificate document uploaded successfully!');
    } catch (error) {
      console.error('Document upload failed:', error);
      message.error(error?.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingCertDoc(false);
      e.target.value = '';
    }
  };

  const handleSaveResumeUrl = async () => {
    if (!resumeInputUrl.trim()) {
      message.warning('Please enter a valid document link or file URL');
      return;
    }
    try {
      setSavingResume(true);
      await dispatch(updateResume({ resumeUrl: resumeInputUrl.trim() })).unwrap();
      setResumeInputUrl('');
      message.success('Resume link saved successfully!');
      fetchProfile();
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to save resume');
    } finally {
      setSavingResume(false);
    }
  };

  const handleDeleteResume = async () => {
    try {
      setSavingResume(true);
      await dispatch(deleteResume()).unwrap();
      message.success('Resume removed successfully');
      fetchProfile();
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to delete resume');
    } finally {
      setSavingResume(false);
    }
  };

  const handleResumeFileUpload = async (e) => {
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
      setUploadingResume(true);
      await api.post('/api/upload/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      message.success(`Resume "${file.name}" uploaded successfully!`);
      fetchProfile();
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to upload resume';
      message.error(errorMsg);
    } finally {
      setUploadingResume(false);
      e.target.value = '';
    }
  };

  useEffect(() => {
    dispatch(fetchCandidateProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        name: profile.user?.name,
        email: profile.user?.email,
        phone: profile.phone,
        city: profile.city,
        designation: profile.designation,
        professionalCategory: profile.professionalCategory,
        experience: profile.experience,
        currentSalary: profile.currentSalary,
        expectedSalary: profile.expectedSalary,
        noticePeriod: profile.noticePeriod,
        profilePhoto: profile.profilePhoto,
        bio: profile.bio,
        visibility: profile.visibility || 'PUBLIC'
      });

      const skillsList = profile.skills?.map(s => s.skill?.name) || [];
      setSelectedSkills(skillsList);
    }
  }, [profile, form]);

  // Save Basic & Professional Details
  const handleSaveBasic = async (values) => {
    try {
      setSaving(true);
      const photoVal = form.getFieldValue('profilePhoto');
      const payload = {
        ...values,
        profilePhoto: values.profilePhoto !== undefined ? values.profilePhoto : (photoVal !== undefined ? photoVal : profile?.profilePhoto)
      };
      await dispatch(updateCandidateProfile(payload)).unwrap();
      message.success('Profile details saved successfully!');
      dispatch(fetchCandidateProfile());
    } catch (error) {
      message.error(error || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Education CRUD Handlers
  const handleOpenEduModal = (edu = null) => {
    setEditingEdu(edu);
    if (edu) {
      eduForm.setFieldsValue({
        qualification: edu.qualification,
        degree: edu.degree,
        specialisation: edu.specialisation,
        institution: edu.institution,
        startYear: edu.startYear,
        completionYear: edu.completionYear,
      });
    } else {
      eduForm.resetFields();
    }
    setEduModalVisible(true);
  };

  const handleSaveEducation = async () => {
    try {
      const values = await eduForm.validateFields();
      if (editingEdu) {
        await api.put(`/api/candidate/education/${editingEdu.id}`, values);
        message.success('Education record updated');
      } else {
        await api.post('/api/candidate/education', values);
        message.success('Education record added');
      }
      setEduModalVisible(false);
      fetchProfile();
    } catch (error) {
      if (error?.errorFields) return;
      message.error('Failed to save education record');
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await api.delete(`/api/candidate/education/${id}`);
      message.success('Education deleted');
      fetchProfile();
    } catch (error) {
      message.error('Failed to delete education');
    }
  };

  // Experience CRUD Handlers
  const handleOpenExpModal = (exp = null) => {
    setEditingExp(exp);
    if (exp) {
      setExpIsCurrent(exp.isCurrent);
      expForm.setFieldsValue({
        organisation: exp.organisation,
        designation: exp.designation,
        startDate: exp.startDate ? dayjs(exp.startDate) : null,
        endDate: exp.endDate ? dayjs(exp.endDate) : null,
        isCurrent: exp.isCurrent,
        description: exp.description,
      });
    } else {
      setExpIsCurrent(false);
      expForm.resetFields();
    }
    setExpModalVisible(true);
  };

  const handleSaveExperience = async () => {
    try {
      const values = await expForm.validateFields();
      const payload = {
        ...values,
        startDate: values.startDate ? values.startDate.toISOString() : null,
        endDate: values.isCurrent ? null : (values.endDate ? values.endDate.toISOString() : null),
        isCurrent: Boolean(values.isCurrent)
      };

      if (editingExp) {
        await api.put(`/api/candidate/experience/${editingExp.id}`, payload);
        message.success('Experience record updated');
      } else {
        await api.post('/api/candidate/experience', payload);
        message.success('Experience record added');
      }
      setExpModalVisible(false);
      fetchProfile();
    } catch (error) {
      if (error?.errorFields) return;
      message.error('Failed to save experience');
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await api.delete(`/api/candidate/experience/${id}`);
      message.success('Experience deleted');
      fetchProfile();
    } catch (error) {
      message.error('Failed to delete experience');
    }
  };

  // Skills Handlers
  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    if (!customSkillInput.trim()) return;
    const trimmed = customSkillInput.trim();
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
    }
    setCustomSkillInput('');
  };

  const handleSaveSkills = async () => {
    try {
      setSaving(true);
      await api.post('/api/candidate/skills', { skills: selectedSkills });
      message.success('Skills updated successfully');
      fetchProfile();
    } catch (error) {
      message.error('Failed to update skills');
    } finally {
      setSaving(false);
    }
  };

  // Certifications CRUD Handlers
  const handleOpenCertModal = (cert = null) => {
    setEditingCert(cert);
    if (cert) {
      certForm.setFieldsValue({
        name: cert.name,
        issuingOrg: cert.issuingOrg,
        regNumber: cert.regNumber,
        issueDate: cert.issueDate ? dayjs(cert.issueDate) : null,
        expiryDate: cert.expiryDate ? dayjs(cert.expiryDate) : null,
        documentUrl: cert.documentUrl,
      });
    } else {
      certForm.resetFields();
    }
    setCertModalVisible(true);
  };

  const handleSaveCertification = async () => {
    try {
      const values = await certForm.validateFields();
      const payload = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.toISOString() : null,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
      };

      if (editingCert) {
        await api.put(`/api/candidate/certifications/${editingCert.id}`, payload);
        message.success('Certification record updated');
      } else {
        await api.post('/api/candidate/certifications', payload);
        message.success('Certification record added');
      }
      setCertModalVisible(false);
      fetchProfile();
    } catch (error) {
      if (error?.errorFields) return;
      message.error('Failed to save certification');
    }
  };

  const handleDeleteCertification = async (id) => {
    try {
      await api.delete(`/api/candidate/certifications/${id}`);
      message.success('Certification deleted');
      fetchProfile();
    } catch (error) {
      message.error('Failed to delete certification');
    }
  };

  const tabItems = [
    {
      key: 'basic',
      title: 'Basic Info',
      icon: <UserOutlined />,
      label: (
        <span>
          <UserOutlined /> Basic Info
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveBasic}
          className="portal-profile-form-wrap"
        >
          <Form.Item name="profilePhoto" hidden>
            <Input />
          </Form.Item>

          <div className="portal-profile-avatar-row">
            <div
              className={`portal-profile-avatar-wrap ${currentPhoto ? 'clickable' : ''}`}
              onClick={() => {
                if (currentPhoto) setPhotoPreviewVisible(true);
              }}
              title={currentPhoto ? 'Click photo to enlarge' : ''}
            >
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={getFileUrl(currentPhoto)}
                className="portal-profile-avatar"
              />
              <label
                className={`portal-profile-avatar-edit-label ${uploadingPhoto ? 'disabled' : ''}`}
                onClick={(e) => e.stopPropagation()}
                title="Edit / Change Photo"
              >
                {uploadingPhoto ? <SyncOutlined spin className="portal-icon-12" /> : <EditOutlined />}
                <input
                  type="file"
                  accept="image/*"
                  className="portal-hidden-file-input"
                  disabled={uploadingPhoto}
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div>
              <div className="portal-profile-avatar-title">
                {profile?.user?.name || 'Profile Picture'}
              </div>
              <div className="portal-profile-avatar-subtitle">
                {profile?.professionalCategory || profile?.designation || 'Candidate'}
              </div>
            </div>
          </div>

          <Divider className="portal-profile-divider" orientation="left">
            <span className="portal-profile-divider-text">
              Basic Contact Details
            </span>
          </Divider>

          <Row gutter={20}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">Full Name</span>}
                name="name"
                rules={[{ required: true, message: 'Full name is required' }]}
              >
                <Input placeholder="e.g. Rahul Sharma" className="portal-form-input" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">Email Address</span>}
                name="email"
              >
                <Input disabled className="portal-form-input-disabled" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">Phone Number</span>}
                name="phone"
              >
                <Input placeholder="+91 98765 43210" className="portal-form-input" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">City / Location</span>}
                name="city"
              >
                <Input placeholder="e.g. New Delhi, Mumbai, Bengaluru" className="portal-form-input" />
              </Form.Item>
            </Col>
          </Row>

          <Divider className="portal-profile-divider portal-mt-24" orientation="left">
            <span className="portal-profile-divider-text">
              Professional Information
            </span>
          </Divider>

          <Row gutter={20}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">Professional Category</span>}
                name="professionalCategory"
                rules={[{ required: true, message: 'Please select professional category' }]}
              >
                <Select placeholder="Select role category">
                  {professionalCategories.map(cat => (
                    <Option key={cat} value={cat}>{cat}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">Current Designation</span>}
                name="designation"
              >
                <Input placeholder="e.g. Senior Insolvency Associate / Partner" className="portal-form-input" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span className="portal-form-label">Total Experience (Years)</span>}
                name="experience"
              >
                <InputNumber min={0} max={50} controls={false} className="portal-form-input portal-w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span className="portal-form-label">Current CTC (₹ LPA)</span>}
                name="currentSalary"
              >
                <InputNumber min={0} controls={false} placeholder="e.g. 15.0" className="portal-form-input portal-w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span className="portal-form-label">Expected CTC (₹ LPA)</span>}
                name="expectedSalary"
              >
                <InputNumber min={0} controls={false} placeholder="e.g. 22.0" className="portal-form-input portal-w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">Notice Period</span>}
                name="noticePeriod"
              >
                <Select placeholder="Select notice period">
                  <Option value="Immediate">Immediate</Option>
                  <Option value="15 Days">15 Days</Option>
                  <Option value="30 Days">30 Days</Option>
                  <Option value="60 Days">60 Days</Option>
                  <Option value="90 Days">90 Days</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span className="portal-form-label">Profile Visibility</span>}
                name="visibility"
              >
                <Select>
                  <Option value="PUBLIC">Public — Visible to all verified recruiters</Option>
                  <Option value="CONFIDENTIAL">Confidential — Hide name/current employer</Option>
                  <Option value="PRIVATE">Private — Only apply to direct jobs</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label={<span className="portal-form-label">Professional Bio / Executive Summary</span>}
                name="bio"
              >
                <TextArea
                  rows={4}
                  placeholder="Summary of your insolvency, restructuring, resolution planning, and legal proceedings background..."
                  className="portal-form-input"
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            className="portal-btn-theme-primary portal-btn-save-profile"
          >
            Save Profile Details
          </Button>
        </Form>
      )
    },
    {
      key: 'education',
      title: 'Education & Certifications',
      icon: <BookOutlined />,
      count: (profile?.educations?.length || 0) + (profile?.certifications?.length || 0),
      label: (
        <span>
          <BookOutlined /> Education & Certifications ({(profile?.educations?.length || 0) + (profile?.certifications?.length || 0)})
        </span>
      ),
      children: (
        <div>
          {/* Education & Qualifications Section */}
          <div className="portal-section-header">
            <div>
              <h3 className="portal-section-title">Education & Qualifications</h3>
              <p className="portal-section-desc">Add your degrees, CA/CS qualifications, and academic institutions.</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenEduModal()}
              className="portal-btn-cyan"
            >
              Add Education
            </Button>
          </div>

          <div className="portal-profile-items-list">
            {profile?.educations?.map((edu) => (
              <div key={edu.id} className="portal-profile-item-card">
                <div>
                  <div className="portal-flex-center-gap-10">
                    <Tag color="blue" className="portal-tag-badge">{edu.qualification}</Tag>
                    <span className="portal-edu-title">{edu.degree}</span>
                    {edu.specialisation && <span className="portal-edu-specialisation">in {edu.specialisation}</span>}
                  </div>
                  <div className="portal-edu-institution">
                    {edu.institution} • {edu.startYear ? `${edu.startYear} - ` : ''}{edu.completionYear || 'Present'}
                  </div>
                </div>

                <div className="portal-actions-group">
                  <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEduModal(edu)} />
                  <Popconfirm
                    title="Delete education record?"
                    onConfirm={() => handleDeleteEducation(edu.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </div>
            ))}

            {(!profile?.educations || profile.educations.length === 0) && (
              <div className="portal-profile-empty-item">
                <BookOutlined className="portal-profile-empty-item-icon" />
                <p className="portal-m-0">No education details added yet. Click "Add Education" above.</p>
              </div>
            )}
          </div>

          <Divider className="portal-divider-subtle" />

          {/* Certifications & Statutory Registrations Section */}
          <div className="portal-section-header">
            <div>
              <h3 className="portal-section-title">Certifications & Statutory Registrations</h3>
              <p className="portal-section-desc">IBBI Registration number, ICAI/ICSI membership, and legal certifications.</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCertModal()}
              className="portal-btn-cyan"
            >
              Add Certification
            </Button>
          </div>

          <div className="portal-drawer-info-grid">
            {profile?.certifications?.map((cert) => (
              <div key={cert.id} className="portal-profile-item-card">
                <div>
                  <div className="portal-flex-center-gap-10">
                    <span className="portal-cert-name">{cert.name}</span>
                    <Tag color="purple" className="portal-tag-badge">{cert.issuingOrg}</Tag>
                  </div>
                  <div className="portal-cert-meta">
                    {cert.regNumber && <span>Reg No: <strong>{cert.regNumber}</strong> • </span>}
                    {cert.issueDate && <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>}
                    {cert.documentUrl && (
                      <span className="portal-ml-10">
                        <a href={getFileUrl(cert.documentUrl)} target="_blank" rel="noopener noreferrer" className="portal-tag-link">
                          View Document ↗
                        </a>
                      </span>
                    )}
                  </div>
                </div>

                <div className="portal-actions-group">
                  <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenCertModal(cert)} />
                  <Popconfirm
                    title="Delete certification?"
                    onConfirm={() => handleDeleteCertification(cert.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </div>
            ))}

            {(!profile?.certifications || profile.certifications.length === 0) && (
              <div className="portal-profile-empty-item">
                <SafetyCertificateOutlined className="portal-profile-empty-item-icon" />
                <p className="portal-m-0">No statutory registrations or certificates added yet. Click "Add Certification" above.</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'experience',
      title: 'Experience',
      icon: <BankOutlined />,
      count: profile?.experiences?.length || 0,
      label: (
        <span>
          <BankOutlined /> Experience ({profile?.experiences?.length || 0})
        </span>
      ),
      children: (
        <div>
          <div className="portal-section-header">
            <div>
              <h3 className="portal-section-title">Work Experience & IBC Matters</h3>
              <p className="portal-section-desc">Highlight organisations, designations, and restructuring assignments.</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenExpModal()}
              className="portal-btn-cyan"
            >
              Add Experience
            </Button>
          </div>

          <div className="portal-profile-items-list">
            {profile?.experiences?.map((exp) => (
              <div key={exp.id} className="portal-exp-card">
                <div className="portal-exp-body">
                  <div className="portal-exp-heading">
                    <span className="portal-exp-role">{exp.designation}</span>
                    <span className="portal-exp-org">@ {exp.organisation}</span>
                    {exp.isCurrent && <Tag color="green">Current Role</Tag>}
                  </div>
                  <div className="portal-exp-period">
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A')}
                  </div>
                  {exp.description && (
                    <div className="portal-exp-desc">
                      {exp.description}
                    </div>
                  )}
                </div>

                <div className="portal-actions-group">
                  <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenExpModal(exp)} />
                  <Popconfirm
                    title="Delete experience entry?"
                    onConfirm={() => handleDeleteExperience(exp.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>
                </div>
              </div>
            ))}

            {(!profile?.experiences || profile.experiences.length === 0) && (
              <div className="portal-profile-empty-item">
                <BankOutlined className="portal-profile-empty-item-icon" />
                <p>No work experience added yet. Click "Add Experience" to add roles and mandates.</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'skills',
      title: 'Skills',
      icon: <ToolOutlined />,
      count: selectedSkills.length,
      label: (
        <span>
          <ToolOutlined /> Skills ({selectedSkills.length})
        </span>
      ),
      children: (
        <div>
          <div className="portal-mb-24">
            <h3 className="portal-section-title">Insolvency & Professional Skills</h3>
            <p className="portal-section-desc">Select IBC domain competencies or add custom tags.</p>
          </div>

          <div className="portal-skills-box">
            <div className="portal-skills-box-title">
              Suggested IBC & Restructuring Skills (Click to toggle)
            </div>
            <div className="portal-skills-tags-wrap">
              {defaultPredefinedSkills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <Tag.CheckableTag
                    key={skill}
                    checked={isSelected}
                    onChange={() => handleToggleSkill(skill)}
                    className={`portal-skill-checkable-tag ${isSelected ? 'selected' : ''}`}
                  >
                    {isSelected && <CheckCircleOutlined className="portal-mr-6 portal-tag-link" />}
                    {skill}
                  </Tag.CheckableTag>
                );
              })}
            </div>

            <Divider className="portal-divider-subtle" />

            <div className="portal-custom-skill-heading">
              Add Custom Skill / Specialization
            </div>
            <div className="portal-custom-skill-row">
              <Input
                placeholder="e.g. Cross-Border Insolvency, Forensic Accounting..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onPressEnter={handleAddCustomSkill}
                className="portal-form-input"
              />
              <Button type="primary" onClick={handleAddCustomSkill} className="portal-btn-cyan">
                Add
              </Button>
            </div>
          </div>

          <div className="portal-skills-footer">
            <div className="portal-skills-count">
              {selectedSkills.length} skills selected
            </div>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSaveSkills}
              className="portal-btn-cyan portal-btn-save-profile"
            >
              Save Skills
            </Button>
          </div>
        </div>
      )
    },
    {
      key: 'resume',
      title: 'Resume & CV',
      icon: <FileTextOutlined />,
      count: profile?.resumeUrl ? 1 : 0,
      label: (
        <span>
          <FileTextOutlined /> Resume & CV {profile?.resumeUrl ? '(1)' : '(0)'}
        </span>
      ),
      children: (
        <div>
          <div className="portal-section-header">
            <div>
              <h3 className="portal-section-title">Candidate Resume & Credentials</h3>
              <p className="portal-section-desc">Manage your primary CV document used when applying for mandates.</p>
            </div>
          </div>

          <div>
            <div>
              {resumeUrl ? (
                <div className="portal-resume-active-card">
                  <div className="portal-resume-header-row">
                    <div className="portal-flex-center-gap-16">
                      <div className="portal-resume-icon-badge">
                        <FileTextOutlined />
                      </div>
                      <div>
                        <div className="portal-flex-center-gap-10">
                          <span className="portal-card-heading">Active Resume Document</span>
                          <Tag color="cyan" icon={<CheckCircleOutlined />}>Current</Tag>
                        </div>
                        <div className="portal-text-subtle-13 portal-mt-4">
                          Shared automatically with employers when applying
                        </div>
                      </div>
                    </div>

                    <div className="portal-actions-group">
                      <Button
                        type="primary"
                        icon={<EyeOutlined />}
                        onClick={() => setResumePreviewVisible(true)}
                        className="portal-btn-cyan"
                      >
                        View
                      </Button>
                      <a href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer" download="Resume.pdf">
                        <Button icon={<DownloadOutlined />} className="portal-btn-neutral">
                          Download
                        </Button>
                      </a>
                      <Popconfirm
                        title="Remove resume from profile?"
                        onConfirm={handleDeleteResume}
                        okText="Remove"
                        cancelText="Cancel"
                      >
                        <Button danger icon={<DeleteOutlined />} className="portal-btn-rounded-8" />
                      </Popconfirm>
                    </div>
                  </div>

                  <div className="portal-resume-replace-box">
                    <div className="portal-resume-replace-label">
                      Replace Existing Resume:
                    </div>
                    <label className={`portal-resume-replace-btn-label ${uploadingResume ? 'disabled' : ''}`}>
                      <SyncOutlined spin={uploadingResume} /> {uploadingResume ? 'Uploading...' : 'Replace File (PDF, DOCX)'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="portal-display-none"
                        disabled={uploadingResume}
                        onChange={handleResumeFileUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="portal-resume-upload-dropzone">
                  <CloudUploadOutlined className="portal-resume-upload-icon" />
                  <h3 className="portal-resume-upload-title">
                    Upload Your Latest Resume
                  </h3>
                  <p className="portal-resume-upload-desc">
                    Supports PDF, DOC, DOCX up to 3MB.
                  </p>

                  <label className={`portal-resume-upload-btn-label ${uploadingResume ? 'disabled' : ''}`}>
                    <UploadOutlined spin={uploadingResume} /> {uploadingResume ? 'Uploading...' : 'Select File to Upload'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="portal-display-none"
                      disabled={uploadingResume}
                      onChange={handleResumeFileUpload}
                    />
                  </label>

                  <div className="portal-resume-or-divider">
                    — OR provide a document link below —
                  </div>

                  <div className="portal-resume-url-row">
                    <Input
                      placeholder="https://drive.google.com/... or cloud document link"
                      value={resumeInputUrl}
                      onChange={(e) => setResumeInputUrl(e.target.value)}
                      className="portal-form-input"
                    />
                    <Button
                      type="primary"
                      loading={savingResume}
                      onClick={handleSaveResumeUrl}
                      className="portal-btn-cyan"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="portal-glass-card portal-p-32"
      >
        <div className="portal-mb-24">
          <h1 className="portal-page-title">Candidate Profile</h1>
          <p className="portal-page-subtitle">
            Manage your personal background, professional categories, education, experience, IBC competencies, certifications, and CV.
          </p>
        </div>

        {/* Profile Completeness Interactive Banner */}
        {profile?.completeness && (
          <div className="portal-completeness-banner">
            <div className="portal-completeness-header">
              <div>
                <div className="portal-completeness-title-row">
                  <span className="portal-completeness-title">Profile Completeness</span>
                  <Tag color={profile.completeness.score === 100 ? 'success' : 'processing'} className="portal-completeness-tag">
                    {profile.completeness.score}% Completed
                  </Tag>
                  <span className="portal-completeness-count">
                    ({profile.completeness.completedCount}/{profile.completeness.totalItemsCount} criteria fulfilled)
                  </span>
                </div>
                <p className="portal-completeness-desc">
                  {profile.completeness.score === 100
                    ? '🎉 Your profile is 100% complete and verified for top priority employer searches.'
                    : 'Complete pending sections to boost your profile visibility to restructuring firms & insolvency recruiters.'}
                </p>
              </div>

              <Button
                size="small"
                onClick={() => setShowCompletenessDetails(!showCompletenessDetails)}
                className="portal-completeness-toggle-btn"
              >
                {showCompletenessDetails ? 'Hide Breakdown ▲' : 'View Checklist ▼'}
              </Button>
            </div>

            <Progress
              percent={profile.completeness.score}
              strokeColor={profile.completeness.score === 100 ? '#10b981' : { '0%': '#0ea5e9', '100%': '#38bdf8' }}
              trailColor="rgba(var(--theme-contrast-rgb), 0.08)"
              showInfo={false}
            />

            {/* Quick action badges for missing items */}
            {profile.completeness.score < 100 && profile.completeness.missingItems?.length > 0 && !showCompletenessDetails && (
              <div className="portal-completeness-recs">
                <span className="portal-completeness-recs-label">Next recommendations:</span>
                {profile.completeness.missingItems.slice(0, 3).map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      if (item.key === 'resume') {
                        setActiveTab('resume');
                      } else if (item.key === 'skills') {
                        setActiveTab('skills');
                      } else if (item.key === 'experienceHistory') {
                        setActiveTab('experience');
                      } else if (item.key === 'education' || item.key === 'certification') {
                        setActiveTab('education');
                      } else {
                        setActiveTab('basic');
                      }
                    }}
                    className="portal-completeness-rec-btn"
                  >
                    + {item.label} <span className="portal-opacity-70">(+{item.points - (item.earned || 0)}%)</span>
                  </button>
                ))}
              </div>
            )}

            {/* Expanded Detailed Checklist */}
            {showCompletenessDetails && (
              <div className="portal-completeness-grid">
                {profile.completeness.breakdown?.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (item.key === 'resume') {
                        setActiveTab('resume');
                      } else if (item.key === 'skills') {
                        setActiveTab('skills');
                      } else if (item.key === 'experienceHistory') {
                        setActiveTab('experience');
                      } else if (item.key === 'education' || item.key === 'certification') {
                        setActiveTab('education');
                      } else {
                        setActiveTab('basic');
                      }
                    }}
                    className={`portal-completeness-item ${item.completed ? 'completed' : ''}`}
                  >
                    <div className="portal-completeness-item-left">
                      <span className={`portal-completeness-item-check ${item.completed ? 'completed' : ''}`}>
                        {item.completed ? '✓' : '○'}
                      </span>
                      <span className={`portal-completeness-item-label ${item.completed ? 'completed' : ''}`}>
                        {item.label}
                      </span>
                    </div>
                    <span className={`portal-completeness-item-points ${item.completed ? 'completed' : ''}`}>
                      {item.earned}/{item.points}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Scalable Scrollable Pill Navigation with Smooth Arrow Controls */}
        <div className="portal-custom-tabs-container">
          <div className="portal-custom-tabs-header">
            <button
              type="button"
              className="portal-tabs-scroll-btn"
              onClick={() => scrollTabs('left')}
              title="Scroll tabs left"
            >
              <LeftOutlined />
            </button>

            <div className="portal-tabs-scroll-track" ref={tabsContainerRef}>
              {tabItems.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    className={`portal-tab-pill-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.icon}
                    <span>{tab.title}</span>
                    {tab.count !== undefined && (
                      <span className="portal-tab-count-badge">{tab.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="portal-tabs-scroll-btn"
              onClick={() => scrollTabs('right')}
              title="Scroll tabs right"
            >
              <RightOutlined />
            </button>
          </div>
        </div>

        {/* Active Tab Content Area */}
        <div className="portal-tab-content-area portal-mt-24">
          {tabItems.find(t => t.key === activeTab)?.children}
        </div>
      </motion.div>

      {/* Education Modal */}
      <Modal
        title={editingEdu ? 'Edit Education' : 'Add Education'}
        open={eduModalVisible}
        onOk={handleSaveEducation}
        onCancel={() => setEduModalVisible(false)}
        okText="Save Education"
      >
        <Form form={eduForm} layout="vertical" className="portal-modal-form">
          <Form.Item
            label={<span className="portal-form-label">Qualification</span>}
            name="qualification"
            rules={[{ required: true, message: 'Please enter qualification (e.g. CA, LLB, MBA)' }]}
          >
            <Input placeholder="e.g. CA, LLB, CS, CMA, B.Com, MBA" />
          </Form.Item>
          <Form.Item
            label={<span className="portal-form-label">Degree / Title</span>}
            name="degree"
            rules={[{ required: true, message: 'Please enter degree' }]}
          >
            <Input placeholder="e.g. Bachelor of Laws (LLB), Chartered Accountant" />
          </Form.Item>
          <Form.Item
            label={<span className="portal-form-label">Specialisation (Optional)</span>}
            name="specialisation"
          >
            <Input placeholder="e.g. Corporate Law, Restructuring, Finance" />
          </Form.Item>
          <Form.Item
            label={<span className="portal-form-label">Institution / University</span>}
            name="institution"
            rules={[{ required: true, message: 'Please enter institution name' }]}
          >
            <Input placeholder="e.g. ICAI, National Law University, Delhi University" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span className="portal-form-label">Start Year</span>} name="startYear">
                <InputNumber min={1970} max={2035} controls={false} className="portal-w-full" placeholder="2016" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span className="portal-form-label">Completion Year</span>} name="completionYear">
                <InputNumber min={1970} max={2035} controls={false} className="portal-w-full" placeholder="2020" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* Experience Modal */}
      <Modal
        title={editingExp ? 'Edit Experience' : 'Add Experience'}
        open={expModalVisible}
        onOk={handleSaveExperience}
        onCancel={() => setExpModalVisible(false)}
        okText="Save Experience"
      >
        <Form form={expForm} layout="vertical" className="portal-modal-form">
          <Form.Item
            label={<span className="portal-form-label">Organisation / Firm</span>}
            name="organisation"
            rules={[{ required: true, message: 'Please enter organisation name' }]}
          >
            <Input placeholder="e.g. Alvarez & Marsal, Shardul Amarchand Mangaldas, SBI" />
          </Form.Item>
          <Form.Item
            label={<span className="portal-form-label">Designation</span>}
            name="designation"
            rules={[{ required: true, message: 'Please enter designation' }]}
          >
            <Input placeholder="e.g. Senior Associate - Insolvency & Bankruptcy" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span className="portal-form-label">Start Date</span>} name="startDate">
                <DatePicker className="portal-w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span className="portal-form-label">End Date</span>} name="endDate">
                <DatePicker className="portal-w-full" disabled={expIsCurrent} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isCurrent" valuePropName="checked">
            <Checkbox onChange={(e) => setExpIsCurrent(e.target.checked)}>
              <span className="portal-form-label">I am currently working in this role</span>
            </Checkbox>
          </Form.Item>
          <Form.Item
            label={<span className="portal-form-label">Responsibilities & Insolvency Matters</span>}
            name="description"
          >
            <TextArea rows={4} placeholder="Handled CIRP processes, CoC meetings, claim verifications, NCLT hearings, and resolution plan drafting..." />
          </Form.Item>
        </Form>
      </Modal>

      {/* Certification Modal */}
      <Modal
        title={editingCert ? 'Edit Certification' : 'Add Certification'}
        open={certModalVisible}
        onOk={handleSaveCertification}
        onCancel={() => setCertModalVisible(false)}
        okText="Save Certification"
      >
        <Form form={certForm} layout="vertical" className="portal-modal-form">
          <Form.Item
            label={<span className="portal-form-label">Certification / Registration Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter certification name' }]}
          >
            <Input placeholder="e.g. IBBI Registered Insolvency Professional, CA Final, CS Member" />
          </Form.Item>
          <Form.Item
            label={<span className="portal-form-label">Issuing Authority / Organisation</span>}
            name="issuingOrg"
            rules={[{ required: true, message: 'Please enter issuing organisation' }]}
          >
            <Input placeholder="e.g. IBBI, ICAI, ICSI, Bar Council of Delhi" />
          </Form.Item>
          <Form.Item
            label={<span className="portal-form-label">Registration / Membership Number (Optional)</span>}
            name="regNumber"
          >
            <Input placeholder="e.g. IBBI/IPA-001/IP-P00000/2021-2022/10000" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span className="portal-form-label">Issue Date</span>} name="issueDate">
                <DatePicker className="portal-w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span className="portal-form-label">Expiry Date (Optional)</span>} name="expiryDate">
                <DatePicker className="portal-w-full" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={<span className="portal-form-label">Certificate Document / Proof</span>}
            name="documentUrl"
          >
            <div className="portal-flex-col-gap-8">
              <Input placeholder="https://example.com/certificates/ibbi_cert.pdf or upload below" />
              <label className={`portal-resume-replace-btn-label ${uploadingCertDoc ? 'disabled' : ''}`}>
                <PlusOutlined spin={uploadingCertDoc} /> {uploadingCertDoc ? 'Uploading...' : 'Upload Document (PDF, JPG, PNG up to 3MB)'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="portal-display-none"
                  disabled={uploadingCertDoc}
                  onChange={handleCertDocUpload}
                />
              </label>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Resume Document Preview Modal */}
      <Modal
        title="Resume Document Preview"
        open={resumePreviewVisible}
        onCancel={() => setResumePreviewVisible(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setResumePreviewVisible(false)}>
            Close
          </Button>,
          <a key="dl" href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer">
            <Button type="primary" className="portal-btn-cyan">
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
              className="portal-resume-preview-iframe"
            />
          ) : (
            <div className="portal-resume-preview-fallback">
              <FileTextOutlined className="portal-resume-upload-icon" />
              <h3 className="portal-card-heading">Document Link Preview</h3>
              <p>{resumeUrl}</p>
              <a href={getFileUrl(resumeUrl)} target="_blank" rel="noopener noreferrer">
                <Button type="primary" className="portal-btn-cyan portal-mt-12">Open External Document Link</Button>
              </a>
            </div>
          )}
        </div>
      </Modal>

      {/* Enlarged Circular Profile Photo Preview Modal */}
      <Modal
        open={photoPreviewVisible}
        onCancel={() => setPhotoPreviewVisible(false)}
        footer={null}
        centered
        width={340}
        className="portal-photo-modal"
      >
        <div className="portal-photo-preview-wrap">
          <div className="portal-photo-preview-img-container">
            {currentPhoto ? (
              <img
                src={getFileUrl(currentPhoto)}
                alt={profile?.user?.name || 'Profile Picture'}
                className="portal-photo-preview-img"
              />
            ) : (
              <UserOutlined className="portal-photo-preview-fallback-icon" />
            )}
          </div>
          <div className="portal-photo-preview-text">
            <h4 className="portal-card-heading">
              {profile?.user?.name || 'Candidate Photo'}
            </h4>
            <p className="portal-card-meta">
              {profile?.professionalCategory || profile?.designation || 'Profile Picture'}
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CandidateProfile;

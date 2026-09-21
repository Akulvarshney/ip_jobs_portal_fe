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
          style={{ maxWidth: '900px' }}
        >
          <Form.Item name="profilePhoto" hidden>
            <Input />
          </Form.Item>

          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <div
              style={{
                position: 'relative',
                cursor: currentPhoto ? 'pointer' : 'default',
                borderRadius: '50%',
                display: 'inline-block'
              }}
              onClick={() => {
                if (currentPhoto) setPhotoPreviewVisible(true);
              }}
              title={currentPhoto ? 'Click photo to enlarge' : ''}
            >
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={getFileUrl(currentPhoto)}
                style={{
                  backgroundColor: '#0ea5e9',
                  border: '2px solid rgba(56, 189, 248, 0.4)',
                  boxShadow: currentPhoto ? '0 0 15px rgba(56, 189, 248, 0.25)' : 'none',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              />
              <label
                style={{
                  position: 'absolute',
                  bottom: '-2px',
                  right: '-2px',
                  background: '#0ea5e9',
                  border: '2px solid var(--theme-bg)',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--theme-on-primary)',
                  fontSize: '14px',
                  cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                  boxShadow: '0 2px 8px rgba(var(--theme-shadow-rgb), 0.4)',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
                onClick={(e) => e.stopPropagation()}
                title="Edit / Change Photo"
              >
                {uploadingPhoto ? <SyncOutlined spin style={{ fontSize: '12px' }} /> : <EditOutlined />}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={uploadingPhoto}
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>
            <div>
              <div style={{ color: 'var(--theme-heading)', fontWeight: 600, fontSize: '16px' }}>
                {profile?.user?.name || 'Profile Picture'}
              </div>
              <div style={{ color: 'var(--theme-subtle)', fontSize: '13px', marginTop: '2px' }}>
                {profile?.professionalCategory || profile?.designation || 'Candidate'}
              </div>
            </div>
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)' }} orientation="left">
            <span style={{ color: 'var(--theme-link)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Basic Contact Details
            </span>
          </Divider>

          <Row gutter={20}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Full Name</span>}
                name="name"
                rules={[{ required: true, message: 'Full name is required' }]}
              >
                <Input placeholder="e.g. Rahul Sharma" style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Email Address</span>}
                name="email"
              >
                <Input disabled style={{ background: 'rgba(var(--theme-contrast-rgb), 0.02)', color: 'var(--theme-subtle)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Phone Number</span>}
                name="phone"
              >
                <Input placeholder="+91 98765 43210" style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>City / Location</span>}
                name="city"
              >
                <Input placeholder="e.g. New Delhi, Mumbai, Bengaluru" style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)', marginTop: '24px' }} orientation="left">
            <span style={{ color: 'var(--theme-link)', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Professional Information
            </span>
          </Divider>

          <Row gutter={20}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Professional Category</span>}
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
                label={<span style={{ color: 'var(--theme-secondary)' }}>Current Designation</span>}
                name="designation"
              >
                <Input placeholder="e.g. Senior Insolvency Associate / Partner" style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Total Experience (Years)</span>}
                name="experience"
              >
                <InputNumber min={0} max={50} controls={false} style={{ width: '100%', background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Current CTC (₹ LPA)</span>}
                name="currentSalary"
              >
                <InputNumber min={0} controls={false} placeholder="e.g. 15.0" style={{ width: '100%', background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Expected CTC (₹ LPA)</span>}
                name="expectedSalary"
              >
                <InputNumber min={0} controls={false} placeholder="e.g. 22.0" style={{ width: '100%', background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: 'var(--theme-secondary)' }}>Notice Period</span>}
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
                label={<span style={{ color: 'var(--theme-secondary)' }}>Profile Visibility</span>}
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
                label={<span style={{ color: 'var(--theme-secondary)' }}>Professional Bio / Executive Summary</span>}
                name="bio"
              >
                <TextArea
                  rows={4}
                  placeholder="Summary of your insolvency, restructuring, resolution planning, and legal proceedings background..."
                  style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }}
                />
              </Form.Item>
            </Col>
          </Row>

          <Button
            type="primary"
            htmlType="submit"
            icon={<SaveOutlined />}
            loading={saving}
            style={{ borderRadius: '8px', padding: '0 24px', height: '40px', background: '#0ea5e9', marginTop: '12px' }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', margin: 0 }}>Education & Qualifications</h3>
              <p style={{ color: 'var(--theme-muted)', fontSize: '13px', margin: '4px 0 0' }}>Add your degrees, CA/CS qualifications, and academic institutions.</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenEduModal()}
              style={{ background: '#0ea5e9', borderRadius: '8px' }}
            >
              Add Education
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {profile?.educations?.map((edu) => (
              <div
                key={edu.id}
                style={{
                  background: 'rgba(var(--theme-contrast-rgb), 0.03)',
                  border: '1px solid rgba(var(--theme-contrast-rgb), 0.08)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 600 }}>{edu.qualification}</Tag>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-heading)' }}>{edu.degree}</span>
                    {edu.specialisation && <span style={{ color: 'var(--theme-detail)', fontSize: '14px' }}>in {edu.specialisation}</span>}
                  </div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '14px', marginTop: '6px' }}>
                    {edu.institution} • {edu.startYear ? `${edu.startYear} - ` : ''}{edu.completionYear || 'Present'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
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
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94a3af', background: 'rgba(var(--theme-contrast-rgb), 0.02)', borderRadius: '12px' }}>
                <BookOutlined style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No education details added yet. Click "Add Education" above.</p>
              </div>
            )}
          </div>

          <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.1)', margin: '28px 0' }} />

          {/* Certifications & Statutory Registrations Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', margin: 0 }}>Certifications & Statutory Registrations</h3>
              <p style={{ color: 'var(--theme-muted)', fontSize: '13px', margin: '4px 0 0' }}>IBBI Registration number, ICAI/ICSI membership, and legal certifications.</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCertModal()}
              style={{ background: '#0ea5e9', borderRadius: '8px' }}
            >
              Add Certification
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {profile?.certifications?.map((cert) => (
              <div
                key={cert.id}
                style={{
                  background: 'rgba(var(--theme-contrast-rgb), 0.03)',
                  border: '1px solid rgba(var(--theme-contrast-rgb), 0.08)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-heading)' }}>{cert.name}</span>
                    <Tag color="purple" style={{ borderRadius: '6px' }}>{cert.issuingOrg}</Tag>
                  </div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '13px', marginTop: '6px' }}>
                    {cert.regNumber && <span>Reg No: <strong>{cert.regNumber}</strong> • </span>}
                    {cert.issueDate && <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>}
                    {cert.documentUrl && (
                      <span style={{ marginLeft: '10px' }}>
                        <a href={getFileUrl(cert.documentUrl)} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--theme-link)' }}>
                          View Document ↗
                        </a>
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
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
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94a3af', background: 'rgba(var(--theme-contrast-rgb), 0.02)', borderRadius: '12px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '28px', marginBottom: '8px', opacity: 0.5 }} />
                <p style={{ margin: 0 }}>No statutory registrations or certificates added yet. Click "Add Certification" above.</p>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', margin: 0 }}>Work Experience & IBC Matters</h3>
              <p style={{ color: 'var(--theme-muted)', fontSize: '13px', margin: '4px 0 0' }}>Highlight organisations, designations, and restructuring assignments.</p>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenExpModal()}
              style={{ background: '#0ea5e9', borderRadius: '8px' }}
            >
              Add Experience
            </Button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {profile?.experiences?.map((exp) => (
              <div
                key={exp.id}
                style={{
                  background: 'rgba(var(--theme-contrast-rgb), 0.03)',
                  border: '1px solid rgba(var(--theme-contrast-rgb), 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1, marginRight: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--theme-heading)' }}>{exp.designation}</span>
                    <span style={{ color: 'var(--theme-link)', fontSize: '15px' }}>@ {exp.organisation}</span>
                    {exp.isCurrent && <Tag color="green">Current Role</Tag>}
                  </div>
                  <div style={{ color: 'var(--theme-subtle)', fontSize: '13px', marginBottom: '10px' }}>
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A')}
                  </div>
                  {exp.description && (
                    <div style={{ color: 'var(--theme-detail)', fontSize: '13px', lineHeight: '1.6', background: 'rgba(var(--theme-contrast-rgb), 0.02)', padding: '10px 14px', borderRadius: '8px' }}>
                      {exp.description}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
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
              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3af', background: 'rgba(var(--theme-contrast-rgb), 0.02)', borderRadius: '12px' }}>
                <BankOutlined style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }} />
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
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', margin: 0 }}>Insolvency & Professional Skills</h3>
            <p style={{ color: 'var(--theme-muted)', fontSize: '13px', margin: '4px 0 0' }}>Select IBC domain competencies or add custom tags.</p>
          </div>

          <div style={{ background: 'rgba(var(--theme-contrast-rgb), 0.03)', border: '1px solid rgba(var(--theme-contrast-rgb), 0.08)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ color: 'var(--theme-link)', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '14px' }}>
              Suggested IBC & Restructuring Skills (Click to toggle)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px' }}>
              {defaultPredefinedSkills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <Tag.CheckableTag
                    key={skill}
                    checked={isSelected}
                    onChange={() => handleToggleSkill(skill)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '13px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(var(--theme-contrast-rgb), 0.15)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(var(--theme-contrast-rgb), 0.04)',
                      color: isSelected ? 'var(--theme-heading)' : 'var(--theme-detail)'
                    }}
                  >
                    {isSelected && <CheckCircleOutlined style={{ marginRight: '6px', color: 'var(--theme-link)' }} />}
                    {skill}
                  </Tag.CheckableTag>
                );
              })}
            </div>

            <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)' }} />

            <div style={{ color: 'var(--theme-secondary)', fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>
              Add Custom Skill / Specialization
            </div>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
              <Input
                placeholder="e.g. Cross-Border Insolvency, Forensic Accounting..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onPressEnter={handleAddCustomSkill}
                style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }}
              />
              <Button type="primary" onClick={handleAddCustomSkill} style={{ background: '#0ea5e9' }}>
                Add
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: 'var(--theme-subtle)', fontSize: '13px' }}>
              {selectedSkills.length} skills selected
            </div>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSaveSkills}
              style={{ background: '#0ea5e9', borderRadius: '8px', height: '40px', padding: '0 24px' }}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: 'var(--theme-heading)', fontSize: '18px', margin: 0 }}>Candidate Resume & Credentials</h3>
              <p style={{ color: 'var(--theme-muted)', fontSize: '13px', margin: '4px 0 0' }}>Manage your primary CV document used when applying for mandates.</p>
            </div>
          </div>

          <div>
            {/* Resume Card */}
            <div>
              {resumeUrl ? (
                <div style={{
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
                        onClick={() => setResumePreviewVisible(true)}
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
                        cursor: uploadingResume ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        opacity: uploadingResume ? 0.6 : 1
                      }}
                    >
                      <SyncOutlined spin={uploadingResume} /> {uploadingResume ? 'Uploading...' : 'Replace File (PDF, DOCX)'}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        disabled={uploadingResume}
                        onChange={handleResumeFileUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div style={{
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
                  <p style={{ color: 'var(--theme-subtle)', fontSize: '14px', margin: '6px 0 20px' }}>
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
                      cursor: uploadingResume ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 600,
                      boxShadow: '0 4px 14px rgba(14, 165, 233, 0.4)',
                      opacity: uploadingResume ? 0.6 : 1
                    }}
                  >
                    <UploadOutlined spin={uploadingResume} /> {uploadingResume ? 'Uploading...' : 'Select File to Upload'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      style={{ display: 'none' }}
                      disabled={uploadingResume}
                      onChange={handleResumeFileUpload}
                    />
                  </label>

                  <div style={{ margin: '24px auto 0', maxWidth: '460px', color: '#64748b', fontSize: '13px' }}>
                    — OR provide a document link below —
                  </div>

                  <div style={{ display: 'flex', gap: '10px', maxWidth: '480px', margin: '14px auto 0' }}>
                    <Input
                      placeholder="https://drive.google.com/... or cloud document link"
                      value={resumeInputUrl}
                      onChange={(e) => setResumeInputUrl(e.target.value)}
                      style={{ background: 'rgba(var(--theme-contrast-rgb), 0.05)', color: 'var(--theme-heading)', borderColor: 'rgba(var(--theme-contrast-rgb), 0.15)' }}
                    />
                    <Button
                      type="primary"
                      loading={savingResume}
                      onClick={handleSaveResumeUrl}
                      style={{ background: '#0ea5e9' }}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column Guidance */}
            {/* <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(var(--theme-contrast-rgb), 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)' }}>
                <div style={{ fontWeight: 600, color: 'var(--theme-link)', fontSize: '13px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <SafetyCertificateOutlined /> Mandate Values & CIRP Stages
                </div>
                <div style={{ color: 'var(--theme-subtle)', fontSize: '12px', lineHeight: '1.5' }}>
                  Mention verified claim amounts, liquidation valuations, and NCLT bench jurisdictions (e.g. Principal Bench, Mumbai, NCLAT).
                </div>
              </div>

              <div style={{ background: 'rgba(var(--theme-contrast-rgb), 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)' }}>
                <div style={{ fontWeight: 600, color: 'var(--theme-link)', fontSize: '13px', marginBottom: '4px' }}>
                  Section 29A Due Diligence & CoC Experience
                </div>
                <div style={{ color: 'var(--theme-subtle)', fontSize: '12px', lineHeight: '1.5' }}>
                  State experience in prospective resolution applicant vetting and drafting evaluation matrices.
                </div>
              </div>

              <div style={{ background: 'rgba(var(--theme-contrast-rgb), 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(var(--theme-contrast-rgb), 0.06)' }}>
                <div style={{ fontWeight: 600, color: 'var(--theme-link)', fontSize: '13px', marginBottom: '4px' }}>
                  Statutory Registrations
                </div>
                <div style={{ color: 'var(--theme-subtle)', fontSize: '12px', lineHeight: '1.5' }}>
                  Include IBBI registration number, ICAI/ICSI/Bar Council enrolment ID explicitly.
                </div>
              </div>
            </div> */}
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
        className="portal-glass-card"
        style={{ padding: '32px' }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'var(--theme-heading)', margin: 0 }}>Candidate Profile</h1>
          <p style={{ color: 'var(--theme-muted)', fontSize: '14px', margin: '6px 0 0' }}>
            Manage your personal background, professional categories, education, experience, IBC competencies, certifications, and CV.
          </p>
        </div>

        {/* Profile Completeness Interactive Banner */}
        {profile?.completeness && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(var(--theme-surface-rgb), 0.7) 0%, rgba(var(--theme-bg-rgb), 0.8) 100%)',
            border: '1px solid rgba(var(--theme-contrast-rgb), 0.08)',
            borderRadius: '14px',
            padding: '18px 24px',
            marginBottom: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'var(--theme-heading)' }}>Profile Completeness</span>
                  <Tag color={profile.completeness.score === 100 ? 'success' : 'processing'} style={{ borderRadius: '12px', fontWeight: 600 }}>
                    {profile.completeness.score}% Completed
                  </Tag>
                  <span style={{ fontSize: '12px', color: 'var(--theme-subtle)' }}>
                    ({profile.completeness.completedCount}/{profile.completeness.totalItemsCount} criteria fulfilled)
                  </span>
                </div>
                <p style={{ color: 'var(--theme-subtle)', fontSize: '13px', margin: '4px 0 0' }}>
                  {profile.completeness.score === 100
                    ? '🎉 Your profile is 100% complete and verified for top priority employer searches.'
                    : 'Complete pending sections to boost your profile visibility to restructuring firms & insolvency recruiters.'}
                </p>
              </div>

              <Button
                size="small"
                onClick={() => setShowCompletenessDetails(!showCompletenessDetails)}
                style={{
                  background: 'rgba(56, 189, 248, 0.1)',
                  borderColor: 'rgba(56, 189, 248, 0.3)',
                  color: 'var(--theme-link)',
                  borderRadius: '8px'
                }}
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>Next recommendations:</span>
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
                    style={{
                      background: 'rgba(var(--theme-contrast-rgb), 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      color: 'var(--theme-link)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    + {item.label} <span style={{ opacity: 0.7 }}>(+{item.points - (item.earned || 0)}%)</span>
                  </button>
                ))}
              </div>
            )}

            {/* Expanded Detailed Checklist */}
            {showCompletenessDetails && (
              <div style={{
                marginTop: '12px',
                paddingTop: '16px',
                borderTop: '1px solid rgba(var(--theme-contrast-rgb), 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px'
              }}>
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
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: item.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(var(--theme-contrast-rgb), 0.03)',
                      border: `1px solid ${item.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(var(--theme-contrast-rgb), 0.06)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: item.completed ? '#10b981' : '#64748b', fontSize: '14px' }}>
                        {item.completed ? '✓' : '○'}
                      </span>
                      <span style={{ fontSize: '13px', color: item.completed ? 'var(--theme-secondary)' : 'var(--theme-subtle)', fontWeight: item.completed ? 500 : 400 }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: item.completed ? '#10b981' : '#38bdf8' }}>
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
        <div className="portal-tab-content-area" style={{ marginTop: '24px' }}>
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
        <Form form={eduForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Qualification</span>}
            name="qualification"
            rules={[{ required: true, message: 'Please enter qualification (e.g. CA, LLB, MBA)' }]}
          >
            <Input placeholder="e.g. CA, LLB, CS, CMA, B.Com, MBA" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Degree / Title</span>}
            name="degree"
            rules={[{ required: true, message: 'Please enter degree' }]}
          >
            <Input placeholder="e.g. Bachelor of Laws (LLB), Chartered Accountant" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Specialisation (Optional)</span>}
            name="specialisation"
          >
            <Input placeholder="e.g. Corporate Law, Restructuring, Finance" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Institution / University</span>}
            name="institution"
            rules={[{ required: true, message: 'Please enter institution name' }]}
          >
            <Input placeholder="e.g. ICAI, National Law University, Delhi University" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: 'var(--theme-secondary)' }}>Start Year</span>} name="startYear">
                <InputNumber min={1970} max={2035} controls={false} style={{ width: '100%' }} placeholder="2016" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: 'var(--theme-secondary)' }}>Completion Year</span>} name="completionYear">
                <InputNumber min={1970} max={2035} controls={false} style={{ width: '100%' }} placeholder="2020" />
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
        <Form form={expForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Organisation / Firm</span>}
            name="organisation"
            rules={[{ required: true, message: 'Please enter organisation name' }]}
          >
            <Input placeholder="e.g. Alvarez & Marsal, Shardul Amarchand Mangaldas, SBI" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Designation</span>}
            name="designation"
            rules={[{ required: true, message: 'Please enter designation' }]}
          >
            <Input placeholder="e.g. Senior Associate - Insolvency & Bankruptcy" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: 'var(--theme-secondary)' }}>Start Date</span>} name="startDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: 'var(--theme-secondary)' }}>End Date</span>} name="endDate">
                <DatePicker style={{ width: '100%' }} disabled={expIsCurrent} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isCurrent" valuePropName="checked">
            <Checkbox onChange={(e) => setExpIsCurrent(e.target.checked)}>
              <span style={{ color: 'var(--theme-secondary)' }}>I am currently working in this role</span>
            </Checkbox>
          </Form.Item>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Responsibilities & Insolvency Matters</span>}
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
        <Form form={certForm} layout="vertical" style={{ marginTop: '16px' }}>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Certification / Registration Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter certification name' }]}
          >
            <Input placeholder="e.g. IBBI Registered Insolvency Professional, CA Final, CS Member" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Issuing Authority / Organisation</span>}
            name="issuingOrg"
            rules={[{ required: true, message: 'Please enter issuing organisation' }]}
          >
            <Input placeholder="e.g. IBBI, ICAI, ICSI, Bar Council of Delhi" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Registration / Membership Number (Optional)</span>}
            name="regNumber"
          >
            <Input placeholder="e.g. IBBI/IPA-001/IP-P00000/2021-2022/10000" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: 'var(--theme-secondary)' }}>Issue Date</span>} name="issueDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: 'var(--theme-secondary)' }}>Expiry Date (Optional)</span>} name="expiryDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={<span style={{ color: 'var(--theme-secondary)' }}>Certificate Document / Proof</span>}
            name="documentUrl"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Input placeholder="https://example.com/certificates/ibbi_cert.pdf or upload below" />
              <label
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  background: 'rgba(var(--theme-contrast-rgb), 0.06)',
                  border: '1px dashed rgba(var(--theme-contrast-rgb), 0.2)',
                  borderRadius: '8px',
                  color: 'var(--theme-link)',
                  cursor: uploadingCertDoc ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  width: 'fit-content'
                }}
              >
                <PlusOutlined spin={uploadingCertDoc} /> {uploadingCertDoc ? 'Uploading...' : 'Upload Document (PDF, JPG, PNG up to 3MB)'}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  style={{ display: 'none' }}
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
                <Button type="primary" style={{ marginTop: '12px', background: '#0ea5e9' }}>Open External Document Link</Button>
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
        styles={{
          body: {
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          },
          content: {
            background: 'rgba(var(--theme-bg-rgb), 0.94)',
            backdropFilter: 'blur(16px)',
            borderRadius: '24px',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            boxShadow: '0 20px 50px rgba(var(--theme-shadow-rgb), 0.7), 0 0 40px rgba(14, 165, 233, 0.25)'
          }
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px'
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '240px',
              height: '240px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(56, 189, 248, 0.8)',
              boxShadow: '0 0 30px rgba(56, 189, 248, 0.4), inset 0 0 20px rgba(var(--theme-shadow-rgb),0.5)',
              background: '#0ea5e9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {currentPhoto ? (
              <img
                src={getFileUrl(currentPhoto)}
                alt={profile?.user?.name || 'Profile Picture'}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  borderRadius: '50%'
                }}
              />
            ) : (
              <UserOutlined style={{ fontSize: '90px', color: 'var(--theme-heading)' }} />
            )}
          </div>
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <h4 style={{ color: 'var(--theme-heading)', fontSize: '17px', fontWeight: 600, margin: 0 }}>
              {profile?.user?.name || 'Candidate Photo'}
            </h4>
            <p style={{ color: 'var(--theme-subtle)', fontSize: '13px', margin: '4px 0 0' }}>
              {profile?.professionalCategory || profile?.designation || 'Profile Picture'}
            </p>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default CandidateProfile;

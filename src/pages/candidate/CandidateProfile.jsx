import React, { useState, useEffect } from 'react';
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
import { useNavigate } from 'react-router-dom';
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
  CheckCircleOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCandidateProfile,
  updateCandidateProfile,
  deleteEducation,
  deleteExperience,
  removeSkill,
  deleteCertification
} from '../../store/candidateSlice';
import api from '../../api';
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
  const [showCompletenessDetails, setShowCompletenessDetails] = useState(false);
  const navigate = useNavigate();

  const fetchProfile = () => {
    dispatch(fetchCandidateProfile());
  };

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
      message.success('Profile photo uploaded to Cloudflare R2 successfully!');
      fetchProfile();
    } catch (error) {
      console.error('Photo upload failed:', error);
      message.error(error?.response?.data?.message || 'Failed to upload photo to Cloudflare R2');
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
      message.success('Certificate document uploaded to Cloudflare R2!');
    } catch (error) {
      console.error('Document upload failed:', error);
      message.error(error?.response?.data?.message || 'Failed to upload document to Cloudflare R2');
    } finally {
      setUploadingCertDoc(false);
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
      await dispatch(updateCandidateProfile(values)).unwrap();
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
      label: (
        <span>
          <UserOutlined /> Basic & Professional
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveBasic}
          style={{ maxWidth: '900px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <Avatar
              size={76}
              icon={<UserOutlined />}
              src={form.getFieldValue('profilePhoto')}
              style={{ backgroundColor: '#0ea5e9', border: '2px solid rgba(56, 189, 248, 0.4)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    background: '#0ea5e9',
                    borderRadius: '8px',
                    color: 'white',
                    cursor: uploadingPhoto ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(14, 165, 233, 0.3)',
                    opacity: uploadingPhoto ? 0.6 : 1
                  }}
                >
                  <PlusOutlined spin={uploadingPhoto} /> {uploadingPhoto ? 'Uploading to R2...' : 'Upload Photo'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploadingPhoto}
                    onChange={handlePhotoUpload}
                  />
                </label>
                {form.getFieldValue('profilePhoto') && (
                  <Button
                    size="small"
                    danger
                    onClick={() => {
                      form.setFieldsValue({ profilePhoto: '' });
                    }}
                    style={{ borderRadius: '6px' }}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                Uploaded to Cloudflare R2 (JPG, PNG, WebP up to 3MB)
              </span>
            </div>
          </div>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} orientation="left">
            <span style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Basic Contact Details
            </span>
          </Divider>

          <Row gutter={20}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Full Name</span>}
                name="name"
                rules={[{ required: true, message: 'Full name is required' }]}
              >
                <Input placeholder="e.g. Rahul Sharma" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Email Address</span>}
                name="email"
              >
                <Input disabled style={{ background: 'rgba(255, 255, 255, 0.02)', color: '#94a3b8' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Phone Number</span>}
                name="phone"
              >
                <Input placeholder="+91 98765 43210" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>City / Location</span>}
                name="city"
              >
                <Input placeholder="e.g. New Delhi, Mumbai, Bengaluru" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', marginTop: '24px' }} orientation="left">
            <span style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Professional Information
            </span>
          </Divider>

          <Row gutter={20}>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Professional Category</span>}
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
                label={<span style={{ color: '#e2e8f0' }}>Current Designation</span>}
                name="designation"
              >
                <Input placeholder="e.g. Senior Insolvency Associate / Partner" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Total Experience (Years)</span>}
                name="experience"
              >
                <InputNumber min={0} max={50} style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Current CTC (₹ LPA)</span>}
                name="currentSalary"
              >
                <InputNumber min={0} placeholder="e.g. 15.0" style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Expected CTC (₹ LPA)</span>}
                name="expectedSalary"
              >
                <InputNumber min={0} placeholder="e.g. 22.0" style={{ width: '100%', background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label={<span style={{ color: '#e2e8f0' }}>Notice Period</span>}
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
                label={<span style={{ color: '#e2e8f0' }}>Profile Visibility</span>}
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
                label={<span style={{ color: '#e2e8f0' }}>Professional Bio / Executive Summary</span>}
                name="bio"
              >
                <TextArea
                  rows={4}
                  placeholder="Summary of your insolvency, restructuring, resolution planning, and legal proceedings background..."
                  style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}
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
      label: (
        <span>
          <BookOutlined /> Education ({profile?.educations?.length || 0})
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '18px', margin: 0 }}>Education & Qualifications</h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>Add your degrees, CA/CS qualifications, and academic institutions.</p>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {profile?.educations?.map((edu) => (
              <div
                key={edu.id}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
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
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>{edu.degree}</span>
                    {edu.specialisation && <span style={{ color: '#cbd5e1', fontSize: '14px' }}>in {edu.specialisation}</span>}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', marginTop: '6px' }}>
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
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                <BookOutlined style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }} />
                <p>No education details added yet. Click "Add Education" above.</p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'experience',
      label: (
        <span>
          <BankOutlined /> Experience ({profile?.experiences?.length || 0})
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '18px', margin: 0 }}>Work Experience & IBC Matters</h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>Highlight organisations, designations, and restructuring assignments.</p>
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
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1, marginRight: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>{exp.designation}</span>
                    <span style={{ color: '#38bdf8', fontSize: '15px' }}>@ {exp.organisation}</span>
                    {exp.isCurrent && <Tag color="green">Current Role</Tag>}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '10px' }}>
                    {exp.startDate ? new Date(exp.startDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A'} - {exp.isCurrent ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short' }) : 'N/A')}
                  </div>
                  {exp.description && (
                    <div style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6', background: 'rgba(255, 255, 255, 0.02)', padding: '10px 14px', borderRadius: '8px' }}>
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
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
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
      label: (
        <span>
          <ToolOutlined /> Skills ({selectedSkills.length})
        </span>
      ),
      children: (
        <div>
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'white', fontSize: '18px', margin: 0 }}>Insolvency & Professional Skills</h3>
            <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>Select IBC domain competencies or add custom tags.</p>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
            <div style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '14px' }}>
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
                      border: isSelected ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.15)',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      color: isSelected ? '#ffffff' : '#cbd5e1'
                    }}
                  >
                    {isSelected && <CheckCircleOutlined style={{ marginRight: '6px', color: '#38bdf8' }} />}
                    {skill}
                  </Tag.CheckableTag>
                );
              })}
            </div>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            <div style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>
              Add Custom Skill / Specialization
            </div>
            <div style={{ display: 'flex', gap: '12px', maxWidth: '500px' }}>
              <Input
                placeholder="e.g. Cross-Border Insolvency, Forensic Accounting..."
                value={customSkillInput}
                onChange={(e) => setCustomSkillInput(e.target.value)}
                onPressEnter={handleAddCustomSkill}
                style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }}
              />
              <Button type="primary" onClick={handleAddCustomSkill} style={{ background: '#0ea5e9' }}>
                Add
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>
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
      key: 'certifications',
      label: (
        <span>
          <SafetyCertificateOutlined /> Certifications & Registrations ({profile?.certifications?.length || 0})
        </span>
      ),
      children: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ color: 'white', fontSize: '18px', margin: 0 }}>Certifications & Statutory Registrations</h3>
              <p style={{ color: '#9ca3af', fontSize: '13px', margin: '4px 0 0' }}>IBBI Registration number, ICAI/ICSI membership, and legal certifications.</p>
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
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px', fontWeight: 600, color: 'white' }}>{cert.name}</span>
                    <Tag color="purple" style={{ borderRadius: '6px' }}>{cert.issuingOrg}</Tag>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '6px' }}>
                    {cert.regNumber && <span>Reg No: <strong>{cert.regNumber}</strong> • </span>}
                    {cert.issueDate && <span>Issued: {new Date(cert.issueDate).toLocaleDateString()}</span>}
                    {cert.documentUrl && (
                      <span style={{ marginLeft: '10px' }}>
                        <a href={cert.documentUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
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
              <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px' }}>
                <SafetyCertificateOutlined style={{ fontSize: '32px', marginBottom: '10px', opacity: 0.5 }} />
                <p>No statutory registrations or certificates added yet.</p>
              </div>
            )}
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
          <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>Candidate Profile</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px', margin: '6px 0 0' }}>
            Manage your personal background, professional categories, education, experience, IBC competencies, and certifications.
          </p>
        </div>

        {/* Profile Completeness Interactive Banner */}
        {profile?.completeness && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
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
                  <span style={{ fontSize: '15px', fontWeight: 600, color: 'white' }}>Profile Completeness</span>
                  <Tag color={profile.completeness.score === 100 ? 'success' : 'processing'} style={{ borderRadius: '12px', fontWeight: 600 }}>
                    {profile.completeness.score}% Completed
                  </Tag>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    ({profile.completeness.completedCount}/{profile.completeness.totalItemsCount} criteria fulfilled)
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '13px', margin: '4px 0 0' }}>
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
                  color: '#38bdf8', 
                  borderRadius: '8px' 
                }}
              >
                {showCompletenessDetails ? 'Hide Breakdown ▲' : 'View Checklist ▼'}
              </Button>
            </div>

            <Progress
              percent={profile.completeness.score}
              strokeColor={profile.completeness.score === 100 ? '#10b981' : { '0%': '#0ea5e9', '100%': '#38bdf8' }}
              trailColor="rgba(255, 255, 255, 0.08)"
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
                        navigate('/candidate/resume');
                      } else if (item.key === 'skills') {
                        setActiveTab('skills');
                      } else if (item.key === 'experienceHistory') {
                        setActiveTab('experience');
                      } else if (item.key === 'education') {
                        setActiveTab('education');
                      } else if (item.key === 'certification') {
                        setActiveTab('certifications');
                      } else {
                        setActiveTab('basic');
                      }
                    }}
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      borderRadius: '6px',
                      padding: '3px 10px',
                      color: '#38bdf8',
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
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '12px'
              }}>
                {profile.completeness.breakdown?.map((item) => (
                  <div
                    key={item.key}
                    onClick={() => {
                      if (item.key === 'resume') {
                        navigate('/candidate/resume');
                      } else if (item.key === 'skills') {
                        setActiveTab('skills');
                      } else if (item.key === 'experienceHistory') {
                        setActiveTab('experience');
                      } else if (item.key === 'education') {
                        setActiveTab('education');
                      } else if (item.key === 'certification') {
                        setActiveTab('certifications');
                      } else {
                        setActiveTab('basic');
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: item.completed ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${item.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.06)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: item.completed ? '#10b981' : '#64748b', fontSize: '14px' }}>
                        {item.completed ? '✓' : '○'}
                      </span>
                      <span style={{ fontSize: '13px', color: item.completed ? '#e2e8f0' : '#94a3b8', fontWeight: item.completed ? 500 : 400 }}>
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

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          type="card"
        />
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
            label={<span style={{ color: '#e2e8f0' }}>Qualification</span>}
            name="qualification"
            rules={[{ required: true, message: 'Please enter qualification (e.g. CA, LLB, MBA)' }]}
          >
            <Input placeholder="e.g. CA, LLB, CS, CMA, B.Com, MBA" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Degree / Title</span>}
            name="degree"
            rules={[{ required: true, message: 'Please enter degree' }]}
          >
            <Input placeholder="e.g. Bachelor of Laws (LLB), Chartered Accountant" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Specialisation (Optional)</span>}
            name="specialisation"
          >
            <Input placeholder="e.g. Corporate Law, Restructuring, Finance" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Institution / University</span>}
            name="institution"
            rules={[{ required: true, message: 'Please enter institution name' }]}
          >
            <Input placeholder="e.g. ICAI, National Law University, Delhi University" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>Start Year</span>} name="startYear">
                <InputNumber min={1970} max={2035} style={{ width: '100%' }} placeholder="2016" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>Completion Year</span>} name="completionYear">
                <InputNumber min={1970} max={2035} style={{ width: '100%' }} placeholder="2020" />
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
            label={<span style={{ color: '#e2e8f0' }}>Organisation / Firm</span>}
            name="organisation"
            rules={[{ required: true, message: 'Please enter organisation name' }]}
          >
            <Input placeholder="e.g. Alvarez & Marsal, Shardul Amarchand Mangaldas, SBI" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Designation</span>}
            name="designation"
            rules={[{ required: true, message: 'Please enter designation' }]}
          >
            <Input placeholder="e.g. Senior Associate - Insolvency & Bankruptcy" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>Start Date</span>} name="startDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>End Date</span>} name="endDate">
                <DatePicker style={{ width: '100%' }} disabled={expIsCurrent} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="isCurrent" valuePropName="checked">
            <Checkbox onChange={(e) => setExpIsCurrent(e.target.checked)}>
              <span style={{ color: '#e2e8f0' }}>I am currently working in this role</span>
            </Checkbox>
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Responsibilities & Insolvency Matters</span>}
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
            label={<span style={{ color: '#e2e8f0' }}>Certification / Registration Name</span>}
            name="name"
            rules={[{ required: true, message: 'Please enter certification name' }]}
          >
            <Input placeholder="e.g. IBBI Registered Insolvency Professional, CA Final, CS Member" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Issuing Authority / Organisation</span>}
            name="issuingOrg"
            rules={[{ required: true, message: 'Please enter issuing organisation' }]}
          >
            <Input placeholder="e.g. IBBI, ICAI, ICSI, Bar Council of Delhi" />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Registration / Membership Number (Optional)</span>}
            name="regNumber"
          >
            <Input placeholder="e.g. IBBI/IPA-001/IP-P00000/2021-2022/10000" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>Issue Date</span>} name="issueDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={<span style={{ color: '#e2e8f0' }}>Expiry Date (Optional)</span>} name="expiryDate">
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={<span style={{ color: '#e2e8f0' }}>Certificate Document / Proof</span>}
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
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px dashed rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: '#38bdf8',
                  cursor: uploadingCertDoc ? 'not-allowed' : 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                  width: 'fit-content'
                }}
              >
                <PlusOutlined spin={uploadingCertDoc} /> {uploadingCertDoc ? 'Uploading to Cloudflare R2...' : 'Upload Document to Cloudflare R2 (PDF, JPG, PNG up to 3MB)'}
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

    </div>
  );
};

export default CandidateProfile;

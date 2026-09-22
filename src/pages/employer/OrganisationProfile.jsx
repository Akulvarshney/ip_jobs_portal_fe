import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  message, 
  Row, 
  Col, 
  Avatar, 
  Divider, 
  Tag, 
  Card,
  Spin
} from 'antd';
import { 
  BankOutlined, 
  SaveOutlined, 
  GlobalOutlined, 
  EnvironmentOutlined, 
  EyeOutlined, 
  FileTextOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  RocketOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrganisationProfile, updateOrganisationProfile } from '../../store/employerSlice';
import api from '../../api';
import { getFileUrl } from '../../utils/fileUrl';

const { Option } = Select;
const { TextArea } = Input;

const orgTypes = [
  { value: 'BANK', label: 'Bank' },
  { value: 'NBFC', label: 'NBFC' },
  { value: 'ARC', label: 'Asset Reconstruction Company (ARC)' },
  { value: 'IP', label: 'Insolvency Professional (IP)' },
  { value: 'IPE', label: 'Insolvency Professional Entity (IPE)' },
  { value: 'CONSULTING_FIRM', label: 'Consulting Firm' },
  { value: 'CA_FIRM', label: 'CA Firm' },
  { value: 'LAW_FIRM', label: 'Law Firm' },
  { value: 'CORPORATE', label: 'Corporate' },
  { value: 'RESOLUTION_APPLICANT', label: 'Resolution Applicant (PRAs)' },
  { value: 'OTHER', label: 'Other Specialised Entity' },
];

const OrganisationProfile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { organisation, loading: orgLoading } = useSelector((state) => state.employer);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [orgData, setOrgData] = useState(null);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      message.error('Logo file size exceeds the 3MB limit. Please upload an image under 3MB.');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadingLogo(true);
      const res = await api.post('/api/upload/company-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const logoUrl = res.data?.data?.logoUrl;
      form.setFieldsValue({ logoUrl });
      message.success('Organisation logo uploaded successfully!');
      fetchOrg();
    } catch (error) {
      console.error('Logo upload failed:', error);
      message.error(error?.response?.data?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
      e.target.value = '';
    }
  };

  const fetchOrg = async () => {
    try {
      setLoading(true);
      const res = await dispatch(fetchOrganisationProfile()).unwrap();
      if (res) {
        setOrgData(res);
        form.setFieldsValue({
          name: res.name,
          logoUrl: res.logoUrl,
          type: res.type || 'IPE',
          description: res.description,
          website: res.website,
          location: res.location
        });
      }
    } catch (error) {
      console.error('Error fetching organisation details:', error);
      message.error('Failed to load organisation profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrg();
  }, [dispatch]);

  const handleSave = async (values) => {
    try {
      setSaving(true);
      const res = await dispatch(updateOrganisationProfile(values)).unwrap();
      message.success('Organisation profile updated successfully!');
      setOrgData(res);
    } catch (error) {
      message.error(typeof error === 'string' ? error : 'Failed to update organisation details');
    } finally {
      setSaving(false);
    }
  };

  const currentValues = Form.useWatch([], form) || {};

  return (
    <div className="portal-w-full">
      {/* Navigation Breadcrumb / Header */}
        <div className="portal-page-header-row portal-mb-32">
          <div>
            <div className="portal-flex-center-gap-8 portal-mb-6">
              <Link to="/employer" className="portal-text-link portal-text-13 font-medium">
                ← Back to Employer Dashboard
              </Link>
            </div>
            <h1 className="portal-text-28 font-bold portal-text-heading m-0">
              Organisation Profile & Branding
            </h1>
            <p className="portal-text-muted-sm mt-4 m-0">
              Manage your company information, insolvency credentials, and branding visible to candidates.
            </p>
          </div>

          {orgData?.id && (
            <Link to={`/companies/${orgData.id}`} target="_blank">
              <Button 
                icon={<EyeOutlined />} 
                className="portal-btn-cyan-soft"
              >
                View Public Profile ↗
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div className="portal-loading-container portal-py-80">
            <Spin size="large" />
          </div>
        ) : (
          <div className="portal-org-profile-layout">
            
            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="portal-glass-card portal-p-32"
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                <div className="portal-flex-center-gap-20 portal-mb-24 flex-wrap">
                  <Avatar
                    size={72}
                    icon={<BankOutlined />}
                    src={getFileUrl(currentValues.logoUrl || orgData?.logoUrl)}
                    className="portal-avatar-cyan"
                  />
                  <div className="portal-flex-col-gap-8 portal-flex-1 min-w-240">
                    <div className="portal-flex-center-gap-10">
                      <label
                        className={`portal-btn-upload-logo ${uploadingLogo ? 'disabled' : ''}`}
                      >
                        <PlusOutlined spin={uploadingLogo} /> {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        <input
                          type="file"
                          accept="image/*"
                          className="portal-display-none"
                          disabled={uploadingLogo}
                          onChange={handleLogoUpload}
                        />
                      </label>
                      {currentValues.logoUrl && (
                        <Button
                          size="small"
                          danger
                          onClick={() => form.setFieldsValue({ logoUrl: '' })}
                          className="portal-rounded-6"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <Divider className="portal-divider-subtle" orientation="left">
                  <span className="portal-text-link portal-text-13 uppercase tracking-wider">
                    Entity Details
                  </span>
                </Divider>

                <Row gutter={20}>
                  <Col xs={24} sm={14}>
                    <Form.Item
                      label={<span className="portal-form-label">Organisation Name</span>}
                      name="name"
                      rules={[{ required: true, message: 'Organisation name is required' }]}
                    >
                      <Input placeholder="e.g. Resolution Advocates & Advisory IPE" className="portal-form-input" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={10}>
                    <Form.Item
                      label={<span className="portal-form-label">Organisation Type</span>}
                      name="type"
                      rules={[{ required: true, message: 'Please select organisation type' }]}
                    >
                      <Select placeholder="Select type">
                        {orgTypes.map(t => (
                          <Option key={t.value} value={t.value}>{t.label}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="portal-form-label">Headquarters / Location</span>}
                      name="location"
                      rules={[{ required: true, message: 'Location is required' }]}
                    >
                      <Input placeholder="e.g. New Delhi, Mumbai, Bengaluru" className="portal-form-input" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span className="portal-form-label">Official Website</span>}
                      name="website"
                    >
                      <Input placeholder="https://www.example.com" className="portal-form-input" />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label={<span className="portal-form-label">About Organisation & Insolvency Practice</span>}
                      name="description"
                    >
                      <TextArea
                        rows={5}
                        placeholder="Describe your organisation, CIRP / liquidation track record, advisory sectors, and team culture..."
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
                  className="portal-btn-primary-compact"
                >
                  Save Profile Details
                </Button>
              </Form>
            </motion.div>

            {/* Live Preview Column */}
            <div className="portal-flex-col-gap-24">
              <div className="portal-glass-card portal-p-28">
                <div className="portal-text-link portal-text-12 font-semibold uppercase portal-mb-16">
                  Live Candidate View Preview
                </div>

                <div className="portal-live-preview-box">
                  <div className="portal-flex-center-gap-16 portal-mb-16">
                    <div className="portal-live-avatar">
                      {currentValues.name ? currentValues.name.substring(0, 2).toUpperCase() : 'CO'}
                    </div>
                    <div>
                      <div className="portal-text-18 font-bold portal-text-heading">
                        {currentValues.name || 'Organisation Name'}
                      </div>
                      <div className="portal-flex-center-gap-8 mt-4">
                        <Tag color="purple" className="portal-tag-badge-rounded font-semibold portal-text-11">
                          {currentValues.type || 'IPE'}
                        </Tag>
                        <span className="portal-text-muted portal-text-13">
                          <EnvironmentOutlined className="mr-4" />
                          {currentValues.location || 'Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="portal-text-detail portal-text-13 leading-relaxed portal-mb-16">
                    {currentValues.description || 'No description provided yet.'}
                  </p>

                  {currentValues.website && (
                    <div className="portal-text-link portal-text-13">
                      <GlobalOutlined className="mr-6" />
                      <a href={currentValues.website} target="_blank" rel="noopener noreferrer" className="portal-text-link">
                        {currentValues.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="portal-live-stats-grid">
                  <div className="portal-live-stat-box">
                    <div className="portal-text-20 font-bold portal-text-heading">
                      {orgData?._count?.jobs || 0}
                    </div>
                    <div className="portal-text-muted-xs">Active Mandates</div>
                  </div>
                  <div className="portal-live-stat-box">
                    <div className="portal-text-20 font-bold portal-text-success">
                      Verified
                    </div>
                    <div className="portal-text-muted-xs">Status</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
  );
};

export default OrganisationProfile;

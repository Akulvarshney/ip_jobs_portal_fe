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
  const [orgData, setOrgData] = useState(null);

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
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
        
        {/* Navigation Breadcrumb / Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Link to="/employer" style={{ color: '#38bdf8', fontSize: '13px', fontWeight: 500 }}>
                ← Back to Employer Dashboard
              </Link>
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>
              Organisation Profile & Branding
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0' }}>
              Manage your company information, insolvency credentials, and branding visible to candidates.
            </p>
          </div>

          {orgData?.id && (
            <Link to={`/companies/${orgData.id}`} target="_blank">
              <Button 
                icon={<EyeOutlined />} 
                style={{ borderRadius: '8px', background: 'rgba(56, 189, 248, 0.1)', borderColor: '#38bdf8', color: '#38bdf8' }}
              >
                View Public Profile ↗
              </Button>
            </Link>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Spin size="large" />
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(0, 1.2fr)', gap: '32px' }}>
            
            {/* Form Column */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="portal-glass-card"
              style={{ padding: '32px' }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                  <Avatar
                    size={72}
                    icon={<BankOutlined />}
                    src={currentValues.logoUrl || orgData?.logoUrl}
                    style={{ backgroundColor: '#a855f7' }}
                  />
                  <div style={{ flex: 1 }}>
                    <Form.Item
                      label={<span style={{ color: '#e2e8f0' }}>Organisation Logo URL</span>}
                      name="logoUrl"
                      style={{ marginBottom: 0 }}
                    >
                      <Input 
                        placeholder="https://example.com/logo.png" 
                        style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} 
                      />
                    </Form.Item>
                  </div>
                </div>

                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} orientation="left">
                  <span style={{ color: '#38bdf8', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Entity Details
                  </span>
                </Divider>

                <Row gutter={20}>
                  <Col xs={24} sm={14}>
                    <Form.Item
                      label={<span style={{ color: '#e2e8f0' }}>Organisation Name</span>}
                      name="name"
                      rules={[{ required: true, message: 'Organisation name is required' }]}
                    >
                      <Input placeholder="e.g. Resolution Advocates & Advisory IPE" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={10}>
                    <Form.Item
                      label={<span style={{ color: '#e2e8f0' }}>Organisation Type</span>}
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
                      label={<span style={{ color: '#e2e8f0' }}>Headquarters / Location</span>}
                      name="location"
                      rules={[{ required: true, message: 'Location is required' }]}
                    >
                      <Input placeholder="e.g. New Delhi, Mumbai, Bengaluru" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item
                      label={<span style={{ color: '#e2e8f0' }}>Official Website</span>}
                      name="website"
                    >
                      <Input placeholder="https://www.example.com" style={{ background: 'rgba(255, 255, 255, 0.05)', color: 'white', borderColor: 'rgba(255, 255, 255, 0.15)' }} />
                    </Form.Item>
                  </Col>

                  <Col xs={24}>
                    <Form.Item
                      label={<span style={{ color: '#e2e8f0' }}>About Organisation & Insolvency Practice</span>}
                      name="description"
                    >
                      <TextArea
                        rows={5}
                        placeholder="Describe your organisation, CIRP / liquidation track record, advisory sectors, and team culture..."
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
                  style={{ background: '#0ea5e9', borderRadius: '8px', height: '40px', padding: '0 28px', marginTop: '12px' }}
                >
                  Save Profile Details
                </Button>
              </Form>
            </motion.div>

            {/* Live Preview Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="portal-glass-card" style={{ padding: '28px' }}>
                <div style={{ color: '#38bdf8', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', marginBottom: '16px' }}>
                  Live Candidate View Preview
                </div>

                <div style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(56, 189, 248, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#a855f7',
                      fontSize: '22px',
                      fontWeight: 700
                    }}>
                      {currentValues.name ? currentValues.name.substring(0, 2).toUpperCase() : 'CO'}
                    </div>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
                        {currentValues.name || 'Organisation Name'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                        <Tag color="purple" style={{ borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                          {currentValues.type || 'IPE'}
                        </Tag>
                        <span style={{ color: '#9ca3af', fontSize: '13px' }}>
                          <EnvironmentOutlined style={{ marginRight: '4px' }} />
                          {currentValues.location || 'Location'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ color: '#cbd5e1', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                    {currentValues.description || 'No description provided yet.'}
                  </p>

                  {currentValues.website && (
                    <div style={{ color: '#38bdf8', fontSize: '13px' }}>
                      <GlobalOutlined style={{ marginRight: '6px' }} />
                      <a href={currentValues.website} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
                        {currentValues.website}
                      </a>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>
                      {orgData?._count?.jobs || 0}
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Active Mandates</div>
                  </div>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '10px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#10b981' }}>
                      Verified
                    </div>
                    <div style={{ fontSize: '12px', color: '#9ca3af' }}>Status</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default OrganisationProfile;

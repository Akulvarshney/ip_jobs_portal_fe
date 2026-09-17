import React from 'react';
import { Typography, Tag, Divider, Row, Col, Breadcrumb, Card } from 'antd';
import { 
  SafetyCertificateOutlined, 
  LockOutlined, 
  CloudServerOutlined, 
  KeyOutlined, 
  AuditOutlined, 
  BugOutlined, 
  CheckCircleFilled, 
  HomeOutlined, 
  SecurityScanOutlined, 
  ApiOutlined 
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

const Security = () => {
  const securityEmail = import.meta.env.VITE_SECURITY_EMAIL || 'security@resolveportal.com';
  const securityFeatures = [
    {
      icon: <LockOutlined style={{ color: '#38bdf8', fontSize: '24px' }} />,
      title: "Data Encryption in Transit & at Rest",
      desc: "All traffic is strictly enforced over TLS 1.3 encryption with modern cipher suites. Database records and stored resumes are encrypted at rest using industry-standard AES-256 encryption."
    },
    {
      icon: <KeyOutlined style={{ color: '#10b981', fontSize: '24px' }} />,
      title: "Secure Authentication & OAuth 2.0",
      desc: "Robust authentication combining Bcrypt password hashing (10 salt rounds), signed JSON Web Tokens (JWT), time-limited OTP verifications, and official Google OAuth 2.0 integration."
    },
    {
      icon: <SafetyCertificateOutlined style={{ color: '#f59e0b', fontSize: '24px' }} />,
      title: "Role-Based Access Control (RBAC)",
      desc: "Strict segregation of duties ensuring candidates, employer recruiters, and platform administrators can only access resources permitted under the principle of least privilege."
    },
    {
      icon: <CloudServerOutlined style={{ color: '#ec4899', fontSize: '24px' }} />,
      title: "Isolated Cloud Database VPC",
      desc: "Hosted on enterprise PostgreSQL instances running inside secure Virtual Private Clouds (VPCs) with automated backups, continuous replication, and zero public port exposure."
    },
    {
      icon: <AuditOutlined style={{ color: '#8b5cf6', fontSize: '24px' }} />,
      title: "Audit Logging & Threat Monitoring",
      desc: "Real-time inspection of API invocations, access anomalies, automated brute-force defenses, and periodic security hygiene reviews."
    },
    {
      icon: <ApiOutlined style={{ color: '#06b6d4', fontSize: '24px' }} />,
      title: "Granular Privacy & Confidentiality",
      desc: "Candidates maintain full control over profile visibility with Confidential and Private modes, preventing unauthorized employer indexing and headhunter scraping."
    }
  ];

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 10 }}>
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { title: <Link to="/" style={{ color: '#9ca3af' }}><HomeOutlined /> Home</Link> },
            { title: <span style={{ color: '#38bdf8' }}>Security</span> },
          ]}
          style={{ marginBottom: '24px' }}
        />

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          style={{ textAlign: 'center', marginBottom: '48px' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '6px 16px', borderRadius: '50px', marginBottom: '16px' }}>
            <SecurityScanOutlined style={{ color: '#38bdf8', fontSize: '16px' }} />
            <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '13px', letterSpacing: '0.5px' }}>TRUST & PLATFORM SECURITY</span>
          </div>

          <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '36px' }}>
            Security at Resolve
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: '16px', marginTop: '12px', maxWidth: '720px', margin: '12px auto 0' }}>
            Protecting insolvency proceedings, corporate claims, and professional credentials with institutional-grade data safeguards.
          </Paragraph>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
            <Tag color="cyan" style={{ padding: '4px 10px', fontSize: '12px' }}><CheckCircleFilled /> TLS 1.3 Transport Security</Tag>
            <Tag color="blue" style={{ padding: '4px 10px', fontSize: '12px' }}><CheckCircleFilled /> AES-256 Storage</Tag>
            <Tag color="geekblue" style={{ padding: '4px 10px', fontSize: '12px' }}><CheckCircleFilled /> Zero Plaintext Passwords</Tag>
            <Tag color="purple" style={{ padding: '4px 10px', fontSize: '12px' }}><CheckCircleFilled /> Google OAuth 2.0</Tag>
          </div>
        </motion.div>

        {/* Security Architecture Grid */}
        <div style={{ marginBottom: '48px' }}>
          <Title level={2} style={{ color: 'white', fontSize: '22px', marginBottom: '20px', textAlign: 'center' }}>
            Defense-in-Depth Architecture
          </Title>

          <Row gutter={[20, 20]}>
            {securityFeatures.map((item, idx) => (
              <Col xs={24} md={12} lg={8} key={idx}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="portal-glass-card"
                  style={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div style={{ background: 'rgba(255, 255, 255, 0.04)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                    {item.icon}
                  </div>
                  <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 700, margin: '0 0 8px' }}>
                    {item.title}
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
                    {item.desc}
                  </p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Responsible Disclosure / Bug Bounty Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="portal-glass-card"
          style={{ 
            padding: '32px', 
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.8) 100%)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '20px'
          }}
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={16}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <BugOutlined style={{ color: '#38bdf8', fontSize: '20px' }} />
                <h3 style={{ color: 'white', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                  Responsible Disclosure & Security Bounty Program
                </h3>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>
                We believe in community-driven security and welcome vulnerability reports from ethical researchers. If you discover a potential security concern across our APIs, web app, or infrastructure, please disclose it to our Security Response Team responsibly.
              </p>
            </Col>
            <Col xs={24} md={8} style={{ textAlign: 'right' }}>
              <a
                href={`mailto:${securityEmail}?subject=Security%20Vulnerability%20Report`}
                className="portal-btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', textDecoration: 'none', borderRadius: '10px', fontSize: '14px' }}
              >
                <BugOutlined /> Report a Vulnerability
              </a>
            </Col>
          </Row>
        </motion.div>

      </div>
    </div>
  );
};

export default Security;

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
      icon: <LockOutlined className="portal-feature-icon-link" />,
      title: "Data Encryption in Transit & at Rest",
      desc: "All traffic is strictly enforced over TLS 1.3 encryption with modern cipher suites. Database records and stored resumes are encrypted at rest using industry-standard AES-256 encryption."
    },
    {
      icon: <KeyOutlined className="portal-feature-icon-emerald" />,
      title: "Secure Authentication & OAuth 2.0",
      desc: "Robust authentication combining Bcrypt password hashing (10 salt rounds), signed JSON Web Tokens (JWT), time-limited OTP verifications, and official Google OAuth 2.0 integration."
    },
    {
      icon: <SafetyCertificateOutlined className="portal-feature-icon-amber" />,
      title: "Role-Based Access Control (RBAC)",
      desc: "Strict segregation of duties ensuring candidates, employer recruiters, and platform administrators can only access resources permitted under the principle of least privilege."
    },
    {
      icon: <CloudServerOutlined className="portal-feature-icon-pink" />,
      title: "Isolated Cloud Database VPC",
      desc: "Hosted on enterprise PostgreSQL instances running inside secure Virtual Private Clouds (VPCs) with automated backups, continuous replication, and zero public port exposure."
    },
    {
      icon: <AuditOutlined className="portal-feature-icon-purple" />,
      title: "Audit Logging & Threat Monitoring",
      desc: "Real-time inspection of API invocations, access anomalies, automated brute-force defenses, and periodic security hygiene reviews."
    },
    {
      icon: <ApiOutlined className="portal-feature-icon-cyan" />,
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

      <div className="portal-static-container-1100">
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { title: <Link to="/" className="portal-text-muted"><HomeOutlined /> Home</Link> },
            { title: <span className="portal-text-link">Security</span> },
          ]}
          className="portal-mb-24"
        />

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="portal-text-center portal-mb-48"
        >
          <div className="portal-auth-badge">
            <SecurityScanOutlined className="portal-text-link portal-text-16" />
            <span className="portal-auth-badge-text">TRUST & PLATFORM SECURITY</span>
          </div>

          <Title level={1} className="portal-auth-title portal-text-36">
            Security at Resolve
          </Title>
          <Paragraph className="portal-hero-para-720">
            Protecting insolvency proceedings, corporate claims, and professional credentials with institutional-grade data safeguards.
          </Paragraph>

          <div className="portal-flex-center-wrap-gap-10 portal-mt-18">
            <Tag color="cyan" className="portal-tag-pill-static"><CheckCircleFilled /> TLS 1.3 Transport Security</Tag>
            <Tag color="blue" className="portal-tag-pill-static"><CheckCircleFilled /> AES-256 Storage</Tag>
            <Tag color="geekblue" className="portal-tag-pill-static"><CheckCircleFilled /> Zero Plaintext Passwords</Tag>
            <Tag color="purple" className="portal-tag-pill-static"><CheckCircleFilled /> Google OAuth 2.0</Tag>
          </div>
        </motion.div>

        {/* Security Architecture Grid */}
        <div className="portal-mb-48">
          <Title level={2} className="portal-section-title-center-22">
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
                  className="portal-glass-card portal-p-24 portal-col-card"
                >
                  <div className="portal-feature-icon-box">
                    {item.icon}
                  </div>
                  <h3 className="portal-feature-box-title">
                    {item.title}
                  </h3>
                  <p className="portal-feature-box-desc">
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
          className="portal-glass-card portal-disclosure-banner"
        >
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={16}>
              <div className="portal-flex-center-gap-10 portal-mb-8">
                <BugOutlined className="portal-text-link portal-text-20" />
                <h3 className="portal-text-heading portal-text-20 portal-m-0 portal-fw-700">
                  Responsible Disclosure & Security Bounty Program
                </h3>
              </div>
              <p className="portal-disclosure-desc">
                We believe in community-driven security and welcome vulnerability reports from ethical researchers. If you discover a potential security concern across our APIs, web app, or infrastructure, please disclose it to our Security Response Team responsibly.
              </p>
            </Col>
            <Col xs={24} md={8} className="portal-text-right">
              <a
                href={`mailto:${securityEmail}?subject=Security%20Vulnerability%20Report`}
                className="portal-btn-primary portal-btn-disclosure"
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

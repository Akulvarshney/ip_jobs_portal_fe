import React from 'react';
import { Typography, Tag, Divider, Breadcrumb } from 'antd';
import { 
  SafetyCertificateOutlined, 
  LockOutlined, 
  EyeOutlined, 
  DatabaseOutlined, 
  FileProtectOutlined, 
  AuditOutlined,
  GlobalOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Paragraph } = Typography;

const PrivacyPolicy = () => {
  const lastUpdated = "September 17, 2026";
  const privacyEmail = import.meta.env.VITE_PRIVACY_EMAIL || 'privacy@resolveportal.com';

  const sections = [
    {
      id: "collection",
      icon: <DatabaseOutlined className="portal-legal-icon-link" />,
      title: "1. Information We Collect",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            Resolve Platform collects personal and professional data to deliver verified insolvency, valuation, and legal recruitment services. We collect information through:
          </Paragraph>
          <ul className="portal-legal-list">
            <li><strong className="portal-legal-strong">Account Credentials:</strong> Name, verified email address, hashed passwords, and OAuth identifiers (Google OAuth UID).</li>
            <li><strong className="portal-legal-strong">Professional Profiles:</strong> IBBI Registration Numbers, ICAI/ICSI/ICMAI memberships, educational records, employment track record, and uploaded resume PDFs.</li>
            <li><strong className="portal-legal-strong">Employer & Entity Information:</strong> Corporate identity, authorized recruiter credentials, company PAN/GSTIN, and job mandate descriptions.</li>
            <li><strong className="portal-legal-strong">System & Analytics Data:</strong> IP address, device fingerprints, browser telemetry, access timestamps, and session security cookies.</li>
          </ul>
        </>
      )
    },
    {
      id: "usage",
      icon: <EyeOutlined className="portal-legal-icon-emerald" />,
      title: "2. How We Use Your Information",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            Your information is processed strictly for legitimate recruitment, statutory validation, and operational purposes under applicable data privacy frameworks:
          </Paragraph>
          <div className="portal-legal-grid-3">
            <div className="portal-legal-info-card">
              <div className="portal-legal-info-title">Mandate Matching</div>
              <div className="portal-legal-info-desc">Matching certified Insolvency Professionals (IPs) & Valuers with active CIRP and liquidation mandates.</div>
            </div>
            <div className="portal-legal-info-card">
              <div className="portal-legal-info-title portal-legal-icon-emerald">Identity & Credential Verification</div>
              <div className="portal-legal-info-desc">Validating statutory regulatory status against public directories to ensure professional authenticity.</div>
            </div>
            <div className="portal-legal-info-card">
              <div className="portal-legal-info-title portal-legal-icon-amber">Security & Fraud Prevention</div>
              <div className="portal-legal-info-desc">Detecting suspicious authentication attempts, preventing unauthorized account takeover, and maintaining audit trails.</div>
            </div>
          </div>
        </>
      )
    },
    {
      id: "privacy-controls",
      icon: <LockOutlined className="portal-legal-icon-amber" />,
      title: "3. Candidate Privacy & Discovery Controls",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            We empower professionals with granular profile visibility options configured directly in your Candidate Settings:
          </Paragraph>
          <ul className="portal-legal-list">
            <li><strong className="portal-legal-strong">Public Mode:</strong> Profile and resume are discoverable by verified hiring entities, IPEs, and banks.</li>
            <li><strong className="portal-legal-strong">Confidential Mode:</strong> Your name and current employer remain masked until you explicitly consent to an employer's mandate invitation.</li>
            <li><strong className="portal-legal-strong">Private Mode:</strong> Profile is completely hidden from recruiter searches and only visible when you submit an application directly.</li>
          </ul>
        </>
      )
    },
    {
      id: "sharing",
      icon: <FileProtectOutlined className="portal-legal-icon-pink" />,
      title: "4. Information Sharing & Third Parties",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            Resolve does not sell, rent, or trade your personal data to third-party advertising networks. We only share information with:
          </Paragraph>
          <ul className="portal-legal-list">
            <li><strong className="portal-legal-strong">Authorized Employers:</strong> When you apply for a job or accept an interview schedule.</li>
            <li><strong className="portal-legal-strong">Infrastructure Providers:</strong> Encrypted hosting and mail transport providers (e.g., PostgreSQL Cloud DB, Nodemailer SMTP, Google Cloud OAuth).</li>
            <li><strong className="portal-legal-strong">Regulatory Authorities:</strong> Where legally mandated under the Insolvency and Bankruptcy Code (IBC) 2016 or judicial orders.</li>
          </ul>
        </>
      )
    },
    {
      id: "compliance",
      icon: <AuditOutlined className="portal-legal-icon-purple" />,
      title: "5. Data Protection Rights (DPDP Act & GDPR)",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            In accordance with India’s Digital Personal Data Protection (DPDP) Act 2023 and global privacy standards, you maintain the right to:
          </Paragraph>
          <div className="portal-legal-tags-row">
            <Tag color="blue" className="portal-legal-tag-item">Right to Access Data</Tag>
            <Tag color="cyan" className="portal-legal-tag-item">Right to Rectification</Tag>
            <Tag color="green" className="portal-legal-tag-item">Right to Erasure (Right to be Forgotten)</Tag>
            <Tag color="purple" className="portal-legal-tag-item">Right to Data Portability</Tag>
            <Tag color="magenta" className="portal-legal-tag-item">Right to Withdraw Consent</Tag>
          </div>
        </>
      )
    },
    {
      id: "contact",
      icon: <GlobalOutlined className="portal-legal-icon-cyan" />,
      title: "6. Data Protection Officer & Inquiries",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            For privacy inquiries, data subject access requests, or regulatory questions, please contact our designated Data Protection Officer (DPO):
          </Paragraph>
          <div className="portal-legal-contact-box">
            <div className="portal-legal-contact-title">Privacy & Compliance Desk</div>
            <div className="portal-legal-contact-line">Email: <a href={`mailto:${privacyEmail}`} className="portal-legal-contact-link">{privacyEmail}</a></div>
            <div className="portal-legal-contact-sub">Resolve Platform Technologies Pvt. Ltd., Level 12, Cyber City, Gurugram, India</div>
          </div>
        </>
      )
    }
  ];

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
      </div>

      <div className="portal-static-container-960">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { title: <Link to="/" className="portal-color-muted"><HomeOutlined /> Home</Link> },
            { title: <span className="portal-color-link">Privacy Policy</span> },
          ]}
          className="portal-mb-24"
        />

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          className="portal-legal-hero"
        >
          <div className="portal-legal-hero-badge">
            <SafetyCertificateOutlined className="portal-legal-hero-badge-icon" />
            <span className="portal-legal-hero-badge-text">LEGAL & DATA PROTECTION</span>
          </div>

          <Title level={1} className="portal-legal-hero-title">
            Privacy Policy
          </Title>
          <Paragraph className="portal-legal-hero-desc">
            Learn how Resolve Platform protects, processes, and respects the confidential data of insolvency professionals, registered valuers, and hiring organizations.
          </Paragraph>
          <div className="portal-legal-hero-tags">
            <Tag color="cyan">Last Updated: {lastUpdated}</Tag>
            <Tag color="blue">DPDP Act 2023 Compliant</Tag>
            <Tag color="geekblue">ISO 27001 Aligned</Tag>
          </div>
        </motion.div>

        {/* Single Unified Container Box */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="portal-glass-card portal-legal-card-p36"
        >
          {sections.map((sec, idx) => (
            <div key={sec.id}>
              <div className="portal-legal-section-header">
                <div className="portal-legal-icon-box">
                  {sec.icon}
                </div>
                <Title level={3} className="portal-legal-section-title">
                  {sec.title}
                </Title>
              </div>

              <div className={idx === sections.length - 1 ? '' : 'portal-mb-28'}>
                {sec.content}
              </div>

              {idx < sections.length - 1 && (
                <Divider className="portal-legal-divider" />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

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
  CheckCircleFilled,
  HomeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

const PrivacyPolicy = () => {
  const lastUpdated = "September 17, 2026";
  const privacyEmail = import.meta.env.VITE_PRIVACY_EMAIL || 'privacy@resolveportal.com';

  const sections = [
    {
      id: "collection",
      icon: <DatabaseOutlined style={{ color: '#38bdf8' }} />,
      title: "1. Information We Collect",
      content: (
        <>
          <Paragraph style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.8 }}>
            Resolve Platform collects personal and professional data to deliver verified insolvency, valuation, and legal recruitment services. We collect information through:
          </Paragraph>
          <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li><strong style={{ color: '#f8fafc' }}>Account Credentials:</strong> Name, verified email address, hashed passwords, and OAuth identifiers (Google OAuth UID).</li>
            <li><strong style={{ color: '#f8fafc' }}>Professional Profiles:</strong> IBBI Registration Numbers, ICAI/ICSI/ICMAI memberships, educational records, employment track record, and uploaded resume PDFs.</li>
            <li><strong style={{ color: '#f8fafc' }}>Employer & Entity Information:</strong> Corporate identity, authorized recruiter credentials, company PAN/GSTIN, and job mandate descriptions.</li>
            <li><strong style={{ color: '#f8fafc' }}>System & Analytics Data:</strong> IP address, device fingerprints, browser telemetry, access timestamps, and session security cookies.</li>
          </ul>
        </>
      )
    },
    {
      id: "usage",
      icon: <EyeOutlined style={{ color: '#10b981' }} />,
      title: "2. How We Use Your Information",
      content: (
        <>
          <Paragraph style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.8 }}>
            Your information is processed strictly for legitimate recruitment, statutory validation, and operational purposes under applicable data privacy frameworks:
          </Paragraph>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '14px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>Mandate Matching</div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>Matching certified Insolvency Professionals (IPs) & Valuers with active CIRP and liquidation mandates.</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '6px' }}>Identity & Credential Verification</div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>Validating statutory regulatory status against public directories to ensure professional authenticity.</div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '6px' }}>Security & Fraud Prevention</div>
              <div style={{ color: '#94a3b8', fontSize: '13px' }}>Detecting suspicious authentication attempts, preventing unauthorized account takeover, and maintaining audit trails.</div>
            </div>
          </div>
        </>
      )
    },
    {
      id: "privacy-controls",
      icon: <LockOutlined style={{ color: '#f59e0b' }} />,
      title: "3. Candidate Privacy & Discovery Controls",
      content: (
        <>
          <Paragraph style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.8 }}>
            We empower professionals with granular profile visibility options configured directly in your Candidate Settings:
          </Paragraph>
          <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li><strong style={{ color: '#f8fafc' }}>Public Mode:</strong> Profile and resume are discoverable by verified hiring entities, IPEs, and banks.</li>
            <li><strong style={{ color: '#f8fafc' }}>Confidential Mode:</strong> Your name and current employer remain masked until you explicitly consent to an employer's mandate invitation.</li>
            <li><strong style={{ color: '#f8fafc' }}>Private Mode:</strong> Profile is completely hidden from recruiter searches and only visible when you submit an application directly.</li>
          </ul>
        </>
      )
    },
    {
      id: "sharing",
      icon: <FileProtectOutlined style={{ color: '#ec4899' }} />,
      title: "4. Information Sharing & Third Parties",
      content: (
        <>
          <Paragraph style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.8 }}>
            Resolve does not sell, rent, or trade your personal data to third-party advertising networks. We only share information with:
          </Paragraph>
          <ul style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li><strong style={{ color: '#f8fafc' }}>Authorized Employers:</strong> When you apply for a job or accept an interview schedule.</li>
            <li><strong style={{ color: '#f8fafc' }}>Infrastructure Providers:</strong> Encrypted hosting and mail transport providers (e.g., PostgreSQL Cloud DB, Nodemailer SMTP, Google Cloud OAuth).</li>
            <li><strong style={{ color: '#f8fafc' }}>Regulatory Authorities:</strong> Where legally mandated under the Insolvency and Bankruptcy Code (IBC) 2016 or judicial orders.</li>
          </ul>
        </>
      )
    },
    {
      id: "compliance",
      icon: <AuditOutlined style={{ color: '#8b5cf6' }} />,
      title: "5. Data Protection Rights (DPDP Act & GDPR)",
      content: (
        <>
          <Paragraph style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.8 }}>
            In accordance with India’s Digital Personal Data Protection (DPDP) Act 2023 and global privacy standards, you maintain the right to:
          </Paragraph>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
            <Tag color="blue" style={{ padding: '6px 12px', borderRadius: '8px' }}>Right to Access Data</Tag>
            <Tag color="cyan" style={{ padding: '6px 12px', borderRadius: '8px' }}>Right to Rectification</Tag>
            <Tag color="green" style={{ padding: '6px 12px', borderRadius: '8px' }}>Right to Erasure (Right to be Forgotten)</Tag>
            <Tag color="purple" style={{ padding: '6px 12px', borderRadius: '8px' }}>Right to Data Portability</Tag>
            <Tag color="magenta" style={{ padding: '6px 12px', borderRadius: '8px' }}>Right to Withdraw Consent</Tag>
          </div>
        </>
      )
    },
    {
      id: "contact",
      icon: <GlobalOutlined style={{ color: '#06b6d4' }} />,
      title: "6. Data Protection Officer & Inquiries",
      content: (
        <>
          <Paragraph style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: 1.8 }}>
            For privacy inquiries, data subject access requests, or regulatory questions, please contact our designated Data Protection Officer (DPO):
          </Paragraph>
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '16px 20px', borderRadius: '12px' }}>
            <div style={{ color: '#38bdf8', fontWeight: 600 }}>Privacy & Compliance Desk</div>
            <div style={{ color: '#f8fafc', fontSize: '14px', marginTop: '4px' }}>Email: <a href={`mailto:${privacyEmail}`} style={{ color: '#38bdf8' }}>{privacyEmail}</a></div>
            <div style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>Resolve Platform Technologies Pvt. Ltd., Level 12, Cyber City, Gurugram, India</div>
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

      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 10 }}>
        
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { title: <Link to="/" style={{ color: '#9ca3af' }}><HomeOutlined /> Home</Link> },
            { title: <span style={{ color: '#38bdf8' }}>Privacy Policy</span> },
          ]}
          style={{ marginBottom: '24px' }}
        />

        {/* Hero Header */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.3 }}
          style={{ marginBottom: '32px', textAlign: 'center' }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.25)', padding: '6px 16px', borderRadius: '50px', marginBottom: '12px' }}>
            <SafetyCertificateOutlined style={{ color: '#38bdf8', fontSize: '15px' }} />
            <span style={{ color: '#38bdf8', fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px' }}>LEGAL & DATA PROTECTION</span>
          </div>

          <Title level={1} style={{ color: 'white', margin: 0, fontWeight: 800, fontSize: '34px' }}>
            Privacy Policy
          </Title>
          <Paragraph style={{ color: '#94a3b8', fontSize: '15px', marginTop: '8px', maxWidth: '720px', margin: '8px auto 0' }}>
            Learn how Resolve Platform protects, processes, and respects the confidential data of insolvency professionals, registered valuers, and hiring organizations.
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
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
          className="portal-glass-card"
          style={{ padding: '36px 40px' }}
        >
          {sections.map((sec, idx) => (
            <div key={sec.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '20px', background: 'rgba(255, 255, 255, 0.05)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  {sec.icon}
                </div>
                <Title level={3} style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 700 }}>
                  {sec.title}
                </Title>
              </div>

              <div style={{ marginBottom: idx === sections.length - 1 ? '0' : '28px' }}>
                {sec.content}
              </div>

              {idx < sections.length - 1 && (
                <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '28px 0' }} />
              )}
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;

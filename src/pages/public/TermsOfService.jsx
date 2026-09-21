import React from 'react';
import { Typography, Tag, Divider, Breadcrumb } from 'antd';
import { 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  BankOutlined, 
  SafetyOutlined, 
  AuditOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const { Title, Paragraph, Text } = Typography;

const TermsOfService = () => {
  const lastUpdated = "September 17, 2026";
  const legalEmail = import.meta.env.VITE_LEGAL_EMAIL || 'legal@resolveportal.com';
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@resolveportal.com';

  const sections = [
    {
      id: "acceptance",
      icon: <FileTextOutlined style={{ color: 'var(--theme-link)' }} />,
      title: "1. Acceptance of Terms",
      content: (
        <Paragraph style={{ color: 'var(--theme-detail)', fontSize: '15px', lineHeight: 1.8 }}>
          By creating an account, browsing listings, submitting applications, or publishing mandates on <strong>Resolve Portal</strong>, you agree to be bound by these Terms of Service. If you are accepting on behalf of an Insolvency Professional Entity (IPE), Asset Reconstruction Company (ARC), Financial Institution, or Law Firm, you represent that you possess the requisite legal authority to bind said entity.
        </Paragraph>
      )
    },
    {
      id: "eligibility",
      icon: <CheckCircleOutlined style={{ color: '#10b981' }} />,
      title: "2. Eligibility & Statutory Verification",
      content: (
        <>
          <Paragraph style={{ color: 'var(--theme-detail)', fontSize: '15px', lineHeight: 1.8 }}>
            Resolve is a specialized professional network for corporate turnaround, stressed debt, valuation, and legal practitioners. All users agree to maintain accurate credentials:
          </Paragraph>
          <ul style={{ color: 'var(--theme-subtle)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li><strong style={{ color: 'var(--theme-text)' }}>Insolvency Professionals (IPs):</strong> Must hold valid registration with the Insolvency and Bankruptcy Board of India (IBBI) and active membership with an Insolvency Professional Agency (IPA).</li>
            <li><strong style={{ color: 'var(--theme-text)' }}>Registered Valuers (RVs):</strong> Must hold valid registration under the Companies (Registered Valuers and Valuation) Rules, 2017.</li>
            <li><strong style={{ color: 'var(--theme-text)' }}>Hiring Entities:</strong> Must represent legitimate corporate bodies, ARCs, banks, resolution applicants, or advisory firms with statutory standing.</li>
          </ul>
        </>
      )
    },
    {
      id: "employer-rules",
      icon: <BankOutlined style={{ color: '#f59e0b' }} />,
      title: "3. Employer & Recruiter Obligations",
      content: (
        <>
          <Paragraph style={{ color: 'var(--theme-detail)', fontSize: '15px', lineHeight: 1.8 }}>
            Employers publishing job mandates or assigning CIRP / liquidation advisory roles must adhere to the following standards:
          </Paragraph>
          <ul style={{ color: 'var(--theme-subtle)', fontSize: '14px', lineHeight: 1.8, paddingLeft: '20px' }}>
            <li>Post only bona fide, active career opportunities or mandate assignments.</li>
            <li>Do not request unlawful candidate fees, security deposits, or non-refundable application charges.</li>
            <li>Maintain confidentiality regarding candidate resumes, non-public valuations, and corporate claims.</li>
            <li>Comply with equal opportunity standards and non-discrimination mandates.</li>
          </ul>
        </>
      )
    },
    {
      id: "candidate-rules",
      icon: <SafetyOutlined style={{ color: '#ec4899' }} />,
      title: "4. Candidate Representations & Code of Conduct",
      content: (
        <>
          <Paragraph style={{ color: 'var(--theme-detail)', fontSize: '15px', lineHeight: 1.8 }}>
            Candidate users warrant that all information submitted in their profiles, education, certifications, and experience track record is accurate, genuine, and uninflated.
          </Paragraph>
          <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', padding: '16px', borderRadius: '12px', marginTop: '12px' }}>
            <div style={{ color: 'var(--theme-danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ExclamationCircleOutlined /> Prohibition on Misrepresentation
            </div>
            <div style={{ color: 'var(--theme-detail)', fontSize: '13px', marginTop: '4px' }}>
              Falsifying IBBI registration numbers, Section 29A eligibility declarations, or experience mandates will result in immediate permanent suspension and referral to regulatory authorities.
            </div>
          </div>
        </>
      )
    },
    {
      id: "ip-rights",
      icon: <AuditOutlined style={{ color: '#8b5cf6' }} />,
      title: "5. Intellectual Property & Portal Access",
      content: (
        <Paragraph style={{ color: 'var(--theme-detail)', fontSize: '15px', lineHeight: 1.8 }}>
          All software, UI design components, proprietary algorithms, database schemas, and branding elements associated with Resolve Portal are the exclusive intellectual property of Resolve Platform Technologies Pvt. Ltd. Scraping, harvesting recruiter databases, automated bot indexing, or reverse engineering of APIs is strictly prohibited.
        </Paragraph>
      )
    },
    {
      id: "jurisdiction",
      icon: <FileTextOutlined style={{ color: '#06b6d4' }} />,
      title: "6. Limitation of Liability & Governing Law",
      content: (
        <>
          <Paragraph style={{ color: 'var(--theme-detail)', fontSize: '15px', lineHeight: 1.8 }}>
            Resolve serves as an enabling technological facilitator and matching infrastructure. We do not guarantee employment outcomes or act as a legal guarantor for insolvency assignments.
          </Paragraph>
          <Paragraph style={{ color: 'var(--theme-subtle)', fontSize: '14px', lineHeight: 1.8 }}>
            These Terms are governed by and construed under the laws of the Republic of India. Any disputes arising out of portal usage shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
          </Paragraph>
        </>
      )
    },
    {
      id: "contact",
      icon: <FileTextOutlined style={{ color: '#f59e0b' }} />,
      title: "7. Inquiries & Legal Counsel Contact",
      content: (
        <>
          <Paragraph style={{ color: 'var(--theme-detail)', fontSize: '15px', lineHeight: 1.8 }}>
            For contractual questions, bilateral enterprise agreements, or support inquiries regarding these terms, please contact:
          </Paragraph>
          <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)', padding: '16px 20px', borderRadius: '12px' }}>
            <div style={{ color: 'var(--theme-link)', fontWeight: 600 }}>Legal & Support Desk</div>
            <div style={{ color: 'var(--theme-text)', fontSize: '14px', marginTop: '4px' }}>Legal Inquiries: <a href={`mailto:${legalEmail}`} style={{ color: 'var(--theme-link)' }}>{legalEmail}</a></div>
            <div style={{ color: 'var(--theme-text)', fontSize: '14px', marginTop: '4px' }}>General Support: <a href={`mailto:${supportEmail}`} style={{ color: 'var(--theme-link)' }}>{supportEmail}</a></div>
            <div style={{ color: 'var(--theme-subtle)', fontSize: '13px', marginTop: '4px' }}>Resolve Platform Technologies Pvt. Ltd., Level 12, Cyber City, Gurugram, India</div>
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
            { title: <Link to="/" style={{ color: 'var(--theme-muted)' }}><HomeOutlined /> Home</Link> },
            { title: <span style={{ color: 'var(--theme-link)' }}>Terms of Service</span> },
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
            <FileTextOutlined style={{ color: 'var(--theme-link)', fontSize: '15px' }} />
            <span style={{ color: 'var(--theme-link)', fontWeight: 600, fontSize: '12px', letterSpacing: '0.5px' }}>PLATFORM TERMS & CONDITIONS</span>
          </div>

          <Title level={1} style={{ color: 'var(--theme-heading)', margin: 0, fontWeight: 800, fontSize: '34px' }}>
            Terms of Service
          </Title>
          <Paragraph style={{ color: 'var(--theme-subtle)', fontSize: '15px', marginTop: '8px', maxWidth: '720px', margin: '8px auto 0' }}>
            The operational framework, rights, and regulatory responsibilities governing practitioners and hiring institutions across Resolve Portal.
          </Paragraph>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '14px', flexWrap: 'wrap' }}>
            <Tag color="cyan">Last Updated: {lastUpdated}</Tag>
            <Tag color="blue">IBC & IBBI Code Aligned</Tag>
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
                <div style={{ fontSize: '20px', background: 'rgba(var(--theme-contrast-rgb), 0.05)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                  {sec.icon}
                </div>
                <Title level={3} style={{ color: 'var(--theme-heading)', margin: 0, fontSize: '20px', fontWeight: 700 }}>
                  {sec.title}
                </Title>
              </div>

              <div style={{ marginBottom: idx === sections.length - 1 ? '0' : '28px' }}>
                {sec.content}
              </div>

              {idx < sections.length - 1 && (
                <Divider style={{ borderColor: 'rgba(var(--theme-contrast-rgb), 0.08)', margin: '28px 0' }} />
              )}
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default TermsOfService;

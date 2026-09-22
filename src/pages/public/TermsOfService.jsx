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

const { Title, Paragraph } = Typography;

const TermsOfService = () => {
  const lastUpdated = "September 17, 2026";
  const legalEmail = import.meta.env.VITE_LEGAL_EMAIL || 'legal@resolveportal.com';
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@resolveportal.com';

  const sections = [
    {
      id: "acceptance",
      icon: <FileTextOutlined className="portal-legal-icon-link" />,
      title: "1. Acceptance of Terms",
      content: (
        <Paragraph className="portal-legal-paragraph">
          By creating an account, browsing listings, submitting applications, or publishing mandates on <strong className="portal-legal-strong">Resolve Portal</strong>, you agree to be bound by these Terms of Service. If you are accepting on behalf of an Insolvency Professional Entity (IPE), Asset Reconstruction Company (ARC), Financial Institution, or Law Firm, you represent that you possess the requisite legal authority to bind said entity.
        </Paragraph>
      )
    },
    {
      id: "eligibility",
      icon: <CheckCircleOutlined className="portal-legal-icon-emerald" />,
      title: "2. Eligibility & Statutory Verification",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            Resolve is a specialized professional network for corporate turnaround, stressed debt, valuation, and legal practitioners. All users agree to maintain accurate credentials:
          </Paragraph>
          <ul className="portal-legal-list">
            <li><strong className="portal-legal-strong">Insolvency Professionals (IPs):</strong> Must hold valid registration with the Insolvency and Bankruptcy Board of India (IBBI) and active membership with an Insolvency Professional Agency (IPA).</li>
            <li><strong className="portal-legal-strong">Registered Valuers (RVs):</strong> Must hold valid registration under the Companies (Registered Valuers and Valuation) Rules, 2017.</li>
            <li><strong className="portal-legal-strong">Hiring Entities:</strong> Must represent legitimate corporate bodies, ARCs, banks, resolution applicants, or advisory firms with statutory standing.</li>
          </ul>
        </>
      )
    },
    {
      id: "employer-rules",
      icon: <BankOutlined className="portal-legal-icon-amber" />,
      title: "3. Employer & Recruiter Obligations",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            Employers publishing job mandates or assigning CIRP / liquidation advisory roles must adhere to the following standards:
          </Paragraph>
          <ul className="portal-legal-list">
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
      icon: <SafetyOutlined className="portal-legal-icon-pink" />,
      title: "4. Candidate Representations & Code of Conduct",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            Candidate users warrant that all information submitted in their profiles, education, certifications, and experience track record is accurate, genuine, and uninflated.
          </Paragraph>
          <div className="portal-legal-warning-box">
            <div className="portal-legal-warning-title">
              <ExclamationCircleOutlined /> Prohibition on Misrepresentation
            </div>
            <div className="portal-legal-warning-desc">
              Falsifying IBBI registration numbers, Section 29A eligibility declarations, or experience mandates will result in immediate permanent suspension and referral to regulatory authorities.
            </div>
          </div>
        </>
      )
    },
    {
      id: "ip-rights",
      icon: <AuditOutlined className="portal-legal-icon-purple" />,
      title: "5. Intellectual Property & Portal Access",
      content: (
        <Paragraph className="portal-legal-paragraph">
          All software, UI design components, proprietary algorithms, database schemas, and branding elements associated with Resolve Portal are the exclusive intellectual property of Resolve Platform Technologies Pvt. Ltd. Scraping, harvesting recruiter databases, automated bot indexing, or reverse engineering of APIs is strictly prohibited.
        </Paragraph>
      )
    },
    {
      id: "jurisdiction",
      icon: <FileTextOutlined className="portal-legal-icon-cyan" />,
      title: "6. Limitation of Liability & Governing Law",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            Resolve serves as an enabling technological facilitator and matching infrastructure. We do not guarantee employment outcomes or act as a legal guarantor for insolvency assignments.
          </Paragraph>
          <Paragraph className="portal-legal-paragraph portal-color-subtle portal-fs-14">
            These Terms are governed by and construed under the laws of the Republic of India. Any disputes arising out of portal usage shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
          </Paragraph>
        </>
      )
    },
    {
      id: "contact",
      icon: <FileTextOutlined className="portal-legal-icon-amber" />,
      title: "7. Inquiries & Legal Counsel Contact",
      content: (
        <>
          <Paragraph className="portal-legal-paragraph">
            For contractual questions, bilateral enterprise agreements, or support inquiries regarding these terms, please contact:
          </Paragraph>
          <div className="portal-legal-contact-box">
            <div className="portal-legal-contact-title">Legal & Support Desk</div>
            <div className="portal-legal-contact-line">Legal Inquiries: <a href={`mailto:${legalEmail}`} className="portal-legal-contact-link">{legalEmail}</a></div>
            <div className="portal-legal-contact-line">General Support: <a href={`mailto:${supportEmail}`} className="portal-legal-contact-link">{supportEmail}</a></div>
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
            { title: <span className="portal-color-link">Terms of Service</span> },
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
            <FileTextOutlined className="portal-legal-hero-badge-icon" />
            <span className="portal-legal-hero-badge-text">PLATFORM TERMS & CONDITIONS</span>
          </div>

          <Title level={1} className="portal-legal-hero-title">
            Terms of Service
          </Title>
          <Paragraph className="portal-legal-hero-desc">
            The operational framework, rights, and regulatory responsibilities governing practitioners and hiring institutions across Resolve Portal.
          </Paragraph>
          <div className="portal-legal-hero-tags">
            <Tag color="cyan">Last Updated: {lastUpdated}</Tag>
            <Tag color="blue">IBC & IBBI Code Aligned</Tag>
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

export default TermsOfService;

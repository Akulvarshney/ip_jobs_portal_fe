import React, { useState, useEffect, useMemo } from 'react';
import { getFileUrl } from '../utils/fileUrl';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllJobs } from '../store/jobsSlice';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SearchOutlined,
  ArrowRightOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  BankOutlined,
  UserSwitchOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { getSalaryRangeLabel } from '../utils/jobType';

const sampleJobs = [
  {
    id: 'sample-1',
    title: 'Resolution Professional (CIRP)',
    employer: { name: 'Apex ARC Ltd.', location: 'Mumbai, MH (On-site)' },
    location: 'Mumbai, MH (On-site)',
    salary: '₹24L - ₹36L',
    type: 'Full-time',
    description: 'Lead Corporate Insolvency Resolution Processes (CIRP) for MSME clients. Manage CoC meetings, claim verifications, and resolution plan evaluations.',
    requirements: 'IBBI Registered Insolvency Professional, 10+ years experience, CA/Law background.',
    tags: ['CIRP', 'IBBI Registered', 'Mumbai', 'CA'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-2',
    title: 'Legal Head - Restructuring & IBC',
    employer: { name: 'Vanguard NBFC', location: 'Delhi, NCR (Hybrid)' },
    location: 'Delhi, NCR (Hybrid)',
    salary: '₹30L - ₹45L',
    type: 'Full-time',
    description: 'Oversee all NCLT litigation and restructuring portfolios. Coordinate with resolution professionals and external counsels for recovery strategies.',
    requirements: 'LLB/LLM, 8+ years in banking litigation, deep expertise in IBC 2016.',
    tags: ['Legal', 'NCLT', 'IBC', 'Litigation'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-3',
    title: 'Senior Associate - Liquidations',
    employer: { name: 'Resolv Consultancy Services', location: 'Bengaluru, KA (Remote)' },
    location: 'Bengaluru, KA (Remote)',
    salary: '₹15L - ₹22L',
    type: 'Full-time',
    description: 'Handle liquidation process compliance, e-auctions of corporate debtor assets, and stakeholder distributions under IBC regulations.',
    requirements: 'CS/CA, 3+ years experience assisting in liquidations or CIRP.',
    tags: ['Liquidation', 'CS', 'CA', 'E-auction'],
    createdAt: new Date().toISOString()
  },
  {
    id: 'sample-4',
    title: 'Financial Analyst - Restructuring',
    employer: { name: 'KPMG India', location: 'Pune, MH (Hybrid)' },
    location: 'Pune, MH (Hybrid)',
    salary: '₹12L - ₹18L',
    type: 'Full-time',
    description: 'Prepare information memorandums, financial models, and evaluation matrix for prospective resolution applicants.',
    requirements: 'CA/CFA, strong financial modeling skills, understanding of distressed assets.',
    tags: ['CA', 'Financial Modeling', 'Big 4', 'Restructuring'],
    createdAt: new Date().toISOString()
  }
];

const DOMAINS = ['All', 'CIRP', 'Liquidation', 'Legal & NCLT', 'Financial Restructuring'];

const getRelativeTime = (dateString) => {
  const diffTime = Math.abs(new Date() - new Date(dateString));
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

const Home = () => {
  const [activeDomain, setActiveDomain] = useState('All');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobsList } = useSelector((state) => state.jobs);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllJobs());
  }, [dispatch]);

  const displayJobs = Array.isArray(jobsList) && jobsList.length > 0 ? jobsList : sampleJobs;

  const filteredJobs = useMemo(() => {
    if (activeDomain === 'All') return displayJobs.slice(0, 4);
    return displayJobs.filter(job => {
      const tagLower = activeDomain.toLowerCase();
      return (
        job.title?.toLowerCase().includes(tagLower) ||
        job.description?.toLowerCase().includes(tagLower) ||
        (job.tags && job.tags.some(t => t.toLowerCase().includes(tagLower))) ||
        (job.skills && job.skills.some(s => (s.skill?.name || s.name || '').toLowerCase().includes(tagLower)))
      );
    }).slice(0, 4);
  }, [displayJobs, activeDomain]);

  return (
    <div className="portal-page-wrapper">
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
        <div className="portal-bg-blob-3"></div>
      </div>

      <div className="portal-home-container">
        
        {/* HERO SPLIT SECTION */}
        <div className="portal-hero-split">
          
          <motion.div 
            initial={{ opacity: 0, x: -40 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <div className="portal-hero-badge-v2">
               <SafetyCertificateOutlined /> India's Premium IBC Network
            </div>
            
            <h1 className="portal-hero-title-v2">
              Specialized roles for <br />
              <span className="portal-text-gradient">
                Restructuring Experts.
              </span>
            </h1>
            
            <p className="portal-hero-subtitle-v2">
              Bypass generic job boards. Connect directly with top NBFCs, ARCs, and Resolution Applicants looking for verified insolvency and legal professionals.
            </p>

            <div className="portal-domain-filter-wrapper">
              <div className="portal-domain-filter-header">
                Explore by Domain
              </div>
              <div className="portal-domain-filter-list">
                {DOMAINS.map(domain => (
                  <button
                    key={domain}
                    onClick={() => setActiveDomain(domain)}
                    className={`portal-domain-btn ${activeDomain === domain ? 'active' : ''}`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* DYNAMIC JOB PREVIEW */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
            className="portal-dynamic-preview-wrapper"
          >
            <div className="portal-preview-bg-glow" />
            
            <div className="portal-preview-list">
              <AnimatePresence mode="popLayout">
                {filteredJobs.length > 0 ? filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="portal-preview-card"
                  >
                    <div className="portal-preview-card-header">
                      <div className="portal-preview-card-company">
                        <div className="portal-preview-card-avatar">
                          {job.employer?.logoUrl ? <img src={getFileUrl(job.employer?.logoUrl)} alt="logo" /> : (job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : "CO")}
                        </div>
                        <div>
                          <h3 className="portal-preview-card-title">{job.title}</h3>
                          <div className="portal-preview-card-subtitle">{job.employer?.name || 'Verified Entity'}</div>
                        </div>
                      </div>
                      <div className="portal-preview-card-salary">
                        <DollarOutlined /> {job.salaryRange ? getSalaryRangeLabel(job.salaryRange) : (job.salary || 'Competitive')}
                      </div>
                    </div>
                    
                    <div className="portal-preview-card-meta">
                       <span className="portal-preview-card-meta-item"><EnvironmentOutlined className="portal-preview-card-meta-icon" /> {job.employer?.location || job.location}</span>
                       <span className="portal-preview-card-meta-item"><ClockCircleOutlined className="portal-preview-card-meta-icon" /> {getRelativeTime(job.createdAt)}</span>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="portal-preview-empty"
                  >
                    No featured jobs found for this domain right now.
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                layout
                onClick={() => navigate('/candidate/jobs')}
                className="portal-view-all-btn"
              >
                View all opportunities <ArrowRightOutlined />
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* VALUE PROPOSITION SCROLL STORY */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="portal-value-prop-section"
        >
          <div className="portal-value-prop-header">
            <h2 className="portal-value-prop-title">Designed for the IBC Ecosystem</h2>
            <p className="portal-value-prop-subtitle">
              We've stripped away the noise of generic job boards to focus entirely on precision, verification, and direct connections.
            </p>
          </div>

          <div className="portal-value-prop-grid">
            {[
              { icon: <SafetyCertificateOutlined style={{ fontSize: '24px', color: '#10b981' }}/>, title: "IBBI Verification", desc: "Profiles are cross-referenced with public registers to ensure credentials for Insolvency Professionals." },
              { icon: <SearchOutlined style={{ fontSize: '24px', color: '#0ea5e9' }}/>, title: "AI-Powered Matching", desc: "Vector search matches exact experience, ticket sizes, and IBC expertise so you don't sift through irrelevant roles." },
              { icon: <TeamOutlined style={{ fontSize: '24px', color: '#8b5cf6' }}/>, title: "Direct Entity Invites", desc: "Top financial institutions can securely review profiles and issue direct Special Invites for immediate hiring." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="portal-value-prop-card"
              >
                <div className="portal-value-prop-icon">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="portal-value-prop-card-title">{feature.title}</h3>
                  <p className="portal-value-prop-card-desc">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* DUAL CTA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="portal-dual-cta-v2"
        >
          <div className="portal-cta-box portal-cta-professional">
            <div className="portal-cta-top-border portal-cta-top-border-blue" />
            <div className="portal-cta-icon-wrapper">
              <UserSwitchOutlined style={{ fontSize: '36px', color: '#0ea5e9' }} />
            </div>
            <h3 className="portal-cta-title-v2">For Professionals</h3>
            <p className="portal-cta-desc-v2">
              Build your verified profile, browse high-paying roles, and receive direct interview invites from ARCs and Banks.
            </p>
            <button 
              onClick={() => navigate(isAuthenticated ? '/candidate' : '/login')}
              className="portal-btn-primary"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Create Account'} <ArrowRightOutlined />
            </button>
          </div>
          
          <div className="portal-cta-box portal-cta-entity">
            <div className="portal-cta-top-border portal-cta-top-border-purple" />
            <div className="portal-cta-icon-wrapper">
              <BankOutlined style={{ fontSize: '36px', color: '#8b5cf6' }} />
            </div>
            <h3 className="portal-cta-title-v2">For Entities</h3>
            <p className="portal-cta-desc-v2">
              Post open positions, leverage our AI to shortlist verified experts, and send direct special invitations.
            </p>
            <button 
              onClick={() => navigate(isAuthenticated ? '/employer' : '/login')}
              className="portal-btn-secondary"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Post a Job'} <ArrowRightOutlined />
            </button>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default Home;


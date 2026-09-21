import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllJobs } from '../store/jobsSlice';
import { motion } from 'framer-motion';
import { 
  SearchOutlined, 
  RocketOutlined, 
  ThunderboltOutlined, 
  SafetyCertificateOutlined, 
  TeamOutlined, 
  ArrowRightOutlined,
  EnvironmentOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  UserSwitchOutlined,
  BankOutlined
} from '@ant-design/icons';
import { Tag, Button } from 'antd';

const sampleJobs = [
  {
    id: 'sample-1',
    title: 'Resolution Professional (CIRP)',
    employer: { name: 'Apex ARC Ltd.' },
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
    employer: { name: 'Vanguard NBFC' },
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
    employer: { name: 'Resolv Consultancy Services' },
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
    employer: { name: 'KPMG India' },
    location: 'Pune, MH (Hybrid)',
    salary: '₹12L - ₹18L',
    type: 'Full-time',
    description: 'Prepare information memorandums, financial models, and evaluation matrix for prospective resolution applicants.',
    requirements: 'CA/CFA, strong financial modeling skills, understanding of distressed assets.',
    tags: ['CA', 'Financial Modeling', 'Big 4', 'Restructuring'],
    createdAt: new Date().toISOString()
  }
];

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
};

const Home = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilterTag, setActiveFilterTag] = useState('All');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { jobsList } = useSelector((state) => state.jobs);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchAllJobs());
  }, [dispatch]);

  const displayJobs = Array.isArray(jobsList) && jobsList.length > 0 ? jobsList : sampleJobs;

  const filteredJobs = displayJobs.filter((job) => {
    const searchLower = searchTerm.toLowerCase().trim();
    const tagLower = activeFilterTag.toLowerCase().trim();

    const matchesSearch = !searchLower || 
      job.title?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.requirements?.toLowerCase().includes(searchLower) ||
      (job.employer?.name && job.employer.name.toLowerCase().includes(searchLower)) ||
      (job.employer?.location && job.employer.location.toLowerCase().includes(searchLower)) ||
      (job.tags && job.tags.some(t => t.toLowerCase().includes(searchLower))) ||
      (job.skills && job.skills.some(s => (s.skill?.name || s.name || '').toLowerCase().includes(searchLower)));

    const matchesTag = !activeFilterTag || tagLower === 'all' || 
      job.title?.toLowerCase().includes(tagLower) || 
      job.requirements?.toLowerCase().includes(tagLower) || 
      job.description?.toLowerCase().includes(tagLower) ||
      (job.employer?.type && job.employer.type.toLowerCase().includes(tagLower)) ||
      (job.tags && job.tags.some(t => t.toLowerCase().includes(tagLower))) ||
      (job.skills && job.skills.some(s => (s.skill?.name || s.name || '').toLowerCase().includes(tagLower)));

    return matchesSearch && matchesTag;
  });

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const query = searchTerm.trim();
    if (query) {
      navigate(`/jobs?keyword=${encodeURIComponent(query)}`);
    } else {
      navigate('/jobs');
    }
  };

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  return (
    <div className="portal-page-wrapper">
      {/* Background Animated Ambient Glowing Mesh */}
      <div className="portal-bg-glow">
        <div className="portal-bg-blob-1"></div>
        <div className="portal-bg-blob-2"></div>
        <div className="portal-bg-blob-3"></div>
      </div>

      {/* Hero Section */}
      <motion.section 
        className="portal-hero"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="portal-hero-badge">
          <ThunderboltOutlined style={{ color: 'var(--theme-link)' }} />
          <span>India's #1 Portal for IBC & Restructuring Professionals</span>
        </div>

        <h1 className="portal-hero-title">
          Connect Your Expertise to <br />
          <span className="portal-hero-title-gradient">Top Financial Institutions</span>
        </h1>

        <p className="portal-hero-subtitle">
          Discover high-impact roles for Insolvency Professionals, CAs, and Lawyers. Connect directly with NBFCs, ARCs, and top Resolution Applicants.
        </p>

        {/* Live Search Box */}
        <motion.form 
          className="portal-search-box"
          onSubmit={handleSearchSubmit}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 120 }}
        >
          <div className="portal-search-input-wrapper">
            <SearchOutlined style={{ color: 'var(--theme-link)', fontSize: '18px' }} />
            <input 
              type="text" 
              placeholder="Search by role (e.g. Liquidator), skill (e.g. NCLT), or company..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="portal-btn-primary">
            <span>Search Roles</span>
            <ArrowRightOutlined />
          </button>
        </motion.form>

        {/* Popular Tags */}
        <motion.div 
          className="portal-popular-tags"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span>Popular:</span>
          {['All', 'CIRP', 'Liquidation', 'IBBI Registered', 'CA', 'NCLT', 'Legal'].map((tag) => (
            <span 
              key={tag} 
              className={`portal-tag-pill ${activeFilterTag === tag ? 'active' : ''}`}
              style={activeFilterTag === tag ? { background: 'rgba(14, 165, 233, 0.3)', borderColor: '#38bdf8', color: 'var(--theme-heading)' } : {}}
              onClick={() => setActiveFilterTag(tag)}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </motion.section>

      {/* Platform Stats Grid */}
      <section className="portal-stats-grid">
        <div className="portal-stat-card portal-glass-card">
          <div className="portal-stat-number">1,500+</div>
          <div className="portal-stat-label">Active IBC/Legal Roles</div>
        </div>
        <div className="portal-stat-card portal-glass-card">
          <div className="portal-stat-number">300+</div>
          <div className="portal-stat-label">Verified Banks & ARCs</div>
        </div>
        <div className="portal-stat-card portal-glass-card">
          <div className="portal-stat-number">95%</div>
          <div className="portal-stat-label">AI Match Accuracy</div>
        </div>
        <div className="portal-stat-card portal-glass-card">
          <div className="portal-stat-number">4,200+</div>
          <div className="portal-stat-label">Registered Professionals</div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="portal-section">
        <div className="portal-section-header">
          <div>
            <h2 className="portal-section-title">Featured Opportunities</h2>
            <p className="portal-section-subtitle">
              {activeFilterTag !== 'All' 
                ? `Showing opportunities matching "${activeFilterTag}"` 
                : 'Handpicked insolvency, legal, and financial positions available right now'}
            </p>
          </div>
          <button className="portal-btn-secondary" onClick={() => navigate('/jobs')}>
            View All Open Roles
          </button>
        </div>

        {filteredJobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(var(--theme-contrast-rgb),0.02)', borderRadius: '16px', border: '1px solid rgba(var(--theme-contrast-rgb),0.06)' }}>
            <p style={{ color: 'var(--theme-subtle)', fontSize: '16px', margin: '0 0 16px' }}>
              No featured opportunities found matching "{activeFilterTag}".
            </p>
            <Button 
              type="primary" 
              onClick={() => { setActiveFilterTag('All'); setSearchTerm(''); }}
              style={{ background: '#0ea5e9', borderColor: '#0ea5e9', borderRadius: '8px', fontWeight: 600 }}
            >
              Show All Opportunities
            </Button>
          </div>
        ) : (
          <div className="portal-jobs-grid">
            {filteredJobs.slice(0, 6).map((job) => (
              <div 
                key={job.id} 
                className="portal-job-card portal-glass-card" 
                style={{ cursor: 'pointer' }}
                onClick={() => handleJobClick(job.id)}
              >
                <div>
                  <div className="portal-job-header">
                    <div className="portal-company-avatar">
                      {job.employer?.name ? job.employer.name.substring(0, 2).toUpperCase() : 'IP'}
                    </div>
                    <span className="portal-job-badge">Verified Listing</span>
                  </div>
                  <h3 className="portal-job-title">{job.title}</h3>
                  <div className="portal-company-name">{job.employer?.name || 'Insolvency Entity'}</div>
                  <p className="portal-job-desc">{job.description}</p>
                  
                  <div className="portal-job-tags">
                    {job.skills && job.skills.length > 0 ? (
                      job.skills.slice(0, 3).map((s, idx) => (
                        <span key={idx} className="portal-job-tag">{s.skill?.name || s.name}</span>
                      ))
                    ) : job.tags && job.tags.length > 0 ? (
                      job.tags.slice(0, 3).map((t, idx) => (
                        <span key={idx} className="portal-job-tag">{t}</span>
                      ))
                    ) : (
                      <>
                        <span className="portal-job-tag">Insolvency</span>
                        {job.employer?.type && <span className="portal-job-tag">{job.employer.type}</span>}
                      </>
                    )}
                  </div>
                </div>

                <div className="portal-job-footer">
                  <div className="portal-job-salary">{job.salary || 'Competitive Mandate'}</div>
                  <button 
                    className="portal-btn-primary" 
                    style={{ padding: '6px 14px', fontSize: '13px' }} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleJobClick(job.id);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Dual Role Call to Action Section */}
      <section className="portal-dual-cta">
        <div className="portal-cta-card portal-cta-card-seeker portal-glass-card">
          <UserSwitchOutlined style={{ fontSize: '36px', color: 'var(--theme-link-soft)', marginBottom: '16px' }} />
          <h3 className="portal-cta-title">For Professionals (IPs/CAs/Lawyers)</h3>
          <p className="portal-cta-desc">
            Build your professional profile, verify your IBBI credentials, browse high-paying roles, and receive direct interview invites from ARCs and Banks.
          </p>
          <button className="portal-btn-primary" onClick={() => navigate(isAuthenticated ? '/candidate' : '/login')}>
            <span>{isAuthenticated ? 'Go to Professional Dashboard' : 'Create Candidate Account'}</span>
            <ArrowRightOutlined />
          </button>
        </div>

        <div className="portal-cta-card portal-cta-card-employer portal-glass-card">
          <BankOutlined style={{ fontSize: '36px', color: '#f0abfc', marginBottom: '16px' }} />
          <h3 className="portal-cta-title">For Entities (ARCs/Banks/NBFCs)</h3>
          <p className="portal-cta-desc">
            Post open positions, leverage our AI to instantly shortlist verified Insolvency Professionals and legal experts, and send special invitations.
          </p>
          <button className="portal-btn-secondary" style={{ borderColor: 'rgba(125, 211, 252, 0.4)' }} onClick={() => navigate(isAuthenticated ? '/employer' : '/login')}>
            <span>{isAuthenticated ? 'Go to Entity Dashboard' : 'Post Your First Job'}</span>
            <ArrowRightOutlined />
          </button>
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="portal-section" id="features">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 className="portal-section-title">Built for the Indian Restructuring Ecosystem</h2>
          <p className="portal-section-subtitle">Experience a streamlined portal designed for precision, compliance, and speed.</p>
        </div>

        <div className="portal-features-grid">
          <div className="portal-feature-card portal-glass-card">
            <div className="portal-feature-icon">
              <ThunderboltOutlined />
            </div>
            <h3 className="portal-feature-title">AI-Powered Matching</h3>
            <p className="portal-feature-desc">
              Our vector search matches exact NCLT bench experience, ticket sizes, and IBC expertise so you don't sift through irrelevant resumes.
            </p>
          </div>

          <div className="portal-feature-card portal-glass-card">
            <div className="portal-feature-icon">
              <SafetyCertificateOutlined />
            </div>
            <h3 className="portal-feature-title">IBBI Verification</h3>
            <p className="portal-feature-desc">
              Profiles are cross-referenced with public registers to ensure AFA validity and credentials for Insolvency Professionals.
            </p>
          </div>

          <div className="portal-feature-card portal-glass-card">
            <div className="portal-feature-icon">
              <TeamOutlined />
            </div>
            <h3 className="portal-feature-title">Direct Entity Invites</h3>
            <p className="portal-feature-desc">
              Top financial institutions can securely review verified professional profiles and issue direct "Special Invites" for immediate hiring.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

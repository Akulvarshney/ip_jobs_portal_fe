import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllJobs } from '../store/jobsSlice';
import '../styles/resolve-home.css';
import CustomCursor from '../components/CustomCursor';
import FullscreenLoader from '../components/FullscreenLoader';

const specialties = ['All', 'CIRP', 'Liquidation', 'Legal', 'Financial'];

const ResolveHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobsList, loading } = useSelector((state) => state.jobs);

  useEffect(() => {
    dispatch(fetchAllJobs());
  }, [dispatch]);

  const reducedMotion = useReducedMotion();
  const [cursorState, setCursorState] = useState({ variant: 'default', label: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [selectedRole, setSelectedRole] = useState(null);
  const drawerRef = useRef(null);
  const setCursor = (variant, label = '') => setCursorState({ variant, label });
  const resetCursor = () => setCursorState({ variant: 'default', label: '' });
  const hover = label => ({ onMouseEnter: () => setCursor('hover', label), onMouseLeave: resetCursor });
  const reveal = (delay = 0) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 48 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: false, amount: 0.25, margin: '0px 0px -48px 0px' },
    transition: { duration: reducedMotion ? 0 : 0.85, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] },
  });
  const filteredRoles = useMemo(() => (jobsList || []).filter(role => {
    const query = searchQuery.trim().toLowerCase();
    const employerName = role.employer?.name || '';
    const locationStr = role.location || '';
    const categoryName = role.category?.name || '';
    return [role.title, employerName, locationStr, categoryName].some(value => value?.toLowerCase().includes(query)) &&
      (activeSpecialty === 'All' || categoryName.includes(activeSpecialty) || (activeSpecialty === 'Financial' && categoryName === 'Finance'));
  }), [searchQuery, activeSpecialty, jobsList]);

  useEffect(() => {
    if (!selectedRole) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector('button')?.focus();
    const handleKey = event => {
      if (event.key === 'Escape') setSelectedRole(null);
      if (event.key === 'Tab') {
        const elements = drawerRef.current?.querySelectorAll('button, a[href]');
        if (!elements?.length) return;
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKey);
      previousFocus?.focus();
    };
  }, [selectedRole]);

  const closeRole = () => { setSelectedRole(null); resetCursor(); };

  if (loading && (!jobsList || jobsList.length === 0)) {
    return <FullscreenLoader />;
  }

  return (
    <div className="resolve-page" onMouseLeave={resetCursor}>
      <CustomCursor cursorState={cursorState} />
      <section className="resolve-hero">
        <div className="resolve-hero-copy">
          <motion.p className="resolve-eyebrow" {...reveal()}><span className="resolve-status-dot" /> A specialist space. A meaningful next step.</motion.p>
          <motion.h1 {...reveal(0.08)}>Where expertise<br />finds <span>its next chapter.</span></motion.h1>
          <motion.p className="resolve-hero-desc" {...reveal(0.16)}>Careers in insolvency, restructuring and finance.<br className="resolve-desktop-break" /> Built around the people who move things forward.</motion.p>
          <motion.div className="resolve-actions" {...reveal(0.24)}>
            <a href="#roles" className="resolve-button" {...hover('EXPLORE')}>Find jobs <ArrowRightOutlined /></a>
            <Link to="/login?mode=signup&role=EMPLOYER" className="resolve-text-link" {...hover('HIRE')}>Post a job <ArrowRightOutlined /></Link>
          </motion.div>
        </div>
        <motion.div className="resolve-art" aria-hidden="true" {...reveal(0.2)}>
          <div className="resolve-art-grid" />
          <div className="resolve-orbit resolve-orbit-one" />
          <div className="resolve-orbit resolve-orbit-two" />
          <div className="resolve-orbit resolve-orbit-three" />
          <div className="resolve-art-center">r<span>.</span></div>
          <span className="resolve-art-label resolve-art-label-top">EXPERTISE</span>
          <span className="resolve-art-label resolve-art-label-bottom">OPPORTUNITY</span>
          <span className="resolve-orbit-dot" />
          <span className="resolve-art-caption">The right people. The right place.</span>
        </motion.div>
        <div className="resolve-hero-foot"><span>FOR INDIA’S INSOLVENCY & RESTRUCTURING COMMUNITY</span><a href="#roles" {...hover('SCROLL')}>Explore opportunities <ArrowDownOutlined /></a></div>
      </section>

      <section id="roles" className="resolve-section resolve-roles-section">
        <motion.div className="resolve-section-heading" {...reveal()}>
          <div><p className="resolve-eyebrow">01 / OPPORTUNITIES</p><h2>Work that moves you.</h2></div>
          {/* <p>A glimpse of what your next chapter could look like.<br /><span className="resolve-sample-note">Illustrative roles · Applications are not open for these listings.</span></p> */}
        </motion.div>
        <motion.div className="resolve-roles-controls" {...reveal(0.08)}>
          <div className="resolve-filters" aria-label="Filter by specialty">
            {specialties.map(spec => <button key={spec} className={`resolve-filter-chip ${activeSpecialty === spec ? 'active' : ''}`} aria-pressed={activeSpecialty === spec} onClick={() => setActiveSpecialty(spec)} {...hover('FILTER')}>{spec}</button>)}
          </div>
          <label className="resolve-roles-search"><SearchOutlined aria-hidden="true" /><input type="search" aria-label="Search open roles, organisations or locations" placeholder="Role, organisation or location" value={searchQuery} onChange={event => setSearchQuery(event.target.value)} {...hover('SEARCH')} /></label>
        </motion.div>
        <div className="resolve-list-caption"><span>EXPLORE OPEN ROLES</span><span role="status">{filteredRoles.length} {filteredRoles.length === 1 ? 'role' : 'roles'}</span></div>
        <motion.div className="resolve-role-list" layout={!reducedMotion}>
          <AnimatePresence mode="popLayout">
            {filteredRoles.map((role, index) => <motion.button layout={!reducedMotion} {...reveal(index * 0.08)} exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.15 } }} key={role.id} className="resolve-role-row" onClick={() => { navigate(`/jobs/${role.id}`); resetCursor(); }} {...hover('VIEW')}>
              <span className="resolve-employer-mark" aria-hidden="true">{(role.employer?.name || 'C').slice(0, 1)}</span>
              <span className="resolve-role-main"><span className="resolve-row-title">{role.title}</span><span className="resolve-row-employer">{role.employer?.name || 'Confidential'}</span></span>
              <span className="resolve-row-meta">{role.location}</span><span className="resolve-role-tag">{role.category?.name || 'General'}</span><span className="resolve-row-arrow"><ArrowRightOutlined /></span>
            </motion.button>)}
          </AnimatePresence>
          {filteredRoles.length === 0 && <div className="resolve-empty-state"><h3>No roles found.</h3><p>Try a different keyword or specialty.</p><button className="resolve-text-link" onClick={() => { setSearchQuery(''); setActiveSpecialty('All'); }} {...hover('CLEAR')}>Clear filters <ArrowRightOutlined /></button></div>}
        </motion.div>
        <motion.div className="resolve-roles-bottom" {...reveal()}><p>Your experience belongs somewhere meaningful.</p><Link to="/jobs" className="resolve-text-link" {...hover('BROWSE')}>Browse the job portal <ArrowRightOutlined /></Link></motion.div>
      </section>

      <section className="resolve-process resolve-section" id="how-it-works">
        <motion.div className="resolve-process-intro" {...reveal()}><p className="resolve-eyebrow">02 / A CLEAR PATH FORWARD</p><h2>Specialist careers.<br /><span>Simple connections.</span></h2><p>Less searching in the wrong places.<br />More space for your next move.</p></motion.div>
        <div className="resolve-steps">
          {[
            ['01', 'Tell your story', 'Create a profile around your experience, qualifications and the work you do best.'],
            ['02', 'Find your fit', 'Explore opportunities across insolvency, legal, finance and restructuring.'],
            ['03', 'Take the next step', 'Apply to relevant roles and follow your applications as they move forward.'],
          ].map(([number, title, description], index) => <motion.div className="resolve-step" key={number} {...reveal(index * 0.08)}><span className="resolve-step-num">{number}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowRightOutlined aria-hidden="true" /></motion.div>)}
        </div>
      </section>

    </div>
  );
};

export default ResolveHome;

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllJobs } from '../store/jobsSlice';
import { getJobTypeLabel } from '../utils/jobType';
import '../styles/resolve-home.css';
import CustomCursor from '../components/CustomCursor';
import FullscreenLoader from '../components/FullscreenLoader';

const specialties = [
  { label: 'All', category: undefined },
  { label: 'Insolvency', category: 'insolvency' },
  { label: 'Restructuring', category: 'restructur' },
  { label: 'Legal', category: 'legal' },
  { label: 'Finance', category: 'finance' },
];

const jobLocation = role => role.locations?.length ? role.locations.join(', ') : role.employer?.location || 'Location to be confirmed';

const ResolveHome = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { jobsList, pagination, loading } = useSelector(state => state.jobs);
  const reducedMotion = useReducedMotion();
  const [cursorState, setCursorState] = useState({ variant: 'default', label: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSpecialty, setActiveSpecialty] = useState('All');
  const [rolesPage, setRolesPage] = useState(1);
  const heroRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => dispatch(fetchAllJobs({ page: rolesPage, pageSize: 4, search: searchQuery.trim() || undefined, category: specialties.find(item => item.label === activeSpecialty)?.category })), searchQuery ? 250 : 0);
    return () => clearTimeout(timer);
  }, [dispatch, rolesPage, searchQuery, activeSpecialty]);

  const setCursor = (variant, label = '') => setCursorState({ variant, label });
  const resetCursor = () => setCursorState({ variant: 'default', label: '' });
  const hover = label => ({ onMouseEnter: () => setCursor('hover', label), onMouseLeave: resetCursor });
  const reveal = (delay = 0) => ({
    initial: reducedMotion ? false : { opacity: 0, y: 36 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.18 },
    transition: { duration: reducedMotion ? 0 : 0.72, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] },
  });

  const visibleRoles = jobsList || [];

  const showLoader = loading && !jobsList?.length;
  useEffect(() => {
    if (showLoader || reducedMotion || !heroRef.current) return;
    let cancelled = false;
    let context;
    Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(([gsapModule, triggerModule]) => {
      if (cancelled || !heroRef.current) return;
      const gsap = gsapModule.default;
      gsap.registerPlugin(triggerModule.ScrollTrigger);
      context = gsap.context(() => {
        gsap.utils.toArray('.resolve-route').forEach((route, index) => {
          const length = route.getTotalLength();
          gsap.set(route, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(route, { strokeDashoffset: 0, duration: 1.65, delay: index * 0.19, ease: 'power2.out' });
        });
        gsap.to('.resolve-route-flow', { strokeDashoffset: -300, duration: 13, repeat: -1, ease: 'none' });
        gsap.to('.resolve-route-field', {
          y: -68, ease: 'none',
          scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.7 },
        });
      }, heroRef);
    });
    return () => { cancelled = true; context?.revert(); };
  }, [showLoader, reducedMotion]);

  if (showLoader) return <FullscreenLoader />;

  return (
    <div className="resolve-page" onMouseLeave={resetCursor}>
      <CustomCursor cursorState={cursorState} />

      <section className="resolve-hero" aria-labelledby="resolve-home-heading" ref={heroRef}>
        <svg className="resolve-route-field" viewBox="0 0 960 760" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <path className="resolve-route-guide" d="M 0 410 H 960 M 240 0 V 760 M 510 0 V 760 M 780 0 V 760" />
          <path className="resolve-route" d="M 960 95 H 670 V 205 H 480 V 410 H 240" />
          <path className="resolve-route" d="M 960 265 H 780 V 338 H 510 V 410 H 240" />
          <path className="resolve-route" d="M 960 670 H 720 V 565 H 535 V 410 H 240" />
          <path className="resolve-route" d="M 960 510 H 835 V 462 H 630 V 410 H 240" />
          <path className="resolve-route-flow" d="M 960 265 H 780 V 338 H 510 V 410 H 240" />
          <rect className="resolve-route-node" x="232" y="402" width="16" height="16" />
          <path className="resolve-route-node-cross" d="M 240 392 V 428 M 222 410 H 258" />
        </svg>
        <div className="resolve-hero-copy">
          <motion.p className="resolve-eyebrow" {...reveal()}><span className="resolve-status-dot" /> THE SPECIALIST CAREERS NETWORK</motion.p>
          <motion.h1 id="resolve-home-heading" {...reveal(0.08)}>The right work.<br /><span>In the right hands.</span></motion.h1>
          <motion.p className="resolve-hero-desc" {...reveal(0.14)}>Find opportunities in insolvency, restructuring, legal and finance, all in one focused place.</motion.p>
          <motion.div className="resolve-actions" {...reveal(0.2)}>
            <a href="#roles" className="resolve-button" {...hover('EXPLORE')}>Find jobs <ArrowRightOutlined /></a>
            <Link to="/organisation/login" className="resolve-text-link" {...hover('HIRE')}>Post a job <ArrowRightOutlined /></Link>
          </motion.div>
        </div>
      </section>

      <section id="roles" className="resolve-section resolve-roles-section" aria-labelledby="resolve-roles-heading">
        <div className="resolve-section-heading">
          <div><motion.p className="resolve-eyebrow" {...reveal()}>OPEN ROLES</motion.p><motion.h2 id="resolve-roles-heading" {...reveal(0.08)}>Find your next move.</motion.h2></div>
        </div>
        <motion.div className="resolve-roles-controls" {...reveal(0.08)}>
          <div className="resolve-filters" aria-label="Filter by specialty">
            {specialties.map(spec => <button type="button" key={spec.label} className={`resolve-filter-chip ${activeSpecialty === spec.label ? 'active' : ''}`} aria-pressed={activeSpecialty === spec.label} onClick={() => { setActiveSpecialty(spec.label); setRolesPage(1); }} {...hover('FILTER')}>{spec.label}</button>)}
          </div>
          <label className="resolve-roles-search"><SearchOutlined aria-hidden="true" /><input type="search" aria-label="Search open roles, organisations or locations" placeholder="Search role, company or city" value={searchQuery} onChange={event => { setSearchQuery(event.target.value); setRolesPage(1); }} {...hover('SEARCH')} /></label>
        </motion.div>
        <div className="resolve-list-caption"><span>RECENT OPPORTUNITIES</span><span role="status">{pagination?.total || 0} {pagination?.total === 1 ? 'role' : 'roles'}</span></div>
        <motion.div className="resolve-role-list" layout={!reducedMotion}>
          <AnimatePresence mode="popLayout">
            {visibleRoles.map((role, index) => <motion.button type="button" layout={!reducedMotion} {...reveal(Math.min(index * 0.06, 0.3))} exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : 0.15 } }} key={role.id} className="resolve-role-row" onClick={() => { navigate(`/jobs/${role.id}`); resetCursor(); }} {...hover('VIEW')}>
              <span className="resolve-employer-mark" aria-hidden="true">{(role.employer?.name || 'R').slice(0, 1)}</span>
              <span className="resolve-role-main"><span className="resolve-row-title">{role.title}</span><span className="resolve-row-employer">{role.employer?.name || 'Confidential organisation'}</span></span>
              <span className="resolve-row-meta">{jobLocation(role)}</span><span className="resolve-role-tag">{getJobTypeLabel(role.jobType)}</span><span className="resolve-row-arrow"><ArrowRightOutlined /></span>
            </motion.button>)}
          </AnimatePresence>
          {visibleRoles.length === 0 && <div className="resolve-empty-state"><h3>No roles match your search.</h3><p>Try another keyword or explore all specialties.</p><button type="button" className="resolve-text-link" onClick={() => { setSearchQuery(''); setActiveSpecialty('All'); setRolesPage(1); }} {...hover('CLEAR')}>Clear filters <ArrowRightOutlined /></button></div>}
        </motion.div>
        {(pagination?.totalPages || 0) > 1 && <div className="resolve-more-roles"><button type="button" className="resolve-text-link" disabled={rolesPage <= 1} onClick={() => setRolesPage(page => page - 1)}>Previous</button><span>Page {rolesPage} of {pagination.totalPages}</span><button type="button" className="resolve-text-link" disabled={rolesPage >= pagination.totalPages} onClick={() => setRolesPage(page => page + 1)}>Next <ArrowRightOutlined /></button></div>}
      </section>

      <section className="resolve-entry resolve-section" aria-labelledby="resolve-entry-heading">
        <div className="resolve-entry-heading"><motion.p className="resolve-eyebrow" {...reveal()}>GET STARTED</motion.p><motion.h2 id="resolve-entry-heading" {...reveal(0.08)}>Choose your path.</motion.h2></div>
        <div className="resolve-entry-options">
          <motion.div {...reveal(0.07)}><span>FOR PROFESSIONALS</span><h3>Find work that fits.</h3><p>Search and track specialist roles.</p><Link to="/candidate/signup" className="resolve-text-link" {...hover('JOIN')}>Create a profile <ArrowRightOutlined /></Link></motion.div>
          <motion.div {...reveal(0.14)}><span>FOR ORGANISATIONS</span><h3>Hire with focus.</h3><p>Post roles and review applicants.</p><Link to="/organisation/login" className="resolve-text-link" {...hover('HIRE')}>Start hiring <ArrowRightOutlined /></Link></motion.div>
        </div>
      </section>
    </div>
  );
};

export default ResolveHome;

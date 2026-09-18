import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Tag, 
  message, 
  Tabs, 
  Card, 
  Row, 
  Col, 
  Tooltip,
  Divider
} from 'antd';
import { 
  CalendarOutlined, 
  VideoCameraOutlined, 
  EnvironmentOutlined, 
  PhoneOutlined, 
  ClockCircleOutlined, 
  UserOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCandidateInterviews } from '../../store/candidateSlice';
import api from '../../api';

const CandidateInterviews = () => {
  const dispatch = useDispatch();
  const { interviews: rawInterviews, loading } = useSelector((state) => state.candidate);
  const interviews = Array.isArray(rawInterviews) ? rawInterviews : (rawInterviews?.data || []);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    dispatch(fetchCandidateInterviews());
  }, [dispatch]);

  const now = new Date();
  const upcomingInterviews = interviews.filter(i => new Date(i.interviewDate) >= now && i.status === 'SCHEDULED');
  const pastInterviews = interviews.filter(i => new Date(i.interviewDate) < now || i.status !== 'SCHEDULED');

  const getInterviewTypeIcon = (type) => {
    switch (type) {
      case 'ONLINE': return <VideoCameraOutlined />;
      case 'PHONE': return <PhoneOutlined />;
      case 'IN_PERSON': return <EnvironmentOutlined />;
      default: return <CalendarOutlined />;
    }
  };

  const renderInterviewCard = (interview) => (
    <motion.div
      key={interview.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="portal-glass-card"
      style={{
        padding: '24px',
        marginBottom: '20px',
        border: '1px solid rgba(234, 179, 8, 0.25)',
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.04) 0%, rgba(30, 41, 59, 0.7) 100%)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>
              {interview.job?.title || 'Mandate Discussion'}
            </span>
            <Tag color="gold" icon={getInterviewTypeIcon(interview.interviewType)} style={{ borderRadius: '6px' }}>
              {interview.interviewType}
            </Tag>
          </div>
          <div style={{ color: '#38bdf8', fontSize: '14px', fontWeight: 500 }}>
            {interview.employer?.name || 'Insolvency Entity'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {interview.meetingLink && (
            <a
              href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                background: '#eab308',
                color: '#0f172a',
                fontWeight: 600,
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '13px'
              }}
            >
              <VideoCameraOutlined /> Join Interview Call
            </a>
          )}
        </div>
      </div>

      <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)', margin: '16px 0' }} />

      <Row gutter={[20, 12]}>
        <Col xs={24} sm={8}>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Date & Schedule</div>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>
            📅 {new Date(interview.interviewDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Time Slot</div>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>
            ⏰ {interview.interviewTime || 'As per meeting link'}
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div style={{ color: '#94a3b8', fontSize: '12px' }}>Interviewer / Panel</div>
          <div style={{ color: 'white', fontSize: '14px', fontWeight: 500, marginTop: '2px' }}>
            👤 {interview.interviewer || 'Hiring Manager / Partner'}
          </div>
        </Col>
      </Row>

      {interview.notes && (
        <div style={{
          marginTop: '16px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          padding: '12px 16px',
          borderRadius: '8px',
          color: '#cbd5e1',
          fontSize: '13px',
          lineHeight: '1.5'
        }}>
          <strong>Instructions / Agenda:</strong> {interview.notes}
        </div>
      )}
    </motion.div>
  );

  const tabItems = [
    {
      key: 'upcoming',
      label: `Upcoming Schedule (${upcomingInterviews.length})`,
      children: (
        <div>
          {upcomingInterviews.map(renderInterviewCard)}
          {upcomingInterviews.length === 0 && !loading && (
            <div className="portal-glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: '48px', color: '#eab308', marginBottom: '16px', opacity: 0.6 }} />
              <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>No upcoming interviews scheduled</h3>
              <p style={{ color: '#9ca3af', marginTop: '8px' }}>
                When employers shortlist your profile and invite you for an interview, the meeting details will appear here.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'past',
      label: `Past / Completed (${pastInterviews.length})`,
      children: (
        <div>
          {pastInterviews.map(renderInterviewCard)}
          {pastInterviews.length === 0 && !loading && (
            <div className="portal-glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <CheckCircleOutlined style={{ fontSize: '48px', color: '#10b981', marginBottom: '16px', opacity: 0.6 }} />
              <h3 style={{ color: 'white', fontSize: '20px', margin: 0 }}>No past interview history</h3>
              <p style={{ color: '#9ca3af', marginTop: '8px' }}>Your completed interview records will be archived here.</p>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: 'white', margin: 0 }}>Interview Schedule</h1>
        <p style={{ color: '#9ca3af', fontSize: '14px', margin: '4px 0 0' }}>
          Direct access to scheduled video meetings, discussion agendas, and interviewer instructions.
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        type="card"
      />
    </div>
  );
};

export default CandidateInterviews;

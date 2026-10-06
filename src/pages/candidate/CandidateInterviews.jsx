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
  Divider,
  Pagination
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
  const { interviews: rawInterviews, pagination, listLoading } = useSelector((state) => state.candidate);
  const interviews = Array.isArray(rawInterviews) ? rawInterviews : (rawInterviews?.data || []);
  const loading = listLoading.interviews;
  const [activeTab, setActiveTab] = useState('upcoming');
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCandidateInterviews({ page, pageSize: 8, period: activeTab }));
  }, [dispatch, page, activeTab]);

  const upcomingInterviews = activeTab === 'upcoming' ? interviews : [];
  const pastInterviews = activeTab === 'past' ? interviews : [];

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
      className="portal-glass-card portal-interview-card"
    >
      <div className="portal-interview-card-header">
        <div>
          <div className="portal-interview-card-title-wrap">
            <span className="portal-interview-card-title">
              {interview.job?.title || 'Job Discussion'}
            </span>
            <Tag color="gold" icon={getInterviewTypeIcon(interview.interviewType)} className="portal-interview-tag">
              {interview.interviewType}
            </Tag>
          </div>
          <div className="portal-interview-employer">
            {interview.employer?.name || 'Insolvency Entity'}
          </div>
        </div>

        <div>
          {interview.meetingLink && (
            <a
              href={interview.meetingLink.startsWith('http') ? interview.meetingLink : `https://${interview.meetingLink}`}
              target="_blank"
              rel="noopener noreferrer"
              className="portal-interview-join-btn"
            >
              <VideoCameraOutlined /> Join Interview Call
            </a>
          )}
        </div>
      </div>

      <Divider className="portal-drawer-divider" />

      <Row gutter={[20, 12]}>
        <Col xs={24} sm={8}>
          <div className="portal-interview-col-label">Date & Schedule</div>
          <div className="portal-interview-col-val">
            📅 {new Date(interview.interviewDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="portal-interview-col-label">Time Slot</div>
          <div className="portal-interview-col-val">
            ⏰ {interview.interviewTime || 'As per meeting link'}
          </div>
        </Col>

        <Col xs={24} sm={8}>
          <div className="portal-interview-col-label">Interviewer / Panel</div>
          <div className="portal-interview-col-val">
            👤 {interview.interviewer || 'Hiring Manager / Partner'}
          </div>
        </Col>
      </Row>

      {interview.notes && (
        <div className="portal-interview-notes-box">
          <strong>Instructions / Agenda:</strong> {interview.notes}
        </div>
      )}
    </motion.div>
  );

  const tabItems = [
    {
      key: 'upcoming',
      label: 'Upcoming Schedule',
      children: (
        <div>
          {upcomingInterviews.map(renderInterviewCard)}
          {upcomingInterviews.length === 0 && !loading && (
            <div className="portal-glass-card portal-empty-state-card">
              <CalendarOutlined className="portal-interview-empty-calendar" />
              <h3 className="portal-empty-state-title">No upcoming interviews scheduled</h3>
              <p className="portal-empty-state-desc">
                When employers shortlist your profile and invite you for an interview, the meeting details will appear here.
              </p>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'past',
      label: 'Past / Completed',
      children: (
        <div>
          {pastInterviews.map(renderInterviewCard)}
          {pastInterviews.length === 0 && !loading && (
            <div className="portal-glass-card portal-empty-state-card">
              <CheckCircleOutlined className="portal-empty-state-icon" />
              <h3 className="portal-empty-state-title">No past interview history</h3>
              <p className="portal-empty-state-desc">Your completed interview records will be archived here.</p>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="portal-page-header">
        <h1 className="portal-page-title">Interview Schedule</h1>
        <p className="portal-page-subtitle">
          Direct access to scheduled video meetings, discussion agendas, and interviewer instructions.
        </p>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={(tab) => { setActiveTab(tab); setPage(1); }}
        items={tabItems}
        type="card"
      />
      {(pagination.interviews?.total || 0) > 8 && (
        <Pagination current={page} pageSize={8} total={pagination.interviews.total} showSizeChanger={false} onChange={setPage} className="portal-list-pagination" />
      )}
    </div>
  );
};

export default CandidateInterviews;

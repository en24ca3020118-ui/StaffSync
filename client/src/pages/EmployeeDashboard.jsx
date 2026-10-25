import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';

const EmployeeDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDashboard = async () => {
    try {
      setError('');
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/attendance/check-in');
      setSuccess('Attendance check-in logged successfully.');
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record check-in');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/attendance/check-out');
      setSuccess('Attendance check-out logged successfully.');
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record check-out');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader message="Loading your workspace..." />;

  const todayAtt = data?.todayAttendance;
  const leaveUsed = data?.leaveUsed || { casual: 0, sick: 0, annual: 0 };
  const totalLeaveUsed = (leaveUsed.casual || 0) + (leaveUsed.sick || 0) + (leaveUsed.annual || 0);

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header Banner */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Welcome, {user?.name}
            </h3>
            <p className="text-secondary mb-0 small">Employee Portal Overview & Daily Activity</p>
          </div>

          {/* Quick Attendance Action */}
          <div className="d-flex align-items-center gap-2">
            {!todayAtt?.checkIn ? (
              <Button variant="primary" className="px-3" onClick={handleCheckIn} disabled={actionLoading}>
                Check In Today
              </Button>
            ) : !todayAtt?.checkOut ? (
              <Button variant="outline-primary" className="px-3" onClick={handleCheckOut} disabled={actionLoading}>
                Check Out
              </Button>
            ) : (
              <span
                className="badge fw-semibold px-3 py-2 rounded-2"
                style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
              >
                Attendance Completed for Today
              </span>
            )}
          </div>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Stat Cards */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <StatCard
              title="Today's Attendance Status"
              value={todayAtt?.checkIn ? (todayAtt?.checkOut ? 'Checked Out' : 'Present') : 'Not Checked In'}
              subtitle={todayAtt?.checkIn ? `Checked in at ${new Date(todayAtt.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Record check-in using the button above'}
              variant={todayAtt?.checkIn ? 'success' : 'secondary'}
            />
          </Col>
          <Col md={4}>
            <StatCard
              title="Annual Leaves Utilized"
              value={`${totalLeaveUsed} / 36`}
              subtitle={`Casual: ${leaveUsed.casual || 0} | Sick: ${leaveUsed.sick || 0} | Annual: ${leaveUsed.annual || 0}`}
              variant="info"
            />
          </Col>
          <Col md={4}>
            <StatCard
              title="Pending Leave Applications"
              value={data?.pendingLeaves ?? 0}
              subtitle="Pending supervisory review"
              variant={data?.pendingLeaves > 0 ? 'warning' : 'primary'}
            />
          </Col>
        </Row>

        {/* Two Column Layout for Announcements & Trainings */}
        <Row className="g-4">
          {/* Latest Announcements */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Company Circulars & Updates</span>
                <Button as={Link} to="/announcements" variant="link" size="sm" className="text-decoration-none small text-primary p-0">
                  View All
                </Button>
              </Card.Header>
              <Card.Body className="p-3">
                {!data?.announcements || data.announcements.length === 0 ? (
                  <div className="text-muted text-center py-4 small">No circulars posted at this time</div>
                ) : (
                  <ListGroup variant="flush">
                    {data.announcements.slice(0, 3).map((ann) => (
                      <ListGroup.Item key={ann._id} className="px-0 py-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold text-dark">{ann.title}</span>
                          <span className="text-muted small">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-secondary small mb-1" style={{ lineHeight: '1.5' }}>{ann.message}</p>
                        <span className="badge bg-light text-muted border" style={{ fontSize: '0.72rem' }}>
                          Issued by {ann.postedBy?.name || 'HR Department'}
                        </span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* My Trainings */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Enrolled Training Programs</span>
                <Button as={Link} to="/training" variant="link" size="sm" className="text-decoration-none small text-primary p-0">
                  Browse All
                </Button>
              </Card.Header>
              <Card.Body className="p-3">
                {!data?.trainings || data.trainings.length === 0 ? (
                  <div className="text-muted text-center py-4 small">No active training enrollments</div>
                ) : (
                  <ListGroup variant="flush">
                    {data.trainings.slice(0, 3).map((tr) => (
                      <ListGroup.Item key={tr._id} className="px-0 py-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold text-dark">{tr.title}</span>
                          <span className="badge bg-light text-secondary border">
                            {new Date(tr.startDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-secondary small mb-2" style={{ lineHeight: '1.5' }}>{tr.description}</p>
                        <div className="d-flex justify-content-between align-items-center small text-muted">
                          <span>Cohort Size: {tr.participants?.length || 0} participants</span>
                          <span>Instructor: {tr.createdBy?.name || 'Manager'}</span>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EmployeeDashboard;

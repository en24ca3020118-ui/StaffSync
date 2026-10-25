import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';

const ManagerDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setError('');
      const res = await api.get('/dashboard');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load manager dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader message="Loading department metrics..." />;

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Management Overview: {user?.name}
            </h3>
            <p className="text-secondary mb-0 small">Supervise direct reports, attendance verification, and review requests</p>
          </div>

          <div className="d-flex gap-2">
            <Button as={Link} to="/leaves" variant="outline-primary" size="sm" className="px-3">
              Review Leaves {data?.pendingLeaves > 0 && `(${data.pendingLeaves})`}
            </Button>
            <Button as={Link} to="/training" variant="primary" size="sm" className="px-3">
              Create Training
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Stat Cards */}
        <Row className="g-3 mb-4">
          <Col md={3} sm={6}>
            <StatCard
              title="Team Size"
              value={data?.teamSize ?? 0}
              subtitle="Assigned direct reports"
              variant="primary"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Turnout Today"
              value={`${data?.presentToday ?? 0} / ${data?.teamSize ?? 0}`}
              subtitle={data?.teamSize > 0 ? `${Math.round(((data?.presentToday || 0) / data.teamSize) * 100)}% attendance rate` : 'No team members'}
              variant="success"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Pending Approvals"
              value={data?.pendingLeaves ?? 0}
              subtitle="Awaiting decision"
              variant={data?.pendingLeaves > 0 ? 'warning' : 'secondary'}
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Active Trainings"
              value={data?.trainings?.length ?? 0}
              subtitle="Managed cohorts"
              variant="info"
            />
          </Col>
        </Row>

        {/* Main Content Sections */}
        <Row className="g-4">
          {/* Quick Management Shortcuts */}
          <Col lg={5}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2">
                <span className="fw-bold text-dark">Supervisory Actions</span>
              </Card.Header>
              <Card.Body className="p-3">
                <div className="d-grid gap-2">
                  <Button as={Link} to="/team" variant="outline-secondary" className="text-start p-3 rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark">Direct Reports Directory</div>
                      <div className="small text-muted" style={{ fontSize: '0.78rem' }}>View profiles and submit quarterly evaluations</div>
                    </div>
                    <span className="text-muted">→</span>
                  </Button>

                  <Button as={Link} to="/attendance" variant="outline-secondary" className="text-start p-3 rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark">Team Attendance Logs</div>
                      <div className="small text-muted" style={{ fontSize: '0.78rem' }}>Inspect daily check-in and check-out timestamps</div>
                    </div>
                    <span className="text-muted">→</span>
                  </Button>

                  <Button as={Link} to="/leaves" variant="outline-secondary" className="text-start p-3 rounded-3 d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-semibold text-dark">Leave Application Decisions</div>
                      <div className="small text-muted" style={{ fontSize: '0.78rem' }}>Approve or reject leave applications with remarks</div>
                    </div>
                    <span className="text-muted">→</span>
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Managed Training Sessions */}
          <Col lg={7}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Department Training Programs</span>
                <Button as={Link} to="/training" variant="link" size="sm" className="text-decoration-none small text-primary p-0">
                  Manage Cohorts
                </Button>
              </Card.Header>
              <Card.Body className="p-3">
                {!data?.trainings || data.trainings.length === 0 ? (
                  <div className="text-center py-5 text-muted small">
                    No active training cohorts created.
                    <div className="mt-2">
                      <Button as={Link} to="/training" variant="primary" size="sm">
                        Create Initial Training
                      </Button>
                    </div>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {data.trainings.map((tr) => (
                      <ListGroup.Item key={tr._id} className="px-0 py-3 border-bottom">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="fw-semibold text-dark">{tr.title}</span>
                          <span className="badge bg-light text-secondary border">
                            {new Date(tr.startDate).toLocaleDateString()} - {new Date(tr.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-secondary small mb-2" style={{ lineHeight: '1.5' }}>{tr.description}</p>
                        <div className="d-flex justify-content-between align-items-center small text-muted">
                          <span>Enrolled Staff: <strong>{tr.participants?.length || 0}</strong></span>
                          <Button as={Link} to="/training" variant="outline-primary" size="sm" className="py-0 px-2" style={{ fontSize: '0.75rem' }}>
                            Edit / Assign
                          </Button>
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

export default ManagerDashboard;

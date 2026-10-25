import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Table, Alert, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import StatCard from '../components/StatCard.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';

const HRDashboard = () => {
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
      setError(err.response?.data?.message || 'Failed to load executive HR dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <Loader message="Compiling executive workforce analytics..." />;

  const totalStaff = (data?.totalEmployees || 0) + (data?.totalManagers || 0);

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              People & Culture Overview: {user?.name}
            </h3>
            <p className="text-secondary mb-0 small">Enterprise workforce management, headcounts, leaves, and attendance verification</p>
          </div>

          <div className="d-flex gap-2">
            <Button as={Link} to="/employees" variant="primary" size="sm" className="px-3">
              Add New Staff
            </Button>
            <Button as={Link} to="/announcements" variant="outline-primary" size="sm" className="px-3">
              Issue Circular
            </Button>
          </div>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Primary Metrics */}
        <Row className="g-3 mb-4">
          <Col md={3} sm={6}>
            <StatCard
              title="Individual Contributors"
              value={data?.totalEmployees ?? 0}
              subtitle="Registered employees"
              variant="primary"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Team Managers"
              value={data?.totalManagers ?? 0}
              subtitle="Department heads & leads"
              variant="info"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Turnout Today"
              value={data?.presentToday ?? 0}
              subtitle={totalStaff > 0 ? `${Math.round(((data?.presentToday || 0) / totalStaff) * 100)}% overall turnout` : 'No staff registered'}
              variant="success"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Monthly Attendance Logs"
              value={data?.attendanceThisMonth ?? 0}
              subtitle="Verified check-ins this month"
              variant="warning"
            />
          </Col>
        </Row>

        {/* Analytics Breakdown & Recent Leaves */}
        <Row className="g-4 mb-4">
          {/* Department Headcount Breakdown */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Staff Distribution by Department</span>
                <span className="badge bg-light text-muted border">
                  {totalStaff} Total Staff
                </span>
              </Card.Header>
              <Card.Body className="p-3">
                {!data?.byDepartment || data.byDepartment.length === 0 ? (
                  <div className="text-muted text-center py-4 small">No department data recorded</div>
                ) : (
                  data.byDepartment.map((dept) => {
                    const pct = totalStaff > 0 ? Math.round((dept.count / totalStaff) * 100) : 0;
                    return (
                      <div key={dept._id || 'General'} className="mb-3">
                        <div className="d-flex justify-content-between small fw-semibold text-secondary mb-1">
                          <span>{dept._id || 'General Operations'}</span>
                          <span>{dept.count} members ({pct}%)</span>
                        </div>
                        <ProgressBar now={pct} style={{ height: '6px', borderRadius: '4px' }} />
                      </div>
                    );
                  })
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Leave Status Breakdown */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Leave Application Statistics</span>
                <Button as={Link} to="/leaves" variant="link" size="sm" className="text-decoration-none small text-primary p-0">
                  Review All
                </Button>
              </Card.Header>
              <Card.Body className="p-3">
                {!data?.leavesByStatus || data.leavesByStatus.length === 0 ? (
                  <div className="text-muted text-center py-4 small">No leave records recorded</div>
                ) : (
                  data.leavesByStatus.map((ls) => {
                    const variant = ls._id === 'approved' ? 'success' : ls._id === 'rejected' ? 'danger' : 'warning';
                    return (
                      <div key={ls._id} className="mb-3">
                        <div className="d-flex justify-content-between small fw-semibold text-capitalize text-secondary mb-1">
                          <span>{ls._id} Applications</span>
                          <span>{ls.count} requests</span>
                        </div>
                        <ProgressBar now={ls.count} max={30} variant={variant} style={{ height: '6px', borderRadius: '4px' }} />
                      </div>
                    );
                  })
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Leave Requests Table */}
        <Card>
          <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center">
            <span className="fw-bold text-dark">Recent Leave Applications</span>
            <Button as={Link} to="/leaves" variant="outline-primary" size="sm">
              All Leave Records
            </Button>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive border-0">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Category</th>
                    <th>Duration</th>
                    <th>Working Days</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.recentLeaves || data.recentLeaves.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted small">
                        No recent leave applications
                      </td>
                    </tr>
                  ) : (
                    data.recentLeaves.map((lv) => (
                      <tr key={lv._id}>
                        <td>
                          <div className="fw-semibold text-dark">{lv.user?.name || 'Staff Member'}</div>
                          <div className="small text-muted" style={{ fontSize: '0.78rem' }}>{lv.user?.email}</div>
                        </td>
                        <td>
                          <StatusBadge status={lv.type} />
                        </td>
                        <td className="small text-secondary">
                          {new Date(lv.startDate).toLocaleDateString()} to {new Date(lv.endDate).toLocaleDateString()}
                        </td>
                        <td className="fw-semibold">{lv.days}</td>
                        <td>
                          <StatusBadge status={lv.status} />
                        </td>
                        <td className="text-end pe-3">
                          <Button as={Link} to="/leaves" variant="outline-primary" size="sm" className="py-0 px-2" style={{ fontSize: '0.8rem' }}>
                            Review
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default HRDashboard;

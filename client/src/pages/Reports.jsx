import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar, Table, Alert, Badge } from 'react-bootstrap';
import api from '../api/axios.js';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';

const Reports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/summary');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) return <Loader message="Generating workforce analytics..." />;

  const totalEmployees = data?.totalEmployees || 0;
  const totalManagers = data?.totalManagers || 0;
  const totalStaff = totalEmployees + totalManagers;
  const turnoutPercent = totalStaff > 0 ? Math.round(((data?.presentToday || 0) / totalStaff) * 100) : 0;

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Workforce Intelligence & Analytical Reports
            </h3>
            <p className="text-secondary mb-0 small">Executive analytics on headcount distribution, paid absence utilization, and attendance consistency</p>
          </div>
          <span className="badge bg-light text-secondary border px-3 py-2">
            Audit Period: {new Date().toLocaleDateString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Top Level Metric Cards */}
        <Row className="g-3 mb-4">
          <Col md={3} sm={6}>
            <StatCard
              title="Total Workforce"
              value={totalStaff}
              subtitle={`${totalEmployees} Staff, ${totalManagers} Managers`}
              variant="primary"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Turnout Today"
              value={data?.presentToday ?? 0}
              subtitle={`${turnoutPercent}% Verified Turnout`}
              variant="success"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Attendance Logs"
              value={data?.attendanceThisMonth ?? 0}
              subtitle="Current calendar month"
              variant="warning"
            />
          </Col>
          <Col md={3} sm={6}>
            <StatCard
              title="Divisions"
              value={data?.byDepartment?.length ?? 0}
              subtitle="Active operational units"
              variant="info"
            />
          </Col>
        </Row>

        {/* Breakdown Cards */}
        <Row className="g-4 mb-4">
          {/* Department Distribution */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2">
                <span className="fw-bold text-dark">Staff Distribution by Department</span>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
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
                        <ProgressBar now={pct} style={{ height: '7px', borderRadius: '4px' }} />
                      </div>
                    );
                  })
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Leave Requests by Status */}
          <Col lg={6}>
            <Card className="h-100">
              <Card.Header className="bg-white border-bottom pt-3 pb-2">
                <span className="fw-bold text-dark">Leave Application Statistics</span>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
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
                        <ProgressBar now={ls.count} max={30} variant={variant} style={{ height: '7px', borderRadius: '4px' }} />
                      </div>
                    );
                  })
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Summary Table */}
        <Card>
          <Card.Header className="bg-white border-bottom pt-3 pb-2">
            <span className="fw-bold text-dark">Department Operational Summary</span>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="table-responsive border-0">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Headcount</th>
                    <th>Workforce Ratio</th>
                    <th className="text-end pe-3">Compliance Status</th>
                  </tr>
                </thead>
                <tbody>
                  {!data?.byDepartment || data.byDepartment.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted small">No department data recorded</td>
                    </tr>
                  ) : (
                    data.byDepartment.map((d) => {
                      const pct = totalStaff > 0 ? Math.round((d.count / totalStaff) * 100) : 0;
                      return (
                        <tr key={d._id || 'General'}>
                          <td className="fw-semibold text-dark">{d._id || 'General Operations'}</td>
                          <td className="fw-semibold">{d.count}</td>
                          <td>{pct}%</td>
                          <td className="text-end pe-3">
                            <span
                              className="badge fw-semibold px-2 py-1"
                              style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                            >
                              Standard
                            </span>
                          </td>
                        </tr>
                      );
                    })
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

export default Reports;

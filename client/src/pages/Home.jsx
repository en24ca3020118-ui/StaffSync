import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Home = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const dashboardPath = user?.role === 'hr' ? '/hr' : user?.role === 'manager' ? '/manager' : '/employee';

  return (
    <div className="py-5 page-container">
      <Container>
        {/* Hero Section */}
        <div className="text-center py-5 bg-white rounded-4 shadow-sm p-4 p-md-5 mb-5 border">
          <span
            className="badge fw-semibold px-3 py-2 rounded-pill mb-3"
            style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
          >
            Enterprise Workforce Platform
          </span>
          <h1 className="display-5 fw-bold text-dark mb-3" style={{ letterSpacing: '-0.03em' }}>
            Workforce Intelligence with <span style={{ color: '#2563eb' }}>Modern HR</span>
          </h1>
          <p className="lead text-secondary mx-auto mb-4" style={{ maxWidth: '620px', fontSize: '1.05rem', lineHeight: '1.7' }}>
            A unified human resource management platform designed for organizational transparency, frictionless attendance tracking, leave governance, and career development.
          </p>

          <div className="d-flex justify-content-center gap-3">
            {isAuthenticated ? (
              <Button as={Link} to={dashboardPath} variant="primary" size="lg" className="px-4 py-2 fw-semibold">
                Go to Workspace
              </Button>
            ) : (
              <>
                <Button as={Link} to="/login" variant="primary" size="lg" className="px-4 py-2 fw-semibold">
                  Sign In
                </Button>
                <Button as={Link} to="/register" variant="outline-primary" size="lg" className="px-4 py-2 fw-semibold">
                  Employee Registration
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Role Highlights */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="h-100 border shadow-sm rounded-4 p-3 card-hover">
              <Card.Body>
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center fw-bold mb-3"
                  style={{ width: '40px', height: '40px', backgroundColor: '#eff6ff', color: '#1d4ed8' }}
                >
                  EMP
                </div>
                <Card.Title className="fw-bold mb-2 text-dark fs-5">Employee Portal</Card.Title>
                <Card.Text className="text-secondary small" style={{ lineHeight: '1.6' }}>
                  Daily time recording, automated leave balances, company-wide announcements, and voluntary workshop enrollment.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 border shadow-sm rounded-4 p-3 card-hover">
              <Card.Body>
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center fw-bold mb-3"
                  style={{ width: '40px', height: '40px', backgroundColor: '#f0fdf4', color: '#15803d' }}
                >
                  MGR
                </div>
                <Card.Title className="fw-bold mb-2 text-dark fs-5">Manager Management</Card.Title>
                <Card.Text className="text-secondary small" style={{ lineHeight: '1.6' }}>
                  Supervise team turnout, adjudicate leave applications, assign technical training courses, and record periodic performance evaluations.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 border shadow-sm rounded-4 p-3 card-hover">
              <Card.Body>
                <div
                  className="rounded-3 d-inline-flex align-items-center justify-content-center fw-bold mb-3"
                  style={{ width: '40px', height: '40px', backgroundColor: '#faf5ff', color: '#7e22ce' }}
                >
                  DIR
                </div>
                <Card.Title className="fw-bold mb-2 text-dark fs-5">HR Administration</Card.Title>
                <Card.Text className="text-secondary small" style={{ lineHeight: '1.6' }}>
                  Staff lifecycle governance, organization-wide leave audits, broadcast circulars, and departmental analytics.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;

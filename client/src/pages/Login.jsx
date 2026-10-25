import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import api from '../api/axios.js';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      dispatch(setCredentials({ user, token }));

      const from = location.state?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'hr') navigate('/hr');
        else if (user.role === 'manager') navigate('/manager');
        else navigate('/employee');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to the backend server. Please make sure the server is running on port 5000 (cd server && npm run dev).');
      } else {
        setError(err.response?.data?.message || 'Invalid email address or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 page-container d-flex align-items-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center text-white fw-bold rounded-3 mb-2"
                style={{
                  width: '42px',
                  height: '42px',
                  backgroundColor: '#2563eb',
                  fontSize: '1.1rem',
                  letterSpacing: '-0.02em'
                }}
              >
                M
              </div>
              <h4 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                Modern <span style={{ color: '#2563eb' }}>HR</span>
              </h4>
              <p className="text-muted small">Enter your corporate credentials to sign in</p>
            </div>

            <Card className="border shadow-sm rounded-4 p-4 bg-white">
              <Card.Body className="p-0">
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label className="small fw-semibold text-secondary">Work Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password">
                    <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Authenticating...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Form>

                <div className="text-center small text-muted pt-2 border-top">
                  Need a staff account?{' '}
                  <Link to="/register" className="text-primary fw-semibold text-decoration-none">
                    Register
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;

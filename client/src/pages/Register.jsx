import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice.js';
import api from '../api/axios.js';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password });
      const { user, token } = res.data;
      dispatch(setCredentials({ user, token }));
      navigate('/employee');
    } catch (err) {
      if (!err.response) {
        setError('Cannot connect to backend server. Please verify the server is running on port 5000 (cd server && npm run dev).');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-5 page-container d-flex align-items-center" style={{ minHeight: 'calc(100vh - 140px)' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5}>
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
              <p className="text-muted small">Create an employee account</p>
            </div>

            <Card className="border shadow-sm rounded-4 p-4 bg-white">
              <Card.Body className="p-0">
                {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="regName">
                    <Form.Label className="small fw-semibold text-secondary">Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="regEmail">
                    <Form.Label className="small fw-semibold text-secondary">Corporate Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@modernhr.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="regPass">
                    <Form.Label className="small fw-semibold text-secondary">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="regPassConfirm">
                    <Form.Label className="small fw-semibold text-secondary">Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100 py-2 fw-semibold mb-3" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Form>

                <div className="text-center small text-muted pt-2 border-top">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                    Sign In
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

export default Register;

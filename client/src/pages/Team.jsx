import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge } from 'react-bootstrap';
import api from '../api/axios.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Performance rating modal
  const [ratingModal, setRatingModal] = useState({
    show: false,
    member: null,
    rating: 5,
    note: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Performance history viewing modal
  const [historyModal, setHistoryModal] = useState({
    show: false,
    member: null
  });

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users/team');
      setTeam(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!ratingModal.member) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const targetUserId = ratingModal.member.user?._id || ratingModal.member.user;
      await api.put(`/users/${targetUserId}/performance`, {
        rating: Number(ratingModal.rating),
        note: ratingModal.note
      });
      setSuccess(`Evaluation submitted for ${ratingModal.member.user?.name}.`);
      setRatingModal({ show: false, member: null, rating: 5, note: '' });
      fetchTeam();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const getAverageRating = (performances) => {
    if (!performances || performances.length === 0) return null;
    const sum = performances.reduce((acc, p) => acc + (p.rating || 0), 0);
    return (sum / performances.length).toFixed(1);
  };

  if (loading && !team.length) return <Loader message="Loading team directory..." />;

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Direct Reports & Performance Governance
            </h3>
            <p className="text-secondary mb-0 small">Supervise assigned staff profiles, communication lines, and periodic evaluations</p>
          </div>
          <span className="badge bg-light text-secondary border px-3 py-2 rounded-2">
            {team.length} Direct Reports
          </span>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Card>
          <Card.Body className="p-0">
            <div className="table-responsive border-0">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Employee ID</th>
                    <th>Role & Department</th>
                    <th>Contact Information</th>
                    <th>Performance Score</th>
                    <th className="text-end pe-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {team.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-5 text-muted small">
                        No team members currently assigned under your direct management hierarchy.
                      </td>
                    </tr>
                  ) : (
                    team.map((emp) => {
                      const avg = getAverageRating(emp.performance);
                      return (
                        <tr key={emp._id}>
                          <td>
                            <div className="fw-semibold text-dark">{emp.user?.name}</div>
                            <div className="small text-muted" style={{ fontSize: '0.78rem' }}>{emp.user?.email}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-primary border">
                              {emp.employeeId || 'MHR-?'}
                            </span>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{emp.designation || 'Staff'}</div>
                            <div className="small text-muted">{emp.department || 'General Operations'}</div>
                          </td>
                          <td className="small text-secondary">
                            <div>{emp.phone || 'No direct phone'}</div>
                            {emp.emergencyContact?.name && (
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Next of Kin: {emp.emergencyContact.name} ({emp.emergencyContact.phone})
                              </div>
                            )}
                          </td>
                          <td>
                            {avg ? (
                              <div className="d-flex align-items-center gap-1">
                                <span
                                  className="badge fw-semibold px-2 py-1"
                                  style={{
                                    backgroundColor: avg >= 4 ? '#ecfdf5' : avg >= 3 ? '#fffbeb' : '#fef2f2',
                                    color: avg >= 4 ? '#047857' : avg >= 3 ? '#b45309' : '#b91c1c',
                                    border: `1px solid ${avg >= 4 ? '#a7f3d0' : avg >= 3 ? '#fde68a' : '#fecaca'}`
                                  }}
                                >
                                  {avg} / 5.0
                                </span>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="p-0 text-decoration-none small text-muted ms-1"
                                  onClick={() => setHistoryModal({ show: true, member: emp })}
                                >
                                  ({emp.performance?.length} entries)
                                </Button>
                              </div>
                            ) : (
                              <span className="small text-muted">No reviews recorded</span>
                            )}
                          </td>
                          <td className="text-end pe-3">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="px-2"
                              onClick={() => setRatingModal({ show: true, member: emp, rating: 5, note: '' })}
                            >
                              Add Review
                            </Button>
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

        {/* Add Rating Modal */}
        <Modal show={ratingModal.show} onHide={() => setRatingModal({ ...ratingModal, show: false })} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              Submit Review: {ratingModal.member?.user?.name}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleRatingSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="perfRating">
                <Form.Label className="small fw-semibold text-secondary">Performance Metric</Form.Label>
                <Form.Select
                  value={ratingModal.rating}
                  onChange={(e) => setRatingModal({ ...ratingModal, rating: e.target.value })}
                  required
                >
                  <option value={5}>5.0 - Exceptional (Consistently Surpasses Objectives)</option>
                  <option value={4}>4.0 - Exceeds Expectations (High Output & Reliable Delivery)</option>
                  <option value={3}>3.0 - Meets Expectations (Satisfies Core Deliverables)</option>
                  <option value={2}>2.0 - Developing (Requires Supervision & Guidance)</option>
                  <option value={1}>1.0 - Needs Immediate Improvement</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-2" controlId="perfNote">
                <Form.Label className="small fw-semibold text-secondary">Manager Feedback & Milestones</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Summarize quarterly output, notable competencies, or growth roadmaps..."
                  value={ratingModal.note}
                  onChange={(e) => setRatingModal({ ...ratingModal, note: e.target.value })}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setRatingModal({ ...ratingModal, show: false })} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Save Evaluation'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* History Reviews Modal */}
        <Modal show={historyModal.show} onHide={() => setHistoryModal({ ...historyModal, show: false })} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              Review History: {historyModal.member?.user?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {!historyModal.member?.performance || historyModal.member.performance.length === 0 ? (
              <div className="text-center py-4 text-muted small">No performance evaluations recorded to date.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {historyModal.member.performance.map((p, idx) => (
                  <div key={idx} className="p-3 border rounded-3 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="badge bg-primary text-white">
                        Rating: {p.rating}.0 / 5.0
                      </span>
                      <span className="small text-muted">{new Date(p.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-dark small mb-1 mt-2" style={{ lineHeight: '1.5' }}>{p.note}</p>
                    <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                      Evaluator: {p.by?.name || 'Manager'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setHistoryModal({ ...historyModal, show: false })}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Team;

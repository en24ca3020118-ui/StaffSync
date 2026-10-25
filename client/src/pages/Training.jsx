import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../components/Loader.jsx';

const Training = () => {
  const { user } = useSelector((state) => state.auth);
  const isManager = user?.role === 'manager';
  const isHR = user?.role === 'hr';

  const [trainings, setTrainings] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manager CRUD modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    participants: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainings');
      setTrainings(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch training programs');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeam = async () => {
    if (isManager) {
      try {
        const res = await api.get('/users/team');
        setTeamMembers(Array.isArray(res.data) ? res.data : []);
      } catch {
        // Ignore
      }
    }
  };

  useEffect(() => {
    fetchTrainings();
    fetchTeam();
  }, [user?.role]);

  const handleEnroll = async (trainingId) => {
    setError('');
    setSuccess('');
    try {
      await api.post(`/trainings/${trainingId}/enroll`);
      setSuccess('Enrolled in training program successfully.');
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll');
    }
  };

  const handleOpenModal = (tr = null) => {
    if (tr) {
      setEditingId(tr._id);
      setFormData({
        title: tr.title,
        description: tr.description,
        startDate: tr.startDate ? new Date(tr.startDate).toISOString().slice(0, 10) : '',
        endDate: tr.endDate ? new Date(tr.endDate).toISOString().slice(0, 10) : '',
        participants: tr.participants?.map((p) => p._id || p) || []
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        participants: []
      });
    }
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (editingId) {
        await api.put(`/trainings/${editingId}`, formData);
        setSuccess('Training syllabus and schedule updated.');
      } else {
        await api.post('/trainings', formData);
        setSuccess('New training program established and invited staff notified.');
      }
      setModalOpen(false);
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save training program');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/trainings/${deleteTarget._id}`);
      setSuccess('Training program archived.');
      setDeleteTarget(null);
      fetchTrainings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete training');
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleParticipant = (userId) => {
    setFormData((prev) => {
      const exists = prev.participants.includes(userId);
      return {
        ...prev,
        participants: exists
          ? prev.participants.filter((id) => id !== userId)
          : [...prev.participants, userId]
      };
    });
  };

  if (loading && !trainings.length) return <Loader message="Loading training registry..." />;

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Training & Professional Development
            </h3>
            <p className="text-secondary mb-0 small">Enterprise skill enrichment workshops, certifications, and technical cohorts</p>
          </div>

          {isManager && (
            <Button variant="primary" className="px-3" onClick={() => handleOpenModal()}>
              Create Cohort
            </Button>
          )}
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Row className="g-4">
          {trainings.length === 0 ? (
            <Col xs={12}>
              <Card className="text-center py-5">
                <Card.Body>
                  <h6 className="fw-bold text-dark">No Active Programs</h6>
                  <p className="text-muted small">Upcoming skill sessions and technical courses will appear here.</p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            trainings.map((tr) => {
              const isEnrolled = tr.participants?.some((p) => (p._id || p) === user?.id);
              const isOwner = tr.createdBy?._id === user?.id || tr.createdBy === user?.id;

              return (
                <Col md={6} lg={4} key={tr._id}>
                  <Card className="h-100 card-hover d-flex flex-column">
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-light text-secondary border">
                          {new Date(tr.startDate).toLocaleDateString()} – {new Date(tr.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <h5 className="fw-bold text-dark mb-2 mt-1" style={{ letterSpacing: '-0.01em' }}>{tr.title}</h5>
                      <p className="text-secondary small mb-3 flex-grow-1" style={{ lineHeight: '1.6' }}>
                        {tr.description}
                      </p>

                      <div className="border-top pt-3 mt-auto">
                        <div className="d-flex justify-content-between align-items-center small text-muted mb-3">
                          <span>Lead: <strong>{tr.createdBy?.name || 'Manager'}</strong></span>
                          <span>Enrolled: <strong>{tr.participants?.length || 0}</strong></span>
                        </div>

                        <div className="d-flex gap-2 justify-content-between align-items-center">
                          {user?.role === 'employee' && (
                            isEnrolled ? (
                              <span
                                className="badge fw-semibold py-2 px-3"
                                style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
                              >
                                Enrolled
                              </span>
                            ) : (
                              <Button variant="outline-primary" size="sm" className="px-3" onClick={() => handleEnroll(tr._id)}>
                                Enroll in Course
                              </Button>
                            )
                          )}

                          {(isOwner || isHR) && (
                            <div className="d-flex gap-1 ms-auto">
                              <Button variant="outline-secondary" size="sm" onClick={() => handleOpenModal(tr)}>
                                Edit
                              </Button>
                              <Button variant="outline-danger" size="sm" onClick={() => setDeleteTarget(tr)}>
                                Archive
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })
          )}
        </Row>

        {/* Manager Add / Edit Modal */}
        <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {editingId ? 'Edit Training Program' : 'Create New Training Program'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFormSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="trTitle">
                <Form.Label className="small fw-semibold text-secondary">Course Title</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Distributed Cloud Systems & Security"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="trDesc">
                <Form.Label className="small fw-semibold text-secondary">Course Description & Outcomes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Course modules, technical requirements, and target competencies..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Form.Group>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Group controlId="trStart">
                    <Form.Label className="small fw-semibold text-secondary">Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="trEnd">
                    <Form.Label className="small fw-semibold text-secondary">End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {teamMembers.length > 0 && (
                <Form.Group className="mb-2">
                  <Form.Label className="small fw-semibold text-secondary d-block">
                    Assign Direct Reports (Dispatches System Notification):
                  </Form.Label>
                  <div className="border rounded-3 p-3 bg-light" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {teamMembers.map((member) => (
                      <Form.Check
                        key={member.user?._id || member._id}
                        type="checkbox"
                        id={`participant-${member.user?._id || member._id}`}
                        label={`${member.user?.name || member.name} — ${member.designation || 'Staff'}`}
                        checked={formData.participants.includes(member.user?._id || member._id)}
                        onChange={() => handleToggleParticipant(member.user?._id || member._id)}
                        className="mb-1 small"
                      />
                    ))}
                  </div>
                </Form.Group>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Program' : 'Publish Course'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          show={!!deleteTarget}
          onHide={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Archive Training"
          message={`Are you sure you want to archive "${deleteTarget?.title}"? Active participants will be unassigned.`}
          confirmText="Archive Course"
          loading={deleting}
        />
      </Container>
    </div>
  );
};

export default Training;

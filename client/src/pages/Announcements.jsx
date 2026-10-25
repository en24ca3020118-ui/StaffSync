import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Modal, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import Pager from '../components/Pager.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../components/Loader.jsx';

const Announcements = () => {
  const { user } = useSelector((state) => state.auth);
  const isHR = user?.role === 'hr';

  const [announcements, setAnnouncements] = useState({ data: [], page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAnnouncements = async (page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/announcements?page=${page}`);
      setAnnouncements(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch circulars');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements(1);
  }, []);

  const handleOpenModal = (ann = null) => {
    if (ann) {
      setEditingId(ann._id);
      setFormData({ title: ann.title, message: ann.message });
    } else {
      setEditingId(null);
      setFormData({ title: '', message: '' });
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
        await api.put(`/announcements/${editingId}`, formData);
        setSuccess('Announcement updated successfully.');
      } else {
        await api.post('/announcements', formData);
        setSuccess('Circular published and staff notified.');
      }
      setModalOpen(false);
      fetchAnnouncements(announcements.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish announcement');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/announcements/${deleteTarget._id}`);
      setSuccess('Announcement circular archived.');
      setDeleteTarget(null);
      fetchAnnouncements(announcements.page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to archive announcement');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !announcements.data.length) return <Loader message="Loading circulars..." />;

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Corporate Circulars & Announcements
            </h3>
            <p className="text-secondary mb-0 small">Official leadership updates, policy amendments, and administrative broadcasts</p>
          </div>

          {isHR && (
            <Button variant="primary" className="px-3" onClick={() => handleOpenModal()}>
              Publish Circular
            </Button>
          )}
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Row className="g-3">
          {!announcements.data || announcements.data.length === 0 ? (
            <Col xs={12}>
              <Card className="text-center py-5">
                <Card.Body>
                  <h6 className="fw-bold text-dark">No Active Circulars</h6>
                  <p className="text-muted small">Company communications will be displayed here as they are published.</p>
                </Card.Body>
              </Card>
            </Col>
          ) : (
            announcements.data.map((ann) => (
              <Col xs={12} key={ann._id}>
                <Card className="p-3 p-md-4 card-hover">
                  <Card.Body className="p-0">
                    <div className="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
                      <div>
                        <h5 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.01em' }}>{ann.title}</h5>
                        <div className="d-flex align-items-center gap-2 small text-muted">
                          <span className="badge bg-light text-secondary border">
                            Issued by {ann.postedBy?.name || 'HR Directorate'}
                          </span>
                          <span>•</span>
                          <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {isHR && (
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="px-2 py-1"
                            onClick={() => handleOpenModal(ann)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="px-2 py-1"
                            onClick={() => setDeleteTarget(ann)}
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>

                    <p className="text-secondary mt-3 mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.92rem' }}>
                      {ann.message}
                    </p>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
        </Row>

        <Pager
          page={announcements.page}
          pages={announcements.pages}
          onPageChange={(p) => fetchAnnouncements(p)}
        />

        {/* Add / Edit Modal */}
        <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {editingId ? 'Edit Circular' : 'New Corporate Announcement'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFormSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="annTitle">
                <Form.Label className="small fw-semibold text-secondary">Announcement Subject</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. Q4 Hybrid Work Policy & Town Hall"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-2" controlId="annMessage">
                <Form.Label className="small fw-semibold text-secondary">Circular Content</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  placeholder="Full text of the announcement..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update Circular' : 'Publish Circular'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          show={!!deleteTarget}
          onHide={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Archive Announcement"
          message={`Are you sure you want to remove "${deleteTarget?.title}" from the staff circular board?`}
          confirmText="Archive Circular"
          loading={deleting}
        />
      </Container>
    </div>
  );
};

export default Announcements;

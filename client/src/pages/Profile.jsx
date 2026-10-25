import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../store/authSlice.js';
import api from '../api/axios.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Loader from '../components/Loader.jsx';

const Profile = () => {
  const { user: authUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    emergencyName: '',
    emergencyPhone: ''
  });

  const [profileMeta, setProfileMeta] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setError('');
        const res = await api.get('/users/profile');
        const { user, employee } = res.data;

        setFormData({
          name: user?.name || '',
          phone: employee?.phone || '',
          address: employee?.address || '',
          emergencyName: employee?.emergencyContact?.name || '',
          emergencyPhone: employee?.emergencyContact?.phone || ''
        });

        setProfileMeta({
          email: user?.email,
          role: user?.role,
          employeeId: employee?.employeeId || 'MHR-Pending',
          department: employee?.department || 'Unassigned',
          designation: employee?.designation || 'Staff',
          joiningDate: employee?.joiningDate ? new Date(employee.joiningDate).toLocaleDateString() : 'N/A',
          manager: employee?.manager ? `${employee.manager.name} (${employee.manager.email})` : 'Executive Level'
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile details');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        emergencyContact: {
          name: formData.emergencyName,
          phone: formData.emergencyPhone
        }
      };

      const res = await api.put('/users/profile', payload);
      setSuccess('Profile information updated successfully.');

      if (res.data?.user?.name) {
        dispatch(updateUser({ name: res.data.user.name }));
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading profile registry..." />;

  return (
    <div className="py-4 page-container">
      <Container>
        <Row className="justify-content-center">
          <Col lg={9}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
                  Personnel Profile Record
                </h3>
                <p className="text-secondary mb-0 small">Verify organizational hierarchy and maintain personal contact details</p>
              </div>
              <StatusBadge status={profileMeta?.role} />
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Read-Only Organizational Information */}
            <Card className="mb-4">
              <Card.Header className="bg-white border-bottom pt-3 pb-2">
                <span className="fw-bold text-dark">Organizational Hierarchy & Identifiers</span>
                <div className="text-muted small" style={{ fontSize: '0.78rem' }}>Maintained directly by HR Administration</div>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Row className="g-3">
                  <Col md={4} sm={6}>
                    <div className="text-muted small fw-semibold">Employee ID</div>
                    <div className="fw-bold text-primary fs-5 mt-1">{profileMeta?.employeeId}</div>
                  </Col>
                  <Col md={4} sm={6}>
                    <div className="text-muted small fw-semibold">Corporate Email</div>
                    <div className="fw-semibold text-dark mt-1">{profileMeta?.email}</div>
                  </Col>
                  <Col md={4} sm={6}>
                    <div className="text-muted small fw-semibold">Department</div>
                    <div className="fw-semibold text-dark mt-1">{profileMeta?.department}</div>
                  </Col>
                  <Col md={4} sm={6}>
                    <div className="text-muted small fw-semibold">Designation</div>
                    <div className="fw-semibold text-dark mt-1">{profileMeta?.designation}</div>
                  </Col>
                  <Col md={4} sm={6}>
                    <div className="text-muted small fw-semibold">Date of Joining</div>
                    <div className="fw-semibold text-dark mt-1">{profileMeta?.joiningDate}</div>
                  </Col>
                  <Col md={4} sm={6}>
                    <div className="text-muted small fw-semibold">Direct Supervisor</div>
                    <div className="fw-semibold text-dark mt-1">{profileMeta?.manager}</div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Editable Personal Contact Information */}
            <Card>
              <Card.Header className="bg-white border-bottom pt-3 pb-2">
                <span className="fw-bold text-dark">Personal Contact Information</span>
                <div className="text-muted small" style={{ fontSize: '0.78rem' }}>Ensure your telephone and emergency numbers remain up to date</div>
              </Card.Header>
              <Card.Body className="p-4 pt-3">
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group controlId="profName">
                        <Form.Label className="small fw-semibold text-secondary">Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="profPhone">
                        <Form.Label className="small fw-semibold text-secondary">Telephone Contact</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="+91 98000 00000"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group controlId="profAddress">
                        <Form.Label className="small fw-semibold text-secondary">Residential Address</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={2}
                          placeholder="Street, City, State, Postal Code"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <h6 className="fw-bold text-dark mt-4 mb-3 border-top pt-3">Emergency Contact</h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group controlId="profEmergName">
                        <Form.Label className="small fw-semibold text-secondary">Contact Name & Relation</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Spouse / Next of Kin"
                          value={formData.emergencyName}
                          onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="profEmergPhone">
                        <Form.Label className="small fw-semibold text-secondary">Emergency Phone</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="+91 98000 00000"
                          value={formData.emergencyPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit" disabled={saving} className="px-4">
                      {saving && <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />}
                      Save Updates
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Profile;

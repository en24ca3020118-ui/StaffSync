import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Modal, Badge } from 'react-bootstrap';
import api from '../api/axios.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Pager from '../components/Pager.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Loader from '../components/Loader.jsx';

const Employees = () => {
  const [employees, setEmployees] = useState({ data: [], page: 1, pages: 1, total: 0 });
  const [managers, setManagers] = useState([]);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    designation: '',
    phone: '',
    manager: '',
    isActive: true
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        search,
        role: roleFilter,
        department: deptFilter
      });
      const res = await api.get(`/users?${params.toString()}`);
      setEmployees(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch staff members');
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      const res = await api.get('/users/managers');
      setManagers(Array.isArray(res.data) ? res.data : []);
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchEmployees(1);
    fetchManagers();
  }, [roleFilter, deptFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEmployees(1);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const u = item.user;
      setEditingUser(u);
      setFormData({
        name: u?.name || '',
        email: u?.email || '',
        password: '',
        role: u?.role || 'employee',
        department: item.department || '',
        designation: item.designation || '',
        phone: item.phone || '',
        manager: item.manager?._id || item.manager || '',
        isActive: u?.isActive !== undefined ? u.isActive : true
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: 'Password@123',
        role: 'employee',
        department: '',
        designation: '',
        phone: '',
        manager: '',
        isActive: true
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
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        setSuccess(`Profile for ${formData.name} updated.`);
      } else {
        await api.post('/users', formData);
        setSuccess(`New staff member ${formData.name} successfully registered.`);
      }
      setModalOpen(false);
      fetchEmployees(employees.page);
      fetchManagers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff record');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const targetUserId = deleteTarget.user?._id || deleteTarget._id;
      await api.delete(`/users/${targetUserId}`);
      setSuccess(`Employee record deleted.`);
      setDeleteTarget(null);
      fetchEmployees(employees.page);
      fetchManagers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setDeleting(false);
    }
  };

  if (loading && !employees.data.length) return <Loader message="Loading directory..." />;

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Staff Directory & Personnel Administration
            </h3>
            <p className="text-secondary mb-0 small">Create staff profiles, assign reporting managers, and maintain departments</p>
          </div>

          <Button variant="primary" className="px-3" onClick={() => handleOpenModal()}>
            Register New Staff
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Filter and Search Bar */}
        <Card className="mb-4 p-3">
          <Form onSubmit={handleSearchSubmit}>
            <Row className="g-2 align-items-center">
              <Col lg={4} md={5}>
                <Form.Control
                  type="text"
                  placeholder="Search by full name or email address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>

              <Col lg={3} sm={6}>
                <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="">All Organizational Roles</option>
                  <option value="employee">Individual Contributors</option>
                  <option value="manager">Department Managers</option>
                  <option value="hr">HR Directors</option>
                </Form.Select>
              </Col>

              <Col lg={3} sm={6}>
                <Form.Select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                  <option value="">All Departments</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales & Growth">Sales & Growth</option>
                </Form.Select>
              </Col>

              <Col lg={2} className="d-grid">
                <Button variant="outline-secondary" type="submit">
                  Search Directory
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Staff Table */}
        <Card>
          <Card.Body className="p-0">
            <div className="table-responsive border-0">
              <Table hover className="align-middle mb-0 text-nowrap">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Employee ID</th>
                    <th>Role</th>
                    <th>Department & Designation</th>
                    <th>Reporting Manager</th>
                    <th>Status</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!employees.data || employees.data.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted small">
                        No staff members match the selected search criteria
                      </td>
                    </tr>
                  ) : (
                    employees.data.map((item) => {
                      const u = item.user;
                      return (
                        <tr key={item._id}>
                          <td>
                            <div className="fw-semibold text-dark">{u?.name}</div>
                            <div className="small text-muted" style={{ fontSize: '0.78rem' }}>{u?.email}</div>
                          </td>
                          <td>
                            <span className="badge bg-light text-primary border">
                              {item.employeeId || 'MHR-?'}
                            </span>
                          </td>
                          <td>
                            <StatusBadge status={u?.role} />
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{item.designation || 'Staff'}</div>
                            <div className="small text-muted">{item.department || 'General'}</div>
                          </td>
                          <td className="small text-secondary">
                            {item.manager ? item.manager.name : <span className="text-muted">—</span>}
                          </td>
                          <td>
                            <StatusBadge status={u?.isActive ? 'active' : 'inactive'} />
                          </td>
                          <td className="text-end pe-3">
                            <div className="d-flex justify-content-end gap-1">
                              <Button
                                variant="outline-secondary"
                                size="sm"
                                className="py-0 px-2"
                                onClick={() => handleOpenModal(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="py-0 px-2"
                                onClick={() => setDeleteTarget(item)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
          <Card.Footer className="bg-white border-top p-3">
            <Pager
              page={employees.page}
              pages={employees.pages}
              onPageChange={(p) => fetchEmployees(p)}
            />
          </Card.Footer>
        </Card>

        {/* Add / Edit Staff Modal */}
        <Modal show={modalOpen} onHide={() => setModalOpen(false)} centered size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">
              {editingUser ? `Edit Record: ${editingUser.name}` : 'Register New Staff Member'}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleFormSubmit}>
            <Modal.Body>
              <Row className="g-3 mb-3">
                <Col md={6}>
                  <Form.Group controlId="staffName">
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
                  <Form.Group controlId="staffEmail">
                    <Form.Label className="small fw-semibold text-secondary">Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="staffPassword">
                    <Form.Label className="small fw-semibold text-secondary">
                      {editingUser ? 'Password (Leave blank to keep unchanged)' : 'Initial Password'}
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="staffRole">
                    <Form.Label className="small fw-semibold text-secondary">Organizational Level</Form.Label>
                    <Form.Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      required
                    >
                      <option value="employee">Individual Contributor (Employee)</option>
                      <option value="manager">Department Manager</option>
                      <option value="hr">HR Directorate</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="staffDept">
                    <Form.Label className="small fw-semibold text-secondary">Department</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Engineering, Sales & Growth"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="staffDesig">
                    <Form.Label className="small fw-semibold text-secondary">Job Designation</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Lead Software Engineer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="staffPhone">
                    <Form.Label className="small fw-semibold text-secondary">Telephone Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="+91 98000 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group controlId="staffMgr">
                    <Form.Label className="small fw-semibold text-secondary">Reporting Manager</Form.Label>
                    <Form.Select
                      value={formData.manager}
                      onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                    >
                      <option value="">Executive Level (Self / None)</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {editingUser && (
                  <Col md={12}>
                    <Form.Check
                      type="checkbox"
                      id="isActiveCheckbox"
                      label="Active Account (Uncheck to revoke portal access)"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="fw-semibold text-secondary small"
                    />
                  </Col>
                )}
              </Row>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingUser ? 'Update Profile' : 'Register Staff'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation */}
        <ConfirmModal
          show={!!deleteTarget}
          onHide={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title="Delete Staff Record"
          message={`Are you sure you want to permanently delete "${deleteTarget?.user?.name}" (${deleteTarget?.user?.email})? This action removes all profile data and records.`}
          confirmText="Delete Record"
          loading={deleting}
        />
      </Container>
    </div>
  );
};

export default Employees;

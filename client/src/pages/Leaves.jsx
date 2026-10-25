import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Modal, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Pager from '../components/Pager.jsx';
import Loader from '../components/Loader.jsx';

const Leaves = () => {
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState('my');
  const [myLeaves, setMyLeaves] = useState([]);
  const [usedBalances, setUsedBalances] = useState({ casual: 0, sick: 0, annual: 0 });
  const [teamLeaves, setTeamLeaves] = useState([]);
  const [allLeaves, setAllLeaves] = useState({ data: [], page: 1, pages: 1 });

  // Apply Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    type: 'casual',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Decision Modal State
  const [decisionModal, setDecisionModal] = useState({
    show: false,
    leave: null,
    status: 'approved',
    comment: ''
  });

  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setMyLeaves(res.data?.leaves || []);
      setUsedBalances(res.data?.used || { casual: 0, sick: 0, annual: 0 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load leave records');
    }
  };

  const fetchTeamLeaves = async (status = '') => {
    try {
      setLoading(true);
      const url = status ? `/leaves/team?status=${status}` : '/leaves/team';
      const res = await api.get(url);
      setTeamLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team leave requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeaves = async (status = '', page = 1) => {
    try {
      setLoading(true);
      const url = `/leaves?status=${status}&page=${page}`;
      const res = await api.get(url);
      setAllLeaves(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load company leave applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchMyLeaves();

      if (user?.role === 'manager') {
        await fetchTeamLeaves();
        setActiveTab('team');
      } else if (user?.role === 'hr') {
        await fetchAllLeaves();
        setActiveTab('all');
      }
      setLoading(false);
    };

    init();
  }, [user?.role]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/leaves', applyForm);
      setSuccess('Leave application submitted for approval.');
      setShowApplyModal(false);
      setApplyForm({ type: 'casual', startDate: '', endDate: '', reason: '' });
      await fetchMyLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecisionSubmit = async () => {
    if (!decisionModal.leave) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.put(`/leaves/${decisionModal.leave._id}/decision`, {
        status: decisionModal.status,
        comment: decisionModal.comment
      });
      setSuccess(`Application marked as ${decisionModal.status}.`);
      setDecisionModal({ show: false, leave: null, status: 'approved', comment: '' });

      if (activeTab === 'team') fetchTeamLeaves(statusFilter);
      if (activeTab === 'all') fetchAllLeaves(statusFilter, allLeaves.page);
      fetchMyLeaves();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !myLeaves.length && !teamLeaves.length && !allLeaves.data.length) {
    return <Loader message="Loading leave records..." />;
  }

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Leave Management & Paid Time Off
            </h3>
            <p className="text-secondary mb-0 small">Apply for statutory leaves, review balances, and manage supervisory approvals</p>
          </div>

          <Button variant="primary" className="px-3" onClick={() => setShowApplyModal(true)}>
            Apply For Leave
          </Button>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        {/* Leave Balance Overview Cards */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <Card className="h-100 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                    Casual Leave
                  </div>
                  <div className="fs-4 fw-bold text-dark mt-1">
                    {usedBalances.casual || 0} <span className="fs-6 text-muted fw-normal">/ 12 used</span>
                  </div>
                </div>
                <span className="badge bg-light text-secondary border px-2 py-1">Annual Cap: 12</span>
              </div>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                    Sick Leave
                  </div>
                  <div className="fs-4 fw-bold text-dark mt-1">
                    {usedBalances.sick || 0} <span className="fs-6 text-muted fw-normal">/ 12 used</span>
                  </div>
                </div>
                <span className="badge bg-light text-secondary border px-2 py-1">Annual Cap: 12</span>
              </div>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase fw-semibold" style={{ fontSize: '0.75rem', letterSpacing: '0.04em' }}>
                    Annual Vacation Leave
                  </div>
                  <div className="fs-4 fw-bold text-dark mt-1">
                    {usedBalances.annual || 0} <span className="fs-6 text-muted fw-normal">/ 12 used</span>
                  </div>
                </div>
                <span className="badge bg-light text-secondary border px-2 py-1">Annual Cap: 12</span>
              </div>
            </Card>
          </Col>
        </Row>

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          {/* My Leaves Tab */}
          <Tab eventKey="my" title="My Leave History">
            <Card>
              <Card.Header className="bg-white border-bottom pt-3 pb-2">
                <span className="fw-bold text-dark">Personal Applications</span>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive border-0">
                  <Table hover className="align-middle mb-0 text-nowrap">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Duration</th>
                        <th>Working Days</th>
                        <th>Reason</th>
                        <th>Status</th>
                        <th>Reviewer Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myLeaves.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-4 text-muted small">
                            No leave applications submitted on record
                          </td>
                        </tr>
                      ) : (
                        myLeaves.map((lv) => (
                          <tr key={lv._id}>
                            <td>
                              <StatusBadge status={lv.type} />
                            </td>
                            <td className="text-secondary small">
                              {new Date(lv.startDate).toLocaleDateString()} to {new Date(lv.endDate).toLocaleDateString()}
                            </td>
                            <td className="fw-semibold">{lv.days}</td>
                            <td className="small text-dark" style={{ maxWidth: '240px', whiteSpace: 'normal' }}>
                              {lv.reason}
                            </td>
                            <td>
                              <StatusBadge status={lv.status} />
                            </td>
                            <td className="small text-muted">
                              {lv.comment || '-'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* Manager Team Leaves Tab */}
          {['manager', 'hr'].includes(user?.role) && (
            <Tab eventKey="team" title="Team Approvals Queue">
              <Card>
                <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="fw-bold text-dark">Subordinate Leave Requests</span>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Select
                      size="sm"
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        fetchTeamLeaves(e.target.value);
                      }}
                      style={{ width: '150px' }}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending Review</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </Form.Select>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive border-0">
                    <Table hover className="align-middle mb-0 text-nowrap">
                      <thead>
                        <tr>
                          <th>Team Member</th>
                          <th>Category</th>
                          <th>Duration</th>
                          <th>Days</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th className="text-end pe-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamLeaves.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted small">
                              No team leave requests found
                            </td>
                          </tr>
                        ) : (
                          teamLeaves.map((lv) => (
                            <tr key={lv._id}>
                              <td>
                                <div className="fw-semibold text-dark">{lv.user?.name}</div>
                                <div className="small text-muted" style={{ fontSize: '0.78rem' }}>{lv.user?.email}</div>
                              </td>
                              <td><StatusBadge status={lv.type} /></td>
                              <td className="text-secondary small">
                                {new Date(lv.startDate).toLocaleDateString()} to {new Date(lv.endDate).toLocaleDateString()}
                              </td>
                              <td className="fw-semibold">{lv.days}</td>
                              <td className="small text-dark" style={{ maxWidth: '240px', whiteSpace: 'normal' }}>
                                {lv.reason}
                              </td>
                              <td><StatusBadge status={lv.status} /></td>
                              <td className="text-end pe-3">
                                {lv.status === 'pending' ? (
                                  <div className="d-flex justify-content-end gap-1">
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      className="py-0 px-2"
                                      onClick={() => setDecisionModal({ show: true, leave: lv, status: 'approved', comment: '' })}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="py-0 px-2"
                                      onClick={() => setDecisionModal({ show: true, leave: lv, status: 'rejected', comment: '' })}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="small text-muted">Decided</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          )}

          {/* HR All Leaves Tab */}
          {user?.role === 'hr' && (
            <Tab eventKey="all" title="Company Applications">
              <Card>
                <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="fw-bold text-dark">Organization Leave Registry</span>
                  <Form.Select
                    size="sm"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      fetchAllLeaves(e.target.value, 1);
                    }}
                    style={{ width: '150px' }}
                  >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </Form.Select>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive border-0">
                    <Table hover className="align-middle mb-0 text-nowrap">
                      <thead>
                        <tr>
                          <th>Staff Member</th>
                          <th>Category</th>
                          <th>Duration</th>
                          <th>Days</th>
                          <th>Reason</th>
                          <th>Status</th>
                          <th className="text-end pe-3">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!allLeaves.data || allLeaves.data.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted small">
                              No leave records found
                            </td>
                          </tr>
                        ) : (
                          allLeaves.data.map((lv) => (
                            <tr key={lv._id}>
                              <td>
                                <div className="fw-semibold text-dark">{lv.user?.name}</div>
                                <div className="small text-muted" style={{ fontSize: '0.78rem' }}>{lv.user?.email}</div>
                              </td>
                              <td><StatusBadge status={lv.type} /></td>
                              <td className="text-secondary small">
                                {new Date(lv.startDate).toLocaleDateString()} to {new Date(lv.endDate).toLocaleDateString()}
                              </td>
                              <td className="fw-semibold">{lv.days}</td>
                              <td className="small text-dark" style={{ maxWidth: '240px', whiteSpace: 'normal' }}>
                                {lv.reason}
                              </td>
                              <td><StatusBadge status={lv.status} /></td>
                              <td className="text-end pe-3">
                                {lv.status === 'pending' ? (
                                  <div className="d-flex justify-content-end gap-1">
                                    <Button
                                      variant="outline-success"
                                      size="sm"
                                      className="py-0 px-2"
                                      onClick={() => setDecisionModal({ show: true, leave: lv, status: 'approved', comment: '' })}
                                    >
                                      Approve
                                    </Button>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      className="py-0 px-2"
                                      onClick={() => setDecisionModal({ show: true, leave: lv, status: 'rejected', comment: '' })}
                                    >
                                      Reject
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="small text-muted">Decided</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-top p-3">
                  <Pager
                    page={allLeaves.page}
                    pages={allLeaves.pages}
                    onPageChange={(p) => fetchAllLeaves(statusFilter, p)}
                  />
                </Card.Footer>
              </Card>
            </Tab>
          )}
        </Tabs>

        {/* Apply Leave Modal */}
        <Modal show={showApplyModal} onHide={() => setShowApplyModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5">Submit Leave Application</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleApplySubmit}>
            <Modal.Body>
              <Form.Group className="mb-3" controlId="leaveType">
                <Form.Label className="small fw-semibold text-secondary">Leave Category</Form.Label>
                <Form.Select
                  value={applyForm.type}
                  onChange={(e) => setApplyForm({ ...applyForm, type: e.target.value })}
                  required
                >
                  <option value="casual">Casual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="annual">Annual Vacation Leave</option>
                </Form.Select>
              </Form.Group>

              <Row className="g-2 mb-3">
                <Col md={6}>
                  <Form.Group controlId="startDate">
                    <Form.Label className="small fw-semibold text-secondary">Start Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={applyForm.startDate}
                      onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="endDate">
                    <Form.Label className="small fw-semibold text-secondary">End Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={applyForm.endDate}
                      onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-2" controlId="reason">
                <Form.Label className="small fw-semibold text-secondary">Reason / Note for Reviewer</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="State the objective of your planned absence..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowApplyModal(false)} disabled={submitting}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Decision Modal */}
        <Modal show={decisionModal.show} onHide={() => setDecisionModal({ ...decisionModal, show: false })} centered>
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold fs-5 text-capitalize">
              {decisionModal.status} Leave Request
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="text-secondary small mb-3">
              Adjudicating application for <strong>{decisionModal.leave?.user?.name}</strong> (
              {decisionModal.leave?.days} days, {decisionModal.leave?.type} leave).
            </p>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-semibold text-secondary">Decision Status</Form.Label>
              <Form.Select
                value={decisionModal.status}
                onChange={(e) => setDecisionModal({ ...decisionModal, status: e.target.value })}
              >
                <option value="approved">Approve Application</option>
                <option value="rejected">Reject Application</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="small fw-semibold text-secondary">Supervisory Remarks (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Add optional notes for the employee record..."
                value={decisionModal.comment}
                onChange={(e) => setDecisionModal({ ...decisionModal, comment: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setDecisionModal({ ...decisionModal, show: false })} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant={decisionModal.status === 'approved' ? 'success' : 'danger'}
              onClick={handleDecisionSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving...' : `Confirm ${decisionModal.status}`}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Leaves;

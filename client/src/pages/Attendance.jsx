import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Tab, Tabs } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import api from '../api/axios.js';
import StatusBadge from '../components/StatusBadge.jsx';
import Pager from '../components/Pager.jsx';
import Loader from '../components/Loader.jsx';

const Attendance = () => {
  const { user } = useSelector((state) => state.auth);

  // States
  const [activeTab, setActiveTab] = useState('my');
  const [todayRecord, setTodayRecord] = useState(null);
  const [myHistory, setMyHistory] = useState({ data: [], page: 1, pages: 1 });
  const [teamList, setTeamList] = useState([]);
  const [allList, setAllList] = useState({ data: [], page: 1, pages: 1 });

  const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch today's record
  const fetchToday = async () => {
    try {
      const res = await api.get('/attendance/today');
      setTodayRecord(res.data);
    } catch {
      // Ignore
    }
  };

  // Fetch my history
  const fetchMyHistory = async (page = 1) => {
    try {
      const res = await api.get(`/attendance/my?page=${page}`);
      setMyHistory(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load personal attendance history');
    }
  };

  // Fetch team attendance
  const fetchTeamAttendance = async (dateStr) => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance/team?date=${dateStr}`);
      setTeamList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load team attendance');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all attendance (HR)
  const fetchAllAttendance = async (dateStr, page = 1) => {
    try {
      setLoading(true);
      const res = await api.get(`/attendance?date=${dateStr}&page=${page}`);
      setAllList(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load company attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchToday();
      await fetchMyHistory(1);

      if (user?.role === 'manager') {
        await fetchTeamAttendance(filterDate);
        setActiveTab('team');
      } else if (user?.role === 'hr') {
        await fetchAllAttendance(filterDate, 1);
        setActiveTab('all');
      }
      setLoading(false);
    };

    init();
  }, [user?.role]);

  const handleCheckIn = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/attendance/check-in');
      setSuccess('Check-in timestamp recorded successfully.');
      await fetchToday();
      await fetchMyHistory(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.put('/attendance/check-out');
      setSuccess('Check-out timestamp recorded successfully.');
      await fetchToday();
      await fetchMyHistory(1);
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFilterDate(newDate);
    if (user?.role === 'manager') {
      fetchTeamAttendance(newDate);
    } else if (user?.role === 'hr') {
      fetchAllAttendance(newDate, 1);
    }
  };

  if (loading && !myHistory.data.length && !teamList.length && !allList.data.length) {
    return <Loader message="Loading attendance logs..." />;
  }

  return (
    <div className="py-4 page-container">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
          <div>
            <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.02em' }}>
              Attendance & Time Tracking
            </h3>
            <p className="text-secondary mb-0 small">Verified daily check-in logs and organizational attendance history</p>
          </div>

          {/* Action button */}
          <div className="d-flex align-items-center gap-2">
            {!todayRecord?.checkIn ? (
              <Button variant="primary" className="px-3" onClick={handleCheckIn} disabled={actionLoading}>
                Check In Now
              </Button>
            ) : !todayRecord?.checkOut ? (
              <Button variant="outline-primary" className="px-3" onClick={handleCheckOut} disabled={actionLoading}>
                Check Out
              </Button>
            ) : (
              <span
                className="badge fw-semibold px-3 py-2 rounded-2"
                style={{ backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' }}
              >
                Checked Out at {new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

        <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
          {/* My Attendance Tab */}
          <Tab eventKey="my" title="My History">
            <Card>
              <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark">Personal Logged Hours</span>
                <div className="text-muted small">
                  Today's Status:{' '}
                  {todayRecord?.checkIn ? (
                    <span className="text-success fw-bold">
                      In at {new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  ) : (
                    <span className="text-secondary">Pending check-in</span>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive border-0">
                  <Table hover className="align-middle mb-0 text-nowrap">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {!myHistory.data || myHistory.data.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted small">
                            No attendance records on file
                          </td>
                        </tr>
                      ) : (
                        myHistory.data.map((att) => (
                          <tr key={att._id}>
                            <td className="fw-semibold text-dark">{att.date}</td>
                            <td className="text-secondary small">
                              {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td className="text-secondary small">
                              {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                            </td>
                            <td>
                              <StatusBadge status={att.status} />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer className="bg-white border-top p-3">
                <Pager page={myHistory.page} pages={myHistory.pages} onPageChange={(p) => fetchMyHistory(p)} />
              </Card.Footer>
            </Card>
          </Tab>

          {/* Manager Team Attendance Tab */}
          {['manager', 'hr'].includes(user?.role) && (
            <Tab eventKey="team" title="Team Attendance">
              <Card>
                <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="fw-bold text-dark">Team Attendance Records</span>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Label className="small mb-0 text-muted fw-semibold">Filter Date:</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={filterDate}
                      onChange={handleDateChange}
                      style={{ width: '160px' }}
                    />
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive border-0">
                    <Table hover className="align-middle mb-0 text-nowrap">
                      <thead>
                        <tr>
                          <th>Team Member</th>
                          <th>Date</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teamList.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-muted small">
                              No team attendance records found for {filterDate}
                            </td>
                          </tr>
                        ) : (
                          teamList.map((att) => (
                            <tr key={att._id}>
                              <td>
                                <div className="fw-semibold text-dark">{att.user?.name}</div>
                                <div className="small text-muted" style={{ fontSize: '0.78rem' }}>{att.user?.email}</div>
                              </td>
                              <td className="text-secondary">{att.date}</td>
                              <td className="small text-secondary">
                                {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>
                              <td className="small text-secondary">
                                {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>
                              <td>
                                <StatusBadge status={att.status} />
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

          {/* HR All Staff Attendance Tab */}
          {user?.role === 'hr' && (
            <Tab eventKey="all" title="Company Turnout">
              <Card>
                <Card.Header className="bg-white border-bottom pt-3 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="fw-bold text-dark">Organization Turnout Logs</span>
                  <div className="d-flex align-items-center gap-2">
                    <Form.Label className="small mb-0 text-muted fw-semibold">Date:</Form.Label>
                    <Form.Control
                      type="date"
                      size="sm"
                      value={filterDate}
                      onChange={handleDateChange}
                      style={{ width: '160px' }}
                    />
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive border-0">
                    <Table hover className="align-middle mb-0 text-nowrap">
                      <thead>
                        <tr>
                          <th>Staff Member</th>
                          <th>Date</th>
                          <th>Check In</th>
                          <th>Check Out</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!allList.data || allList.data.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-muted small">
                              No attendance records logged for {filterDate}
                            </td>
                          </tr>
                        ) : (
                          allList.data.map((att) => (
                            <tr key={att._id}>
                              <td>
                                <div className="fw-semibold text-dark">{att.user?.name}</div>
                                <div className="small text-muted" style={{ fontSize: '0.78rem' }}>{att.user?.email}</div>
                              </td>
                              <td className="text-secondary">{att.date}</td>
                              <td className="small text-secondary">
                                {att.checkIn ? new Date(att.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>
                              <td className="small text-secondary">
                                {att.checkOut ? new Date(att.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                              </td>
                              <td>
                                <StatusBadge status={att.status} />
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
                    page={allList.page}
                    pages={allList.pages}
                    onPageChange={(p) => fetchAllAttendance(filterDate, p)}
                  />
                </Card.Footer>
              </Card>
            </Tab>
          )}
        </Tabs>
      </Container>
    </div>
  );
};

export default Attendance;

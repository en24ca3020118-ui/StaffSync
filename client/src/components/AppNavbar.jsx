import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice.js';
import api from '../api/axios.js';
import StatusBadge from './StatusBadge.jsx';

const AppNavbar = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      const list = Array.isArray(res.data) ? res.data : [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch {
      // Ignore background notification fetch failure
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 25000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, location.pathname]);

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const homeDestination = isAuthenticated
    ? user?.role === 'hr'
      ? '/hr'
      : user?.role === 'manager'
      ? '/manager'
      : '/employee'
    : '/';

  return (
    <Navbar bg="white" expand="lg" className="border-bottom sticky-top py-2" style={{ zIndex: 1020 }}>
      <Container fluid className="px-lg-4">
        <Navbar.Brand as={Link} to={homeDestination} className="d-flex align-items-center gap-2 text-decoration-none">
          <div
            className="d-flex align-items-center justify-content-center text-white fw-bold rounded-3"
            style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#2563eb',
              fontSize: '0.85rem',
              letterSpacing: '-0.02em'
            }}
          >
            M
          </div>
          <span className="fw-bold text-dark fs-5" style={{ letterSpacing: '-0.03em' }}>
            Modern <span style={{ color: '#2563eb' }}>HR</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="modernhr-nav" />
        <Navbar.Collapse id="modernhr-nav">
          <Nav className="me-auto my-2 my-lg-0 fw-medium gap-1">
            {!isAuthenticated ? (
              <Nav.Link as={Link} to="/" active={location.pathname === '/'}>
                Home
              </Nav.Link>
            ) : (
              <>
                {user.role === 'employee' && (
                  <>
                    <Nav.Link as={Link} to="/employee" active={location.pathname === '/employee'}>Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/attendance" active={location.pathname === '/attendance'}>Attendance</Nav.Link>
                    <Nav.Link as={Link} to="/leaves" active={location.pathname === '/leaves'}>Leaves</Nav.Link>
                    <Nav.Link as={Link} to="/announcements" active={location.pathname === '/announcements'}>Announcements</Nav.Link>
                    <Nav.Link as={Link} to="/training" active={location.pathname === '/training'}>Trainings</Nav.Link>
                  </>
                )}

                {user.role === 'manager' && (
                  <>
                    <Nav.Link as={Link} to="/manager" active={location.pathname === '/manager'}>Overview</Nav.Link>
                    <Nav.Link as={Link} to="/team" active={location.pathname === '/team'}>Team Members</Nav.Link>
                    <Nav.Link as={Link} to="/attendance" active={location.pathname === '/attendance'}>Attendance</Nav.Link>
                    <Nav.Link as={Link} to="/leaves" active={location.pathname === '/leaves'}>Leave Approvals</Nav.Link>
                    <Nav.Link as={Link} to="/announcements" active={location.pathname === '/announcements'}>Announcements</Nav.Link>
                    <Nav.Link as={Link} to="/training" active={location.pathname === '/training'}>Training Programs</Nav.Link>
                  </>
                )}

                {user.role === 'hr' && (
                  <>
                    <Nav.Link as={Link} to="/hr" active={location.pathname === '/hr'}>HR Dashboard</Nav.Link>
                    <Nav.Link as={Link} to="/employees" active={location.pathname === '/employees'}>Staff Directory</Nav.Link>
                    <Nav.Link as={Link} to="/attendance" active={location.pathname === '/attendance'}>Attendance</Nav.Link>
                    <Nav.Link as={Link} to="/leaves" active={location.pathname === '/leaves'}>Leaves</Nav.Link>
                    <Nav.Link as={Link} to="/announcements" active={location.pathname === '/announcements'}>Announcements</Nav.Link>
                    <Nav.Link as={Link} to="/reports" active={location.pathname === '/reports'}>Analytics & Reports</Nav.Link>
                  </>
                )}
              </>
            )}
          </Nav>

          <Nav className="align-items-lg-center gap-2 mt-2 mt-lg-0">
            {!isAuthenticated ? (
              <div className="d-flex gap-2">
                <Button as={Link} to="/login" variant="outline-primary" size="sm" className="px-3">
                  Sign In
                </Button>
                <Button as={Link} to="/register" variant="primary" size="sm" className="px-3">
                  Register
                </Button>
              </div>
            ) : (
              <>
                {/* Notification Dropdown */}
                <Dropdown align="end" className="me-1">
                  <Dropdown.Toggle
                    variant="light"
                    size="sm"
                    className="position-relative border-0 bg-transparent px-2 py-1 text-secondary"
                  >
                    {/* Clean SVG Bell Icon */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {unreadCount > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-lg border py-0" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
                    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
                      <span className="fw-bold small text-dark">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          className="btn btn-link p-0 text-decoration-none text-primary"
                          style={{ fontSize: '0.78rem' }}
                          onClick={handleMarkAllRead}
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="text-center py-4 text-muted small">No new notifications</div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n._id}
                          className={`p-3 border-bottom ${!n.read ? 'bg-primary bg-opacity-10' : ''}`}
                          style={{ fontSize: '0.85rem' }}
                        >
                          <div className="text-dark">{n.message}</div>
                          <div className="text-muted small mt-1" style={{ fontSize: '0.75rem' }}>
                            {new Date(n.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                {/* User Menu */}
                <NavDropdown
                  title={
                    <span className="d-inline-flex align-items-center gap-2">
                      <span className="fw-semibold text-dark">{user?.name}</span>
                      <StatusBadge status={user?.role} />
                    </span>
                  }
                  id="user-menu"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/profile">
                    My Profile
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout} className="text-danger fw-semibold">
                    Sign Out
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;

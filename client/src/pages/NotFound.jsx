import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <Container className="py-5 text-center">
      <div className="py-5">
        <h1 className="display-1 fw-bold text-primary mb-3">404</h1>
        <h3 className="fw-bold text-dark mb-3">Page Not Found</h3>
        <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '500px' }}>
          The page you are looking for does not exist, has been removed, or you don't have permission to access it.
        </p>
        <Button as={Link} to="/" variant="primary" className="fw-semibold px-4 py-2">
          Return Home
        </Button>
      </div>
    </Container>
  );
};

export default NotFound;

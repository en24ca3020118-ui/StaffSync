import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ message = 'Loading...', size = 'border' }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <Spinner animation={size} variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
      {message && <div className="mt-3 text-secondary fw-medium">{message}</div>}
    </div>
  );
};

export default Loader;

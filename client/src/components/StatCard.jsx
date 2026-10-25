import React from 'react';
import { Card } from 'react-bootstrap';

const StatCard = ({ title, value, variant = 'primary', subtitle }) => {
  const borderColors = {
    primary: '#2563eb',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    info: '#0284c7',
    secondary: '#64748b'
  };

  const activeColor = borderColors[variant] || '#2563eb';

  return (
    <Card className="h-100 card-hover">
      <Card.Body className="p-3 d-flex flex-column justify-content-between">
        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span
              className="text-muted text-uppercase fw-semibold"
              style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}
            >
              {title}
            </span>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: activeColor
              }}
            />
          </div>
          <div className="fs-3 fw-bold text-dark" style={{ letterSpacing: '-0.02em' }}>
            {value !== undefined ? value : '-'}
          </div>
        </div>
        {subtitle && (
          <div className="text-muted mt-2 pt-2 border-top" style={{ fontSize: '0.8rem' }}>
            {subtitle}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default StatCard;

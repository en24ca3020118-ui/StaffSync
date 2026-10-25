import React from 'react';

const StatusBadge = ({ status }) => {
  if (!status) return null;
  const s = String(status).toLowerCase();

  let styles = {
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0'
  };

  if (['approved', 'present', 'active', 'completed'].includes(s)) {
    styles = { backgroundColor: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0' };
  } else if (['pending', 'half-day', 'in-progress'].includes(s)) {
    styles = { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
  } else if (['rejected', 'inactive', 'failed'].includes(s)) {
    styles = { backgroundColor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' };
  } else if (['hr'].includes(s)) {
    styles = { backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
  } else if (['manager'].includes(s)) {
    styles = { backgroundColor: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0' };
  } else if (['employee'].includes(s)) {
    styles = { backgroundColor: '#f8fafc', color: '#334155', border: '1px solid #cbd5e1' };
  } else if (['casual', 'sick', 'annual'].includes(s)) {
    styles = { backgroundColor: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' };
  }

  return (
    <span
      className="badge text-capitalize px-2 py-1 fw-semibold"
      style={{
        ...styles,
        fontSize: '0.75rem',
        borderRadius: '6px',
        letterSpacing: '0.02em',
        fontWeight: 600
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;

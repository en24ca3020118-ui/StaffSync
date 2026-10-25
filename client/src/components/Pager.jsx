import React from 'react';
import { Pagination } from 'react-bootstrap';

const Pager = ({ page, pages, onPageChange }) => {
  if (!pages || pages <= 1) return null;

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      <div className="text-muted small">
        Page {page} of {pages}
      </div>
      <Pagination className="mb-0">
        <Pagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => {
          // Show first, last, and within 2 of current
          if (p === 1 || p === pages || (p >= page - 1 && p <= page + 1)) {
            return (
              <Pagination.Item key={p} active={p === page} onClick={() => onPageChange(p)}>
                {p}
              </Pagination.Item>
            );
          }
          if (p === page - 2 || p === page + 2) {
            return <Pagination.Ellipsis key={p} disabled />;
          }
          return null;
        })}
        <Pagination.Next disabled={page >= pages} onClick={() => onPageChange(page + 1)} />
      </Pagination>
    </div>
  );
};

export default Pager;

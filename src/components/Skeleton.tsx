import React from 'react';

export const SkeletonBox: React.FC<{ width?: string; height?: string; borderRadius?: string; className?: string; style?: React.CSSProperties }> = ({
  width = '100%',
  height = '1rem',
  borderRadius = '6px',
  className = '',
  style = {}
}) => (
  <div
    className={`skeleton-box ${className}`}
    style={{ width, height, borderRadius, ...style }}
  />
);

export const SkeletonKPIRow: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="row g-3 mb-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="col-sm-6 col-xl-3">
        <div className="skeleton-card shadow-sm d-flex justify-content-between align-items-start">
          <div className="w-100 me-3">
            <SkeletonBox width="60%" height="0.8rem" className="mb-2" />
            <SkeletonBox width="80%" height="1.8rem" className="mb-2" />
            <SkeletonBox width="40%" height="0.75rem" />
          </div>
          <SkeletonBox width="42px" height="42px" borderRadius="50%" />
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({ rows = 5, cols = 5 }) => (
  <div className="skeleton-card shadow-sm p-0 overflow-hidden">
    <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
      <SkeletonBox width="160px" height="1.2rem" />
      <SkeletonBox width="100px" height="2rem" borderRadius="8px" />
    </div>
    <div className="table-responsive p-3">
      <table className="table align-middle mb-0">
        <thead>
          <tr>
            {Array.from({ length: cols }).map((_, c) => (
              <th key={c} className="border-0">
                <SkeletonBox width="70%" height="0.85rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="py-3">
                  <SkeletonBox width={c === 0 ? '85%' : '60%'} height="1rem" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export const SkeletonDashboard: React.FC = () => (
  <div className="fade-in">
    <SkeletonKPIRow count={4} />
    <div className="row g-4">
      <div className="col-lg-7">
        <SkeletonTable rows={5} cols={4} />
      </div>
      <div className="col-lg-5">
        <SkeletonTable rows={5} cols={3} />
      </div>
    </div>
  </div>
);

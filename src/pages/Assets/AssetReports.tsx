import React from 'react';

const AssetReports: React.FC = () => {
  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1"><i className="fas fa-cubes text-success me-2"></i>Fixed Assets &amp; Physical Verification Audit Reports</h5>
            <p className="text-muted small mb-0">Overview of capital asset valuation, accumulated depreciation, physical audit status, and asset distribution.</p>
          </div>
          <button className="btn btn-outline-success btn-sm fw-bold">
            <i className="fas fa-file-pdf me-2"></i>Export Asset Register PDF
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Total Asset Acquisition Cost</div>
              <div className="fs-4 fw-bold text-dark mt-1">TZS 340.0M</div>
              <span className="badge bg-success-subtle text-success mt-2">Historical Purchase Price</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Net Book Value (NBV)</div>
              <div className="fs-4 fw-bold text-dark mt-1">TZS 277.5M</div>
              <span className="badge bg-primary-subtle text-primary mt-2">Depreciated Value</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Annual Depreciation</div>
              <div className="fs-4 fw-bold text-dark mt-1">TZS 34.2M</div>
              <span className="badge bg-warning-subtle text-warning mt-2">Straight-Line Method</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Audit Verification Rate</div>
              <div className="fs-4 fw-bold text-dark mt-1">98.5%</div>
              <span className="badge bg-success-subtle text-success mt-2">Physical Tag Match</span>
            </div>
          </div>
        </div>

        {/* Breakdown Sections */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="border rounded-3 p-3 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-chart-pie me-2 text-primary"></i>Asset Portfolio Value by Category</h6>
              <div className="d-flex flex-column gap-3">
                {[
                  { name: 'Vehicles & Transport Fleet', val: 'TZS 165.0M', pct: 60, color: '#10b981' },
                  { name: 'Machinery & Heavy Equipment', val: 'TZS 75.0M', pct: 25, color: '#3b82f6' },
                  { name: 'IT & Data Center Hardware', val: 'TZS 28.0M', pct: 10, color: '#f59e0b' },
                  { name: 'Office Furniture & Fixtures', val: 'TZS 9.5M', pct: 5, color: '#8b5cf6' },
                ].map(c => (
                  <div key={c.name}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-dark">{c.name}</span>
                      <span className="fw-bold">{c.val} ({c.pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                      <div className="progress-bar" style={{ width: `${c.pct}%`, backgroundColor: c.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="border rounded-3 p-3 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-history me-2 text-success"></i>Annual Depreciation &amp; Valuation Log</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light">
                    <tr>
                      <th>Financial Year</th>
                      <th>Gross Value</th>
                      <th>Depreciation Charge</th>
                      <th>Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>FY 2026</td><td className="fw-bold">TZS 340.0M</td><td className="text-danger">- TZS 34.2M</td><td><span className="badge bg-success-subtle text-success">TZS 277.5M</span></td></tr>
                    <tr><td>FY 2025</td><td className="fw-bold">TZS 312.0M</td><td className="text-danger">- TZS 31.0M</td><td><span className="badge bg-success-subtle text-success">TZS 281.0M</span></td></tr>
                    <tr><td>FY 2024</td><td className="fw-bold">TZS 280.0M</td><td className="text-danger">- TZS 28.0M</td><td><span className="badge bg-success-subtle text-success">TZS 252.0M</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetReports;

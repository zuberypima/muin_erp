import React from 'react';

const LogisticsReports: React.FC = () => {
  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1"><i className="fas fa-anchor text-primary me-2"></i>Maritime Transportation &amp; Container Shipping Analytics</h5>
            <p className="text-muted small mb-0">Overview of TEU throughput, port berth productivity, container dwell times, and TRA customs releases.</p>
          </div>
          <button className="btn btn-outline-success btn-sm fw-bold">
            <i className="fas fa-file-pdf me-2"></i>Export Maritime Report PDF
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Monthly TEU Throughput</div>
              <div className="fs-4 fw-bold text-dark mt-1">42,850 TEUs</div>
              <span className="badge bg-success-subtle text-success mt-2">+8.2% vs last month</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Avg Container Dwell Time</div>
              <div className="fs-4 fw-bold text-dark mt-1">4.2 Days</div>
              <span className="badge bg-info-subtle text-info mt-2">Target &lt; 5 Days</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Vessel Berth Productivity</div>
              <div className="fs-4 fw-bold text-dark mt-1">28.4 Moves / Hr</div>
              <span className="badge bg-success-subtle text-success mt-2">Quay Crane Peak</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Customs Clearance Rate</div>
              <div className="fs-4 fw-bold text-dark mt-1">94.6%</div>
              <span className="badge bg-primary-subtle text-primary mt-2">TRA Direct Release</span>
            </div>
          </div>
        </div>

        {/* Breakdown Sections */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="border rounded-3 p-3 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-boxes me-2 text-primary"></i>Container Terminal Stacking Occupancy</h6>
              <div className="d-flex flex-column gap-3">
                {[
                  { name: 'Dar es Salaam Port Terminal (TICTS)', pct: 78, color: '#10b981' },
                  { name: 'Bandari Container Yard Block A', pct: 85, color: '#3b82f6' },
                  { name: 'Bandari Container Yard Block B', pct: 62, color: '#f59e0b' },
                  { name: 'TAZARA Inland Container Depot (ICD)', pct: 54, color: '#8b5cf6' },
                  { name: 'Kwala Dry Port Terminal (Ruvu)', pct: 91, color: '#ef4444' },
                ].map(w => (
                  <div key={w.name}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-dark">{w.name}</span>
                      <span className="fw-bold">{w.pct}% Capacity</span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                      <div className="progress-bar" style={{ width: `${w.pct}%`, backgroundColor: w.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="border rounded-3 p-3 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-ship me-2 text-success"></i>Ocean Freight &amp; Shipping Line Breakdown</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light">
                    <tr>
                      <th>Shipping Line</th>
                      <th>Vessels Logged</th>
                      <th>Containers (TEUs)</th>
                      <th>On-Time Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>MUIN Shipping Lines</td><td className="fw-bold">12</td><td>14,500</td><td><span className="badge bg-success-subtle text-success">98.2%</span></td></tr>
                    <tr><td>Maersk Line</td><td className="fw-bold">8</td><td>11,200</td><td><span className="badge bg-success-subtle text-success">96.5%</span></td></tr>
                    <tr><td>MSC Container Line</td><td className="fw-bold">7</td><td>9,400</td><td><span className="badge bg-success-subtle text-success">95.0%</span></td></tr>
                    <tr><td>CMA CGM</td><td className="fw-bold">5</td><td>7,750</td><td><span className="badge bg-info-subtle text-info">93.8%</span></td></tr>
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

export default LogisticsReports;

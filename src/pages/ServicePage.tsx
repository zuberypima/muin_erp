import React from 'react';
import './ServicePage.css';

const ServicePage: React.FC = () => {
  return (
    <div id="service-page" className="fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Dashboard</h2>
          <p className="text-muted">Welcome back! Here's an overview of your services.</p>
        </div>
        <div className="user-profile d-none d-md-flex align-items-center">
          <div className="text-end me-3">
            <p className="mb-0 fw-bold fs-6">Admin User</p>
            <p className="mb-0 text-muted" style={{ fontSize: '0.8rem' }}>Super Admin</p>
          </div>
          <div className="avatar">
            <i className="fas fa-user text-white"></i>
          </div>
        </div>
      </div>

      <div className="row gy-4 mt-2">
        <div className="col-md-6 col-lg-4">
          <div className="feature-card">
            <div className="feature-icon bg-light-green text-primary-green">
              <i className="fas fa-tractor fa-2x"></i>
            </div>
            <h3 className="feature-title">Farm Activities</h3>
            <p className="feature-desc text-muted">Manage agricultural tasks and tracking.</p>
            <button className="btn btn-outline-success btn-sm mt-auto modern-btn">Manage <i className="fas fa-arrow-right ms-1"></i></button>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="feature-card">
            <div className="feature-icon bg-light-purple text-purple">
              <i className="fas fa-cloud-sun fa-2x"></i>
            </div>
            <h3 className="feature-title">Weather Info</h3>
            <p className="feature-desc text-muted">Real-time local forecasts.</p>
            <button className="btn btn-outline-secondary btn-sm mt-auto modern-btn">Check Weather <i className="fas fa-arrow-right ms-1"></i></button>
          </div>
        </div>

        <div className="col-md-6 col-lg-4">
          <div className="feature-card">
            <div className="feature-icon bg-light-orange text-warning">
              <i className="fas fa-hand-holding-usd fa-2x"></i>
            </div>
            <h3 className="feature-title">Loan Activities</h3>
            <p className="feature-desc text-muted">Review financial distributions.</p>
            <button className="btn btn-outline-warning btn-sm mt-auto modern-btn">Manage Loans <i className="fas fa-arrow-right ms-1"></i></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;

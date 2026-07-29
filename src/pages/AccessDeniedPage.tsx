import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveDepartmentRoute } from '../utils/departmentUtils';

const AccessDeniedPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userDept = user?.department || 'Unassigned';
  const allowedDashboard = resolveDepartmentRoute(user);

  return (
    <div className="container-fluid py-5 fade-in min-vh-75 d-flex align-items-center justify-content-center">
      <div className="card border-0 shadow-lg p-4 p-md-5 text-center" style={{ maxWidth: '600px', width: '100%', borderRadius: '20px', backgroundColor: '#ffffff' }}>
        
        {/* Shield Icon */}
        <div
          className="mx-auto mb-4 rounded-circle d-flex align-items-center justify-content-center"
          style={{ width: '88px', height: '88px', backgroundColor: '#fef2f2', color: '#dc2626', border: '2px solid #fecdd3' }}
        >
          <i className="fas fa-user-lock fs-1"></i>
        </div>

        {/* Access Restricted Title */}
        <h2 className="fw-bold text-dark mb-2">Access Restricted</h2>
        <span className="badge bg-danger-subtle text-danger border px-3 py-1.5 fw-semibold mb-3" style={{ fontSize: '0.85rem', borderRadius: '8px' }}>
          403 Forbidden — Missing Department Permission
        </span>

        {/* Informative Explanation */}
        <p className="text-secondary mb-3" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
          You do not have permission to view <code className="bg-light px-2 py-1 text-dark rounded border">{location.pathname}</code>.
          Access to this page is restricted based on your assigned department: <strong className="text-dark">{userDept}</strong>.
        </p>

        <div className="p-3 bg-light rounded-3 border text-start mb-4" style={{ fontSize: '0.85rem' }}>
          <div className="fw-bold text-dark mb-1">
            <i className="fas fa-info-circle text-primary me-1.5"></i> Why am I seeing this?
          </div>
          <p className="text-muted mb-0">
            System Administrators configure page access permissions per department to ensure data privacy and operational security. If you require access to this section for your daily duties, please contact your department manager or IT administrator.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-wrap justify-content-center gap-2">
          <button
            className="btn text-white fw-bold px-4 py-2 shadow-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: '#10b981', borderRadius: '10px' }}
            onClick={() => navigate(allowedDashboard)}
          >
            <i className="fas fa-home"></i> Go to Authorized Dashboard
          </button>
          <button
            className="btn btn-outline-secondary fw-semibold px-4 py-2"
            style={{ borderRadius: '10px' }}
            onClick={() => navigate(-1)}
          >
            <i className="fas fa-arrow-left me-1"></i> Go Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccessDeniedPage;

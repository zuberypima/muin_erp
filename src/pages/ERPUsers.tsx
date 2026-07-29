import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { isDepartmentMatch, resolveDepartmentRoute } from '../utils/departmentUtils';

interface ERPUser {
  id: number;
  username: string;
  email: string;
  department?: string;
  is_staff?: boolean;
}

const ERPUsers: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<ERPUser[]>([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = user?.is_staff || isDepartmentMatch(user?.department, 'management');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/');
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch ERP users", error);
      } finally {
        setLoading(false);
      }
    };

    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  if (user && !isSuperAdmin) {
    const fallbackRoute = resolveDepartmentRoute(user);
    return <Navigate to={fallbackRoute} replace />;
  }

  return (
    <div className="container-fluid py-2 fade-in">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">ERP Users Directory</h2>
          <p className="text-muted mb-0">Manage internal team members, staff accounts, and department page permissions.</p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-success fw-bold px-3 shadow-sm"
            onClick={() => navigate('/erp-users/permissions')}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-user-shield me-2"></i> Manage Page Access Permissions
          </button>
          <button className="btn text-white fw-bold px-4 py-2 shadow-sm" style={{ backgroundColor: '#10b981', borderRadius: '8px' }}>
            <i className="fas fa-user-plus me-2"></i> Add Staff
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '15px' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="px-4 py-3 text-muted text-uppercase fw-semibold border-bottom-0" style={{ fontSize: '12px' }}>Username</th>
                  <th className="px-4 py-3 text-muted text-uppercase fw-semibold border-bottom-0" style={{ fontSize: '12px' }}>Email</th>
                  <th className="px-4 py-3 text-muted text-uppercase fw-semibold border-bottom-0" style={{ fontSize: '12px' }}>Role / Dept</th>
                  <th className="px-4 py-3 text-muted text-uppercase fw-semibold border-bottom-0 text-end" style={{ fontSize: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5">
                      <div className="spinner-border text-success" role="status"></div>
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td className="px-4 py-3 border-bottom-0 border-top">
                        <div className="d-flex align-items-center">
                          <div className="avatar me-3 bg-light text-primary-green fw-bold d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #ecfdf5' }}>
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-semibold text-dark">{u.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-bottom-0 border-top text-muted">
                        <i className="fas fa-envelope me-2 small"></i>{u.email}
                      </td>
                      <td className="px-4 py-3 border-bottom-0 border-top">
                        {u.is_staff ? (
                          <span className="badge bg-warning text-dark me-2" style={{ borderRadius: '6px' }}>Staff Admin</span>
                        ) : (
                          <span className="badge bg-light text-dark border me-2" style={{ borderRadius: '6px' }}>Employee</span>
                        )}
                        <span className="badge bg-secondary-subtle text-dark border" style={{ borderRadius: '6px' }}>
                          {u.department || 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-bottom-0 border-top text-end">
                        <button
                          className="btn btn-sm btn-outline-dark fw-semibold"
                          style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                          onClick={() => navigate('/erp-users/permissions')}
                          title="Configure accessible pages for this user"
                        >
                          <i className="fas fa-key me-1 text-success"></i> Edit Permissions
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERPUsers;

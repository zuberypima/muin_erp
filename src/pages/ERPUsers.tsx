import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';

interface ERPUser {
  id: number;
  username: string;
  email: string;
  is_staff?: boolean;
}

const ERPUsers: React.FC = () => {
  const [users, setUsers] = useState<ERPUser[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchUsers();
  }, []);

  return (
    <div className="container-fluid py-2 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">ERP Users Directory</h2>
          <p className="text-muted">Manage internal team members and staff accounts.</p>
        </div>
        <button className="btn text-white fw-bold px-4 py-2 shadow-sm" style={{ backgroundColor: '#10b981', borderRadius: '8px' }}>
          <i className="fas fa-user-plus me-2"></i> Add Staff
        </button>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '15px' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th className="px-4 py-3 text-muted text-uppercase fw-semibold border-bottom-0" style={{ fontSize: '12px' }}>Username</th>
                  <th className="px-4 py-3 text-muted text-uppercase fw-semibold border-bottom-0" style={{ fontSize: '12px' }}>Email</th>
                  <th className="px-4 py-3 text-muted text-uppercase fw-semibold border-bottom-0" style={{ fontSize: '12px' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-5">
                      <div className="spinner-border text-success" role="status"></div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-3 border-bottom-0 border-top">
                        <div className="d-flex align-items-center">
                          <div className="avatar me-3 bg-light text-primary-green fw-bold d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #ecfdf5' }}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-semibold text-dark">{user.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 border-bottom-0 border-top text-muted">
                        <i className="fas fa-envelope me-2 small"></i>{user.email}
                      </td>
                      <td className="px-4 py-3 border-bottom-0 border-top">
                        {user.is_staff ? (
                          <span className="badge bg-warning text-dark" style={{ borderRadius: '6px' }}>Staff Admin</span>
                        ) : (
                          <span className="badge bg-light text-dark border" style={{ borderRadius: '6px' }}>Employee</span>
                        )}
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

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { getRatingStars } from './hrTypes';

interface EmployeePerformance {
  id: number;
  full_name: string;
  department: string;
  position: string;
  completed_tasks_count: number;
}

const Performance: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeePerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPerformance = async () => {
    try {
      // The backend EmployeeViewSet now annotates 'completed_tasks_count'
      const res = await api.get('/hr/employees/');
      setEmployees(res.data);
    } catch {
      setError('Failed to load employee performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  const calculateRating = (completedTasks: number) => {
    if (!completedTasks || completedTasks === 0) return 1;
    if (completedTasks <= 2) return 2;
    if (completedTasks <= 5) return 3;
    if (completedTasks <= 10) return 4;
    return 5;
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="alert alert-info d-flex align-items-center mb-0" style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e3a8a', borderRadius: '12px' }}>
            <i className="fas fa-info-circle fa-2x me-3"></i>
            <div>
              <h6 className="fw-bold mb-1">Automated Performance Tracking</h6>
              <p className="mb-0 small">Employee performance ratings are automatically calculated based on the total number of tasks they have successfully completed across the ERP system. Manual reviews are currently disabled.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="hr-table-card">
        <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
          <h5 className="fw-bold mb-0">Task-Based Performance Ratings</h5>
          <span className="badge bg-light text-muted border">Live Data</span>
        </div>

        {error && <div className="alert alert-danger mx-4 py-2 small">{error}</div>}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table hr-table align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th className="text-center">Tasks Completed</th>
                  <th>Automated Rating</th>
                  <th>Status Message</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No employees found.</td></tr>
                ) : employees.map(emp => {
                  const rating = calculateRating(emp.completed_tasks_count);
                  return (
                    <tr key={emp.id}>
                      <td className="fw-semibold text-dark">
                        <div className="d-flex align-items-center">
                          <div className="emp-avatar me-3" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
                            {emp.full_name.charAt(0)}
                          </div>
                          {emp.full_name}
                        </div>
                      </td>
                      <td className="small text-muted">{emp.department}</td>
                      <td className="small">{emp.position}</td>
                      <td className="text-center">
                        <span className="badge rounded-pill" style={{ backgroundColor: emp.completed_tasks_count > 0 ? '#ecfdf5' : '#f8fafc', color: emp.completed_tasks_count > 0 ? '#10b981' : '#94a3b8', fontSize: '13px', padding: '6px 12px' }}>
                          {emp.completed_tasks_count || 0}
                        </span>
                      </td>
                      <td>
                        <span className="star-rating d-inline-block px-2 py-1 rounded" style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7' }}>
                          {getRatingStars(rating)}
                        </span>
                      </td>
                      <td className="small text-muted">
                        {rating === 5 ? 'Exceptional Performer' : 
                         rating === 4 ? 'Highly Effective' : 
                         rating === 3 ? 'Meets Expectations' : 
                         rating === 2 ? 'Needs Improvement' : 'Requires Attention'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performance;

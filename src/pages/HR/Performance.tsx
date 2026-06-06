import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { getRatingStars } from './hrTypes';

interface PerformanceReview {
  id: number;
  employee: number;
  employee_name: string;
  department: string;
  review_period: string;
  rating: number;
  goals: string;
  comments: string;
  reviewed_by: string;
  review_date: string;
}

interface Employee { id: number; full_name: string; }

const Performance: React.FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    employee: '',
    review_period: 'Q2 2026',
    rating: 3,
    goals: '',
    comments: '',
    reviewed_by: '',
  });

  const fetchReviews = async () => {
    try {
      const res = await api.get('/hr/performance/');
      setReviews(res.data);
    } catch { setError('Failed to load performance reviews.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchReviews();
    api.get('/hr/employees/').then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/hr/performance/', form);
      await fetchReviews();
      setShowModal(false);
      setForm({ employee: '', review_period: 'Q2 2026', rating: 3, goals: '', comments: '', reviewed_by: '' });
    } catch { setError('Failed to save review.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="container-fluid p-0">
      <div className="hr-table-card">
        <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
          <h5 className="fw-bold mb-0">Performance Reviews</h5>
          <button className="btn btn-sm text-white fw-bold px-3"
            style={{ backgroundColor: '#10b981', borderRadius: '8px' }}
            onClick={() => setShowModal(true)}>
            <i className="fas fa-plus me-2"></i>Record Review
          </button>
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
                  <th>Dept.</th>
                  <th>Period</th>
                  <th>Rating</th>
                  <th>Goals</th>
                  <th>Comments</th>
                  <th>Reviewed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted py-4">No reviews found.</td></tr>
                ) : reviews.map(rev => (
                  <tr key={rev.id}>
                    <td className="fw-semibold text-dark">{rev.employee_name}</td>
                    <td className="small text-muted">{rev.department}</td>
                    <td>{rev.review_period}</td>
                    <td><span className="star-rating">{getRatingStars(rev.rating)}</span></td>
                    <td className="small text-muted" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rev.goals}</td>
                    <td className="small text-muted" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rev.comments}</td>
                    <td>{rev.reviewed_by}</td>
                    <td className="small text-muted">{new Date(rev.review_date).toLocaleDateString('en-GB')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block hr-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Record Performance Review</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Employee</label>
                      <select className="form-select bg-light" required value={form.employee}
                        onChange={e => setForm({...form, employee: e.target.value})}>
                        <option value="">Select employee...</option>
                        {employees.map((emp: any) => (
                          <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Review Period</label>
                      <input type="text" className="form-control bg-light" required placeholder="e.g. Q2 2026"
                        value={form.review_period} onChange={e => setForm({...form, review_period: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Rating (1–5 Stars)</label>
                      <select className="form-select bg-light" value={form.rating}
                        onChange={e => setForm({...form, rating: parseInt(e.target.value)})}>
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Goals & Objectives</label>
                      <textarea className="form-control bg-light" rows={2} required value={form.goals}
                        onChange={e => setForm({...form, goals: e.target.value})}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Comments</label>
                      <textarea className="form-control bg-light" rows={2} required value={form.comments}
                        onChange={e => setForm({...form, comments: e.target.value})}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Reviewed By</label>
                      <input type="text" className="form-control bg-light" required placeholder="e.g. Amina Hassan"
                        value={form.reviewed_by} onChange={e => setForm({...form, reviewed_by: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={saving}>
                    {saving ? 'Saving...' : 'Record Review'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performance;

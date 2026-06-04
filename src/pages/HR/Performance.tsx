import React, { useState } from 'react';
import { PerformanceReview, demoReviews, getRatingStars } from './hrTypes';

const Performance: React.FC = () => {
  const [reviews, setReviews] = useState<PerformanceReview[]>(demoReviews);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<Omit<PerformanceReview, 'id' | 'reviewDate'>>({
    employeeId: '',
    employeeName: '',
    department: 'Farm Operations',
    reviewPeriod: 'Q2 2026',
    rating: 3,
    goals: '',
    comments: '',
    reviewedBy: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview: PerformanceReview = {
      ...form,
      id: `REV-${(reviews.length + 1).toString().padStart(3, '0')}`,
      reviewDate: new Date().toISOString().split('T')[0]
    };
    setReviews([newReview, ...reviews]);
    setShowModal(false);
  };

  return (
    <div className="container-fluid p-0">
      <div className="hr-table-card">
        <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
          <h5 className="fw-bold mb-0">Performance Reviews</h5>
          <button className="btn btn-sm text-white fw-bold px-3 py-1.5" style={{ backgroundColor: '#10b981', borderRadius: '8px' }} onClick={() => setShowModal(true)}>
            <i className="fas fa-plus me-2"></i> Record Review
          </button>
        </div>

        <div className="table-responsive">
          <table className="table hr-table align-middle">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Period</th>
                <th>Rating</th>
                <th>Goals Set</th>
                <th>Comments</th>
                <th>Reviewed By</th>
                <th>Review Date</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(rev => (
                <tr key={rev.id}>
                  <td className="fw-semibold text-dark">{rev.employeeName}</td>
                  <td>{rev.reviewPeriod}</td>
                  <td>
                    <span className="star-rating">{getRatingStars(rev.rating)}</span>
                  </td>
                  <td className="small text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rev.goals}
                  </td>
                  <td className="small text-muted" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {rev.comments}
                  </td>
                  <td>{rev.reviewedBy}</td>
                  <td className="small text-muted">{new Date(rev.reviewDate).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                      <label className="form-label text-muted small fw-semibold">Employee Name</label>
                      <input type="text" className="form-control bg-light" required placeholder="e.g. Zawadi Juma" value={form.employeeName} onChange={e => setForm({...form, employeeName: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Review Period</label>
                      <input type="text" className="form-control bg-light" required placeholder="e.g. Q2 2026" value={form.reviewPeriod} onChange={e => setForm({...form, reviewPeriod: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Rating (1 to 5 Stars)</label>
                      <select className="form-select bg-light" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value) as any})}>
                        <option value="1">1 Star</option>
                        <option value="2">2 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Goals & Objectives</label>
                      <textarea className="form-control bg-light" rows={2} required value={form.goals} onChange={e => setForm({...form, goals: e.target.value})}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Comments</label>
                      <textarea className="form-control bg-light" rows={2} required value={form.comments} onChange={e => setForm({...form, comments: e.target.value})}></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Reviewed By</label>
                      <input type="text" className="form-control bg-light" required placeholder="e.g. Amina Hassan" value={form.reviewedBy} onChange={e => setForm({...form, reviewedBy: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }}>Record Review</button>
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

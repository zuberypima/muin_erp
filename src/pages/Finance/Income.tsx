import React, { useState } from 'react';
import { IncomeEntry, formatCurrency, formatDate } from './financeTypes';

const initialIncome: IncomeEntry[] = [
  { id: 'INC-001', date: '2026-06-01', source: 'Market Sales', category: 'Sales', amount: 4500000, description: 'Sunflower seed bulk sale', status: 'received' },
  { id: 'INC-002', date: '2026-06-03', source: 'Market Sales', category: 'Sales', amount: 3200000, description: 'Maize crop – batch 3', status: 'pending' },
  { id: 'INC-003', date: '2026-06-04', source: 'Rental', category: 'Rental', amount: 350000, description: 'Market stall rental', status: 'received' },
  { id: 'INC-004', date: '2026-05-28', source: 'Agrofinance', category: 'Loan', amount: 5000000, description: 'Agrobank loan disbursement', status: 'received' },
];

const CATEGORIES = ['Sales', 'Rental', 'Loan', 'Grant', 'Services', 'Other'];

const Income: React.FC = () => {
  const [income, setIncome] = useState<IncomeEntry[]>(initialIncome);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState<Omit<IncomeEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    source: '', category: 'Sales', amount: 0, description: '', status: 'received',
  });

  const total = income.filter(i => i.status === 'received').reduce((s, i) => s + i.amount, 0);
  const pending = income.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);

  const filtered = filterStatus === 'all' ? income : income.filter(i => i.status === filterStatus);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setIncome(prev => [{ ...form, id: `INC-${Date.now()}` }, ...prev]);
    setShowModal(false);
    setForm({ date: new Date().toISOString().split('T')[0], source: '', category: 'Sales', amount: 0, description: '', status: 'received' });
  };

  return (
    <>
      {/* Summary */}
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon green mb-3"><i className="fas fa-check-circle"></i></div>
            <div className="kpi-label">Received Income</div>
            <div className="kpi-value text-success">{formatCurrency(total)}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon orange mb-3"><i className="fas fa-clock"></i></div>
            <div className="kpi-label">Pending Income</div>
            <div className="kpi-value" style={{ color: '#f97316' }}>{formatCurrency(pending)}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon blue mb-3"><i className="fas fa-list"></i></div>
            <div className="kpi-label">Total Records</div>
            <div className="kpi-value">{income.length}</div>
          </div>
        </div>
      </div>

      <div className="finance-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center px-4 pt-4 pb-3 gap-3">
          <h6 className="fw-bold text-dark mb-0">Income Records</h6>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="received">Received</option>
              <option value="pending">Pending</option>
            </select>
            <button className="btn-finance-primary btn" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2"></i>Add Income
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table finance-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Source</th><th>Category</th><th>Description</th><th>Status</th><th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inc => (
                <tr key={inc.id}>
                  <td className="text-muted small">{inc.id}</td>
                  <td className="text-muted small">{formatDate(inc.date)}</td>
                  <td className="fw-medium">{inc.source}</td>
                  <td><span className="badge bg-light text-dark border">{inc.category}</span></td>
                  <td className="text-muted small">{inc.description || '—'}</td>
                  <td><span className={`badge-status ${inc.status}`}>{inc.status}</span></td>
                  <td className="text-end fw-bold text-success">{formatCurrency(inc.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block finance-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Income Entry</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Source</label>
                      <input className="form-control bg-light" required value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <select className="form-select bg-light" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Amount (TZS)</label>
                      <input type="number" className="form-control bg-light" required min={0} value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date</label>
                      <input type="date" className="form-control bg-light" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Status</label>
                      <select className="form-select bg-light" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                        <option value="received">Received</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Description</label>
                      <textarea className="form-control bg-light" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-finance-primary btn">Save Income</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Income;

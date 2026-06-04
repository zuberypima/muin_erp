import React, { useState } from 'react';
import { ExpenseEntry, formatCurrency, formatDate } from './financeTypes';

const initialExpenses: ExpenseEntry[] = [
  { id: 'EXP-001', date: '2026-06-01', vendor: 'Payroll Office', category: 'Payroll', amount: 2800000, description: 'Staff salaries – May 2026', status: 'paid', approvedBy: 'Director' },
  { id: 'EXP-002', date: '2026-06-01', vendor: 'AgriSupply Ltd', category: 'Supplies', amount: 650000, description: 'Fertilizer purchase', status: 'paid', approvedBy: 'Farm Manager' },
  { id: 'EXP-003', date: '2026-06-03', vendor: 'PetroTech', category: 'Operations', amount: 180000, description: 'Tractor fuel', status: 'paid' },
  { id: 'EXP-004', date: '2026-06-04', vendor: 'SmartOffice', category: 'Admin', amount: 55000, description: 'Office supplies', status: 'paid' },
  { id: 'EXP-005', date: '2026-06-04', vendor: 'IrriTech Services', category: 'Maintenance', amount: 420000, description: 'Irrigation system repair', status: 'pending', approvedBy: 'COO' },
];

const EXP_CATEGORIES = ['Payroll', 'Supplies', 'Operations', 'Admin', 'Maintenance', 'Marketing', 'Utilities', 'Other'];

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [form, setForm] = useState<Omit<ExpenseEntry, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    vendor: '', category: 'Supplies', amount: 0, description: '', status: 'pending', approvedBy: '',
  });

  const totalPaid = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
  const totalOverdue = expenses.filter(e => e.status === 'overdue').reduce((s, e) => s + e.amount, 0);

  const filtered = filterStatus === 'all' ? expenses : expenses.filter(e => e.status === filterStatus);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setExpenses(prev => [{ ...form, id: `EXP-${Date.now()}` }, ...prev]);
    setShowModal(false);
    setForm({ date: new Date().toISOString().split('T')[0], vendor: '', category: 'Supplies', amount: 0, description: '', status: 'pending', approvedBy: '' });
  };

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon green mb-3"><i className="fas fa-check-circle"></i></div>
            <div className="kpi-label">Paid Expenses</div>
            <div className="kpi-value text-danger">{formatCurrency(totalPaid)}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon orange mb-3"><i className="fas fa-clock"></i></div>
            <div className="kpi-label">Pending</div>
            <div className="kpi-value" style={{ color: '#f97316' }}>{formatCurrency(totalPending)}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon red mb-3"><i className="fas fa-exclamation-circle"></i></div>
            <div className="kpi-label">Overdue</div>
            <div className="kpi-value text-danger">{formatCurrency(totalOverdue)}</div>
          </div>
        </div>
      </div>

      <div className="finance-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center px-4 pt-4 pb-3 gap-3">
          <h6 className="fw-bold text-dark mb-0">Expense Records</h6>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
            <button className="btn-finance-primary btn" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2"></i>Add Expense
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table finance-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Vendor</th><th>Category</th><th>Approved By</th><th>Status</th><th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(exp => (
                <tr key={exp.id}>
                  <td className="text-muted small">{exp.id}</td>
                  <td className="text-muted small">{formatDate(exp.date)}</td>
                  <td className="fw-medium">{exp.vendor}</td>
                  <td><span className="badge bg-light text-dark border">{exp.category}</span></td>
                  <td className="text-muted small">{exp.approvedBy || '—'}</td>
                  <td><span className={`badge-status ${exp.status}`}>{exp.status}</span></td>
                  <td className="text-end fw-bold text-danger">{formatCurrency(exp.amount)}</td>
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
                <h5 className="modal-title fw-bold">Add Expense</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Vendor</label>
                      <input className="form-control bg-light" required value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <select className="form-select bg-light" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {EXP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
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
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Approved By</label>
                      <input className="form-control bg-light" value={form.approvedBy} onChange={e => setForm(f => ({ ...f, approvedBy: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Description</label>
                      <textarea className="form-control bg-light" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-finance-primary btn">Save Expense</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Expenses;

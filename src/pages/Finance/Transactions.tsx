import React, { useState } from 'react';
import { demoTransactions, Transaction, formatCurrency, formatDate } from './financeTypes';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(demoTransactions);
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    description: '', category: '', type: 'income', amount: 0, status: 'completed', reference: '',
  });

  const filtered = transactions.filter(t => {
    const matchType = typeFilter === 'all' || t.type === typeFilter;
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const totalIn = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalOut = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setTransactions(prev => [{ ...form, id: `TXN-${Date.now()}` }, ...prev]);
    setShowModal(false);
  };

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon green mb-2"><i className="fas fa-arrow-down"></i></div>
            <div className="kpi-label">Total In (filtered)</div>
            <div className="kpi-value text-success">{formatCurrency(totalIn)}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon red mb-2"><i className="fas fa-arrow-up"></i></div>
            <div className="kpi-label">Total Out (filtered)</div>
            <div className="kpi-value text-danger">{formatCurrency(totalOut)}</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon blue mb-2"><i className="fas fa-balance-scale"></i></div>
            <div className="kpi-label">Net (filtered)</div>
            <div className="kpi-value" style={{ color: totalIn - totalOut >= 0 ? 'var(--primary-green)' : '#ef4444' }}>
              {formatCurrency(totalIn - totalOut)}
            </div>
          </div>
        </div>
      </div>

      <div className="finance-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center px-4 pt-4 pb-3 gap-3">
          <h6 className="fw-bold text-dark mb-0">All Transactions</h6>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input className="form-control form-control-sm" placeholder="Search..." style={{ width: '160px' }} value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select className="form-select form-select-sm" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="btn-finance-primary btn" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-1"></i> Add
            </button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table finance-table">
            <thead>
              <tr>
                <th>Ref.</th><th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Status</th><th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">No transactions match your filters.</td></tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id}>
                    <td className="text-muted small">{t.reference || t.id}</td>
                    <td className="text-muted small">{formatDate(t.date)}</td>
                    <td className="fw-medium">{t.description}</td>
                    <td><span className="badge bg-light text-dark border">{t.category}</span></td>
                    <td>
                      <span className={`badge-status ${t.type === 'income' ? 'received' : 'overdue'}`}>
                        <i className={`fas fa-arrow-${t.type === 'income' ? 'down' : 'up'} me-1`} style={{ fontSize: '9px' }}></i>
                        {t.type}
                      </span>
                    </td>
                    <td><span className={`badge-status ${t.status}`}>{t.status}</span></td>
                    <td className={`text-end fw-bold ${t.type === 'income' ? 'text-success' : 'text-danger'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block finance-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Add Transaction</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-8">
                      <label className="form-label small fw-semibold text-muted">Description</label>
                      <input className="form-control bg-light" required value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-muted">Type</label>
                      <select className="form-select bg-light" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <input className="form-control bg-light" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Amount (TZS)</label>
                      <input type="number" min={0} className="form-control bg-light" required value={form.amount} onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date</label>
                      <input type="date" className="form-control bg-light" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Status</label>
                      <select className="form-select bg-light" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Reference No.</label>
                      <input className="form-control bg-light" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="e.g., INV-2026-005" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-finance-primary btn">Save Transaction</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Transactions;

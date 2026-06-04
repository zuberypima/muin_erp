import React, { useState } from 'react';
import { Loan, demoLoans, formatCurrency, formatDate } from './financeTypes';

const Loans: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>(demoLoans);
  const [showModal, setShowModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'all' | 'given' | 'received'>('all');
  const [form, setForm] = useState<Omit<Loan, 'id' | 'remainingAmount' | 'paidAmount'>>({
    borrower: '', principalAmount: 0, interestRate: 0,
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '', status: 'active', type: 'given',
  });

  const activeGiven = loans.filter(l => l.type === 'given' && l.status === 'active').reduce((s, l) => s + l.remainingAmount, 0);
  const activeReceived = loans.filter(l => l.type === 'received' && l.status === 'active').reduce((s, l) => s + l.remainingAmount, 0);
  const overdueCount = loans.filter(l => l.status === 'overdue').length;

  const filtered = typeFilter === 'all' ? loans : loans.filter(l => l.type === typeFilter);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setLoans(prev => [{ ...form, id: `LN-${Date.now()}`, paidAmount: 0, remainingAmount: form.principalAmount }, ...prev]);
    setShowModal(false);
  };

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon green mb-3"><i className="fas fa-hand-holding-usd"></i></div>
            <div className="kpi-label">Loans Given (Active)</div>
            <div className="kpi-value text-success">{formatCurrency(activeGiven)}</div>
            <div className="kpi-change positive">Outstanding receivable</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon orange mb-3"><i className="fas fa-university"></i></div>
            <div className="kpi-label">Loans Received (Active)</div>
            <div className="kpi-value" style={{ color: '#f97316' }}>{formatCurrency(activeReceived)}</div>
            <div className="kpi-change" style={{ color: '#f97316' }}>Outstanding payable</div>
          </div>
        </div>
        <div className="col-sm-4">
          <div className="kpi-card">
            <div className="kpi-icon red mb-3"><i className="fas fa-exclamation-triangle"></i></div>
            <div className="kpi-label">Overdue Loans</div>
            <div className="kpi-value text-danger">{overdueCount}</div>
            <div className="kpi-change negative">Require immediate action</div>
          </div>
        </div>
      </div>

      <div className="finance-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center px-4 pt-4 pb-3 gap-3">
          <h6 className="fw-bold text-dark mb-0">Loan Records</h6>
          <div className="d-flex gap-2 flex-wrap">
            <div className="btn-group">
              {(['all', 'given', 'received'] as const).map(t => (
                <button key={t} className={`btn btn-sm ${typeFilter === t ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setTypeFilter(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
              ))}
            </div>
            <button className="btn-finance-primary btn" onClick={() => setShowModal(true)}><i className="fas fa-plus me-1"></i>Add Loan</button>
          </div>
        </div>
        <div className="table-responsive">
          <table className="table finance-table">
            <thead>
              <tr><th>ID</th><th>Borrower/Lender</th><th>Type</th><th>Principal</th><th>Interest</th><th>Paid</th><th>Remaining</th><th>Due Date</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filtered.map(loan => {
                const pct = Math.min((loan.paidAmount / loan.principalAmount) * 100, 100);
                return (
                  <tr key={loan.id}>
                    <td className="text-muted small">{loan.id}</td>
                    <td className="fw-medium">{loan.borrower}</td>
                    <td>
                      <span className={`badge-status ${loan.type === 'given' ? 'received' : 'pending'}`}>
                        {loan.type === 'given' ? 'Given' : 'Received'}
                      </span>
                    </td>
                    <td>{formatCurrency(loan.principalAmount)}</td>
                    <td className="text-muted">{loan.interestRate}%</td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="budget-bar-bg flex-grow-1" style={{ minWidth: '60px' }}>
                          <div className="budget-bar-fill" style={{ width: `${pct}%`, background: 'var(--primary-green)' }}></div>
                        </div>
                        <span className="small">{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className={`fw-bold ${loan.status === 'overdue' ? 'text-danger' : 'text-dark'}`}>{formatCurrency(loan.remainingAmount)}</td>
                    <td className="text-muted small">{formatDate(loan.dueDate)}</td>
                    <td><span className={`badge-status ${loan.status}`}>{loan.status}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show d-block finance-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Record Loan</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-8">
                      <label className="form-label small fw-semibold text-muted">Borrower / Lender Name</label>
                      <input className="form-control bg-light" required value={form.borrower} onChange={e => setForm(f => ({ ...f, borrower: e.target.value }))} />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-muted">Type</label>
                      <select className="form-select bg-light" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}>
                        <option value="given">Given</option>
                        <option value="received">Received</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Principal (TZS)</label>
                      <input type="number" min={0} className="form-control bg-light" required value={form.principalAmount} onChange={e => setForm(f => ({ ...f, principalAmount: +e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Interest Rate (%)</label>
                      <input type="number" step="0.1" min={0} className="form-control bg-light" value={form.interestRate} onChange={e => setForm(f => ({ ...f, interestRate: +e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Start Date</label>
                      <input type="date" className="form-control bg-light" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Due Date</label>
                      <input type="date" className="form-control bg-light" required value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-finance-primary btn">Save Loan</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Loans;

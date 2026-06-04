import React, { useState } from 'react';
import { Budget, demoBudgets, formatCurrency } from './financeTypes';

const Budgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(demoBudgets);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Budget, 'id' | 'spentAmount'>>({
    category: '', allocatedAmount: 0, period: 'monthly',
    startDate: new Date().toISOString().split('T')[0], endDate: '',
  });

  const totalAllocated = budgets.reduce((s, b) => s + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0);
  const totalRemaining = totalAllocated - totalSpent;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setBudgets(prev => [{ ...form, id: `BDG-${Date.now()}`, spentAmount: 0 }, ...prev]);
    setShowModal(false);
    setForm({ category: '', allocatedAmount: 0, period: 'monthly', startDate: new Date().toISOString().split('T')[0], endDate: '' });
  };

  return (
    <>
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Allocated', value: totalAllocated, color: 'blue', icon: 'fa-wallet', textClass: '' },
          { label: 'Total Spent', value: totalSpent, color: 'red', icon: 'fa-fire', textClass: 'text-danger' },
          { label: 'Remaining', value: totalRemaining, color: 'green', icon: 'fa-piggy-bank', textClass: 'text-success' },
        ].map(({ label, value, color, icon, textClass }) => (
          <div className="col-sm-4" key={label}>
            <div className="kpi-card">
              <div className={`kpi-icon ${color} mb-3`}><i className={`fas ${icon}`}></i></div>
              <div className="kpi-label">{label}</div>
              <div className={`kpi-value ${textClass}`}>{formatCurrency(value)}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="finance-table-card">
        <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
          <h6 className="fw-bold text-dark mb-0">Budget Allocations</h6>
          <button className="btn-finance-primary btn" onClick={() => setShowModal(true)}><i className="fas fa-plus me-2"></i>New Budget</button>
        </div>
        <div className="table-responsive">
          <table className="table finance-table">
            <thead><tr><th>Category</th><th>Period</th><th>Spent</th><th>Allocated</th><th>Usage</th><th>Remaining</th></tr></thead>
            <tbody>
              {budgets.map(b => {
                const pct = Math.min((b.spentAmount / b.allocatedAmount) * 100, 100);
                const barColor = pct > 85 ? '#ef4444' : pct > 65 ? '#f97316' : 'var(--primary-green)';
                const remaining = b.allocatedAmount - b.spentAmount;
                return (
                  <tr key={b.id}>
                    <td className="fw-medium">{b.category}</td>
                    <td><span className="badge bg-light text-dark border text-capitalize">{b.period}</span></td>
                    <td className="text-danger fw-medium">{formatCurrency(b.spentAmount)}</td>
                    <td className="fw-medium">{formatCurrency(b.allocatedAmount)}</td>
                    <td style={{ minWidth: '130px' }}>
                      <div className="d-flex align-items-center gap-2">
                        <div className="budget-bar-bg flex-grow-1">
                          <div className="budget-bar-fill" style={{ width: `${pct}%`, background: barColor }}></div>
                        </div>
                        <span className="small fw-semibold" style={{ color: barColor, minWidth: '36px' }}>{pct.toFixed(0)}%</span>
                      </div>
                    </td>
                    <td className={`fw-bold ${remaining < 0 ? 'text-danger' : 'text-success'}`}>{formatCurrency(remaining)}</td>
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
                <h5 className="modal-title fw-bold">Create Budget</h5>
                <button className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-8">
                      <label className="form-label small fw-semibold text-muted">Category Name</label>
                      <input className="form-control bg-light" required value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
                    </div>
                    <div className="col-4">
                      <label className="form-label small fw-semibold text-muted">Period</label>
                      <select className="form-select bg-light" value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value as any }))}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Allocated Amount (TZS)</label>
                      <input type="number" min={0} className="form-control bg-light" required value={form.allocatedAmount} onChange={e => setForm(f => ({ ...f, allocatedAmount: +e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Start Date</label>
                      <input type="date" className="form-control bg-light" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">End Date</label>
                      <input type="date" className="form-control bg-light" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-finance-primary btn">Create Budget</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Budgets;

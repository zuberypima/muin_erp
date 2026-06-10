import React, { useState, useMemo } from 'react';
import { ExpenseEntry, formatCurrency, formatDate } from './financeTypes';

// ─── Demo Data ───────────────────────────────────────────────────────────────
const initialExpenses: ExpenseEntry[] = [
  { id: 'EXP-001', date: '2026-06-01', vendor: 'Payroll Office',     category: 'Payroll',     amount: 2800000, description: 'Staff salaries – May 2026',        status: 'paid',    approvedBy: 'Director',     notes: '' },
  { id: 'EXP-002', date: '2026-06-01', vendor: 'AgriSupply Ltd',     category: 'Supplies',    amount: 650000,  description: 'Fertilizer purchase',              status: 'paid',    approvedBy: 'Farm Manager', notes: '' },
  { id: 'EXP-003', date: '2026-06-03', vendor: 'PetroTech',          category: 'Operations',  amount: 180000,  description: 'Tractor fuel – June',             status: 'paid',    approvedBy: '',             notes: '' },
  { id: 'EXP-004', date: '2026-06-04', vendor: 'SmartOffice',        category: 'Admin',       amount: 55000,   description: 'Office supplies',                 status: 'paid',    approvedBy: '',             notes: '' },
  { id: 'EXP-005', date: '2026-06-04', vendor: 'IrriTech Services',  category: 'Maintenance', amount: 420000,  description: 'Irrigation system repair',        status: 'pending', approvedBy: 'COO',          notes: 'Urgent – crop season' },
  { id: 'EXP-006', date: '2026-06-05', vendor: 'MediaEdge',          category: 'Marketing',   amount: 120000,  description: 'Social media campaign',           status: 'pending', approvedBy: '',             notes: '' },
  { id: 'EXP-007', date: '2026-05-28', vendor: 'PowerGrid TZ',       category: 'Utilities',   amount: 230000,  description: 'Electricity bill – May',          status: 'overdue', approvedBy: '',             notes: 'Follow up needed' },
  { id: 'EXP-008', date: '2026-06-06', vendor: 'TechLease Ltd',      category: 'Admin',       amount: 95000,   description: 'Software subscription – annual',  status: 'pending', approvedBy: 'IT Manager',   notes: '' },
];

const EXP_CATEGORIES = ['Payroll', 'Supplies', 'Operations', 'Admin', 'Maintenance', 'Marketing', 'Utilities', 'Other'];

const CATEGORY_COLORS: Record<string, string> = {
  Payroll: '#6366f1', Supplies: '#10b981', Operations: '#f97316',
  Admin: '#3b82f6', Maintenance: '#f59e0b', Marketing: '#ec4899',
  Utilities: '#8b5cf6', Other: '#6b7280',
};

// ─── Sparkline SVG ───────────────────────────────────────────────────────────
const Sparkline: React.FC<{ values: number[]; color: string }> = ({ values, color }) => {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const W = 80; const H = 28;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const blankForm = (): Omit<ExpenseEntry, 'id'> => ({
  date: new Date().toISOString().split('T')[0],
  vendor: '', category: 'Supplies', amount: 0, description: '', status: 'pending', approvedBy: '', notes: '',
});

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(initialExpenses);

  // Filters
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo,   setFilterDateTo]   = useState('');
  const [filterMinAmt,   setFilterMinAmt]   = useState('');
  const [filterMaxAmt,   setFilterMaxAmt]   = useState('');
  const [search, setSearch] = useState('');

  // Modal state
  const [showModal,   setShowModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState<ExpenseEntry | null>(null);
  const [deleteTarget,setDeleteTarget]= useState<ExpenseEntry | null>(null);
  const [form, setForm] = useState<Omit<ExpenseEntry, 'id'>>(blankForm());

  // Bulk selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── KPIs ──
  const totalPaid    = expenses.filter(e => e.status === 'paid').reduce((s, e) => s + e.amount, 0);
  const totalPending = expenses.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
  const totalOverdue = expenses.filter(e => e.status === 'overdue').reduce((s, e) => s + e.amount, 0);
  const totalAll     = expenses.reduce((s, e) => s + e.amount, 0);

  // ── Category breakdown ──
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach(e => { map[e.category] = (map[e.category] || 0) + e.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [expenses]);

  const maxCatAmount = categoryTotals[0]?.[1] ?? 1;

  // ── Monthly sparkline values (last 6 months demo) ──
  const sparklineData = [1800000, 2200000, 3100000, 2700000, 3500000, totalAll];

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return expenses.filter(e => {
      if (filterStatus !== 'all' && e.status !== filterStatus) return false;
      if (filterCategory !== 'all' && e.category !== filterCategory) return false;
      if (filterDateFrom && e.date < filterDateFrom) return false;
      if (filterDateTo   && e.date > filterDateTo)   return false;
      if (filterMinAmt && e.amount < +filterMinAmt) return false;
      if (filterMaxAmt && e.amount > +filterMaxAmt) return false;
      if (search && !`${e.vendor} ${e.description} ${e.id}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [expenses, filterStatus, filterCategory, filterDateFrom, filterDateTo, filterMinAmt, filterMaxAmt, search]);

  // ── Handlers ──
  const openAdd = () => { setEditTarget(null); setForm(blankForm()); setShowModal(true); };
  const openEdit = (exp: ExpenseEntry) => { setEditTarget(exp); setForm({ ...exp }); setShowModal(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      setExpenses(prev => prev.map(x => x.id === editTarget.id ? { ...form, id: editTarget.id } : x));
    } else {
      setExpenses(prev => [{ ...form, id: `EXP-${Date.now()}` }, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
    setSelected(prev => { const s = new Set(prev); s.delete(deleteTarget.id); return s; });
    setDeleteTarget(null);
  };

  const handleApprove = (id: string) =>
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'paid' as const } : e));

  const handleReject = (id: string) =>
    setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: 'overdue' as const } : e));

  const toggleSelect = (id: string) =>
    setSelected(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const toggleAll = () =>
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(e => e.id)));

  const bulkApprove = () =>
    setExpenses(prev => prev.map(e => selected.has(e.id) ? { ...e, status: 'paid' as const } : e));

  const exportCSV = () => {
    const rows = [
      ['ID', 'Date', 'Vendor', 'Category', 'Amount', 'Status', 'Approved By', 'Description'],
      ...filtered.map(e => [e.id, e.date, e.vendor, e.category, e.amount, e.status, e.approvedBy ?? '', e.description ?? '']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'expenses.csv';
    a.click();
  };

  const kpis = [
    { label: 'Total Expenses', value: formatCurrency(totalAll),    icon: 'fas fa-receipt',           color: 'blue',   sub: `${expenses.length} records` },
    { label: 'Paid',           value: formatCurrency(totalPaid),   icon: 'fas fa-check-circle',      color: 'green',  sub: `${expenses.filter(e=>e.status==='paid').length} entries` },
    { label: 'Pending Approval',value:formatCurrency(totalPending),icon: 'fas fa-hourglass-half',    color: 'orange', sub: `${expenses.filter(e=>e.status==='pending').length} awaiting` },
    { label: 'Overdue',        value: formatCurrency(totalOverdue),icon: 'fas fa-exclamation-circle', color: 'red',    sub: `${expenses.filter(e=>e.status==='overdue').length} items` },
  ];

  return (
    <>
      {/* ── KPIs ── */}
      <div className="row g-3 mb-4">
        {kpis.map(k => (
          <div key={k.label} className="col-sm-6 col-lg-3">
            <div className="kpi-card">
              <div className={`kpi-icon ${k.color} mb-3`}><i className={k.icon} /></div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-change">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Category Breakdown + Sparkline ── */}
      <div className="row g-3 mb-4">
        <div className="col-lg-7">
          <div className="finance-table-card p-4">
            <h6 className="fw-bold text-dark mb-3">
              <i className="fas fa-tags me-2 text-primary" style={{ color: '#6366f1' }} />
              Spend by Category
            </h6>
            <div className="d-flex flex-column gap-2">
              {categoryTotals.map(([cat, amt]) => (
                <div key={cat}>
                  <div className="d-flex justify-content-between mb-1">
                    <span className="small fw-semibold" style={{ color: CATEGORY_COLORS[cat] ?? '#6b7280' }}>
                      <i className="fas fa-circle me-1" style={{ fontSize: '0.5rem', verticalAlign: 'middle' }} />
                      {cat}
                    </span>
                    <span className="small fw-bold text-dark">{formatCurrency(amt)}</span>
                  </div>
                  <div className="budget-bar-bg">
                    <div
                      className="budget-bar-fill"
                      style={{ width: `${(amt / maxCatAmount) * 100}%`, background: CATEGORY_COLORS[cat] ?? '#6b7280' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="finance-table-card p-4 h-100">
            <h6 className="fw-bold text-dark mb-3">
              <i className="fas fa-chart-line me-2" style={{ color: '#10b981' }} />
              Monthly Expense Trend
            </h6>
            <div className="d-flex flex-column gap-3">
              <div>
                <div className="kpi-label">6-Month Total</div>
                <div className="kpi-value">{formatCurrency(sparklineData.reduce((a, b) => a + b, 0))}</div>
                <div className="mt-2">
                  <Sparkline values={sparklineData} color="#10b981" />
                </div>
              </div>
              <hr style={{ borderColor: '#f3f4f6', margin: '0.25rem 0' }} />
              <div className="row g-2 text-center">
                <div className="col-4">
                  <div className="kpi-label">Paid</div>
                  <div className="fw-bold" style={{ color: '#10b981', fontSize: '1rem' }}>
                    {Math.round((totalPaid / (totalAll || 1)) * 100)}%
                  </div>
                </div>
                <div className="col-4">
                  <div className="kpi-label">Pending</div>
                  <div className="fw-bold" style={{ color: '#f97316', fontSize: '1rem' }}>
                    {Math.round((totalPending / (totalAll || 1)) * 100)}%
                  </div>
                </div>
                <div className="col-4">
                  <div className="kpi-label">Overdue</div>
                  <div className="fw-bold" style={{ color: '#ef4444', fontSize: '1rem' }}>
                    {Math.round((totalOverdue / (totalAll || 1)) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="finance-table-card">
        {/* Toolbar */}
        <div className="d-flex flex-wrap justify-content-between align-items-start px-4 pt-4 pb-3 gap-3">
          <div>
            <h6 className="fw-bold text-dark mb-1">Expense Records</h6>
            <p className="text-muted small mb-0">{filtered.length} of {expenses.length} entries</p>
          </div>
          <div className="d-flex gap-2 flex-wrap align-items-center">
            <button className="btn btn-light btn-sm fw-semibold" onClick={exportCSV}>
              <i className="fas fa-download me-1" /> Export CSV
            </button>
            {selected.size > 0 && (
              <button className="btn btn-sm fw-semibold" style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }} onClick={bulkApprove}>
                <i className="fas fa-check me-1" /> Approve {selected.size} Selected
              </button>
            )}
            <button className="btn-finance-primary btn" onClick={openAdd}>
              <i className="fas fa-plus me-2" />Add Expense
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pb-3 d-flex flex-wrap gap-2 align-items-center" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <input
            className="form-control form-control-sm" placeholder="Search vendor / description…"
            style={{ maxWidth: 220 }} value={search} onChange={e => setSearch(e.target.value)}
          />
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select className="form-select form-select-sm" style={{ width: 'auto' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {EXP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="date" className="form-control form-control-sm" style={{ width: 'auto' }} value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} title="From date" />
          <input type="date" className="form-control form-control-sm" style={{ width: 'auto' }} value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} title="To date" />
          <input type="number" className="form-control form-control-sm" placeholder="Min amt" style={{ width: 100 }} value={filterMinAmt} onChange={e => setFilterMinAmt(e.target.value)} />
          <input type="number" className="form-control form-control-sm" placeholder="Max amt" style={{ width: 100 }} value={filterMaxAmt} onChange={e => setFilterMaxAmt(e.target.value)} />
          {(filterStatus !== 'all' || filterCategory !== 'all' || search || filterDateFrom || filterDateTo || filterMinAmt || filterMaxAmt) && (
            <button className="btn btn-sm btn-light" onClick={() => {
              setFilterStatus('all'); setFilterCategory('all'); setSearch('');
              setFilterDateFrom(''); setFilterDateTo(''); setFilterMinAmt(''); setFilterMaxAmt('');
            }}>
              <i className="fas fa-times me-1" />Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-responsive">
          <table className="table finance-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll} style={{ cursor: 'pointer' }} />
                </th>
                <th>ID</th><th>Date</th><th>Vendor</th><th>Category</th>
                <th>Approved By</th><th>Status</th><th className="text-end">Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-5">No records match the current filters.</td></tr>
              ) : filtered.map(exp => (
                <tr key={exp.id} style={{ background: selected.has(exp.id) ? '#f0fdf4' : undefined }}>
                  <td>
                    <input type="checkbox" checked={selected.has(exp.id)} onChange={() => toggleSelect(exp.id)} style={{ cursor: 'pointer' }} />
                  </td>
                  <td className="text-muted small">{exp.id}</td>
                  <td className="text-muted small">{formatDate(exp.date)}</td>
                  <td>
                    <div className="fw-medium">{exp.vendor}</div>
                    {exp.description && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{exp.description}</div>}
                  </td>
                  <td>
                    <span className="badge rounded-pill border" style={{
                      background: `${CATEGORY_COLORS[exp.category] ?? '#6b7280'}15`,
                      color: CATEGORY_COLORS[exp.category] ?? '#6b7280',
                      borderColor: `${CATEGORY_COLORS[exp.category] ?? '#6b7280'}40 !important`,
                      fontSize: '0.75rem', fontWeight: 600, padding: '0.3em 0.75em',
                    }}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="text-muted small">{exp.approvedBy || '—'}</td>
                  <td><span className={`badge-status ${exp.status}`}>{exp.status}</span></td>
                  <td className="text-end fw-bold text-danger">{formatCurrency(exp.amount)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      {exp.status === 'pending' && (
                        <>
                          <button className="btn btn-sm" style={{ background: '#ecfdf5', color: '#059669', border: 'none', borderRadius: 6, padding: '0.2rem 0.5rem' }}
                            title="Approve" onClick={() => handleApprove(exp.id)}>
                            <i className="fas fa-check" />
                          </button>
                          <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.2rem 0.5rem' }}
                            title="Reject" onClick={() => handleReject(exp.id)}>
                            <i className="fas fa-times" />
                          </button>
                        </>
                      )}
                      <button className="btn btn-sm" style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 6, padding: '0.2rem 0.5rem' }}
                        title="Edit" onClick={() => openEdit(exp)}>
                        <i className="fas fa-pen" />
                      </button>
                      <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.2rem 0.5rem' }}
                        title="Delete" onClick={() => setDeleteTarget(exp)}>
                        <i className="fas fa-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="modal fade show d-block finance-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className={`fas ${editTarget ? 'fa-pen' : 'fa-plus-circle'} me-2`} style={{ color: '#10b981' }} />
                  {editTarget ? 'Edit Expense' : 'Add Expense'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Vendor / Payee</label>
                      <input className="form-control bg-light" required value={form.vendor}
                        onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <select className="form-select bg-light" value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {EXP_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Amount (TZS)</label>
                      <input type="number" className="form-control bg-light" required min={0} value={form.amount}
                        onChange={e => setForm(f => ({ ...f, amount: +e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Date</label>
                      <input type="date" className="form-control bg-light" value={form.date}
                        onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Status</label>
                      <select className="form-select bg-light" value={form.status}
                        onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="overdue">Overdue</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Approved By</label>
                      <input className="form-control bg-light" value={form.approvedBy}
                        onChange={e => setForm(f => ({ ...f, approvedBy: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Description</label>
                      <input className="form-control bg-light" value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Notes / Receipt Reference</label>
                      <textarea className="form-control bg-light" rows={2} value={form.notes}
                        onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-finance-primary btn">
                    <i className="fas fa-save me-2" />{editTarget ? 'Update Expense' : 'Save Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="modal fade show d-block finance-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content">
              <div className="modal-body text-center py-4">
                <div style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '0.75rem' }}>
                  <i className="fas fa-trash-alt" />
                </div>
                <h5 className="fw-bold text-dark">Delete Expense?</h5>
                <p className="text-muted mb-0">
                  <strong>{deleteTarget.vendor}</strong> — {formatCurrency(deleteTarget.amount)}<br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer justify-content-center gap-2">
                <button className="btn btn-light fw-semibold px-4" onClick={() => setDeleteTarget(null)}>Cancel</button>
                <button className="btn fw-semibold px-4" style={{ background: '#ef4444', color: '#fff' }} onClick={handleDelete}>
                  <i className="fas fa-trash me-2" />Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Expenses;

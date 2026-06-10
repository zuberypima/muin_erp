import React, { useState, useMemo } from 'react';
import {
  CashflowEntry, CashflowForecast,
  demoCashflowEntries, demoCashflowForecast,
  formatCurrency, formatDate,
} from './financeTypes';

// ─── SVG Bar Chart ─────────────────────────────────────────────────────────────
const CashflowBarChart: React.FC<{ data: CashflowForecast[] }> = ({ data }) => {
  const W = 700; const H = 180; const padL = 10; const padR = 10; const padT = 10; const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const barCount = data.length;
  const groupW = chartW / barCount;
  const barW = Math.min(groupW * 0.35, 22);
  const gap = barW * 0.3;

  const maxVal = Math.max(...data.flatMap(d => [d.projected_inflow, d.actual_inflow || d.projected_inflow, d.projected_outflow, d.actual_outflow || d.projected_outflow]), 1);
  const scale = (v: number) => (v / maxVal) * chartH;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      {/* Y gridlines */}
      {[0.25, 0.5, 0.75, 1].map(f => (
        <line key={f} x1={padL} x2={W - padR} y1={padT + chartH - scale(maxVal * f)} y2={padT + chartH - scale(maxVal * f)}
          stroke="#f3f4f6" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const cx = padL + i * groupW + groupW / 2;
        const isFuture = d.actual_inflow === 0 && d.actual_outflow === 0;
        const inflowH   = scale(isFuture ? d.projected_inflow   : d.actual_inflow);
        const outflowH  = scale(isFuture ? d.projected_outflow  : d.actual_outflow);
        return (
          <g key={d.month}>
            {/* Inflow bar */}
            <rect x={cx - barW - gap / 2} y={padT + chartH - inflowH}
              width={barW} height={inflowH} rx={3}
              fill={isFuture ? '#a7f3d0' : '#10b981'} opacity={isFuture ? 0.5 : 1} />
            {/* Outflow bar */}
            <rect x={cx + gap / 2} y={padT + chartH - outflowH}
              width={barW} height={outflowH} rx={3}
              fill={isFuture ? '#fca5a5' : '#ef4444'} opacity={isFuture ? 0.5 : 1} />
            {/* Month label */}
            <text x={cx} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {d.month.split(' ')[0]}
            </text>
          </g>
        );
      })}
      {/* Legend */}
      <rect x={padL} y={2} width={10} height={10} rx={2} fill="#10b981" />
      <text x={padL + 14} y={10} fontSize={9} fill="#6b7280">Inflow</text>
      <rect x={padL + 60} y={2} width={10} height={10} rx={2} fill="#ef4444" />
      <text x={padL + 74} y={10} fontSize={9} fill="#6b7280">Outflow</text>
      <rect x={padL + 120} y={2} width={10} height={10} rx={2} fill="#a7f3d0" opacity={0.7} />
      <text x={padL + 134} y={10} fontSize={9} fill="#6b7280">Projected</text>
    </svg>
  );
};

// ─── Health Indicator ──────────────────────────────────────────────────────────
const HealthBadge: React.FC<{ net: number; total: number }> = ({ net, total }) => {
  const ratio = total > 0 ? net / total : 0;
  if (ratio > 0.25) return (
    <span className="cashflow-health healthy">
      <i className="fas fa-circle-check me-1" /> Healthy Cashflow
    </span>
  );
  if (ratio > 0) return (
    <span className="cashflow-health warning">
      <i className="fas fa-triangle-exclamation me-1" /> Moderate Risk
    </span>
  );
  return (
    <span className="cashflow-health danger">
      <i className="fas fa-circle-xmark me-1" /> Negative Cashflow
    </span>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const blankEntry = (): Omit<CashflowEntry, 'id'> => ({
  date: new Date().toISOString().split('T')[0],
  description: '', type: 'inflow', category: 'Sales', amount: 0, reference: '',
});

const CF_INFLOW_CATS  = ['Sales', 'Rental', 'Services', 'Interest', 'Grants', 'Other'];
const CF_OUTFLOW_CATS = ['Payroll', 'Supplies', 'Operations', 'Maintenance', 'Utilities', 'Marketing', 'Admin', 'Other'];

const CashFlow: React.FC = () => {
  const [entries, setEntries] = useState<CashflowEntry[]>(demoCashflowEntries);
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [typeFilter, setTypeFilter] = useState<'all' | 'inflow' | 'outflow'>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<CashflowEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CashflowEntry | null>(null);
  const [form, setForm] = useState<Omit<CashflowEntry, 'id'>>(blankEntry());

  // ── KPIs ──
  const totalInflow  = entries.filter(e => e.type === 'inflow').reduce((s, e) => s + e.amount, 0);
  const totalOutflow = entries.filter(e => e.type === 'outflow').reduce((s, e) => s + e.amount, 0);
  const netCashflow  = totalInflow - totalOutflow;
  const burnRate     = totalOutflow / Math.max(entries.length, 1) * 30; // avg daily * 30

  // ── Filtered ledger ──
  const filtered = useMemo(() => entries.filter(e => {
    if (typeFilter !== 'all' && e.type !== typeFilter) return false;
    if (search && !`${e.description} ${e.category} ${e.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [entries, typeFilter, search]);

  // ── Handlers ──
  const openAdd = () => { setEditTarget(null); setForm(blankEntry()); setShowModal(true); };
  const openEdit = (entry: CashflowEntry) => { setEditTarget(entry); setForm({ ...entry }); setShowModal(true); };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      setEntries(prev => prev.map(x => x.id === editTarget.id ? { ...form, id: editTarget.id } : x));
    } else {
      setEntries(prev => [{ ...form, id: `CF-${Date.now()}` }, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    setEntries(prev => prev.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Date', 'Description', 'Type', 'Category', 'Amount', 'Reference'],
      ...filtered.map(e => [e.id, e.date, e.description, e.type, e.category, e.amount, e.reference ?? '']),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'cashflow.csv';
    a.click();
  };

  const kpis = [
    {
      label: 'Net Cashflow', value: formatCurrency(netCashflow), icon: 'fas fa-water',
      color: netCashflow >= 0 ? 'green' : 'red',
      sub: netCashflow >= 0 ? 'Positive position' : 'Deficit position',
    },
    { label: 'Total Inflows',  value: formatCurrency(totalInflow),  icon: 'fas fa-arrow-down-to-line', color: 'green',  sub: `${entries.filter(e => e.type === 'inflow').length} transactions` },
    { label: 'Total Outflows', value: formatCurrency(totalOutflow), icon: 'fas fa-arrow-up-from-line', color: 'red',    sub: `${entries.filter(e => e.type === 'outflow').length} transactions` },
    { label: 'Est. Burn Rate', value: formatCurrency(burnRate),     icon: 'fas fa-fire',               color: 'orange', sub: 'Per month (avg)' },
  ];

  const catOptions = form.type === 'inflow' ? CF_INFLOW_CATS : CF_OUTFLOW_CATS;

  return (
    <>
      {/* ── Header row ── */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <HealthBadge net={netCashflow} total={totalInflow} />
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {(['daily', 'weekly', 'monthly'] as const).map(p => (
            <button key={p} className={`btn btn-sm fw-semibold ${period === p ? 'btn-finance-primary' : 'btn-light'}`}
              style={{ textTransform: 'capitalize', borderRadius: 8 }} onClick={() => setPeriod(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="row g-3 mb-4">
        {kpis.map(k => (
          <div key={k.label} className="col-sm-6 col-lg-3">
            <div className="kpi-card">
              <div className={`kpi-icon ${k.color} mb-3`}><i className={k.icon} /></div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ color: k.color === 'red' ? '#ef4444' : k.color === 'green' ? '#10b981' : undefined }}>
                {k.value}
              </div>
              <div className="kpi-change">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Bar Chart ── */}
      <div className="finance-table-card p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
          <h6 className="fw-bold text-dark mb-0">
            <i className="fas fa-chart-column me-2" style={{ color: '#10b981' }} />
            12-Month Cashflow Chart
          </h6>
          <span className="small text-muted">Solid = actual · Faded = projected</span>
        </div>
        <CashflowBarChart data={demoCashflowForecast} />
      </div>

      {/* ── Forecast Table ── */}
      <div className="finance-table-card mb-4">
        <div className="px-4 pt-4 pb-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold text-dark mb-0">
            <i className="fas fa-table me-2" style={{ color: '#6366f1' }} />
            12-Month Forecast vs Actual
          </h6>
        </div>
        <div className="table-responsive">
          <table className="table finance-table">
            <thead>
              <tr>
                <th>Month</th>
                <th className="text-end">Proj. Inflow</th>
                <th className="text-end">Act. Inflow</th>
                <th className="text-end">Proj. Outflow</th>
                <th className="text-end">Act. Outflow</th>
                <th className="text-end">Net (Actual)</th>
                <th className="text-end">Variance</th>
              </tr>
            </thead>
            <tbody>
              {demoCashflowForecast.map(row => {
                const isFuture = row.actual_inflow === 0 && row.actual_outflow === 0;
                const actNet   = row.actual_inflow - row.actual_outflow;
                const projNet  = row.projected_inflow - row.projected_outflow;
                const variance = isFuture ? null : actNet - projNet;
                return (
                  <tr key={row.month} style={{ opacity: isFuture ? 0.6 : 1 }}>
                    <td className="fw-semibold">
                      {row.month}
                      {isFuture && <span className="ms-2 badge bg-light text-muted border" style={{ fontSize: '0.7rem' }}>Forecast</span>}
                    </td>
                    <td className="text-end text-muted small">{formatCurrency(row.projected_inflow)}</td>
                    <td className="text-end fw-semibold" style={{ color: '#10b981' }}>
                      {isFuture ? '—' : formatCurrency(row.actual_inflow)}
                    </td>
                    <td className="text-end text-muted small">{formatCurrency(row.projected_outflow)}</td>
                    <td className="text-end fw-semibold" style={{ color: '#ef4444' }}>
                      {isFuture ? '—' : formatCurrency(row.actual_outflow)}
                    </td>
                    <td className="text-end fw-bold" style={{ color: !isFuture ? (actNet >= 0 ? '#10b981' : '#ef4444') : '#9ca3af' }}>
                      {isFuture ? formatCurrency(projNet) : formatCurrency(actNet)}
                    </td>
                    <td className="text-end">
                      {variance !== null ? (
                        <span className={`badge-status ${variance >= 0 ? 'completed' : 'overdue'}`}>
                          <i className={`fas fa-arrow-${variance >= 0 ? 'up' : 'down'} me-1`} />
                          {formatCurrency(Math.abs(variance))}
                        </span>
                      ) : <span className="text-muted small">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Ledger ── */}
      <div className="finance-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-start px-4 pt-4 pb-3 gap-3">
          <div>
            <h6 className="fw-bold text-dark mb-1">
              <i className="fas fa-book me-2" style={{ color: '#6366f1' }} />
              Cashflow Ledger
            </h6>
            <p className="text-muted small mb-0">{filtered.length} of {entries.length} entries</p>
          </div>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-light btn-sm fw-semibold" onClick={exportCSV}>
              <i className="fas fa-download me-1" /> Export CSV
            </button>
            <button className="btn-finance-primary btn" onClick={openAdd}>
              <i className="fas fa-plus me-2" />Add Entry
            </button>
          </div>
        </div>

        {/* Ledger filters */}
        <div className="px-4 pb-3 d-flex flex-wrap gap-2" style={{ borderBottom: '1px solid #f3f4f6' }}>
          <input className="form-control form-control-sm" placeholder="Search…" style={{ maxWidth: 220 }}
            value={search} onChange={e => setSearch(e.target.value)} />
          {(['all', 'inflow', 'outflow'] as const).map(t => (
            <button key={t} className={`btn btn-sm fw-semibold ${typeFilter === t ? (t === 'inflow' ? 'btn-success' : t === 'outflow' ? 'btn-danger' : 'btn-dark') : 'btn-light'}`}
              style={{ textTransform: 'capitalize', borderRadius: 8 }} onClick={() => setTypeFilter(t)}>
              {t === 'all' ? 'All' : t === 'inflow' ? '↓ Inflows' : '↑ Outflows'}
            </button>
          ))}
        </div>

        <div className="table-responsive">
          <table className="table finance-table">
            <thead>
              <tr>
                <th>ID</th><th>Date</th><th>Description</th><th>Category</th>
                <th>Type</th><th>Reference</th><th className="text-end">Amount</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-5">No entries match the current filters.</td></tr>
              ) : filtered.map(entry => (
                <tr key={entry.id}>
                  <td className="text-muted small">{entry.id}</td>
                  <td className="text-muted small">{formatDate(entry.date)}</td>
                  <td className="fw-medium">{entry.description}</td>
                  <td><span className="badge bg-light text-dark border">{entry.category}</span></td>
                  <td>
                    <span className={`badge-status ${entry.type === 'inflow' ? 'completed' : 'overdue'}`}>
                      <i className={`fas fa-arrow-${entry.type === 'inflow' ? 'down' : 'up'} me-1`} />
                      {entry.type}
                    </span>
                  </td>
                  <td className="text-muted small">{entry.reference || '—'}</td>
                  <td className="text-end fw-bold" style={{ color: entry.type === 'inflow' ? '#10b981' : '#ef4444' }}>
                    {entry.type === 'inflow' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm" style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 6, padding: '0.2rem 0.5rem' }}
                        title="Edit" onClick={() => openEdit(entry)}>
                        <i className="fas fa-pen" />
                      </button>
                      <button className="btn btn-sm" style={{ background: '#fef2f2', color: '#dc2626', border: 'none', borderRadius: 6, padding: '0.2rem 0.5rem' }}
                        title="Delete" onClick={() => setDeleteTarget(entry)}>
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
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  <i className={`fas ${editTarget ? 'fa-pen' : 'fa-plus-circle'} me-2`} style={{ color: '#10b981' }} />
                  {editTarget ? 'Edit Entry' : 'Add Cashflow Entry'}
                </h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleSave}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Type</label>
                      <select className="form-select bg-light" value={form.type}
                        onChange={e => setForm(f => ({ ...f, type: e.target.value as 'inflow' | 'outflow', category: e.target.value === 'inflow' ? 'Sales' : 'Payroll' }))}>
                        <option value="inflow">↓ Inflow</option>
                        <option value="outflow">↑ Outflow</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold text-muted">Category</label>
                      <select className="form-select bg-light" value={form.category}
                        onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                        {catOptions.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Description</label>
                      <input className="form-control bg-light" required value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
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
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted">Reference (optional)</label>
                      <input className="form-control bg-light" value={form.reference}
                        onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-finance-primary btn">
                    <i className="fas fa-save me-2" />{editTarget ? 'Update Entry' : 'Save Entry'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteTarget && (
        <div className="modal fade show d-block finance-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content">
              <div className="modal-body text-center py-4">
                <div style={{ fontSize: '2.5rem', color: '#ef4444', marginBottom: '0.75rem' }}>
                  <i className="fas fa-trash-alt" />
                </div>
                <h5 className="fw-bold text-dark">Delete Entry?</h5>
                <p className="text-muted mb-0">
                  <strong>{deleteTarget.description}</strong> — {formatCurrency(deleteTarget.amount)}<br />
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

export default CashFlow;

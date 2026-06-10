import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { PurchaseRequest, PRItem, PRStatus } from './procurementTypes';
import { fmtKES } from './currencyUtils';

const DEPARTMENTS = ['Management','Farm Operations','Finance','Sales & Marketing','IT','Logistics','HR','Procurement'];
const STATUSES: PRStatus[] = ['draft','pending','approved','rejected','ordered'];

const statusBadge: Record<string, string> = {
  draft: 'badge-draft', pending: 'badge-pending', approved: 'badge-approved',
  rejected: 'badge-rejected', ordered: 'badge-ordered',
};

const emptyItem = (): PRItem => ({ name: '', qty: 1, unit: 'pcs', unit_cost: 0 });

const PurchaseRequests: React.FC = () => {
  const [prs, setPRs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPR, setEditPR] = useState<PurchaseRequest | null>(null);
  const [previewPR, setPreviewPR] = useState<PurchaseRequest | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: '', department: 'Procurement', required_by: '', notes: '', status: 'draft' as PRStatus,
  });
  const [items, setItems] = useState<PRItem[]>([emptyItem()]);

  const fetchPRs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterDept) params.department = filterDept;
      const res = await api.get('/procurement/purchase-requests/', { params });
      setPRs(res.data?.results ?? res.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus, filterDept]);

  useEffect(() => { fetchPRs(); }, [fetchPRs]);

  const openCreate = () => {
    setEditPR(null);
    setForm({ title: '', department: 'Procurement', required_by: '', notes: '', status: 'draft' });
    setItems([emptyItem()]);
    setShowModal(true);
  };

  const openEdit = (pr: PurchaseRequest) => {
    setEditPR(pr);
    setForm({ title: pr.title, department: pr.department, required_by: pr.required_by ?? '', notes: pr.notes, status: pr.status });
    setItems(pr.items.length ? pr.items : [emptyItem()]);
    setShowModal(true);
  };

  const totalAmount = items.reduce((s, i) => s + (i.qty * i.unit_cost), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, items, total_amount: totalAmount };
      if (editPR) {
        await api.patch(`/procurement/purchase-requests/${editPR.id}/`, payload);
      } else {
        await api.post('/procurement/purchase-requests/', payload);
      }
      setShowModal(false);
      fetchPRs();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'submit') => {
    try {
      await api.post(`/procurement/purchase-requests/${id}/${action}/`);
      fetchPRs();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this purchase request?')) return;
    try { await api.delete(`/procurement/purchase-requests/${id}/`); fetchPRs(); }
    catch (e) { console.error(e); }
  };

  const updateItem = (idx: number, field: keyof PRItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const filtered = prs.filter(p =>
    (p.title.toLowerCase().includes(search.toLowerCase()) ||
     p.pr_number.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="proc-card">
        <div className="proc-toolbar">
          <div className="proc-search">
            <i className="fas fa-search"></i>
            <input placeholder="Search by title or PR#..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="proc-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select className="proc-filter-select" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button className="proc-btn proc-btn-primary" onClick={openCreate}>
            <i className="fas fa-plus"></i> New Request
          </button>
        </div>

        <div className="proc-table-wrap">
          {loading ? (
            <div className="proc-empty"><div className="spinner-border text-primary" /></div>
          ) : (
            <table className="proc-table">
              <thead>
                <tr>
                  <th>PR #</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Requested By</th>
                  <th>Amount (TZS)</th>
                  <th>Required By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8}>
                      <div className="proc-empty"><i className="fas fa-file-alt"></i><p>No purchase requests found</p></div>
                    </td>
                  </tr>
                ) : filtered.map(pr => (
                  <tr key={pr.id}>
                    <td><code style={{ fontSize: '0.75rem', color: '#0ea5e9' }}>{pr.pr_number}</code></td>
                    <td style={{ fontWeight: 500 }}>{pr.title}</td>
                    <td>{pr.department}</td>
                    <td>{pr.requested_by_name ?? '—'}</td>
                    <td>{fmtKES(pr.total_amount)}</td>
                    <td>{pr.required_by ?? '—'}</td>
                    <td><span className={`proc-badge ${statusBadge[pr.status]}`}>{pr.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {pr.status === 'draft' && (
                          <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Submit" onClick={() => handleAction(pr.id, 'submit')}>
                            <i className="fas fa-paper-plane"></i>
                          </button>
                        )}
                        {pr.status === 'pending' && (
                          <>
                            <button className="proc-btn proc-btn-success proc-btn-sm" onClick={() => handleAction(pr.id, 'approve')}>
                              <i className="fas fa-check"></i>
                            </button>
                            <button className="proc-btn proc-btn-danger proc-btn-sm" onClick={() => handleAction(pr.id, 'reject')}>
                              <i className="fas fa-times"></i>
                            </button>
                          </>
                        )}
                        <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Preview" onClick={() => setPreviewPR(pr)}>
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Edit" onClick={() => openEdit(pr)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="proc-btn proc-btn-danger proc-btn-sm" title="Delete" onClick={() => handleDelete(pr.id)}>
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="proc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <h4>{editPR ? 'Edit Purchase Request' : 'New Purchase Request'}</h4>
              <button className="proc-modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="proc-modal-body">
              <div className="proc-form-grid">
                <div className="proc-form-group proc-form-full">
                  <label>Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Office stationery for Q3" />
                </div>
                <div className="proc-form-group">
                  <label>Department *</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Required By</label>
                  <input type="date" value={form.required_by} onChange={e => setForm(f => ({ ...f, required_by: e.target.value }))} />
                </div>
                <div className="proc-form-group proc-form-full">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </div>

              {/* Line Items */}
              <div className="line-items-section mt-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h5 style={{ margin: 0 }}>Line Items</h5>
                  <button className="proc-btn proc-btn-ghost proc-btn-sm" onClick={() => setItems(p => [...p, emptyItem()])}>
                    <i className="fas fa-plus"></i> Add Item
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  {['Item Name', 'Qty', 'Unit', 'Unit Cost (TZS)', ''].map(h => (
                    <span key={h} style={{ fontSize: '0.73rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</span>
                  ))}
                </div>
                {items.map((item, idx) => (
                  <div key={idx} className="line-item-row">
                    <input placeholder="Item name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} />
                    <input type="number" min={1} value={item.qty} onChange={e => updateItem(idx, 'qty', Number(e.target.value))} />
                    <input placeholder="pcs" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} />
                    <input type="number" min={0} value={item.unit_cost} onChange={e => updateItem(idx, 'unit_cost', Number(e.target.value))} />
                    <button className="remove-line-btn" onClick={() => setItems(p => p.filter((_, i) => i !== idx))}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
                <div style={{ textAlign: 'right', marginTop: '0.75rem', fontWeight: 700, color: '#1e293b', fontSize: '0.9rem' }}>
                  Total: {fmtKES(totalAmount)}
                </div>
              </div>
            </div>
            <div className="proc-modal-footer">
              <button className="proc-btn proc-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="proc-btn proc-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPR && (
        <div className="proc-modal-overlay" onClick={() => setPreviewPR(null)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>Purchase Request: {previewPR.pr_number}</h4>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="proc-btn proc-btn-ghost proc-btn-sm" onClick={() => window.print()} title="Print">
                  <i className="fas fa-print"></i>
                </button>
                <button className="proc-modal-close" onClick={() => setPreviewPR(null)} style={{ position: 'static' }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div className="proc-modal-body print-section">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <h6 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Title</h6>
                  <div style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1rem' }}>{previewPR.title}</div>
                  
                  <h6 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Department</h6>
                  <div>{previewPR.department}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h6 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Status</h6>
                  <div style={{ marginBottom: '1rem' }}>
                    <span className={`proc-badge ${statusBadge[previewPR.status]}`}>{previewPR.status}</span>
                  </div>
                  
                  <h6 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Required By</h6>
                  <div>{previewPR.required_by || '—'}</div>
                </div>
              </div>

              {previewPR.notes && (
                <div style={{ marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                  <h6 style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Notes</h6>
                  <div style={{ fontSize: '0.9rem' }}>{previewPR.notes}</div>
                </div>
              )}

              <h6 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.75rem' }}>Line Items</h6>
              <div className="proc-table-wrap">
                <table className="proc-table">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Qty</th>
                      <th>Unit</th>
                      <th style={{ textAlign: 'right' }}>Unit Cost (TZS)</th>
                      <th style={{ textAlign: 'right' }}>Total (TZS)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewPR.items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.name}</td>
                        <td>{item.qty}</td>
                        <td>{item.unit}</td>
                        <td style={{ textAlign: 'right' }}>{fmtKES(item.unit_cost)}</td>
                        <td style={{ textAlign: 'right' }}>{fmtKES(item.qty * item.unit_cost)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600 }}>Total Amount:</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: '#0ea5e9' }}>{fmtKES(previewPR.total_amount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequests;

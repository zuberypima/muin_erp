import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { PurchaseRequest, PRItem, PRStatus } from './procurementTypes';
import { fmtKES } from './currencyUtils';

const DEPARTMENTS = ['Management','Farm Operations','Finance','Record Management','IT','Logistics','HR','Procurement'];
const STATUSES: PRStatus[] = ['draft','pending','approved','rejected','ordered'];

const statusBadge: Record<string, string> = {
  draft: 'badge-draft', pending: 'badge-pending', approved: 'badge-approved',
  rejected: 'badge-rejected', ordered: 'badge-ordered',
};

const emptyItem = (): PRItem => ({ name: '', qty: 1, unit: 'pcs', unit_cost: 0 });

const PurchaseRequests: React.FC = () => {
  const { user } = useAuth();
  const [prs, setPRs] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'my' | 'approvals' | 'all'>('my');
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
    } catch (e) { 
      console.error(e);
      alert("Failed to save purchase request. Check permissions or network.");
    }
    finally { setSaving(false); }
  };

  const handleAction = async (id: number, action: 'approve' | 'reject' | 'submit') => {
    try {
      await api.post(`/procurement/purchase-requests/${id}/${action}/`);
      fetchPRs();
    } catch (e: any) { 
      console.error(e); 
      alert(e.response?.data?.detail || `Failed to ${action} request.`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this purchase request?')) return;
    try { await api.delete(`/procurement/purchase-requests/${id}/`); fetchPRs(); }
    catch (e) { console.error(e); }
  };

  const updateItem = (idx: number, field: keyof PRItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  // Filter based on Tab & Search Query
  const filtered = prs.filter(p => {
    const isSearchMatch = (p.title.toLowerCase().includes(search.toLowerCase()) ||
                           p.pr_number.toLowerCase().includes(search.toLowerCase()));
    if (!isSearchMatch) return false;

    const isUserOwner = p.requested_by === user?.id || (user?.username && p.requested_by_name?.toLowerCase().includes(user.username.toLowerCase()));

    if (activeTab === 'my') return isUserOwner;
    if (activeTab === 'approvals') return p.status === 'pending';
    return true;
  });

  const pendingApprovalsCount = prs.filter(p => p.status === 'pending').length;
  const myRequestsCount = prs.filter(p => p.requested_by === user?.id || (user?.username && p.requested_by_name?.toLowerCase().includes(user.username.toLowerCase()))).length;

  return (
    <div>
      {/* Top View Selector Tabs (Segregation of Duties) */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div className="d-flex gap-2">
          <button
            className={`btn btn-sm px-3 fw-bold ${activeTab === 'my' ? 'btn-success text-white shadow-sm' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('my')}
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            <i className="fas fa-user-edit me-1.5"></i>My Requests ({myRequestsCount})
          </button>

          <button
            className={`btn btn-sm px-3 fw-bold ${activeTab === 'approvals' ? 'btn-warning text-dark shadow-sm' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('approvals')}
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            <i className="fas fa-gavel me-1.5"></i>Approvals Queue 
            {pendingApprovalsCount > 0 && (
              <span className="badge bg-danger text-white ms-1.5 rounded-pill">{pendingApprovalsCount}</span>
            )}
          </button>

          <button
            className={`btn btn-sm px-3 fw-bold ${activeTab === 'all' ? 'btn-primary text-white shadow-sm' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('all')}
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          >
            <i className="fas fa-list me-1.5"></i>All Register ({prs.length})
          </button>
        </div>

        {activeTab === 'my' && (
          <button className="proc-btn proc-btn-primary" onClick={openCreate}>
            <i className="fas fa-plus me-1"></i> New Purchase Request
          </button>
        )}
      </div>

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
          {activeTab !== 'my' && (
            <button className="proc-btn proc-btn-primary" onClick={openCreate}>
              <i className="fas fa-plus"></i> New Request
            </button>
          )}
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
                      <div className="proc-empty">
                        <i className="fas fa-file-alt"></i>
                        <p>No purchase requests found in this view.</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(pr => {
                  const isSelfRequest = (pr.requested_by === user?.id) || (user?.username && pr.requested_by_name?.toLowerCase().includes(user.username.toLowerCase()));
                  const canEdit = pr.status === 'draft' || user?.is_staff;

                  return (
                    <tr key={pr.id}>
                      <td><code style={{ fontSize: '0.75rem', color: '#0ea5e9' }}>{pr.pr_number}</code></td>
                      <td style={{ fontWeight: 500 }}>{pr.title}</td>
                      <td>{pr.department}</td>
                      <td>
                        {pr.requested_by_name ?? '—'}
                        {isSelfRequest && (
                          <span className="badge bg-info-subtle text-info border ms-1" style={{ fontSize: '0.68rem' }}>You</span>
                        )}
                      </td>
                      <td>{fmtKES(pr.total_amount)}</td>
                      <td>{pr.required_by ?? '—'}</td>
                      <td><span className={`proc-badge ${statusBadge[pr.status]}`}>{pr.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                          {/* Submit Draft */}
                          {pr.status === 'draft' && (
                            <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Submit Request for Approval" onClick={() => handleAction(pr.id, 'submit')}>
                              <i className="fas fa-paper-plane text-primary"></i>
                            </button>
                          )}

                          {/* Approval Controls */}
                          {pr.status === 'pending' && (
                            <>
                              {isSelfRequest && !user?.is_staff ? (
                                <span className="badge bg-light text-muted border py-1.5 px-2" style={{ fontSize: '0.72rem' }} title="Self-approval prohibited: Requester cannot approve their own request">
                                  <i className="fas fa-lock me-1 text-warning"></i>Self Approval Restricted
                                </span>
                              ) : (
                                <>
                                  <button className="proc-btn proc-btn-success proc-btn-sm" title="Approve Request" onClick={() => handleAction(pr.id, 'approve')}>
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button className="proc-btn proc-btn-danger proc-btn-sm" title="Reject Request" onClick={() => handleAction(pr.id, 'reject')}>
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              )}
                            </>
                          )}

                          <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Preview Detail" onClick={() => setPreviewPR(pr)}>
                            <i className="fas fa-eye text-info"></i>
                          </button>

                          {canEdit && (
                            <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Edit Request" onClick={() => openEdit(pr)}>
                              <i className="fas fa-edit text-warning"></i>
                            </button>
                          )}

                          {pr.status === 'draft' && (
                            <button className="proc-btn proc-btn-danger proc-btn-sm" title="Delete Draft" onClick={() => handleDelete(pr.id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create / Edit Modal Portal */}
      {showModal && createPortal(
        <div className="proc-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }} onClick={() => setShowModal(false)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', margin: '1rem' }}>
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
        </div>,
        document.body
      )}

      {/* Preview Modal Portal */}
      {previewPR && createPortal(
        <div className="proc-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999 }} onClick={() => setPreviewPR(null)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '800px', width: '100%', margin: '1rem' }}>
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default PurchaseRequests;

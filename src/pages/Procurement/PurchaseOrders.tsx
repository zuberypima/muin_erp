import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { PurchaseOrder, POItem, POStatus, Supplier } from './procurementTypes';
import { fmtKES } from './currencyUtils';

const statusBadge: Record<string, string> = {
  draft: 'badge-draft', sent: 'badge-sent', confirmed: 'badge-confirmed',
  delivered: 'badge-delivered', cancelled: 'badge-cancelled',
};

const emptyItem = (): POItem => ({ name: '', qty: 1, unit: 'pcs', unit_cost: 0 });

const PurchaseOrders: React.FC = () => {
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [approvedPRs, setApprovedPRs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editPO, setEditPO] = useState<PurchaseOrder | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    supplier: '', purchase_request: '', delivery_date: '',
    delivery_address: '', payment_terms: '', notes: '', status: 'draft' as POStatus,
  });
  const [items, setItems] = useState<POItem[]>([emptyItem()]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, supRes, prRes] = await Promise.all([
        api.get('/procurement/purchase-orders/', { params: filterStatus ? { status: filterStatus } : {} }),
        api.get('/procurement/suppliers/?status=active'),
        api.get('/procurement/purchase-requests/?status=approved'),
      ]);
      setPOs(poRes.data?.results ?? poRes.data ?? []);
      setSuppliers(supRes.data?.results ?? supRes.data ?? []);
      setApprovedPRs(prRes.data?.results ?? prRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditPO(null);
    setForm({ supplier: '', purchase_request: '', delivery_date: '', delivery_address: '', payment_terms: '', notes: '', status: 'draft' });
    setItems([emptyItem()]);
    setShowModal(true);
  };

  const openEdit = (po: PurchaseOrder) => {
    setEditPO(po);
    setForm({
      supplier: String(po.supplier), purchase_request: po.purchase_request ? String(po.purchase_request) : '',
      delivery_date: po.delivery_date ?? '', delivery_address: po.delivery_address,
      payment_terms: po.payment_terms, notes: po.notes, status: po.status,
    });
    setItems(po.items.length ? po.items : [emptyItem()]);
    setShowModal(true);
  };

  const handlePRSelect = (prId: string) => {
    const pr = approvedPRs.find(p => String(p.id) === prId);
    if (pr) {
      setItems(pr.items.length ? pr.items : [emptyItem()]);
      setForm(f => ({ ...f, purchase_request: prId }));
    } else {
      setForm(f => ({ ...f, purchase_request: prId }));
    }
  };

  const totalAmount = items.reduce((s, i) => s + (i.qty * i.unit_cost), 0);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        supplier: Number(form.supplier),
        purchase_request: form.purchase_request ? Number(form.purchase_request) : null,
        items,
        total_amount: totalAmount,
      };
      if (editPO) {
        await api.patch(`/procurement/purchase-orders/${editPO.id}/`, payload);
      } else {
        await api.post('/procurement/purchase-orders/', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleAction = async (id: number, action: 'confirm' | 'cancel' | 'mark-delivered') => {
    if (action === 'cancel' && !confirm('Cancel this Purchase Order?')) return;
    try {
      await api.post(`/procurement/purchase-orders/${id}/${action}/`);
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this purchase order?')) return;
    try { await api.delete(`/procurement/purchase-orders/${id}/`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const updateItem = (idx: number, field: keyof POItem, value: string | number) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const filtered = pos.filter(p =>
    p.po_number.toLowerCase().includes(search.toLowerCase()) ||
    (p.supplier_name ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="proc-card">
        <div className="proc-toolbar">
          <div className="proc-search">
            <i className="fas fa-search"></i>
            <input placeholder="Search by PO# or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="proc-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {['draft','sent','confirmed','delivered','cancelled'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button className="proc-btn proc-btn-primary" onClick={openCreate}>
            <i className="fas fa-plus"></i> New Order
          </button>
        </div>

        <div className="proc-table-wrap">
          {loading ? (
            <div className="proc-empty"><div className="spinner-border text-primary" /></div>
          ) : (
            <table className="proc-table">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Supplier</th>
                  <th>Linked PR</th>
                  <th>Amount (TZS)</th>
                  <th>Delivery Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7}><div className="proc-empty"><i className="fas fa-shopping-cart"></i><p>No purchase orders found</p></div></td></tr>
                ) : filtered.map(po => (
                  <tr key={po.id}>
                    <td><code style={{ fontSize: '0.75rem', color: '#6366f1' }}>{po.po_number}</code></td>
                    <td style={{ fontWeight: 500 }}>{po.supplier_name}</td>
                    <td>
                      {po.pr_number
                        ? <code style={{ fontSize: '0.73rem', color: '#0ea5e9' }}>{po.pr_number}</code>
                        : <span style={{ color: '#94a3b8' }}>—</span>}
                    </td>
                    <td>{fmtKES(po.total_amount)}</td>
                    <td>{po.delivery_date ?? '—'}</td>
                    <td><span className={`proc-badge ${statusBadge[po.status]}`}>{po.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {po.status === 'draft' && (
                          <button className="proc-btn proc-btn-success proc-btn-sm" title="Confirm" onClick={() => handleAction(po.id, 'confirm')}>
                            <i className="fas fa-check"></i>
                          </button>
                        )}
                        {po.status === 'sent' && (
                          <button className="proc-btn proc-btn-success proc-btn-sm" title="Confirm" onClick={() => handleAction(po.id, 'confirm')}>
                            <i className="fas fa-check-double"></i>
                          </button>
                        )}
                        {po.status === 'confirmed' && (
                          <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Mark Delivered" onClick={() => handleAction(po.id, 'mark-delivered')}>
                            <i className="fas fa-truck"></i>
                          </button>
                        )}
                        {!['delivered', 'cancelled'].includes(po.status) && (
                          <button className="proc-btn proc-btn-danger proc-btn-sm" title="Cancel" onClick={() => handleAction(po.id, 'cancel')}>
                            <i className="fas fa-ban"></i>
                          </button>
                        )}
                        <button className="proc-btn proc-btn-ghost proc-btn-sm" title="Edit" onClick={() => openEdit(po)}>
                          <i className="fas fa-edit"></i>
                        </button>
                        <button className="proc-btn proc-btn-danger proc-btn-sm" title="Delete" onClick={() => handleDelete(po.id)}>
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

      {showModal && (
        <div className="proc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <h4>{editPO ? 'Edit Purchase Order' : 'New Purchase Order'}</h4>
              <button className="proc-modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="proc-modal-body">
              <div className="proc-form-grid">
                <div className="proc-form-group">
                  <label>Supplier *</label>
                  <select value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}>
                    <option value="">Select supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Linked Purchase Request</label>
                  <select value={form.purchase_request} onChange={e => handlePRSelect(e.target.value)}>
                    <option value="">None</option>
                    {approvedPRs.map(pr => <option key={pr.id} value={pr.id}>{pr.pr_number} — {pr.title}</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Delivery Date</label>
                  <input type="date" value={form.delivery_date} onChange={e => setForm(f => ({ ...f, delivery_date: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Payment Terms</label>
                  <input placeholder="e.g. Net 30" value={form.payment_terms} onChange={e => setForm(f => ({ ...f, payment_terms: e.target.value }))} />
                </div>
                <div className="proc-form-group proc-form-full">
                  <label>Delivery Address</label>
                  <input value={form.delivery_address} onChange={e => setForm(f => ({ ...f, delivery_address: e.target.value }))} />
                </div>
                <div className="proc-form-group proc-form-full">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </div>

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
    </div>
  );
};

export default PurchaseOrders;

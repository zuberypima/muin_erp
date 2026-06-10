import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { GoodsReceivingNote, GRNItem } from './procurementTypes';

const statusBadge: Record<string, string> = {
  pending: 'badge-pending', received: 'badge-received', discrepancy: 'badge-discrepancy',
};

const GoodsReceiving: React.FC = () => {
  const [grns, setGRNs] = useState<GoodsReceivingNote[]>([]);
  const [confirmedPOs, setConfirmedPOs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [selectedGRN, setSelectedGRN] = useState<GoodsReceivingNote | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ purchase_order: '', received_date: '', notes: '' });
  const [grnItems, setGRNItems] = useState<GRNItem[]>([]);
  const [receiveItems, setReceiveItems] = useState<GRNItem[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [grnRes, poRes] = await Promise.all([
        api.get('/procurement/grns/', { params: filterStatus ? { status: filterStatus } : {} }),
        api.get('/procurement/purchase-orders/?status=confirmed'),
      ]);
      setGRNs(grnRes.data?.results ?? grnRes.data ?? []);
      setConfirmedPOs(poRes.data?.results ?? poRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handlePOSelect = (poId: string) => {
    const po = confirmedPOs.find(p => String(p.id) === poId);
    if (po) {
      const items: GRNItem[] = (po.items ?? []).map((i: any) => ({
        name: i.name, ordered_qty: i.qty, received_qty: i.qty, unit: i.unit, notes: '',
      }));
      setGRNItems(items);
    }
    setForm(f => ({ ...f, purchase_order: poId }));
  };

  const handleCreate = async () => {
    setSaving(true);
    try {
      await api.post('/procurement/grns/', {
        purchase_order: Number(form.purchase_order),
        received_date: form.received_date,
        notes: form.notes,
        items: grnItems,
      });
      setShowModal(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const openReceive = (grn: GoodsReceivingNote) => {
    setSelectedGRN(grn);
    setReceiveItems(grn.items.map(i => ({ ...i })));
    setShowReceiveModal(true);
  };

  const handleReceive = async () => {
    if (!selectedGRN) return;
    setSaving(true);
    try {
      await api.post(`/procurement/grns/${selectedGRN.id}/receive/`, { items: receiveItems });
      setShowReceiveModal(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this GRN?')) return;
    try { await api.delete(`/procurement/grns/${id}/`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const updateGRNItem = (idx: number, field: keyof GRNItem, value: string | number) => {
    setGRNItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const updateReceiveItem = (idx: number, val: number) => {
    setReceiveItems(prev => prev.map((item, i) => i === idx ? { ...item, received_qty: val } : item));
  };

  const filtered = grns.filter(g =>
    g.grn_number.toLowerCase().includes(search.toLowerCase()) ||
    (g.supplier_name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (g.po_number ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="proc-card">
        <div className="proc-toolbar">
          <div className="proc-search">
            <i className="fas fa-search"></i>
            <input placeholder="Search by GRN#, PO# or supplier..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="proc-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {['pending','received','discrepancy'].map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <button className="proc-btn proc-btn-primary" onClick={() => { setForm({ purchase_order: '', received_date: '', notes: '' }); setGRNItems([]); setShowModal(true); }}>
            <i className="fas fa-plus"></i> New GRN
          </button>
        </div>

        <div className="proc-table-wrap">
          {loading ? (
            <div className="proc-empty"><div className="spinner-border text-primary" /></div>
          ) : (
            <table className="proc-table">
              <thead>
                <tr>
                  <th>GRN #</th>
                  <th>Purchase Order</th>
                  <th>Supplier</th>
                  <th>Received By</th>
                  <th>Received Date</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8}><div className="proc-empty"><i className="fas fa-truck-loading"></i><p>No goods receiving notes found</p></div></td></tr>
                ) : filtered.map(grn => (
                  <tr key={grn.id}>
                    <td><code style={{ fontSize: '0.75rem', color: '#10b981' }}>{grn.grn_number}</code></td>
                    <td><code style={{ fontSize: '0.73rem', color: '#6366f1' }}>{grn.po_number}</code></td>
                    <td>{grn.supplier_name ?? '—'}</td>
                    <td>{grn.received_by_name ?? '—'}</td>
                    <td>{grn.received_date}</td>
                    <td>{grn.items.length} item{grn.items.length !== 1 ? 's' : ''}</td>
                    <td><span className={`proc-badge ${statusBadge[grn.status]}`}>{grn.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        {grn.status === 'pending' && (
                          <button className="proc-btn proc-btn-success proc-btn-sm" title="Receive Goods" onClick={() => openReceive(grn)}>
                            <i className="fas fa-check"></i> Receive
                          </button>
                        )}
                        <button className="proc-btn proc-btn-danger proc-btn-sm" title="Delete" onClick={() => handleDelete(grn.id)}>
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

      {/* Create GRN Modal */}
      {showModal && (
        <div className="proc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <h4>New Goods Receiving Note</h4>
              <button className="proc-modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="proc-modal-body">
              <div className="proc-form-grid">
                <div className="proc-form-group">
                  <label>Purchase Order *</label>
                  <select value={form.purchase_order} onChange={e => handlePOSelect(e.target.value)}>
                    <option value="">Select confirmed PO...</option>
                    {confirmedPOs.map(po => (
                      <option key={po.id} value={po.id}>{po.po_number} — {po.supplier_name}</option>
                    ))}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Received Date *</label>
                  <input type="date" value={form.received_date} onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))} />
                </div>
                <div className="proc-form-group proc-form-full">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </div>

              {grnItems.length > 0 && (
                <div className="line-items-section mt-3">
                  <h5>Items to Receive</h5>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.4rem', marginBottom: '0.4rem' }}>
                    {['Item', 'Ordered Qty', 'Received Qty', 'Unit'].map(h => (
                      <span key={h} style={{ fontSize: '0.73rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</span>
                    ))}
                  </div>
                  {grnItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.4rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{item.name}</span>
                      <span style={{ textAlign: 'center', color: '#64748b', fontSize: '0.83rem' }}>{item.ordered_qty}</span>
                      <input type="number" min={0} value={item.received_qty}
                        onChange={e => updateGRNItem(idx, 'received_qty', Number(e.target.value))}
                        style={{ padding: '0.4rem', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.83rem' }} />
                      <span style={{ fontSize: '0.83rem', color: '#64748b' }}>{item.unit}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="proc-modal-footer">
              <button className="proc-btn proc-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="proc-btn proc-btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Create GRN</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receive Goods Modal */}
      {showReceiveModal && selectedGRN && (
        <div className="proc-modal-overlay" onClick={() => setShowReceiveModal(false)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <h4>Receive Goods — {selectedGRN.grn_number}</h4>
              <button className="proc-modal-close" onClick={() => setShowReceiveModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="proc-modal-body">
              <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                Verify and enter the actual quantities received. Any discrepancy will be flagged.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {['Item', 'Ordered', 'Received', 'Unit'].map(h => (
                  <span key={h} style={{ fontSize: '0.73rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>{h}</span>
                ))}
              </div>
              {receiveItems.map((item, idx) => {
                const hasDiscrepancy = item.received_qty !== item.ordered_qty;
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.83rem', fontWeight: 500 }}>{item.name}</span>
                    <span style={{ textAlign: 'center', color: '#64748b', fontSize: '0.83rem' }}>{item.ordered_qty}</span>
                    <input type="number" min={0} value={item.received_qty}
                      onChange={e => updateReceiveItem(idx, Number(e.target.value))}
                      style={{ padding: '0.4rem', border: `1px solid ${hasDiscrepancy ? '#ef4444' : '#e2e8f0'}`, borderRadius: '6px', fontSize: '0.83rem' }} />
                    <span style={{ fontSize: '0.83rem', color: '#64748b' }}>{item.unit}</span>
                  </div>
                );
              })}
            </div>
            <div className="proc-modal-footer">
              <button className="proc-btn proc-btn-ghost" onClick={() => setShowReceiveModal(false)}>Cancel</button>
              <button className="proc-btn proc-btn-primary" onClick={handleReceive} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Processing...</> : <><i className="fas fa-check"></i> Confirm Receipt</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoodsReceiving;

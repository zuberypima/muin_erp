import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { StockMovement, MovementType, InventoryItem } from './procurementTypes';

const movementColors: Record<MovementType, string> = {
  in: '#10b981', out: '#ef4444', transfer: '#6366f1', adjustment: '#f59e0b',
};

const movementIcons: Record<MovementType, string> = {
  in: 'fas fa-arrow-down', out: 'fas fa-arrow-up',
  transfer: 'fas fa-exchange-alt', adjustment: 'fas fa-sliders-h',
};

const StockTracking: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterItem, setFilterItem] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    item: '', movement_type: 'in' as MovementType,
    quantity: '', reference: '', notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterType) params.movement_type = filterType;
      if (filterItem) params.item = filterItem;
      const [movRes, invRes] = await Promise.all([
        api.get('/procurement/stock-movements/', { params }),
        api.get('/procurement/inventory/'),
      ]);
      setMovements(movRes.data?.results ?? movRes.data ?? []);
      setInventoryItems(invRes.data?.results ?? invRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterType, filterItem]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/procurement/stock-movements/', {
        ...form,
        item: Number(form.item),
        quantity: Number(form.quantity),
      });
      setShowModal(false);
      setForm({ item: '', movement_type: 'in', quantity: '', reference: '', notes: '' });
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const selectedItem = inventoryItems.find(i => String(i.id) === form.item);

  // Stats
  const totalIn = movements.filter(m => m.movement_type === 'in').reduce((s, m) => s + Number(m.quantity), 0);
  const totalOut = movements.filter(m => m.movement_type === 'out').reduce((s, m) => s + Number(m.quantity), 0);
  const adjustments = movements.filter(m => m.movement_type === 'adjustment').length;
  const transfers = movements.filter(m => m.movement_type === 'transfer').length;

  return (
    <div>
      {/* Stats row */}
      <div className="proc-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="proc-kpi-card green">
          <div className="proc-kpi-icon green"><i className="fas fa-arrow-down"></i></div>
          <div className="proc-kpi-value">{totalIn.toFixed(0)}</div>
          <div className="proc-kpi-label">Total Stock In</div>
        </div>
        <div className="proc-kpi-card red">
          <div className="proc-kpi-icon red"><i className="fas fa-arrow-up"></i></div>
          <div className="proc-kpi-value">{totalOut.toFixed(0)}</div>
          <div className="proc-kpi-label">Total Stock Out</div>
        </div>
        <div className="proc-kpi-card purple">
          <div className="proc-kpi-icon purple"><i className="fas fa-exchange-alt"></i></div>
          <div className="proc-kpi-value">{transfers}</div>
          <div className="proc-kpi-label">Transfers</div>
        </div>
        <div className="proc-kpi-card amber">
          <div className="proc-kpi-icon amber"><i className="fas fa-sliders-h"></i></div>
          <div className="proc-kpi-value">{adjustments}</div>
          <div className="proc-kpi-label">Adjustments</div>
        </div>
      </div>

      <div className="proc-card">
        <div className="proc-toolbar">
          <select className="proc-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="">All Types</option>
            <option value="in">Stock In</option>
            <option value="out">Stock Out</option>
            <option value="transfer">Transfer</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select className="proc-filter-select" value={filterItem} onChange={e => setFilterItem(e.target.value)}>
            <option value="">All Items</option>
            {inventoryItems.map(i => <option key={i.id} value={i.id}>[{i.sku}] {i.name}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <button className="proc-btn proc-btn-primary" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i> Record Movement
          </button>
        </div>

        <div className="proc-table-wrap">
          {loading ? (
            <div className="proc-empty"><div className="spinner-border text-primary" /></div>
          ) : (
            <table className="proc-table">
              <thead>
                <tr>
                  <th>Date/Time</th>
                  <th>Type</th>
                  <th>Item</th>
                  <th>SKU</th>
                  <th>Qty Before</th>
                  <th>Change</th>
                  <th>Qty After</th>
                  <th>Reference</th>
                  <th>By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {movements.length === 0 ? (
                  <tr><td colSpan={10}><div className="proc-empty"><i className="fas fa-exchange-alt"></i><p>No stock movements recorded</p></div></td></tr>
                ) : movements.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.78rem', color: '#64748b' }}>
                      {new Date(m.moved_at).toLocaleString('en-KE', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        background: movementColors[m.movement_type] + '15',
                        color: movementColors[m.movement_type],
                        padding: '0.2rem 0.6rem', borderRadius: 20,
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        <i className={movementIcons[m.movement_type]}></i>
                        {m.movement_type.charAt(0).toUpperCase() + m.movement_type.slice(1)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 500 }}>{m.item_name}</td>
                    <td><code style={{ fontSize: '0.72rem', color: '#6366f1' }}>{m.item_sku}</code></td>
                    <td style={{ color: '#64748b' }}>{Number(m.quantity_before).toFixed(2)}</td>
                    <td style={{
                      fontWeight: 600,
                      color: m.movement_type === 'out' ? '#ef4444' : '#10b981',
                    }}>
                      {m.movement_type === 'out' ? '−' : '+'}{Number(m.quantity).toFixed(2)}
                    </td>
                    <td style={{ fontWeight: 600, color: '#1e293b' }}>{Number(m.quantity_after).toFixed(2)}</td>
                    <td><code style={{ fontSize: '0.75rem' }}>{m.reference || '—'}</code></td>
                    <td style={{ fontSize: '0.78rem' }}>{m.moved_by_name ?? '—'}</td>
                    <td style={{ fontSize: '0.78rem', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {m.notes || '—'}
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
          <div className="proc-modal" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <h4>Record Stock Movement</h4>
              <button className="proc-modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="proc-modal-body">
              <div className="proc-form-grid">
                <div className="proc-form-group proc-form-full">
                  <label>Item *</label>
                  <select value={form.item} onChange={e => setForm(f => ({ ...f, item: e.target.value }))}>
                    <option value="">Select inventory item...</option>
                    {inventoryItems.map(i => <option key={i.id} value={i.id}>[{i.sku}] {i.name} (Stock: {Number(i.quantity_on_hand).toFixed(0)} {i.unit})</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Movement Type *</label>
                  <select value={form.movement_type} onChange={e => setForm(f => ({ ...f, movement_type: e.target.value as MovementType }))}>
                    <option value="in">Stock In</option>
                    <option value="out">Stock Out</option>
                    <option value="transfer">Transfer</option>
                    <option value="adjustment">Adjustment (Set to)</option>
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Quantity *</label>
                  <input type="number" min={0} step="0.001" value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                    placeholder={form.movement_type === 'adjustment' ? 'New qty' : 'Qty to move'} />
                </div>
                <div className="proc-form-group">
                  <label>Reference #</label>
                  <input value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} placeholder="GRN / PO number..." />
                </div>
                <div className="proc-form-group proc-form-full">
                  <label>Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
                </div>
              </div>
              {selectedItem && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.83rem', color: '#15803d' }}>
                  <i className="fas fa-info-circle me-2"></i>
                  Current stock: <strong>{Number(selectedItem.quantity_on_hand).toFixed(2)} {selectedItem.unit}</strong>
                  &nbsp;(Reorder at: {Number(selectedItem.reorder_level).toFixed(0)})
                </div>
              )}
            </div>
            <div className="proc-modal-footer">
              <button className="proc-btn proc-btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="proc-btn proc-btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Record</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTracking;

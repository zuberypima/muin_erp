import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { InventoryItem, ItemCategory, StockStatus } from './procurementTypes';
import { fmtKES } from './currencyUtils';

const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: 'raw_material', label: 'Raw Material' },
  { value: 'finished_good', label: 'Finished Good' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'spare_part', label: 'Spare Part' },
  { value: 'office_supply', label: 'Office Supply' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'other', label: 'Other' },
];

const stockColors: Record<StockStatus, string> = {
  healthy: '#10b981', warning: '#f59e0b', low: '#ef4444', out_of_stock: '#94a3b8',
};

const stockLabel: Record<StockStatus, string> = {
  healthy: 'In Stock', warning: 'Low Warning', low: 'Low Stock', out_of_stock: 'Out of Stock',
};

const emptyForm = {
  sku: '', name: '', category: 'consumable' as ItemCategory, description: '',
  unit: 'pcs', quantity_on_hand: '0', reorder_level: '0',
  unit_cost: '0', location: '', supplier: '',
};

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, supRes] = await Promise.all([
        api.get('/procurement/inventory/', { params: filterCategory ? { category: filterCategory } : {} }),
        api.get('/procurement/suppliers/?status=active'),
      ]);
      setItems(invRes.data?.results ?? invRes.data ?? []);
      setSuppliers(supRes.data?.results ?? supRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditItem(item);
    setForm({
      sku: item.sku, name: item.name, category: item.category, description: item.description,
      unit: item.unit, quantity_on_hand: item.quantity_on_hand, reorder_level: item.reorder_level,
      unit_cost: item.unit_cost, location: item.location, supplier: item.supplier ? String(item.supplier) : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        supplier: form.supplier ? Number(form.supplier) : null,
        quantity_on_hand: Number(form.quantity_on_hand),
        reorder_level: Number(form.reorder_level),
        unit_cost: Number(form.unit_cost),
      };
      if (editItem) {
        await api.patch(`/procurement/inventory/${editItem.id}/`, payload);
      } else {
        await api.post('/procurement/inventory/', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this inventory item?')) return;
    try { await api.delete(`/procurement/inventory/${id}/`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) || item.sku.toLowerCase().includes(search.toLowerCase());
    const matchStock = !filterStock || item.stock_status === filterStock;
    return matchSearch && matchStock;
  });

  const getStockPercent = (item: InventoryItem) => {
    const qty = Number(item.quantity_on_hand);
    const reorder = Number(item.reorder_level);
    if (reorder === 0) return qty > 0 ? 100 : 0;
    return Math.min(100, (qty / (reorder * 2)) * 100);
  };

  return (
    <div>
      <div className="proc-card">
        <div className="proc-toolbar">
          <div className="proc-search">
            <i className="fas fa-search"></i>
            <input placeholder="Search by name or SKU..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="proc-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select className="proc-filter-select" value={filterStock} onChange={e => setFilterStock(e.target.value)}>
            <option value="">All Stock Levels</option>
            <option value="healthy">In Stock</option>
            <option value="warning">Low Warning</option>
            <option value="low">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <div style={{ display: 'flex', gap: '0.3rem' }}>
            <button className={`proc-btn proc-btn-sm ${viewMode === 'table' ? 'proc-btn-primary' : 'proc-btn-ghost'}`} onClick={() => setViewMode('table')}>
              <i className="fas fa-list"></i>
            </button>
            <button className={`proc-btn proc-btn-sm ${viewMode === 'grid' ? 'proc-btn-primary' : 'proc-btn-ghost'}`} onClick={() => setViewMode('grid')}>
              <i className="fas fa-th"></i>
            </button>
          </div>
          <button className="proc-btn proc-btn-primary" onClick={openCreate}>
            <i className="fas fa-plus"></i> Add Item
          </button>
        </div>

        {loading ? (
          <div className="proc-empty"><div className="spinner-border text-primary" /></div>
        ) : viewMode === 'table' ? (
          <div className="proc-table-wrap">
            <table className="proc-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Stock Level</th>
                  <th>Reorder Level</th>
                  <th>Unit Cost</th>
                  <th>Total Value</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10}><div className="proc-empty"><i className="fas fa-boxes"></i><p>No inventory items found</p></div></td></tr>
                ) : filtered.map(item => (
                  <tr key={item.id}>
                    <td><code style={{ fontSize: '0.75rem', color: '#6366f1' }}>{item.sku}</code></td>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td style={{ fontSize: '0.78rem' }}>{CATEGORIES.find(c => c.value === item.category)?.label}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{Number(item.quantity_on_hand).toFixed(0)} {item.unit}</span>
                        <div className="stock-progress-bar">
                          <div className={`stock-progress-fill fill-${item.stock_status}`}
                            style={{ width: `${getStockPercent(item)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td>{Number(item.reorder_level).toFixed(0)} {item.unit}</td>
                    <td>{fmtKES(item.unit_cost)}</td>
                    <td>{fmtKES(item.total_value)}</td>
                    <td style={{ fontSize: '0.8rem' }}>{item.location || '—'}</td>
                    <td>
                      <span className={`proc-badge stock-${item.stock_status}`}>
                        {stockLabel[item.stock_status]}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button className="proc-btn proc-btn-ghost proc-btn-sm" onClick={() => openEdit(item)}><i className="fas fa-edit"></i></button>
                        <button className="proc-btn proc-btn-danger proc-btn-sm" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="proc-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
              {filtered.map(item => (
                <div key={item.id} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
                  padding: '1.1rem', transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <code style={{ fontSize: '0.72rem', color: '#6366f1', background: '#ede9fe', padding: '2px 6px', borderRadius: 4 }}>{item.sku}</code>
                    <span className={`proc-badge stock-${item.stock_status}`} style={{ fontSize: '0.7rem' }}>{stockLabel[item.stock_status]}</span>
                  </div>
                  <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: '0.25rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.75rem' }}>
                    {CATEGORIES.find(c => c.value === item.category)?.label}
                    {item.location && ` · ${item.location}`}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '1.4rem', fontWeight: 700, color: stockColors[item.stock_status] }}>
                      {Number(item.quantity_on_hand).toFixed(0)}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.unit}</span>
                  </div>
                  <div className="stock-progress-bar" style={{ marginBottom: '0.5rem' }}>
                    <div className={`stock-progress-fill fill-${item.stock_status}`} style={{ width: `${getStockPercent(item)}%` }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#64748b' }}>
                    <span>Cost: TZS {Number(item.unit_cost).toLocaleString('sw-TZ')}</span>
                    <span>Value: TZS {Number(item.total_value).toLocaleString('sw-TZ')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.75rem' }}>
                    <button className="proc-btn proc-btn-ghost proc-btn-sm" style={{ flex: 1 }} onClick={() => openEdit(item)}>
                      <i className="fas fa-edit"></i> Edit
                    </button>
                    <button className="proc-btn proc-btn-danger proc-btn-sm" onClick={() => handleDelete(item.id)}>
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="proc-empty" style={{ gridColumn: '1/-1' }}>
                  <i className="fas fa-boxes"></i><p>No inventory items found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="proc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <h4>{editItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</h4>
              <button className="proc-modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="proc-modal-body">
              <div className="proc-form-grid">
                <div className="proc-form-group">
                  <label>SKU *</label>
                  <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="e.g. ITM-001" />
                </div>
                <div className="proc-form-group">
                  <label>Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Item name" />
                </div>
                <div className="proc-form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as ItemCategory }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Unit</label>
                  <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="pcs / kg / litre..." />
                </div>
                <div className="proc-form-group">
                  <label>Qty on Hand</label>
                  <input type="number" min={0} value={form.quantity_on_hand} onChange={e => setForm(f => ({ ...f, quantity_on_hand: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Reorder Level</label>
                  <input type="number" min={0} value={form.reorder_level} onChange={e => setForm(f => ({ ...f, reorder_level: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Unit Cost (TZS)</label>
                  <input type="number" min={0} value={form.unit_cost} onChange={e => setForm(f => ({ ...f, unit_cost: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Warehouse / shelf" />
                </div>
                <div className="proc-form-group">
                  <label>Supplier</label>
                  <select value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}>
                    <option value="">None</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="proc-form-group proc-form-full">
                  <label>Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} />
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

export default Inventory;

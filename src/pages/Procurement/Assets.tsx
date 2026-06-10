import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/axiosConfig';
import { Asset, AssetStatus, AssetCategory } from './procurementTypes';
import { fmtKES } from './currencyUtils';

const DEPARTMENTS = ['Management','Farm Operations','Finance','Sales & Marketing','IT','Logistics','HR','Procurement'];
const CATEGORIES: { value: AssetCategory; label: string }[] = [
  { value: 'it_equipment', label: 'IT Equipment' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'machinery', label: 'Machinery' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'land_building', label: 'Land & Building' },
  { value: 'tools', label: 'Tools & Equipment' },
  { value: 'other', label: 'Other' },
];

const statusBadge: Record<AssetStatus, string> = {
  active: 'badge-active', maintenance: 'badge-maintenance',
  disposed: 'badge-disposed', transferred: 'badge-transferred',
};

const statusIcons: Record<AssetStatus, string> = {
  active: 'fas fa-check-circle', maintenance: 'fas fa-tools',
  disposed: 'fas fa-times-circle', transferred: 'fas fa-exchange-alt',
};

const emptyForm = {
  name: '', category: 'it_equipment' as AssetCategory, serial_number: '',
  description: '', assigned_to: '', department: '', location: '',
  purchase_date: '', purchase_cost: '0', current_value: '0',
  useful_life_years: '5', status: 'active' as AssetStatus,
  supplier: '', warranty_expiry: '', notes: '',
};

const Assets: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editAsset, setEditAsset] = useState<Asset | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterStatus) params.status = filterStatus;
      if (filterCategory) params.category = filterCategory;
      const [assetRes, supRes, userRes] = await Promise.all([
        api.get('/procurement/assets/', { params }),
        api.get('/procurement/suppliers/?status=active'),
        api.get('/users/'),
      ]);
      setAssets(assetRes.data?.results ?? assetRes.data ?? []);
      setSuppliers(supRes.data?.results ?? supRes.data ?? []);
      setUsers(userRes.data?.results ?? userRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filterStatus, filterCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditAsset(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (asset: Asset) => {
    setEditAsset(asset);
    setForm({
      name: asset.name, category: asset.category, serial_number: asset.serial_number,
      description: asset.description, assigned_to: asset.assigned_to ? String(asset.assigned_to) : '',
      department: asset.department, location: asset.location,
      purchase_date: asset.purchase_date ?? '', purchase_cost: asset.purchase_cost,
      current_value: asset.current_value, useful_life_years: String(asset.useful_life_years),
      status: asset.status, supplier: asset.supplier ? String(asset.supplier) : '',
      warranty_expiry: asset.warranty_expiry ?? '', notes: asset.notes,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        assigned_to: form.assigned_to ? Number(form.assigned_to) : null,
        supplier: form.supplier ? Number(form.supplier) : null,
        purchase_cost: Number(form.purchase_cost),
        current_value: Number(form.current_value),
        useful_life_years: Number(form.useful_life_years),
      };
      if (editAsset) {
        await api.patch(`/procurement/assets/${editAsset.id}/`, payload);
      } else {
        await api.post('/procurement/assets/', payload);
      }
      setShowModal(false);
      fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this asset?')) return;
    try { await api.delete(`/procurement/assets/${id}/`); fetchData(); }
    catch (e) { console.error(e); }
  };

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.asset_number.toLowerCase().includes(search.toLowerCase()) ||
    (a.serial_number ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = assets.reduce((s, a) => s + Number(a.current_value), 0);
  const activeCount = assets.filter(a => a.status === 'active').length;
  const maintenanceCount = assets.filter(a => a.status === 'maintenance').length;

  return (
    <div>
      {/* KPI row */}
      <div className="proc-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: '1.5rem' }}>
        <div className="proc-kpi-card blue">
          <div className="proc-kpi-icon blue"><i className="fas fa-laptop"></i></div>
          <div className="proc-kpi-value">{assets.length}</div>
          <div className="proc-kpi-label">Total Assets</div>
        </div>
        <div className="proc-kpi-card green">
          <div className="proc-kpi-icon green"><i className="fas fa-check-circle"></i></div>
          <div className="proc-kpi-value">{activeCount}</div>
          <div className="proc-kpi-label">Active</div>
        </div>
        <div className="proc-kpi-card amber">
          <div className="proc-kpi-icon amber"><i className="fas fa-tools"></i></div>
          <div className="proc-kpi-value">{maintenanceCount}</div>
          <div className="proc-kpi-label">Under Maintenance</div>
        </div>
        <div className="proc-kpi-card purple">
          <div className="proc-kpi-icon purple"><i className="fas fa-dollar-sign"></i></div>
          <div className="proc-kpi-value">{fmtKES(totalValue)}</div>
          <div className="proc-kpi-label">Total Value</div>
        </div>
      </div>

      <div className="proc-card">
        <div className="proc-toolbar">
          <div className="proc-search">
            <i className="fas fa-search"></i>
            <input placeholder="Search by name, asset# or serial..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="proc-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {(['active','maintenance','disposed','transferred'] as AssetStatus[]).map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select className="proc-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <button className="proc-btn proc-btn-primary" onClick={openCreate}>
            <i className="fas fa-plus"></i> Add Asset
          </button>
        </div>

        <div className="proc-table-wrap">
          {loading ? (
            <div className="proc-empty"><div className="spinner-border text-primary" /></div>
          ) : (
            <table className="proc-table">
              <thead>
                <tr>
                  <th>Asset #</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Serial #</th>
                  <th>Assigned To</th>
                  <th>Department</th>
                  <th>Purchase Cost</th>
                  <th>Current Value</th>
                  <th>Warranty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={11}><div className="proc-empty"><i className="fas fa-laptop"></i><p>No assets found</p></div></td></tr>
                ) : filtered.map(asset => {
                  const deprecPct = asset.purchase_cost && Number(asset.purchase_cost) > 0
                    ? ((Number(asset.current_value) / Number(asset.purchase_cost)) * 100).toFixed(0)
                    : '—';
                  const warrantyExpired = asset.warranty_expiry && new Date(asset.warranty_expiry) < new Date();
                  return (
                    <tr key={asset.id}>
                      <td><code style={{ fontSize: '0.75rem', color: '#0ea5e9' }}>{asset.asset_number}</code></td>
                      <td style={{ fontWeight: 500 }}>{asset.name}</td>
                      <td style={{ fontSize: '0.78rem' }}>{CATEGORIES.find(c => c.value === asset.category)?.label}</td>
                      <td style={{ fontSize: '0.78rem', fontFamily: 'monospace' }}>{asset.serial_number || '—'}</td>
                      <td>{asset.assigned_to_name ?? <span style={{ color: '#94a3b8' }}>Unassigned</span>}</td>
                      <td style={{ fontSize: '0.78rem' }}>{asset.department || '—'}</td>
                      <td>{fmtKES(asset.purchase_cost)}</td>
                      <td>
                        <div>
                          <span style={{ fontWeight: 600 }}>{fmtKES(asset.current_value)}</span>
                          {deprecPct !== '—' && (
                            <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{deprecPct}% remaining</div>
                          )}
                        </div>
                      </td>
                      <td>
                        {asset.warranty_expiry ? (
                          <span style={{ fontSize: '0.78rem', color: warrantyExpired ? '#ef4444' : '#059669' }}>
                            <i className={`fas fa-${warrantyExpired ? 'times' : 'check'}-circle me-1`}></i>
                            {asset.warranty_expiry}
                          </span>
                        ) : <span style={{ color: '#94a3b8' }}>—</span>}
                      </td>
                      <td>
                        <span className={`proc-badge ${statusBadge[asset.status]}`}>
                          <i className={`${statusIcons[asset.status]} me-1`} style={{ fontSize: '0.65rem' }}></i>
                          {asset.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.35rem' }}>
                          <button className="proc-btn proc-btn-ghost proc-btn-sm" onClick={() => openEdit(asset)}>
                            <i className="fas fa-edit"></i>
                          </button>
                          <button className="proc-btn proc-btn-danger proc-btn-sm" onClick={() => handleDelete(asset.id)}>
                            <i className="fas fa-trash"></i>
                          </button>
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

      {showModal && (
        <div className="proc-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="proc-modal proc-modal-lg" onClick={e => e.stopPropagation()}>
            <div className="proc-modal-header">
              <h4>{editAsset ? 'Edit Asset' : 'Add Asset'}</h4>
              <button className="proc-modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="proc-modal-body">
              <div className="proc-form-grid">
                <div className="proc-form-group">
                  <label>Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Dell Laptop" />
                </div>
                <div className="proc-form-group">
                  <label>Category *</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as AssetCategory }))}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Serial Number</label>
                  <input value={form.serial_number} onChange={e => setForm(f => ({ ...f, serial_number: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as AssetStatus }))}>
                    <option value="active">Active</option>
                    <option value="maintenance">Under Maintenance</option>
                    <option value="disposed">Disposed</option>
                    <option value="transferred">Transferred</option>
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Assigned To</label>
                  <select value={form.assigned_to} onChange={e => setForm(f => ({ ...f, assigned_to: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name} ({u.username})</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Department</label>
                  <select value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                    <option value="">Select...</option>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Location</label>
                  <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Office / room" />
                </div>
                <div className="proc-form-group">
                  <label>Supplier</label>
                  <select value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))}>
                    <option value="">None</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="proc-form-group">
                  <label>Purchase Date</label>
                  <input type="date" value={form.purchase_date} onChange={e => setForm(f => ({ ...f, purchase_date: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Purchase Cost (TZS)</label>
                  <input type="number" min={0} value={form.purchase_cost} onChange={e => setForm(f => ({ ...f, purchase_cost: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Current Value (TZS)</label>
                  <input type="number" min={0} value={form.current_value} onChange={e => setForm(f => ({ ...f, current_value: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Useful Life (years)</label>
                  <input type="number" min={1} value={form.useful_life_years} onChange={e => setForm(f => ({ ...f, useful_life_years: e.target.value }))} />
                </div>
                <div className="proc-form-group">
                  <label>Warranty Expiry</label>
                  <input type="date" value={form.warranty_expiry} onChange={e => setForm(f => ({ ...f, warranty_expiry: e.target.value }))} />
                </div>
                <div className="proc-form-group proc-form-full">
                  <label>Description / Notes</label>
                  <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
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

export default Assets;

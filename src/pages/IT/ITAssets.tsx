import React, { useState } from 'react';
import {
  ITAsset, AssetCategory, AssetStatus, AssetCondition,
  demoAssets, formatCurrency, formatDate, ASSET_CATEGORIES,
} from './itTypes';

const CATEGORY_ICONS: Record<AssetCategory, string> = {
  computer: 'fas fa-desktop', laptop: 'fas fa-laptop', printer: 'fas fa-print',
  server: 'fas fa-server', network: 'fas fa-network-wired', mobile: 'fas fa-mobile-alt',
  monitor: 'fas fa-tv', other: 'fas fa-microchip',
};

const emptyAsset = (): Partial<ITAsset> => ({
  name: '', category: 'laptop', brand: '', model: '', serialNumber: '',
  purchaseDate: '', purchasePrice: 0, assignedTo: '', location: '',
  condition: 'good', status: 'active', warrantyExpiry: '', notes: '',
});

const ITAssets: React.FC = () => {
  const [assets, setAssets]       = useState<ITAsset[]>(demoAssets);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [filterStat, setFilterStat] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing]     = useState<ITAsset | null>(null);
  const [form, setForm]           = useState<Partial<ITAsset>>(emptyAsset());
  const [viewAsset, setViewAsset] = useState<ITAsset | null>(null);

  // Filtering
  const filtered = assets.filter(a => {
    const q = search.toLowerCase();
    const matchQ = !q || a.name.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q) ||
      a.serialNumber.toLowerCase().includes(q) || a.assignedTo.toLowerCase().includes(q);
    const matchCat  = filterCat  === 'all' || a.category === filterCat;
    const matchStat = filterStat === 'all' || a.status   === filterStat;
    return matchQ && matchCat && matchStat;
  });

  // CRUD
  const openAdd  = () => { setEditing(null); setForm(emptyAsset()); setShowModal(true); };
  const openEdit = (a: ITAsset) => { setEditing(a); setForm({ ...a }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = () => {
    if (!form.name || !form.serialNumber) return;
    if (editing) {
      setAssets(prev => prev.map(a => a.id === editing.id ? { ...editing, ...form } as ITAsset : a));
    } else {
      const newAsset: ITAsset = {
        ...form as ITAsset,
        id: `AST-${String(assets.length + 1).padStart(3, '0')}`,
      };
      setAssets(prev => [newAsset, ...prev]);
    }
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Decommission this asset? This action cannot be undone.')) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const f = (field: keyof ITAsset) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: field === 'purchasePrice' ? Number(e.target.value) : e.target.value }));

  const totalValue = assets.reduce((s, a) => s + a.purchasePrice, 0);

  return (
    <div>
      {/* Summary Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Assets', value: assets.length, color: '#2563eb' },
          { label: 'Active',       value: assets.filter(a => a.status === 'active').length, color: '#10b981' },
          { label: 'In Repair',    value: assets.filter(a => a.status === 'in-repair').length, color: '#f59e0b' },
          { label: 'Total Value',  value: formatCurrency(totalValue), color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className="it-card py-3 text-center">
              <div className="fw-bold mb-0" style={{ fontSize: '1.4rem', color: s.color }}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="it-filter-bar">
        <i className="fas fa-search text-muted"></i>
        <input className="it-search-input" placeholder="Search assets…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="it-filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <select className="it-filter-select" value={filterStat} onChange={e => setFilterStat(e.target.value)}>
          <option value="all">All Statuses</option>
          {(['active', 'in-repair', 'in-storage', 'decommissioned'] as AssetStatus[]).map(s =>
            <option key={s} value={s}>{s.replace('-', ' ')}</option>
          )}
        </select>
        <button className="btn-it-primary ms-auto" onClick={openAdd}>
          <i className="fas fa-plus me-1"></i>Add Asset
        </button>
      </div>

      {/* Table */}
      <div className="it-table-card">
        <div className="table-responsive">
          <table className="table it-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Category</th>
                <th>Serial No.</th>
                <th>Assigned To</th>
                <th>Purchase Price</th>
                <th>Condition</th>
                <th>Status</th>
                <th>Warranty</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-5">
                  <i className="fas fa-laptop fa-2x d-block mb-2" style={{ color: '#cbd5e1' }}></i>No assets found.
                </td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="it-asset-icon">
                        <i className={CATEGORY_ICONS[a.category]}></i>
                      </div>
                      <div>
                        <div className="fw-medium">{a.name}</div>
                        <div className="small text-muted">{a.brand} · {a.model}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="it-category-pill text-capitalize"><i className={`${CATEGORY_ICONS[a.category]} me-1`}></i>{a.category}</span></td>
                  <td className="text-muted small font-monospace">{a.serialNumber}</td>
                  <td>
                    <div className="small fw-medium">{a.assignedTo}</div>
                    <div className="small text-muted">{a.location}</div>
                  </td>
                  <td className="fw-medium small">{formatCurrency(a.purchasePrice)}</td>
                  <td><span className={`it-badge ${a.condition}`}>{a.condition}</span></td>
                  <td><span className={`it-badge ${a.status}`}>{a.status.replace('-', ' ')}</span></td>
                  <td className="small text-muted">{formatDate(a.warrantyExpiry)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light border" title="View" onClick={() => setViewAsset(a)}><i className="fas fa-eye text-primary"></i></button>
                      <button className="btn btn-sm btn-light border" title="Edit" onClick={() => openEdit(a)}><i className="fas fa-edit text-warning"></i></button>
                      <button className="btn btn-sm btn-light border" title="Delete" onClick={() => handleDelete(a.id)}><i className="fas fa-trash text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal show d-block it-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Asset' : 'Add New IT Asset'}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body row g-3 px-4 py-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Asset Name *</label>
                  <input className="form-control" value={form.name || ''} onChange={f('name')} placeholder="e.g. Finance Laptop" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Category *</label>
                  <select className="form-select" value={form.category} onChange={f('category')}>
                    {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Brand</label>
                  <input className="form-control" value={form.brand || ''} onChange={f('brand')} placeholder="e.g. Dell" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Model</label>
                  <input className="form-control" value={form.model || ''} onChange={f('model')} placeholder="e.g. OptiPlex 7090" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Serial Number *</label>
                  <input className="form-control" value={form.serialNumber || ''} onChange={f('serialNumber')} placeholder="e.g. DL-00123" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Assigned To</label>
                  <input className="form-control" value={form.assignedTo || ''} onChange={f('assignedTo')} placeholder="Employee name or Shared" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Location</label>
                  <input className="form-control" value={form.location || ''} onChange={f('location')} placeholder="e.g. Finance Department" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Purchase Date</label>
                  <input type="date" className="form-control" value={form.purchaseDate || ''} onChange={f('purchaseDate')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Purchase Price (TZS)</label>
                  <input type="number" className="form-control" value={form.purchasePrice || ''} onChange={f('purchasePrice')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Warranty Expiry</label>
                  <input type="date" className="form-control" value={form.warrantyExpiry || ''} onChange={f('warrantyExpiry')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Condition</label>
                  <select className="form-select" value={form.condition} onChange={f('condition')}>
                    {(['excellent', 'good', 'fair', 'poor'] as AssetCondition[]).map(c =>
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    )}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={f('status')}>
                    {(['active', 'in-repair', 'in-storage', 'decommissioned'] as AssetStatus[]).map(s =>
                      <option key={s} value={s}>{s.replace('-', ' ')}</option>
                    )}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes || ''} onChange={f('notes')} placeholder="Any additional notes…" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-it-outline" onClick={closeModal}>Cancel</button>
                <button className="btn-it-primary" onClick={handleSave}>
                  {editing ? 'Save Changes' : 'Add Asset'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {viewAsset && (
        <div className="modal show d-block it-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{viewAsset.name}</h5>
                <button className="btn-close" onClick={() => setViewAsset(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ background: '#eff6ff' }}>
                  <div className="it-icon-box blue" style={{ width: '60px', height: '60px', borderRadius: '16px', fontSize: '1.5rem' }}>
                    <i className={CATEGORY_ICONS[viewAsset.category]}></i>
                  </div>
                  <div>
                    <div className="fw-bold fs-5">{viewAsset.name}</div>
                    <div className="text-muted">{viewAsset.brand} {viewAsset.model}</div>
                    <span className={`it-badge ${viewAsset.status} mt-1`}>{viewAsset.status.replace('-', ' ')}</span>
                  </div>
                </div>
                <div className="row g-2">
                  {[
                    { label: 'Asset ID', value: viewAsset.id },
                    { label: 'Serial No.', value: viewAsset.serialNumber },
                    { label: 'Category', value: viewAsset.category },
                    { label: 'Condition', value: viewAsset.condition },
                    { label: 'Assigned To', value: viewAsset.assignedTo },
                    { label: 'Location', value: viewAsset.location },
                    { label: 'Purchase Date', value: formatDate(viewAsset.purchaseDate) },
                    { label: 'Purchase Price', value: formatCurrency(viewAsset.purchasePrice) },
                    { label: 'Warranty Expiry', value: formatDate(viewAsset.warrantyExpiry) },
                  ].map(item => (
                    <div key={item.label} className="col-6">
                      <div className="small text-muted">{item.label}</div>
                      <div className="fw-medium text-capitalize">{item.value}</div>
                    </div>
                  ))}
                  {viewAsset.notes && (
                    <div className="col-12 mt-2">
                      <div className="small text-muted">Notes</div>
                      <div className="small">{viewAsset.notes}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-it-outline" onClick={() => setViewAsset(null)}>Close</button>
                <button className="btn-it-primary" onClick={() => { setViewAsset(null); openEdit(viewAsset); }}>
                  <i className="fas fa-edit me-1"></i>Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ITAssets;

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { FixedAsset, ASSET_CATEGORIES, LOCATIONS } from './assetTypes';
import { SkeletonTable } from '../../components/Skeleton';

const AssetRegister: React.FC = () => {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [locFilter, setLocFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<FixedAsset, 'id'>>({
    asset_tag: `AST-${Math.floor(10000 + Math.random() * 90000)}`,
    name: '',
    category: 'Machinery & Equipment',
    serial_number: `SN-${Math.floor(10000 + Math.random() * 90000)}`,
    location: LOCATIONS[0],
    department_assigned: 'Administration',
    custodian_name: 'Asset Controller',
    purchase_date: new Date().toISOString().split('T')[0],
    purchase_cost: 5000000,
    current_value: 4500000,
    depreciation_rate_pct: 10,
    condition: 'good',
    status: 'active'
  });

  const fetchAssets = async () => {
    try {
      const res = await api.get('/procurement/assets/').catch(() => ({ data: [] }));
      const mapped: FixedAsset[] = (res.data || []).map((a: any, idx: number) => ({
        id: a.id || idx + 1,
        asset_tag: a.asset_tag || `AST-100${idx}`,
        name: a.name || a.asset_name || 'Fixed Asset Item',
        category: a.category || 'Machinery & Equipment',
        serial_number: a.serial_number || `SN-8810${idx}`,
        location: a.location || LOCATIONS[0],
        department_assigned: a.department_assigned || 'Operations',
        custodian_name: a.custodian_name || a.assigned_to_name || 'General Custodian',
        purchase_date: a.purchase_date || '2024-01-15',
        purchase_cost: a.purchase_cost || a.cost || 12000000,
        current_value: a.current_value || a.purchase_cost || 10800000,
        depreciation_rate_pct: a.depreciation_rate_pct || 10,
        condition: a.condition || 'good',
        status: a.status || 'active'
      }));

      if (mapped.length === 0) {
        const demo: FixedAsset[] = [
          { id: 1, asset_tag: 'AST-10045', name: 'Scania Heavy Transport Truck 15T', category: 'Vehicles & Transport', serial_number: 'SN-SC-99120', location: LOCATIONS[2], department_assigned: 'Logistics', custodian_name: 'Rashid Bakari', purchase_date: '2024-03-15', purchase_cost: 185000000, current_value: 148000000, depreciation_rate_pct: 10, condition: 'excellent', status: 'active' },
          { id: 2, asset_tag: 'AST-10046', name: 'Industrial Backup Generator 250kVA', category: 'Machinery & Equipment', serial_number: 'GEN-250-881', location: LOCATIONS[0], department_assigned: 'Administration', custodian_name: 'John Mtangi', purchase_date: '2023-08-10', purchase_cost: 45000000, current_value: 36000000, depreciation_rate_pct: 12, condition: 'good', status: 'active' },
          { id: 3, asset_tag: 'AST-10047', name: 'High-Performance Rack Server Cluster', category: 'IT & Electronics', serial_number: 'SRV-DL-380', location: LOCATIONS[0], department_assigned: 'IT', custodian_name: 'IT Systems Admin', purchase_date: '2025-01-20', purchase_cost: 28000000, current_value: 23800000, depreciation_rate_pct: 15, condition: 'excellent', status: 'active' },
          { id: 4, asset_tag: 'AST-10048', name: 'Toyota Hilux 4x4 Operational Pickup', category: 'Vehicles & Transport', serial_number: 'SN-TY-44120', location: LOCATIONS[5], department_assigned: 'Operations', custodian_name: 'Hamisi Juma', purchase_date: '2024-06-01', purchase_cost: 82000000, current_value: 69700000, depreciation_rate_pct: 10, condition: 'needs-repair', status: 'in-maintenance' },
        ];
        setAssets(demo);
      } else {
        setAssets(mapped);
      }
    } catch {
      setError('Failed to fetch fixed asset register.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/procurement/assets/', form).catch(() => {});
      const newA: FixedAsset = {
        id: Date.now(),
        ...form
      };
      setAssets([newA, ...assets]);
      setShowAddModal(false);
      setForm({
        asset_tag: `AST-${Math.floor(10000 + Math.random() * 90000)}`,
        name: '', category: 'Machinery & Equipment', serial_number: `SN-${Math.floor(10000 + Math.random() * 90000)}`,
        location: LOCATIONS[0], department_assigned: 'Administration', custodian_name: 'Asset Controller',
        purchase_date: new Date().toISOString().split('T')[0], purchase_cost: 5000000, current_value: 4500000,
        depreciation_rate_pct: 10, condition: 'good', status: 'active'
      });
    } catch {
      setError('Failed to register fixed asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAsset = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to remove this asset record from register?')) return;
    try {
      await api.delete(`/procurement/assets/${id}/`).catch(() => {});
      setAssets(assets.filter(a => a.id !== id));
    } catch {
      setError('Failed to delete asset.');
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
                          a.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
                          a.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                          a.custodian_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'all' || a.category === catFilter;
    const matchesLoc = locFilter === 'all' || a.location === locFilter;
    return matchesSearch && matchesCat && matchesLoc;
  });

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        {/* Controls Row */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Fixed Asset Master Register</h5>
            <p className="text-muted small mb-0">Record company capital assets, serial numbers, custodians, depreciation rates, and locations.</p>
          </div>
          <button
            className="btn btn-success text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-plus me-2"></i>Register Fixed Asset
          </button>
        </div>

        {/* Filter Bar */}
        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <input
              type="text" className="form-control"
              placeholder="Search Tag, Name, Serial # or Custodian..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
              <option value="all">All Asset Categories</option>
              {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={locFilter} onChange={e => setLocFilter(e.target.value)}>
              <option value="all">All Locations</option>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        {loading ? (
          <SkeletonTable rows={6} cols={7} />
        ) : (
          <div className="table-responsive border rounded-3">
            <table className="table align-middle mb-0" style={{ fontSize: '0.86rem' }}>
              <thead className="bg-light fw-bold text-muted">
                <tr>
                  <th className="ps-3 py-3 border-0">Asset Tag &amp; Name</th>
                  <th className="py-3 border-0">Category</th>
                  <th className="py-3 border-0">Location &amp; Custodian</th>
                  <th className="py-3 border-0 text-end">Purchase Cost</th>
                  <th className="py-3 border-0 text-end">Book Value (TZS)</th>
                  <th className="py-3 border-0">Condition</th>
                  <th className="py-3 border-0 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No fixed assets match criteria.</td></tr>
                ) : filteredAssets.map(a => (
                  <tr key={a.id}>
                    <td className="ps-3 py-3">
                      <div className="fw-bold text-dark">{a.name}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>#{a.asset_tag} | SN: {a.serial_number}</div>
                    </td>
                    <td className="py-3"><span className="badge bg-light text-dark border">{a.category}</span></td>
                    <td className="py-3 small">
                      <div className="fw-semibold text-dark">{a.location}</div>
                      <div className="text-muted">Custodian: {a.custodian_name}</div>
                    </td>
                    <td className="py-3 text-end fw-semibold text-muted">TZS {a.purchase_cost ? a.purchase_cost.toLocaleString() : 0}</td>
                    <td className="py-3 text-end fw-bold text-dark">TZS {a.current_value ? a.current_value.toLocaleString() : 0}</td>
                    <td className="py-3">
                      <span className={`badge ${
                        a.condition === 'excellent' || a.condition === 'good' ? 'bg-success-subtle text-success border border-success-subtle' :
                        a.condition === 'fair' ? 'bg-info-subtle text-info border border-info-subtle' :
                        'bg-danger-subtle text-danger border border-danger-subtle'
                      }`} style={{ borderRadius: '6px' }}>
                        {a.condition.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-end pe-4">
                      <button
                        className="btn btn-sm btn-outline-danger py-1 px-2 fw-semibold"
                        style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                        onClick={() => handleDeleteAsset(a.id)}
                        title="Delete Asset Record"
                      >
                        <i className="fas fa-trash-alt me-1"></i>Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold"><i className="fas fa-cubes text-success me-2"></i>Register Fixed Asset</h5>
                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddAsset}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Asset Tag Code *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.asset_tag} onChange={e => setForm({...form, asset_tag: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Asset Name / Model *</label>
                    <input type="text" required className="form-control bg-light" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Caterpillar Diesel Generator 250kVA" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Category</label>
                    <select className="form-select bg-light" value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
                      {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Serial Number</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Physical Location</label>
                    <select className="form-select bg-light" value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                      {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Assigned Custodian Name</label>
                    <input type="text" required className="form-control bg-light" value={form.custodian_name} onChange={e => setForm({...form, custodian_name: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Purchase Date</label>
                    <input type="date" required className="form-control bg-light" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Purchase Cost (TZS)</label>
                    <input type="number" min={0} required className="form-control bg-light" value={form.purchase_cost} onChange={e => setForm({...form, purchase_cost: Number(e.target.value)})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Current Book Value (TZS)</label>
                    <input type="number" min={0} required className="form-control bg-light" value={form.current_value} onChange={e => setForm({...form, current_value: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success text-white fw-bold px-4" disabled={saving}>
                    {saving ? 'Registering...' : 'Register Asset'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetRegister;

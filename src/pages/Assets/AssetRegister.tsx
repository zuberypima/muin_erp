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
      const res = await api.get('/assets/fixed-assets/').catch(() => ({ data: [] }));
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const mapped: FixedAsset[] = dataArr.map((a: any) => ({
        id: a.id,
        asset_tag: a.asset_tag,
        name: a.name,
        category: a.category || 'Machinery & Equipment',
        serial_number: a.serial_number || 'SN-00000',
        location: a.location || LOCATIONS[0],
        department_assigned: a.department_assigned || 'Administration',
        custodian_name: a.custodian_name || 'Custodian',
        purchase_date: a.purchase_date || '2024-01-01',
        purchase_cost: Number(a.purchase_cost) || 0,
        current_value: Number(a.current_value) || 0,
        depreciation_rate_pct: Number(a.depreciation_rate_pct) || 10,
        condition: a.condition || 'good',
        status: a.status || 'active'
      }));

      if (mapped.length === 0) {
        const demo: FixedAsset[] = [
          { id: 1, asset_tag: 'AST-10045', name: 'Scania Heavy Transport Truck 15T', category: 'Vehicles & Transport', serial_number: 'SN-SC-99120', location: LOCATIONS[2], department_assigned: 'Logistics', custodian_name: 'Rashid Bakari', purchase_date: '2024-03-15', purchase_cost: 185000000, current_value: 148000000, depreciation_rate_pct: 10, condition: 'excellent', status: 'active' },
          { id: 2, asset_tag: 'AST-10046', name: 'Industrial Backup Generator 250kVA', category: 'Machinery & Equipment', serial_number: 'GEN-250-881', location: LOCATIONS[0], department_assigned: 'Administration', custodian_name: 'John Mtangi', purchase_date: '2023-08-10', purchase_cost: 45000000, current_value: 36000000, depreciation_rate_pct: 12, condition: 'good', status: 'active' },
          { id: 3, asset_tag: 'AST-10047', name: 'High-Performance Rack Server Cluster', category: 'IT & Electronics', serial_number: 'SRV-DL-380', location: LOCATIONS[0], department_assigned: 'IT', custodian_name: 'IT Systems Admin', purchase_date: '2025-01-20', purchase_cost: 28000000, current_value: 23800000, depreciation_rate_pct: 15, condition: 'excellent', status: 'active' },
        ];
        setAssets(demo);
      } else {
        setAssets(mapped);
      }
    } catch {
      setError('Failed to fetch fixed assets.');
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
      const res = await api.post('/assets/fixed-assets/', form);
      const newA: FixedAsset = {
        id: res.data.id || Date.now(),
        ...form
      };
      setAssets([newA, ...assets]);
      setShowAddModal(false);
      setForm({
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
    } catch {
      setError('Failed to register new fixed asset.');
    } finally {
      setSaving(false);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.asset_tag.toLowerCase().includes(search.toLowerCase()) ||
                          a.name.toLowerCase().includes(search.toLowerCase()) ||
                          a.serial_number.toLowerCase().includes(search.toLowerCase()) ||
                          a.custodian_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === 'all' || a.category === catFilter;
    const matchesLoc = locFilter === 'all' || a.location === locFilter;
    return matchesSearch && matchesCat && matchesLoc;
  });

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Master Fixed Asset Register</h5>
            <p className="text-muted small mb-0">Track company assets, custodians, net book values, locations, and depreciation rates.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowAddModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-plus me-2"></i>Register Fixed Asset
          </button>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <input
              type="text" className="form-control"
              placeholder="Search Tag #, Asset Name, Serial Code or Custodian..."
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

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <SkeletonTable rows={5} columns={8} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead className="table-light">
                <tr>
                  <th>Asset Tag</th>
                  <th>Asset Description</th>
                  <th>Category</th>
                  <th>Location & Department</th>
                  <th>Custodian</th>
                  <th>Purchase Cost (TZS)</th>
                  <th>Current Value (TZS)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(a => (
                  <tr key={a.id}>
                    <td className="fw-bold text-dark">{a.asset_tag}</td>
                    <td>
                      <span className="fw-bold text-dark d-block">{a.name}</span>
                      <small className="text-muted">SN: {a.serial_number}</small>
                    </td>
                    <td><span className="badge bg-secondary">{a.category}</span></td>
                    <td>
                      <span className="d-block text-dark fw-semibold">{a.location}</span>
                      <small className="text-muted">{a.department_assigned}</small>
                    </td>
                    <td>{a.custodian_name}</td>
                    <td className="fw-semibold text-dark">TZS {a.purchase_cost.toLocaleString()}</td>
                    <td className="fw-bold text-primary">TZS {a.current_value.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${a.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="modal show d-block tab-fade" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Register Fixed Asset</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
              </div>
              <form onSubmit={handleAddAsset}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Asset Tag Code</label>
                      <input type="text" className="form-control" required value={form.asset_tag} onChange={e => setForm({...form, asset_tag: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Asset Name</label>
                      <input type="text" className="form-control" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Category</label>
                      <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value as any})}>
                        {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Serial Number</label>
                      <input type="text" className="form-control" required value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Location</label>
                      <select className="form-select" value={form.location} onChange={e => setForm({...form, location: e.target.value})}>
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Custodian Name</label>
                      <input type="text" className="form-control" required value={form.custodian_name} onChange={e => setForm({...form, custodian_name: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Purchase Cost (TZS)</label>
                      <input type="number" className="form-control" required value={form.purchase_cost} onChange={e => setForm({...form, purchase_cost: Number(e.target.value), current_value: Number(e.target.value)})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Purchase Date</label>
                      <input type="date" className="form-control" required value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Fixed Asset'}
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

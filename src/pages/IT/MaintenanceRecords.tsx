import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
  MaintenanceRecord, MaintenanceType, MaintenanceStatus, ITAsset,
  formatCurrency, formatDate,
} from './itTypes';

const TYPES: MaintenanceType[]    = ['preventive', 'corrective', 'upgrade', 'inspection'];
const STATUSES: MaintenanceStatus[] = ['scheduled', 'in-progress', 'completed', 'cancelled'];
const TECHNICIANS = ['Grace Mwangi', 'External — TechFix Ltd', 'External — NetPro Solutions'];

const emptyRecord = (): Partial<MaintenanceRecord> => ({
  asset_id: '', asset_name: '',
  type: 'preventive', description: '', performed_by: 'Grace Mwangi',
  cost: 0, scheduled_date: null, completed_date: null, next_maintenance_date: null, status: 'scheduled',
});

const TYPE_ICON: Record<MaintenanceType, string> = {
  preventive: 'fas fa-shield-alt', corrective: 'fas fa-wrench',
  upgrade: 'fas fa-arrow-circle-up', inspection: 'fas fa-search',
};
const TYPE_COLOR: Record<MaintenanceType, string> = {
  preventive: 'emerald', corrective: 'red', upgrade: 'blue', inspection: 'purple',
};

const MaintenanceRecords: React.FC = () => {
  const [records, setRecords]         = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets]           = useState<ITAsset[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType]   = useState<string>('all');
  
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<MaintenanceRecord | null>(null);
  const [form, setForm]               = useState<Partial<MaintenanceRecord>>(emptyRecord());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, astRes] = await Promise.all([
          api.get('/it/maintenance/'),
          api.get('/it/assets/')
        ]);
        setRecords(recRes.data);
        setAssets(astRes.data);
        if (astRes.data.length > 0) {
          emptyRecord().asset_id = astRes.data[0].id;
          emptyRecord().asset_name = astRes.data[0].name;
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = records.filter(r => {
    const q = search.toLowerCase();
    const matchQ    = !q || r.asset_name.toLowerCase().includes(q) || r.performed_by.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    const matchStat = filterStatus === 'all' || r.status === filterStatus;
    const matchType = filterType   === 'all' || r.type   === filterType;
    return matchQ && matchStat && matchType;
  });

  const openAdd  = () => { 
    setEditing(null); 
    const r = emptyRecord();
    if (assets.length > 0) {
        r.asset_id = assets[0].id;
        r.asset_name = assets[0].name;
    }
    setForm(r); 
    setShowModal(true); 
  };
  const openEdit = (r: MaintenanceRecord) => { setEditing(r); setForm({ ...r }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.asset_id || !form.scheduled_date) return;
    try {
      if (editing) {
        const res = await api.put(`/it/maintenance/${editing.id}/`, form);
        setRecords(prev => prev.map(r => r.id === editing.id ? res.data : r));
      } else {
        const payload = {
          ...form,
          id: `MNT-${String(records.length + 1).padStart(3, '0')}`,
        };
        const res = await api.post('/it/maintenance/', payload);
        setRecords(prev => [res.data, ...prev]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
      alert('Error saving maintenance record');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this maintenance record?')) {
      try {
        await api.delete(`/it/maintenance/${id}/`);
        setRecords(prev => prev.filter(r => r.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const f = (field: keyof MaintenanceRecord) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      let val: string | number | null = e.target.value;
      if (field === 'cost') val = Number(e.target.value);
      if ((field === 'scheduled_date' || field === 'completed_date' || field === 'next_maintenance_date') && val === '') val = null;
      // If asset changes, also update asset_name
      if (field === 'asset_id') {
        const asset = assets.find(a => a.id === e.target.value);
        setForm(prev => ({ ...prev, asset_id: e.target.value, asset_name: asset?.name || '' }));
        return;
      }
      setForm(prev => ({ ...prev, [field]: val }));
    };

  const scheduled  = records.filter(r => r.status === 'scheduled').length;
  const inProgress = records.filter(r => r.status === 'in-progress').length;
  const completed  = records.filter(r => r.status === 'completed').length;
  const totalCost  = records.filter(r => r.status === 'completed').reduce((s, r) => s + Number(r.cost), 0);

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Scheduled',     value: scheduled,              color: '#d97706' },
          { label: 'In Progress',   value: inProgress,             color: '#2563eb' },
          { label: 'Completed',     value: completed,              color: '#10b981' },
          { label: 'Total Cost',    value: formatCurrency(totalCost), color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className="it-card py-3 text-center">
              <div className="fw-bold mb-0" style={{ fontSize: s.label === 'Total Cost' ? '1rem' : '1.4rem', color: s.color }}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="it-filter-bar">
        <i className="fas fa-search text-muted"></i>
        <input className="it-search-input" placeholder="Search maintenance records…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="it-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
        </select>
        <select className="it-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <button className="btn-it-primary ms-auto" onClick={openAdd}>
          <i className="fas fa-plus me-1"></i>Log Maintenance
        </button>
      </div>

      {/* Table */}
      <div className="it-table-card">
        <div className="table-responsive">
          <table className="table it-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Description</th>
                <th>Performed By</th>
                <th>Scheduled</th>
                <th>Completed</th>
                <th>Cost</th>
                <th>Status</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="text-center text-muted py-5">
                  <i className="fas fa-tools fa-2x d-block mb-2" style={{ color: '#cbd5e1' }}></i>No records found.
                </td></tr>
              ) : filtered.map(r => (
                <tr key={r.id}>
                  <td className="small text-muted font-monospace">{r.id}</td>
                  <td className="fw-medium small">{r.asset_name}</td>
                  <td>
                    <span className={`it-badge ${TYPE_COLOR[r.type]}`} style={{ background: 'transparent', border: '1.5px solid currentColor' }}>
                      <i className={TYPE_ICON[r.type]}></i> {r.type}
                    </span>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <div className="small" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.description}</div>
                  </td>
                  <td className="small">{r.performed_by}</td>
                  <td className="small text-muted">{formatDate(r.scheduled_date)}</td>
                  <td className="small text-muted">{r.completed_date ? formatDate(r.completed_date) : '—'}</td>
                  <td className="small fw-medium">{r.cost > 0 ? formatCurrency(r.cost) : <span className="text-muted">Free</span>}</td>
                  <td><span className={`it-badge ${r.status}`}>{r.status.replace('-', ' ')}</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light border" title="Edit" onClick={() => openEdit(r)}><i className="fas fa-edit text-warning"></i></button>
                      <button className="btn btn-sm btn-light border" title="Delete" onClick={() => handleDelete(r.id)}><i className="fas fa-trash text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block it-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Maintenance Record' : 'Log Maintenance'}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body row g-3 px-4 py-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Asset *</label>
                  <select className="form-select" value={form.asset_id} onChange={f('asset_id')}>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.name} ({a.id})</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Maintenance Type</label>
                  <select className="form-select" value={form.type} onChange={f('type')}>
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control" rows={3} value={form.description || ''} onChange={f('description')} placeholder="Describe the maintenance work…" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Performed By</label>
                  <select className="form-select" value={form.performed_by} onChange={f('performed_by')}>
                    {TECHNICIANS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Cost (TZS)</label>
                  <input type="number" className="form-control" value={form.cost || 0} onChange={f('cost')} placeholder="0 if internal" />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Scheduled Date *</label>
                  <input type="date" className="form-control" value={form.scheduled_date || ''} onChange={f('scheduled_date')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Completed Date</label>
                  <input type="date" className="form-control" value={form.completed_date || ''} onChange={f('completed_date')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Next Maintenance Date</label>
                  <input type="date" className="form-control" value={form.next_maintenance_date || ''} onChange={f('next_maintenance_date')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={f('status')}>
                    {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-it-outline" onClick={closeModal}>Cancel</button>
                <button className="btn-it-primary" onClick={handleSave}>
                  {editing ? 'Save Changes' : 'Log Record'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceRecords;

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosConfig';
import {
  MaintenanceRecord, MaintenanceType, MaintenanceStatus, ITAsset,
  formatCurrency, formatDate,
} from './itTypes';

const TYPES: MaintenanceType[]    = ['preventive', 'corrective', 'upgrade', 'inspection'];
const STATUSES: MaintenanceStatus[] = ['scheduled', 'in-progress', 'completed', 'cancelled'];

const emptyRecord = (defaultPerformedBy: string = ''): Partial<MaintenanceRecord> => ({
  asset_id: '', asset_name: '',
  type: 'preventive', description: '', performed_by: defaultPerformedBy,
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
  const [records, setRecords]           = useState<MaintenanceRecord[]>([]);
  const [assets, setAssets]             = useState<ITAsset[]>([]);
  const [technicians, setTechnicians]   = useState<string[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType]     = useState<string>('all');
  
  const [showModal, setShowModal]       = useState(false);
  const [editing, setEditing]           = useState<MaintenanceRecord | null>(null);
  const [form, setForm]                 = useState<Partial<MaintenanceRecord>>(emptyRecord());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, astRes, usersRes, empRes] = await Promise.all([
          api.get('/it/maintenance/').catch(() => ({ data: [] })),
          api.get('/it/assets/').catch(() => ({ data: [] })),
          api.get('/users/').catch(() => ({ data: [] })),
          api.get('/hr/employees/').catch(() => ({ data: [] })),
        ]);

        const recList = Array.isArray(recRes.data) ? recRes.data : (recRes.data?.results || []);
        const astList = Array.isArray(astRes.data) ? astRes.data : (astRes.data?.results || []);
        const rawUsers = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.results || []);
        const rawEmps = Array.isArray(empRes.data) ? empRes.data : (empRes.data?.results || []);

        setRecords(recList);
        setAssets(astList);

        // Build real IT staff list from users & employees API
        const itUsers: string[] = [];
        const otherUsers: string[] = [];

        // Parse system users
        rawUsers.forEach((u: any) => {
          const dept = (u.department || u.profile?.department || '').trim();
          const fullName = (u.first_name || u.last_name) 
            ? `${u.first_name || ''} ${u.last_name || ''}`.trim() 
            : u.username;
          const displayStr = dept ? `${fullName} (${dept})` : fullName;

          if (dept.toLowerCase().includes('it') || u.username?.toLowerCase().includes('it')) {
            itUsers.push(displayStr);
          } else {
            otherUsers.push(displayStr);
          }
        });

        // Parse employees if missing
        rawEmps.forEach((e: any) => {
          const dept = (e.department || '').trim();
          const fullName = `${e.first_name || ''} ${e.last_name || ''}`.trim();
          if (fullName) {
            const displayStr = dept ? `${fullName} (${dept})` : fullName;
            if (dept.toLowerCase().includes('it')) {
              itUsers.push(displayStr);
            } else {
              otherUsers.push(displayStr);
            }
          }
        });

        // Combine into unique technician options: IT staff first, then other users, then external vendors
        const combined = Array.from(new Set([
          ...itUsers,
          ...otherUsers,
          'External — TechFix Ltd',
          'External — NetPro Solutions'
        ])).filter(Boolean);

        setTechnicians(combined);

        const initialPerformedBy = combined[0] || 'IT Staff';
        if (astList.length > 0) {
          emptyRecord(initialPerformedBy).asset_id = astList[0].id;
          emptyRecord(initialPerformedBy).asset_name = astList[0].name;
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
    const matchQ    = !q || r.asset_name.toLowerCase().includes(q) || (r.performed_by || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q);
    const matchStat = filterStatus === 'all' || r.status === filterStatus;
    const matchType = filterType   === 'all' || r.type   === filterType;
    return matchQ && matchStat && matchType;
  });

  const openAdd = () => { 
    setEditing(null); 
    const defaultTech = technicians[0] || '';
    const r = emptyRecord(defaultTech);
    if (assets.length > 0) {
      r.asset_id = assets[0].id;
      r.asset_name = assets[0].name;
    }
    setForm(r); 
    setShowModal(true); 
  };

  const openEdit = (r: MaintenanceRecord) => { 
    setEditing(r); 
    setForm({ ...r }); 
    setShowModal(true); 
  };

  const closeModal = () => { 
    setShowModal(false); 
    setEditing(null); 
  };

  const handleSave = async () => {
    if (!form.asset_id || !form.scheduled_date) return;
    try {
      if (editing) {
        const res = await api.put(`/it/maintenance/${editing.id}/`, form);
        setRecords(prev => prev.map(r => r.id === editing.id ? res.data : r));
      } else {
        const existingNums = records.map(r => {
          const m = r.id?.match(/\d+/);
          return m ? parseInt(m[0], 10) : 0;
        });
        const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
        const newId = `MNT-${String(maxNum + 1).padStart(3, '0')}`;

        const payload = {
          ...form,
          id: newId,
        };
        const res = await api.post('/it/maintenance/', payload);
        setRecords(prev => [res.data, ...prev]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this maintenance record?')) return;
    try {
      await api.delete(`/it/maintenance/${id}/`);
      setRecords(prev => prev.filter(r => r.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const f = (field: keyof MaintenanceRecord) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const val = e.target.value;
    setForm(prev => {
      const updated = { ...prev, [field]: val };
      if (field === 'asset_id') {
        const found = assets.find(a => a.id === val);
        if (found) updated.asset_name = found.name;
      }
      return updated;
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Subnav & Toolbar */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h4 className="fw-bold mb-1">Maintenance Records</h4>
          <p className="text-muted small mb-0">Track hardware & software maintenance tasks, upgrades, and costs</p>
        </div>
        <button className="btn-it-primary" onClick={openAdd}>
          <i className="fas fa-plus me-1"></i> Log Maintenance
        </button>
      </div>

      {/* Filters */}
      <div className="it-card p-3 mb-4">
        <div className="row g-2">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search by asset, technician, description…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
            >
              <option value="all">All Maintenance Types</option>
              {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <select
              className="form-select form-select-sm"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="it-card overflow-hidden">
        <div className="table-responsive">
          <table className="table it-table align-middle mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Description</th>
                <th>Performed By</th>
                <th>Cost</th>
                <th>Scheduled</th>
                <th>Completed</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-4 text-muted">
                    No maintenance records found.
                  </td>
                </tr>
              ) : (
                filtered.map(r => (
                  <tr key={r.id}>
                    <td className="fw-semibold font-monospace small">{r.record_id || r.id}</td>
                    <td>
                      <span className="fw-medium text-dark">{r.asset_name}</span>
                      <br />
                      <span className="text-muted extra-small">{r.asset_id}</span>
                    </td>
                    <td>
                      <span className={`badge-it badge-it-${TYPE_COLOR[r.type]}`}>
                        <i className={`${TYPE_ICON[r.type]} me-1`}></i>
                        {r.type}
                      </span>
                    </td>
                    <td style={{ maxWidth: '220px' }} className="text-truncate">
                      {r.description || '—'}
                    </td>
                    <td>{r.performed_by}</td>
                    <td>{formatCurrency(r.cost)}</td>
                    <td>{formatDate(r.scheduled_date)}</td>
                    <td>{formatDate(r.completed_date)}</td>
                    <td>
                      <span className={`badge-it badge-it-${
                        r.status === 'completed'   ? 'emerald' :
                        r.status === 'in-progress' ? 'blue'    :
                        r.status === 'cancelled'   ? 'red'     : 'amber'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        <button className="btn btn-sm btn-light border" onClick={() => openEdit(r)}>
                          <i className="fas fa-edit text-secondary"></i>
                        </button>
                        <button className="btn btn-sm btn-light border" onClick={() => handleDelete(r.id)}>
                          <i className="fas fa-trash text-danger"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Portal */}
      {showModal && createPortal(
        <div
          className="modal show d-block"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div className="modal-dialog modal-lg modal-dialog-scrollable w-100" style={{ maxWidth: '720px', margin: '0 1rem' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
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
                  <select className="form-select" value={form.performed_by || ''} onChange={f('performed_by')}>
                    {technicians.map(t => <option key={t} value={t}>{t}</option>)}
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
        </div>,
        document.body
      )}
    </div>
  );
};

export default MaintenanceRecords;

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
  SoftwareLicense, LicenseType, LicenseStatus,
  formatCurrency, formatDate,
} from './itTypes';

const LICENSE_TYPES: LicenseType[] = ['perpetual', 'subscription', 'open-source', 'trial'];

const emptyLicense = (): Partial<SoftwareLicense> => ({
  software_name: '', vendor: '', license_key: '', license_type: 'subscription',
  seats_total: 1, seats_used: 0, purchase_date: null, expiry_date: null, cost: 0,
  status: 'active', notes: '',
});

const TYPE_COLOR: Record<LicenseType, string> = {
  subscription: 'blue', perpetual: 'emerald', 'open-source': 'purple', trial: 'amber',
};

const SoftwareLicenses: React.FC = () => {
  const [licenses, setLicenses]       = useState<SoftwareLicense[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType]   = useState<string>('all');
  
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<SoftwareLicense | null>(null);
  const [form, setForm]               = useState<Partial<SoftwareLicense>>(emptyLicense());

  const fetchLicenses = async () => {
    try {
      const res = await api.get('/it/licenses/');
      setLicenses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  const filtered = licenses.filter(l => {
    const q = search.toLowerCase();
    const matchQ    = !q || l.software_name.toLowerCase().includes(q) || l.vendor.toLowerCase().includes(q);
    const matchStat = filterStatus === 'all' || l.status      === filterStatus;
    const matchType = filterType   === 'all' || l.license_type === filterType;
    return matchQ && matchStat && matchType;
  });

  const openAdd  = () => { setEditing(null); setForm(emptyLicense()); setShowModal(true); };
  const openEdit = (l: SoftwareLicense) => { setEditing(l); setForm({ ...l }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.software_name || !form.vendor) return;
    try {
      if (editing) {
        const res = await api.put(`/it/licenses/${editing.id}/`, form);
        setLicenses(prev => prev.map(l => l.id === editing.id ? res.data : l));
      } else {
        const payload = {
          ...form,
          id: `LIC-${String(licenses.length + 1).padStart(3, '0')}`,
        };
        const res = await api.post('/it/licenses/', payload);
        setLicenses(prev => [res.data, ...prev]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
      alert('Error saving license');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Remove this software license?')) {
      try {
        await api.delete(`/it/licenses/${id}/`);
        setLicenses(prev => prev.filter(l => l.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const f = (field: keyof SoftwareLicense) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      let val: string | number | null = e.target.value;
      if (['seats_total', 'seats_used', 'cost'].includes(field)) val = Number(val);
      if ((field === 'purchase_date' || field === 'expiry_date') && val === '') val = null;
      setForm(prev => ({ ...prev, [field]: val }));
    };

  const getSeatColor = (used: number, total: number) => {
    const pct = total === 0 ? 0 : (used / total) * 100;
    if (pct >= 90) return 'high';
    if (pct >= 70) return 'medium';
    return 'low';
  };

  // KPIs
  const active      = licenses.filter(l => l.status === 'active').length;
  const expiringSoon = licenses.filter(l => l.status === 'expiring-soon').length;
  const expired     = licenses.filter(l => l.status === 'expired').length;
  const totalCost   = licenses.reduce((s, l) => s + Number(l.cost), 0);

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Active Licenses',  value: active,             color: '#10b981' },
          { label: 'Expiring Soon',    value: expiringSoon,       color: '#ea580c' },
          { label: 'Expired',          value: expired,            color: '#ef4444' },
          { label: 'Annual Cost',      value: formatCurrency(totalCost), color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className="it-card py-3 text-center">
              <div className="fw-bold mb-0" style={{ fontSize: s.label === 'Annual Cost' ? '1rem' : '1.4rem', color: s.color }}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      {(expiringSoon > 0 || expired > 0) && (
        <div className="alert border-0 rounded-3 mb-3 d-flex align-items-center gap-3"
          style={{ background: expired > 0 ? '#fef2f2' : '#fff7ed', color: expired > 0 ? '#dc2626' : '#ea580c' }}>
          <i className={`fas fa-${expired > 0 ? 'exclamation-circle' : 'exclamation-triangle'} fa-lg`}></i>
          <div>
            {expired > 0 && <strong>{expired} license{expired > 1 ? 's' : ''} expired</strong>}
            {expired > 0 && expiringSoon > 0 && ' · '}
            {expiringSoon > 0 && <strong>{expiringSoon} expiring soon</strong>}
            {' — review and renew as needed.'}
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="it-filter-bar">
        <i className="fas fa-search text-muted"></i>
        <input className="it-search-input" placeholder="Search software…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="it-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {(['active', 'expiring-soon', 'expired'] as LicenseStatus[]).map(s =>
            <option key={s} value={s}>{s.replace('-', ' ')}</option>
          )}
        </select>
        <select className="it-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="all">All Types</option>
          {LICENSE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <button className="btn-it-primary ms-auto" onClick={openAdd}>
          <i className="fas fa-plus me-1"></i>Add License
        </button>
      </div>

      {/* Cards grid */}
      <div className="row g-3">
        {filtered.length === 0 ? (
          <div className="col-12 text-center text-muted py-5">
            <i className="fas fa-key fa-2x d-block mb-2" style={{ color: '#cbd5e1' }}></i>No licenses found.
          </div>
        ) : filtered.map(l => {
          const pct = l.seats_total === 0 ? 0 : Math.round((l.seats_used / l.seats_total) * 100);
          const seatColor = getSeatColor(l.seats_used, l.seats_total);
          return (
            <div key={l.id} className="col-md-6 col-xl-4">
              <div className="it-card h-100">
                <div className="d-flex align-items-start justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className={`it-icon-box ${TYPE_COLOR[l.license_type]}`}>
                      <i className="fas fa-key"></i>
                    </div>
                    <div>
                      <div className="fw-bold">{l.software_name}</div>
                      <div className="small text-muted">{l.vendor}</div>
                    </div>
                  </div>
                  <span className={`it-badge ${l.status}`}>{l.status.replace('-', ' ')}</span>
                </div>

                {/* License key */}
                <div className="rounded-2 p-2 mb-3" style={{ background: '#f8fafc', fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569', wordBreak: 'break-all' }}>
                  {l.license_key || '—'}
                </div>

                {/* Seats bar */}
                {l.license_type !== 'open-source' && (
                  <div className="mb-3">
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="text-muted">Seats Used</span>
                      <span className="fw-semibold">{l.seats_used} / {l.seats_total} ({pct}%)</span>
                    </div>
                    <div className="it-seat-bar">
                      <div className={`it-seat-bar-fill ${seatColor}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                {/* Meta */}
                <div className="row g-2 small">
                  <div className="col-6">
                    <span className="text-muted d-block">Type</span>
                    <span className={`it-badge ${TYPE_COLOR[l.license_type]}`} style={{ background: 'transparent', border: '1.5px solid currentColor', fontSize: '0.72rem' }}>
                      {l.license_type}
                    </span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Cost</span>
                    <span className="fw-medium">{l.cost > 0 ? formatCurrency(l.cost) : 'Free'}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Purchase</span>
                    <span className="fw-medium">{formatDate(l.purchase_date)}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted d-block">Expiry</span>
                    <span className={`fw-medium ${l.status === 'expired' ? 'text-danger' : l.status === 'expiring-soon' ? 'text-warning' : ''}`}>
                      {formatDate(l.expiry_date)}
                    </span>
                  </div>
                </div>

                {l.notes && (
                  <div className="mt-2 pt-2 border-top small text-muted">
                    <i className="fas fa-info-circle me-1"></i>{l.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="d-flex gap-2 mt-3 pt-3 border-top">
                  <button className="btn-it-outline flex-grow-1" onClick={() => openEdit(l)}>
                    <i className="fas fa-edit me-1"></i>Edit
                  </button>
                  <button className="btn btn-sm btn-light border" onClick={() => handleDelete(l.id)}>
                    <i className="fas fa-trash text-danger"></i>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block it-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editing ? 'Edit License' : 'Add Software License'}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body row g-3 px-4 py-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Software Name *</label>
                  <input className="form-control" value={form.software_name || ''} onChange={f('software_name')} placeholder="e.g. Microsoft 365" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Vendor *</label>
                  <input className="form-control" value={form.vendor || ''} onChange={f('vendor')} placeholder="e.g. Microsoft" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">License Key</label>
                  <input className="form-control font-monospace" value={form.license_key || ''} onChange={f('license_key')} placeholder="XXXX-XXXX-XXXX-XXXX" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">License Type</label>
                  <select className="form-select" value={form.license_type} onChange={f('license_type')}>
                    {LICENSE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Total Seats</label>
                  <input type="number" className="form-control" value={form.seats_total || 1} onChange={f('seats_total')} min={1} />
                </div>
                <div className="col-md-3">
                  <label className="form-label small fw-semibold">Seats Used</label>
                  <input type="number" className="form-control" value={form.seats_used || 0} onChange={f('seats_used')} min={0} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Purchase Date</label>
                  <input type="date" className="form-control" value={form.purchase_date || ''} onChange={f('purchase_date')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Expiry Date</label>
                  <input type="date" className="form-control" value={form.expiry_date || ''} onChange={f('expiry_date')} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small fw-semibold">Annual Cost (TZS)</label>
                  <input type="number" className="form-control" value={form.cost || 0} onChange={f('cost')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={f('status')}>
                    {(['active', 'expiring-soon', 'expired'] as LicenseStatus[]).map(s =>
                      <option key={s} value={s}>{s.replace('-', ' ')}</option>
                    )}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes || ''} onChange={f('notes')} placeholder="Renewal reminders, migration notes…" />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-it-outline" onClick={closeModal}>Cancel</button>
                <button className="btn-it-primary" onClick={handleSave}>
                  {editing ? 'Save Changes' : 'Add License'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoftwareLicenses;

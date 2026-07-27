import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { MarineAsset, TERMINAL_YARDS } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';
import ModalPortal from '../../components/ModalPortal';

const LogisticsFleet: React.FC = () => {
  const [assets, setAssets] = useState<MarineAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<MarineAsset, 'id'>>({
    asset_tag: `MAR-${Math.floor(100 + Math.random() * 900)}`,
    name: 'Tugboat MUIN Protector 1',
    asset_type: 'Tugboat',
    registration_number: 'TZ-TB-8812',
    terminal_base: TERMINAL_YARDS[0],
    operator_name: 'Capt. Joseph Mtangi',
    status: 'operational',
    capacity: '60-Ton Bollard Pull',
    last_inspection: new Date().toISOString().split('T')[0]
  });

  const fetchAssets = async () => {
    try {
      const res = await api.get('/procurement/assets/').catch(() => ({ data: [] }));
      const mapped: MarineAsset[] = (res.data || []).map((a: any, idx: number) => ({
        id: a.id || idx + 1,
        asset_tag: a.asset_tag || `MAR-20${idx}`,
        name: a.name || a.asset_name || 'Port Equipment',
        asset_type: a.asset_type || 'Reach Stacker',
        registration_number: a.registration_number || a.location || `TZ-EQ-90${idx}`,
        terminal_base: a.terminal_base || TERMINAL_YARDS[0],
        operator_name: a.operator_name || 'Port Crane Operator',
        status: a.status === 'under_maintenance' ? 'under-maintenance' : 'operational',
        capacity: a.capacity || '45-Ton Capacity',
        last_inspection: a.last_inspection || '2026-07-01'
      }));

      if (mapped.length === 0) {
        const demo: MarineAsset[] = [
          { id: 1, asset_tag: 'MAR-101', name: 'Tugboat MUIN Protector I', asset_type: 'Tugboat', registration_number: 'TZ-TB-8812', terminal_base: TERMINAL_YARDS[0], operator_name: 'Capt. Joseph Mtangi', capacity: '60-Ton Bollard Pull', status: 'operational', last_inspection: '2026-07-10' },
          { id: 2, asset_tag: 'MAR-102', name: 'Ship-to-Shore (STS) Gantry Crane 03', asset_type: 'Quay Crane (STS)', registration_number: 'CRN-STS-03', terminal_base: TERMINAL_YARDS[0], operator_name: 'Lead Crane Team Alpha', capacity: '65-Ton Heavy Lift', status: 'operational', last_inspection: '2026-07-15' },
          { id: 3, asset_tag: 'MAR-103', name: 'Kalmar 45-Ton Container Reach Stacker', asset_type: 'Reach Stacker', registration_number: 'RS-04', terminal_base: TERMINAL_YARDS[1], operator_name: 'Amina K. (Operator)', capacity: '45-Ton Stacking', status: 'operational', last_inspection: '2026-07-20' },
          { id: 4, asset_tag: 'MAR-104', name: 'Harbour Tug MUIN Pioneer II', asset_type: 'Tugboat', registration_number: 'TZ-TB-8813', terminal_base: TERMINAL_YARDS[0], operator_name: 'Capt. Suleiman Hassan', capacity: '50-Ton Bollard Pull', status: 'dry-docking', last_inspection: '2026-06-01' },
          { id: 5, asset_tag: 'MAR-105', name: 'Scania 6x4 Heavy Cargo Haulier', asset_type: 'Haulage Truck', registration_number: 'T 812 BCD', terminal_base: TERMINAL_YARDS[4], operator_name: 'Rashid Bakari', capacity: '40-Ton Payload', status: 'under-maintenance', last_inspection: '2026-05-18' },
        ];
        setAssets(demo);
      } else {
        setAssets(mapped);
      }
    } catch {
      setError('Failed to fetch marine assets.');
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
      const newA: MarineAsset = {
        id: Date.now(),
        ...form
      };
      setAssets([newA, ...assets]);
      setShowModal(false);
    } catch {
      setError('Failed to register marine asset.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string | number, newStatus: MarineAsset['status']) => {
    try {
      await api.patch(`/procurement/assets/${id}/`, { status: newStatus }).catch(() => {});
      setAssets(assets.map(a => a.id === id ? { ...a, status: newStatus } : a));
    } catch {
      setError('Failed to update asset status.');
    }
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Marine Fleet &amp; Port Cranes Management</h5>
            <p className="text-muted small mb-0">Manage harbour tugboats, barges, quay cranes (STS), reach stackers, and dry-docking schedules.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-ship me-2"></i>Register Marine Asset
          </button>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : (
          <div className="table-responsive border rounded-3">
            <table className="table align-middle mb-0" style={{ fontSize: '0.86rem' }}>
              <thead className="bg-light fw-bold text-muted">
                <tr>
                  <th className="ps-3 py-3 border-0">Asset Tag &amp; Name</th>
                  <th className="py-3 border-0">Type &amp; Reg #</th>
                  <th className="py-3 border-0">Terminal Base</th>
                  <th className="py-3 border-0">Assigned Captain / Operator</th>
                  <th className="py-3 border-0 text-center">Capacity</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="py-3 border-0 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {assets.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No marine equipment recorded.</td></tr>
                ) : assets.map(a => (
                  <tr key={a.id}>
                    <td className="ps-3 py-3">
                      <div className="fw-bold text-dark">{a.name}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>#{a.asset_tag}</div>
                    </td>
                    <td className="py-3">
                      <div className="fw-semibold text-dark">{a.asset_type}</div>
                      <div className="text-muted small font-monospace">{a.registration_number}</div>
                    </td>
                    <td className="py-3 small text-muted">{a.terminal_base}</td>
                    <td className="py-3 small fw-semibold text-dark">{a.operator_name}</td>
                    <td className="py-3 text-center fw-bold small">{a.capacity}</td>
                    <td className="py-3">
                      <span className={`badge ${
                        a.status === 'operational' ? 'bg-success-subtle text-success border border-success-subtle' :
                        a.status === 'under-maintenance' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                        a.status === 'dry-docking' ? 'bg-info-subtle text-info border border-info-subtle' :
                        'bg-secondary-subtle text-secondary'
                      }`} style={{ borderRadius: '6px' }}>
                        {a.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-end pe-4">
                      {a.status === 'operational' ? (
                        <button
                          className="btn btn-sm btn-outline-warning py-1 px-2 fw-semibold"
                          style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                          onClick={() => handleUpdateStatus(a.id, 'under-maintenance')}
                        >
                          <i className="fas fa-tools me-1"></i>Maintenance
                        </button>
                      ) : (
                        <button
                          className="btn btn-sm btn-outline-success py-1 px-2 fw-semibold"
                          style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                          onClick={() => handleUpdateStatus(a.id, 'operational')}
                        >
                          <i className="fas fa-check me-1"></i>Mark Operational
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <ModalPortal>
          <div className="modal show d-block tab-fade">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold"><i className="fas fa-ship text-primary me-2"></i>Register Marine &amp; Port Asset</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleAddAsset}>
                  <div className="modal-body row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Asset Tag Code *</label>
                      <input type="text" required className="form-control bg-light font-monospace" value={form.asset_tag} onChange={e => setForm({...form, asset_tag: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Equipment / Vessel Name *</label>
                      <input type="text" required className="form-control bg-light" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Tugboat MUIN Protector 1" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Asset Type</label>
                      <select className="form-select bg-light" value={form.asset_type} onChange={e => setForm({...form, asset_type: e.target.value as any})}>
                        <option value="Tugboat">Tugboat</option>
                        <option value="Barge">Barge</option>
                        <option value="Quay Crane (STS)">Quay Crane (STS)</option>
                        <option value="RTG Crane">RTG Stacking Crane</option>
                        <option value="Reach Stacker">Container Reach Stacker</option>
                        <option value="Haulage Truck">Heavy Haulage Truck</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Registration Number / Reg Code</label>
                      <input type="text" required className="form-control bg-light font-monospace" value={form.registration_number} onChange={e => setForm({...form, registration_number: e.target.value})} placeholder="e.g. TZ-TB-8812" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Terminal Base Yard</label>
                      <select className="form-select bg-light" value={form.terminal_base} onChange={e => setForm({...form, terminal_base: e.target.value})}>
                        {TERMINAL_YARDS.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Assigned Captain / Lead Operator</label>
                      <input type="text" required className="form-control bg-light" value={form.operator_name} onChange={e => setForm({...form, operator_name: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Lifting / Towing Capacity</label>
                      <input type="text" required className="form-control bg-light" value={form.capacity} onChange={e => setForm({...form, capacity: e.target.value})} placeholder="e.g. 60-Ton Bollard Pull" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Operational Status</label>
                      <select className="form-select bg-light" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                        <option value="operational">Operational</option>
                        <option value="under-maintenance">Under Maintenance</option>
                        <option value="dry-docking">Dry Docking</option>
                      </select>
                    </div>
                    <div className="col-md-12">
                      <label className="form-label small fw-semibold">Last Safety &amp; Drydock Inspection Date</label>
                      <input type="date" required className="form-control bg-light" value={form.last_inspection} onChange={e => setForm({...form, last_inspection: e.target.value})} />
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-0">
                    <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-bold px-4" disabled={saving}>
                      {saving ? 'Saving...' : 'Register Asset'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default LogisticsFleet;

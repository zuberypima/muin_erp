import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { AssetMaintenanceLog } from './assetTypes';
import { SkeletonTable } from '../../components/Skeleton';

const AssetMaintenance: React.FC = () => {
  const [logs, setLogs] = useState<AssetMaintenanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<AssetMaintenanceLog, 'id'>>({
    work_order_no: `WO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    asset_tag: 'AST-10048',
    asset_name: 'Toyota Hilux 4x4 Operational Pickup',
    service_type: 'emergency-repair',
    scheduled_date: new Date().toISOString().split('T')[0],
    vendor_or_technician: 'Dar Auto Mechanical Works',
    cost_tzs: 1850000,
    status: 'in-progress',
    notes: 'Engine clutch replacement and brake pad inspection'
  });

  const fetchLogs = async () => {
    try {
      const res = await api.get('/procurement/assets/').catch(() => ({ data: [] }));
      const mapped: AssetMaintenanceLog[] = (res.data || []).map((l: any, idx: number) => ({
        id: l.id || idx + 1,
        work_order_no: l.work_order_no || `WO-890${idx}`,
        asset_tag: l.asset_tag || `AST-100${idx}`,
        asset_name: l.asset_name || l.name || 'Fixed Asset Item',
        service_type: l.service_type || 'routine',
        scheduled_date: l.scheduled_date || '2026-07-20',
        vendor_or_technician: l.vendor_or_technician || 'Technical Service Dept',
        cost_tzs: l.cost_tzs || 450000,
        status: l.status || 'completed',
        notes: l.notes || 'Routine maintenance'
      }));

      if (mapped.length === 0) {
        const demo: AssetMaintenanceLog[] = [
          { id: 1, work_order_no: 'WO-2026-8810', asset_tag: 'AST-10048', asset_name: 'Toyota Hilux 4x4 Operational Pickup', service_type: 'emergency-repair', scheduled_date: '2026-07-24', vendor_or_technician: 'Dar Auto Mechanical Garage', cost_tzs: 1850000, status: 'in-progress', notes: 'Clutch replacement and hydraulic steering fluid flush' },
          { id: 2, work_order_no: 'WO-2026-8811', asset_tag: 'AST-10046', asset_name: 'Industrial Backup Generator 250kVA', service_type: 'routine', scheduled_date: '2026-07-15', vendor_or_technician: 'Cummins Service Tanzania', cost_tzs: 850000, status: 'completed', notes: 'Quarterly oil filter and fuel injector cleaning' },
          { id: 3, work_order_no: 'WO-2026-8812', asset_tag: 'AST-10047', asset_name: 'High-Performance Rack Server Cluster', service_type: 'calibration', scheduled_date: '2026-07-28', vendor_or_technician: 'Dell Enterprise Support', cost_tzs: 1200000, status: 'scheduled', notes: 'UPS battery bank replacement and firmware upgrade' },
        ];
        setLogs(demo);
      } else {
        setLogs(mapped);
      }
    } catch {
      setError('Failed to fetch maintenance logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/procurement/assets/', form).catch(() => {});
      const newL: AssetMaintenanceLog = {
        id: Date.now(),
        ...form
      };
      setLogs([newL, ...logs]);
      setShowModal(false);
    } catch {
      setError('Failed to log maintenance work order.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string | number, newStatus: AssetMaintenanceLog['status']) => {
    try {
      await api.patch(`/procurement/assets/${id}/`, { status: newStatus }).catch(() => {});
      setLogs(logs.map(l => l.id === id ? { ...l, status: newStatus } : l));
    } catch {
      setError('Failed to update status.');
    }
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Asset Servicing &amp; Maintenance Logs</h5>
            <p className="text-muted small mb-0">Schedule routine maintenance, log repair work orders, and track servicing costs.</p>
          </div>
          <button
            className="btn btn-warning text-dark fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-tools me-2"></i>Schedule Maintenance Order
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
                  <th className="ps-3 py-3 border-0">Work Order #</th>
                  <th className="py-3 border-0">Asset Tag &amp; Name</th>
                  <th className="py-3 border-0">Service Type</th>
                  <th className="py-3 border-0">Vendor / Technician</th>
                  <th className="py-3 border-0 text-end">Cost (TZS)</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="py-3 border-0 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No maintenance logs found.</td></tr>
                ) : logs.map(l => (
                  <tr key={l.id}>
                    <td className="ps-3 py-3 font-monospace fw-bold text-primary">#{l.work_order_no}</td>
                    <td className="py-3">
                      <div className="fw-bold text-dark">{l.asset_name}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>{l.asset_tag}</div>
                    </td>
                    <td className="py-3"><span className="badge bg-light text-dark border">{l.service_type.toUpperCase()}</span></td>
                    <td className="py-3 small fw-semibold text-dark">{l.vendor_or_technician}</td>
                    <td className="py-3 text-end fw-bold text-dark">TZS {l.cost_tzs ? l.cost_tzs.toLocaleString() : 0}</td>
                    <td className="py-3">
                      <span className={`badge ${
                        l.status === 'completed' ? 'bg-success-subtle text-success border border-success-subtle' :
                        l.status === 'in-progress' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                        'bg-info-subtle text-info border border-info-subtle'
                      }`} style={{ borderRadius: '6px' }}>
                        {l.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-end pe-4">
                      {l.status !== 'completed' && (
                        <button
                          className="btn btn-sm btn-outline-success py-1 px-2 fw-semibold"
                          style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                          onClick={() => handleUpdateStatus(l.id, 'completed')}
                        >
                          <i className="fas fa-check me-1"></i>Complete Order
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold"><i className="fas fa-tools text-warning me-2"></i>Schedule Maintenance Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateOrder}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Work Order Reference *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.work_order_no} onChange={e => setForm({...form, work_order_no: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Asset Tag Code *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.asset_tag} onChange={e => setForm({...form, asset_tag: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Asset Name *</label>
                    <input type="text" required className="form-control bg-light" value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Service Type</label>
                    <select className="form-select bg-light" value={form.service_type} onChange={e => setForm({...form, service_type: e.target.value as any})}>
                      <option value="routine">Routine Preventive Servicing</option>
                      <option value="emergency-repair">Emergency Repair</option>
                      <option value="calibration">Technical Calibration</option>
                      <option value="inspection">Safety Audit &amp; Inspection</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Vendor / Service Technician</label>
                    <input type="text" required className="form-control bg-light" value={form.vendor_or_technician} onChange={e => setForm({...form, vendor_or_technician: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Estimated Cost (TZS)</label>
                    <input type="number" min={0} required className="form-control bg-light" value={form.cost_tzs} onChange={e => setForm({...form, cost_tzs: Number(e.target.value)})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Service Notes &amp; Scope of Work</label>
                    <textarea rows={2} className="form-control bg-light" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning text-dark fw-bold px-4" disabled={saving}>
                    {saving ? 'Scheduling...' : 'Schedule Order'}
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

export default AssetMaintenance;

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
      const res = await api.get('/assets/maintenance/').catch(() => ({ data: [] }));
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const mapped: AssetMaintenanceLog[] = dataArr.map((l: any) => ({
        id: l.id,
        work_order_no: l.work_order_no,
        asset_tag: l.asset_tag,
        asset_name: l.asset_name,
        service_type: l.service_type || 'routine',
        scheduled_date: l.scheduled_date || '2026-07-20',
        vendor_or_technician: l.vendor_or_technician || 'Technician',
        cost_tzs: Number(l.cost_tzs) || 0,
        status: l.status || 'scheduled',
        notes: l.notes || ''
      }));

      if (mapped.length === 0) {
        const demo: AssetMaintenanceLog[] = [
          { id: 1, work_order_no: 'WO-2026-8810', asset_tag: 'AST-10048', asset_name: 'Toyota Hilux 4x4 Operational Pickup', service_type: 'emergency-repair', scheduled_date: '2026-07-24', vendor_or_technician: 'Dar Auto Mechanical Garage', cost_tzs: 1850000, status: 'in-progress', notes: 'Clutch replacement and hydraulic steering fluid flush' },
          { id: 2, work_order_no: 'WO-2026-8811', asset_tag: 'AST-10046', asset_name: 'Industrial Backup Generator 250kVA', service_type: 'routine', scheduled_date: '2026-07-15', vendor_or_technician: 'Cummins Service Tanzania', cost_tzs: 850000, status: 'completed', notes: 'Quarterly oil filter and fuel injector cleaning' },
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

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/assets/maintenance/', form);
      const newL: AssetMaintenanceLog = {
        id: res.data.id || Date.now(),
        ...form
      };
      setLogs([newL, ...logs]);
      setShowModal(false);
    } catch {
      setError('Failed to create maintenance work order.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Asset Servicing & Maintenance Logs</h5>
            <p className="text-muted small mb-0">Track work orders, scheduled servicing, vendors, repair costs, and asset health.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-tools me-2"></i>Create Work Order
          </button>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <SkeletonTable rows={4} columns={7} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead className="table-light">
                <tr>
                  <th>Work Order #</th>
                  <th>Asset Tag & Name</th>
                  <th>Service Type</th>
                  <th>Scheduled Date</th>
                  <th>Vendor / Technician</th>
                  <th>Cost (TZS)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td className="fw-bold text-primary">{l.work_order_no}</td>
                    <td>
                      <span className="fw-bold text-dark d-block">{l.asset_name}</span>
                      <small className="text-muted">Tag: {l.asset_tag}</small>
                    </td>
                    <td><span className="badge bg-secondary">{l.service_type}</span></td>
                    <td>{l.scheduled_date}</td>
                    <td>{l.vendor_or_technician}</td>
                    <td className="fw-bold text-dark">TZS {l.cost_tzs.toLocaleString()}</td>
                    <td>
                      <span className={`badge ${l.status === 'completed' ? 'bg-success' : l.status === 'in-progress' ? 'bg-warning' : 'bg-info text-dark'}`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block tab-fade" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Create Maintenance Work Order</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddLog}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Work Order #</label>
                      <input type="text" className="form-control" required value={form.work_order_no} onChange={e => setForm({...form, work_order_no: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Asset Tag</label>
                      <input type="text" className="form-control" required value={form.asset_tag} onChange={e => setForm({...form, asset_tag: e.target.value})} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Asset Name</label>
                      <input type="text" className="form-control" required value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Vendor or Technician</label>
                      <input type="text" className="form-control" required value={form.vendor_or_technician} onChange={e => setForm({...form, vendor_or_technician: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Cost (TZS)</label>
                      <input type="number" className="form-control" required value={form.cost_tzs} onChange={e => setForm({...form, cost_tzs: Number(e.target.value)})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Issue Work Order'}
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

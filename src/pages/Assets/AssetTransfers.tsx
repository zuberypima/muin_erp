import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { CustodyTransfer } from './assetTypes';
import { SkeletonTable } from '../../components/Skeleton';

const AssetTransfers: React.FC = () => {
  const [transfers, setTransfers] = useState<CustodyTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<CustodyTransfer, 'id'>>({
    transfer_ref: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
    asset_tag: 'AST-10047',
    asset_name: 'High-Performance Rack Server Cluster',
    from_custodian: 'John Mtangi (Admin)',
    to_custodian: 'Emanuel Peter (IT Systems Lead)',
    from_department: 'Administration',
    to_department: 'IT Department',
    transfer_date: new Date().toISOString().split('T')[0],
    approved_by: 'Head of Operations',
    status: 'completed'
  });

  const fetchTransfers = async () => {
    try {
      const res = await api.get('/procurement/assets/').catch(() => ({ data: [] }));
      const mapped: CustodyTransfer[] = (res.data || []).map((t: any, idx: number) => ({
        id: t.id || idx + 1,
        transfer_ref: t.transfer_ref || `TRF-900${idx}`,
        asset_tag: t.asset_tag || `AST-100${idx}`,
        asset_name: t.asset_name || 'Fixed Asset Item',
        from_custodian: t.from_custodian || 'Previous Custodian',
        to_custodian: t.to_custodian || 'New Custodian',
        from_department: t.from_department || 'Admin',
        to_department: t.to_department || 'Operations',
        transfer_date: t.transfer_date || '2026-07-15',
        approved_by: t.approved_by || 'Asset Controller',
        status: t.status || 'completed'
      }));

      if (mapped.length === 0) {
        const demo: CustodyTransfer[] = [
          { id: 1, transfer_ref: 'TRF-9001', asset_tag: 'AST-10047', asset_name: 'High-Performance Rack Server Cluster', from_custodian: 'John Mtangi', to_custodian: 'Emanuel Peter', from_department: 'Administration', to_department: 'IT Department', transfer_date: '2026-07-22', approved_by: 'Head of Operations', status: 'completed' },
          { id: 2, transfer_ref: 'TRF-9002', asset_tag: 'AST-10045', asset_name: 'Scania Heavy Transport Truck 15T', from_custodian: 'Logistics Fleet Yard', to_custodian: 'Rashid Bakari', from_department: 'Logistics', to_department: 'Marine Shipping Ops', transfer_date: '2026-07-24', approved_by: 'Port Superintendent', status: 'completed' },
          { id: 3, transfer_ref: 'TRF-9003', asset_tag: 'AST-10046', asset_name: 'Industrial Backup Generator 250kVA', from_custodian: 'Store Keeper A', to_custodian: 'Bandari Depot Manager', from_department: 'Store Depot', to_department: 'Bandari Port Yard', transfer_date: '2026-07-25', approved_by: 'Asset Manager', status: 'pending' },
        ];
        setTransfers(demo);
      } else {
        setTransfers(mapped);
      }
    } catch {
      setError('Failed to fetch custody transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/procurement/assets/', form).catch(() => {});
      const newT: CustodyTransfer = {
        id: Date.now(),
        ...form
      };
      setTransfers([newT, ...transfers]);
      setShowModal(false);
    } catch {
      setError('Failed to record custody handover.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Asset Custody &amp; Handover Logs</h5>
            <p className="text-muted small mb-0">Record physical asset custody transfers between employees, custodians, and departments.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-exchange-alt me-2"></i>Issue Custody Transfer
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
                  <th className="ps-3 py-3 border-0">Transfer Ref</th>
                  <th className="py-3 border-0">Asset Tag &amp; Name</th>
                  <th className="py-3 border-0">Transfer From → To</th>
                  <th className="py-3 border-0">Department Change</th>
                  <th className="py-3 border-0">Approved By</th>
                  <th className="py-3 border-0">Date</th>
                  <th className="py-3 border-0 text-end pe-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No custody transfer logs found.</td></tr>
                ) : transfers.map(t => (
                  <tr key={t.id}>
                    <td className="ps-3 py-3 font-monospace fw-bold text-primary">#{t.transfer_ref}</td>
                    <td className="py-3">
                      <div className="fw-bold text-dark">{t.asset_name}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>{t.asset_tag}</div>
                    </td>
                    <td className="py-3 small">
                      <div className="text-muted">{t.from_custodian}</div>
                      <div className="fw-semibold text-dark">→ {t.to_custodian}</div>
                    </td>
                    <td className="py-3 small">
                      <div className="text-muted">{t.from_department}</div>
                      <div className="fw-semibold text-dark">→ {t.to_department}</div>
                    </td>
                    <td className="py-3 small fw-semibold text-dark">{t.approved_by}</td>
                    <td className="py-3 small text-muted">{t.transfer_date}</td>
                    <td className="py-3 text-end pe-4">
                      <span className={`badge ${
                        t.status === 'completed' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'
                      }`} style={{ borderRadius: '6px' }}>
                        {t.status.toUpperCase()}
                      </span>
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
                <h5 className="modal-title fw-bold"><i className="fas fa-exchange-alt text-primary me-2"></i>Issue Custody Transfer Note</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateTransfer}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Transfer Reference Code *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.transfer_ref} onChange={e => setForm({...form, transfer_ref: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Asset Tag Code *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.asset_tag} onChange={e => setForm({...form, asset_tag: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Asset Name *</label>
                    <input type="text" required className="form-control bg-light" value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Current Custodian (From)</label>
                    <input type="text" required className="form-control bg-light" value={form.from_custodian} onChange={e => setForm({...form, from_custodian: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">New Custodian (To)</label>
                    <input type="text" required className="form-control bg-light" value={form.to_custodian} onChange={e => setForm({...form, to_custodian: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Current Department (From)</label>
                    <input type="text" required className="form-control bg-light" value={form.from_department} onChange={e => setForm({...form, from_department: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Receiving Department (To)</label>
                    <input type="text" required className="form-control bg-light" value={form.to_department} onChange={e => setForm({...form, to_department: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Approved By (Manager)</label>
                    <input type="text" required className="form-control bg-light" value={form.approved_by} onChange={e => setForm({...form, approved_by: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Transfer Date</label>
                    <input type="date" required className="form-control bg-light" value={form.transfer_date} onChange={e => setForm({...form, transfer_date: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary text-white fw-bold px-4" disabled={saving}>
                    {saving ? 'Issuing...' : 'Issue Transfer Note'}
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

export default AssetTransfers;

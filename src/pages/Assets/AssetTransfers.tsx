import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
      const res = await api.get('/assets/transfers/').catch(() => ({ data: [] }));
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const mapped: CustodyTransfer[] = dataArr.map((t: any) => ({
        id: t.id,
        transfer_ref: t.transfer_ref,
        asset_tag: t.asset_tag,
        asset_name: t.asset_name,
        from_custodian: t.from_custodian || 'Previous Custodian',
        to_custodian: t.to_custodian || 'New Custodian',
        from_department: t.from_department || 'Admin',
        to_department: t.to_department || 'Operations',
        transfer_date: t.transfer_date || '2026-07-15',
        approved_by: t.approved_by || 'Asset Controller',
        status: t.status || 'completed'
      }));

      setTransfers(mapped);
    } catch {
      setError('Failed to fetch custody transfers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
  }, []);

  const handleAddTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/assets/transfers/', form);
      const newT: CustodyTransfer = {
        id: res.data.id || Date.now(),
        ...form
      };
      setTransfers([newT, ...transfers]);
      setShowModal(false);
    } catch {
      setError('Failed to process custody transfer.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Custody Handover & Inter-Department Transfers</h5>
            <p className="text-muted small mb-0">Record physical asset handovers, changing custodians, and approval signatures.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-exchange-alt me-2"></i>Initiate Custody Transfer
          </button>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <SkeletonTable rows={4} cols={7} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead className="table-light">
                <tr>
                  <th>Transfer Ref #</th>
                  <th>Asset Tag & Name</th>
                  <th>From Custodian</th>
                  <th>To Custodian</th>
                  <th>Department Route</th>
                  <th>Date & Approver</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.map(t => (
                  <tr key={t.id}>
                    <td className="fw-bold text-primary">{t.transfer_ref}</td>
                    <td>
                      <span className="fw-bold text-dark d-block">{t.asset_name}</span>
                      <small className="text-muted">Tag: {t.asset_tag}</small>
                    </td>
                    <td>{t.from_custodian}</td>
                    <td className="fw-semibold text-success">{t.to_custodian}</td>
                    <td>
                      <small className="d-block text-muted">{t.from_department}</small>
                      <small className="d-block text-primary fw-semibold"><i className="fas fa-arrow-right me-1"></i>{t.to_department}</small>
                    </td>
                    <td>
                      <span className="d-block fw-semibold">{t.transfer_date}</span>
                      <small className="text-muted">By: {t.approved_by}</small>
                    </td>
                    <td>
                      <span className={`badge ${t.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999
          }}
        >
          <div className="modal-dialog modal-lg w-100" style={{ maxWidth: '800px', margin: '0 1rem' }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title fw-bold">Initiate Asset Custody Transfer</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddTransfer}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Transfer Ref #</label>
                      <input type="text" className="form-control" required value={form.transfer_ref} onChange={e => setForm({...form, transfer_ref: e.target.value})} />
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
                      <label className="form-label fw-bold">From Custodian</label>
                      <input type="text" className="form-control" required value={form.from_custodian} onChange={e => setForm({...form, from_custodian: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">To Custodian</label>
                      <input type="text" className="form-control" required value={form.to_custodian} onChange={e => setForm({...form, to_custodian: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Processing...' : 'Complete Transfer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AssetTransfers;

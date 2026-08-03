import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosConfig';
import { DocumentRecord } from './assetTypes';
import { SkeletonTable } from '../../components/Skeleton';

const AssetRecords: React.FC = () => {
  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<DocumentRecord, 'id'>>({
    record_code: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
    title: 'Scania Heavy Haulier Title Deed & Registration Logbook',
    record_type: 'Vehicle Logbook',
    related_asset_tag: 'AST-10045',
    physical_shelf_location: 'Archive Vault A - Shelf 04 / Box 12',
    custodian: 'Head Records Officer',
    issue_date: '2024-03-15',
    expiry_date: '2027-03-15',
    status: 'active'
  });

  const fetchRecords = async () => {
    try {
      const res = await api.get('/assets/document-records/').catch(() => ({ data: [] }));
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const mapped: DocumentRecord[] = dataArr.map((r: any) => ({
        id: r.id,
        record_code: r.record_code,
        title: r.title,
        record_type: r.record_type || 'Vehicle Logbook',
        related_asset_tag: r.related_asset_tag || '',
        physical_shelf_location: r.physical_shelf_location || 'Archive Vault',
        custodian: r.custodian || 'Custodian',
        issue_date: r.issue_date || '2024-01-01',
        expiry_date: r.expiry_date || undefined,
        status: r.status || 'active'
      }));

      setRecords(mapped);
    } catch {
      setError('Failed to fetch document records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/assets/document-records/', form);
      const newR: DocumentRecord = {
        id: res.data.id || Date.now(),
        ...form
      };
      setRecords([newR, ...records]);
      setShowModal(false);
    } catch {
      setError('Failed to archive document record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Physical Archival Vault & Legal Documents</h5>
            <p className="text-muted small mb-0">Track title deeds, logbooks, warranties, physical shelf box codes, and custodians.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-file-archive me-2"></i>Archive New Document
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
                  <th>Record Code</th>
                  <th>Title & Document Type</th>
                  <th>Related Asset</th>
                  <th>Physical Vault / Shelf Location</th>
                  <th>Custodian</th>
                  <th>Issue / Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id}>
                    <td className="fw-bold text-primary">{r.record_code}</td>
                    <td>
                      <span className="fw-bold text-dark d-block">{r.title}</span>
                      <span className="badge bg-secondary">{r.record_type}</span>
                    </td>
                    <td>{r.related_asset_tag || 'N/A'}</td>
                    <td className="fw-semibold text-dark">{r.physical_shelf_location}</td>
                    <td>{r.custodian}</td>
                    <td>
                      <small className="d-block text-dark fw-semibold">Issued: {r.issue_date}</small>
                      {r.expiry_date && <small className="d-block text-muted">Expires: {r.expiry_date}</small>}
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                        {r.status}
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
                <h5 className="modal-title fw-bold">Archive Document in Physical Vault</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddRecord}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Record Code</label>
                      <input type="text" className="form-control" required value={form.record_code} onChange={e => setForm({...form, record_code: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Record Type</label>
                      <input type="text" className="form-control" required value={form.record_type} onChange={e => setForm({...form, record_type: e.target.value as any})} />
                    </div>
                    <div className="col-md-12">
                      <label className="form-label fw-bold">Document Title</label>
                      <input type="text" className="form-control" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Physical Shelf Location</label>
                      <input type="text" className="form-control" required value={form.physical_shelf_location} onChange={e => setForm({...form, physical_shelf_location: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Custodian</label>
                      <input type="text" className="form-control" required value={form.custodian} onChange={e => setForm({...form, custodian: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Archiving...' : 'Archive Record'}
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

export default AssetRecords;

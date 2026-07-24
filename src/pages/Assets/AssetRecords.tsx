import React, { useState, useEffect } from 'react';
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
      const res = await api.get('/procurement/assets/').catch(() => ({ data: [] }));
      const mapped: DocumentRecord[] = (res.data || []).map((r: any, idx: number) => ({
        id: r.id || idx + 1,
        record_code: r.record_code || `REC-2026-0${idx + 1}`,
        title: r.title || r.name || 'Official Document Record',
        record_type: r.record_type || 'Vehicle Logbook',
        related_asset_tag: r.related_asset_tag || `AST-100${idx}`,
        physical_shelf_location: r.physical_shelf_location || 'Archive Cabinet 01',
        custodian: r.custodian || 'Records Officer',
        issue_date: r.issue_date || '2024-01-01',
        expiry_date: r.expiry_date || '2027-01-01',
        status: r.status || 'active'
      }));

      if (mapped.length === 0) {
        const demo: DocumentRecord[] = [
          { id: 1, record_code: 'REC-2026-101', title: 'Port Depot Property Title Deed & Land Survey Certificate', record_type: 'Title Deed', related_asset_tag: 'AST-10040', physical_shelf_location: 'Vault Room 01 / Safe Box A', custodian: 'Chief Legal Counsel', issue_date: '2020-05-10', expiry_date: '2050-05-10', status: 'active' },
          { id: 2, record_code: 'REC-2026-102', title: 'Scania 15T Haulage Truck Original Logbook & Motor Insurance', record_type: 'Vehicle Logbook', related_asset_tag: 'AST-10045', physical_shelf_location: 'Archive Cabinet B / Folder 14', custodian: 'Head Records Officer', issue_date: '2024-03-15', expiry_date: '2027-03-15', status: 'active' },
          { id: 3, record_code: 'REC-2026-103', title: 'Cummins Generator 250kVA Annual Warranty & Service Contract', record_type: 'Warranty Contract', related_asset_tag: 'AST-10046', physical_shelf_location: 'Archive Cabinet C / Folder 02', custodian: 'Asset Controller', issue_date: '2023-08-10', expiry_date: '2026-08-10', status: 'active' },
        ];
        setRecords(demo);
      } else {
        setRecords(mapped);
      }
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
      await api.post('/procurement/assets/', form).catch(() => {});
      const newR: DocumentRecord = {
        id: Date.now(),
        ...form
      };
      setRecords([newR, ...records]);
      setShowModal(false);
    } catch {
      setError('Failed to log document record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Document Records &amp; Physical Archival Vault</h5>
            <p className="text-muted small mb-0">Catalog land deeds, vehicle logbooks, insurance policies, and equipment warranty files.</p>
          </div>
          <button
            className="btn btn-info text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-folder-plus me-2"></i>Archive Document Record
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
                  <th className="ps-3 py-3 border-0">Record Code &amp; Title</th>
                  <th className="py-3 border-0">Document Type</th>
                  <th className="py-3 border-0">Related Asset Tag</th>
                  <th className="py-3 border-0">Physical Shelf Location</th>
                  <th className="py-3 border-0">Custodian</th>
                  <th className="py-3 border-0 text-end pe-4">Expiry Date</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No archived records found.</td></tr>
                ) : records.map(r => (
                  <tr key={r.id}>
                    <td className="ps-3 py-3">
                      <div className="fw-bold text-dark">{r.title}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>{r.record_code}</div>
                    </td>
                    <td className="py-3"><span className="badge bg-light text-dark border">{r.record_type}</span></td>
                    <td className="py-3 font-monospace text-primary fw-bold small">{r.related_asset_tag || 'N/A'}</td>
                    <td className="py-3 small text-muted"><i className="fas fa-archive me-1 text-secondary"></i>{r.physical_shelf_location}</td>
                    <td className="py-3 small fw-semibold text-dark">{r.custodian}</td>
                    <td className="py-3 text-end pe-4 small fw-semibold text-dark">{r.expiry_date || 'Permanent'}</td>
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
                <h5 className="modal-title fw-bold"><i className="fas fa-folder-open text-info me-2"></i>Archive Document Record</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddRecord}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Record Code *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.record_code} onChange={e => setForm({...form, record_code: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Document Title *</label>
                    <input type="text" required className="form-control bg-light" value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g. Land Survey Deed" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Record Type</label>
                    <select className="form-select bg-light" value={form.record_type} onChange={e => setForm({...form, record_type: e.target.value as any})}>
                      <option value="Title Deed">Title Deed</option>
                      <option value="Vehicle Logbook">Vehicle Logbook</option>
                      <option value="Warranty Contract">Warranty Contract</option>
                      <option value="Audit Certificate">Audit Certificate</option>
                      <option value="Insurance Policy">Insurance Policy</option>
                      <option value="Compliance Permit">Compliance Permit</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Related Asset Tag Code</label>
                    <input type="text" className="form-control bg-light font-monospace" value={form.related_asset_tag} onChange={e => setForm({...form, related_asset_tag: e.target.value})} placeholder="e.g. AST-10045" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Physical Archive Shelf Location *</label>
                    <input type="text" required className="form-control bg-light" value={form.physical_shelf_location} onChange={e => setForm({...form, physical_shelf_location: e.target.value})} placeholder="e.g. Vault B / Shelf 02" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Record Custodian Officer</label>
                    <input type="text" required className="form-control bg-light" value={form.custodian} onChange={e => setForm({...form, custodian: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Issue / Contract Date</label>
                    <input type="date" required className="form-control bg-light" value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Expiry Date (Leave blank if permanent)</label>
                    <input type="date" className="form-control bg-light" value={form.expiry_date} onChange={e => setForm({...form, expiry_date: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-info text-white fw-bold px-4" disabled={saving}>
                    {saving ? 'Archiving...' : 'Archive Record'}
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

export default AssetRecords;

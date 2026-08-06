import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import api from '../../api/axiosConfig';
import { DocumentRecord } from './assetTypes';
import { SkeletonTable } from '../../components/Skeleton';
import { useAuth } from '../../context/AuthContext';

const AssetRecords: React.FC = () => {
  const { user } = useAuth();
  const custodianName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username : '';

  const [records, setRecords] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editId, setEditId] = useState<string | number | null>(null);

  const defaultForm: Omit<DocumentRecord, 'id'> = {
    record_code: '',
    title: '',
    record_type: 'Vehicle Logbook',
    related_asset_tag: '',
    physical_shelf_location: '',
    custodian: custodianName,
    issue_date: '',
    expiry_date: '',
    status: 'active'
  };

  const [form, setForm] = useState<Omit<DocumentRecord, 'id'>>(defaultForm);

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

  const handleAddNewClick = () => {
    setForm({
      ...defaultForm,
      record_code: `REC-2026-${Math.floor(100 + Math.random() * 900)}`,
      custodian: custodianName
    });
    setEditId(null);
    setShowModal(true);
  };

  const handleEditClick = (record: DocumentRecord) => {
    setForm({
      record_code: record.record_code,
      title: record.title,
      record_type: record.record_type || 'Vehicle Logbook',
      related_asset_tag: record.related_asset_tag || '',
      physical_shelf_location: record.physical_shelf_location || '',
      custodian: record.custodian || '',
      issue_date: record.issue_date || '',
      expiry_date: record.expiry_date || '',
      status: record.status || 'active'
    });
    setEditId(record.id);
    setShowModal(true);
  };

  const handleAddOrEditRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...form,
      expiry_date: form.expiry_date ? form.expiry_date : null
    };

    try {
      if (editId) {
        const res = await api.put(`/assets/document-records/${editId}/`, payload);
        setRecords(records.map(r => r.id === editId ? { ...r, ...res.data } : r));
      } else {
        const res = await api.post('/assets/document-records/', payload);
        const newR: DocumentRecord = {
          id: res.data.id || Date.now(),
          ...form,
          expiry_date: payload.expiry_date as string | undefined
        };
        setRecords([newR, ...records]);
      }
      setShowModal(false);
    } catch {
      setError(`Failed to ${editId ? 'update' : 'archive'} document record.`);
    } finally {
      setSaving(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.record_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.related_asset_tag || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.custodian.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Physical Archival Vault & Legal Documents</h5>
            <p className="text-muted small mb-0">Track title deeds, logbooks, warranties, physical shelf box codes, and custodians.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0"><i className="fas fa-search text-muted"></i></span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Search records..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              className="btn btn-primary text-white fw-bold px-3 shadow-sm text-nowrap"
              onClick={handleAddNewClick}
              style={{ borderRadius: '8px' }}
            >
              <i className="fas fa-file-archive me-2"></i>Archive New
            </button>
          </div>
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
                  <th>Physical Vault / Shelf Location</th>
                  <th>Custodian</th>
                  <th>Issue / Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length > 0 ? (
                  filteredRecords.map(r => (
                    <tr key={r.id}>
                    <td className="fw-bold text-primary">{r.record_code}</td>
                    <td>
                      <span className="fw-bold text-dark d-block">{r.title}</span>
                      <span className="badge bg-secondary">{r.record_type}</span>
                    </td>
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
                    <td>
                      <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditClick(r)}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-4">
                    No documents found matching your search.
                  </td>
                </tr>
              )}
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
                <h5 className="modal-title fw-bold">{editId ? 'Edit Document Record' : 'Archive Document in Physical Vault'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddOrEditRecord}>
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
                      <input type="text" className="form-control bg-light" readOnly required value={form.custodian} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Related Asset Tag (Optional)</label>
                      <input type="text" className="form-control" placeholder="e.g. AST-10045" value={form.related_asset_tag || ''} onChange={e => setForm({...form, related_asset_tag: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Issue Date</label>
                      <input type="date" className="form-control" required value={form.issue_date} onChange={e => setForm({...form, issue_date: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Expiry Date (Optional)</label>
                      <input type="date" className="form-control" value={form.expiry_date || ''} onChange={e => setForm({...form, expiry_date: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? (editId ? 'Saving...' : 'Archiving...') : (editId ? 'Save Changes' : 'Archive Record')}
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

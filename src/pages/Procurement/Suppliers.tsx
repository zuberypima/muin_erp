import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Supplier, SupplierStatus } from './procurementTypes';
import { SkeletonTable } from '../../components/Skeleton';
import ModalPortal from '../../components/ModalPortal';

const PAYMENT_TERMS_OPTIONS = [
  'Net 30',
  'Net 60',
  'Net 15',
  'Cash On Delivery (COD)',
  '50% Advance, 50% On Delivery',
  '100% Advance Payment'
];

const Suppliers: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<Supplier, 'id' | 'created_at'>>({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    payment_terms: 'Net 30',
    status: 'active',
    notes: ''
  });

  const [editForm, setEditForm] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/procurement/suppliers/');
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setSuppliers(dataArr);
    } catch (err: any) {
      console.error('API fetch error for suppliers:', err);
      setError('Could not connect to backend server. Please refresh or check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleRegisterSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await api.post('/procurement/suppliers/', form);
      setSuppliers([res.data, ...suppliers]);
      setShowAddModal(false);
      // Reset form
      setForm({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        tax_number: '',
        payment_terms: 'Net 30',
        status: 'active',
        notes: ''
      });
    } catch (err: any) {
      console.error('API supplier registration error:', err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to register supplier on backend server.';
      setError(`API Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateSupplierDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    setSaving(true);
    setError('');

    try {
      const res = await api.patch(`/procurement/suppliers/${editForm.id}/`, editForm);
      const updatedSupplier = res.data;
      setSuppliers(suppliers.map(s => s.id === updatedSupplier.id ? updatedSupplier : s));
      setSelectedSupplier(updatedSupplier);
      setIsEditing(false);
    } catch (err: any) {
      console.error('API supplier update error:', err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to update supplier details on backend server.';
      setError(`API Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: SupplierStatus) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, status: newStatus } : s));
    if (selectedSupplier && selectedSupplier.id === id) {
      setSelectedSupplier({ ...selectedSupplier, status: newStatus });
    }
    if (editForm && editForm.id === id) {
      setEditForm({ ...editForm, status: newStatus });
    }

    try {
      await api.patch(`/procurement/suppliers/${id}/`, { status: newStatus });
    } catch (err: any) {
      console.error('API supplier status update error:', err);
    }
  };

  const handleDeleteSupplier = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this supplier vendor record?')) return;
    setDeleting(true);
    try {
      await api.delete(`/procurement/suppliers/${id}/`);
      setSuppliers(suppliers.filter(s => s.id !== id));
      setSelectedSupplier(null);
      setIsEditing(false);
    } catch (err: any) {
      console.error('API supplier delete error:', err);
      alert('Failed to delete supplier from backend database.');
    } finally {
      setDeleting(false);
    }
  };

  const openViewProfile = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setEditForm(supplier);
    setIsEditing(false);
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
                          s.contact_person.toLowerCase().includes(search.toLowerCase()) ||
                          s.email.toLowerCase().includes(search.toLowerCase()) ||
                          s.phone.toLowerCase().includes(search.toLowerCase()) ||
                          s.tax_number.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter(s => s.status === 'active').length;
  const inactiveSuppliers = suppliers.filter(s => s.status === 'inactive' || s.status === 'blacklisted').length;

  return (
    <div className="container-fluid p-0 fade-in">
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Total Suppliers</p>
                <h3 className="fw-bold text-dark mb-0">{totalSuppliers} <span className="fs-6 fw-normal text-muted">Vendors</span></h3>
                <small className="text-primary fw-semibold">Live Backend Database Records</small>
              </div>
              <div className="bg-primary-subtle text-primary rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-building fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Active Suppliers</p>
                <h3 className="fw-bold text-dark mb-0">{activeSuppliers} <span className="fs-6 fw-normal text-muted">Active</span></h3>
                <small className="text-success fw-semibold">Approved for PO & Invoicing</small>
              </div>
              <div className="bg-success-subtle text-success rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-check-circle fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Inactive / Blacklisted</p>
                <h3 className="fw-bold text-dark mb-0">{inactiveSuppliers} <span className="fs-6 fw-normal text-muted">Vendors</span></h3>
                <small className="text-warning fw-semibold">On Hold or Suspended</small>
              </div>
              <div className="bg-warning-subtle text-warning rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                <i className="fas fa-user-slash fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        {/* Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1"><i className="fas fa-store text-primary me-2"></i>Supplier & Vendor Registration</h5>
            <p className="text-muted small mb-0">Push and pull real corporate vendors, tax identification numbers (TIN), payment terms, and contact profiles.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={fetchSuppliers} title="Refresh Supplier Directory">
              <i className="fas fa-sync-alt me-1"></i>Refresh API Data
            </button>
            <button
              className="btn btn-primary text-white fw-bold px-3 shadow-sm"
              onClick={() => setShowAddModal(true)}
              style={{ borderRadius: '8px' }}
            >
              <i className="fas fa-plus-circle me-2"></i>Register New Supplier
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="row g-2 mb-3">
          <div className="col-md-8">
            <input
              type="text" className="form-control"
              placeholder="Search Supplier Name, Contact Person, Email, Phone, or TIN..."
              value={search} onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">All Vendor Statuses</option>
              <option value="active">Active Vendors</option>
              <option value="inactive">Inactive Vendors</option>
              <option value="blacklisted">Blacklisted Vendors</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        {/* Table */}
        {loading ? (
          <SkeletonTable rows={5} cols={7} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead className="table-light">
                <tr>
                  <th>Supplier / Vendor Name</th>
                  <th>Contact Person</th>
                  <th>Email & Phone</th>
                  <th>Tax TIN / VRN</th>
                  <th>Payment Terms</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      No suppliers registered matching search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredSuppliers.map(s => (
                    <tr key={s.id} className="clickable-row" onClick={() => openViewProfile(s)}>
                      <td className="fw-bold text-dark">
                        <div>{s.name}</div>
                        <small className="text-muted font-monospace">{s.address || 'Address Not Set'}</small>
                      </td>
                      <td className="fw-semibold text-primary">{s.contact_person || 'N/A'}</td>
                      <td>
                        <div className="fw-semibold text-dark">{s.email || 'N/A'}</div>
                        <small className="text-muted">{s.phone || 'N/A'}</small>
                      </td>
                      <td className="font-monospace fw-semibold">{s.tax_number || 'TIN Not Set'}</td>
                      <td><span className="badge bg-secondary">{s.payment_terms || 'Net 30'}</span></td>
                      <td>
                        <span className={`badge ${
                          s.status === 'active' ? 'bg-success-subtle text-success border border-success-subtle' :
                          s.status === 'inactive' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                          'bg-danger-subtle text-danger border border-danger-subtle'
                        } px-2.5 py-1.5 fw-bold`} style={{ borderRadius: '6px' }}>
                          {s.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-end pe-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-sm btn-outline-primary px-2.5 py-1 fw-semibold me-1"
                          onClick={() => openViewProfile(s)}
                          style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                        >
                          <i className="fas fa-eye me-1"></i>View Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Supplier Modal */}
      {showAddModal && (
        <ModalPortal>
          <div className="modal show d-block tab-fade">
            <div className="modal-dialog modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold"><i className="fas fa-building me-2"></i>Register New Supplier / Vendor</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddModal(false)}></button>
                </div>
                <form onSubmit={handleRegisterSupplier}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Supplier / Company Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="e.g. Maersk Logistics East Africa Ltd"
                          value={form.name}
                          onChange={e => setForm({...form, name: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Contact Person Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Jacob Nielsen"
                          value={form.contact_person}
                          onChange={e => setForm({...form, contact_person: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="e.g. j.nielsen@maersk.com"
                          value={form.email}
                          onChange={e => setForm({...form, email: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Phone Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. +255 22 211 4900"
                          value={form.phone}
                          onChange={e => setForm({...form, phone: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Tax Identification Number (TIN / VRN)</label>
                        <input
                          type="text"
                          className="form-control font-monospace"
                          placeholder="e.g. TIN-109823471"
                          value={form.tax_number}
                          onChange={e => setForm({...form, tax_number: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Agreed Payment Terms</label>
                        <input
                          type="text"
                          className="form-control"
                          list="payment-terms-list"
                          placeholder="e.g. Net 30 or Cash On Delivery"
                          value={form.payment_terms}
                          onChange={e => setForm({...form, payment_terms: e.target.value})}
                        />
                        <datalist id="payment-terms-list">
                          {PAYMENT_TERMS_OPTIONS.map(opt => <option key={opt} value={opt} />)}
                        </datalist>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label fw-bold">Physical Office / Warehouse Address</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Plot 14, Bandari Road, Kurasini, Dar es Salaam"
                          value={form.address}
                          onChange={e => setForm({...form, address: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Initial Status</label>
                        <select
                          className="form-select"
                          value={form.status}
                          onChange={e => setForm({...form, status: e.target.value as SupplierStatus})}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="blacklisted">Blacklisted</option>
                        </select>
                      </div>
                      <div className="col-md-12">
                        <label className="form-label fw-bold">Vendor Notes & Capabilities</label>
                        <textarea
                          className="form-control"
                          rows={2}
                          placeholder="Notes regarding vendor products, certifications, or agreements..."
                          value={form.notes}
                          onChange={e => setForm({...form, notes: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary fw-bold px-4" disabled={saving}>
                      {saving ? 'Registering...' : 'Register Supplier (Save to API)'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Supplier Profile Detail & Status Modal */}
      {selectedSupplier && (
        <ModalPortal>
          <div className="modal show d-block tab-fade">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                <div className="modal-header bg-light border-0 px-4 py-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-primary text-white px-3 py-1.5 fw-bold" style={{ fontSize: '0.9rem', borderRadius: '8px' }}>
                      <i className="fas fa-building me-1.5"></i>{selectedSupplier.name}
                    </span>
                    <span className={`badge ${
                      selectedSupplier.status === 'active' ? 'bg-success' : 'bg-warning text-dark'
                    } px-2.5 py-1 fw-bold`} style={{ fontSize: '0.82rem', borderRadius: '6px' }}>
                      {selectedSupplier.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-2 ms-auto">
                    {!isEditing ? (
                      <button
                        className="btn btn-sm btn-outline-primary fw-bold px-3"
                        onClick={() => setIsEditing(true)}
                        style={{ borderRadius: '8px' }}
                      >
                        <i className="fas fa-edit me-1.5"></i>Edit Details
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary fw-bold px-3"
                        onClick={() => setIsEditing(false)}
                        style={{ borderRadius: '8px' }}
                      >
                        <i className="fas fa-times me-1.5"></i>Cancel Edit
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-outline-danger px-2.5"
                      onClick={() => handleDeleteSupplier(selectedSupplier.id)}
                      disabled={deleting}
                      title="Delete Supplier"
                      style={{ borderRadius: '8px' }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                    <button type="button" className="btn-close ms-1" onClick={() => setSelectedSupplier(null)}></button>
                  </div>
                </div>

                {!isEditing ? (
                  <div className="modal-body px-4 py-4">
                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <div className="text-muted small fw-semibold">Contact Person</div>
                          <div className="fw-bold text-dark fs-6 mt-1">{selectedSupplier.contact_person || 'Not Provided'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <div className="text-muted small fw-semibold">Tax Identification Number</div>
                          <div className="fw-bold font-monospace text-primary fs-6 mt-1">{selectedSupplier.tax_number || 'TIN Not Set'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <div className="text-muted small fw-semibold">Email & Phone</div>
                          <div className="fw-semibold text-dark mt-1">{selectedSupplier.email || 'N/A'}</div>
                          <div className="small text-muted">{selectedSupplier.phone || 'N/A'}</div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="p-3 bg-light rounded-3 border">
                          <div className="text-muted small fw-semibold">Payment Terms</div>
                          <div className="fw-bold text-dark mt-1">{selectedSupplier.payment_terms || 'Net 30'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h6 className="fw-bold text-dark mb-2">Physical Office & Facility Address</h6>
                      <div className="p-3 bg-light rounded-3 border text-dark">
                        {selectedSupplier.address || 'No physical address recorded.'}
                      </div>
                    </div>

                    {selectedSupplier.notes && (
                      <div className="mb-4">
                        <h6 className="fw-bold text-dark mb-2">Vendor Notes</h6>
                        <div className="p-3 bg-light rounded-3 border text-muted small">
                          {selectedSupplier.notes}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <span className="small text-muted">Change Vendor Status:</span>
                      <div className="btn-group">
                        <button
                          className={`btn btn-sm ${selectedSupplier.status === 'active' ? 'btn-success' : 'btn-outline-success'} fw-bold`}
                          onClick={() => handleUpdateStatus(selectedSupplier.id, 'active')}
                        >
                          Active
                        </button>
                        <button
                          className={`btn btn-sm ${selectedSupplier.status === 'inactive' ? 'btn-warning' : 'btn-outline-warning'} fw-bold`}
                          onClick={() => handleUpdateStatus(selectedSupplier.id, 'inactive')}
                        >
                          Inactive
                        </button>
                        <button
                          className={`btn btn-sm ${selectedSupplier.status === 'blacklisted' ? 'btn-danger' : 'btn-outline-danger'} fw-bold`}
                          onClick={() => handleUpdateStatus(selectedSupplier.id, 'blacklisted')}
                        >
                          Blacklist
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateSupplierDetails}>
                    <div className="modal-body px-4 py-4">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Supplier / Company Name *</label>
                          <input
                            type="text"
                            className="form-control"
                            required
                            value={editForm?.name || ''}
                            onChange={e => editForm && setEditForm({...editForm, name: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Contact Person Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm?.contact_person || ''}
                            onChange={e => editForm && setEditForm({...editForm, contact_person: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Email Address</label>
                          <input
                            type="email"
                            className="form-control"
                            value={editForm?.email || ''}
                            onChange={e => editForm && setEditForm({...editForm, email: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Phone Number</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm?.phone || ''}
                            onChange={e => editForm && setEditForm({...editForm, phone: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Tax Identification Number (TIN / VRN)</label>
                          <input
                            type="text"
                            className="form-control font-monospace"
                            value={editForm?.tax_number || ''}
                            onChange={e => editForm && setEditForm({...editForm, tax_number: e.target.value})}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-bold">Payment Terms</label>
                          <input
                            type="text"
                            className="form-control"
                            list="edit-payment-terms-list"
                            value={editForm?.payment_terms || ''}
                            onChange={e => editForm && setEditForm({...editForm, payment_terms: e.target.value})}
                          />
                          <datalist id="edit-payment-terms-list">
                            {PAYMENT_TERMS_OPTIONS.map(opt => <option key={opt} value={opt} />)}
                          </datalist>
                        </div>
                        <div className="col-md-12">
                          <label className="form-label fw-bold">Physical Address</label>
                          <input
                            type="text"
                            className="form-control"
                            value={editForm?.address || ''}
                            onChange={e => editForm && setEditForm({...editForm, address: e.target.value})}
                          />
                        </div>
                        <div className="col-md-12">
                          <label className="form-label fw-bold">Notes</label>
                          <textarea
                            className="form-control"
                            rows={2}
                            value={editForm?.notes || ''}
                            onChange={e => editForm && setEditForm({...editForm, notes: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="modal-footer bg-light px-4 py-3">
                      <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
                      <button type="submit" className="btn btn-primary fw-bold px-4" disabled={saving}>
                        {saving ? 'Saving Changes...' : 'Save Changes to Backend API'}
                      </button>
                    </div>
                  </form>
                )}

                {!isEditing && (
                  <div className="modal-footer border-0 bg-light px-4 py-3">
                    <button className="btn btn-secondary px-4 fw-semibold" onClick={() => setSelectedSupplier(null)} style={{ borderRadius: '8px' }}>
                      Close Profile
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default Suppliers;

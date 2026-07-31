import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ContainerDispatch } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';
import ModalPortal from '../../components/ModalPortal';
import DispatchDetailModal from './DispatchDetailModal';
import '../Tasks/Tasks.css';


const LogisticsDispatches: React.FC = () => {
  const [dispatches, setDispatches] = useState<ContainerDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [previewDispatch, setPreviewDispatch] = useState<ContainerDispatch | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<ContainerDispatch, 'id'>>({
    bill_of_lading: `BL-TZ-${Math.floor(1000 + Math.random() * 9000)}`,
    container_number: `MSKU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
    shipper: 'Muin Global Shipping Corp',
    consignee: 'Zambia Mining & Industrial Corp',
    destination_city: 'Lusaka (Zambia Transit)',
    transport_mode: 'Road Transport (Truck)',
    truck_plate_or_train: 'T 812 BCD (Heavy Hauler)',
    driver_name: 'Rashid Bakari',
    status: 'in-transit',
    dispatch_date: new Date().toISOString().split('T')[0],
    customs_release_ref: `TRA-REL-${Math.floor(10000 + Math.random() * 90000)}`
  });

  const fetchDispatches = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/logistics/dispatches/');
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const apiItems: ContainerDispatch[] = dataArr.map((d: any) => ({
        id: d.id,
        bill_of_lading: d.bill_of_lading,
        container_number: d.container_number,
        shipper: d.shipper,
        consignee: d.consignee,
        destination_city: d.destination_city,
        transport_mode: d.transport_mode,
        truck_plate_or_train: d.truck_plate_or_train,
        driver_name: d.driver_name,
        status: d.status || 'in-transit',
        dispatch_date: d.dispatch_date || new Date().toISOString().split('T')[0],
        customs_release_ref: d.customs_release_ref
      }));
      setDispatches(apiItems);
      localStorage.setItem('muin_logistics_dispatches', JSON.stringify(apiItems));
    } catch (err: any) {
      console.warn('API fetch error (falling back to cache):', err);
      setError('Could not connect to live backend API. Using cached local storage.');
      try {
        const stored = localStorage.getItem('muin_logistics_dispatches');
        if (stored) setDispatches(JSON.parse(stored));
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleAddDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      bill_of_lading: form.bill_of_lading,
      container_number: form.container_number,
      shipper: form.shipper,
      consignee: form.consignee,
      destination_city: form.destination_city,
      transport_mode: form.transport_mode,
      truck_plate_or_train: form.truck_plate_or_train,
      driver_name: form.driver_name,
      status: form.status,
      dispatch_date: form.dispatch_date,
      customs_release_ref: form.customs_release_ref
    };

    try {
      const res = await api.post('/logistics/dispatches/', payload);
      const newDispatch: ContainerDispatch = {
        id: res.data.id,
        bill_of_lading: res.data.bill_of_lading || form.bill_of_lading,
        container_number: res.data.container_number || form.container_number,
        shipper: res.data.shipper || form.shipper,
        consignee: res.data.consignee || form.consignee,
        destination_city: res.data.destination_city || form.destination_city,
        transport_mode: res.data.transport_mode || form.transport_mode,
        truck_plate_or_train: res.data.truck_plate_or_train || form.truck_plate_or_train,
        driver_name: res.data.driver_name || form.driver_name,
        status: res.data.status || form.status,
        dispatch_date: res.data.dispatch_date || form.dispatch_date,
        customs_release_ref: res.data.customs_release_ref || form.customs_release_ref
      };

      const updatedList = [newDispatch, ...dispatches];
      setDispatches(updatedList);
      localStorage.setItem('muin_logistics_dispatches', JSON.stringify(updatedList));
      setShowModal(false);

      // Reset form with new generated codes
      setForm({
        bill_of_lading: `BL-TZ-${Math.floor(1000 + Math.random() * 9000)}`,
        container_number: `MSKU-${Math.floor(100000 + Math.random() * 900000)}-${Math.floor(Math.random() * 9)}`,
        shipper: 'Muin Global Shipping Corp',
        consignee: 'Zambia Mining & Industrial Corp',
        destination_city: 'Lusaka (Zambia Transit)',
        transport_mode: 'Road Transport (Truck)',
        truck_plate_or_train: 'T 812 BCD (Heavy Hauler)',
        driver_name: 'Rashid Bakari',
        status: 'in-transit',
        dispatch_date: new Date().toISOString().split('T')[0],
        customs_release_ref: `TRA-REL-${Math.floor(10000 + Math.random() * 90000)}`
      });
    } catch (err: any) {
      console.error('API dispatch create error:', err);
      const msg = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to issue dispatch pass on backend server.';
      setError(`API Error: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (id: string | number, newStatus: ContainerDispatch['status']) => {
    const targetId = String(id);
    const updated = dispatches.map(d => String(d.id) === targetId ? { ...d, status: newStatus } : d);
    setDispatches(updated);
    if (previewDispatch && String(previewDispatch.id) === targetId) {
      setPreviewDispatch(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      localStorage.setItem('muin_logistics_dispatches', JSON.stringify(updated));
    } catch {}

    try {
      await api.patch(`/logistics/dispatches/${id}/`, { status: newStatus });
    } catch (err: any) {
      console.error('API dispatch status update error:', err);
    }
  };

  const filteredDispatches = dispatches.filter(d => filterStatus === 'all' || d.status === filterStatus);

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Container Dispatches & Inland Transit</h5>
            <p className="text-muted small mb-0">Track transit dispatches to Rwanda, Zambia, DRC, Burundi, and domestic ICD dry ports.</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-secondary btn-sm px-3" onClick={fetchDispatches} title="Refresh Dispatches from Server">
              <i className="fas fa-sync-alt me-1"></i>Refresh
            </button>
            <button
              className="btn btn-primary text-white fw-bold px-3 shadow-sm"
              onClick={() => setShowModal(true)}
              style={{ borderRadius: '8px' }}
            >
              <i className="fas fa-truck-loading me-2"></i>Issue Dispatch Gate-Pass
            </button>
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Dispatch Statuses</option>
              <option value="gate-pass-issued">Gate Pass Issued</option>
              <option value="in-transit">In-Transit</option>
              <option value="delivered-consignee">Delivered at Consignee</option>
              <option value="delivered-at-border">Delivered at Border</option>
              <option value="delayed">Delayed</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2 small">{error}</div>}

        {loading ? (
          <SkeletonTable rows={4} cols={8} />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
              <thead className="table-light">
                <tr>
                  <th>Container & B/L</th>
                  <th>Shipper & Consignee</th>
                  <th>Destination</th>
                  <th>Mode & Vehicle</th>
                  <th>Driver Name</th>
                  <th>Dispatch Date</th>
                  <th>Status</th>
                  <th className="text-end pe-3" style={{ minWidth: '90px' }}>Preview</th>
                </tr>
              </thead>
              <tbody>
                {filteredDispatches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No container dispatches found for selected filter.
                    </td>
                  </tr>
                ) : (
                  filteredDispatches.map(d => (
                    <tr
                      key={d.id}
                      className="clickable-row"
                      onClick={() => setPreviewDispatch(d)}
                      title="Click row to preview dispatch gate-pass details"
                    >
                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <button
                            className="btn btn-link p-0 fw-bold text-dark text-start text-decoration-none"
                            onClick={(e) => { e.stopPropagation(); setPreviewDispatch(d); }}
                          >
                            {d.container_number}
                          </button>
                          <i className="fas fa-external-link-alt text-muted ms-1" style={{ fontSize: '0.68rem', opacity: 0.6 }}></i>
                        </div>
                        <small className="text-muted d-block">B/L: {d.bill_of_lading}</small>
                      </td>
                      <td>
                        <span className="d-block fw-semibold text-dark">{d.consignee}</span>
                        <small className="text-muted">Shipper: {d.shipper}</small>
                      </td>
                      <td className="fw-semibold text-primary">{d.destination_city}</td>
                      <td>
                        <span className="badge bg-secondary mb-1">{d.transport_mode}</span>
                        <small className="d-block text-muted">{d.truck_plate_or_train}</small>
                      </td>
                      <td>{d.driver_name}</td>
                      <td>{d.dispatch_date}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <span className={`badge ${
                          d.status === 'in-transit' ? 'bg-primary' :
                          d.status === 'gate-pass-issued' ? 'bg-warning text-dark' :
                          d.status === 'delivered-consignee' ? 'bg-success' : 'bg-info'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="text-end pe-3" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="preview-row-btn"
                          onClick={() => setPreviewDispatch(d)}
                          title="Click to preview container dispatch"
                        >
                          <i className="fas fa-eye"></i> View
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

      {showModal && (
        <ModalPortal>
          <div className="modal show d-block tab-fade">
            <div className="modal-dialog modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">Issue Inland Container Dispatch</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleAddDispatch}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Container Number</label>
                        <input type="text" className="form-control" required value={form.container_number} onChange={e => setForm({...form, container_number: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Bill of Lading #</label>
                        <input type="text" className="form-control" required value={form.bill_of_lading} onChange={e => setForm({...form, bill_of_lading: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Shipper Name</label>
                        <input type="text" className="form-control" required value={form.shipper} onChange={e => setForm({...form, shipper: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Consignee Name</label>
                        <input type="text" className="form-control" required value={form.consignee} onChange={e => setForm({...form, consignee: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Destination City / Country</label>
                        <input type="text" className="form-control" required value={form.destination_city} onChange={e => setForm({...form, destination_city: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Transport Mode</label>
                        <select className="form-select" value={form.transport_mode} onChange={e => setForm({...form, transport_mode: e.target.value as any})}>
                          <option value="Road Transport (Truck)">Road Transport (Truck)</option>
                          <option value="Rail Freight (TAZARA)">Rail Freight (TAZARA)</option>
                          <option value="Feeder Vessel">Feeder Vessel</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Truck Plate / Train Code</label>
                        <input type="text" className="form-control" required value={form.truck_plate_or_train} onChange={e => setForm({...form, truck_plate_or_train: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Driver / Operator Name</label>
                        <input type="text" className="form-control" required value={form.driver_name} onChange={e => setForm({...form, driver_name: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Issuing Pass...' : 'Issue Dispatch Pass'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* Dispatch Gate-Pass Detail Preview Modal */}
      {previewDispatch && (
        <DispatchDetailModal
          dispatch={previewDispatch}
          onClose={() => setPreviewDispatch(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default LogisticsDispatches;

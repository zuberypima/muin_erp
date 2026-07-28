import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ContainerDispatch } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';
import ModalPortal from '../../components/ModalPortal';
import DispatchDetailModal from './DispatchDetailModal';
import '../Tasks/Tasks.css';

const INITIAL_DEMO_DISPATCHES: ContainerDispatch[] = [
  { id: 1, bill_of_lading: 'BL-TZ-9812', container_number: 'MSKU-892140-5', shipper: 'Muin Agriculture Corp', consignee: 'Zambia Mining Supplies Ltd', destination_city: 'Lusaka (Zambia Transit)', transport_mode: 'Road Transport (Truck)', truck_plate_or_train: 'T 812 BCD (Scania Heavy)', driver_name: 'Rashid Bakari', status: 'in-transit', dispatch_date: '2026-07-24', customs_release_ref: 'TRA-REL-44102' },
  { id: 2, bill_of_lading: 'BL-TZ-9813', container_number: 'MEDU-441209-1', shipper: 'Shanghai Trading Co', consignee: 'Rwanda Commercial Depot', destination_city: 'Kigali (Rwanda)', transport_mode: 'Rail Freight (TAZARA)', truck_plate_or_train: 'TAZARA Freight Train 04', driver_name: 'TAZARA Rail Ops', status: 'gate-pass-issued', dispatch_date: '2026-07-25', customs_release_ref: 'TRA-REL-44103' },
  { id: 3, bill_of_lading: 'BL-TZ-9815', container_number: 'PILU-119204-3', shipper: 'Global Pipe Manufacturers', consignee: 'Ruvu Dry Port Depot', destination_city: 'Kwala Dry Port (Tanzania)', transport_mode: 'Road Transport (Truck)', truck_plate_or_train: 'T 330 KJL', driver_name: 'Peter Swai', status: 'delivered-consignee', dispatch_date: '2026-07-20', customs_release_ref: 'TRA-REL-44104' },
];

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
    let apiItems: ContainerDispatch[] = [];
    let apiSuccess = false;

    // 1. Try endpoints in sequence
    const endpoints = ['/logistics/dispatches/', '/dispatches/', '/logistics-dispatches/'];
    for (const ep of endpoints) {
      try {
        const res = await api.get(ep);
        const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (dataArr.length >= 0) {
          apiItems = dataArr.map((d: any) => ({
            id: d.id,
            bill_of_lading: d.bill_of_lading || d.bol_number || 'BL-TZ-0000',
            container_number: d.container_number || d.container_no || 'MSKU-000000-0',
            shipper: d.shipper || 'Shipper Company',
            consignee: d.consignee || 'Consignee',
            destination_city: d.destination_city || d.destination || 'Lusaka',
            transport_mode: d.transport_mode || 'Road Transport (Truck)',
            truck_plate_or_train: d.truck_plate_or_train || d.vehicle_code || 'T 000 ABC',
            driver_name: d.driver_name || d.driver || 'Driver',
            status: d.status || 'in-transit',
            dispatch_date: d.dispatch_date || d.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
            customs_release_ref: d.customs_release_ref || 'TRA-REL-00000'
          }));
          apiSuccess = true;
          break;
        }
      } catch (err) {
        // Continue to next endpoint candidate
      }
    }

    // 2. Retrieve locally saved dispatches from localStorage
    let cached: ContainerDispatch[] = [];
    try {
      const stored = localStorage.getItem('muin_logistics_dispatches');
      if (stored) cached = JSON.parse(stored);
    } catch {}

    if (apiSuccess && apiItems.length > 0) {
      // Merge unique items prioritizing API
      const combined = [...apiItems];
      cached.forEach(c => {
        if (!combined.some(i => String(i.id) === String(c.id) || i.container_number === c.container_number)) {
          combined.push(c);
        }
      });
      setDispatches(combined);
      localStorage.setItem('muin_logistics_dispatches', JSON.stringify(combined));
    } else if (cached.length > 0) {
      setDispatches(cached);
    } else {
      // Initialize with demo list and store
      setDispatches(INITIAL_DEMO_DISPATCHES);
      localStorage.setItem('muin_logistics_dispatches', JSON.stringify(INITIAL_DEMO_DISPATCHES));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleAddDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    let createdRecord: ContainerDispatch | null = null;

    // Push to API endpoints
    const postEndpoints = ['/logistics/dispatches/', '/dispatches/', '/logistics-dispatches/'];
    for (const ep of postEndpoints) {
      try {
        const res = await api.post(ep, form);
        if (res.data) {
          createdRecord = {
            id: res.data.id || `DISP-${Date.now()}`,
            ...form
          };
          break;
        }
      } catch (err) {
        // try fallback
      }
    }

    if (!createdRecord) {
      // Fallback local save if offline
      createdRecord = {
        id: `DISP-${Date.now()}`,
        ...form
      };
    }

    const updatedList = [createdRecord, ...dispatches];
    setDispatches(updatedList);
    try {
      localStorage.setItem('muin_logistics_dispatches', JSON.stringify(updatedList));
    } catch {}

    setShowModal(false);
    setSaving(false);
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
  };

  const handleStatusUpdate = async (id: string | number, newStatus: ContainerDispatch['status']) => {
    // 1. Update UI state instantly
    const updated = dispatches.map(d => String(d.id) === String(id) ? { ...d, status: newStatus } : d);
    setDispatches(updated);
    if (previewDispatch && String(previewDispatch.id) === String(id)) {
      setPreviewDispatch(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      localStorage.setItem('muin_logistics_dispatches', JSON.stringify(updated));
    } catch {}

    // 2. Patch to API
    try {
      await api.patch(`/logistics/dispatches/${id}/`, { status: newStatus }).catch(async () => {
        return await api.patch(`/dispatches/${id}/`, { status: newStatus });
      });
    } catch (err) {
      console.warn('API status patch failed (offline/saved locally):', err);
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

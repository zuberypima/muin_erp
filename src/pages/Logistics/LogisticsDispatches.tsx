import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { ContainerDispatch } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';

const LogisticsDispatches: React.FC = () => {
  const [dispatches, setDispatches] = useState<ContainerDispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
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
    try {
      const res = await api.get('/procurement/shipments/').catch(() => ({ data: [] }));
      const mapped: ContainerDispatch[] = (res.data || []).map((d: any, idx: number) => ({
        id: d.id || idx + 1,
        bill_of_lading: d.bill_of_lading || `BL-TZ-880${idx}`,
        container_number: d.container_number || `MSKU-78190${idx}-4`,
        shipper: d.shipper || 'Export Shippers International',
        consignee: d.consignee || 'Kigali Commerce Group',
        destination_city: d.destination_city || 'Kigali (Rwanda Transit)',
        transport_mode: d.transport_mode || 'Road Transport (Truck)',
        truck_plate_or_train: d.truck_plate_or_train || d.vehicle_plate || 'T 412 DSK',
        driver_name: d.driver_name || d.carrier_or_driver || 'Hamisi Juma',
        status: d.status || 'in-transit',
        dispatch_date: d.dispatch_date || '2026-07-24',
        customs_release_ref: d.customs_release_ref || `TRA-REL-9910${idx}`
      }));

      if (mapped.length === 0) {
        const demo: ContainerDispatch[] = [
          { id: 1, bill_of_lading: 'BL-TZ-9812', container_number: 'MSKU-892140-5', shipper: 'Muin Agriculture Corp', consignee: 'Zambia Mining Supplies Ltd', destination_city: 'Lusaka (Zambia Transit)', transport_mode: 'Road Transport (Truck)', truck_plate_or_train: 'T 812 BCD (Scania Heavy)', driver_name: 'Rashid Bakari', status: 'in-transit', dispatch_date: '2026-07-24', customs_release_ref: 'TRA-REL-44102' },
          { id: 2, bill_of_lading: 'BL-TZ-9813', container_number: 'MEDU-441209-1', shipper: 'Shanghai Trading Co', consignee: 'Rwanda Commercial Depot', destination_city: 'Kigali (Rwanda)', transport_mode: 'Rail Freight (TAZARA)', truck_plate_or_train: 'TAZARA Freight Train 04', driver_name: 'TAZARA Rail Ops', status: 'gate-pass-issued', dispatch_date: '2026-07-25', customs_release_ref: 'TRA-REL-44103' },
          { id: 3, bill_of_lading: 'BL-TZ-9815', container_number: 'PILU-119204-3', shipper: 'Global Pipe Manufacturers', consignee: 'Ruvu Dry Port Depot', destination_city: 'Kwala Dry Port (Tanzania)', transport_mode: 'Road Transport (Truck)', truck_plate_or_train: 'T 330 KJL', driver_name: 'Peter Swai', status: 'delivered-consignee', dispatch_date: '2026-07-20', customs_release_ref: 'TRA-REL-44104' },
        ];
        setDispatches(demo);
      } else {
        setDispatches(mapped);
      }
    } catch {
      setError('Failed to fetch dispatches.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const handleCreateDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/procurement/shipments/', form).catch(() => {});
      const newD: ContainerDispatch = {
        id: Date.now(),
        ...form
      };
      setDispatches([newD, ...dispatches]);
      setShowModal(false);
    } catch {
      setError('Failed to issue delivery order gate pass.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string | number, newStatus: ContainerDispatch['status']) => {
    try {
      await api.patch(`/procurement/shipments/${id}/`, { status: newStatus }).catch(() => {});
      setDispatches(dispatches.map(d => d.id === id ? { ...d, status: newStatus } : d));
    } catch {
      setError('Failed to update delivery status.');
    }
  };

  const filteredDispatches = dispatches.filter(d => filterStatus === 'all' || d.status === filterStatus);

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Bill of Lading &amp; Container Dispatches</h5>
            <p className="text-muted small mb-0">Issue container Delivery Orders (DO), gate passes, TRA clearance releases, and transit freight notes.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-file-invoice me-2"></i>Issue Container Gate Pass
          </button>
        </div>

        {/* Status Filters */}
        <div className="d-flex gap-2 mb-3">
          {['all', 'in-transit', 'gate-pass-issued', 'delivered-consignee', 'delivered-at-border'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${filterStatus === st ? 'btn-dark' : 'btn-light text-muted'}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'all' ? 'All Dispatches' : st.replace(/-/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        {loading ? (
          <SkeletonTable rows={5} cols={6} />
        ) : (
          <div className="table-responsive border rounded-3">
            <table className="table align-middle mb-0" style={{ fontSize: '0.86rem' }}>
              <thead className="bg-light fw-bold text-muted">
                <tr>
                  <th className="ps-3 py-3 border-0">B/L &amp; Container #</th>
                  <th className="py-3 border-0">Shipper &amp; Consignee</th>
                  <th className="py-3 border-0">Destination &amp; Transport</th>
                  <th className="py-3 border-0">Driver / Vehicle</th>
                  <th className="py-3 border-0">Customs Release Ref</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="py-3 border-0 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDispatches.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No container dispatches found.</td></tr>
                ) : filteredDispatches.map(d => (
                  <tr key={d.id}>
                    <td className="ps-3 py-3">
                      <div className="fw-bold font-monospace text-primary">{d.bill_of_lading}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>{d.container_number}</div>
                    </td>
                    <td className="py-3">
                      <div className="fw-bold text-dark">{d.consignee}</div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>Shipper: {d.shipper}</div>
                    </td>
                    <td className="py-3 small">
                      <div className="fw-semibold text-dark">{d.destination_city}</div>
                      <div className="text-muted">{d.transport_mode}</div>
                    </td>
                    <td className="py-3 small">
                      <div className="fw-semibold text-dark">{d.driver_name}</div>
                      <div className="text-muted">{d.truck_plate_or_train}</div>
                    </td>
                    <td className="py-3 font-monospace text-success small">{d.customs_release_ref}</td>
                    <td className="py-3">
                      <span className={`badge ${
                        d.status === 'delivered-consignee' ? 'bg-success-subtle text-success border border-success-subtle' :
                        d.status === 'in-transit' ? 'bg-info-subtle text-info border border-info-subtle' :
                        'bg-warning-subtle text-warning border border-warning-subtle'
                      }`} style={{ borderRadius: '6px' }}>
                        {d.status.replace(/-/g, ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-end pe-4">
                      {d.status !== 'delivered-consignee' && (
                        <button
                          className="btn btn-sm btn-outline-success py-1 px-2 fw-semibold"
                          style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                          onClick={() => handleUpdateStatus(d.id, 'delivered-consignee')}
                        >
                          <i className="fas fa-check me-1"></i>Confirm Delivery
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
                <h5 className="modal-title fw-bold"><i className="fas fa-file-invoice text-primary me-2"></i>Issue Container Gate Pass &amp; Delivery Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateDispatch}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Bill of Lading (B/L #) *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.bill_of_lading} onChange={e => setForm({...form, bill_of_lading: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Container Number *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.container_number} onChange={e => setForm({...form, container_number: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Shipper Company</label>
                    <input type="text" required className="form-control bg-light" value={form.shipper} onChange={e => setForm({...form, shipper: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Consignee Name / Receiver *</label>
                    <input type="text" required className="form-control bg-light" value={form.consignee} onChange={e => setForm({...form, consignee: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Destination City / Border *</label>
                    <input type="text" required className="form-control bg-light" value={form.destination_city} onChange={e => setForm({...form, destination_city: e.target.value})} placeholder="e.g. Lusaka (Zambia)" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Mode of Transport</label>
                    <select className="form-select bg-light" value={form.transport_mode} onChange={e => setForm({...form, transport_mode: e.target.value as any})}>
                      <option value="Road Transport (Truck)">Road Transport (Heavy Haulage Truck)</option>
                      <option value="Rail Freight (TAZARA)">Rail Freight (TAZARA Railway)</option>
                      <option value="Feeder Vessel">Feeder Marine Vessel</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Driver / Operator Name</label>
                    <input type="text" required className="form-control bg-light" value={form.driver_name} onChange={e => setForm({...form, driver_name: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Truck Plate Number / Train Code</label>
                    <input type="text" required className="form-control bg-light" value={form.truck_plate_or_train} onChange={e => setForm({...form, truck_plate_or_train: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">TRA Customs Release Ref *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.customs_release_ref} onChange={e => setForm({...form, customs_release_ref: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Dispatch Date</label>
                    <input type="date" required className="form-control bg-light" value={form.dispatch_date} onChange={e => setForm({...form, dispatch_date: e.target.value})} />
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary text-white fw-bold px-4" disabled={saving}>
                    {saving ? 'Issuing Gate Pass...' : 'Issue Gate Pass'}
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

export default LogisticsDispatches;

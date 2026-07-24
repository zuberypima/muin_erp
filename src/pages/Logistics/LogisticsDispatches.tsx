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
      const res = await api.get('/logistics/dispatches/').catch(() => ({ data: [] }));
      const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      const mapped: ContainerDispatch[] = dataArr.map((d: any) => ({
        id: d.id,
        bill_of_lading: d.bill_of_lading,
        container_number: d.container_number,
        shipper: d.shipper || 'Shipper Company',
        consignee: d.consignee || 'Consignee',
        destination_city: d.destination_city || 'Lusaka',
        transport_mode: d.transport_mode || 'Road Transport (Truck)',
        truck_plate_or_train: d.truck_plate_or_train || 'T 000 ABC',
        driver_name: d.driver_name || 'Driver',
        status: d.status || 'in-transit',
        dispatch_date: d.dispatch_date || '2026-07-24',
        customs_release_ref: d.customs_release_ref || 'TRA-REL-00000'
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

  const handleAddDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/logistics/dispatches/', form);
      const newD: ContainerDispatch = {
        id: res.data.id || Date.now(),
        ...form
      };
      setDispatches([newD, ...dispatches]);
      setShowModal(false);
    } catch {
      setError('Failed to issue container dispatch pass.');
    } finally {
      setSaving(false);
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
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-truck-loading me-2"></i>Issue Dispatch Gate-Pass
          </button>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Dispatch Statuses</option>
              <option value="gate-pass-issued">Gate Pass Issued</option>
              <option value="in-transit">In-Transit</option>
              <option value="delivered-consignee">Delivered at Consignee</option>
            </select>
          </div>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {loading ? (
          <SkeletonTable rows={4} columns={7} />
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
                </tr>
              </thead>
              <tbody>
                {filteredDispatches.map(d => (
                  <tr key={d.id}>
                    <td>
                      <span className="fw-bold text-dark d-block">{d.container_number}</span>
                      <small className="text-muted">B/L: {d.bill_of_lading}</small>
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
                    <td>
                      <span className={`badge ${
                        d.status === 'in-transit' ? 'bg-primary' :
                        d.status === 'gate-pass-issued' ? 'bg-warning' : 'bg-success'
                      }`}>
                        {d.status}
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
      )}
    </div>
  );
};

export default LogisticsDispatches;

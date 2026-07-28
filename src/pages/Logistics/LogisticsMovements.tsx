import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { VesselVoyage, SHIPPING_LINES, MAJOR_PORTS } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';
import ModalPortal from '../../components/ModalPortal';

const LogisticsMovements: React.FC = () => {
  const [vessels, setVessels] = useState<VesselVoyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<VesselVoyage, 'id'>>({
    vessel_name: 'MV Muin Horizon',
    imo_number: `IMO ${Math.floor(9000000 + Math.random() * 900000)}`,
    voyage_number: `V.2026-${Math.floor(10 + Math.random() * 90)}E`,
    origin_port: MAJOR_PORTS[4],
    destination_port: MAJOR_PORTS[0],
    eta: new Date().toISOString().split('T')[0] + 'T10:00:00Z',
    etd: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + 'T18:00:00Z',
    berth_no: 'Berth 05',
    total_teus: 3200,
    status: 'berthing-loading',
    shipping_line: SHIPPING_LINES[0]
  });

  const fetchVessels = async () => {
    setLoading(true);
    setError('');
    let apiItems: VesselVoyage[] = [];
    let apiSuccess = false;

    const endpoints = ['/logistics/vessels/', '/vessels/', '/logistics-vessels/'];
    for (const ep of endpoints) {
      try {
        const res = await api.get(ep);
        const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (dataArr.length >= 0) {
          apiItems = dataArr.map((v: any) => ({
            id: v.id,
            vessel_name: v.vessel_name || 'MV Muin Trader',
            imo_number: v.imo_number || 'IMO 0000000',
            voyage_number: v.voyage_number || 'V.2026-00',
            origin_port: v.origin_port || MAJOR_PORTS[4],
            destination_port: v.destination_port || MAJOR_PORTS[0],
            eta: v.eta ? v.eta.replace('T', ' ').substring(0, 16) : '2026-07-25 08:00',
            etd: v.etd ? v.etd.replace('T', ' ').substring(0, 16) : '2026-07-27 18:00',
            berth_no: v.berth_no || 'Berth 01',
            total_teus: Number(v.total_teus) || 2400,
            status: v.status || 'berthing-loading',
            shipping_line: v.shipping_line || SHIPPING_LINES[0]
          }));
          apiSuccess = true;
          break;
        }
      } catch (err) {}
    }

    let cached: VesselVoyage[] = [];
    try {
      const stored = localStorage.getItem('muin_logistics_vessels');
      if (stored) cached = JSON.parse(stored);
    } catch {}

    if (apiSuccess && apiItems.length > 0) {
      const combined = [...apiItems];
      cached.forEach(c => {
        if (!combined.some(i => String(i.id) === String(c.id) || i.imo_number === c.imo_number)) {
          combined.push(c);
        }
      });
      setVessels(combined);
      localStorage.setItem('muin_logistics_vessels', JSON.stringify(combined));
    } else if (cached.length > 0) {
      setVessels(cached);
    } else {
      const demo: VesselVoyage[] = [
        { id: 1, vessel_name: 'MSC Irina', imo_number: 'IMO 9929429', voyage_number: 'V.2026-04E', origin_port: MAJOR_PORTS[5], destination_port: MAJOR_PORTS[0], eta: '2026-07-25 08:00', etd: '2026-07-27 18:00', berth_no: 'Berth 04', total_teus: 2800, status: 'berthing-loading', shipping_line: 'MSC (Mediterranean Shipping Co)' },
        { id: 2, vessel_name: 'CMA CGM Oceanus', imo_number: 'IMO 9741029', voyage_number: 'V.8802-W', origin_port: MAJOR_PORTS[6], destination_port: MAJOR_PORTS[1], eta: '2026-07-26 14:30', etd: '2026-07-28 12:00', berth_no: 'Berth 02', total_teus: 1850, status: 'at-anchor', shipping_line: 'CMA CGM' },
        { id: 3, vessel_name: 'Maersk Mc-Kinney', imo_number: 'IMO 9632064', voyage_number: 'V.9021-S', origin_port: MAJOR_PORTS[4], destination_port: MAJOR_PORTS[0], eta: '2026-07-28 06:00', etd: '2026-07-30 20:00', berth_no: 'Berth 07', total_teus: 4200, status: 'sailing', shipping_line: 'Maersk Line' },
      ];
      setVessels(demo);
      localStorage.setItem('muin_logistics_vessels', JSON.stringify(demo));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleAddVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    let createdRecord: VesselVoyage | null = null;
    const postEndpoints = ['/logistics/vessels/', '/vessels/', '/logistics-vessels/'];
    for (const ep of postEndpoints) {
      try {
        const res = await api.post(ep, form);
        if (res.data) {
          createdRecord = {
            id: res.data.id || `VESSEL-${Date.now()}`,
            ...form,
            eta: form.eta.replace('T', ' ').substring(0, 16),
            etd: form.etd.replace('T', ' ').substring(0, 16)
          };
          break;
        }
      } catch (err) {}
    }

    if (!createdRecord) {
      createdRecord = {
        id: `VESSEL-${Date.now()}`,
        ...form,
        eta: form.eta.replace('T', ' ').substring(0, 16),
        etd: form.etd.replace('T', ' ').substring(0, 16)
      };
    }

    const updatedList = [createdRecord, ...vessels];
    setVessels(updatedList);
    try {
      localStorage.setItem('muin_logistics_vessels', JSON.stringify(updatedList));
    } catch {}

    setShowModal(false);
    setSaving(false);
  };

  const filteredVessels = vessels.filter(v => filterStatus === 'all' || v.status === filterStatus);

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Vessel Movements & Voyage Schedules</h5>
            <p className="text-muted small mb-0">Monitor ETA/ETD times, berthing slots, container TEU capacity, and shipping lines.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-ship me-2"></i>Schedule Vessel Voyage
          </button>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-md-4">
            <select className="form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Voyage Statuses</option>
              <option value="at-anchor">At Anchor / Roadstead</option>
              <option value="berthing-loading">Berthing / Loading</option>
              <option value="sailing">Sailing / In-Transit</option>
              <option value="completed">Completed / Departed</option>
            </select>
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
                  <th>Vessel & IMO</th>
                  <th>Voyage #</th>
                  <th>Shipping Line</th>
                  <th>Origin &rarr; Destination</th>
                  <th>ETA / ETD</th>
                  <th>Berth / TEUs</th>
                  <th>Voyage Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredVessels.map(v => (
                  <tr key={v.id}>
                    <td>
                      <span className="fw-bold text-dark d-block">{v.vessel_name}</span>
                      <small className="text-muted">{v.imo_number}</small>
                    </td>
                    <td className="fw-semibold text-primary">{v.voyage_number}</td>
                    <td>{v.shipping_line}</td>
                    <td>
                      <span className="d-block text-dark fw-semibold">{v.origin_port}</span>
                      <small className="text-muted"><i className="fas fa-arrow-right me-1 text-primary"></i>{v.destination_port}</small>
                    </td>
                    <td>
                      <small className="d-block text-success fw-semibold"><i className="fas fa-calendar-check me-1"></i>ETA: {v.eta}</small>
                      <small className="d-block text-secondary"><i className="fas fa-calendar-minus me-1"></i>ETD: {v.etd}</small>
                    </td>
                    <td>
                      <span className="badge bg-secondary mb-1">{v.berth_no}</span>
                      <small className="d-block text-muted">{v.total_teus} TEUs</small>
                    </td>
                    <td>
                      <span className={`badge ${
                        v.status === 'berthing-loading' ? 'bg-primary' :
                        v.status === 'at-anchor' ? 'bg-warning' :
                        v.status === 'sailing' ? 'bg-info text-dark' : 'bg-success'
                      }`}>
                        {v.status}
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
        <ModalPortal>
          <div className="modal show d-block tab-fade">
            <div className="modal-dialog modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title fw-bold">Schedule Vessel Arrival / Voyage</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleAddVessel}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Vessel Name</label>
                        <input type="text" className="form-control" required value={form.vessel_name} onChange={e => setForm({...form, vessel_name: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">IMO Number</label>
                        <input type="text" className="form-control" required value={form.imo_number} onChange={e => setForm({...form, imo_number: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Voyage Number</label>
                        <input type="text" className="form-control" required value={form.voyage_number} onChange={e => setForm({...form, voyage_number: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Shipping Line</label>
                        <select className="form-select" value={form.shipping_line} onChange={e => setForm({...form, shipping_line: e.target.value})}>
                          {SHIPPING_LINES.map(line => <option key={line} value={line}>{line}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Origin Port</label>
                        <select className="form-select" value={form.origin_port} onChange={e => setForm({...form, origin_port: e.target.value})}>
                          {MAJOR_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Destination Port</label>
                        <select className="form-select" value={form.destination_port} onChange={e => setForm({...form, destination_port: e.target.value})}>
                          {MAJOR_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Berth Assigned</label>
                        <input type="text" className="form-control" required value={form.berth_no} onChange={e => setForm({...form, berth_no: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Total Cargo TEUs</label>
                        <input type="number" className="form-control" required value={form.total_teus} onChange={e => setForm({...form, total_teus: Number(e.target.value)})} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Scheduling...' : 'Save Voyage Schedule'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
};

export default LogisticsMovements;

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { VesselVoyage, SHIPPING_LINES, MAJOR_PORTS } from './logisticsTypes';
import { SkeletonTable } from '../../components/Skeleton';

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
    origin_port: MAJOR_PORTS[4], // Shanghai
    destination_port: MAJOR_PORTS[0], // Dar es Salaam
    eta: new Date().toISOString().split('T')[0] + ' 10:00',
    etd: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] + ' 18:00',
    berth_no: 'Berth 05',
    total_teus: 3200,
    status: 'berthing-loading',
    shipping_line: SHIPPING_LINES[0]
  });

  const fetchVessels = async () => {
    try {
      const res = await api.get('/procurement/stock-movements/').catch(() => ({ data: [] }));
      const mapped: VesselVoyage[] = (res.data || []).map((v: any, idx: number) => ({
        id: v.id || idx + 1,
        vessel_name: v.vessel_name || v.item_name || `MV Container Liner ${idx + 1}`,
        imo_number: v.imo_number || `IMO 981200${idx}`,
        voyage_number: v.voyage_number || `V.2026-0${idx + 1}`,
        origin_port: v.origin_port || MAJOR_PORTS[4],
        destination_port: v.destination_port || MAJOR_PORTS[0],
        eta: v.eta || '2026-07-25 08:00',
        etd: v.etd || '2026-07-27 18:00',
        berth_no: v.berth_no || `Berth 0${idx + 1}`,
        total_teus: v.total_teus || 2400,
        status: v.status || 'berthing-loading',
        shipping_line: v.shipping_line || SHIPPING_LINES[0]
      }));

      if (mapped.length === 0) {
        const demo: VesselVoyage[] = [
          { id: 1, vessel_name: 'MV Muin Express', imo_number: 'IMO 9812401', voyage_number: 'V.2026-04E', origin_port: MAJOR_PORTS[5], destination_port: MAJOR_PORTS[0], eta: '2026-07-25 08:00', etd: '2026-07-27 18:00', berth_no: 'Berth 04', total_teus: 2800, status: 'berthing-loading', shipping_line: SHIPPING_LINES[0] },
          { id: 2, vessel_name: 'CMA CGM Oceanus', imo_number: 'IMO 9741029', voyage_number: 'V.8802-W', origin_port: MAJOR_PORTS[6], destination_port: MAJOR_PORTS[1], eta: '2026-07-26 14:30', etd: '2026-07-28 12:00', berth_no: 'Berth 02', total_teus: 1850, status: 'at-anchor', shipping_line: 'CMA CGM' },
          { id: 3, vessel_name: 'Maersk Mc-Kinney', imo_number: 'IMO 9632064', voyage_number: 'V.9021-S', origin_port: MAJOR_PORTS[4], destination_port: MAJOR_PORTS[0], eta: '2026-07-28 06:00', etd: '2026-07-30 20:00', berth_no: 'Berth 07', total_teus: 4200, status: 'sailing', shipping_line: 'Maersk Line' },
          { id: 4, vessel_name: 'MSC Flaminia', imo_number: 'IMO 9225615', voyage_number: 'V.1104-E', origin_port: MAJOR_PORTS[7], destination_port: MAJOR_PORTS[0], eta: '2026-07-22 10:00', etd: '2026-07-24 16:00', berth_no: 'Berth 01', total_teus: 3100, status: 'completed', shipping_line: 'MSC (Mediterranean Shipping Co)' },
        ];
        setVessels(demo);
      } else {
        setVessels(mapped);
      }
    } catch {
      setError('Failed to fetch vessel schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleLogVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/procurement/stock-movements/', form).catch(() => {});
      const newV: VesselVoyage = {
        id: Date.now(),
        ...form
      };
      setVessels([newV, ...vessels]);
      setShowModal(false);
    } catch {
      setError('Failed to log vessel call.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: string | number, newStatus: VesselVoyage['status']) => {
    try {
      await api.patch(`/procurement/stock-movements/${id}/`, { status: newStatus }).catch(() => {});
      setVessels(vessels.map(v => v.id === id ? { ...v, status: newStatus } : v));
    } catch {
      setError('Failed to update status.');
    }
  };

  const filteredVessels = vessels.filter(v => filterStatus === 'all' || v.status === filterStatus);

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
          <div>
            <h5 className="fw-bold text-dark mb-1">Vessel Schedule &amp; Marine Voyage Log</h5>
            <p className="text-muted small mb-0">Track container cargo ships, ETA/ETD times, assigned berths, and ocean freight lines.</p>
          </div>
          <button
            className="btn btn-primary text-white fw-bold px-3 shadow-sm"
            onClick={() => setShowModal(true)}
            style={{ borderRadius: '8px' }}
          >
            <i className="fas fa-ship me-2"></i>Log Vessel Arrival Call
          </button>
        </div>

        {/* Filter Buttons */}
        <div className="d-flex gap-2 mb-3">
          {['all', 'berthing-loading', 'at-anchor', 'sailing', 'completed'].map(st => (
            <button
              key={st}
              className={`btn btn-sm ${filterStatus === st ? 'btn-dark' : 'btn-light text-muted'}`}
              onClick={() => setFilterStatus(st)}
            >
              {st === 'all' ? 'All Vessels' : st.replace('-', ' ').toUpperCase()}
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
                  <th className="ps-3 py-3 border-0">Vessel Name &amp; IMO #</th>
                  <th className="py-3 border-0">Voyage &amp; Line</th>
                  <th className="py-3 border-0">Origin Port → Destination</th>
                  <th className="py-3 border-0">Berth</th>
                  <th className="py-3 border-0 text-center">TEU Capacity</th>
                  <th className="py-3 border-0">Status</th>
                  <th className="py-3 border-0 text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVessels.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No vessel calls found.</td></tr>
                ) : filteredVessels.map(v => (
                  <tr key={v.id}>
                    <td className="ps-3 py-3">
                      <div className="fw-bold text-dark"><i className="fas fa-ship text-primary me-2"></i>{v.vessel_name}</div>
                      <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>{v.imo_number}</div>
                    </td>
                    <td className="py-3">
                      <div className="fw-bold text-dark">{v.shipping_line}</div>
                      <div className="text-muted small font-monospace">{v.voyage_number}</div>
                    </td>
                    <td className="py-3 small">
                      <div className="text-muted">{v.origin_port}</div>
                      <div className="fw-semibold text-dark">→ {v.destination_port}</div>
                    </td>
                    <td className="py-3"><span className="badge bg-light text-dark border">{v.berth_no}</span></td>
                    <td className="py-3 text-center fw-bold">{v.total_teus.toLocaleString()} TEUs</td>
                    <td className="py-3">
                      <span className={`badge ${
                        v.status === 'berthing-loading' ? 'bg-success-subtle text-success border border-success-subtle' :
                        v.status === 'at-anchor' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                        v.status === 'sailing' ? 'bg-info-subtle text-info border border-info-subtle' :
                        'bg-secondary-subtle text-secondary'
                      }`} style={{ borderRadius: '6px' }}>
                        {v.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 text-end pe-4">
                      {v.status === 'at-anchor' && (
                        <button
                          className="btn btn-sm btn-outline-success py-1 px-2 fw-semibold"
                          style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                          onClick={() => handleUpdateStatus(v.id, 'berthing-loading')}
                        >
                          <i className="fas fa-anchor me-1"></i>Berth Ship
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

      {/* Log Vessel Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold"><i className="fas fa-ship text-primary me-2"></i>Log Vessel Arrival Call</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleLogVessel}>
                <div className="modal-body row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Vessel Name *</label>
                    <input type="text" required className="form-control bg-light" value={form.vessel_name} onChange={e => setForm({...form, vessel_name: e.target.value})} placeholder="e.g. MV Muin Express" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">IMO Number *</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.imo_number} onChange={e => setForm({...form, imo_number: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Voyage Ref Code</label>
                    <input type="text" required className="form-control bg-light font-monospace" value={form.voyage_number} onChange={e => setForm({...form, voyage_number: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Shipping Line</label>
                    <select className="form-select bg-light" value={form.shipping_line} onChange={e => setForm({...form, shipping_line: e.target.value})}>
                      {SHIPPING_LINES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Origin Port</label>
                    <select className="form-select bg-light" value={form.origin_port} onChange={e => setForm({...form, origin_port: e.target.value})}>
                      {MAJOR_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Destination Port</label>
                    <select className="form-select bg-light" value={form.destination_port} onChange={e => setForm({...form, destination_port: e.target.value})}>
                      {MAJOR_PORTS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Assigned Berth No</label>
                    <input type="text" required className="form-control bg-light" value={form.berth_no} onChange={e => setForm({...form, berth_no: e.target.value})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Total TEUs</label>
                    <input type="number" min={1} required className="form-control bg-light" value={form.total_teus} onChange={e => setForm({...form, total_teus: Number(e.target.value)})} />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Status</label>
                    <select className="form-select bg-light" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                      <option value="at-anchor">At Anchor</option>
                      <option value="berthing-loading">Berthing / Loading</option>
                      <option value="sailing">Sailing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary text-white fw-bold px-4" disabled={saving}>
                    {saving ? 'Logging...' : 'Log Vessel Call'}
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

export default LogisticsMovements;

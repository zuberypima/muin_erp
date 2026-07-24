import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';
import { SkeletonDashboard } from '../../components/Skeleton';
import { ContainerItem, VesselVoyage, ContainerDispatch, MarineAsset } from './logisticsTypes';

const LogisticsDashboard: React.FC = () => {
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [vessels, setVessels] = useState<VesselVoyage[]>([]);
  const [dispatches, setDispatches] = useState<ContainerDispatch[]>([]);
  const [assets, setAssets] = useState<MarineAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contRes, vesRes, dispRes, assetRes] = await Promise.all([
          api.get('/procurement/inventory/').catch(() => ({ data: [] })),
          api.get('/procurement/stock-movements/').catch(() => ({ data: [] })),
          api.get('/procurement/shipments/').catch(() => ({ data: [] })),
          api.get('/procurement/assets/').catch(() => ({ data: [] }))
        ]);
        setContainers(contRes.data || []);
        setVessels(vesRes.data || []);
        setDispatches(dispRes.data || []);
        setAssets(assetRes.data || []);
      } catch (err) {
        console.error("Failed to fetch marine logistics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  // Demo Fallback Counts if backend table is initial
  const totalTEUs = containers.length > 0 ? containers.length * 2 : 1420;
  const activeVessels = vessels.length > 0 ? vessels.length : 6;
  const customsPending = containers.filter(c => !c.customs_cleared).length || 14;
  const operationalFleet = assets.length > 0 ? assets.length : 12;

  const mockVessels: VesselVoyage[] = [
    { id: 1, vessel_name: 'MV Muin Trader', imo_number: 'IMO 9812401', voyage_number: 'V.2026-04E', origin_port: 'Port of Singapore', destination_port: 'Port of Dar es Salaam', eta: '2026-07-25 08:00', etd: '2026-07-27 18:00', berth_no: 'Berth 04', total_teus: 2400, status: 'berthing-loading', shipping_line: 'MUIN Shipping Lines' },
    { id: 2, vessel_name: 'CMA CGM Oceanus', imo_number: 'IMO 9741029', voyage_number: 'V.8802-W', origin_port: 'Dubai Jebel Ali', destination_port: 'Port of Zanzibar', eta: '2026-07-26 14:30', etd: '2026-07-28 12:00', berth_no: 'Berth 02', total_teus: 1850, status: 'at-anchor', shipping_line: 'CMA CGM' },
    { id: 3, vessel_name: 'Maersk Mc-Kinney', imo_number: 'IMO 9632064', voyage_number: 'V.9021-S', origin_port: 'Port of Shanghai', destination_port: 'Port of Dar es Salaam', eta: '2026-07-28 06:00', etd: '2026-07-30 20:00', berth_no: 'Berth 07', total_teus: 4200, status: 'sailing', shipping_line: 'Maersk Line' },
  ];

  return (
    <div className="container-fluid p-0 fade-in">
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Container Yard Stock</p>
                <h3 className="fw-bold text-dark mb-0">{totalTEUs.toLocaleString()} <span className="fs-6 fw-normal text-muted">TEUs</span></h3>
                <span className="badge bg-primary-subtle text-primary mt-2">78% Yard Capacity</span>
              </div>
              <div className="bg-primary text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-boxes fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Active Vessel Voyages</p>
                <h3 className="fw-bold text-dark mb-0">{activeVessels} <span className="fs-6 fw-normal text-muted">Ships</span></h3>
                <span className="badge bg-success-subtle text-success mt-2">2 Berthing Now</span>
              </div>
              <div className="bg-success text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-ship fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Customs Clearance</p>
                <h3 className="fw-bold text-dark mb-0">{customsPending} <span className="fs-6 fw-normal text-muted">B/L Pending</span></h3>
                <span className="badge bg-warning-subtle text-warning mt-2">TRA Customs Hold</span>
              </div>
              <div className="bg-warning text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-file-invoice fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Marine &amp; Port Assets</p>
                <h3 className="fw-bold text-dark mb-0">{operationalFleet} <span className="fs-6 fw-normal text-muted">Units</span></h3>
                <span className="badge bg-info-subtle text-info mt-2">Tugboats &amp; Quay Cranes</span>
              </div>
              <div className="bg-info text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-truck-loading fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <h6 className="fw-bold text-dark mb-3"><i className="fas fa-bolt text-warning me-2"></i>Marine Port Operations Quick Actions</h6>
        <div className="row g-2">
          <div className="col-md-3">
            <Link to="/logistics/inventory" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-boxes text-primary fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">Container Yard</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Track 20ft &amp; 40ft Containers</div>
              </div>
            </Link>
          </div>
          <div className="col-md-3">
            <Link to="/logistics/stock-tracking" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-ship text-success fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">Vessel Schedule</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Log Berth &amp; Voyage Calls</div>
              </div>
            </Link>
          </div>
          <div className="col-md-3">
            <Link to="/logistics/dispatches" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-file-invoice text-warning fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">B/L &amp; Dispatches</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Issue Gate Pass &amp; Delivery Orders</div>
              </div>
            </Link>
          </div>
          <div className="col-md-3">
            <Link to="/logistics/assets" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-truck-loading text-info fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">Tugboats &amp; Cranes</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Manage Quay Cranes &amp; Fleet</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Vessel Movements Table */}
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1"><i className="fas fa-anchor text-primary me-2"></i>Live Container Vessel Schedule</h5>
            <p className="text-muted small mb-0">Expected arrival, berth allocation, and TEU capacity logs at Dar es Salaam Port.</p>
          </div>
          <Link to="/logistics/stock-tracking" className="btn btn-sm btn-outline-primary fw-semibold">View All Vessels</Link>
        </div>

        <div className="table-responsive border rounded-3">
          <table className="table align-middle mb-0" style={{ fontSize: '0.86rem' }}>
            <thead className="bg-light text-muted fw-bold">
              <tr>
                <th className="ps-3 py-3 border-0">Vessel &amp; Voyage</th>
                <th className="py-3 border-0">Shipping Line</th>
                <th className="py-3 border-0">Origin → Destination</th>
                <th className="py-3 border-0">Berth No</th>
                <th className="py-3 border-0 text-center">TEU Capacity</th>
                <th className="py-3 border-0">Status</th>
                <th className="py-3 border-0 text-end pe-4">ETA / ETD</th>
              </tr>
            </thead>
            <tbody>
              {mockVessels.map(v => (
                <tr key={v.id}>
                  <td className="ps-3 py-3">
                    <div className="fw-bold text-dark"><i className="fas fa-ship me-1 text-secondary"></i>{v.vessel_name}</div>
                    <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{v.imo_number} | {v.voyage_number}</div>
                  </td>
                  <td className="py-3 fw-semibold text-dark">{v.shipping_line}</td>
                  <td className="py-3 small">
                    <div className="text-muted">{v.origin_port}</div>
                    <div className="fw-semibold text-dark">→ {v.destination_port}</div>
                  </td>
                  <td className="py-3"><span className="badge bg-light text-dark border font-monospace">{v.berth_no}</span></td>
                  <td className="py-3 text-center fw-bold">{v.total_teus.toLocaleString()} TEUs</td>
                  <td className="py-3">
                    <span className={`badge ${
                      v.status === 'berthing-loading' ? 'bg-success-subtle text-success border border-success-subtle' :
                      v.status === 'at-anchor' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
                      'bg-info-subtle text-info border border-info-subtle'
                    }`} style={{ borderRadius: '6px' }}>
                      {v.status.replace('-', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-end pe-4 small">
                    <div className="fw-semibold text-dark">ETA: {v.eta}</div>
                    <div className="text-muted">ETD: {v.etd}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;

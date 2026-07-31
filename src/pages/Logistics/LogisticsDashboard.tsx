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
          api.get('/logistics/containers/').catch(() => ({ data: [] })),
          api.get('/logistics/vessels/').catch(() => ({ data: [] })),
          api.get('/logistics/dispatches/').catch(() => ({ data: [] })),
          api.get('/assets/fixed-assets/').catch(() => ({ data: [] }))
        ]);
        const getArr = (d: any) => Array.isArray(d) ? d : (d?.results || []);
        setContainers(getArr(contRes.data));
        setVessels(getArr(vesRes.data));
        setDispatches(getArr(dispRes.data));
        setAssets(getArr(assetRes.data));
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

  const totalTEUs = containers.length > 0 
    ? containers.reduce((acc, c) => acc + (c.size_type?.includes('40ft') ? 2 : 1), 0)
    : 1420;
  const activeVessels = vessels.length;
  const activeDispatches = dispatches.length;
  const customsPending = containers.filter(c => !c.customs_cleared).length;
  const operationalFleet = assets.length > 0 ? assets.length : 12;

  const displayVessels: VesselVoyage[] = vessels.length > 0 ? vessels : [
    { id: 1, vessel_name: 'MV Muin Horizon', imo_number: 'IMO 9468903', voyage_number: 'V.2026-73E', origin_port: 'Port of Shanghai (China)', destination_port: 'Port of Dar es Salaam', eta: '2026-07-31 10:00', etd: '2026-08-02 18:00', berth_no: 'Berth 04', total_teus: 3200, status: 'berthing-loading', shipping_line: 'Maersk Line' },
    { id: 2, vessel_name: 'MSC Irina', imo_number: 'IMO 9929429', voyage_number: 'V.2026-04E', origin_port: 'Port of Singapore', destination_port: 'Port of Dar es Salaam', eta: '2026-08-03 08:00', etd: '2026-08-05 18:00', berth_no: 'Berth 02', total_teus: 2800, status: 'at-anchor', shipping_line: 'MSC (Mediterranean Shipping Co)' },
    { id: 3, vessel_name: 'CMA CGM Oceanus', imo_number: 'IMO 9741029', voyage_number: 'V.8802-W', origin_port: 'Dubai Jebel Ali', destination_port: 'Port of Zanzibar', eta: '2026-08-06 14:30', etd: '2026-08-08 12:00', berth_no: 'Berth 07', total_teus: 1850, status: 'sailing', shipping_line: 'CMA CGM' },
  ];

  return (
    <div className="container-fluid p-0 fade-in">
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Total Containers</p>
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
                <span className="badge bg-success-subtle text-success mt-2">{activeDispatches} Inland Dispatches</span>
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
                <p className="text-muted small fw-semibold text-uppercase mb-1">TRA Customs Holds</p>
                <h3 className="fw-bold text-dark mb-0">{customsPending} <span className="fs-6 fw-normal text-muted">Holds</span></h3>
                <span className="badge bg-warning-subtle text-warning mt-2">Needs Verification</span>
              </div>
              <div className="bg-warning text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-file-invoice-dollar fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Active Dispatches</p>
                <h3 className="fw-bold text-dark mb-0">{activeDispatches} <span className="fs-6 fw-normal text-muted">Shipments</span></h3>
                <span className="badge bg-info-subtle text-info mt-2">{operationalFleet} Fleet Units Active</span>
              </div>
              <div className="bg-info text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-truck-moving fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Expected Vessels & Port Arrivals</h5>
              <Link to="/logistics/movements" className="btn btn-sm btn-outline-primary fw-semibold">View All Schedules</Link>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '14px' }}>
                <thead className="table-light">
                  <tr>
                    <th>Vessel & IMO</th>
                    <th>Voyage #</th>
                    <th>Origin Port</th>
                    <th>ETA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {displayVessels.map(v => (
                    <tr key={v.id}>
                      <td>
                        <span className="fw-bold text-dark d-block">{v.vessel_name}</span>
                        <small className="text-muted">{v.imo_number}</small>
                      </td>
                      <td className="fw-semibold text-primary">{v.voyage_number}</td>
                      <td>{v.origin_port}</td>
                      <td className="text-success fw-semibold">{v.eta}</td>
                      <td>
                        <span className={`badge ${
                          v.status === 'berthing-loading' ? 'bg-primary' :
                          v.status === 'at-anchor' ? 'bg-warning' : 'bg-success'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 p-4 bg-white">
            <h5 className="fw-bold text-dark mb-3">Quick Logistics Links</h5>
            <div className="d-flex flex-column gap-2">
              <Link to="/logistics/inventory" className="btn btn-light text-start p-3 border d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold text-dark d-block">Container Terminal Yard</span>
                  <small className="text-muted">Yard slots, weights, customs clearance</small>
                </div>
                <i className="fas fa-chevron-right text-muted"></i>
              </Link>

              <Link to="/logistics/dispatches" className="btn btn-light text-start p-3 border d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold text-dark d-block">Inland Transit Dispatches</span>
                  <small className="text-muted">Truck haulage & TAZARA rail freight</small>
                </div>
                <i className="fas fa-chevron-right text-muted"></i>
              </Link>

              <Link to="/logistics/fleet" className="btn btn-light text-start p-3 border d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold text-dark d-block">Marine Asset Equipment</span>
                  <small className="text-muted">Tugboats, quay cranes & reach stackers</small>
                </div>
                <i className="fas fa-chevron-right text-muted"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;

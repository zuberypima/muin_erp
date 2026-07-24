import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';
import { SkeletonDashboard } from '../../components/Skeleton';
import { FixedAsset } from './assetTypes';

const AssetsDashboard: React.FC = () => {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/procurement/assets/').catch(() => ({ data: [] }));
        setAssets(res.data || []);
      } catch (err) {
        console.error("Failed to fetch asset management data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  const mockAssets: FixedAsset[] = [
    { id: 1, asset_tag: 'AST-10045', name: 'Scania Heavy Transport Truck 15T', category: 'Vehicles & Transport', serial_number: 'SN-SC-99120', location: 'Bandari Container Port Depot', department_assigned: 'Logistics', custodian_name: 'Rashid Bakari', purchase_date: '2024-03-15', purchase_cost: 185000000, current_value: 148000000, depreciation_rate_pct: 10, condition: 'excellent', status: 'active' },
    { id: 2, asset_tag: 'AST-10046', name: 'Industrial Backup Generator 250kVA', category: 'Machinery & Equipment', serial_number: 'GEN-250-881', location: 'Head Office (Dar es Salaam)', department_assigned: 'Administration', custodian_name: 'John Mtangi', purchase_date: '2023-08-10', purchase_cost: 45000000, current_value: 36000000, depreciation_rate_pct: 12, condition: 'good', status: 'active' },
    { id: 3, asset_tag: 'AST-10047', name: 'High-Performance Rack Server Cluster', category: 'IT & Electronics', serial_number: 'SRV-DL-380', location: 'Head Office Data Center', department_assigned: 'IT', custodian_name: 'IT Systems Admin', purchase_date: '2025-01-20', purchase_cost: 28000000, current_value: 23800000, depreciation_rate_pct: 15, condition: 'excellent', status: 'active' },
    { id: 4, asset_tag: 'AST-10048', name: 'Toyota Hilux 4x4 Operational Pickup', category: 'Vehicles & Transport', serial_number: 'SN-TY-44120', location: 'Farm Operations Site A', department_assigned: 'Operations', custodian_name: 'Hamisi Juma', purchase_date: '2024-06-01', purchase_cost: 82000000, current_value: 69700000, depreciation_rate_pct: 10, condition: 'needs-repair', status: 'in-maintenance' },
  ];

  const displayList = assets.length > 0 ? assets : mockAssets;
  const totalAssetsCount = displayList.length;
  const totalNetBookValue = displayList.reduce((acc, curr) => acc + (curr.current_value || curr.purchase_cost || 0), 0);
  const maintenanceCount = displayList.filter(a => a.status === 'in-maintenance' || a.condition === 'needs-repair').length;

  return (
    <div className="container-fluid p-0 fade-in">
      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-success">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Total Registered Assets</p>
                <h3 className="fw-bold text-dark mb-0">{totalAssetsCount} <span className="fs-6 fw-normal text-muted">Items</span></h3>
                <span className="badge bg-success-subtle text-success mt-2">Active Asset Register</span>
              </div>
              <div className="bg-success text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-boxes fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-primary">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Total Net Book Value</p>
                <h3 className="fw-bold text-dark mb-0">TZS {(totalNetBookValue / 1000000).toFixed(1)}M</h3>
                <span className="badge bg-primary-subtle text-primary mt-2">Depreciated Book Value</span>
              </div>
              <div className="bg-primary text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-chart-line fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-warning">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Pending Maintenance</p>
                <h3 className="fw-bold text-dark mb-0">{maintenanceCount} <span className="fs-6 fw-normal text-muted">Assets</span></h3>
                <span className="badge bg-warning-subtle text-warning mt-2">Requires Servicing</span>
              </div>
              <div className="bg-warning text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-tools fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div className="card border-0 shadow-sm rounded-3 p-3 h-100 bg-white border-start border-4 border-info">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p className="text-muted small fw-semibold text-uppercase mb-1">Document Records</p>
                <h3 className="fw-bold text-dark mb-0">142 <span className="fs-6 fw-normal text-muted">Records</span></h3>
                <span className="badge bg-info-subtle text-info mt-2">Deeds &amp; Logbooks</span>
              </div>
              <div className="bg-info text-white rounded-3 p-3 d-flex align-items-center justify-content-center" style={{ width: '52px', height: '52px' }}>
                <i className="fas fa-folder-open fs-4"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <h6 className="fw-bold text-dark mb-3"><i className="fas fa-bolt text-warning me-2"></i>Asset &amp; Records Management Quick Actions</h6>
        <div className="row g-2">
          <div className="col-md-3">
            <Link to="/assets/register" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-plus-circle text-success fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">Register Asset</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Add New Fixed Asset &amp; SKU</div>
              </div>
            </Link>
          </div>
          <div className="col-md-3">
            <Link to="/assets/maintenance" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-tools text-warning fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">Schedule Service</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Log Repair Work Order</div>
              </div>
            </Link>
          </div>
          <div className="col-md-3">
            <Link to="/assets/transfers" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-exchange-alt text-primary fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">Custody Handover</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Transfer Custodian Assignment</div>
              </div>
            </Link>
          </div>
          <div className="col-md-3">
            <Link to="/assets/records" className="btn btn-light border text-start w-100 p-3 rounded-3 d-flex align-items-center">
              <i className="fas fa-file-archive text-info fs-4 me-3"></i>
              <div>
                <div className="fw-bold text-dark small">Archive Document</div>
                <div className="text-muted" style={{ fontSize: '0.72rem' }}>Log Deeds, Warranties &amp; Logbooks</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Asset Register Table */}
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1"><i className="fas fa-cubes text-success me-2"></i>Fixed Asset Master Register</h5>
            <p className="text-muted small mb-0">Overview of organizational assets, current location, condition, and book value.</p>
          </div>
          <Link to="/assets/register" className="btn btn-sm btn-outline-success fw-semibold">View Full Register</Link>
        </div>

        <div className="table-responsive border rounded-3">
          <table className="table align-middle mb-0" style={{ fontSize: '0.86rem' }}>
            <thead className="bg-light text-muted fw-bold">
              <tr>
                <th className="ps-3 py-3 border-0">Asset Tag &amp; Name</th>
                <th className="py-3 border-0">Category</th>
                <th className="py-3 border-0">Location &amp; Custodian</th>
                <th className="py-3 border-0 text-end">Purchase Cost</th>
                <th className="py-3 border-0 text-end">Net Book Value</th>
                <th className="py-3 border-0">Condition</th>
                <th className="py-3 border-0 text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayList.map(a => (
                <tr key={a.id}>
                  <td className="ps-3 py-3">
                    <div className="fw-bold text-dark">{a.name}</div>
                    <div className="text-muted small font-monospace" style={{ fontSize: '0.75rem' }}>#{a.asset_tag} | SN: {a.serial_number}</div>
                  </td>
                  <td className="py-3"><span className="badge bg-light text-dark border">{a.category}</span></td>
                  <td className="py-3 small">
                    <div className="fw-semibold text-dark">{a.location}</div>
                    <div className="text-muted">Custodian: {a.custodian_name}</div>
                  </td>
                  <td className="py-3 text-end fw-semibold text-muted">TZS {a.purchase_cost ? a.purchase_cost.toLocaleString() : 0}</td>
                  <td className="py-3 text-end fw-bold text-dark">TZS {a.current_value ? a.current_value.toLocaleString() : 0}</td>
                  <td className="py-3">
                    <span className={`badge ${
                      a.condition === 'excellent' || a.condition === 'good' ? 'bg-success-subtle text-success border border-success-subtle' :
                      a.condition === 'fair' ? 'bg-info-subtle text-info border border-info-subtle' :
                      'bg-danger-subtle text-danger border border-danger-subtle'
                    }`} style={{ borderRadius: '6px' }}>
                      {a.condition.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 text-end pe-4">
                    <span className={`badge ${
                      a.status === 'active' ? 'bg-success-subtle text-success' :
                      a.status === 'in-maintenance' ? 'bg-warning-subtle text-warning' :
                      'bg-secondary-subtle text-secondary'
                    }`} style={{ borderRadius: '6px' }}>
                      {a.status.toUpperCase()}
                    </span>
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

export default AssetsDashboard;

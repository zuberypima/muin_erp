import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { Link } from 'react-router-dom';

const LogisticsDashboard: React.FC = () => {
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, movRes, assetRes] = await Promise.all([
          api.get('/procurement/inventory/').catch(() => ({ data: [] })),
          api.get('/procurement/stock-movements/').catch(() => ({ data: [] })),
          api.get('/procurement/assets/').catch(() => ({ data: [] }))
        ]);
        setStockItems(invRes.data);
        setMovements(movRes.data);
        setAssets(assetRes.data);
      } catch (err) {
        console.error("Failed to fetch logistics data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lowStockCount = stockItems.filter(item => (item.quantity || 0) <= (item.reorder_level || 5)).length;
  const totalAssets = assets.length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-success"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 fade-in">
      {/* Header Banner */}
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1">Logistics &amp; Supply Operations</h4>
        <p className="text-muted small mb-0">Overview of inventory stock levels, warehouse movements, and enterprise assets.</p>
      </div>

      {/* KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-xl-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold">Total Stock Items</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{stockItems.length}</h3>
            </div>
            <div className="bg-success-subtle p-3 rounded-circle text-success">
              <i className="fas fa-boxes fa-lg"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold">Low Stock Alerts</span>
              <h3 className={`fw-bold mt-1 mb-0 ${lowStockCount > 0 ? 'text-danger' : 'text-dark'}`}>{lowStockCount}</h3>
            </div>
            <div className="bg-warning-subtle p-3 rounded-circle text-warning">
              <i className="fas fa-exclamation-triangle fa-lg"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold">Stock Movements</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{movements.length}</h3>
            </div>
            <div className="bg-info-subtle p-3 rounded-circle text-info">
              <i className="fas fa-exchange-alt fa-lg"></i>
            </div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small fw-semibold">Managed Assets</span>
              <h3 className="fw-bold text-dark mt-1 mb-0">{totalAssets}</h3>
            </div>
            <div className="bg-primary-subtle p-3 rounded-circle text-primary">
              <i className="fas fa-truck-loading fa-lg"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="row g-4">
        {/* Recent Stock Movements */}
        <div className="col-lg-7">
          <div className="bg-white border rounded-3 shadow-sm overflow-hidden">
            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark mb-0"><i className="fas fa-history me-2 text-success"></i>Recent Stock Movements</h6>
              <Link to="/logistics/stock-tracking" className="btn btn-sm btn-outline-success">View All</Link>
            </div>
            <div className="table-responsive">
              {movements.length === 0 ? (
                <div className="text-center py-4 text-muted small">No recent stock movements recorded.</div>
              ) : (
                <table className="table align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-3 border-0">Item</th>
                      <th className="border-0">Type</th>
                      <th className="border-0">Quantity</th>
                      <th className="border-0">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movements.slice(0, 5).map((m: any, idx: number) => (
                      <tr key={m.id || idx}>
                        <td className="ps-3 fw-semibold">{m.item_name || m.item || 'Inventory Item'}</td>
                        <td>
                          <span className={`badge ${m.movement_type === 'in' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                            {m.movement_type || 'Transfer'}
                          </span>
                        </td>
                        <td className="fw-bold">{m.quantity}</td>
                        <td className="text-muted small">{m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Today'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="col-lg-5">
          <div className="bg-white border rounded-3 shadow-sm p-3">
            <h6 className="fw-bold text-dark mb-3"><i className="fas fa-th me-2 text-success"></i>Logistics Shortcuts</h6>
            <div className="d-grid gap-2">
              <Link to="/logistics/inventory" className="btn btn-light text-start p-3 border d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-bold text-dark">Inventory &amp; Stock</div>
                  <div className="text-muted small">Manage warehouse stock items</div>
                </div>
                <i className="fas fa-boxes text-success fs-5"></i>
              </Link>
              <Link to="/logistics/stock-tracking" className="btn btn-light text-start p-3 border d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-bold text-dark">Stock Tracking &amp; Transfers</div>
                  <div className="text-muted small">Track item transfers and issues</div>
                </div>
                <i className="fas fa-exchange-alt text-info fs-5"></i>
              </Link>
              <Link to="/logistics/assets" className="btn btn-light text-start p-3 border d-flex align-items-center justify-content-between">
                <div>
                  <div className="fw-bold text-dark">Equipment &amp; Assets</div>
                  <div className="text-muted small">Manage company vehicles &amp; tools</div>
                </div>
                <i className="fas fa-truck text-primary fs-5"></i>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDashboard;

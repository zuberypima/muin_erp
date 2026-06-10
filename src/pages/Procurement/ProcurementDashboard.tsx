import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { fmtKES } from './currencyUtils';

interface KPI {
  pending_prs: number;
  pos_this_month: number;
  low_stock_items: number;
  total_asset_value: number;
  total_inventory_value: number;
  active_suppliers: number;
}

const ProcurementDashboard: React.FC = () => {
  const [kpi, setKpi] = useState<KPI>({
    pending_prs: 0,
    pos_this_month: 0,
    low_stock_items: 0,
    total_asset_value: 0,
    total_inventory_value: 0,
    active_suppliers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentPRs, setRecentPRs] = useState<any[]>([]);
  const [recentPOs, setRecentPOs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prRes, poRes, invRes, assetRes, supplierRes] = await Promise.all([
          api.get('/procurement/purchase-requests/?status=pending'),
          api.get('/procurement/purchase-orders/'),
          api.get('/procurement/inventory/report/'),
          api.get('/procurement/assets/report/'),
          api.get('/procurement/suppliers/?status=active'),
        ]);

        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        const posThisMonth = (poRes.data?.results ?? poRes.data ?? []).filter((po: any) => {
          const d = new Date(po.created_at);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        }).length;

        const allPRs = prRes.data?.results ?? prRes.data ?? [];
        const allPOs = poRes.data?.results ?? poRes.data ?? [];

        setKpi({
          pending_prs: allPRs.length,
          pos_this_month: posThisMonth,
          low_stock_items: invRes.data?.low_stock_count ?? 0,
          total_asset_value: invRes.data?.total_value ?? 0,
          total_inventory_value: invRes.data?.total_value ?? 0,
          active_suppliers: (supplierRes.data?.results ?? supplierRes.data ?? []).length,
        });

        const allInvAssets = assetRes.data;
        setKpi(prev => ({
          ...prev,
          total_asset_value: allInvAssets?.total_value ?? 0,
        }));

        setRecentPRs(allPRs.slice(0, 5));
        setRecentPOs(allPOs.slice(0, 5));
      } catch (err) {
        console.error('Dashboard fetch failed:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);


  const statusClass: Record<string, string> = {
    draft: 'badge-draft', pending: 'badge-pending', approved: 'badge-approved',
    rejected: 'badge-rejected', ordered: 'badge-ordered', sent: 'badge-sent',
    confirmed: 'badge-confirmed', delivered: 'badge-delivered', cancelled: 'badge-cancelled',
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div>
      {/* KPI Cards */}
      <div className="proc-kpi-grid">
        <div className="proc-kpi-card blue">
          <div className="proc-kpi-icon blue"><i className="fas fa-file-alt"></i></div>
          <div className="proc-kpi-value">{kpi.pending_prs}</div>
          <div className="proc-kpi-label">Pending Requests</div>
        </div>
        <div className="proc-kpi-card purple">
          <div className="proc-kpi-icon purple"><i className="fas fa-shopping-cart"></i></div>
          <div className="proc-kpi-value">{kpi.pos_this_month}</div>
          <div className="proc-kpi-label">POs This Month</div>
        </div>
        <div className="proc-kpi-card amber">
          <div className="proc-kpi-icon amber"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="proc-kpi-value">{kpi.low_stock_items}</div>
          <div className="proc-kpi-label">Low Stock Items</div>
        </div>
        <div className="proc-kpi-card green">
          <div className="proc-kpi-icon green"><i className="fas fa-boxes"></i></div>
          <div className="proc-kpi-value">{fmtKES(kpi.total_inventory_value)}</div>
          <div className="proc-kpi-label">Inventory Value</div>
        </div>
        <div className="proc-kpi-card purple">
          <div className="proc-kpi-icon purple"><i className="fas fa-laptop"></i></div>
          <div className="proc-kpi-value">{fmtKES(kpi.total_asset_value)}</div>
          <div className="proc-kpi-label">Asset Value</div>
        </div>
        <div className="proc-kpi-card green">
          <div className="proc-kpi-icon green"><i className="fas fa-truck"></i></div>
          <div className="proc-kpi-value">{kpi.active_suppliers}</div>
          <div className="proc-kpi-label">Active Suppliers</div>
        </div>
      </div>

      {/* Recent Tables */}
      <div className="proc-chart-container">
        {/* Recent Purchase Requests */}
        <div className="proc-card">
          <div className="proc-card-header">
            <h3><i className="fas fa-file-alt me-2 text-primary"></i>Recent Purchase Requests</h3>
          </div>
          <div className="proc-table-wrap">
            <table className="proc-table">
              <thead>
                <tr>
                  <th>PR #</th>
                  <th>Title</th>
                  <th>Dept</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPRs.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted py-3">No requests found</td></tr>
                ) : recentPRs.map(pr => (
                  <tr key={pr.id}>
                    <td><code style={{ fontSize: '0.75rem' }}>{pr.pr_number}</code></td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pr.title}</td>
                    <td style={{ fontSize: '0.78rem' }}>{pr.department}</td>
                    <td><span className={`proc-badge ${statusClass[pr.status] ?? ''}`}>{pr.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="proc-card">
          <div className="proc-card-header">
            <h3><i className="fas fa-shopping-cart me-2 text-primary"></i>Recent Purchase Orders</h3>
          </div>
          <div className="proc-table-wrap">
            <table className="proc-table">
              <thead>
                <tr>
                  <th>PO #</th>
                  <th>Supplier</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentPOs.length === 0 ? (
                  <tr><td colSpan={4} className="text-center text-muted py-3">No orders found</td></tr>
                ) : recentPOs.map(po => (
                  <tr key={po.id}>
                    <td><code style={{ fontSize: '0.75rem' }}>{po.po_number}</code></td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{po.supplier_name}</td>
                    <td>{fmtKES(Number(po.total_amount))}</td>
                    <td><span className={`proc-badge ${statusClass[po.status] ?? ''}`}>{po.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcurementDashboard;

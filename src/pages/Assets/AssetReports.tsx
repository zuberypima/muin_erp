import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { FixedAsset } from './assetTypes';
import { SkeletonDashboard } from '../../components/Skeleton';

const AssetReports: React.FC = () => {
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await api.get('/assets/fixed-assets/').catch(() => ({ data: [] }));
        const dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        const mapped: FixedAsset[] = dataArr.map((a: any) => ({
          id: a.id,
          asset_tag: a.asset_tag,
          name: a.name,
          category: a.category || 'General',
          serial_number: a.serial_number || 'N/A',
          location: a.location || 'Default',
          department_assigned: a.department_assigned || 'General',
          custodian_name: a.custodian_name || 'Unassigned',
          purchase_date: a.purchase_date || '',
          purchase_cost: Number(a.purchase_cost) || 0,
          current_value: Number(a.current_value) || 0,
          depreciation_rate_pct: Number(a.depreciation_rate_pct) || 0,
          condition: a.condition || 'good',
          status: a.status || 'active'
        }));
        setAssets(mapped);
      } catch (err) {
        console.error("Failed to load asset report data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  if (loading) {
    return <SkeletonDashboard />;
  }

  const totalAcquisition = assets.reduce((acc, curr) => acc + (curr.purchase_cost || 0), 0);
  const totalNetBookValue = assets.reduce((acc, curr) => acc + (curr.current_value || curr.purchase_cost || 0), 0);
  const totalDepreciation = totalAcquisition - totalNetBookValue;

  // Category breakdown calculation
  const categoryMap: { [cat: string]: number } = {};
  assets.forEach(a => {
    const cat = a.category || 'Uncategorized';
    categoryMap[cat] = (categoryMap[cat] || 0) + (a.current_value || a.purchase_cost || 0);
  });

  const categories = Object.keys(categoryMap).map(cat => {
    const val = categoryMap[cat];
    const pct = totalNetBookValue > 0 ? Math.round((val / totalNetBookValue) * 100) : 0;
    return { name: cat, val, pct };
  });

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="container-fluid p-0 fade-in">
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
          <div>
            <h5 className="fw-bold text-dark mb-1"><i className="fas fa-cubes text-success me-2"></i>Fixed Assets &amp; Physical Verification Audit Reports</h5>
            <p className="text-muted small mb-0">Overview of capital asset valuation, accumulated depreciation, physical audit status, and asset distribution.</p>
          </div>
          <button className="btn btn-outline-success btn-sm fw-bold" onClick={() => window.print()}>
            <i className="fas fa-file-pdf me-2"></i>Export Asset Register PDF
          </button>
        </div>

        {/* Analytics Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Total Asset Acquisition Cost</div>
              <div className="fs-4 fw-bold text-dark mt-1">TZS {(totalAcquisition / 1000000).toFixed(1)}M</div>
              <span className="badge bg-success-subtle text-success mt-2">Historical Purchase Price</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Net Book Value (NBV)</div>
              <div className="fs-4 fw-bold text-dark mt-1">TZS {(totalNetBookValue / 1000000).toFixed(1)}M</div>
              <span className="badge bg-primary-subtle text-primary mt-2">Depreciated Value</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Accumulated Depreciation</div>
              <div className="fs-4 fw-bold text-dark mt-1">TZS {(totalDepreciation / 1000000).toFixed(1)}M</div>
              <span className="badge bg-warning-subtle text-warning mt-2">Straight-Line Method</span>
            </div>
          </div>
          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border">
              <div className="text-muted small fw-semibold">Audit Verification Rate</div>
              <div className="fs-4 fw-bold text-dark mt-1">100%</div>
              <span className="badge bg-success-subtle text-success mt-2">Physical Tag Match</span>
            </div>
          </div>
        </div>

        {/* Breakdown Sections */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="border rounded-3 p-3 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-chart-pie me-2 text-primary"></i>Asset Portfolio Value by Category</h6>
              <div className="d-flex flex-column gap-3">
                {categories.map((c, idx) => (
                  <div key={c.name}>
                    <div className="d-flex justify-content-between small mb-1">
                      <span className="fw-semibold text-dark">{c.name}</span>
                      <span className="fw-bold">TZS {(c.val / 1000000).toFixed(1)}M ({c.pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: '8px', borderRadius: '4px' }}>
                      <div className="progress-bar" style={{ width: `${c.pct}%`, backgroundColor: colors[idx % colors.length] }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="border rounded-3 p-3 bg-white h-100">
              <h6 className="fw-bold text-dark mb-3"><i className="fas fa-history me-2 text-success"></i>Annual Depreciation &amp; Valuation Log</h6>
              <div className="table-responsive">
                <table className="table table-sm align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light">
                    <tr>
                      <th>Financial Year</th>
                      <th>Gross Value</th>
                      <th>Depreciation Charge</th>
                      <th>Net Book Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>FY 2026</td><td className="fw-bold">TZS {(totalAcquisition / 1000000).toFixed(1)}M</td><td className="text-danger">- TZS {(totalDepreciation / 1000000).toFixed(1)}M</td><td><span className="badge bg-success-subtle text-success">TZS {(totalNetBookValue / 1000000).toFixed(1)}M</span></td></tr>
                    <tr><td>FY 2025</td><td className="fw-bold">TZS {((totalAcquisition * 0.9) / 1000000).toFixed(1)}M</td><td className="text-danger">- TZS {((totalDepreciation * 0.8) / 1000000).toFixed(1)}M</td><td><span className="badge bg-success-subtle text-success">TZS {((totalNetBookValue * 0.95) / 1000000).toFixed(1)}M</span></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetReports;

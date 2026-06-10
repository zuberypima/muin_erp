import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import { fmtKES } from './currencyUtils';

interface InvReport {
  total_items: number;
  total_value: number;
  low_stock_count: number;
  by_category: { category: string; count: number; value: number }[];
}

interface AssetReport {
  total_assets: number;
  total_value: number;
  by_status: { status: string; count: number }[];
  by_category: { category: string; count: number; value: number }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  raw_material: 'Raw Material', finished_good: 'Finished Good',
  consumable: 'Consumable', spare_part: 'Spare Part',
  office_supply: 'Office Supply', packaging: 'Packaging',
  it_equipment: 'IT Equipment', furniture: 'Furniture',
  machinery: 'Machinery', vehicle: 'Vehicle',
  land_building: 'Land & Building', tools: 'Tools',
  other: 'Other',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#10b981', maintenance: '#f59e0b',
  disposed: '#94a3b8', transferred: '#6366f1',
};

const CATEGORY_COLORS = ['#0ea5e9','#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4'];

// Simple SVG horizontal bar chart
const HBarChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  maxValue: number;
  formatValue?: (v: number) => string;
}> = ({ data, maxValue, formatValue }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 500 }}>{d.label}</span>
            <span style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: 600 }}>
              {formatValue ? formatValue(d.value) : d.value}
            </span>
          </div>
          <div style={{ height: 8, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${maxValue > 0 ? (d.value / maxValue) * 100 : 0}%`,
              background: d.color,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// Donut chart via SVG
const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0);
  if (total === 0) return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No data</p>;

  const size = 160;
  const radius = 60;
  const cx = size / 2;
  const cy = size / 2;
  let cumulative = 0;

  const slices = data.map(d => {
    const pct = d.value / total;
    const startAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    cumulative += pct;
    const endAngle = cumulative * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const largeArc = pct > 0.5 ? 1 : 0;
    return { ...d, pct, x1, y1, x2, y2, largeArc, startAngle, endAngle };
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s, i) => (
          <path key={i}
            d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${radius} ${radius} 0 ${s.largeArc} 1 ${s.x2} ${s.y2} Z`}
            fill={s.color} opacity={0.85}
          />
        ))}
        <circle cx={cx} cy={cy} r={38} fill="white" />
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontSize: 14, fontWeight: 700, fill: '#1e293b' }}>{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontSize: 10, fill: '#94a3b8' }}>Total</text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#475569', flex: 1 }}>{d.label}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#1e293b' }}>{d.value}</span>
            <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>({((d.value / total) * 100).toFixed(0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const InventoryReports: React.FC = () => {
  const [invReport, setInvReport] = useState<InvReport | null>(null);
  const [assetReport, setAssetReport] = useState<AssetReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [invRes, assetRes] = await Promise.all([
          api.get('/procurement/inventory/report/'),
          api.get('/procurement/assets/report/'),
        ]);
        setInvReport(invRes.data);
        setAssetReport(assetRes.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchReports();
  }, []);


  if (loading) {
    return <div className="proc-empty"><div className="spinner-border text-primary" /></div>;
  }

  const invCategoryData = (invReport?.by_category ?? []).map((c, i) => ({
    label: CATEGORY_LABELS[c.category] ?? c.category,
    value: c.count,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const invCategoryValueData = (invReport?.by_category ?? []).map((c, i) => ({
    label: CATEGORY_LABELS[c.category] ?? c.category,
    value: c.value ?? 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const assetStatusData = (assetReport?.by_status ?? []).map(s => ({
    label: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
    color: STATUS_COLORS[s.status] ?? '#94a3b8',
  }));

  const assetCategoryData = (assetReport?.by_category ?? []).map((c, i) => ({
    label: CATEGORY_LABELS[c.category] ?? c.category,
    value: c.value ?? 0,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));

  const maxInvValue = Math.max(...invCategoryValueData.map(d => d.value), 1);
  const maxAssetValue = Math.max(...assetCategoryData.map(d => d.value), 1);

  return (
    <div>
      {/* Summary KPIs */}
      <div className="proc-kpi-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="proc-kpi-card blue">
          <div className="proc-kpi-icon blue"><i className="fas fa-boxes"></i></div>
          <div className="proc-kpi-value">{invReport?.total_items ?? 0}</div>
          <div className="proc-kpi-label">Inventory Items</div>
        </div>
        <div className="proc-kpi-card green">
          <div className="proc-kpi-icon green"><i className="fas fa-dollar-sign"></i></div>
          <div className="proc-kpi-value">{fmtKES(invReport?.total_value ?? 0)}</div>
          <div className="proc-kpi-label">Inventory Value</div>
        </div>
        <div className="proc-kpi-card red">
          <div className="proc-kpi-icon red"><i className="fas fa-exclamation-triangle"></i></div>
          <div className="proc-kpi-value">{invReport?.low_stock_count ?? 0}</div>
          <div className="proc-kpi-label">Low / Out of Stock</div>
        </div>
        <div className="proc-kpi-card purple">
          <div className="proc-kpi-icon purple"><i className="fas fa-laptop"></i></div>
          <div className="proc-kpi-value">{assetReport?.total_assets ?? 0}</div>
          <div className="proc-kpi-label">Total Assets</div>
        </div>
        <div className="proc-kpi-card amber">
          <div className="proc-kpi-icon amber"><i className="fas fa-coins"></i></div>
          <div className="proc-kpi-value">{fmtKES(assetReport?.total_value ?? 0)}</div>
          <div className="proc-kpi-label">Asset Value</div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="proc-chart-container">
        <div className="proc-chart-card">
          <h4><i className="fas fa-chart-pie me-2 text-primary"></i>Inventory by Category (Items)</h4>
          {invCategoryData.length > 0
            ? <DonutChart data={invCategoryData} />
            : <div className="proc-empty"><i className="fas fa-inbox"></i><p>No data</p></div>}
        </div>
        <div className="proc-chart-card">
          <h4><i className="fas fa-chart-pie me-2" style={{ color: '#6366f1' }}></i>Assets by Status</h4>
          {assetStatusData.length > 0
            ? <DonutChart data={assetStatusData} />
            : <div className="proc-empty"><i className="fas fa-inbox"></i><p>No data</p></div>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="proc-chart-container">
        <div className="proc-chart-card">
          <h4><i className="fas fa-chart-bar me-2" style={{ color: '#10b981' }}></i>Inventory Value by Category</h4>
          {invCategoryValueData.length > 0
            ? <HBarChart data={invCategoryValueData} maxValue={maxInvValue} formatValue={v => fmtKES(v)} />
            : <div className="proc-empty"><i className="fas fa-inbox"></i><p>No data</p></div>}
        </div>
        <div className="proc-chart-card">
          <h4><i className="fas fa-chart-bar me-2" style={{ color: '#f59e0b' }}></i>Asset Value by Category</h4>
          {assetCategoryData.length > 0
            ? <HBarChart data={assetCategoryData} maxValue={maxAssetValue} formatValue={v => fmtKES(v)} />
            : <div className="proc-empty"><i className="fas fa-inbox"></i><p>No data</p></div>}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="proc-card" style={{ marginBottom: '1.5rem' }}>
        <div className="proc-card-header">
          <h3><i className="fas fa-table me-2 text-primary"></i>Inventory Category Summary</h3>
        </div>
        <div className="proc-table-wrap">
          <table className="proc-table">
            <thead>
              <tr><th>Category</th><th>Items Count</th><th>Unit Cost Total (TZS)</th></tr>
            </thead>
            <tbody>
              {(invReport?.by_category ?? []).length === 0 ? (
                <tr><td colSpan={3} className="text-center text-muted py-3">No data</td></tr>
              ) : invReport!.by_category.map((c, i) => (
                <tr key={i}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {CATEGORY_LABELS[c.category] ?? c.category}
                  </td>
                  <td>{c.count}</td>
                  <td>{c.value != null ? `TZS ${Number(c.value).toLocaleString('sw-TZ')}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Table */}
      <div className="proc-card">
        <div className="proc-card-header">
          <h3><i className="fas fa-table me-2" style={{ color: '#6366f1' }}></i>Asset Category Summary</h3>
        </div>
        <div className="proc-table-wrap">
          <table className="proc-table">
            <thead>
              <tr><th>Category</th><th>Count</th><th>Total Value (TZS)</th></tr>
            </thead>
            <tbody>
              {(assetReport?.by_category ?? []).length === 0 ? (
                <tr><td colSpan={3} className="text-center text-muted py-3">No data</td></tr>
              ) : assetReport!.by_category.map((c, i) => (
                <tr key={i}>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    {CATEGORY_LABELS[c.category] ?? c.category}
                  </td>
                  <td>{c.count}</td>
                  <td>{c.value != null ? `KES ${Number(c.value).toLocaleString()}` : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;

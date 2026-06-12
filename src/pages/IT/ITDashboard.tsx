import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';
import {
  ITAsset, UserAccount, SupportTicket, MaintenanceRecord, SoftwareLicense,
  formatDate, formatDateTime,
} from './itTypes';

const ITDashboard: React.FC = () => {
  const [assets, setAssets] = useState<ITAsset[]>([]);
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [licenses, setLicenses] = useState<SoftwareLicense[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [assRes, accRes, tktsRes, licRes, mainRes] = await Promise.all([
          api.get('/it/assets/'),
          api.get('/it/users/'),
          api.get('/it/tickets/'),
          api.get('/it/licenses/'),
          api.get('/it/maintenance/')
        ]);
        setAssets(assRes.data);
        setAccounts(accRes.data);
        setTickets(tktsRes.data);
        setLicenses(licRes.data);
        setMaintenance(mainRes.data);
      } catch (err) {
        console.error('Failed to load IT Dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // ── KPI derivations ──────────────────────────────────────────
  const totalAssets    = assets.length;
  const activeAssets   = assets.filter(a => a.status === 'active').length;
  const inRepair       = assets.filter(a => a.status === 'in-repair').length;

  const activeAccounts = accounts.filter(a => a.status === 'active').length;
  const suspended      = accounts.filter(a => a.status === 'suspended').length;

  const openTickets    = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const criticalTkts   = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;

  const expiringSoon   = licenses.filter(l => l.status === 'expiring-soon').length;
  const expiredLics    = licenses.filter(l => l.status === 'expired').length;

  const scheduledMaint = maintenance.filter(m => m.status === 'scheduled' || m.status === 'in-progress').length;

  const kpis = [
    { label: 'Total IT Assets',      value: totalAssets,    sub: `${activeAssets} active · ${inRepair} in repair`, icon: 'fas fa-laptop',       color: 'blue'   },
    { label: 'User Accounts',        value: activeAccounts, sub: `${suspended} suspended`,                          icon: 'fas fa-user-shield',  color: 'indigo' },
    { label: 'Open Tickets',         value: openTickets,    sub: criticalTkts > 0 ? `${criticalTkts} critical` : 'All stable', icon: 'fas fa-headset', color: criticalTkts > 0 ? 'red' : 'amber' },
    { label: 'Licenses Expiring',    value: expiringSoon,   sub: `${expiredLics} already expired`,                  icon: 'fas fa-key',          color: expiringSoon > 0 ? 'amber' : 'emerald' },
    { label: 'Pending Maintenance',  value: scheduledMaint, sub: 'Scheduled or in progress',                        icon: 'fas fa-tools',        color: 'purple' },
  ];

  // ── Recent tickets ────────────────────────────────────────────
  const recentTickets = [...tickets].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  // ── Asset condition summary ───────────────────────────────────
  const conditionMap: Record<string, number> = {};
  assets.forEach(a => { conditionMap[a.condition] = (conditionMap[a.condition] || 0) + 1; });

  return (
    <div className="container-fluid p-0">

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map(k => (
          <div key={k.label} className="col-6 col-md-4 col-lg">
            <div className="it-card h-100">
              <div className="d-flex align-items-start gap-3">
                <div className={`it-icon-box ${k.color}`}>
                  <i className={k.icon}></i>
                </div>
                <div>
                  <p className="text-muted small mb-1" style={{ fontSize: '0.78rem' }}>{k.label}</p>
                  <h3 className="fw-bold mb-0" style={{ fontSize: '1.8rem', lineHeight: 1 }}>{k.value}</h3>
                  <p className="text-muted mb-0" style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>{k.sub}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Recent Support Tickets */}
        <div className="col-lg-7">
          <div className="it-table-card">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0"><i className="fas fa-headset me-2 text-primary" style={{ color: '#2563eb' }}></i>Recent Help Desk Tickets</h5>
              <Link to="/it/support-tickets" className="small text-decoration-none" style={{ color: '#2563eb' }}>View all →</Link>
            </div>
            <div className="table-responsive">
              <table className="table it-table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTickets.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-muted py-4">No recent tickets.</td></tr>
                  ) : recentTickets.map(t => (
                    <tr key={t.id}>
                      <td>
                        <div className="fw-medium" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                        <div className="small text-muted">{t.raised_by}</div>
                      </td>
                      <td><span className="it-category-pill text-capitalize">{t.category}</span></td>
                      <td><span className={`it-badge ${t.priority}`}>{t.priority}</span></td>
                      <td><span className={`it-badge ${t.status}`}>{t.status.replace('-', ' ')}</span></td>
                      <td className="small text-muted">{formatDateTime(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="col-lg-5 d-flex flex-column gap-4">

          {/* Asset Summary */}
          <div className="it-table-card">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0"><i className="fas fa-laptop me-2" style={{ color: '#2563eb' }}></i>Asset Health</h5>
              <Link to="/it/assets" className="small text-decoration-none" style={{ color: '#2563eb' }}>Manage →</Link>
            </div>
            <div className="p-4">
              {Object.keys(conditionMap).length === 0 ? (
                <div className="text-center text-muted">No assets found.</div>
              ) : Object.entries(conditionMap).map(([cond, cnt]) => (
                <div key={cond} className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-capitalize small fw-medium">{cond}</span>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{ width: '100px', height: '6px', borderRadius: '99px', background: '#e2e8f0', overflow: 'hidden' }}>
                      <div style={{
                        width: `${(cnt / totalAssets) * 100}%`,
                        height: '100%', borderRadius: '99px',
                        background: cond === 'excellent' ? '#10b981' : cond === 'good' ? '#2563eb' : cond === 'fair' ? '#f59e0b' : '#ef4444'
                      }} />
                    </div>
                    <span className="small fw-semibold text-muted">{cnt}</span>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-top d-flex justify-content-between">
                {[
                  { label: 'Active', count: activeAssets, color: '#10b981' },
                  { label: 'In Repair', count: inRepair, color: '#2563eb' },
                  { label: 'Decommissioned', count: assets.filter(a => a.status === 'decommissioned').length, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="fw-bold" style={{ color: s.color, fontSize: '1.2rem' }}>{s.count}</div>
                    <div className="small text-muted">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expiring Licenses */}
          <div className="it-table-card">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0"><i className="fas fa-key me-2" style={{ color: '#ea580c' }}></i>License Alerts</h5>
              <Link to="/it/software-licenses" className="small text-decoration-none" style={{ color: '#2563eb' }}>View all →</Link>
            </div>
            <div className="p-3">
              {licenses.filter(l => l.status !== 'active').length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="fas fa-check-circle fa-2x d-block mb-2" style={{ color: '#10b981' }}></i>
                  All licenses are current
                </div>
              ) : (
                licenses.filter(l => l.status !== 'active').map(l => (
                  <div key={l.id} className="d-flex align-items-center gap-3 py-2 border-bottom" style={{ borderColor: '#f1f5f9' }}>
                    <div className={`it-icon-box ${l.status === 'expired' ? 'red' : 'amber'}`} style={{ width: '36px', height: '36px', borderRadius: '10px', fontSize: '1rem' }}>
                      <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <div className="flex-grow-1">
                      <div className="fw-medium small">{l.software_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Expires: {formatDate(l.expiry_date)}</div>
                    </div>
                    <span className={`it-badge ${l.status}`}>{l.status.replace('-', ' ')}</span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Upcoming Maintenance */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="it-table-card">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0"><i className="fas fa-tools me-2" style={{ color: '#7c3aed' }}></i>Upcoming Maintenance</h5>
              <Link to="/it/maintenance" className="small text-decoration-none" style={{ color: '#2563eb' }}>View all →</Link>
            </div>
            <div className="table-responsive">
              <table className="table it-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Performed By</th>
                    <th>Scheduled Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.filter(m => m.status !== 'completed').length === 0 ? (
                     <tr><td colSpan={5} className="text-center text-muted py-4">No upcoming maintenance.</td></tr>
                  ) : maintenance.filter(m => m.status !== 'completed').map(m => (
                    <tr key={m.id}>
                      <td><div className="fw-medium">{m.asset_name}</div></td>
                      <td><span className="it-category-pill text-capitalize">{m.type}</span></td>
                      <td className="text-muted small">{m.performed_by}</td>
                      <td className="text-muted small">{formatDate(m.scheduled_date)}</td>
                      <td><span className={`it-badge ${m.status}`}>{m.status.replace('-', ' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ITDashboard;

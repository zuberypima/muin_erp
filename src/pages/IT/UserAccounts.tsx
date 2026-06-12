import React, { useState } from 'react';
import {
  UserAccount, AccountStatus, AccountRole,
  demoAccounts, formatDateTime, DEPARTMENTS, SYSTEMS,
} from './itTypes';

const ROLES: AccountRole[] = ['Super Admin', 'Admin', 'Manager', 'Staff', 'Viewer'];

const emptyAccount = (): Partial<UserAccount> => ({
  username: '', fullName: '', email: '', role: 'Staff', department: 'IT',
  systemAccess: [], status: 'active', mfaEnabled: false,
  createdAt: new Date().toISOString().split('T')[0], lastLogin: '',
});

const UserAccounts: React.FC = () => {
  const [accounts, setAccounts]     = useState<UserAccount[]>(demoAccounts);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<UserAccount | null>(null);
  const [form, setForm]             = useState<Partial<UserAccount>>(emptyAccount());

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    const matchQ    = !q || a.fullName.toLowerCase().includes(q) || a.username.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.department.toLowerCase().includes(q);
    const matchStat = filterStatus === 'all' || a.status === filterStatus;
    const matchRole = filterRole   === 'all' || a.role   === filterRole;
    return matchQ && matchStat && matchRole;
  });

  const openAdd  = () => { setEditing(null); setForm(emptyAccount()); setShowModal(true); };
  const openEdit = (a: UserAccount) => { setEditing(a); setForm({ ...a }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = () => {
    if (!form.username || !form.fullName || !form.email) return;
    if (editing) {
      setAccounts(prev => prev.map(a => a.id === editing.id ? { ...editing, ...form } as UserAccount : a));
    } else {
      const newAcc: UserAccount = {
        ...form as UserAccount,
        id: `USR-${String(accounts.length + 1).padStart(3, '0')}`,
        systemAccess: form.systemAccess || [],
        lastLogin: '',
      };
      setAccounts(prev => [newAcc, ...prev]);
    }
    closeModal();
  };

  const toggleStatus = (id: string) => {
    setAccounts(prev => prev.map(a => {
      if (a.id !== id) return a;
      const next: AccountStatus = a.status === 'active' ? 'suspended' : 'active';
      return { ...a, status: next };
    }));
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this user account?')) setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const toggleAccess = (sys: string) => {
    const current = form.systemAccess || [];
    setForm(prev => ({
      ...prev,
      systemAccess: current.includes(sys) ? current.filter(s => s !== sys) : [...current, sys],
    }));
  };

  const f = (field: keyof UserAccount) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = field === 'mfaEnabled' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
  };

  const roleBadgeColor: Record<AccountRole, string> = {
    'Super Admin': 'red', Admin: 'indigo', Manager: 'blue', Staff: 'emerald', Viewer: 'amber',
  };

  const activeCount   = accounts.filter(a => a.status === 'active').length;
  const suspended     = accounts.filter(a => a.status === 'suspended').length;
  const mfaCount      = accounts.filter(a => a.mfaEnabled).length;

  return (
    <div>
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Total Accounts', value: accounts.length, color: '#2563eb' },
          { label: 'Active',         value: activeCount,     color: '#10b981' },
          { label: 'Suspended',      value: suspended,       color: '#ef4444' },
          { label: 'MFA Enabled',    value: mfaCount,        color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="col-6 col-lg-3">
            <div className="it-card py-3 text-center">
              <div className="fw-bold mb-0" style={{ fontSize: '1.4rem', color: s.color }}>{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="it-filter-bar">
        <i className="fas fa-search text-muted"></i>
        <input className="it-search-input" placeholder="Search accounts…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="it-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="it-filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <button className="btn-it-primary ms-auto" onClick={openAdd}>
          <i className="fas fa-plus me-1"></i>New Account
        </button>
      </div>

      {/* Table */}
      <div className="it-table-card">
        <div className="table-responsive">
          <table className="table it-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Department</th>
                <th>System Access</th>
                <th>MFA</th>
                <th>Last Login</th>
                <th>Status</th>
                <th style={{ width: 110 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-5">
                  <i className="fas fa-user-slash fa-2x d-block mb-2" style={{ color: '#cbd5e1' }}></i>No accounts found.
                </td></tr>
              ) : filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="it-asset-icon" style={{ borderRadius: '50%', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
                        {a.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-medium">{a.fullName}</div>
                        <div className="small text-muted">{a.username}</div>
                        <div className="small text-muted">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`it-badge ${roleBadgeColor[a.role]}`} style={{ background: 'transparent', border: '1.5px solid currentColor' }}>
                      {a.role}
                    </span>
                  </td>
                  <td className="small">{a.department}</td>
                  <td>
                    <div className="d-flex flex-wrap gap-1" style={{ maxWidth: '180px' }}>
                      {a.systemAccess.slice(0, 3).map(s => (
                        <span key={s} className="it-category-pill" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>{s}</span>
                      ))}
                      {a.systemAccess.length > 3 && <span className="small text-muted">+{a.systemAccess.length - 3}</span>}
                    </div>
                  </td>
                  <td>
                    {a.mfaEnabled
                      ? <span className="it-badge active"><i className="fas fa-shield-alt"></i> On</span>
                      : <span className="it-badge suspended"><i className="fas fa-shield"></i> Off</span>}
                  </td>
                  <td className="small text-muted">{a.lastLogin ? formatDateTime(a.lastLogin) : 'Never'}</td>
                  <td><span className={`it-badge ${a.status}`}>{a.status}</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light border" title={a.status === 'active' ? 'Suspend' : 'Activate'} onClick={() => toggleStatus(a.id)}>
                        <i className={`fas fa-${a.status === 'active' ? 'ban' : 'check-circle'}`} style={{ color: a.status === 'active' ? '#f59e0b' : '#10b981' }}></i>
                      </button>
                      <button className="btn btn-sm btn-light border" title="Edit" onClick={() => openEdit(a)}><i className="fas fa-edit text-primary"></i></button>
                      <button className="btn btn-sm btn-light border" title="Delete" onClick={() => handleDelete(a.id)}><i className="fas fa-trash text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block it-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Account' : 'Create User Account'}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body row g-3 px-4 py-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Full Name *</label>
                  <input className="form-control" value={form.fullName || ''} onChange={f('fullName')} placeholder="e.g. Grace Mwangi" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Username *</label>
                  <input className="form-control" value={form.username || ''} onChange={f('username')} placeholder="e.g. grace.mwangi" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email *</label>
                  <input type="email" className="form-control" value={form.email || ''} onChange={f('email')} placeholder="grace.m@muini.co.tz" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Department</label>
                  <select className="form-select" value={form.department} onChange={f('department')}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Role</label>
                  <select className="form-select" value={form.role} onChange={f('role')}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={f('status')}>
                    {(['active', 'suspended', 'inactive'] as AccountStatus[]).map(s =>
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    )}
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">System Access</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {SYSTEMS.map(sys => (
                      <div key={sys}
                        className="it-category-pill"
                        style={{
                          cursor: 'pointer',
                          background: (form.systemAccess || []).includes(sys) ? '#eff6ff' : '#f1f5f9',
                          color: (form.systemAccess || []).includes(sys) ? '#2563eb' : '#475569',
                          border: (form.systemAccess || []).includes(sys) ? '1.5px solid #bfdbfe' : '1.5px solid transparent',
                          userSelect: 'none',
                        }}
                        onClick={() => toggleAccess(sys)}
                      >
                        {(form.systemAccess || []).includes(sys) && <i className="fas fa-check me-1"></i>}
                        {sys}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-12">
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" id="mfaSwitch"
                      checked={form.mfaEnabled || false}
                      onChange={f('mfaEnabled')} />
                    <label className="form-check-label small fw-semibold" htmlFor="mfaSwitch">
                      Enable Multi-Factor Authentication (MFA)
                    </label>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-it-outline" onClick={closeModal}>Cancel</button>
                <button className="btn-it-primary" onClick={handleSave}>
                  {editing ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccounts;

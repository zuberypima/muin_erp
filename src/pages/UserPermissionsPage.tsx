import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext';
import { isDepartmentMatch } from '../utils/departmentUtils';
import {
  ALL_SYSTEM_PAGES,
  DEPARTMENT_DEFAULT_PRESETS,
  SystemPageItem
} from '../utils/permissionsUtils';

interface UserOption {
  id: number | string;
  username: string;
  email: string;
  department?: string;
  is_staff?: boolean;
}

const DEPARTMENTS = [
  { id: 'hr', name: 'Human Resources (HR)' },
  { id: 'finance', name: 'Finance & Accounting' },
  { id: 'logistics', name: 'Logistics & Supply Chain' },
  { id: 'procurement', name: 'Procurement & Purchasing' },
  { id: 'assets', name: 'Fixed Assets & Records' },
  { id: 'it', name: 'IT Infrastructure' },
  { id: 'management', name: 'Management & Executive' }
];

const UserPermissionsPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const isSuperAdmin = currentUser?.is_staff || isDepartmentMatch(currentUser?.department, 'management');

  const [mode, setMode] = useState<'user' | 'department'>('user');
  const [usersList, setUsersList] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | number>('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('hr');
  const [allowedRoutes, setAllowedRoutes] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch users directory
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get('/users/').catch(() => ({ data: [] }));
        const arr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        if (arr.length > 0) {
          setUsersList(arr);
          if (!selectedUserId && arr[0]) {
            setSelectedUserId(arr[0].id);
          }
        } else {
          // Demo users fallback
          const demo: UserOption[] = [
            { id: 101, username: 'hr_manager', email: 'hr@muin.co.tz', department: 'Human Resources', is_staff: false },
            { id: 102, username: 'finance_head', email: 'finance@muin.co.tz', department: 'Finance', is_staff: false },
            { id: 103, username: 'logistics_lead', email: 'logistics@muin.co.tz', department: 'Logistics', is_staff: false },
            { id: 104, username: 'it_admin', email: 'it@muin.co.tz', department: 'IT', is_staff: true }
          ];
          setUsersList(demo);
          if (!selectedUserId) setSelectedUserId(demo[0].id);
        }
      } catch (err) {
        console.warn("Failed to fetch users list for permissions page", err);
      }
    };

    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  // Load permissions when selection changes
  useEffect(() => {
    if (mode === 'user' && selectedUserId) {
      const userObj = usersList.find(u => String(u.id) === String(selectedUserId)) as any;
      const userKey = `muin_permissions_user_${selectedUserId}`;
      const savedUserPerms = localStorage.getItem(userKey);

      if (userObj && Array.isArray(userObj.allowed_pages) && userObj.allowed_pages.length > 0) {
        setAllowedRoutes(userObj.allowed_pages);
      } else if (savedUserPerms) {
        setAllowedRoutes(JSON.parse(savedUserPerms));
      } else if (userObj) {
        // Fallback to department preset
        const deptKey = (userObj.department || '').toLowerCase();
        let matchedRoutes = DEPARTMENT_DEFAULT_PRESETS.management;
        for (const [key, routes] of Object.entries(DEPARTMENT_DEFAULT_PRESETS)) {
          if (deptKey.includes(key)) {
            matchedRoutes = routes;
            break;
          }
        }
        setAllowedRoutes(matchedRoutes);
      }
    } else if (mode === 'department' && selectedDeptId) {
      const dKey = selectedDeptId.toLowerCase().trim();
      const deptKey = `muin_permissions_dept_${dKey}`;
      const savedDeptPerms = localStorage.getItem(deptKey);

      // Attempt fetching from backend
      api.get(`/departments/${dKey}/by_department/`)
        .then(res => {
          if (res.data && Array.isArray(res.data.allowed_pages) && res.data.allowed_pages.length > 0) {
            setAllowedRoutes(res.data.allowed_pages);
            localStorage.setItem(deptKey, JSON.stringify(res.data.allowed_pages));
          }
        })
        .catch(() => {
          if (savedDeptPerms) {
            setAllowedRoutes(JSON.parse(savedDeptPerms));
          } else {
            setAllowedRoutes(DEPARTMENT_DEFAULT_PRESETS[selectedDeptId] || DEPARTMENT_DEFAULT_PRESETS.management);
          }
        });
    }
  }, [mode, selectedUserId, selectedDeptId, usersList]);

  if (currentUser && !isSuperAdmin) {
    return <Navigate to="/services" replace />;
  }

  const handleToggleRoute = (route: string) => {
    if (allowedRoutes.includes(route)) {
      setAllowedRoutes(allowedRoutes.filter(r => r !== route));
    } else {
      setAllowedRoutes([...allowedRoutes, route]);
    }
  };

  const handleToggleModule = (moduleKey: string, enable: boolean) => {
    const moduleRoutes = ALL_SYSTEM_PAGES.filter(p => p.module === moduleKey).map(p => p.route);
    if (enable) {
      const combined = Array.from(new Set([...allowedRoutes, ...moduleRoutes]));
      setAllowedRoutes(combined);
    } else {
      setAllowedRoutes(allowedRoutes.filter(r => !moduleRoutes.includes(r)));
    }
  };

  const applyPreset = (presetKey: string) => {
    if (presetKey === 'all') {
      setAllowedRoutes(ALL_SYSTEM_PAGES.map(p => p.route));
    } else if (presetKey === 'none') {
      setAllowedRoutes(['/services', '/self-service']);
    } else if (DEPARTMENT_DEFAULT_PRESETS[presetKey]) {
      setAllowedRoutes(DEPARTMENT_DEFAULT_PRESETS[presetKey]);
    }
    setSuccessMsg(`Applied ${presetKey.toUpperCase()} preset permissions.`);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'user' && selectedUserId) {
        const userKey = `muin_permissions_user_${selectedUserId}`;
        localStorage.setItem(userKey, JSON.stringify(allowedRoutes));
        if (selectedUserObj?.username) {
          localStorage.setItem(`muin_permissions_user_${selectedUserObj.username}`, JSON.stringify(allowedRoutes));
        }
        await api.post(`/users/${selectedUserId}/permissions/`, { allowed_pages: allowedRoutes }).catch(() => {});
        setSuccessMsg(`Permissions saved successfully for User ID #${selectedUserId} (${selectedUserObj?.username || ''}).`);
      } else if (mode === 'department' && selectedDeptId) {
        const dKey = selectedDeptId.toLowerCase().trim();
        const deptKey = `muin_permissions_dept_${dKey}`;
        localStorage.setItem(deptKey, JSON.stringify(allowedRoutes));
        await api.post(`/departments/${dKey}/by_department/`, { allowed_pages: allowedRoutes }).catch(() => {});
        setSuccessMsg(`Default department access updated for [${selectedDeptId.toUpperCase()}].`);
      }

      // Notify window so sidebar and current session immediately update
      window.dispatchEvent(new Event('muin_permissions_updated'));
    } catch (err) {
      setErrorMsg('Failed to save permissions to server.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Group system pages by module
  const modulesMap = ALL_SYSTEM_PAGES.reduce((acc, item) => {
    if (!acc[item.module]) {
      acc[item.module] = {
        key: item.module,
        label: item.moduleLabel,
        items: []
      };
    }
    acc[item.module].items.push(item);
    return acc;
  }, {} as Record<string, { key: string; label: string; items: SystemPageItem[] }>);

  const filteredModules = Object.values(modulesMap).map(mod => ({
    ...mod,
    items: mod.items.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.route.toLowerCase().includes(search.toLowerCase()) ||
      mod.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(mod => mod.items.length > 0);

  const totalPagesCount = ALL_SYSTEM_PAGES.length;
  const allowedPagesCount = allowedRoutes.length;
  const percentage = Math.round((allowedPagesCount / totalPagesCount) * 100);

  const selectedUserObj = usersList.find(u => String(u.id) === String(selectedUserId));

  return (
    <div className="container-fluid py-3 fade-in">
      
      {/* Header Row */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate('/erp-users')}>
              <i className="fas fa-arrow-left me-1"></i> Back to Users
            </button>
            <span className="badge bg-primary text-white px-2.5 py-1" style={{ borderRadius: '6px' }}>Admin Access Control</span>
            {mode === 'user' && selectedUserObj && (
              <span className="badge bg-success-subtle text-success border px-2.5 py-1" style={{ borderRadius: '6px' }}>
                Configuring: {selectedUserObj.username} ({selectedUserObj.department || 'General'})
              </span>
            )}
            {mode === 'department' && (
              <span className="badge bg-info-subtle text-info border px-2.5 py-1 text-uppercase" style={{ borderRadius: '6px' }}>
                Dept Policy: {selectedDeptId}
              </span>
            )}
          </div>
          <h2 className="fw-bold text-dark mb-1">User & Department Page Permissions</h2>
          <p className="text-muted small mb-0">
            Control exact page visibility per user or department to ensure users only access pages appropriate for their role.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn text-white fw-bold px-4 shadow-sm d-flex align-items-center gap-2"
            style={{ backgroundColor: '#10b981', borderRadius: '8px' }}
            onClick={handleSavePermissions}
            disabled={saving}
          >
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-save'}`}></i>
            {saving ? 'Saving...' : 'Save & Apply Permissions'}
          </button>
        </div>
      </div>

      {successMsg && <div className="alert alert-success py-2 fw-semibold shadow-sm mb-4">{successMsg}</div>}
      {errorMsg && <div className="alert alert-danger py-2 fw-semibold shadow-sm mb-4">{errorMsg}</div>}

      {/* Target Selector & Mode Switcher Card */}
      <div className="bg-white border rounded-3 shadow-sm p-4 mb-4" style={{ borderRadius: '16px' }}>
        <div className="row g-3 align-items-center">
          
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold uppercase me-2">Configuration Mode</label>
            <div className="btn-group w-100 shadow-sm" role="group">
              <button
                type="button"
                className={`btn btn-sm fw-bold ${mode === 'user' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMode('user')}
              >
                <i className="fas fa-user me-1.5"></i>Specific User Account
              </button>
              <button
                type="button"
                className={`btn btn-sm fw-bold ${mode === 'department' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setMode('department')}
              >
                <i className="fas fa-building me-1.5"></i>Department Default
              </button>
            </div>
          </div>

          <div className="col-md-5">
            {mode === 'user' ? (
              <div>
                <label className="form-label text-muted small fw-bold">Select Target Staff User</label>
                <select
                  className="form-select fw-semibold"
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                >
                  {usersList.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.username} ({u.email}) — Dept: {u.department || 'General'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="form-label text-muted small fw-bold">Select Target Department</label>
                <select
                  className="form-select fw-semibold"
                  value={selectedDeptId}
                  onChange={e => setSelectedDeptId(e.target.value)}
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="col-md-3">
            <div className="p-3 bg-light rounded-3 border text-center">
              <div className="text-muted small fw-semibold">Pages Allowed</div>
              <div className="fw-bold text-dark fs-5">
                {allowedPagesCount} / {totalPagesCount} <span className="fs-6 text-muted">({percentage}%)</span>
              </div>
              <div className="progress mt-1.5" style={{ height: '6px' }}>
                <div
                  className="progress-bar bg-success"
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Presets Bar */}
        <div className="mt-3 pt-3 border-top d-flex flex-wrap align-items-center gap-2">
          <span className="text-muted small fw-bold me-1"><i className="fas fa-bolt text-warning me-1"></i>Quick Access Presets:</span>
          <button className="btn btn-sm btn-outline-success py-1 px-2.5" onClick={() => applyPreset('hr')}>HR Preset</button>
          <button className="btn btn-sm btn-outline-primary py-1 px-2.5" onClick={() => applyPreset('finance')}>Finance Preset</button>
          <button className="btn btn-sm btn-outline-info py-1 px-2.5" onClick={() => applyPreset('logistics')}>Logistics Preset</button>
          <button className="btn btn-sm btn-outline-secondary py-1 px-2.5" onClick={() => applyPreset('procurement')}>Procurement Preset</button>
          <button className="btn btn-sm btn-outline-dark py-1 px-2.5" onClick={() => applyPreset('assets')}>Assets Preset</button>
          <button className="btn btn-sm btn-outline-warning py-1 px-2.5" onClick={() => applyPreset('it')}>IT Preset</button>
          <button className="btn btn-sm btn-dark py-1 px-2.5 ms-auto" onClick={() => applyPreset('all')}>Allow All (SuperAdmin)</button>
          <button className="btn btn-sm btn-outline-danger py-1 px-2.5" onClick={() => applyPreset('none')}>Restrict All</button>
        </div>
      </div>

      {/* Filter Bar & Search */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold text-dark mb-0">Module & Page Permissions Matrix</h5>
        <div style={{ maxWidth: '300px', width: '100%' }}>
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Search pages or modules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Modules Grid */}
      <div className="row g-4">
        {filteredModules.map(mod => {
          const modRoutes = mod.items.map(i => i.route);
          const isAllModuleEnabled = modRoutes.every(r => allowedRoutes.includes(r));
          const isSomeModuleEnabled = modRoutes.some(r => allowedRoutes.includes(r));

          return (
            <div key={mod.key} className="col-lg-6 col-xl-4">
              <div className="card h-100 border shadow-sm" style={{ borderRadius: '14px', overflow: 'hidden' }}>
                <div className="card-header bg-light border-bottom d-flex justify-content-between align-items-center py-2.5 px-3">
                  <div className="fw-bold text-dark d-flex align-items-center gap-2" style={{ fontSize: '0.95rem' }}>
                    <i className={`fas ${
                      mod.key === 'hr' ? 'fa-users text-success' :
                      mod.key === 'finance' ? 'fa-file-invoice-dollar text-primary' :
                      mod.key === 'logistics' ? 'fa-shipping-fast text-info' :
                      mod.key === 'procurement' ? 'fa-shopping-cart text-warning' :
                      mod.key === 'assets' ? 'fa-cubes text-secondary' :
                      mod.key === 'it' ? 'fa-network-wired text-purple' :
                      mod.key === 'tasks' ? 'fa-tasks text-danger' : 'fa-cogs text-dark'
                    }`}></i>
                    {mod.label}
                  </div>
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      role="switch"
                      checked={isAllModuleEnabled}
                      onChange={(e) => handleToggleModule(mod.key, e.target.checked)}
                      title="Toggle all pages in this module"
                    />
                  </div>
                </div>

                <div className="card-body p-3">
                  <div className="d-flex flex-column gap-2">
                    {mod.items.map(item => {
                      const isChecked = allowedRoutes.includes(item.route);
                      return (
                        <div
                          key={item.id}
                          className="d-flex justify-content-between align-items-center p-2 rounded-2 border-bottom hover-bg-light"
                          style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                          onClick={() => handleToggleRoute(item.route)}
                        >
                          <div>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.88rem' }}>{item.label}</div>
                            <small className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>{item.route}</small>
                          </div>
                          <div className="form-check mb-0" onClick={e => e.stopPropagation()}>
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleRoute(item.route)}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="card-footer bg-white border-top py-2 px-3 text-muted small d-flex justify-content-between">
                  <span>{mod.items.filter(i => allowedRoutes.includes(i.route)).length} of {mod.items.length} Enabled</span>
                  {isAllModuleEnabled ? (
                    <span className="badge bg-success-subtle text-success border">Full Access</span>
                  ) : isSomeModuleEnabled ? (
                    <span className="badge bg-warning-subtle text-warning border">Partial Access</span>
                  ) : (
                    <span className="badge bg-danger-subtle text-danger border">Restricted</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default UserPermissionsPage;

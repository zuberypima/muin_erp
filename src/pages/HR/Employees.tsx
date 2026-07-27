import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Employee, DEPARTMENTS, formatDate, demoEmployees } from './hrTypes';
import { SkeletonTable } from '../../components/Skeleton';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [erpUsers, setErpUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [error, setError] = useState('');

  const [form, setForm] = useState<Omit<Employee, 'id'> & { user: string }>({
    user: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'Farm Operations',
    position: '',
    employmentType: 'full-time',
    startDate: new Date().toISOString().split('T')[0],
    status: 'active'
  });

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
    let dataArr: any[] = [];
    let success = false;
    let lastError = '';

    // 1. Try primary endpoint /hr/employees/
    try {
      const res = await api.get('/hr/employees/');
      dataArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      success = true;
    } catch (err1: any) {
      lastError = err1?.response?.data?.detail || err1?.message || 'Endpoint /hr/employees/ unavailable';
      // 2. Fallback to /employees/
      try {
        const res2 = await api.get('/employees/');
        dataArr = Array.isArray(res2.data) ? res2.data : (res2.data?.results || []);
        success = true;
      } catch (err2: any) {
        // 3. Fallback to /users/ if available
        try {
          const res3 = await api.get('/users/');
          const users = Array.isArray(res3.data) ? res3.data : (res3.data?.results || []);
          if (users.length > 0) {
            dataArr = users.map((u: any) => ({
              id: u.id || u.uuid,
              first_name: u.first_name || u.username || 'Staff',
              last_name: u.last_name || '',
              email: u.email || '',
              phone: u.phone || '',
              department: u.department || 'Management',
              position: u.role || u.position || 'Staff Member',
              employment_type: 'full-time',
              start_date: u.date_joined ? u.date_joined.split('T')[0] : new Date().toISOString().split('T')[0],
              status: u.is_active !== false ? 'active' : 'inactive'
            }));
            success = true;
          }
        } catch (err3) {
          console.warn('All employee API endpoints failed:', err3);
        }
      }
    }

    if (success && dataArr.length > 0) {
      const mapped: Employee[] = dataArr.map((e: any) => ({
        id: e.id !== undefined && e.id !== null ? e.id : (e.pk || e.employee_id || `EMP-${Math.random()}`),
        firstName: e.first_name || e.firstName || '',
        lastName: e.last_name || e.lastName || '',
        email: e.email || '',
        phone: e.phone || '',
        department: e.department || 'Farm Operations',
        position: e.position || '',
        employmentType: e.employment_type || e.employmentType || 'full-time',
        startDate: e.start_date || e.startDate || new Date().toISOString().split('T')[0],
        status: e.status || 'active',
      }));
      setEmployees(mapped);
    } else {
      // Fallback to demoEmployees so page is never broken
      setEmployees(demoEmployees);
      if (lastError) {
        setError(`Unable to connect to backend server (${lastError}). Showing fallback employee records.`);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
    api.get('/users/').then(res => {
      const usersArr = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setErpUsers(usersArr);
    }).catch(() => {});
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setError('');
    setForm({
      user: '', firstName: '', lastName: '', email: '', phone: '',
      department: 'Farm Operations', position: '',
      employmentType: 'full-time',
      startDate: new Date().toISOString().split('T')[0],
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (emp: Employee) => {
    setEditingId(emp.id);
    setError('');
    setForm({
      user: '',
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      department: emp.department,
      position: emp.position,
      employmentType: emp.employmentType,
      startDate: emp.startDate,
      status: emp.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.delete(`/hr/employees/${id}/`);
      await fetchEmployees();
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Failed to delete employee.');
    } finally {
      setSaving(false);
    }
  };

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const selectedUser = erpUsers.find(u => u.id.toString() === userId);
    
    let firstName = form.firstName;
    let lastName = form.lastName;

    if (selectedUser) {
      if (selectedUser.first_name || selectedUser.last_name) {
        firstName = selectedUser.first_name || '';
        lastName = selectedUser.last_name || '';
      } else {
        const nameParts = selectedUser.username.split(' ');
        firstName = nameParts[0] || '';
        lastName = nameParts.slice(1).join(' ') || '';
      }
    }

    setForm({
      ...form,
      user: userId,
      email: selectedUser ? selectedUser.email : form.email,
      firstName,
      lastName,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      user: form.user || null,
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      phone: form.phone,
      department: form.department,
      position: form.position,
      employment_type: form.employmentType,
      start_date: form.startDate,
      status: form.status,
    };

    try {
      if (editingId) {
        await api.patch(`/hr/employees/${editingId}/`, payload).catch(async () => {
          return await api.put(`/hr/employees/${editingId}/`, payload);
        });
      } else {
        await api.post('/hr/employees/', payload);
      }
      await fetchEmployees();
      setShowModal(false);
      setEditingId(null);
    } catch (err: any) {
      const data = err?.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(msgs.join(' | ') || 'Failed to save employee.');
      } else {
        setError('Failed to save employee.');
      }
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                          emp.position.toLowerCase().includes(search.toLowerCase()) ||
                          emp.email.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'all' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="container-fluid p-0">
      <div className="hr-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center px-4 pt-4 pb-3 gap-3">
          <h5 className="fw-bold mb-0">Employee Roster</h5>
          <div className="d-flex gap-2 flex-wrap">
            <input
              type="text" className="form-control form-control-sm"
              placeholder="Search employees..." style={{ width: '200px' }}
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <select className="form-select form-select-sm" style={{ width: 'auto' }}
              value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="all">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <button className="btn btn-sm text-white fw-bold px-3"
              style={{ backgroundColor: '#10b981', borderRadius: '8px' }}
              onClick={handleOpenAddModal}>
              <i className="fas fa-plus me-2"></i>Add Employee
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-warning mx-4 py-2 small d-flex justify-content-between align-items-center rounded-3">
            <div>
              <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
              {error}
            </div>
            <button className="btn btn-sm btn-outline-dark py-0.5 px-2 ms-3 text-nowrap" style={{ fontSize: '0.75rem', borderRadius: '6px' }} onClick={fetchEmployees}>
              <i className="fas fa-sync-alt me-1"></i>Retry Connection
            </button>
          </div>
        )}

        {loading ? (
          <div className="p-3">
            <SkeletonTable rows={6} cols={8} />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table hr-table align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Start Date</th>
                  <th>Contact</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr><td colSpan={8} className="text-center text-muted py-4">No employees found.</td></tr>
                ) : filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="emp-avatar me-3">{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</div>
                        <div>
                          <div className="fw-semibold text-dark">{emp.firstName} {emp.lastName}</div>
                          <div className="text-muted small">#{emp.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department}</td>
                    <td>{emp.position}</td>
                    <td className="text-capitalize small">{emp.employmentType}</td>
                    <td><span className={`hr-badge ${emp.status}`}>{emp.status}</span></td>
                    <td>{formatDate(emp.startDate)}</td>
                    <td>
                      <div className="small text-muted">{emp.email}</div>
                      <div className="small text-muted">{emp.phone}</div>
                    </td>
                    <td className="text-end pe-4">
                      <button 
                        className="btn btn-sm btn-outline-primary py-1 px-2.5 me-1 fw-semibold" 
                        title="Edit Details"
                        onClick={() => handleEdit(emp)}
                        style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                      >
                        <i className="fas fa-edit me-1"></i> Edit
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger py-1 px-2.5 fw-semibold" 
                        title="Delete Employee"
                        onClick={() => handleDelete(emp.id)}
                        style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                      >
                        <i className="fas fa-trash-alt me-1"></i> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block hr-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">{editingId ? 'Edit Employee Details' : 'Add New Employee'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    {!editingId && (
                      <div className="col-12">
                        <label className="form-label text-muted small fw-semibold">Link to ERP User Account</label>
                        <select className="form-select bg-light border-primary" value={form.user} onChange={handleUserSelect}>
                          <option value="">-- No linked user (create independent profile) --</option>
                          {erpUsers.map(u => (
                            <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                          ))}
                        </select>
                        <small className="text-muted" style={{ fontSize: '11px' }}>
                          Select an existing user to link their account to this HR profile.
                        </small>
                      </div>
                    )}
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">First Name</label>
                      <input type="text" className="form-control bg-light" required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Last Name</label>
                      <input type="text" className="form-control bg-light" required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Email</label>
                      <input type="email" className="form-control bg-light" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Phone</label>
                      <input type="text" className="form-control bg-light" required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Department</label>
                      <select className="form-select bg-light" value={form.department} onChange={e => setForm({...form, department: e.target.value})}>
                        {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Position</label>
                      <input type="text" className="form-control bg-light" required value={form.position} onChange={e => setForm({...form, position: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Employment Type</label>
                      <select className="form-select bg-light" value={form.employmentType} onChange={e => setForm({...form, employmentType: e.target.value as any})}>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Status</label>
                      <select className="form-select bg-light" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                        <option value="active">Active</option>
                        <option value="on-leave">On-Leave</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted small fw-semibold">Start Date</label>
                      <input type="date" className="form-control bg-light" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={saving}>
                    {saving ? 'Saving...' : (editingId ? 'Update Details' : 'Add Employee')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;

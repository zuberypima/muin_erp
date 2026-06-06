import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { Employee, DEPARTMENTS, formatDate } from './hrTypes';

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [erpUsers, setErpUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
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
    try {
      const res = await api.get('/hr/employees/');
      // Map snake_case API fields to camelCase interface
      const mapped: Employee[] = res.data.map((e: any) => ({
        id: e.employee_id,
        firstName: e.first_name,
        lastName: e.last_name,
        email: e.email,
        phone: e.phone,
        department: e.department,
        position: e.position,
        employmentType: e.employment_type,
        startDate: e.start_date,
        status: e.status,
      }));
      setEmployees(mapped);
    } catch {
      setError('Failed to load employees.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    api.get('/users/').then(res => setErpUsers(res.data)).catch(() => {});
  }, []);

  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    const selectedUser = erpUsers.find(u => u.id.toString() === userId);
    setForm({
      ...form,
      user: userId,
      email: selectedUser ? selectedUser.email : form.email,
      firstName: selectedUser ? selectedUser.username : form.firstName,
    });
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/hr/employees/', {
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
      });
      await fetchEmployees();
      setShowModal(false);
      setForm({
        user: '', firstName: '', lastName: '', email: '', phone: '',
        department: 'Farm Operations', position: '',
        employmentType: 'full-time',
        startDate: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    } catch (err: any) {
      setError(err?.response?.data?.email?.[0] || 'Failed to add employee.');
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
              onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2"></i>Add Employee
            </button>
          </div>
        </div>

        {error && <div className="alert alert-danger mx-4 py-2 small">{error}</div>}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
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
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.length === 0 ? (
                  <tr><td colSpan={7} className="text-center text-muted py-4">No employees found.</td></tr>
                ) : filteredEmployees.map(emp => (
                  <tr key={emp.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="emp-avatar me-3">{emp.firstName.charAt(0)}{emp.lastName.charAt(0)}</div>
                        <div>
                          <div className="fw-semibold text-dark">{emp.firstName} {emp.lastName}</div>
                          <div className="text-muted small">{emp.id}</div>
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
                <h5 className="modal-title fw-bold">Add New Employee</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
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
                      <label className="form-label text-muted small fw-semibold">Start Date</label>
                      <input type="date" className="form-control bg-light" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={saving}>
                    {saving ? 'Saving...' : 'Add Employee'}
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

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { formatDate } from './hrTypes';

interface AttendanceRecord {
  id: number;
  employee: number;
  employee_name: string;
  employee_id_code: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: 'present' | 'absent' | 'late' | 'half-day';
  hours_worked: string;
}

interface Employee { id: number; full_name: string; }

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    check_in: '',
    check_out: '',
    status: 'present' as 'present' | 'absent' | 'late' | 'half-day',
    hours_worked: 8,
  });

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/hr/attendance/?date=${dateFilter}`);
      setAttendance(res.data);
    } catch { setError('Failed to load attendance.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    api.get('/hr/employees/').then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  useEffect(() => { fetchAttendance(); }, [dateFilter]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/hr/attendance/', {
        employee: form.employee,
        date: form.date,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
        status: form.status,
        hours_worked: form.hours_worked,
      });
      await fetchAttendance();
      setShowModal(false);
    } catch (err: any) {
      setError(err?.response?.data?.non_field_errors?.[0] || 'Failed to log attendance.');
    } finally { setSaving(false); }
  };

  return (
    <div className="container-fluid p-0">
      <div className="hr-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center px-4 pt-4 pb-3 gap-3">
          <h5 className="fw-bold mb-0">Daily Attendance Log</h5>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input type="date" className="form-control form-control-sm" style={{ width: '150px' }}
              value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
            <button className="btn btn-sm text-white fw-bold px-3"
              style={{ backgroundColor: '#10b981', borderRadius: '8px' }}
              onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2"></i>Log Attendance
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
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours Worked</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length === 0 ? (
                  <tr><td colSpan={6} className="text-center text-muted py-4">No attendance records for this date.</td></tr>
                ) : attendance.map(att => (
                  <tr key={att.id}>
                    <td>
                      <div className="fw-semibold text-dark">{att.employee_name}</div>
                      <div className="small text-muted">{att.employee_id_code}</div>
                    </td>
                    <td>{formatDate(att.date)}</td>
                    <td>{att.check_in || '—'}</td>
                    <td>{att.check_out || '—'}</td>
                    <td>{parseFloat(att.hours_worked) > 0 ? `${att.hours_worked} hrs` : '—'}</td>
                    <td><span className={`hr-badge ${att.status}`}>{att.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block hr-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Log Attendance</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Employee</label>
                      <select className="form-select bg-light" required value={form.employee}
                        onChange={e => setForm({...form, employee: e.target.value})}>
                        <option value="">Select employee...</option>
                        {employees.map((emp: any) => (
                          <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Date</label>
                      <input type="date" className="form-control bg-light" required value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Check In</label>
                      <input type="time" className="form-control bg-light" value={form.check_in}
                        onChange={e => setForm({...form, check_in: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Check Out</label>
                      <input type="time" className="form-control bg-light" value={form.check_out}
                        onChange={e => setForm({...form, check_out: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Status</label>
                      <select className="form-select bg-light" value={form.status}
                        onChange={e => setForm({...form, status: e.target.value as any})}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Hours Worked</label>
                      <input type="number" step="0.25" className="form-control bg-light" required
                        value={form.hours_worked} onChange={e => setForm({...form, hours_worked: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={saving}>
                    {saving ? 'Saving...' : 'Log Record'}
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

export default Attendance;

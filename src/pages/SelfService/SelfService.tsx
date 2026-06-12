import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../context/AuthContext';
import { SupportTicket, TicketCategory, TicketPriority, formatDateTime } from '../IT/itTypes';
import { LeaveRequest } from '../HR/hrTypes';

type LeaveType = LeaveRequest['leaveType'];

const TICKET_CATEGORIES: TicketCategory[] = ['hardware', 'software', 'network', 'account', 'other'];
const TICKET_PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
const LEAVE_TYPES: LeaveType[] = ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'emergency'];

const SelfService: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'leaves' | 'tickets'>('leaves');
  
  // Data state
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [leaveForm, setLeaveForm] = useState({
    type: 'annual' as LeaveType,
    startDate: '',
    endDate: '',
    days: 1,
    reason: ''
  });

  const [ticketForm, setTicketForm] = useState({
    title: '',
    description: '',
    category: 'software' as TicketCategory,
    priority: 'medium' as TicketPriority
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user?.employee_profile_id) {
        const leavesRes = await api.get(`/hr/leaves/?employee=${user.employee_profile_id}`);
        // Map snake_case to camelCase
        setLeaves(leavesRes.data.map((l: any) => ({
          id: l.id,
          employeeName: l.employee_name,
          department: l.department,
          leaveType: l.leave_type,
          startDate: l.start_date,
          endDate: l.end_date,
          days: l.days,
          reason: l.reason,
          status: l.status,
          appliedOn: l.applied_on,
        })));
      }
      
      const ticketsRes = await api.get('/it/tickets/');
      // Fallback filter since backend might not support raised_by filter
      setTickets(ticketsRes.data.filter((t: SupportTicket) => t.raised_by === user?.username));
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.employee_profile_id) {
      setError('You must have a linked HR employee profile to request leave.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/hr/leaves/', {
        employee: user.employee_profile_id,
        leave_type: leaveForm.type,
        start_date: leaveForm.startDate,
        end_date: leaveForm.endDate,
        days: leaveForm.days,
        reason: leaveForm.reason,
        status: 'pending'
      });
      setShowLeaveModal(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to submit leave request.');
    } finally {
      setSaving(false);
    }
  };

  const handleRaiseTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Create random unique ID for the ticket since we don't have the full list
      const randomId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      
      await api.post('/it/tickets/', {
        id: randomId,
        title: ticketForm.title,
        description: ticketForm.description,
        category: ticketForm.category,
        priority: ticketForm.priority,
        raised_by: user?.username || 'Unknown',
        assigned_to: '',
        status: 'open'
      });
      setShowTicketModal(false);
      fetchData();
    } catch (err: any) {
      setError('Failed to submit support ticket.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseTicket = async (id: string) => {
    if (!window.confirm('Are you sure you want to mark this ticket as solved and close it?')) return;
    try {
      await api.patch(`/it/tickets/${id}/`, { status: 'closed' });
      fetchData();
    } catch (e) {
      console.error('Failed to close ticket:', e);
      alert('Failed to close the ticket. Please try again later.');
    }
  };

  if (loading) {
    return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;
  }

  const stats = {
    total: leaves.length + tickets.length,
    approvedLeaves: leaves.filter(l => l.status === 'approved').length,
    pendingLeaves: leaves.filter(l => l.status === 'pending').length,
    openTickets: tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
    resolvedTickets: tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
  };

  return (
    <div className="container-fluid py-2 fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Self Service Portal</h4>
          <p className="text-muted mb-0 small" style={{ fontSize: '0.82rem' }}>
            Manage your leaves and IT support requests.
          </p>
        </div>
        <button className="btn text-white fw-bold px-3 py-1.5 shadow-sm" style={{ backgroundColor: '#10b981', borderRadius: '6px', fontSize: '0.82rem' }} 
          onClick={() => activeTab === 'leaves' ? setShowLeaveModal(true) : setShowTicketModal(true)}>
          <i className="fas fa-plus me-1.5"></i> {activeTab === 'leaves' ? 'Request Leave' : 'New Ticket'}
        </button>
      </div>

      {/* KPI Row */}
      <div className="row g-2 mb-3">
        {[
          { label: 'Total Requests', value: stats.total, icon: 'fa-clipboard-list', color: '#10b981' },
          { label: 'Approved Leaves', value: stats.approvedLeaves, icon: 'fa-check-circle', color: '#22c55e' },
          { label: 'Pending Leaves', value: stats.pendingLeaves, icon: 'fa-spinner', color: '#f59e0b' },
          { label: 'Open Tickets', value: stats.openTickets, icon: 'fa-exclamation-circle', color: '#ef4444' },
          { label: 'Resolved Tickets', value: stats.resolvedTickets, icon: 'fa-headset', color: '#7c3aed' },
        ].map(kpi => (
          <div className="col" key={kpi.label}>
            <div className="d-flex align-items-center justify-content-between bg-white shadow-sm border" style={{ borderRadius: '12px', padding: '1.2rem', borderColor: '#f1f5f9' }}>
              <div>
                <div className="text-muted fw-semibold" style={{ fontSize: '0.7rem' }}>{kpi.label}</div>
                <div className="fs-5 fw-bold text-dark mt-0">{kpi.value}</div>
              </div>
              <i className={`fas ${kpi.icon} fa-lg`} style={{ color: kpi.color, opacity: 0.7 }}></i>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-2 rounded-3 shadow-sm border mb-3">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-2">
          <ul className="nav nav-tabs border-0 gap-1">
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-semibold px-2.5 py-1.5 rounded-3 ${activeTab === 'leaves' ? 'text-white' : 'text-muted bg-transparent'}`}
                style={{ fontSize: '0.8rem', ...(activeTab === 'leaves' ? { backgroundColor: '#10b981' } : {}) }}
                onClick={() => setActiveTab('leaves')}
              >My Leaves</button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link border-0 fw-semibold px-2.5 py-1.5 rounded-3 ${activeTab === 'tickets' ? 'text-white' : 'text-muted bg-transparent'}`}
                style={{ fontSize: '0.8rem', ...(activeTab === 'tickets' ? { backgroundColor: '#10b981' } : {}) }}
                onClick={() => setActiveTab('tickets')}
              >My Support Tickets</button>
            </li>
          </ul>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
      ) : (
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden mb-4">
          
          {activeTab === 'leaves' && (
            leaves.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-clipboard-check fa-3x mb-3 d-block" style={{ color: '#f1f5f9' }}></i>
                <p className="fw-semibold">No leave requests found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light text-muted fw-semibold">
                    <tr>
                      <th className="ps-4 py-3 border-0">Type</th>
                      <th className="py-3 border-0">Dates</th>
                      <th className="py-3 border-0">Days</th>
                      <th className="py-3 border-0">Reason</th>
                      <th className="py-3 border-0">Applied On</th>
                      <th className="py-3 border-0">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.map(l => (
                      <tr key={l.id}>
                        <td className="ps-4 py-3 text-capitalize fw-medium border-bottom-0" style={{ borderBottom: '1px solid #f8fafc' }}>
                          {l.leaveType}
                        </td>
                        <td className="py-3" style={{ borderBottom: '1px solid #f8fafc' }}>{l.startDate} <span className="text-muted mx-1">→</span> {l.endDate}</td>
                        <td className="py-3 fw-semibold text-dark" style={{ borderBottom: '1px solid #f8fafc' }}>{l.days}</td>
                        <td className="py-3 text-muted text-truncate" style={{ maxWidth: '200px', borderBottom: '1px solid #f8fafc' }}>{l.reason}</td>
                        <td className="py-3 text-muted" style={{ borderBottom: '1px solid #f8fafc' }}>{l.appliedOn}</td>
                        <td className="py-3" style={{ borderBottom: '1px solid #f8fafc' }}>
                          <span className={`badge border text-capitalize`} style={{
                            borderRadius: '6px', fontSize: '0.72rem',
                            ...(l.status === 'approved' ? { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' } :
                               l.status === 'rejected' ? { backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecaca' } :
                               { backgroundColor: '#fef9c3', color: '#a16207', borderColor: '#fef08a' })
                          }}>
                            {l.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {activeTab === 'tickets' && (
            tickets.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-clipboard-check fa-3x mb-3 d-block" style={{ color: '#f1f5f9' }}></i>
                <p className="fw-semibold">No support tickets found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead className="bg-light text-muted fw-semibold">
                    <tr>
                      <th className="ps-4 py-3 border-0">Ticket ID</th>
                      <th className="py-3 border-0">Title & Description</th>
                      <th className="py-3 border-0">Category</th>
                      <th className="py-3 border-0">Priority</th>
                      <th className="py-3 border-0">Status</th>
                      <th className="py-3 border-0">Created On</th>
                      <th className="py-3 border-0 text-end pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(t => (
                      <tr key={t.id}>
                        <td className="ps-4 py-3 border-bottom-0" style={{ borderBottom: '1px solid #f8fafc' }}>
                          <span className="fw-bold small" style={{ color: '#10b981' }}>#{t.id}</span>
                        </td>
                        <td className="py-3" style={{ borderBottom: '1px solid #f8fafc' }}>
                          <div className="fw-bold text-dark">{t.title}</div>
                          <div className="text-muted text-truncate" style={{ fontSize: '0.78rem', maxWidth: '220px' }}>{t.description || 'No description'}</div>
                        </td>
                        <td className="py-3 text-capitalize text-muted" style={{ borderBottom: '1px solid #f8fafc' }}>{t.category}</td>
                        <td className="py-3" style={{ borderBottom: '1px solid #f8fafc' }}>
                          <span className={`badge`} style={{
                            borderRadius: '6px', fontSize: '0.72rem',
                            ...(t.priority === 'critical' ? { backgroundColor: '#ef4444', color: 'white' } :
                               t.priority === 'high' ? { backgroundColor: '#f97316', color: 'white' } :
                               t.priority === 'medium' ? { backgroundColor: '#eab308', color: 'white' } :
                               { backgroundColor: '#3b82f6', color: 'white' })
                          }}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3" style={{ borderBottom: '1px solid #f8fafc' }}>
                          <span className={`badge border text-capitalize`} style={{
                            borderRadius: '6px', fontSize: '0.72rem',
                            ...(t.status === 'resolved' || t.status === 'closed' ? { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' } :
                               t.status === 'in-progress' ? { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe' } :
                               { backgroundColor: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0' })
                          }}>
                            {t.status.replace('-', ' ')}
                          </span>
                        </td>
                        <td className="py-3 text-muted" style={{ borderBottom: '1px solid #f8fafc' }}>{formatDateTime(t.created_at)}</td>
                        <td className="py-3 text-end pe-4" style={{ borderBottom: '1px solid #f8fafc' }}>
                          {t.status !== 'closed' && (
                            <button className="btn btn-sm btn-outline-success py-1 px-2 fw-semibold" style={{ fontSize: '0.7rem', borderRadius: '6px' }} onClick={() => handleCloseTicket(t.id)}>
                              <i className="fas fa-check me-1"></i> Mark Solved
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Request Leave</h5>
                <button type="button" className="btn-close" onClick={() => setShowLeaveModal(false)}></button>
              </div>
              <form onSubmit={handleApplyLeave}>
                <div className="modal-body row g-3">
                  {error && <div className="col-12"><div className="alert alert-danger small py-2">{error}</div></div>}
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Leave Type</label>
                    <select className="form-select bg-light" value={leaveForm.type} onChange={e => setLeaveForm({...leaveForm, type: e.target.value as LeaveType})}>
                      {LEAVE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Start Date</label>
                    <input type="date" required className="form-control bg-light" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">End Date</label>
                    <input type="date" required className="form-control bg-light" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Number of Days</label>
                    <input type="number" required min={1} className="form-control bg-light" value={leaveForm.days} onChange={e => setLeaveForm({...leaveForm, days: Number(e.target.value)})} />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Reason</label>
                    <textarea required rows={3} className="form-control bg-light" value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})}></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowLeaveModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={saving}>
                    {saving ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {showTicketModal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Report an IT Issue</h5>
                <button type="button" className="btn-close" onClick={() => setShowTicketModal(false)}></button>
              </div>
              <form onSubmit={handleRaiseTicket}>
                <div className="modal-body row g-3">
                  {error && <div className="col-12"><div className="alert alert-danger small py-2">{error}</div></div>}
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Title *</label>
                    <input type="text" required className="form-control bg-light" value={ticketForm.title} onChange={e => setTicketForm({...ticketForm, title: e.target.value})} placeholder="Brief description of the issue" />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea rows={3} className="form-control bg-light" value={ticketForm.description} onChange={e => setTicketForm({...ticketForm, description: e.target.value})} placeholder="Provide more details..."></textarea>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Category</label>
                    <select className="form-select bg-light" value={ticketForm.category} onChange={e => setTicketForm({...ticketForm, category: e.target.value as TicketCategory})}>
                      {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Priority</label>
                    <select className="form-select bg-light" value={ticketForm.priority} onChange={e => setTicketForm({...ticketForm, priority: e.target.value as TicketPriority})}>
                      {TICKET_PRIORITIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowTicketModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={saving}>
                    {saving ? 'Submitting...' : 'Submit Ticket'}
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

export default SelfService;

import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import {
  SupportTicket, TicketCategory, TicketPriority, TicketStatus,
  formatDateTime,
} from './itTypes';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES: TicketCategory[] = ['hardware', 'software', 'network', 'account', 'other'];
const PRIORITIES: TicketPriority[] = ['low', 'medium', 'high', 'critical'];
const STAFFERS = ['Grace Mwangi', 'External — TechFix Ltd', 'Unassigned'];

const emptyTicket = (): Partial<SupportTicket> => ({
  title: '', description: '', category: 'software', priority: 'medium',
  raised_by: '', assigned_to: '', status: 'open',
});

const PRIORITY_ICON: Record<TicketPriority, string> = {
  low: 'fas fa-arrow-down', medium: 'fas fa-equals', high: 'fas fa-arrow-up', critical: 'fas fa-fire',
};

const SupportTickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets]         = useState<SupportTicket[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCat, setFilterCat]     = useState<string>('all');
  
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState<SupportTicket | null>(null);
  const [viewTicket, setViewTicket]   = useState<SupportTicket | null>(null);
  const [form, setForm]               = useState<Partial<SupportTicket>>(emptyTicket());

  const fetchTickets = async () => {
    try {
      const res = await api.get('/it/tickets/');
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filtered = tickets.filter(t => {
    const q = search.toLowerCase();
    const matchQ    = !q || t.title.toLowerCase().includes(q) || t.raised_by.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
    const matchStat = filterStatus   === 'all' || t.status   === filterStatus;
    const matchPri  = filterPriority === 'all' || t.priority === filterPriority;
    const matchCat  = filterCat      === 'all' || t.category === filterCat;
    return matchQ && matchStat && matchPri && matchCat;
  });

  const openAdd  = () => { setEditing(null); setForm({ ...emptyTicket(), raised_by: user?.username || '' }); setShowModal(true); };
  const openEdit = (t: SupportTicket) => { setEditing(t); setForm({ ...t }); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSave = async () => {
    if (!form.title || !form.raised_by) return;
    try {
      if (editing) {
        const res = await api.put(`/it/tickets/${editing.id}/`, form);
        setTickets(prev => prev.map(t => t.id === editing.id ? res.data : t));
      } else {
        const payload = {
          ...form,
          id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
        };
        const res = await api.post('/it/tickets/', payload);
        setTickets(prev => [res.data, ...prev]);
      }
      closeModal();
    } catch (e) {
      console.error(e);
      alert('Error saving ticket');
    }
  };

  const cycleStatus = async (id: string) => {
    const t = tickets.find(x => x.id === id);
    if (!t) return;
    const order: TicketStatus[] = ['open', 'in-progress', 'resolved', 'closed'];
    const nextIdx = (order.indexOf(t.status) + 1) % order.length;
    const nextStatus = order[nextIdx];
    try {
      const res = await api.patch(`/it/tickets/${id}/`, { status: nextStatus, resolved_at: (nextStatus === 'resolved' || nextStatus === 'closed') ? new Date().toISOString() : null });
      setTickets(prev => prev.map(tk => tk.id === id ? res.data : tk));
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this ticket?')) {
      try {
        await api.delete(`/it/tickets/${id}/`);
        setTickets(prev => prev.filter(t => t.id !== id));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const f = (field: keyof SupportTicket) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  // KPIs
  const open       = tickets.filter(t => t.status === 'open').length;
  const inProgress = tickets.filter(t => t.status === 'in-progress').length;
  const resolved   = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  const critical   = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;

  if (loading) return <div className="p-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      {/* KPI Strip */}
      <div className="row g-3 mb-4">
        {[
          { label: 'Open',        value: open,       color: '#d97706' },
          { label: 'In Progress', value: inProgress, color: '#2563eb' },
          { label: 'Resolved',    value: resolved,   color: '#10b981' },
          { label: 'Critical',    value: critical,   color: '#ef4444' },
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
        <input className="it-search-input" placeholder="Search tickets…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="it-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {(['open', 'in-progress', 'resolved', 'closed'] as TicketStatus[]).map(s =>
            <option key={s} value={s}>{s.replace('-', ' ')}</option>
          )}
        </select>
        <select className="it-filter-select" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="all">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
        </select>
        <select className="it-filter-select" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
        <button className="btn-it-primary ms-auto" onClick={openAdd}>
          <i className="fas fa-plus me-1"></i>New Ticket
        </button>
      </div>

      {/* Table */}
      <div className="it-table-card">
        <div className="table-responsive">
          <table className="table it-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Raised By</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-muted py-5">
                  <i className="fas fa-headset fa-2x d-block mb-2" style={{ color: '#cbd5e1' }}></i>No tickets found.
                </td></tr>
              ) : filtered.map(t => (
                <tr key={t.id}>
                  <td className="small fw-semibold text-muted font-monospace">{t.id}</td>
                  <td style={{ maxWidth: '200px' }}>
                    <div className="fw-medium" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div className="small text-muted" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description.slice(0, 50)}…</div>
                  </td>
                  <td><span className="it-category-pill text-capitalize">{t.category}</span></td>
                  <td>
                    <span className={`it-badge ${t.priority}`}>
                      <i className={PRIORITY_ICON[t.priority]}></i> {t.priority}
                    </span>
                  </td>
                  <td className="small">{t.raised_by}</td>
                  <td className="small">{t.assigned_to || <span className="text-muted">Unassigned</span>}</td>
                  <td><span className={`it-badge ${t.status}`}>{t.status.replace('-', ' ')}</span></td>
                  <td className="small text-muted">{formatDateTime(t.created_at)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-light border" title="View" onClick={() => setViewTicket(t)}><i className="fas fa-eye text-primary"></i></button>
                      <button className="btn btn-sm btn-light border" title="Advance Status" onClick={() => cycleStatus(t.id)}><i className="fas fa-forward text-success"></i></button>
                      <button className="btn btn-sm btn-light border" title="Edit" onClick={() => openEdit(t)}><i className="fas fa-edit text-warning"></i></button>
                      <button className="btn btn-sm btn-light border" title="Delete" onClick={() => handleDelete(t.id)}><i className="fas fa-trash text-danger"></i></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal show d-block it-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editing ? 'Edit Ticket' : 'New Support Ticket'}</h5>
                <button className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body row g-3 px-4 py-3">
                <div className="col-12">
                  <label className="form-label small fw-semibold">Title *</label>
                  <input className="form-control" value={form.title || ''} onChange={f('title')} placeholder="Brief description of the issue" />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control" rows={3} value={form.description || ''} onChange={f('description')} placeholder="Detailed description…" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Category</label>
                  <select className="form-select" value={form.category} onChange={f('category')}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Priority</label>
                  <select className="form-select" value={form.priority} onChange={f('priority')}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Raised By</label>
                  <input className="form-control" value={form.raised_by || ''} disabled placeholder="Employee name" />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Assigned To</label>
                  <select className="form-select" value={form.assigned_to || ''} onChange={f('assigned_to')}>
                    <option value="">Unassigned</option>
                    {STAFFERS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Status</label>
                  <select className="form-select" value={form.status} onChange={f('status')}>
                    {(['open', 'in-progress', 'resolved', 'closed'] as TicketStatus[]).map(s =>
                      <option key={s} value={s}>{s.replace('-', ' ')}</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-it-outline" onClick={closeModal}>Cancel</button>
                <button className="btn-it-primary" onClick={handleSave}>
                  {editing ? 'Save Changes' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Ticket Modal */}
      {viewTicket && (
        <div className="modal show d-block it-modal" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <div>
                  <h5 className="modal-title fw-bold mb-1">{viewTicket.title}</h5>
                  <span className="small text-muted font-monospace">{viewTicket.id}</span>
                </div>
                <button className="btn-close" onClick={() => setViewTicket(null)}></button>
              </div>
              <div className="modal-body">
                <div className="d-flex gap-2 flex-wrap mb-3">
                  <span className={`it-badge ${viewTicket.priority}`}><i className={`${PRIORITY_ICON[viewTicket.priority]} me-1`}></i>{viewTicket.priority}</span>
                  <span className={`it-badge ${viewTicket.status}`}>{viewTicket.status.replace('-', ' ')}</span>
                  <span className="it-category-pill text-capitalize">{viewTicket.category}</span>
                </div>
                <p className="mb-4" style={{ lineHeight: 1.7 }}>{viewTicket.description}</p>
                <div className="row g-3">
                  {[
                    { label: 'Raised By',    value: viewTicket.raised_by },
                    { label: 'Assigned To',  value: viewTicket.assigned_to || 'Unassigned' },
                    { label: 'Created',      value: formatDateTime(viewTicket.created_at) },
                    { label: 'Last Updated', value: formatDateTime(viewTicket.updated_at) },
                    { label: 'Resolved At',  value: viewTicket.resolved_at ? formatDateTime(viewTicket.resolved_at) : '—' },
                  ].map(item => (
                    <div key={item.label} className="col-md-4">
                      <div className="small text-muted">{item.label}</div>
                      <div className="fw-medium">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-it-outline" onClick={() => setViewTicket(null)}>Close</button>
                <button className="btn-it-primary" onClick={() => { setViewTicket(null); openEdit(viewTicket); }}>
                  <i className="fas fa-edit me-1"></i>Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;

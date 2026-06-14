import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import CreateTaskModal from './CreateTaskModal.tsx';
import './Tasks.css';

interface UserDetail { id: number; uuid: string; username: string; email: string; }

interface Task {
  id: string;
  ticket_number?: number;
  title: string;
  description: string;
  remarks?: string;
  assigned_to: string;
  assigned_to_detail?: UserDetail;
  assigned_by_detail?: UserDetail;
  collaborators?: string[];
  collaborators_detail?: UserDetail[];
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
}

const ALL_STATUSES = ['Pending', 'In-Progress', 'Awaiting-Approval', 'Assist-Requested', 'Completed'];

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'assigned' | 'collaborating'>('all');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date_asc');
  const [editingRemarksTaskId, setEditingRemarksTaskId] = useState<string | null>(null);
  const [tempRemarks, setTempRemarks] = useState('');
  const [allUsers, setAllUsers] = useState<UserDetail[]>([]);
  const [actionModal, setActionModal] = useState<{ task: Task; type: 'reassign' | 'collaborate' | 'request' } | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [requestType, setRequestType] = useState<'approval' | 'assist'>('approval');
  const [requestNote, setRequestNote] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let ep = '/tasks/';
      if (activeTab === 'my') ep = '/tasks/my-tasks/';
      if (activeTab === 'assigned') ep = '/tasks/assigned-by-me/';
      if (activeTab === 'collaborating') ep = '/tasks/collaborating/';
      const res = await api.get(ep);
      setTasks(res.data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [activeTab]);
  useEffect(() => { api.get('/users/').then(r => setAllUsers(r.data)).catch(() => {}); }, []);

  const updateStatus = async (id: string, s: string) => {
    await api.patch(`/tasks/${id}/status/`, { status: s }); fetchTasks();
  };
  const saveRemarks = async (id: string) => {
    await api.patch(`/tasks/${id}/`, { remarks: tempRemarks });
    setEditingRemarksTaskId(null); fetchTasks();
  };
  const removeCollaborator = async (taskId: string, userId: string) => {
    await api.post(`/tasks/${taskId}/remove-collaborator/`, { user_id: userId }); fetchTasks();
  };
  const submitAction = async () => {
    if (!actionModal) return;
    const { task, type } = actionModal;
    if (type === 'reassign') {
      await api.patch(`/tasks/${task.id}/reassign/`, { user_id: selectedUserId });
    } else if (type === 'collaborate') {
      await api.post(`/tasks/${task.id}/add-collaborator/`, { user_id: selectedUserId });
    } else if (type === 'request') {
      await api.patch(`/tasks/${task.id}/request-action/`, { action_type: requestType, remarks: requestNote });
    }
    setActionModal(null); setSelectedUserId(''); setRequestNote(''); fetchTasks();
  };

  const getPriorityClass = (p: string) => ({ 'High': 'bg-danger text-white', 'Medium': 'bg-warning text-dark', 'Low': 'bg-info text-dark' }[p] || 'bg-secondary text-white');
  const getStatusStyle = (s: string) => {
    if (s === 'Completed') return { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0', borderWidth: '1px' };
    if (s === 'In-Progress') return { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe', borderWidth: '1px' };
    if (s === 'Awaiting-Approval') return { backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#e9d5ff', borderWidth: '1px' };
    if (s === 'Assist-Requested') return { backgroundColor: '#ffe4e6', color: '#e11d48', borderColor: '#fecdd3', borderWidth: '1px' };
    return { backgroundColor: '#fef9c3', color: '#a16207', borderColor: '#fef08a', borderWidth: '1px' }; // Pending
  };
  const isOverdue = (t: Task) => t.status !== 'Completed' && t.due_date && new Date(t.due_date) < new Date();
  const getInitials = (name?: string) => name ? name.slice(0, 2).toUpperCase() : 'U';

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    active: tasks.filter(t => ['In-Progress', 'Pending'].includes(t.status)).length,
    overdue: tasks.filter(isOverdue).length,
    awaiting: tasks.filter(t => ['Awaiting-Approval', 'Assist-Requested'].includes(t.status)).length,
  };
  const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const filtered = tasks
    .filter(t =>
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (t.assigned_to_detail?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       String(t.ticket_number || '').includes(searchTerm)) &&
      (priorityFilter === 'All' || t.priority === priorityFilter) &&
      (statusFilter === 'All' || t.status === statusFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'due_date_asc') return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      if (sortBy === 'due_date_desc') return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      if (sortBy === 'created_newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'priority_high') return ({ High: 3, Medium: 2, Low: 1 }[b.priority] || 0) - ({ High: 3, Medium: 2, Low: 1 }[a.priority] || 0);
      return 0;
    });

  const tabs: { key: typeof activeTab; label: string }[] = [
    { key: 'all', label: 'All Tasks' },
    { key: 'my', label: 'My Tasks' },
    { key: 'assigned', label: 'Assigned By Me' },
    { key: 'collaborating', label: '👥 Collaborating' },
  ];

  return (
    <div className="container-fluid py-2 fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold text-dark mb-1">Office Tasks</h4>
          <p className="text-muted mb-0 small" style={{ fontSize: '0.82rem' }}>
            Collaborative task management with handoffs, approvals and assistance requests.
          </p>
        </div>
        <button className="btn text-white fw-bold px-3 py-1.5 shadow-sm" style={{ backgroundColor: '#10b981', borderRadius: '6px', fontSize: '0.82rem' }} onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-1.5"></i> New Task
        </button>
      </div>

      {/* KPI Row */}
      <div className="row g-2 mb-3">
        {[
          { label: 'Total Tasks', value: stats.total, icon: 'fa-clipboard-list', color: '#10b981' },
          { label: `Completed (${pct}%)`, value: stats.completed, icon: 'fa-check-circle', color: '#22c55e' },
          { label: 'Active / Pending', value: stats.active, icon: 'fa-spinner', color: '#f59e0b' },
          { label: 'Overdue', value: stats.overdue, icon: 'fa-exclamation-circle', color: '#ef4444' },
          { label: 'Needs Attention', value: stats.awaiting, icon: 'fa-bell', color: '#7c3aed' },
        ].map(kpi => (
          <div className="col" key={kpi.label}>
            <div className="task-kpi-card d-flex align-items-center justify-content-between">
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
            {tabs.map(t => (
              <li key={t.key} className="nav-item">
                <button
                  className={`nav-link border-0 fw-semibold px-2.5 py-1.5 rounded-3 ${activeTab === t.key ? 'text-white' : 'text-muted bg-transparent'}`}
                  style={{
                    fontSize: '0.8rem',
                    ...(activeTab === t.key ? { backgroundColor: '#10b981' } : {})
                  }}
                  onClick={() => setActiveTab(t.key)}
                >{t.label}</button>
              </li>
            ))}
          </ul>
          <div className="d-flex flex-wrap gap-1.5">
            <input type="text" placeholder="Search..." className="search-input" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="due_date_asc">Due (Soonest)</option>
              <option value="due_date_desc">Due (Latest)</option>
              <option value="created_newest">Created (Newest)</option>
              <option value="priority_high">Priority (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
      ) : (
        <div className="bg-white border rounded-4 shadow-sm mb-4">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-clipboard-check fa-3x mb-3 d-block text-light"></i>
              <p className="fw-semibold">No tasks found.</p>
              <button className="btn btn-sm btn-outline-success" onClick={() => { setSearchTerm(''); setPriorityFilter('All'); setStatusFilter('All'); }}>Clear Filters</button>
            </div>
          ) : (
            <div className="table-responsive" style={{ minHeight: '280px' }}>
              <table className="table align-middle tasks-table mb-0">
                <thead>
                  <tr>
                    <th style={{ borderTopLeftRadius: '1rem' }}>Ticket</th>
                    <th>Task Details</th>
                    <th>Assignee & Collaborators</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Dates</th>
                    <th style={{ minWidth: '220px', borderTopRightRadius: '1rem' }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(task => (
                    <tr key={task.id}>
                      {/* Ticket */}
                      <td>
                        <span className="fw-bold small" style={{ color: '#10b981' }}>#TSK-{task.ticket_number || 'N/A'}</span>
                      </td>

                      {/* Details */}
                      <td>
                        <div className="fw-bold text-dark">{task.title}</div>
                        <div className="text-muted" style={{ fontSize: '0.78rem', maxWidth: '220px' }} title={task.description}>
                          {(task.description || 'No description.').slice(0, 80)}{task.description && task.description.length > 80 ? '…' : ''}
                        </div>
                      </td>

                      {/* Assignee & Collaborators */}
                      <td>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <div className="task-avatar" title={task.assigned_to_detail?.username}>{getInitials(task.assigned_to_detail?.username)}</div>
                          <div>
                            <div className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>{task.assigned_to_detail?.username || 'Unassigned'}</div>
                            <div className="text-muted" style={{ fontSize: '0.68rem' }}>Assignee</div>
                          </div>
                        </div>
                        {(task.collaborators_detail || []).length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mt-1">
                            {task.collaborators_detail!.map(c => (
                              <span key={c.id} className="badge bg-light text-dark border d-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}
                                title={c.username}>
                                <span className="task-avatar" style={{ width: '16px', height: '16px', fontSize: '0.55rem' }}>{getInitials(c.username)}</span>
                                {c.username}
                                {task.status !== 'Completed' && (
                                  <button className="btn-close" style={{ fontSize: '0.4rem' }} onClick={() => removeCollaborator(task.id, String(c.id))} title="Remove collaborator" />
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                        {task.status !== 'Completed' && (
                          <button className="btn btn-link btn-sm p-0 mt-1 text-muted" style={{ fontSize: '0.72rem' }} onClick={() => { setActionModal({ task, type: 'collaborate' }); setSelectedUserId(''); }}>
                            <i className="fas fa-user-plus me-1"></i>Add collaborator
                          </button>
                        )}
                      </td>

                      {/* Priority */}
                      <td>
                        <span className={`badge ${getPriorityClass(task.priority)}`} style={{ borderRadius: '6px' }}>{task.priority}</span>
                      </td>

                      {/* Status */}
                      <td>
                        <div className="d-flex align-items-center gap-1 flex-wrap">
                          <span className="badge border" style={{ ...getStatusStyle(task.status), borderRadius: '6px', fontSize: '0.72rem' }}>{task.status}</span>
                          {task.status !== 'Completed' && (
                            <div className="dropdown">
                              <button className="btn btn-sm btn-link p-0 text-muted" type="button" data-bs-toggle="dropdown" title="Change status">
                                <i className="fas fa-edit"></i>
                              </button>
                              <ul className="dropdown-menu shadow border-0" style={{ borderRadius: '12px', fontSize: '0.85rem' }}>
                                {ALL_STATUSES.map(s => <li key={s}><button className="dropdown-item" onClick={() => updateStatus(task.id, s)}>{s}</button></li>)}
                              </ul>
                            </div>
                          )}
                        </div>
                        {task.status !== 'Completed' && (
                          <div className="d-flex gap-1 mt-1 flex-wrap">
                            <button className="btn btn-xs py-0 px-1 text-white" style={{ fontSize: '0.65rem', backgroundColor: '#7c3aed', borderRadius: '4px' }}
                              onClick={() => { setActionModal({ task, type: 'request' }); setRequestType('approval'); setRequestNote(''); }}>
                              ✋ Approval
                            </button>
                            <button className="btn btn-xs py-0 px-1 text-white" style={{ fontSize: '0.65rem', backgroundColor: '#ea580c', borderRadius: '4px' }}
                              onClick={() => { setActionModal({ task, type: 'request' }); setRequestType('assist'); setRequestNote(''); }}>
                              🆘 Assist
                            </button>
                            <button className="btn btn-xs py-0 px-1 text-white" style={{ fontSize: '0.65rem', backgroundColor: '#0369a1', borderRadius: '4px' }}
                              onClick={() => { setActionModal({ task, type: 'reassign' }); setSelectedUserId(''); }}>
                              🔁 Handoff
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Dates */}
                      <td>
                        <div style={{ fontSize: '0.78rem' }} className="text-muted">
                          <div><i className="far fa-calendar me-1"></i>{task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</div>
                          <div className="mt-1">
                            <i className="far fa-calendar-alt me-1"></i>{new Date(task.due_date).toLocaleDateString()}
                            {isOverdue(task) && <span className="overdue-tag ms-1"><i className="fas fa-calendar-times"></i> Overdue</span>}
                          </div>
                        </div>
                      </td>

                      {/* Remarks */}
                      <td>
                        <div className="p-2 rounded-3" style={{ backgroundColor: '#f8fafc', borderLeft: '3px solid #10b981' }}>
                          <div className="d-flex justify-content-between mb-1">
                            <strong style={{ fontSize: '0.7rem' }}>Notes</strong>
                            {task.status !== 'Completed' && editingRemarksTaskId !== task.id && (
                              <button className="btn btn-link btn-sm p-0 text-muted" style={{ fontSize: '0.68rem', textDecoration: 'none' }}
                                onClick={() => { setEditingRemarksTaskId(task.id); setTempRemarks(task.remarks || ''); }}>
                                <i className="fas fa-pencil-alt"></i> Edit
                              </button>
                            )}
                          </div>
                          {editingRemarksTaskId === task.id ? (
                            <>
                              <textarea className="form-control form-control-sm bg-white mb-1" rows={2} style={{ fontSize: '0.75rem' }}
                                value={tempRemarks} onChange={e => setTempRemarks(e.target.value)} />
                              <div className="d-flex justify-content-end gap-1">
                                <button className="btn btn-xs btn-outline-secondary py-0 px-1" style={{ fontSize: '0.65rem' }} onClick={() => setEditingRemarksTaskId(null)}>Cancel</button>
                                <button className="btn btn-xs btn-success py-0 px-1 text-white" style={{ fontSize: '0.65rem' }} onClick={() => saveRemarks(task.id)}>Save</button>
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: '0.75rem', maxHeight: '60px', overflow: 'hidden', whiteSpace: 'pre-line' }} className="text-muted">
                              {task.remarks || 'No remarks.'}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Task Modal */}
      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} onCreated={fetchTasks} />}

      {/* Collaboration / Reassign / Request Action Modal */}
      {actionModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  {actionModal.type === 'reassign' && '🔁 Handoff Task'}
                  {actionModal.type === 'collaborate' && '👥 Add Collaborator'}
                  {actionModal.type === 'request' && '📣 Request Approval / Assistance'}
                </h5>
                <button className="btn-close" onClick={() => setActionModal(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Task: <strong>#{actionModal.task.ticket_number} — {actionModal.task.title}</strong>
                </p>

                {(actionModal.type === 'reassign' || actionModal.type === 'collaborate') && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      {actionModal.type === 'reassign' ? 'Reassign To' : 'Add Collaborator'}
                    </label>
                    <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                      <option value="">Select user...</option>
                      {allUsers.map(u => <option key={u.id} value={u.uuid || u.id}>{u.username}</option>)}
                    </select>
                    {actionModal.type === 'reassign' && (
                      <div className="alert alert-info mt-2 py-2 small">
                        <i className="fas fa-info-circle me-1"></i>
                        Current assignee will be moved to collaborators automatically.
                      </div>
                    )}
                  </div>
                )}

                {actionModal.type === 'request' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Request Type</label>
                      <div className="d-flex gap-2">
                        <button className={`btn flex-fill ${requestType === 'approval' ? 'text-white' : 'btn-outline-secondary'}`}
                          style={requestType === 'approval' ? { backgroundColor: '#7c3aed' } : {}}
                          onClick={() => setRequestType('approval')}>
                          ✋ Request Approval
                        </button>
                        <button className={`btn flex-fill ${requestType === 'assist' ? 'text-white' : 'btn-outline-secondary'}`}
                          style={requestType === 'assist' ? { backgroundColor: '#ea580c' } : {}}
                          onClick={() => setRequestType('assist')}>
                          🆘 Request Assist
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Note / Reason</label>
                      <textarea className="form-control bg-light" rows={3} value={requestNote}
                        onChange={e => setRequestNote(e.target.value)}
                        placeholder="Describe what approval or assistance is needed..." />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light fw-semibold" onClick={() => setActionModal(null)}>Cancel</button>
                <button className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} onClick={submitAction}
                  disabled={actionModal.type !== 'request' && !selectedUserId}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskBoard;

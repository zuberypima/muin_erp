import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import TaskDetailModal from './TaskDetailModal';

interface UserDetail { id: number; uuid: string; username: string; email: string; }

interface Task {
  id: string;
  ticket_number?: number;
  title: string;
  description: string;
  remarks?: string;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  assigned_to_detail?: UserDetail;
  assigned_by_detail?: UserDetail;
  collaborators_detail?: UserDetail[];
}

type PageMode = 'approval' | 'assist';

const RequestsInbox: React.FC<{ mode: PageMode }> = ({ mode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [actionTaskId, setActionTaskId] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [actionResult, setActionResult] = useState<'approve' | 'reject' | 'in-progress' | null>(null);

  const targetStatus = mode === 'approval' ? 'Awaiting-Approval' : 'Assist-Requested';
  const title = mode === 'approval' ? 'Approval Requests' : 'Assistance Requests';
  const icon = mode === 'approval' ? 'fa-check-circle' : 'fa-life-ring';
  const color = mode === 'approval' ? '#7c3aed' : '#ea580c';

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/');
      setTasks(res.data.filter((t: Task) => t.status === targetStatus));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [mode]);

  const getPriorityClass = (p: string) =>
    ({ High: 'bg-danger text-white', Medium: 'bg-warning text-dark', Low: 'bg-info text-dark' }[p] || 'bg-secondary text-white');

  const isOverdue = (t: Task) => t.status !== 'Completed' && new Date(t.due_date) < new Date();

  const getInitials = (name?: string) => name ? name.slice(0, 2).toUpperCase() : 'U';

  const submitAction = async (taskId: string) => {
    if (!actionResult) return;
    let newStatus = '';
    if (actionResult === 'approve') newStatus = 'Completed';
    if (actionResult === 'reject') newStatus = 'Pending';
    if (actionResult === 'in-progress') newStatus = 'In-Progress';

    try {
      // Update status
      await api.patch(`/tasks/${taskId}/status/`, { status: newStatus });
      // Append the resolution note to remarks
      if (actionNote.trim()) {
        const task = tasks.find(t => t.id === taskId);
        const updatedRemarks = (task?.remarks || '') + `\n[${actionResult.toUpperCase()} by reviewer]: ${actionNote}`;
        await api.patch(`/tasks/${taskId}/`, { remarks: updatedRemarks });
      }
      setActionTaskId(null);
      setActionNote('');
      setActionResult(null);
      fetchTasks();
    } catch (e) {
      console.error('Failed to update task', e);
    }
  };

  return (
    <div className="container-fluid py-2 fade-in">
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div className="rounded-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', backgroundColor: color + '20' }}>
          <i className={`fas ${icon} fa-lg`} style={{ color }}></i>
        </div>
        <div>
          <h2 className="fw-bold text-dark mb-0">{title}</h2>
          <p className="text-muted mb-0 small">
            {mode === 'approval'
              ? 'Review tasks awaiting your approval and mark them resolved or rejected.'
              : 'View tasks where assistance has been requested and take action.'}
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="p-3 rounded-3 border bg-white shadow-sm d-flex align-items-center gap-3">
            <i className="fas fa-inbox fa-2x" style={{ color }}></i>
            <div>
              <div className="text-muted small fw-semibold">Pending Requests</div>
              <div className="fs-2 fw-bold">{tasks.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 rounded-3 border bg-white shadow-sm d-flex align-items-center gap-3">
            <i className="fas fa-exclamation-triangle fa-2x text-danger"></i>
            <div>
              <div className="text-muted small fw-semibold">Overdue Requests</div>
              <div className="fs-2 fw-bold text-danger">{tasks.filter(isOverdue).length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 rounded-3 border bg-white shadow-sm d-flex align-items-center gap-3">
            <i className="fas fa-users fa-2x text-primary"></i>
            <div>
              <div className="text-muted small fw-semibold">People Involved</div>
              <div className="fs-2 fw-bold">{new Set(tasks.map(t => t.assigned_to_detail?.id)).size}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color }}></div></div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-5 bg-white border rounded-4 shadow-sm">
          <i className="fas fa-check-double fa-3x mb-3 text-success d-block"></i>
          <h5 className="fw-bold text-dark">All Clear!</h5>
          <p className="text-muted">No pending {mode === 'approval' ? 'approval' : 'assistance'} requests at this time.</p>
        </div>
      ) : (
        <div className="bg-white border rounded-4 shadow-sm overflow-hidden">
          <div className="table-responsive">
            <table className="table align-middle tasks-table mb-0">
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>Task</th>
                  <th>Requested By</th>
                  <th>Collaborators</th>
                  <th>Priority</th>
                  <th>Due Date</th>
                  <th style={{ minWidth: '200px' }}>Notes / Remarks</th>
                  <th className="text-end" style={{ minWidth: '180px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map(task => (
                  <tr key={task.id} className="clickable-row" onClick={() => setPreviewTask(task)} title="Click row to preview task details">
                    {/* Ticket */}
                    <td>
                      <button
                        className="btn btn-link p-0 fw-bold small text-decoration-none d-flex align-items-center gap-1"
                        style={{ color: '#10b981' }}
                        onClick={(e) => { e.stopPropagation(); setPreviewTask(task); }}
                        title="Click to preview task details"
                      >
                        <i className="fas fa-search-plus" style={{ fontSize: '0.75rem' }}></i>
                        #TSK-{task.ticket_number || 'N/A'}
                      </button>
                    </td>

                    {/* Task */}
                    <td>
                      <div className="d-flex align-items-center gap-1.5">
                        <button
                          className="btn btn-link p-0 fw-bold text-dark text-start text-decoration-none"
                          onClick={(e) => { e.stopPropagation(); setPreviewTask(task); }}
                          title="Click to preview task details"
                        >
                          {task.title}
                        </button>
                        <i className="fas fa-external-link-alt text-muted ms-1" style={{ fontSize: '0.68rem', opacity: 0.6 }} title="Clickable row"></i>
                      </div>
                      <div className="text-muted cursor-pointer" style={{ fontSize: '0.78rem', maxWidth: '200px' }}>
                        {(task.description || 'No description.').slice(0, 70)}{(task.description || '').length > 70 ? '…' : ''}
                      </div>
                    </td>

                    {/* Requested By (assignee) */}
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="task-avatar">{getInitials(task.assigned_to_detail?.username)}</div>
                        <div>
                          <div className="small fw-semibold" style={{ fontSize: '0.8rem' }}>{task.assigned_to_detail?.username || 'N/A'}</div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>Assignee</div>
                        </div>
                      </div>
                      {task.assigned_by_detail && (
                        <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                          <i className="fas fa-user-edit me-1"></i>Assigned By: {task.assigned_by_detail.username}
                        </div>
                      )}
                    </td>

                    {/* Collaborators */}
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(task.collaborators_detail || []).length === 0
                          ? <span className="text-muted small">None</span>
                          : task.collaborators_detail!.map(c => (
                            <span key={c.id} className="badge bg-light text-dark border" style={{ fontSize: '0.7rem' }}>{c.username}</span>
                          ))}
                      </div>
                    </td>

                    {/* Priority */}
                    <td>
                      <span className={`badge ${getPriorityClass(task.priority)}`} style={{ borderRadius: '6px' }}>{task.priority}</span>
                      {isOverdue(task) && (
                        <div className="mt-1">
                          <span className="overdue-tag"><i className="fas fa-calendar-times"></i> Overdue</span>
                        </div>
                      )}
                    </td>

                    {/* Due Date */}
                    <td>
                      <div style={{ fontSize: '0.78rem' }} className="text-muted">
                        <i className="far fa-calendar-alt me-1"></i>{new Date(task.due_date).toLocaleDateString()}
                      </div>
                    </td>

                    {/* Notes / Remarks */}
                    <td>
                      <div style={{ fontSize: '0.75rem', maxHeight: '50px', overflow: 'hidden' }} className="text-muted">
                        {task.remarks || 'No remarks.'}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="text-end" onClick={(e) => e.stopPropagation()}>
                      {actionTaskId === task.id ? (
                        <div className="p-2 rounded-3 border bg-white shadow-sm" style={{ maxWidth: '280px' }}>
                          <div className="d-flex gap-1 mb-2 flex-wrap">
                            <button className={`btn btn-xs py-0 px-2 ${actionResult === 'approve' ? 'btn-success text-white' : 'btn-outline-success'}`}
                              style={{ fontSize: '0.68rem' }} onClick={() => setActionResult('approve')}>
                              ✓ {mode === 'approval' ? 'Approve' : 'Resolve'}
                            </button>
                            <button className={`btn btn-xs py-0 px-2 ${actionResult === 'in-progress' ? 'btn-primary text-white' : 'btn-outline-primary'}`}
                              style={{ fontSize: '0.68rem' }} onClick={() => setActionResult('in-progress')}>
                              🔄 Resume Work
                            </button>
                            <button className={`btn btn-xs py-0 px-2 ${actionResult === 'reject' ? 'btn-danger text-white' : 'btn-outline-danger'}`}
                              style={{ fontSize: '0.68rem' }} onClick={() => setActionResult('reject')}>
                              ❌ {mode === 'approval' ? 'Reject' : 'Decline'}
                            </button>
                          </div>
                          <textarea
                            className="form-control form-control-sm mb-2 bg-light"
                            rows={2}
                            style={{ fontSize: '0.72rem' }}
                            value={actionNote}
                            onChange={e => setActionNote(e.target.value)}
                            placeholder="Add a resolution note (optional)..."
                          />
                          <div className="d-flex gap-1 justify-content-end">
                            <button className="btn btn-xs btn-outline-secondary py-0 px-2" style={{ fontSize: '0.65rem' }}
                              onClick={() => { setActionTaskId(null); setActionNote(''); setActionResult(null); }}>
                              Cancel
                            </button>
                            <button className="btn btn-xs text-white py-0 px-2" style={{ fontSize: '0.65rem', backgroundColor: color }}
                              disabled={!actionResult} onClick={() => submitAction(task.id)}>
                              Submit
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="d-flex align-items-center justify-content-end gap-1.5">
                          <button
                            className="preview-row-btn"
                            onClick={() => setPreviewTask(task)}
                            title="Click to preview task details"
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                          <button className="btn btn-sm text-white fw-semibold px-3"
                            style={{ backgroundColor: color, borderRadius: '8px' }}
                            onClick={() => { setActionTaskId(task.id); setActionResult(null); setActionNote(''); }}>
                            <i className={`fas ${mode === 'approval' ? 'fa-gavel' : 'fa-hands-helping'} me-1`}></i>
                            {mode === 'approval' ? 'Review' : 'Respond'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Preview Modal */}
      {previewTask && (
        <TaskDetailModal
          task={previewTask}
          onClose={() => setPreviewTask(null)}
          onUpdate={fetchTasks}
        />
      )}
    </div>
  );
};

export default RequestsInbox;

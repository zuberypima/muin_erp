import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import './Tasks.css';

export interface UserDetail {
  id: number;
  uuid: string;
  username: string;
  email: string;
}

export interface Task {
  id: string;
  ticket_number?: number;
  title: string;
  description: string;
  remarks?: string;
  assigned_to?: string;
  assigned_to_detail?: UserDetail;
  assigned_by_detail?: UserDetail;
  collaborators?: string[];
  collaborators_detail?: UserDetail[];
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
  updated_at?: string;
}

interface TaskDetailModalProps {
  taskId?: string | null;
  task?: Task | null;
  onClose: () => void;
  onUpdate?: () => void;
}

const ALL_STATUSES = ['Pending', 'In-Progress', 'Awaiting-Approval', 'Assist-Requested', 'Completed'];

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ taskId, task: initialTask, onClose, onUpdate }) => {
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(initialTask || null);
  const [loading, setLoading] = useState<boolean>(!initialTask && !!taskId);
  const [allUsers, setAllUsers] = useState<UserDetail[]>([]);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarksText, setRemarksText] = useState('');

  // Action modal states
  const [actionType, setActionType] = useState<'reassign' | 'collaborate' | 'request' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [requestType, setRequestType] = useState<'approval' | 'assist'>('approval');
  const [requestNote, setRequestNote] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchTask = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/tasks/${id}/`);
      setTask(res.data);
      setRemarksText(res.data.remarks || '');
    } catch (err) {
      console.error('Failed to fetch task details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTask) {
      setTask(initialTask);
      setRemarksText(initialTask.remarks || '');
    } else if (taskId) {
      fetchTask(taskId);
    }
  }, [taskId, initialTask]);

  useEffect(() => {
    api.get('/users/')
      .then(r => {
        const dataArr = Array.isArray(r.data) ? r.data : (r.data?.results || []);
        setAllUsers(dataArr);
      })
      .catch(() => {});
  }, []);

  if (!taskId && !initialTask) return null;

  const updateStatus = async (newStatus: string) => {
    if (!task) return;
    try {
      await api.patch(`/tasks/${task.id}/status/`, { status: newStatus });
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleSaveRemarks = async () => {
    if (!task) return;
    try {
      await api.patch(`/tasks/${task.id}/`, { remarks: remarksText });
      setTask(prev => prev ? { ...prev, remarks: remarksText } : null);
      setEditingRemarks(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to save remarks', err);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!task) return;
    try {
      await api.post(`/tasks/${task.id}/remove-collaborator/`, { user_id: userId });
      if (task.id) fetchTask(task.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to remove collaborator', err);
    }
  };

  const handleActionSubmit = async () => {
    if (!task || !actionType) return;
    try {
      if (actionType === 'reassign') {
        await api.patch(`/tasks/${task.id}/reassign/`, { user_id: selectedUserId });
      } else if (actionType === 'collaborate') {
        await api.post(`/tasks/${task.id}/add-collaborator/`, { user_id: selectedUserId });
      } else if (actionType === 'request') {
        await api.patch(`/tasks/${task.id}/request-action/`, { action_type: requestType, remarks: requestNote });
      }
      setActionType(null);
      setSelectedUserId('');
      setRequestNote('');
      if (task.id) fetchTask(task.id);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed submit action:', err);
    }
  };

  const handleCopyLink = () => {
    if (!task) return;
    const url = `${window.location.origin}/tasks/${task.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const getPriorityClass = (p?: string) =>
    ({ High: 'bg-danger text-white', Medium: 'bg-warning text-dark', Low: 'bg-info text-dark' }[p || ''] || 'bg-secondary text-white');

  const getStatusStyle = (s?: string) => {
    if (s === 'Completed') return { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0', borderWidth: '1px' };
    if (s === 'In-Progress') return { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe', borderWidth: '1px' };
    if (s === 'Awaiting-Approval') return { backgroundColor: '#f3e8ff', color: '#7c3aed', borderColor: '#e9d5ff', borderWidth: '1px' };
    if (s === 'Assist-Requested') return { backgroundColor: '#ffe4e6', color: '#e11d48', borderColor: '#fecdd3', borderWidth: '1px' };
    return { backgroundColor: '#fef9c3', color: '#a16207', borderColor: '#fef08a', borderWidth: '1px' };
  };

  const isOverdue = task?.status !== 'Completed' && task?.due_date && new Date(task.due_date) < new Date();
  const getInitials = (name?: string) => name ? name.slice(0, 2).toUpperCase() : 'U';

  return createPortal(
    <div
      className="modal fade show d-block"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1055,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
      tabIndex={-1}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-dialog modal-lg modal-dialog-scrollable my-auto" style={{ maxWidth: '860px', width: '100%', margin: 'auto' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          
          {/* Header */}
          <div className="modal-header border-0 bg-light px-4 py-3 align-items-center">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge px-2.5 py-1.5 fw-bold" style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontSize: '0.85rem' }}>
                <i className="fas fa-ticket-alt me-1.5"></i>#TSK-{task?.ticket_number || 'N/A'}
              </span>
              {task?.status && (
                <span className="badge border px-2.5 py-1.5 fw-semibold" style={{ ...getStatusStyle(task.status), borderRadius: '8px', fontSize: '0.82rem' }}>
                  {task.status}
                </span>
              )}
              {task?.priority && (
                <span className={`badge px-2.5 py-1.5 fw-semibold ${getPriorityClass(task.priority)}`} style={{ borderRadius: '8px', fontSize: '0.82rem' }}>
                  {task.priority} Priority
                </span>
              )}
              {isOverdue && (
                <span className="overdue-tag">
                  <i className="fas fa-exclamation-circle me-1"></i>Overdue
                </span>
              )}
            </div>

            <div className="d-flex align-items-center gap-2 ms-auto">
              <button 
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={handleCopyLink}
                title="Copy Direct Link to Task"
                style={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                <i className={`fas ${copySuccess ? 'fa-check text-success' : 'fa-link'}`}></i>
                {copySuccess ? 'Copied!' : 'Copy Link'}
              </button>
              <button 
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={() => {
                  onClose();
                  if (task?.id) navigate(`/tasks/${task.id}`);
                }}
                title="Open Full Page View"
                style={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                <i className="fas fa-external-link-alt"></i> Full Page
              </button>
              <button className="btn-close ms-2" onClick={onClose} aria-label="Close"></button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-4" style={{ backgroundColor: '#ffffff' }}>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status"></div>
                <p className="text-muted mt-2 small">Loading task details...</p>
              </div>
            ) : !task ? (
              <div className="text-center py-5 text-muted">
                <i className="fas fa-exclamation-triangle fa-2x mb-2 text-warning"></i>
                <p>Task details could not be loaded.</p>
              </div>
            ) : (
              <div>
                {/* Title */}
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.4rem', lineHeight: '1.3' }}>
                  {task.title}
                </h3>

                {/* Metadata Grid */}
                <div className="row g-3 mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  
                  {/* Assignee */}
                  <div className="col-md-6 col-lg-3">
                    <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="fas fa-user-check me-1 text-success"></i>Assignee
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="task-avatar" title={task.assigned_to_detail?.email}>
                        {getInitials(task.assigned_to_detail?.username)}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                          {task.assigned_to_detail?.username || 'Unassigned'}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                          {task.assigned_to_detail?.email || ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Assigned By */}
                  <div className="col-md-6 col-lg-3">
                    <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="fas fa-user-edit me-1 text-primary"></i>Assigned By
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <div className="task-avatar" style={{ backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }}>
                        {getInitials(task.assigned_by_detail?.username)}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>
                          {task.assigned_by_detail?.username || 'System'}
                        </div>
                        <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                          {task.assigned_by_detail?.email || ''}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="col-md-6 col-lg-3">
                    <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="far fa-calendar-alt me-1 text-warning"></i>Due Date
                    </div>
                    <div className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>
                      {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No due date'}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Created: {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>

                  {/* Quick Status Control */}
                  <div className="col-md-6 col-lg-3">
                    <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="fas fa-sliders-h me-1 text-purple"></i>Status Handoff
                    </div>
                    <select
                      className="form-select form-select-sm border-secondary-subtle fw-semibold"
                      style={{ fontSize: '0.8rem', borderRadius: '6px' }}
                      value={task.status}
                      onChange={e => updateStatus(e.target.value)}
                    >
                      {ALL_STATUSES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description Card */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                      <i className="fas fa-align-left text-muted"></i> Full Task Description
                    </h6>
                  </div>
                  <div className="p-3.5 rounded-3 border" style={{ backgroundColor: '#ffffff', minHeight: '100px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem', color: '#334155' }}>
                    {task.description || <span className="text-muted italic">No task description provided.</span>}
                  </div>
                </div>

                {/* Collaborators Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                      <i className="fas fa-users text-info"></i> Collaborators
                      <span className="badge bg-light text-dark border ms-1" style={{ fontSize: '0.7rem' }}>
                        {(task.collaborators_detail || []).length}
                      </span>
                    </h6>
                    <button
                      className="btn btn-sm btn-outline-success py-1 px-2 d-flex align-items-center gap-1"
                      style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                      onClick={() => setActionType('collaborate')}
                    >
                      <i className="fas fa-user-plus"></i> Add Collaborator
                    </button>
                  </div>

                  {(task.collaborators_detail || []).length === 0 ? (
                    <div className="text-muted p-2 rounded-3 border bg-light text-center small" style={{ fontSize: '0.8rem' }}>
                      No collaborators currently assigned to this task.
                    </div>
                  ) : (
                    <div className="d-flex flex-wrap gap-2">
                      {task.collaborators_detail!.map(c => (
                        <div key={c.id} className="d-flex align-items-center gap-2 p-1.5 px-2.5 rounded-3 border bg-light">
                          <div className="task-avatar" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                            {getInitials(c.username)}
                          </div>
                          <div>
                            <div className="fw-semibold text-dark" style={{ fontSize: '0.78rem' }}>{c.username}</div>
                          </div>
                          <button
                            className="btn-close ms-1"
                            style={{ fontSize: '0.55rem' }}
                            onClick={() => handleRemoveCollaborator(String(c.id))}
                            title="Remove collaborator"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Actions / Handoff Toolbar */}
                <div className="p-3 rounded-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-2" style={{ backgroundColor: '#f1f5f9' }}>
                  <div className="fw-bold text-dark small">
                    <i className="fas fa-bolt me-1 text-warning"></i> Workflow Actions:
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className="btn btn-sm text-white fw-medium px-3"
                      style={{ backgroundColor: '#7c3aed', borderRadius: '6px', fontSize: '0.8rem' }}
                      onClick={() => { setActionType('request'); setRequestType('approval'); }}
                    >
                      ✋ Request Approval
                    </button>
                    <button
                      className="btn btn-sm text-white fw-medium px-3"
                      style={{ backgroundColor: '#ea580c', borderRadius: '6px', fontSize: '0.8rem' }}
                      onClick={() => { setActionType('request'); setRequestType('assist'); }}
                    >
                      🆘 Request Assist
                    </button>
                    <button
                      className="btn btn-sm text-white fw-medium px-3"
                      style={{ backgroundColor: '#0369a1', borderRadius: '6px', fontSize: '0.8rem' }}
                      onClick={() => setActionType('reassign')}
                    >
                      🔁 Handoff Task
                    </button>
                  </div>
                </div>

                {/* Remarks & Notes */}
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-1.5">
                      <i className="fas fa-sticky-note text-success"></i> Activity Notes & Remarks
                    </h6>
                    {!editingRemarks && (
                      <button
                        className="btn btn-sm btn-link text-success p-0 text-decoration-none fw-semibold"
                        style={{ fontSize: '0.8rem' }}
                        onClick={() => setEditingRemarks(true)}
                      >
                        <i className="fas fa-edit me-1"></i> Edit Notes
                      </button>
                    )}
                  </div>

                  {editingRemarks ? (
                    <div className="border rounded-3 p-3 bg-light">
                      <textarea
                        className="form-control bg-white mb-2"
                        rows={3}
                        style={{ fontSize: '0.85rem' }}
                        value={remarksText}
                        onChange={e => setRemarksText(e.target.value)}
                        placeholder="Add remarks, update progress, or log notes..."
                      />
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-sm btn-outline-secondary px-3" onClick={() => setEditingRemarks(false)}>Cancel</button>
                        <button className="btn btn-sm btn-success text-white px-3 fw-bold" onClick={handleSaveRemarks}>Save Remarks</button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-3 border" style={{ backgroundColor: '#fafafa', borderLeft: '4px solid #10b981', minHeight: '60px', whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                      {task.remarks || <span className="text-muted italic">No remarks or notes logged yet.</span>}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-0 bg-light px-4 py-3">
            <button className="btn btn-secondary px-4 fw-semibold" style={{ borderRadius: '8px' }} onClick={onClose}>
              Close Preview
            </button>
          </div>

        </div>
      </div>

      {/* Sub-modal for Handoff / Collaborate / Request Action */}
      {actionType && (
        <div
          className="modal fade show d-block"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(2px)',
            zIndex: 1060,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          tabIndex={-1}
          onClick={(e) => {
            if (e.target === e.currentTarget) setActionType(null);
          }}
        >
          <div className="modal-dialog my-auto" style={{ maxWidth: '520px', width: '100%', margin: 'auto' }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">
                  {actionType === 'reassign' && '🔁 Handoff Task'}
                  {actionType === 'collaborate' && '👥 Add Collaborator'}
                  {actionType === 'request' && '📣 Request Approval / Assistance'}
                </h5>
                <button className="btn-close" onClick={() => setActionType(null)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted small mb-3">
                  Task: <strong>#{task?.ticket_number} — {task?.title}</strong>
                </p>

                {(actionType === 'reassign' || actionType === 'collaborate') && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">
                      {actionType === 'reassign' ? 'Reassign / Handoff To' : 'Select Collaborator'}
                    </label>
                    <select className="form-select" value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}>
                      <option value="">Select user...</option>
                      {allUsers.map(u => (
                        <option key={u.id} value={u.uuid || u.id}>{u.username} ({u.email})</option>
                      ))}
                    </select>
                    {actionType === 'reassign' && (
                      <div className="alert alert-info mt-2 py-2 small mb-0">
                        <i className="fas fa-info-circle me-1"></i> Current assignee will automatically be retained as a collaborator.
                      </div>
                    )}
                  </div>
                )}

                {actionType === 'request' && (
                  <>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Request Category</label>
                      <div className="d-flex gap-2">
                        <button
                          className={`btn flex-fill ${requestType === 'approval' ? 'text-white' : 'btn-outline-secondary'}`}
                          style={requestType === 'approval' ? { backgroundColor: '#7c3aed' } : {}}
                          onClick={() => setRequestType('approval')}
                        >
                          ✋ Request Approval
                        </button>
                        <button
                          className={`btn flex-fill ${requestType === 'assist' ? 'text-white' : 'btn-outline-secondary'}`}
                          style={requestType === 'assist' ? { backgroundColor: '#ea580c' } : {}}
                          onClick={() => setRequestType('assist')}
                        >
                          🆘 Request Assist
                        </button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-semibold small">Detailed Note / Reason</label>
                      <textarea
                        className="form-control bg-light"
                        rows={3}
                        value={requestNote}
                        onChange={e => setRequestNote(e.target.value)}
                        placeholder="Explain why approval or assistance is required..."
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light fw-semibold" onClick={() => setActionType(null)}>Cancel</button>
                <button
                  className="btn text-white fw-bold px-4"
                  style={{ backgroundColor: '#10b981' }}
                  onClick={handleActionSubmit}
                  disabled={actionType !== 'request' && !selectedUserId}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default TaskDetailModal;

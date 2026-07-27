import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { Task, UserDetail } from './TaskDetailModal';
import './Tasks.css';

const ALL_STATUSES = ['Pending', 'In-Progress', 'Awaiting-Approval', 'Assist-Requested', 'Completed'];

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<UserDetail[]>([]);
  const [editingRemarks, setEditingRemarks] = useState(false);
  const [remarksText, setRemarksText] = useState('');
  const [actionType, setActionType] = useState<'reassign' | 'collaborate' | 'request' | null>(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [requestType, setRequestType] = useState<'approval' | 'assist'>('approval');
  const [requestNote, setRequestNote] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchTaskDetails = async () => {
    if (!taskId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/tasks/${taskId}/`);
      setTask(res.data);
      setRemarksText(res.data.remarks || '');
    } catch (err: any) {
      console.error('Error fetching task detail page:', err);
      setError('Task could not be found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  useEffect(() => {
    api.get('/users/').then(r => setAllUsers(r.data)).catch(() => {});
  }, []);

  const updateStatus = async (newStatus: string) => {
    if (!task) return;
    try {
      await api.patch(`/tasks/${task.id}/status/`, { status: newStatus });
      setTask(prev => prev ? { ...prev, status: newStatus } : null);
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
    } catch (err) {
      console.error('Failed to save remarks', err);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    if (!task) return;
    try {
      await api.post(`/tasks/${task.id}/remove-collaborator/`, { user_id: userId });
      fetchTaskDetails();
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
      fetchTaskDetails();
    } catch (err) {
      console.error('Failed to submit workflow action:', err);
    }
  };

  const handleCopyLink = () => {
    const url = window.location.href;
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

  return (
    <div className="container-fluid py-3 fade-in" style={{ maxWidth: '1200px' }}>
      
      {/* Top Header & Navigation */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <button
          className="btn btn-outline-secondary d-flex align-items-center gap-2 fw-semibold px-3 py-1.5"
          style={{ borderRadius: '8px', fontSize: '0.85rem' }}
          onClick={() => navigate('/tasks')}
        >
          <i className="fas fa-arrow-left"></i> Back to Task Board
        </button>

        <div className="d-flex align-items-center gap-2">
          <button
            className="btn btn-outline-primary d-flex align-items-center gap-1.5 px-3 py-1.5 fw-semibold"
            style={{ borderRadius: '8px', fontSize: '0.85rem' }}
            onClick={handleCopyLink}
          >
            <i className={`fas ${copySuccess ? 'fa-check text-success' : 'fa-copy'}`}></i>
            {copySuccess ? 'Link Copied!' : 'Copy Direct Link'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-5 rounded-4 shadow-sm border text-center my-4">
          <div className="spinner-border text-success" role="status"></div>
          <p className="text-muted mt-3 fw-semibold">Loading task details...</p>
        </div>
      ) : error || !task ? (
        <div className="bg-white p-5 rounded-4 shadow-sm border text-center my-4">
          <i className="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
          <h4 className="fw-bold text-dark">Task Not Found</h4>
          <p className="text-muted mb-4">{error || 'The requested task could not be retrieved.'}</p>
          <button className="btn btn-success fw-bold px-4" onClick={() => navigate('/tasks')}>
            Return to Tasks
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-4 shadow-sm border p-4 mb-4">
          
          {/* Header Row */}
          <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                <span className="badge px-3 py-1.5 fw-bold" style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontSize: '0.9rem' }}>
                  <i className="fas fa-ticket-alt me-1.5"></i>#TSK-{task.ticket_number || 'N/A'}
                </span>
                <span className="badge border px-3 py-1.5 fw-semibold" style={{ ...getStatusStyle(task.status), borderRadius: '8px', fontSize: '0.85rem' }}>
                  {task.status}
                </span>
                <span className={`badge px-3 py-1.5 fw-semibold ${getPriorityClass(task.priority)}`} style={{ borderRadius: '8px', fontSize: '0.85rem' }}>
                  {task.priority} Priority
                </span>
                {isOverdue && (
                  <span className="overdue-tag">
                    <i className="fas fa-exclamation-circle me-1"></i>Overdue
                  </span>
                )}
              </div>
              <h2 className="fw-bold text-dark mb-1" style={{ fontSize: '1.6rem' }}>
                {task.title}
              </h2>
            </div>

            {/* Quick Status Control */}
            <div className="d-flex align-items-center gap-2">
              <label className="fw-bold text-muted small mb-0 me-1">Status:</label>
              <select
                className="form-select border-secondary-subtle fw-semibold"
                style={{ fontSize: '0.88rem', borderRadius: '8px', minWidth: '180px' }}
                value={task.status}
                onChange={e => updateStatus(e.target.value)}
              >
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="my-4 text-muted" style={{ opacity: 0.15 }} />

          {/* Metadata Grid */}
          <div className="row g-3 mb-4 p-3.5 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
            
            {/* Assignee */}
            <div className="col-md-6 col-lg-3">
              <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fas fa-user-check me-1 text-success"></i>Assignee
              </div>
              <div className="d-flex align-items-center gap-2.5">
                <div className="task-avatar" style={{ width: '36px', height: '36px' }}>
                  {getInitials(task.assigned_to_detail?.username)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>
                    {task.assigned_to_detail?.username || 'Unassigned'}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                    {task.assigned_to_detail?.email || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned By */}
            <div className="col-md-6 col-lg-3">
              <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fas fa-user-edit me-1 text-primary"></i>Assigned By
              </div>
              <div className="d-flex align-items-center gap-2.5">
                <div className="task-avatar" style={{ width: '36px', height: '36px', backgroundColor: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }}>
                  {getInitials(task.assigned_by_detail?.username)}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }}>
                    {task.assigned_by_detail?.username || 'System Administrator'}
                  </div>
                  <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                    {task.assigned_by_detail?.email || ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="col-md-6 col-lg-3">
              <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="far fa-calendar-alt me-1 text-warning"></i>Due Date
              </div>
              <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                {task.due_date ? new Date(task.due_date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'No due date'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                Created: {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>

            {/* Collaborators Count */}
            <div className="col-md-6 col-lg-3">
              <div className="text-muted small mb-1 fw-semibold" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <i className="fas fa-users me-1 text-info"></i>Collaborators
              </div>
              <div className="fw-bold text-dark" style={{ fontSize: '0.9rem' }}>
                {(task.collaborators_detail || []).length} Team Members
              </div>
              <button
                className="btn btn-link p-0 text-success fw-semibold text-decoration-none"
                style={{ fontSize: '0.75rem' }}
                onClick={() => setActionType('collaborate')}
              >
                + Add Collaborator
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="mb-4">
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <i className="fas fa-align-left text-muted"></i> Full Task Description
            </h5>
            <div className="p-4 rounded-3 border" style={{ backgroundColor: '#ffffff', minHeight: '120px', whiteSpace: 'pre-wrap', lineHeight: '1.7', fontSize: '0.95rem', color: '#1e293b' }}>
              {task.description || <span className="text-muted italic">No detailed description provided for this task.</span>}
            </div>
          </div>

          {/* Collaborators List */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="fas fa-user-friends text-info"></i> Team Collaborators
              </h5>
              <button
                className="btn btn-sm btn-outline-success fw-semibold px-3"
                style={{ borderRadius: '6px' }}
                onClick={() => setActionType('collaborate')}
              >
                <i className="fas fa-user-plus me-1"></i> Add Collaborator
              </button>
            </div>

            {(task.collaborators_detail || []).length === 0 ? (
              <div className="text-muted p-3 rounded-3 border bg-light text-center small">
                No active collaborators on this task yet. Click "Add Collaborator" to invite team members.
              </div>
            ) : (
              <div className="row g-2">
                {task.collaborators_detail!.map(c => (
                  <div key={c.id} className="col-md-6 col-lg-4">
                    <div className="p-2.5 px-3 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-2 overflow-hidden">
                        <div className="task-avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem' }}>
                          {getInitials(c.username)}
                        </div>
                        <div className="text-truncate">
                          <div className="fw-semibold text-dark text-truncate" style={{ fontSize: '0.85rem' }}>{c.username}</div>
                          <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>{c.email}</div>
                        </div>
                      </div>
                      <button
                        className="btn-close ms-2"
                        style={{ fontSize: '0.6rem' }}
                        onClick={() => handleRemoveCollaborator(String(c.id))}
                        title="Remove collaborator"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Workflow Action Bar */}
          <div className="p-3.5 rounded-3 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3" style={{ backgroundColor: '#f1f5f9' }}>
            <div>
              <div className="fw-bold text-dark">
                <i className="fas fa-tools me-1.5 text-primary"></i> Workflow Actions
              </div>
              <div className="text-muted small">Request team action or reassign this task to another staff member.</div>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                className="btn text-white fw-bold px-3 py-1.5"
                style={{ backgroundColor: '#7c3aed', borderRadius: '8px', fontSize: '0.85rem' }}
                onClick={() => { setActionType('request'); setRequestType('approval'); }}
              >
                ✋ Request Approval
              </button>
              <button
                className="btn text-white fw-bold px-3 py-1.5"
                style={{ backgroundColor: '#ea580c', borderRadius: '8px', fontSize: '0.85rem' }}
                onClick={() => { setActionType('request'); setRequestType('assist'); }}
              >
                🆘 Request Assist
              </button>
              <button
                className="btn text-white fw-bold px-3 py-1.5"
                style={{ backgroundColor: '#0369a1', borderRadius: '8px', fontSize: '0.85rem' }}
                onClick={() => setActionType('reassign')}
              >
                🔁 Handoff Task
              </button>
            </div>
          </div>

          {/* Remarks & Activity Log */}
          <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <i className="fas fa-comment-alt text-success"></i> Activity Notes & Remarks
              </h5>
              {!editingRemarks && (
                <button
                  className="btn btn-sm btn-outline-success fw-semibold px-3"
                  style={{ borderRadius: '6px' }}
                  onClick={() => setEditingRemarks(true)}
                >
                  <i className="fas fa-pencil-alt me-1"></i> Edit Remarks
                </button>
              )}
            </div>

            {editingRemarks ? (
              <div className="border rounded-3 p-3.5 bg-light">
                <textarea
                  className="form-control bg-white mb-3"
                  rows={4}
                  style={{ fontSize: '0.9rem' }}
                  value={remarksText}
                  onChange={e => setRemarksText(e.target.value)}
                  placeholder="Enter remarks, log activity notes, or updates..."
                />
                <div className="d-flex justify-content-end gap-2">
                  <button className="btn btn-outline-secondary px-3 fw-semibold" onClick={() => setEditingRemarks(false)}>Cancel</button>
                  <button className="btn btn-success text-white px-4 fw-bold" onClick={handleSaveRemarks}>Save Remarks</button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-3 border" style={{ backgroundColor: '#fdfdfd', borderLeft: '4px solid #10b981', whiteSpace: 'pre-line', fontSize: '0.9rem', color: '#334155' }}>
                {task.remarks || <span className="text-muted italic">No remarks or activity notes recorded yet.</span>}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Action Submodal */}
      {actionType && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
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

    </div>
  );
};

export default TaskDetailPage;

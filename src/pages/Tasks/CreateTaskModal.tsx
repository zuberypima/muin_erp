import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';

interface CreateTaskModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ onClose, onCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [remarks, setRemarks] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/users/').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const toggleCollaborator = (uuid: string) => {
    setCollaboratorIds(prev =>
      prev.includes(uuid) ? prev.filter(id => id !== uuid) : [...prev, uuid]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post('/tasks/', {
        title,
        description,
        remarks,
        assigned_to: assignedTo,
        collaborators: collaboratorIds,
        priority,
        due_date: new Date(dueDate).toISOString()
      });
      // Add collaborators via dedicated endpoint if any
      if (collaboratorIds.length > 0) {
        await Promise.all(
          collaboratorIds.map(uid =>
            api.post(`/tasks/${res.data.id}/add-collaborator/`, { user_id: uid }).catch(() => {})
          )
        );
      }
      onCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create task", err);
      alert("Failed to create task. Check console for details.");
      setSubmitting(false);
    }
  };

  const availableCollaborators = users.filter(u => (u.uuid || String(u.id)) !== assignedTo);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              <i className="fas fa-plus-circle me-2 text-success"></i>Create New Task
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* Left Column */}
                <div className="col-md-7">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Task Title *</label>
                    <input type="text" className="form-control bg-light" value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. Review budget proposal" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Description</label>
                    <textarea className="form-control bg-light" rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what needs to be done..."></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Remarks / Notes</label>
                    <textarea className="form-control bg-light" rows={2} value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Special instructions or initial notes..."></textarea>
                  </div>
                </div>

                {/* Right Column */}
                <div className="col-md-5">
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Assign To *</label>
                    <select className="form-select bg-light" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} required>
                      <option value="">Select user...</option>
                      {users.map(u => (
                        <option key={u.id} value={u.uuid || u.id}>{u.username}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Priority</label>
                    <select className="form-select bg-light" value={priority} onChange={e => setPriority(e.target.value)}>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">Due Date *</label>
                    <input type="date" className="form-control bg-light" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                  </div>

                  {/* Collaborators multi-select */}
                  <div className="mb-3">
                    <label className="form-label text-muted small fw-semibold">
                      <i className="fas fa-users me-1 text-success"></i>Collaborators
                      <span className="ms-1 text-muted" style={{ fontWeight: 400 }}>(optional)</span>
                    </label>
                    <div className="border rounded-3 p-2 bg-light" style={{ maxHeight: '130px', overflowY: 'auto' }}>
                      {availableCollaborators.length === 0 && (
                        <div className="text-muted small text-center py-2">Select an assignee first to see collaborators</div>
                      )}
                      {availableCollaborators.map(u => {
                        const uid = u.uuid || String(u.id);
                        const checked = collaboratorIds.includes(uid);
                        return (
                          <div key={u.id} className="form-check d-flex align-items-center gap-2 py-1">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id={`collab-${u.id}`}
                              checked={checked}
                              onChange={() => toggleCollaborator(uid)}
                            />
                            <label className="form-check-label small" htmlFor={`collab-${u.id}`}>
                              {u.username}
                              <span className="text-muted ms-1" style={{ fontSize: '0.72rem' }}>{u.email}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                    {collaboratorIds.length > 0 && (
                      <div className="mt-1 text-muted small">{collaboratorIds.length} collaborator(s) selected</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top mt-2">
                <button type="button" className="btn btn-light fw-semibold px-4" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={submitting}>
                  {submitting ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;

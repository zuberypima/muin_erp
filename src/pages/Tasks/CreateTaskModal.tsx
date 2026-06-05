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
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Fetch users for the dropdown
    const fetchUsers = async () => {
      try {
        const res = await api.get('/users/');
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/tasks/', {
        title,
        description,
        remarks,
        assigned_to: assignedTo,
        priority,
        due_date: new Date(dueDate).toISOString()
      });
      onCreated();
      onClose();
    } catch (err) {
      console.error("Failed to create task", err);
      alert("Failed to create task. Check console for details.");
      setSubmitting(false);
    }
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">Create New Task</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Task Title</label>
                <input type="text" className="form-control bg-light" value={title} onChange={(e)=>setTitle(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Description</label>
                <textarea className="form-control bg-light" rows={3} value={description} onChange={(e)=>setDescription(e.target.value)}></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label text-muted small fw-semibold">Remarks / Notes</label>
                <textarea className="form-control bg-light" rows={2} value={remarks} onChange={(e)=>setRemarks(e.target.value)} placeholder="Special delivery notes, constraints, or comments..."></textarea>
              </div>
              <div className="row mb-3">
                <div className="col-6">
                  <label className="form-label text-muted small fw-semibold">Assign To</label>
                  <select className="form-select bg-light" value={assignedTo} onChange={(e)=>setAssignedTo(e.target.value)} required>
                    <option value="">Select User...</option>
                    {users.map(u => (
                      <option key={u.id} value={u.uuid || u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label text-muted small fw-semibold">Priority</label>
                  <select className="form-select bg-light" value={priority} onChange={(e)=>setPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="mb-4">
                <label className="form-label text-muted small fw-semibold">Due Date</label>
                <input type="date" className="form-control bg-light" value={dueDate} onChange={(e)=>setDueDate(e.target.value)} required />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light fw-semibold" onClick={onClose}>Cancel</button>
                <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Task'}
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

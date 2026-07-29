import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import TaskDetailModal from './TaskDetailModal.tsx';
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

export const isTaskArchived = (t: Task): boolean => {
  if (t.status !== 'Completed') return false;
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const taskDate = t.due_date ? new Date(t.due_date) : new Date(t.created_at);
  taskDate.setHours(0, 0, 0, 0);

  return taskDate < todayStart;
};

const ArchivedTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewTask, setPreviewTask] = useState<Task | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assignedStaffFilter, setAssignedStaffFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [allUsers, setAllUsers] = useState<UserDetail[]>([]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tasks/');
      const allFetched: Task[] = res.data;
      const archivedOnly = allFetched.filter(isTaskArchived);
      setTasks(archivedOnly);
    } catch (e) {
      console.error("Failed to fetch archived tasks", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    api.get('/users/').then(r => setAllUsers(r.data)).catch(() => {});
  }, []);

  const getPriorityClass = (p: string) => ({ 'High': 'bg-danger text-white', 'Medium': 'bg-warning text-dark', 'Low': 'bg-info text-dark' }[p] || 'bg-secondary text-white');
  const getInitials = (name?: string) => name ? name.slice(0, 2).toUpperCase() : 'U';

  const filtered = tasks
    .filter(t =>
      (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (t.assigned_to_detail?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (t.assigned_by_detail?.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       String(t.ticket_number || '').includes(searchTerm)) &&
      (priorityFilter === 'All' || t.priority === priorityFilter) &&
      (assignedStaffFilter === 'All' || t.assigned_to_detail?.username === assignedStaffFilter || t.assigned_to === assignedStaffFilter)
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'priority_high') return ({ High: 3, Medium: 2, Low: 1 }[b.priority] || 0) - ({ High: 3, Medium: 2, Low: 1 }[a.priority] || 0);
      return 0;
    });

  return (
    <div className="container-fluid py-2 fade-in">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <button className="btn btn-sm btn-outline-secondary py-0.5 px-2" onClick={() => navigate('/tasks')}>
              <i className="fas fa-arrow-left me-1"></i> Active Tasks
            </button>
            <span className="badge bg-secondary-subtle text-secondary border px-2.5 py-1" style={{ borderRadius: '6px' }}>
              <i className="fas fa-archive me-1"></i> Task Archival Vault
            </span>
          </div>
          <h4 className="fw-bold text-dark mb-0">Archived Tasks</h4>
          <p className="text-muted mb-0 small" style={{ fontSize: '0.82rem' }}>
            Historical record of completed and closed tasks prior to today.
          </p>
        </div>

        <button className="btn btn-outline-success fw-semibold px-3 py-1.5 shadow-sm" style={{ borderRadius: '6px', fontSize: '0.82rem' }} onClick={fetchTasks}>
          <i className="fas fa-sync-alt me-1.5"></i> Refresh Archive
        </button>
      </div>

      {/* Stats row */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: '12px', backgroundColor: '#f8fafc' }}>
        <div className="card-body p-3 d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
              <i className="fas fa-box-archive fs-4"></i>
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-0">{filtered.length} Archived Tasks</h5>
              <p className="text-muted small mb-0">Tasks completed prior to today ({new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})</p>
            </div>
          </div>
          <span className="badge bg-success-subtle text-success border px-3 py-1.5 fw-semibold" style={{ borderRadius: '8px' }}>
            <i className="fas fa-check-double me-1"></i> Fully Closed
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-2.5 rounded-3 shadow-sm border mb-3">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex flex-wrap align-items-center gap-2 flex-grow-1">
            <input
              type="text"
              placeholder="Search archived tasks by title, staff or #ID..."
              className="search-input flex-grow-1"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ minWidth: '220px' }}
            />
            <select className="filter-select" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <select className="filter-select" value={assignedStaffFilter} onChange={e => setAssignedStaffFilter(e.target.value)}>
              <option value="All">All Assigned Staff</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.username}>{u.username} ({u.email})</option>
              ))}
            </select>
            <select className="filter-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority_high">Highest Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Archived Tasks Table / Cards */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
          <p className="text-muted mt-2 small">Loading archived task vault...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5" style={{ borderRadius: '16px' }}>
          <div className="card-body">
            <i className="fas fa-folder-open text-muted fs-1 mb-3"></i>
            <h5 className="fw-bold text-dark mb-1">No Archived Tasks Found</h5>
            <p className="text-muted small mb-0">Tasks completed prior to today will automatically be moved to this archive vault.</p>
          </div>
        </div>
      ) : (
        <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.88rem' }}>
              <thead style={{ backgroundColor: '#f8fafc' }}>
                <tr>
                  <th className="px-3 py-3 text-muted text-uppercase border-bottom-0 fw-semibold" style={{ fontSize: '0.75rem' }}># ID</th>
                  <th className="px-3 py-3 text-muted text-uppercase border-bottom-0 fw-semibold" style={{ fontSize: '0.75rem' }}>Task Title</th>
                  <th className="px-3 py-3 text-muted text-uppercase border-bottom-0 fw-semibold" style={{ fontSize: '0.75rem' }}>Priority</th>
                  <th className="px-3 py-3 text-muted text-uppercase border-bottom-0 fw-semibold" style={{ fontSize: '0.75rem' }}>Assigned To</th>
                  <th className="px-3 py-3 text-muted text-uppercase border-bottom-0 fw-semibold" style={{ fontSize: '0.75rem' }}>Completed On</th>
                  <th className="px-3 py-3 text-muted text-uppercase border-bottom-0 fw-semibold text-end" style={{ fontSize: '0.75rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => setPreviewTask(t)}>
                    <td className="px-3 py-3 text-muted fw-mono">
                      #{t.ticket_number || t.id.slice(0, 6)}
                    </td>
                    <td className="px-3 py-3 fw-semibold text-dark">
                      <div>{t.title}</div>
                      {t.remarks && <div className="text-muted small text-truncate" style={{ maxWidth: '300px' }}>{t.remarks}</div>}
                    </td>
                    <td className="px-3 py-3">
                      <span className={`badge ${getPriorityClass(t.priority)} px-2 py-1`} style={{ borderRadius: '4px', fontSize: '0.72rem' }}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="avatar bg-success-subtle text-success fw-bold d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', borderRadius: '50%', fontSize: '0.75rem' }}>
                          {getInitials(t.assigned_to_detail?.username || t.assigned_to)}
                        </div>
                        <span className="fw-semibold text-dark">{t.assigned_to_detail?.username || t.assigned_to || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted">
                      <i className="far fa-calendar-check me-1.5 text-success"></i>
                      {t.due_date ? new Date(t.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Closed'}
                    </td>
                    <td className="px-3 py-3 text-end" onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-sm btn-outline-dark fw-semibold"
                        style={{ borderRadius: '6px', fontSize: '0.78rem' }}
                        onClick={() => setPreviewTask(t)}
                      >
                        <i className="fas fa-eye me-1 text-success"></i> Preview Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {previewTask && (
        <TaskDetailModal
          task={previewTask}
          onClose={() => setPreviewTask(null)}
          onUpdate={() => { setPreviewTask(null); fetchTasks(); }}
        />
      )}
    </div>
  );
};

export default ArchivedTasksPage;

import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import CreateTaskModal from './CreateTaskModal.tsx';
import './Tasks.css';

interface UserDetail {
  id: number;
  uuid: string;
  username: string;
  email: string;
}

interface Task {
  id: string;
  ticket_number?: number;
  title: string;
  description: string;
  remarks?: string;
  assigned_to: string;
  assigned_to_detail?: UserDetail;
  assigned_by_detail?: UserDetail;
  status: string;
  priority: string;
  due_date: string;
  created_at: string;
}

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'assigned'>('all');
  const [showModal, setShowModal] = useState(false);

  // Filters & Sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('due_date_asc');

  // Inline remarks editor state
  const [editingRemarksTaskId, setEditingRemarksTaskId] = useState<string | null>(null);
  const [tempRemarks, setTempRemarks] = useState('');

  const handleSaveRemarks = async (id: string) => {
    try {
      await api.patch(`/tasks/${id}/`, { remarks: tempRemarks });
      setEditingRemarksTaskId(null);
      fetchTasks();
    } catch (error) {
      console.error("Failed to update remarks", error);
    }
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let endpoint = '/tasks/';
      if (activeTab === 'my') endpoint = '/tasks/my-tasks/';
      if (activeTab === 'assigned') endpoint = '/tasks/assigned-by-me/';
      
      const res = await api.get(endpoint);
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const updateTaskStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${id}/status/`, { status: newStatus });
      fetchTasks();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await api.delete(`/tasks/${id}/`);
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
      alert("Failed to delete task. Make sure you have permission.");
    }
  };

  const getPriorityBadgeClass = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-danger text-white';
      case 'medium': return 'bg-warning text-dark';
      case 'low': return 'bg-info text-dark';
      default: return 'bg-secondary text-white';
    }
  };

  // Helper to check if task is overdue
  const isOverdue = (task: Task) => {
    if (task.status === 'Completed') return false;
    if (!task.due_date) return false;
    return new Date(task.due_date) < new Date();
  };

  // Calculate stats dynamically from fetched tasks
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Completed').length,
    inProgress: tasks.filter(t => t.status === 'In-Progress').length,
    pending: tasks.filter(t => t.status === 'Pending').length,
    overdue: tasks.filter(isOverdue).length,
  };

  const completionPercentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  // Filter and Sort implementation
  const filteredTasks = tasks
    .filter(task => {
      const matchSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.assigned_to_detail?.username && task.assigned_to_detail.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (task.ticket_number && `tsk-${task.ticket_number}`.includes(searchTerm.toLowerCase())) ||
        (task.ticket_number && `#tsk-${task.ticket_number}`.includes(searchTerm.toLowerCase())) ||
        (task.ticket_number && String(task.ticket_number).includes(searchTerm.toLowerCase()));
      
      const matchPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchStatus = statusFilter === 'All' || task.status === statusFilter;

      return matchSearch && matchPriority && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'due_date_asc') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (sortBy === 'due_date_desc') {
        return new Date(b.due_date).getTime() - new Date(a.due_date).getTime();
      }
      if (sortBy === 'created_newest') {
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      }
      if (sortBy === 'priority_high') {
        const weight: { [key: string]: number } = { 'High': 3, 'Medium': 2, 'Low': 1 };
        return (weight[b.priority] || 0) - (weight[a.priority] || 0);
      }
      return 0;
    });

  // Get Initials for Avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="container-fluid py-2 fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Office Tasks</h2>
          <p className="text-muted mb-0">Collaborate, allocate tasks, and analyze task completion rates.</p>
        </div>
        <button className="btn text-white fw-bold px-4 py-2 shadow-sm" style={{ backgroundColor: '#10b981', borderRadius: '8px' }} onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i> New Task
        </button>
      </div>

      {/* Analytics KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="task-kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">Total Tasks</div>
              <div className="fs-3 fw-bold text-dark mt-1">{stats.total}</div>
            </div>
            <div className="fs-2 text-primary-green opacity-75">
              <i className="fas fa-clipboard-list"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="task-kpi-card">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <div className="text-muted small fw-semibold">Completed</div>
                <div className="fs-3 fw-bold text-success mt-1">{stats.completed}</div>
              </div>
              <div className="fs-4 text-success font-weight-bold">{completionPercentage}%</div>
            </div>
            <div className="task-progress-bar">
              <div className="task-progress-fill bg-success" style={{ width: `${completionPercentage}%` }}></div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="task-kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">In Progress / Pending</div>
              <div className="fs-3 fw-bold text-warning mt-1">{stats.inProgress + stats.pending}</div>
            </div>
            <div className="fs-2 text-warning opacity-75">
              <i className="fas fa-spinner fa-spin"></i>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="task-kpi-card d-flex align-items-center justify-content-between">
            <div>
              <div className="text-muted small fw-semibold">Overdue Tasks</div>
              <div className="fs-3 fw-bold text-danger mt-1">{stats.overdue}</div>
            </div>
            <div className="fs-2 text-danger opacity-75">
              <i className="fas fa-exclamation-circle"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation & Filters Bar */}
      <div className="bg-white p-3 rounded-4 shadow-sm border mb-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
          {/* Tab Selector */}
          <ul className="nav nav-tabs border-0 gap-2">
            <li className="nav-item">
              <button className={`nav-link border-0 fw-semibold px-3 py-2 rounded-3 ${activeTab === 'all' ? 'text-primary-green bg-light-green' : 'text-muted bg-transparent'}`} onClick={() => setActiveTab('all')}>
                All Tasks
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link border-0 fw-semibold px-3 py-2 rounded-3 ${activeTab === 'my' ? 'text-primary-green bg-light-green' : 'text-muted bg-transparent'}`} onClick={() => setActiveTab('my')}>
                My Tasks
              </button>
            </li>
            <li className="nav-item">
              <button className={`nav-link border-0 fw-semibold px-3 py-2 rounded-3 ${activeTab === 'assigned' ? 'text-primary-green bg-light-green' : 'text-muted bg-transparent'}`} onClick={() => setActiveTab('assigned')}>
                Assigned By Me
              </button>
            </li>
          </ul>

          {/* Quick Stats Search/Filter Actions */}
          <div className="d-flex flex-wrap gap-2 w-100 w-md-auto">
            <input 
              type="text" 
              placeholder="Search title, desc or user..." 
              className="search-input flex-grow-1" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <select className="filter-select" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
            </select>
            <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="due_date_asc">Due Date (Soonest)</option>
              <option value="due_date_desc">Due Date (Latest)</option>
              <option value="created_newest">Created (Newest)</option>
              <option value="priority_high">Priority (Highest)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : (
        <div className="row">
          {filteredTasks.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted bg-white border rounded-4 shadow-sm">
              <i className="fas fa-clipboard-check fa-3x mb-3 text-light"></i>
              <p className="fw-semibold">No tasks match your filters or search criteria.</p>
              <button className="btn btn-sm btn-outline-success mt-2" onClick={() => { setSearchTerm(''); setPriorityFilter('All'); setStatusFilter('All'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            filteredTasks.map(task => (
              <div className="col-md-6 col-lg-4 mb-4" key={task.id}>
                <div className="card h-100 border-0 shadow-sm task-card" style={{ borderRadius: '16px' }}>
                  <div className="card-body d-flex flex-column">
                    {/* Header Details */}
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold text-dark mb-0">
                        {task.ticket_number && (
                          <span className="text-primary-green me-1" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                            #TSK-{task.ticket_number}
                          </span>
                        )}
                        {task.title}
                      </h5>
                      <span className={`badge ${getPriorityBadgeClass(task.priority)}`} style={{ borderRadius: '6px' }}>{task.priority}</span>
                    </div>
                    
                    {/* Description */}
                    <p className="text-muted small mb-3 flex-grow-1" style={{ minHeight: '40px' }}>
                      {task.description || 'No description provided.'}
                    </p>
                    
                    {/* Overdue tag */}
                    {isOverdue(task) && (
                      <div className="mb-3">
                        <span className="overdue-tag">
                          <i className="fas fa-calendar-times"></i> Overdue
                        </span>
                      </div>
                    )}

                    {/* Remarks Section */}
                    <div className="mb-3 p-2 rounded-3" style={{ backgroundColor: '#f8fafc', borderLeft: '3px solid #10b981' }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark small" style={{ fontSize: '0.75rem' }}>
                          <i className="far fa-comment-dots me-1"></i> Remarks / Progress Notes
                        </strong>
                        {editingRemarksTaskId !== task.id && (
                          <button 
                            className="btn btn-sm btn-link p-0 text-muted" 
                            style={{ fontSize: '0.72rem', textDecoration: 'none' }}
                            onClick={() => {
                              setEditingRemarksTaskId(task.id);
                              setTempRemarks(task.remarks || '');
                            }}
                          >
                            <i className="fas fa-pencil-alt"></i> Edit
                          </button>
                        )}
                      </div>
                      
                      {editingRemarksTaskId === task.id ? (
                        <div>
                          <textarea 
                            className="form-control form-control-sm bg-white mb-2" 
                            rows={2} 
                            style={{ fontSize: '0.75rem' }}
                            value={tempRemarks} 
                            onChange={(e) => setTempRemarks(e.target.value)}
                            placeholder="Add progress updates or remarks..."
                          />
                          <div className="d-flex justify-content-end gap-1">
                            <button 
                              className="btn btn-xs btn-outline-secondary py-0 px-2" 
                              style={{ fontSize: '0.65rem', borderRadius: '4px' }}
                              onClick={() => setEditingRemarksTaskId(null)}
                            >
                              Cancel
                            </button>
                            <button 
                              className="btn btn-xs btn-success py-0 px-2 text-white" 
                              style={{ fontSize: '0.65rem', borderRadius: '4px' }}
                              onClick={() => handleSaveRemarks(task.id)}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-muted mb-0 small" style={{ fontSize: '0.75rem', whiteSpace: 'pre-line', minHeight: '16px' }}>
                          {task.remarks || 'No remarks added yet.'}
                        </p>
                      )}
                    </div>

                    {/* Meta Dates & Status */}
                    <div className="d-flex flex-column gap-2 mb-3 text-muted small">
                      <div className="d-flex justify-content-between align-items-center">
                        <span><i className="far fa-calendar me-1"></i> Created: {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A'}</span>
                        <span className={`badge border ${
                          task.status === 'Completed' ? 'bg-success-subtle text-success border-success' : 
                          task.status === 'In-Progress' ? 'bg-primary-subtle text-primary border-primary' : 
                          'bg-warning-subtle text-warning border-warning'
                        }`}>{task.status || 'Pending'}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span><i className="far fa-calendar-alt me-1"></i> Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <hr className="text-muted opacity-25" />
                    
                    {/* Footer Operations */}
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      {/* Assignee Details */}
                      <div className="d-flex align-items-center gap-2">
                        <div className="task-avatar" title={`Assigned to ${task.assigned_to_detail?.username || 'Unknown'}`}>
                          {getInitials(task.assigned_to_detail?.username)}
                        </div>
                        <div style={{ lineHeight: '1.1' }}>
                          <div className="small text-dark fw-semibold" style={{ fontSize: '0.8rem' }}>
                            {task.assigned_to_detail?.username || 'Unassigned'}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                            Assigned To
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="d-flex align-items-center gap-2">
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{ borderRadius: '8px' }}>
                            Status
                          </button>
                          <ul className="dropdown-menu shadow border-0" style={{ borderRadius: '12px' }}>
                            <li><button className="dropdown-item" onClick={() => updateTaskStatus(task.id, 'Pending')}>Pending</button></li>
                            <li><button className="dropdown-item text-primary" onClick={() => updateTaskStatus(task.id, 'In-Progress')}>In-Progress</button></li>
                            <li><button className="dropdown-item text-success" onClick={() => updateTaskStatus(task.id, 'Completed')}>Completed</button></li>
                          </ul>
                        </div>

                        <button 
                          className="delete-btn" 
                          onClick={() => deleteTask(task.id)}
                          title="Delete Task"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && <CreateTaskModal onClose={() => setShowModal(false)} onCreated={fetchTasks} />}
    </div>
  );
};

export default TaskBoard;

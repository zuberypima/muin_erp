import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';
import CreateTaskModal from './CreateTaskModal';

interface Task {
  id: number;
  title: string;
  description: string;
  assigned_to: string; // uuid
  assigned_to_username?: string;
  status: string;
  priority: string;
  due_date: string;
}

const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'my' | 'assigned'>('all');
  const [showModal, setShowModal] = useState(false);

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

  const updateTaskStatus = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/tasks/${id}/status/`, { status: newStatus });
      fetchTasks(); // Refresh list
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'bg-danger';
      case 'medium': return 'bg-warning text-dark';
      case 'low': return 'bg-info text-dark';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid py-2 fade-in">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Task Management</h2>
          <p className="text-muted">Manage your office tasks and assignments.</p>
        </div>
        <button className="btn text-white fw-bold px-4 py-2 shadow-sm" style={{ backgroundColor: '#10b981', borderRadius: '8px' }} onClick={() => setShowModal(true)}>
          <i className="fas fa-plus me-2"></i> New Task
        </button>
      </div>

      <ul className="nav nav-tabs mb-4 border-0">
        <li className="nav-item">
          <button className={`nav-link border-0 fw-semibold ${activeTab === 'all' ? 'text-primary-green border-bottom border-success border-3' : 'text-muted'}`} onClick={() => setActiveTab('all')} style={{ background: 'transparent' }}>
            All Tasks
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link border-0 fw-semibold ${activeTab === 'my' ? 'text-primary-green border-bottom border-success border-3' : 'text-muted'}`} onClick={() => setActiveTab('my')} style={{ background: 'transparent' }}>
            My Tasks
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link border-0 fw-semibold ${activeTab === 'assigned' ? 'text-primary-green border-bottom border-success border-3' : 'text-muted'}`} onClick={() => setActiveTab('assigned')} style={{ background: 'transparent' }}>
            Assigned By Me
          </button>
        </li>
      </ul>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      ) : (
        <div className="row">
          {tasks.length === 0 ? (
            <div className="col-12 text-center py-5 text-muted">
              <i className="fas fa-clipboard-check fa-3x mb-3 text-light"></i>
              <p>No tasks found in this view.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div className="col-md-6 col-lg-4 mb-4" key={task.id}>
                <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="fw-bold text-dark mb-0">{task.title}</h5>
                      <span className={`badge ${getPriorityBadge(task.priority)}`} style={{ borderRadius: '6px' }}>{task.priority}</span>
                    </div>
                    <p className="text-muted small mb-3" style={{ minHeight: '40px' }}>{task.description || 'No description provided.'}</p>
                    
                    <div className="d-flex justify-content-between align-items-center mb-3 text-muted small">
                      <span><i className="far fa-calendar-alt me-1"></i> Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      <span className="badge bg-light text-dark border">{task.status || 'Pending'}</span>
                    </div>

                    <hr className="text-muted opacity-25" />
                    
                    <div className="d-flex justify-content-between align-items-center mt-auto">
                      <div className="dropdown">
                        <button className="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" style={{ borderRadius: '8px' }}>
                          Update Status
                        </button>
                        <ul className="dropdown-menu shadow border-0" style={{ borderRadius: '12px' }}>
                          <li><button className="dropdown-item" onClick={() => updateTaskStatus(task.id, 'Pending')}>Pending</button></li>
                          <li><button className="dropdown-item text-primary" onClick={() => updateTaskStatus(task.id, 'In-Progress')}>In-Progress</button></li>
                          <li><button className="dropdown-item text-success" onClick={() => updateTaskStatus(task.id, 'Completed')}>Completed</button></li>
                        </ul>
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

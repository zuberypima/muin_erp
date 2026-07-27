import React from 'react';
import { createPortal } from 'react-dom';
import { formatDate } from './hrTypes';

export interface LeaveRequest {
  id: number | string;
  employee?: number | string;
  employee_name: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_on: string;
}

interface LeaveDetailModalProps {
  leave: LeaveRequest | null;
  onClose: () => void;
  onStatusUpdate?: (id: number | string, action: 'approve' | 'reject') => void;
}

const LeaveDetailModal: React.FC<LeaveDetailModalProps> = ({ leave, onClose, onStatusUpdate }) => {
  if (!leave) return null;

  const getStatusBadgeStyle = (s: string) => {
    if (s === 'approved') return { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' };
    if (s === 'rejected') return { backgroundColor: '#fee2e2', color: '#b91c1c', borderColor: '#fecdd3' };
    return { backgroundColor: '#fef9c3', color: '#a16207', borderColor: '#fef08a' }; // pending
  };

  const getInitials = (name?: string) => {
    if (!name) return 'L';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

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
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable my-auto" style={{ maxWidth: '650px', width: '100%', margin: 'auto' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          
          {/* Modal Header */}
          <div className="modal-header border-0 bg-light px-4 py-3 align-items-center">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge px-3 py-1.5 fw-bold" style={{ backgroundColor: '#10b981', color: 'white', borderRadius: '8px', fontSize: '0.85rem' }}>
                <i className="fas fa-calendar-minus me-1.5"></i>Leave Request #{leave.id}
              </span>
              <span
                className="badge border px-3 py-1.5 fw-semibold text-capitalize"
                style={{ ...getStatusBadgeStyle(leave.status), borderRadius: '8px', fontSize: '0.85rem' }}
              >
                {leave.status}
              </span>
            </div>
            <button className="btn-close" onClick={onClose} aria-label="Close"></button>
          </div>

          {/* Modal Body */}
          <div className="modal-body px-4 py-4" style={{ backgroundColor: '#ffffff' }}>
            
            {/* Employee Profile Header */}
            <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{ width: '48px', height: '48px', backgroundColor: '#e0f2fe', color: '#0369a1', border: '1.5px solid #bae6fd', fontSize: '1.1rem' }}
              >
                {getInitials(leave.employee_name)}
              </div>
              <div className="flex-fill">
                <h4 className="fw-bold text-dark mb-0" style={{ fontSize: '1.25rem' }}>{leave.employee_name}</h4>
                <div className="text-muted small">
                  <i className="fas fa-building me-1 text-secondary"></i>{leave.department || 'General Staff'}
                </div>
              </div>
              <div className="text-end">
                <span className="badge bg-light text-dark border px-2.5 py-1 text-capitalize fw-semibold" style={{ fontSize: '0.8rem' }}>
                  {leave.leave_type} Leave
                </span>
              </div>
            </div>

            {/* Leave Details Grid */}
            <div className="row g-3 mb-4">
              <div className="col-sm-6">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="far fa-calendar-alt me-1 text-primary"></i> Leave Period
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                    {formatDate(leave.start_date)} → {formatDate(leave.end_date)}
                  </div>
                  <div className="text-muted small mt-1">
                    Applied on: {formatDate(leave.applied_on)}
                  </div>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-clock me-1 text-warning"></i> Duration Requested
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '1.2rem' }}>
                    {leave.days} {leave.days === 1 ? 'Day' : 'Days'}
                  </div>
                  <div className="text-muted small mt-1">
                    Category: <strong className="text-capitalize text-dark">{leave.leave_type}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Leave Reason Card */}
            <div className="mb-3">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                <i className="fas fa-align-left text-muted"></i> Reason for Leave
              </h6>
              <div className="p-3.5 rounded-3 border" style={{ backgroundColor: '#ffffff', minHeight: '90px', whiteSpace: 'pre-wrap', lineHeight: '1.6', fontSize: '0.9rem', color: '#334155' }}>
                {leave.reason || <span className="text-muted italic">No specific reason provided.</span>}
              </div>
            </div>

          </div>

          {/* Modal Footer / Action Buttons */}
          <div className="modal-footer border-0 bg-light px-4 py-3 d-flex justify-content-between align-items-center">
            <div>
              {leave.status === 'pending' && onStatusUpdate && (
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-success text-white fw-bold px-3 py-1.5 d-flex align-items-center gap-1.5"
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    onClick={() => {
                      onStatusUpdate(leave.id, 'approve');
                      onClose();
                    }}
                  >
                    <i className="fas fa-check"></i> Approve Leave
                  </button>
                  <button
                    className="btn btn-danger text-white fw-bold px-3 py-1.5 d-flex align-items-center gap-1.5"
                    style={{ borderRadius: '8px', fontSize: '0.85rem' }}
                    onClick={() => {
                      onStatusUpdate(leave.id, 'reject');
                      onClose();
                    }}
                  >
                    <i className="fas fa-times"></i> Reject Leave
                  </button>
                </div>
              )}
            </div>

            <button className="btn btn-secondary px-4 fw-semibold" style={{ borderRadius: '8px' }} onClick={onClose}>
              Close Preview
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
};

export default LeaveDetailModal;

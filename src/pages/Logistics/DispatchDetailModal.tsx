import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ContainerDispatch } from './logisticsTypes';

interface DispatchDetailModalProps {
  dispatch: ContainerDispatch | null;
  onClose: () => void;
  onStatusUpdate?: (id: string | number, newStatus: ContainerDispatch['status']) => void;
}

const ALL_STATUSES: ContainerDispatch['status'][] = [
  'gate-pass-issued',
  'in-transit',
  'delivered-at-border',
  'delivered-consignee',
  'delayed'
];

const DispatchDetailModal: React.FC<DispatchDetailModalProps> = ({ dispatch, onClose, onStatusUpdate }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!dispatch) return null;

  const getStatusBadgeStyle = (s: string) => {
    if (s === 'in-transit') return { backgroundColor: '#dbeafe', color: '#1d4ed8', borderColor: '#bfdbfe' };
    if (s === 'gate-pass-issued') return { backgroundColor: '#fef9c3', color: '#a16207', borderColor: '#fef08a' };
    if (s === 'delivered-consignee') return { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#bbf7d0' };
    if (s === 'delivered-at-border') return { backgroundColor: '#e0e7ff', color: '#4338ca', borderColor: '#c7d2fe' };
    return { backgroundColor: '#ffe4e6', color: '#e11d48', borderColor: '#fecdd3' }; // delayed
  };

  const handleCopyBL = () => {
    const text = `Container: ${dispatch.container_number} | B/L: ${dispatch.bill_of_lading} | Release Ref: ${dispatch.customs_release_ref}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    });
  };

  const handlePrint = () => {
    window.print();
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
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable my-auto" style={{ maxWidth: '720px', width: '100%', margin: 'auto' }}>
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          
          {/* Header */}
          <div className="modal-header border-0 bg-light px-4 py-3 align-items-center">
            <div className="d-flex align-items-center gap-2 flex-wrap">
              <span className="badge px-3 py-1.5 fw-bold" style={{ backgroundColor: '#2563eb', color: 'white', borderRadius: '8px', fontSize: '0.85rem' }}>
                <i className="fas fa-truck-loading me-1.5"></i>{dispatch.container_number}
              </span>
              <span className="badge bg-light text-dark border px-2.5 py-1.5 fw-semibold" style={{ fontSize: '0.82rem', borderRadius: '8px' }}>
                B/L: {dispatch.bill_of_lading}
              </span>
              <span
                className="badge border px-3 py-1.5 fw-semibold text-capitalize"
                style={{ ...getStatusBadgeStyle(dispatch.status), borderRadius: '8px', fontSize: '0.82rem' }}
              >
                {dispatch.status}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={handleCopyBL}
                title="Copy B/L & Container Details"
                style={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                <i className={`fas ${copySuccess ? 'fa-check text-success' : 'fa-copy'}`}></i>
                {copySuccess ? 'Copied!' : 'Copy Info'}
              </button>
              <button
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={handlePrint}
                title="Print Dispatch Pass"
                style={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                <i className="fas fa-print"></i> Print Gate-Pass
              </button>
              <button className="btn-close ms-1" onClick={onClose} aria-label="Close"></button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-4" style={{ backgroundColor: '#ffffff' }}>
            
            {/* Title / Destination banner */}
            <div className="p-3.5 rounded-3 mb-4" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div className="row g-3 align-items-center">
                <div className="col-md-8">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-map-marker-alt me-1 text-danger"></i>Inland Destination
                  </div>
                  <h4 className="fw-bold text-primary mb-0" style={{ fontSize: '1.25rem' }}>
                    {dispatch.destination_city}
                  </h4>
                  <div className="text-muted small mt-1">
                    Customs Release Ref: <strong className="text-dark">{dispatch.customs_release_ref}</strong>
                  </div>
                </div>

                <div className="col-md-4 text-md-end">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    Status Handoff
                  </div>
                  <select
                    className="form-select form-select-sm fw-semibold"
                    style={{ borderRadius: '6px', fontSize: '0.8rem' }}
                    value={dispatch.status}
                    onChange={e => onStatusUpdate && onStatusUpdate(dispatch.id, e.target.value as any)}
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Parties Grid (Shipper & Consignee) */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-warehouse me-1 text-primary"></i> Shipper / Exporter
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                    {dispatch.shipper}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-user-check me-1 text-success"></i> Consignee / Buyer
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                    {dispatch.consignee}
                  </div>
                </div>
              </div>
            </div>

            {/* Transport & Driver Info Grid */}
            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <div className="p-3 rounded-3 border bg-light">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <i className="fas fa-shipping-fast me-1 text-info"></i> Transport Mode
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                    {dispatch.transport_mode}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 rounded-3 border bg-light">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <i className="fas fa-truck me-1 text-warning"></i> Vehicle / Truck Code
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                    {dispatch.truck_plate_or_train}
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="p-3 rounded-3 border bg-light">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                    <i className="fas fa-id-card me-1 text-success"></i> Driver / Operator
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.88rem' }}>
                    {dispatch.driver_name}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates Bar */}
            <div className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                <i className="far fa-calendar-alt me-1 text-primary"></i> Dispatch Gate Date: <strong className="text-dark">{dispatch.dispatch_date}</strong>
              </div>
              <div className="text-muted small">
                <i className="fas fa-shield-alt me-1 text-success"></i> Customs Cleared
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="modal-footer border-0 bg-light px-4 py-3">
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

export default DispatchDetailModal;

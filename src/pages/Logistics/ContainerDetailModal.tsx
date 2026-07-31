import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ContainerItem } from './logisticsTypes';

interface ContainerDetailModalProps {
  container: ContainerItem | null;
  onClose: () => void;
  onToggleCustoms?: (id: string | number, currentStatus: boolean) => void;
}

const ContainerDetailModal: React.FC<ContainerDetailModalProps> = ({ container, onClose, onToggleCustoms }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  if (!container) return null;

  const handleCopyInfo = () => {
    const text = `Container: ${container.container_number} | Size: ${container.size_type} | B/L: ${container.bill_of_lading} | Yard: ${container.terminal_yard} (${container.yard_slot}) | Consignee: ${container.consignee}`;
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
              <span className="badge px-3 py-1.5 fw-bold" style={{ backgroundColor: '#0284c7', color: 'white', borderRadius: '8px', fontSize: '0.85rem' }}>
                <i className="fas fa-box me-1.5"></i>{container.container_number}
              </span>
              <span className="badge bg-secondary text-white border px-2.5 py-1.5 fw-semibold" style={{ fontSize: '0.82rem', borderRadius: '8px' }}>
                {container.size_type}
              </span>
              <span className="badge bg-light text-dark border px-2.5 py-1.5 fw-semibold" style={{ fontSize: '0.82rem', borderRadius: '8px' }}>
                B/L: {container.bill_of_lading}
              </span>
            </div>
            <div className="d-flex align-items-center gap-2 ms-auto">
              <button
                className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                onClick={handleCopyInfo}
                title="Copy Container Details"
                style={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                <i className={`fas ${copySuccess ? 'fa-check text-success' : 'fa-copy'}`}></i>
                {copySuccess ? 'Copied!' : 'Copy Info'}
              </button>
              <button
                className="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                onClick={handlePrint}
                title="Print Gate-In Pass"
                style={{ borderRadius: '8px', fontSize: '0.78rem' }}
              >
                <i className="fas fa-print"></i> Print Slip
              </button>
              <button className="btn-close ms-1" onClick={onClose} aria-label="Close"></button>
            </div>
          </div>

          {/* Body */}
          <div className="modal-body px-4 py-4" style={{ backgroundColor: '#ffffff' }}>
            
            {/* Customs & Status Banner */}
            <div className="p-3.5 rounded-3 mb-4 d-flex flex-wrap justify-content-between align-items-center gap-3" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <div>
                <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <i className="fas fa-shield-alt me-1 text-primary"></i>TRA Customs Clearance Status
                </div>
                <div className="d-flex align-items-center gap-2">
                  <span className={`badge ${container.customs_cleared ? 'bg-success' : 'bg-warning text-dark'} px-3 py-2 fw-bold`} style={{ fontSize: '0.88rem' }}>
                    {container.customs_cleared ? <><i className="fas fa-check-circle me-1.5"></i>TRA CUSTOMS CLEARED</> : <><i className="fas fa-exclamation-triangle me-1.5"></i>TRA HOLD / PENDING CLEARANCE</>}
                  </span>
                </div>
              </div>

              {onToggleCustoms && (
                <button
                  className={`btn text-white fw-bold px-3 py-2 border-0 shadow-sm ${container.customs_cleared ? 'bg-warning text-dark' : 'bg-success'}`}
                  style={{ borderRadius: '8px', fontSize: '0.88rem' }}
                  onClick={() => onToggleCustoms(container.id, container.customs_cleared)}
                  title="Click to change TRA customs release status"
                >
                  <i className={`fas ${container.customs_cleared ? 'fa-pause-circle' : 'fa-check-circle'} me-1.5`}></i>
                  {container.customs_cleared ? 'Place TRA Customs Hold' : 'Approve TRA Customs Clearance'}
                </button>
              )}
            </div>

            {/* Cargo Description Card */}
            <div className="mb-4">
              <h6 className="fw-bold text-dark mb-2 d-flex align-items-center gap-1.5">
                <i className="fas fa-cubes text-secondary"></i> Cargo Description & Specifications
              </h6>
              <div className="p-3 rounded-3 border bg-light">
                <div className="fw-semibold text-dark mb-2" style={{ fontSize: '0.95rem' }}>
                  {container.cargo_description}
                </div>
                <div className="row g-2 text-muted small">
                  <div className="col-sm-6">
                    <i className="fas fa-stamp me-1 text-info"></i> Seal Code: <strong className="text-dark">{container.seal_number}</strong>
                  </div>
                  <div className="col-sm-6">
                    <i className="fas fa-weight-hanging me-1 text-warning"></i> Gross Weight: <strong className="text-dark">{(container.gross_weight_kg / 1000).toFixed(2)} Tonnes ({container.gross_weight_kg.toLocaleString()} kg)</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal Yard & Shipping Line Grid */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-map-marked-alt me-1 text-primary"></i> Terminal Yard & Slot
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                    {container.terminal_yard}
                  </div>
                  <div className="text-primary fw-semibold small mt-1">
                    Slot Allocation: {container.yard_slot}
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="p-3 rounded-3 border bg-light h-100">
                  <div className="text-muted small fw-semibold mb-1" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    <i className="fas fa-ship me-1 text-info"></i> Shipping Carrier
                  </div>
                  <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                    {container.shipping_line}
                  </div>
                  <div className="text-muted small mt-1">
                    Gate-In Arrival Date: {container.gate_in_date || '2026-07-24'}
                  </div>
                </div>
              </div>
            </div>

            {/* Consignee Card */}
            <div className="p-3 rounded-3 border bg-light d-flex justify-content-between align-items-center">
              <div>
                <div className="text-muted small fw-semibold mb-0.5" style={{ fontSize: '0.72rem', textTransform: 'uppercase' }}>
                  Consignee / Import Receiver
                </div>
                <div className="fw-bold text-dark" style={{ fontSize: '0.95rem' }}>
                  {container.consignee}
                </div>
              </div>
              <span className="badge bg-white text-dark border px-2.5 py-1 fw-semibold" style={{ fontSize: '0.8rem' }}>
                Status: {container.status}
              </span>
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

export default ContainerDetailModal;

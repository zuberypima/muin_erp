import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

// Default idle timeout: 15 minutes (900 seconds)
// Warning threshold: 60 seconds before expiration modal appears
const IDLE_TIMEOUT_SECONDS = 15 * 60; // 900 seconds
const WARNING_SECONDS = 60; // Show modal when <= 60s remain

const IdleTimerManager: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState<number>(IDLE_TIMEOUT_SECONDS);
  const [showWarningModal, setShowWarningModal] = useState<boolean>(false);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    setSecondsLeft(IDLE_TIMEOUT_SECONDS);
    setShowWarningModal(false);
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const activityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    const handleUserActivity = () => {
      const now = Date.now();
      // Only reset timer if warning modal is NOT active
      if (!showWarningModal && now - lastActivityRef.current > 1000) {
        lastActivityRef.current = now;
      }
    };

    activityEvents.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    // Check inactivity every second
    const interval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      const remaining = Math.max(0, IDLE_TIMEOUT_SECONDS - elapsedSeconds);

      setSecondsLeft(remaining);

      if (remaining <= WARNING_SECONDS && remaining > 0) {
        setShowWarningModal(true);
      } else if (remaining === 0) {
        setShowWarningModal(false);
        logout();
        window.location.href = '/login?reason=expired';
      }
    }, 1000);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
      clearInterval(interval);
    };
  }, [isAuthenticated, logout, showWarningModal]);

  if (!isAuthenticated || !showWarningModal) return null;

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const formattedTime = `${minutes}:${secs < 10 ? '0' : ''}${secs}`;

  return (
    <div
      className="modal fade show d-block"
      style={{
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(6px)',
        zIndex: 9999,
      }}
      tabIndex={-1}
    >
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
          <div className="modal-header border-0 bg-warning text-dark py-3 px-4">
            <div className="d-flex align-items-center gap-2">
              <i className="fas fa-exclamation-triangle fs-4 me-2"></i>
              <h5 className="modal-title fw-bold mb-0">Session Expiring Soon</h5>
            </div>
          </div>

          <div className="modal-body p-4 text-center">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center bg-light rounded-circle text-warning shadow-sm"
              style={{ width: '84px', height: '84px', border: '3px solid #fef3c7' }}
            >
              <span className="fw-bold fs-3 text-dark">{formattedTime}</span>
            </div>

            <h6 className="fw-bold text-dark mb-2">Are you still working?</h6>
            <p className="text-muted small mb-0" style={{ lineHeight: '1.5' }}>
              You have been inactive for a while. For your security, your session will expire in{' '}
              <strong className="text-danger fw-bold">{secondsLeft} seconds</strong> unless you extend your session.
            </p>
          </div>

          <div className="modal-footer border-0 bg-light px-4 py-3 d-flex justify-content-between">
            <button
              type="button"
              className="btn btn-outline-secondary fw-semibold px-3"
              style={{ borderRadius: '8px', fontSize: '0.88rem' }}
              onClick={() => {
                logout();
                window.location.href = '/login?reason=expired';
              }}
            >
              <i className="fas fa-sign-out-alt me-2"></i>Logout Now
            </button>

            <button
              type="button"
              className="btn text-white fw-bold px-4 shadow-sm"
              style={{ borderRadius: '8px', fontSize: '0.88rem', backgroundColor: '#10b981' }}
              onClick={resetTimer}
            >
              <i className="fas fa-sync-alt me-2"></i>Extend Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdleTimerManager;

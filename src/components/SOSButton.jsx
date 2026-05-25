import React, { useEffect, useRef } from 'react';

// Flashing red overlay when SOS is active
const overlayStyle = (active) => ({
  position: 'fixed',
  inset: 0,
  background: 'rgba(239,68,68,0.08)',
  pointerEvents: 'none',
  zIndex: 999,
  opacity: active ? 1 : 0,
  transition: 'opacity 0.4s',
});

export default function SOSButton({ isSOSActive, setIsSOSActive, addLog }) {
  const pulseRef = useRef(null);

  // Pulsing red ring animation while SOS is active
  useEffect(() => {
    if (!pulseRef.current) return;
    if (isSOSActive) {
      pulseRef.current.style.animation = 'sosPulse 1.2s ease-out infinite';
    } else {
      pulseRef.current.style.animation = 'none';
    }
  }, [isSOSActive]);

  const handleClick = () => {
    const next = !isSOSActive;
    setIsSOSActive(next);
    addLog(
      next
        ? 'SOS signal sent — contacts & services alerted'
        : 'SOS signal cancelled',
      next ? 'danger' : 'info'
    );
  };

  return (
    <>
      {/* Subtle full-screen tint when active */}
      <div style={overlayStyle(isSOSActive)} />

      <div className="sos-container">
        {/* Animated outer ring */}
        <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div
            ref={pulseRef}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: `3px solid ${isSOSActive ? '#ef4444' : '#fecaca'}`,
              transition: 'border-color 0.3s',
            }}
          />
          {/* Second decorative ring */}
          <div style={{
            position: 'absolute',
            inset: 12,
            borderRadius: '50%',
            border: `1.5px solid ${isSOSActive ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)'}`,
            transition: 'border-color 0.3s',
          }} />

          <button
            className={`sos-button ${isSOSActive ? 'active' : ''}`}
            onClick={handleClick}
            aria-label="SOS"
            style={{ width: 140, height: 140 }}
          >
            SOS
            <small>{isSOSActive ? 'tap to cancel' : 'tap for help'}</small>
          </button>
        </div>

        {/* Status pill */}
        <div className={`status-pill ${isSOSActive ? 'alert' : 'safe'}`}>
          <div className={`status-dot ${isSOSActive ? 'red' : 'green'}`} />
          <span>{isSOSActive ? 'SOS signal active — help is on the way' : 'You are safe'}</span>
        </div>

        {/* Active info cards */}
        {isSOSActive && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
            {[
              { icon: '📍', text: 'Live location shared with contacts' },
              { icon: '📲', text: 'SMS alerts sent to trusted contacts' },
              { icon: '🚔', text: 'Emergency services notified' },
            ].map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: 10, fontSize: 13, color: '#991b1b' }}>
                <span>{icon}</span><span>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes sosPulse {
          0%   { transform: scale(1);    opacity: 1; }
          70%  { transform: scale(1.12); opacity: 0; }
          100% { transform: scale(1);    opacity: 0; }
        }
      `}</style>
    </>
  );
}
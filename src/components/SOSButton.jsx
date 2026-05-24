import React from 'react';

export default function SOSButton({ isSOSActive, setIsSOSActive, addLog }) {
  const handleClick = () => {
    const next = !isSOSActive;
    setIsSOSActive(next);
    addLog(next ? 'SOS alert triggered' : 'SOS alert cancelled', next ? 'danger' : 'info');
  };

  return (
    <div className="sos-container">
      <div className="sos-ring">
        <button className={`sos-button ${isSOSActive ? 'active' : ''}`} onClick={handleClick} aria-label="SOS">
          SOS
          <small>{isSOSActive ? 'tap to cancel' : 'hold for help'}</small>
        </button>
      </div>
      <div className={`status-pill ${isSOSActive ? 'alert' : 'safe'}`}>
        <div className={`status-dot ${isSOSActive ? 'red' : 'green'}`} />
        <span>{isSOSActive ? 'Alert active — help is on the way' : 'You are safe'}</span>
      </div>
    </div>
  );
}
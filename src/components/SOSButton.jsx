import React from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SOSButton({ isSOSActive, setIsSOSActive, addLog }) {
  
  const handleSOSClick = () => {
    const nextState = !isSOSActive;
    setIsSOSActive(nextState);
    if (nextState) {
      console.log('SOS Alert Triggered! Location shared with emergency contacts.');
      if (addLog) {
        addLog('SOS Alert Triggered! Location shared & siren playing.', 'danger');
      }
    } else {
      console.log('SOS Alert Cancelled.');
      if (addLog) {
        addLog('SOS Alert Cancelled and Siren stopped.', 'info');
      }
    }
  };

  return (
    <div className="sos-container">
      <button 
        className={`sos-button ${isSOSActive ? 'active' : 'animate-pulse-btn'}`}
        onClick={handleSOSClick}
        aria-label="SOS Button"
      >
        SOS
      </button>

      <div className={`status-badge ${isSOSActive ? 'alert' : 'safe'}`}>
        {isSOSActive ? (
          <>
            <ShieldAlert size={18} />
            Alert Active - Help is on the way
          </>
        ) : (
          <>
            <CheckCircle2 size={18} />
            You are currently safe
          </>
        )}
      </div>
    </div>
  );
}

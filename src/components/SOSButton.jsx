import { useState, useRef } from 'react';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function SOSButton() {
  const [isAlertActive, setIsAlertActive] = useState(false);
  const audioRef = useRef(null);
  
  if (!audioRef.current) {
    audioRef.current = new Audio('/siren.mp3');
    audioRef.current.loop = true;
  }

  const handleSOSClick = () => {
    setIsAlertActive(!isAlertActive);
    if (!isAlertActive) {
      // Simulate sending alerts
      audioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
      console.log('SOS Alert Triggered! Location shared with emergency contacts.');
      if ("vibrate" in navigator) {
        navigator.vibrate([200, 100, 200, 100, 500]);
      }
    } else {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      console.log('SOS Alert Cancelled.');
    }
  };

  return (
    <div className="sos-container">
      <button 
        className={`sos-button ${isAlertActive ? 'active' : 'animate-pulse-btn'}`}
        onClick={handleSOSClick}
        aria-label="SOS Button"
      >
        SOS
      </button>

      <div className={`status-badge ${isAlertActive ? 'alert' : 'safe'}`}>
        {isAlertActive ? (
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

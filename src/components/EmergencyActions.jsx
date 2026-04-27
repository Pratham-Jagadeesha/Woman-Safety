import { useState, useRef } from 'react';
import { PhoneCall, BellRing, Mic } from 'lucide-react';

export default function EmergencyActions() {
  const [isRecording, setIsRecording] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);

  const alarmAudioRef = useRef(null);
  const ringAudioRef = useRef(null);

  if (!alarmAudioRef.current) {
    alarmAudioRef.current = new Audio('/siren.mp3');
    alarmAudioRef.current.loop = true;
  }
  
  if (!ringAudioRef.current) {
    ringAudioRef.current = new Audio('/ring.mp3');
  }

  const handleFakeCall = () => {
    ringAudioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
    alert("Simulating incoming Fake Call: 'Mom calling...'");
    // Stop ringing after alert is dismissed
    ringAudioRef.current.pause();
    ringAudioRef.current.currentTime = 0;
  };

  const handleAlarm = () => {
    setIsAlarmActive(!isAlarmActive);
    if (!isAlarmActive) {
      alarmAudioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
      console.log("Playing loud alarm sound...");
    } else {
      alarmAudioRef.current.pause();
      alarmAudioRef.current.currentTime = 0;
      console.log("Alarm stopped.");
    }
  };

  const handleRecording = () => {
    setIsRecording(!isRecording);
    // In a real app, this would start the device's camera/mic
    console.log(isRecording ? "Stopped recording." : "Started discreet audio/video recording.");
  };

  return (
    <div className="action-grid">
      <button className="action-card" onClick={handleFakeCall}>
        <div className="action-icon-wrapper" style={{ color: '#d69e2e', backgroundColor: '#faf089' }}>
          <PhoneCall size={24} />
        </div>
        <span className="font-medium text-sm">Fake Call</span>
      </button>

      <button 
        className="action-card" 
        onClick={handleAlarm}
        style={isAlarmActive ? { backgroundColor: '#fed7d7', borderColor: '#f56565' } : {}}
      >
        <div className="action-icon-wrapper" style={{ color: '#e53e3e', backgroundColor: isAlarmActive ? 'white' : '#fed7d7' }}>
          <BellRing size={24} className={isAlarmActive ? 'animate-pulse' : ''} />
        </div>
        <span className="font-medium text-sm">{isAlarmActive ? 'Stop Alarm' : 'Loud Alarm'}</span>
      </button>

      <button 
        className="action-card" 
        onClick={handleRecording}
        style={{ gridColumn: 'span 2', backgroundColor: isRecording ? '#fefcbf' : 'white' }}
      >
        <div className="action-icon-wrapper" style={{ color: isRecording ? '#e53e3e' : '#718096', backgroundColor: isRecording ? '#fed7d7' : '#edf2f7' }}>
          <Mic size={24} className={isRecording ? 'animate-pulse' : ''} />
        </div>
        <span className="font-medium text-sm">
          {isRecording ? 'Recording in progress... Tap to stop' : 'Auto Audio/Video Record'}
        </span>
      </button>
    </div>
  );
}

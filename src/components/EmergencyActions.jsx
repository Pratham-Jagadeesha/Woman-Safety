import React, { useState, useRef } from 'react';
import { PhoneIncoming, BellRing, Mic } from 'lucide-react';

export default function EmergencyActions() {
  const [alarmOn, setAlarmOn] = useState(false);
  const [recOn, setRecOn] = useState(false);
  const alarmRef = useRef(null);

  if (!alarmRef.current) {
    alarmRef.current = new Audio('/siren.mp3');
    alarmRef.current.loop = true;
  }

  const fakeCall = () => alert("Incoming call: Mom calling...");

  const toggleAlarm = () => {
    setAlarmOn(v => {
      if (!v) alarmRef.current.play().catch(() => {});
      else { alarmRef.current.pause(); alarmRef.current.currentTime = 0; }
      return !v;
    });
  };

  const toggleRec = () => setRecOn(v => !v);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon ci-amber">
            <BellRing size={16} />
          </div>
          Quick actions
        </div>
      </div>
      <div className="action-grid">
        <button className="action-card" onClick={fakeCall}>
          <PhoneIncoming size={22} color="#d97706" />
          Fake call
        </button>
        <button className={`action-card ${alarmOn ? 'alarm-on' : ''}`} onClick={toggleAlarm}>
          <BellRing size={22} color={alarmOn ? '#ef4444' : '#ef4444'} />
          {alarmOn ? 'Stop alarm' : 'Loud alarm'}
        </button>
        <button className={`action-card ${recOn ? 'rec-on' : ''}`} onClick={toggleRec} style={{ gridColumn: 'span 2' }}>
          <Mic size={22} color={recOn ? '#d97706' : 'var(--text-secondary)'} />
          {recOn ? 'Recording... tap to stop' : 'Auto record'}
        </button>
      </div>
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { BellRing, Mic } from 'lucide-react';

export default function EmergencyActions({ sirenVolume = 0.8 }) {
  const [alarmOn, setAlarmOn] = useState(false);
  const [recOn, setRecOn] = useState(false);
  const alarmRef = useRef(null);

  // Sync volume changes even while alarm is playing
  useEffect(() => {
    if (alarmRef.current) alarmRef.current.volume = sirenVolume;
  }, [sirenVolume]);

  const getAlarm = () => {
    if (!alarmRef.current) {
      alarmRef.current = new Audio('/siren.mp3');
      alarmRef.current.loop = true;
      alarmRef.current.volume = sirenVolume;
    }
    return alarmRef.current;
  };

  const toggleAlarm = () => {
    const alarm = getAlarm();
    if (!alarmOn) {
      alarm.play().catch(() => {});
    } else {
      alarm.pause();
      alarm.currentTime = 0;
    }
    setAlarmOn(v => !v);
  };

  const toggleRec = () => setRecOn(v => !v);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon ci-amber"><BellRing size={16} /></div>
          Quick actions
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Loud alarm — full width */}
        <button
          className={`action-card ${alarmOn ? 'alarm-on' : ''}`}
          onClick={toggleAlarm}
          style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, padding: '14px 16px' }}
        >
          <BellRing
            size={20}
            color={alarmOn ? '#ef4444' : '#ef4444'}
            style={{ animation: alarmOn ? 'ringShake 0.4s infinite' : 'none' }}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {alarmOn ? 'Stop loud alarm' : 'Sound loud alarm'}
          </span>
          {alarmOn && (
            <span style={{ fontSize: 11, padding: '2px 8px', background: '#ef4444', color: '#fff', borderRadius: 99, fontWeight: 600 }}>
              ACTIVE
            </span>
          )}
        </button>

        {/* Auto record — full width */}
        <button
          className={`action-card ${recOn ? 'rec-on' : ''}`}
          onClick={toggleRec}
          style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, padding: '14px 16px' }}
        >
          <Mic
            size={20}
            color={recOn ? '#d97706' : 'var(--text-secondary)'}
            style={{ animation: recOn ? 'pulse 1.5s infinite' : 'none' }}
          />
          <span style={{ fontSize: 14, fontWeight: 500 }}>
            {recOn ? 'Recording in progress...' : 'Start auto record'}
          </span>
          {recOn && (
            <span style={{ fontSize: 11, padding: '2px 8px', background: '#d97706', color: '#fff', borderRadius: 99, fontWeight: 600 }}>
              REC
            </span>
          )}
        </button>
      </div>

      <style>{`
        @keyframes ringShake {
          0%,100% { transform: rotate(0deg); }
          25%      { transform: rotate(-12deg); }
          75%      { transform: rotate(12deg); }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
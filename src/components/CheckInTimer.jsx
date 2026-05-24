import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';

const DURATIONS = [
  { label: '5s', value: 5 },
  { label: '1m', value: 60 },
  { label: '5m', value: 300 },
  { label: '10m', value: 600 },
];

export default function CheckInTimer({ isSOSActive, setIsSOSActive, pinCode, addLog }) {
  const [selectedDur, setSelectedDur] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [pinErr, setPinErr] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isActive) setTimeLeft(selectedDur);
  }, [selectedDur, isActive]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(p => p - 1), 1000);
    } else if (isActive && timeLeft === 0) {
      clearInterval(timerRef.current);
      setIsActive(false);
      setIsSOSActive(true);
      addLog('Safety timer expired — SOS triggered', 'danger');
      resetUI();
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startTimer = () => {
    setIsActive(true);
    setShowPin(false);
    setPin('');
    addLog(`Safety check-in timer started for ${fmt(selectedDur)}`, 'info');
  };

  const resetUI = () => {
    setIsActive(false);
    setShowPin(false);
    setPin('');
    setPinErr(false);
    setTimeLeft(selectedDur);
    clearInterval(timerRef.current);
  };

  const confirmPin = () => {
    if (pin === pinCode) {
      clearInterval(timerRef.current);
      if (isSOSActive) setIsSOSActive(false);
      addLog('Safe check-in verified with PIN', 'success');
      resetUI();
    } else {
      setPinErr(true);
      setPin('');
      setTimeout(() => setPinErr(false), 800);
    }
  };

  const pct = (timeLeft / selectedDur) * 100;
  const danger = timeLeft <= 10 && isActive;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon ci-blue"><Clock size={16} /></div>
          Safety check-in
        </div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{isActive ? 'Active' : 'Inactive'}</span>
      </div>

      <div className="timer-wrap">
        <div className={`timer-ring ${danger ? 'danger' : ''}`}>
          <div className="timer-time">{fmt(timeLeft)}</div>
          <div className="timer-label">remaining</div>
        </div>

        <div className="prog-bar">
          <div className={`prog-fill ${danger ? 'danger' : ''}`} style={{ width: `${pct}%` }} />
        </div>

        {!isActive && !showPin && (
          <>
            <div className="dur-row">
              {DURATIONS.map(d => (
                <button
                  key={d.value}
                  className={`dur-btn ${selectedDur === d.value ? 'sel' : ''}`}
                  onClick={() => setSelectedDur(d.value)}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <button className="primary-btn" onClick={startTimer}>
              Start timer ({fmt(selectedDur)})
            </button>
          </>
        )}

        {isActive && !showPin && (
          <button className="primary-btn green" onClick={() => setShowPin(true)}>
            I'm safe (enter PIN)
          </button>
        )}

        {showPin && (
          <div style={{ width: '100%' }}>
            <div className="section-label">Enter PIN to confirm safety</div>
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
              className={`pin-field ${pinErr ? 'err' : ''}`}
              placeholder="••••"
              autoFocus
            />
            <div className="pin-actions">
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowPin(false)}>Back</button>
              <button className="primary-btn green" style={{ flex: 2 }} onClick={confirmPin} disabled={pin.length !== 4}>
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Clock, ShieldAlert, Check } from 'lucide-react';

export default function CheckInTimer({ isSOSActive, setIsSOSActive, pinCode, addLog }) {
  const [selectedDuration, setSelectedDuration] = useState(5); // Default 5 seconds for easy demo
  const [timeLeft, setTimeLeft] = useState(5);
  const [isActive, setIsActive] = useState(false);
  const [showPinInput, setShowPinInput] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const timerRef = useRef(null);

  // Sync selectedDuration changes to timeLeft when timer is not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(selectedDuration);
    }
  }, [selectedDuration, isActive]);

  // Countdown timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Safety Timer expired! Trigger SOS
      setIsActive(false);
      setIsSOSActive(true);
      addLog('Safety Timer Completed - SOS Alert Triggered', 'danger');
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, setIsSOSActive, addLog]);

  const handleStartTimer = () => {
    setIsActive(true);
    setShowPinInput(false);
    setEnteredPin('');
    setPinError(false);
    addLog(`Safety Check-in Timer started for ${formatTime(selectedDuration)}`, 'info');
  };

  const handleImSafeClick = () => {
    setShowPinInput(true);
    setPinError(false);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (enteredPin === pinCode) {
      setIsActive(false);
      setShowPinInput(false);
      setEnteredPin('');
      addLog('Safe Check-In Verified with PIN', 'success');
      // If SOS was active, we can turn it off too
      if (isSOSActive) {
        setIsSOSActive(false);
      }
    } else {
      setPinError(true);
      setEnteredPin('');
      setTimeout(() => setPinError(false), 800); // Reset shaking effect
    }
  };

  const handleCancelPinInput = () => {
    setShowPinInput(false);
    setEnteredPin('');
    setPinError(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const progressPercent = isActive ? (timeLeft / selectedDuration) * 100 : 100;

  return (
    <div className="card checkin-timer-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="icon-btn" style={{ backgroundColor: '#ebf8ff', color: 'var(--primary-color)' }}>
          <Clock size={20} />
        </div>
        <h2 className="text-lg font-bold">Safety Check-In</h2>
      </div>

      {!isActive && !showPinInput && (
        <div className="flex-col gap-4">
          <p className="text-sm text-secondary">
            Set a timer when walking alone. If you don't check in by entering your PIN before the countdown ends, a loud SOS alert will be triggered automatically.
          </p>

          <div className="duration-selector mt-2">
            <span className="text-xs font-semibold text-secondary mb-2 block">SELECT DURATION:</span>
            <div className="duration-options">
              {[5, 60, 300, 600].map((dur) => (
                <button
                  key={dur}
                  onClick={() => setSelectedDuration(dur)}
                  className={`duration-opt-btn ${selectedDuration === dur ? 'active' : ''}`}
                >
                  {dur === 5 ? '5s (Demo)' : dur === 60 ? '1m' : dur === 300 ? '5m' : '10m'}
                </button>
              ))}
            </div>
          </div>

          <button className="start-timer-btn mt-2" onClick={handleStartTimer}>
            Start Safety Timer ({formatTime(selectedDuration)})
          </button>
        </div>
      )}

      {isActive && !showPinInput && (
        <div className="flex-col items-center justify-center py-4">
          {/* Circular/Oval timer display with pulse */}
          <div className={`countdown-display ${timeLeft <= 10 ? 'danger-pulse' : 'primary-pulse'}`}>
            <span className="countdown-time">{formatTime(timeLeft)}</span>
            <span className="countdown-subtext">Remaining</span>
          </div>

          {/* Progress Bar */}
          <div className="timer-progress-container w-full mt-4">
            <div 
              className={`timer-progress-bar ${timeLeft <= 10 ? 'bg-danger' : 'bg-primary'}`} 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <button className="safe-checkin-btn mt-4" onClick={handleImSafeClick}>
            <ShieldCheck size={20} style={{ marginRight: '8px' }} /> I'm Safe (Enter PIN)
          </button>
        </div>
      )}

      {showPinInput && (
        <div className="flex-col items-center py-2">
          <h3 className="text-sm font-bold mb-2">Enter PIN to Confirm Safety</h3>
          <p className="text-xs text-secondary text-center mb-4">
            Enter your 4-digit safety PIN (default: {pinCode}) to verify you are safe.
          </p>

          <form onSubmit={handlePinSubmit} className="pin-form w-full flex-col items-center">
            <input
              type="password"
              maxLength={4}
              value={enteredPin}
              onChange={(e) => setEnteredPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className={`pin-input-field ${pinError ? 'shake-animation error' : ''}`}
              autoFocus
            />

            {pinError && (
              <span className="text-xs text-danger-color font-semibold mt-1">
                Incorrect PIN. Please try again!
              </span>
            )}

            <div className="pin-actions-row w-full mt-4">
              <button 
                type="button" 
                className="pin-cancel-btn" 
                onClick={handleCancelPinInput}
              >
                Back
              </button>
              <button 
                type="submit" 
                className="pin-confirm-btn"
                disabled={enteredPin.length !== 4}
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

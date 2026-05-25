import React, { useState, useRef, useEffect } from 'react';
import { Lock, Volume2, ShieldAlert, RefreshCw, Check, Phone } from 'lucide-react';

// ── Circular knob ──────────────────────────────────────────────────────────────
function CircularKnob({ value, onChange }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  const size = 130, cx = 65, cy = 65, r = 48, sw = 9;
  const startAngle = 135, totalAngle = 270;
  const pct = Math.max(0, Math.min(1, value));
  const currentAngle = startAngle + pct * totalAngle;

  const toRad = d => d * Math.PI / 180;
  const pt = a => ({ x: cx + r * Math.cos(toRad(a)), y: cy + r * Math.sin(toRad(a)) });

  const arc = (from, to) => {
    const s = pt(from), e = pt(to);
    const large = (to - from) > 180 ? 1 : 0;
    return `M${s.x} ${s.y} A${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  const computeValue = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = (clientX - rect.left) * (size / rect.width) - cx;
    const y = (clientY - rect.top) * (size / rect.height) - cy;
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < 0) angle += 360;
    let normalized = angle - startAngle;
    if (normalized < 0) normalized += 360;
    if (normalized <= totalAngle) {
      onChangeRef.current(Math.max(0, Math.min(1, normalized / totalAngle)));
    }
  };

  const updateRef = useRef(null);
  updateRef.current = computeValue;

  useEffect(() => {
    const onMove = e => { if (dragging.current) updateRef.current(e); };
    const onUp = () => { dragging.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  const hp = pt(currentAngle);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0' }}>
      <svg
        ref={svgRef}
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
        onMouseDown={e => { dragging.current = true; computeValue(e); }}
        onTouchStart={e => { dragging.current = true; computeValue(e); }}
      >
        <path d={arc(startAngle, startAngle + totalAngle)} fill="none" stroke="var(--surface-border)" strokeWidth={sw} strokeLinecap="round" />
        {pct > 0.01 && (
          <path d={arc(startAngle, currentAngle)} fill="none" stroke="#3b6fd4" strokeWidth={sw} strokeLinecap="round" />
        )}
        <circle cx={hp.x} cy={hp.y} r={10} fill="#3b6fd4" stroke="white" strokeWidth={2.5} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="600" fill="var(--text-primary)">
          {Math.round(pct * 100)}%
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">
          volume
        </text>
      </svg>
    </div>
  );
}

// ── Toggle row ─────────────────────────────────────────────────────────────────
function ToggleRow({ label, sub, checked, onChange }) {
  return (
    <div className="setting-row">
      <div>
        <div className="setting-label">{label}</div>
        <div className="setting-sub">{sub}</div>
      </div>
      <label className="toggle-switch">
        <input type="checkbox" checked={checked} onChange={onChange} />
        <div className="toggle-track" />
        <div className="toggle-thumb" />
      </label>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function SettingsTab({
  pinCode, setPinCode,
  sirenVolume, setSirenVolume,
  emergencyToggles, setEmergencyToggles,
  addLog,
}) {
  const [pinInput, setPinInput] = useState(pinCode);
  const [pinSaved, setPinSaved] = useState(false);
  const [pinError, setPinError] = useState('');
  const [numsSaved, setNumsSaved] = useState(false);

  const [emergencyNums, setEmergencyNums] = useState(() => {
    const saved = localStorage.getItem('safeguard_emergency_numbers');
    return saved ? JSON.parse(saved) : { police: '100', helpline: '1091' };
  });

  const savePin = () => {
    if (!/^\d{4}$/.test(pinInput)) {
      setPinError('PIN must be exactly 4 digits.');
      return;
    }
    setPinError('');
    setPinCode(pinInput);
    addLog('Safety PIN updated', 'success');
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  const saveNums = () => {
    localStorage.setItem('safeguard_emergency_numbers', JSON.stringify(emergencyNums));
    addLog('Emergency helpline numbers updated', 'info');
    setNumsSaved(true);
    setTimeout(() => setNumsSaved(false), 2500);
  };

  const toggle = (key) => {
    const updated = { ...emergencyToggles, [key]: !emergencyToggles[key] };
    setEmergencyToggles(updated);
    addLog(`${key} ${updated[key] ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <>
      {/* PIN */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-blue"><Lock size={16} /></div> Safety PIN</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>
          4-digit PIN required to dismiss timers and cancel alerts.
        </p>
        <div className="setting-input-row">
          <input
            type="password"
            maxLength={4}
            className="setting-input"
            style={{ letterSpacing: 6, fontSize: 16, fontWeight: 500 }}
            value={pinInput}
            onChange={e => { setPinInput(e.target.value.replace(/\D/g, '')); setPinError(''); }}
            placeholder="••••"
          />
          <button className="save-btn" onClick={savePin}>Save</button>
        </div>
        {pinError && <p style={{ fontSize: 12, color: 'var(--danger-color)', marginTop: 6 }}>{pinError}</p>}
        {pinSaved && (
          <p style={{ fontSize: 12, color: 'var(--safe-color)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={13} /> PIN saved
          </p>
        )}
      </div>

      {/* Volume knob */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-amber"><Volume2 size={16} /></div> Siren volume</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
          Drag the knob to set alarm loudness.
        </p>
        <CircularKnob value={sirenVolume} onChange={setSirenVolume} />
      </div>

      {/* Emergency numbers */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-red"><Phone size={16} /></div> Emergency helplines</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Customise the emergency numbers shown in your Contacts tab.
        </p>
        <div style={{ marginBottom: 10 }}>
          <div className="section-label">Police / emergency number</div>
          <input
            type="tel"
            className="setting-input"
            style={{ width: '100%', marginTop: 4 }}
            value={emergencyNums.police}
            onChange={e => setEmergencyNums(p => ({ ...p, police: e.target.value }))}
            placeholder="e.g. 100"
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <div className="section-label">Women's helpline number</div>
          <input
            type="tel"
            className="setting-input"
            style={{ width: '100%', marginTop: 4 }}
            value={emergencyNums.helpline}
            onChange={e => setEmergencyNums(p => ({ ...p, helpline: e.target.value }))}
            placeholder="e.g. 1091"
          />
        </div>
        <button className="save-btn" style={{ width: '100%' }} onClick={saveNums}>
          Save numbers
        </button>
        {numsSaved && (
          <p style={{ fontSize: 12, color: 'var(--safe-color)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Check size={13} /> Numbers updated
          </p>
        )}
      </div>

      {/* Emergency triggers */}
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-red"><ShieldAlert size={16} /></div> Emergency triggers</div>
        </div>
        <ToggleRow label="Alert police" sub="Auto-queue call on SOS" checked={emergencyToggles.alertPolice} onChange={() => toggle('alertPolice')} />
        <ToggleRow label="Share live location" sub="Broadcast GPS to contacts" checked={emergencyToggles.shareLocation} onChange={() => toggle('shareLocation')} />
        <ToggleRow label="Auto-record audio" sub="Background mic recording" checked={emergencyToggles.recordAudio} onChange={() => toggle('recordAudio')} />
        <ToggleRow label="Send SMS alerts" sub="Notify all trusted contacts" checked={emergencyToggles.sendSms} onChange={() => toggle('sendSms')} />
      </div>

      {/* Danger zone */}
      <div className="danger-zone">
        <div className="danger-zone-title">
          <RefreshCw size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />
          Danger zone
        </div>
        <div className="danger-zone-sub">Reset all settings, contacts, and logs to factory defaults.</div>
        <button
          className="reset-btn"
          onClick={() => {
            if (window.confirm('Reset all app data?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          Reset SafeGuard
        </button>
      </div>
    </>
  );
}
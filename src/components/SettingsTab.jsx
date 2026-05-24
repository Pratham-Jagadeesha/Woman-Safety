import React, { useState } from 'react';
import { Lock, Map, Volume2, ShieldAlert, RefreshCw, Check } from 'lucide-react';

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

export default function SettingsTab({ pinCode, setPinCode, sirenVolume, setSirenVolume, emergencyToggles, setEmergencyToggles, googleMapsApiKey, setGoogleMapsApiKey, addLog }) {
  const [pinInput, setPinInput] = useState(pinCode);
  const [apiInput, setApiInput] = useState(googleMapsApiKey);
  const [pinSaved, setPinSaved] = useState(false);
  const [apiSaved, setApiSaved] = useState(false);

  const savePin = () => {
    if (!/^\d{4}$/.test(pinInput)) return;
    setPinCode(pinInput);
    addLog('Safety PIN updated', 'success');
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  const saveApi = () => {
    setGoogleMapsApiKey(apiInput.trim());
    addLog('Google Maps API key updated', 'info');
    setApiSaved(true);
    setTimeout(() => setApiSaved(false), 2500);
  };

  const toggle = (key) => {
    const updated = { ...emergencyToggles, [key]: !emergencyToggles[key] };
    setEmergencyToggles(updated);
    addLog(`${key} ${updated[key] ? 'enabled' : 'disabled'}`, 'info');
  };

  return (
    <>
      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-blue"><Lock size={16} /></div> Safety PIN</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>4-digit PIN required to dismiss timers and cancel alerts.</p>
        <div className="setting-input-row">
          <input type="password" maxLength={4} className="setting-input" style={{ letterSpacing: 6, fontSize: 16, fontWeight: 500 }} value={pinInput} onChange={e => setPinInput(e.target.value.replace(/\D/g, ''))} placeholder="••••" />
          <button className="save-btn" onClick={savePin}>Save</button>
        </div>
        {pinSaved && <p style={{ fontSize: 12, color: 'var(--safe-color)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={13} /> PIN saved</p>}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-blue"><Map size={16} /></div> Maps API key</div>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10 }}>Add your Google Maps key for live navigation, or leave blank for simulation mode.</p>
        <div className="setting-input-row">
          <input type="password" className="setting-input" placeholder="AIzaSy..." value={apiInput} onChange={e => setApiInput(e.target.value)} />
          <button className="save-btn" onClick={saveApi}>Save</button>
        </div>
        {apiSaved && <p style={{ fontSize: 12, color: 'var(--safe-color)', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Check size={13} /> Saved</p>}
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-amber"><Volume2 size={16} /></div> Siren volume</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
          <span>Mute</span><span style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{Math.round(sirenVolume * 100)}%</span><span>Max</span>
        </div>
        <input type="range" min="0" max="1" step="0.01" value={sirenVolume} onChange={e => setSirenVolume(parseFloat(e.target.value))} className="volume-slider" />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title"><div className="card-icon ci-red"><ShieldAlert size={16} /></div> Emergency triggers</div>
        </div>
        <ToggleRow label="Alert police (100)" sub="Auto-queue call on SOS" checked={emergencyToggles.alertPolice} onChange={() => toggle('alertPolice')} />
        <ToggleRow label="Share live location" sub="Broadcast GPS to contacts" checked={emergencyToggles.shareLocation} onChange={() => toggle('shareLocation')} />
        <ToggleRow label="Auto-record audio" sub="Background mic recording" checked={emergencyToggles.recordAudio} onChange={() => toggle('recordAudio')} />
        <ToggleRow label="Send SMS alerts" sub="Notify all trusted contacts" checked={emergencyToggles.sendSms} onChange={() => toggle('sendSms')} />
      </div>

      <div className="danger-zone">
        <div className="danger-zone-title"><RefreshCw size={13} style={{ marginRight: 4, verticalAlign: 'middle' }} />Danger zone</div>
        <div className="danger-zone-sub">Reset all settings, contacts, and logs to factory defaults.</div>
        <button className="reset-btn" onClick={() => { if (window.confirm('Reset all app data?')) { localStorage.clear(); window.location.reload(); } }}>
          Reset SafeGuard
        </button>
      </div>
    </>
  );
}
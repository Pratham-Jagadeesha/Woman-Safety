import React, { useState } from 'react';
import { Settings, Shield, Volume2, ShieldAlert, Check, RefreshCw } from 'lucide-react';

export default function SettingsTab({ 
  pinCode, 
  setPinCode, 
  sirenVolume, 
  setSirenVolume, 
  emergencyToggles, 
  setEmergencyToggles,
  googleMapsApiKey,
  setGoogleMapsApiKey,
  addLog 
}) {
  const [tempPin, setTempPin] = useState(pinCode);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [pinError, setPinError] = useState('');

  const [apiKeyInput, setApiKeyInput] = useState(googleMapsApiKey);
  const [keySuccess, setKeySuccess] = useState(false);

  const handleApiKeyUpdate = (e) => {
    e.preventDefault();
    setGoogleMapsApiKey(apiKeyInput.trim());
    setKeySuccess(true);
    if (addLog) {
      addLog(apiKeyInput.trim() ? 'Google Maps API Key configured' : 'Google Maps API Key cleared', 'info');
    }
    setTimeout(() => setKeySuccess(false), 3000);
  };

  const handlePinUpdate = (e) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(tempPin)) {
      setPinError('PIN must be exactly 4 digits.');
      setPinSuccess(false);
      return;
    }
    setPinCode(tempPin);
    setPinError('');
    setPinSuccess(true);
    if (addLog) {
      addLog(`Safety PIN updated successfully to ${tempPin}`, 'success');
    }
    setTimeout(() => setPinSuccess(false), 3000);
  };

  const handleToggleChange = (key) => {
    const updated = {
      ...emergencyToggles,
      [key]: !emergencyToggles[key]
    };
    setEmergencyToggles(updated);
    if (addLog) {
      addLog(`Setting changed: ${key.replace(/([A-Z])/g, ' $1')} is now ${updated[key] ? 'ENABLED' : 'DISABLED'}`, 'info');
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setSirenVolume(val);
  };

  return (
    <div className="flex-col gap-4">
      {/* Page Title */}
      <div className="card settings-header-card">
        <div className="flex items-center gap-2">
          <div className="icon-btn" style={{ backgroundColor: '#ebf8ff', color: 'var(--primary-color)' }}>
            <Settings size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">App Settings</h2>
            <p className="text-xs text-secondary">Customize your emergency and safety rules</p>
          </div>
        </div>
      </div>

      {/* PIN Security Config */}
      <div className="card">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Shield size={18} color="var(--primary-color)" /> Safety PIN Code
        </h3>
        <p className="text-xs text-secondary mb-4">
          This 4-digit PIN is required to dismiss the safety check-in timer or cancel alerts. Keep it secret!
        </p>

        <form onSubmit={handlePinUpdate} className="flex gap-2 items-end">
          <div className="flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-secondary">4-Digit Security PIN</label>
            <input 
              type="password" 
              maxLength={4}
              value={tempPin}
              onChange={(e) => setTempPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="pin-form-input"
            />
          </div>
          <button type="submit" className="settings-submit-btn">
            Update
          </button>
        </form>

        {pinError && (
          <span className="text-xs text-danger-color font-semibold mt-2 block">{pinError}</span>
        )}
        {pinSuccess && (
          <span className="text-xs text-safe-color font-semibold mt-2 block flex items-center gap-1">
            <Check size={14} /> PIN Updated successfully!
          </span>
        )}
      </div>

      {/* Google Maps API Config */}
      <div className="card">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Settings size={18} color="var(--primary-color)" /> Google Maps API Key
        </h3>
        <p className="text-xs text-secondary mb-4">
          Provide a Google Maps API Key to enable live route navigation. If left blank, the app will run in high-fidelity mock simulation mode.
        </p>

        <form onSubmit={handleApiKeyUpdate} className="flex gap-2 items-end">
          <div className="flex-col gap-1 w-full">
            <label className="text-xs font-semibold text-secondary">API Key</label>
            <input 
              type="password" 
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="pin-form-input"
              style={{ fontFamily: apiKeyInput ? 'monospace' : 'inherit', letterSpacing: apiKeyInput ? '1px' : 'normal' }}
            />
          </div>
          <button type="submit" className="settings-submit-btn">
            Save
          </button>
        </form>
        {keySuccess && (
          <span className="text-xs text-safe-color font-semibold mt-2 block flex items-center gap-1">
            <Check size={14} /> API Key Saved successfully!
          </span>
        )}
      </div>

      {/* Siren Volume controls */}
      <div className="card">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Volume2 size={18} color="var(--primary-color)" /> Siren Audio Volume
        </h3>
        <p className="text-xs text-secondary mb-4">
          Adjust the loudness of the alarm siren when triggered.
        </p>

        <div className="flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-secondary">
            <span>MUTE</span>
            <span style={{ color: 'var(--primary-color)' }}>{Math.round(sirenVolume * 100)}%</span>
            <span>MAX</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={sirenVolume} 
            onChange={handleVolumeChange}
            className="volume-slider"
          />
        </div>
      </div>

      {/* Emergency Feature Toggles */}
      <div className="card">
        <h3 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <ShieldAlert size={18} color="var(--danger-color)" /> Emergency Triggers
        </h3>
        <p className="text-xs text-secondary mb-4">
          Select what actions are automated when SOS or Safety Timer expires.
        </p>

        <div className="flex-col gap-3">
          {/* Toggle item 1 */}
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--surface-border)' }}>
            <div>
              <p className="text-sm font-semibold">Alert Local Police (911)</p>
              <p className="text-xs text-secondary">Automatically queue police call on SOS</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={emergencyToggles.alertPolice} 
                onChange={() => handleToggleChange('alertPolice')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Toggle item 2 */}
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--surface-border)' }}>
            <div>
              <p className="text-sm font-semibold">Share Live Location</p>
              <p className="text-xs text-secondary">Broadcoast live coordinates to trusted contacts</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={emergencyToggles.shareLocation} 
                onChange={() => handleToggleChange('shareLocation')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Toggle item 3 */}
          <div className="flex justify-between items-center py-2 border-b" style={{ borderColor: 'var(--surface-border)' }}>
            <div>
              <p className="text-sm font-semibold">Auto-Record Audio</p>
              <p className="text-xs text-secondary">Discreetly record mic audio in background</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={emergencyToggles.recordAudio} 
                onChange={() => handleToggleChange('recordAudio')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>

          {/* Toggle item 4 */}
          <div className="flex justify-between items-center py-2">
            <div>
              <p className="text-sm font-semibold">Send SOS SMS Alerts</p>
              <p className="text-xs text-secondary">Ping all trusted contacts with alert links</p>
            </div>
            <label className="toggle-switch">
              <input 
                type="checkbox" 
                checked={emergencyToggles.sendSms} 
                onChange={() => handleToggleChange('sendSms')}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone: Reset App */}
      <div className="card" style={{ borderColor: '#fed7d7', backgroundColor: '#fff5f5' }}>
        <h3 className="text-sm font-bold text-danger-color mb-1 flex items-center gap-2">
          Danger Zone
        </h3>
        <p className="text-xs text-secondary mb-3">
          Delete all custom settings, logs, and contacts, and restore the app to factory settings.
        </p>
        <button 
          className="reset-app-btn"
          onClick={() => {
            if (window.confirm("Are you absolutely sure you want to reset all app settings and saved contacts?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          <RefreshCw size={14} style={{ marginRight: '6px' }} /> Reset SafeGuard App
        </button>
      </div>
    </div>
  );
}

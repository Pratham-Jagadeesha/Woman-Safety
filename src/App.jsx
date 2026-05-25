import React, { useState, useEffect, useRef } from 'react';
import { Shield } from 'lucide-react';
import './App.css';
import SOSButton from './components/SOSButton';
import CheckInTimer from './components/CheckInTimer';
import LocationSharing from './components/LocationSharing';
import SafeRoutes from './components/SafeRoutes';
import EmergencyActions from './components/EmergencyActions';
import ContactsAndHelp from './components/ContactsAndHelp';
import BottomNav from './components/BottomNav';
import HistoryTab from './components/HistoryTab';
import SettingsTab from './components/SettingsTab';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSOSActive, setIsSOSActive] = useState(false);

  const [pinCode, setPinCode] = useState(() => localStorage.getItem('safeguard_pin_code') || '1234');
  const [sirenVolume, setSirenVolume] = useState(() => {
    const val = localStorage.getItem('safeguard_siren_volume');
    return val !== null ? parseFloat(val) : 0.8;
  });
  const [emergencyToggles, setEmergencyToggles] = useState(() => {
    const val = localStorage.getItem('safeguard_emergency_toggles');
    return val ? JSON.parse(val) : { alertPolice: true, shareLocation: true, recordAudio: true, sendSms: true };
  });

  const [historyLogs, setHistoryLogs] = useState(() => {
    const val = localStorage.getItem('safeguard_logs');
    if (val) return JSON.parse(val);
    return [
      { id: 1, event: 'Safe check-in confirmed with PIN', time: '10:42 AM', date: 'Today', type: 'success' },
      { id: 2, event: 'Safety timer started for 5 minutes', time: '10:37 AM', date: 'Today', type: 'info' },
      { id: 3, event: 'SOS alert triggered', time: '8:15 PM', date: 'Yesterday', type: 'danger' },
      { id: 4, event: 'Loud alarm activated', time: '3:10 PM', date: 'Yesterday', type: 'warning' },
      { id: 5, event: 'Safe check-in confirmed with PIN', time: '9:02 AM', date: '2 days ago', type: 'success' },
    ];
  });

  const vibrationIntervalRef = useRef(null);

  const handleSetPinCode = (pin) => { setPinCode(pin); localStorage.setItem('safeguard_pin_code', pin); };
  const handleSetSirenVolume = (vol) => { setSirenVolume(vol); localStorage.setItem('safeguard_siren_volume', vol.toString()); };
  const handleSetEmergencyToggles = (t) => { setEmergencyToggles(t); localStorage.setItem('safeguard_emergency_toggles', JSON.stringify(t)); };

  const addLog = (event, type = 'info') => {
    const now = new Date();
    const newLog = {
      id: Date.now(),
      event,
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      type,
    };
    setHistoryLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('safeguard_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearLogs = () => {
    setHistoryLogs([]);
    localStorage.setItem('safeguard_logs', JSON.stringify([]));
  };

  // SOS — vibration only, NO siren (siren lives in EmergencyActions loud alarm)
  useEffect(() => {
    if (isSOSActive) {
      if ('vibrate' in navigator) {
        navigator.vibrate([500, 300, 500, 300, 500]);
        vibrationIntervalRef.current = setInterval(() => {
          navigator.vibrate([500, 300, 500, 300, 500]);
        }, 3000);
      }
    } else {
      clearInterval(vibrationIntervalRef.current);
      if ('vibrate' in navigator) navigator.vibrate(0);
    }
    return () => clearInterval(vibrationIntervalRef.current);
  }, [isSOSActive]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <SOSButton isSOSActive={isSOSActive} setIsSOSActive={setIsSOSActive} addLog={addLog} />
            <CheckInTimer isSOSActive={isSOSActive} setIsSOSActive={setIsSOSActive} pinCode={pinCode} addLog={addLog} />
            <LocationSharing />
            <EmergencyActions sirenVolume={sirenVolume} />
            <SafeRoutes />
          </>
        );
      case 'contacts': return <ContactsAndHelp />;
      case 'history': return <HistoryTab historyLogs={historyLogs} onClearLogs={handleClearLogs} />;
      case 'settings':
        return (
          <SettingsTab
            pinCode={pinCode} setPinCode={handleSetPinCode}
            sirenVolume={sirenVolume} setSirenVolume={handleSetSirenVolume}
            emergencyToggles={emergencyToggles} setEmergencyToggles={handleSetEmergencyToggles}
            addLog={addLog}
          />
        );
      default: return null;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-logo-icon"><Shield size={18} /></div>
        <h1>SafeGuard</h1>
      </header>
      <main className="main-content">{renderTabContent()}</main>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
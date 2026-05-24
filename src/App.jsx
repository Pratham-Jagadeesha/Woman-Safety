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

  // Global settings synced to localStorage
  const [pinCode, setPinCode] = useState(() => {
    return localStorage.getItem('safeguard_pin_code') || '1234';
  });
  const [sirenVolume, setSirenVolume] = useState(() => {
    const val = localStorage.getItem('safeguard_siren_volume');
    return val !== null ? parseFloat(val) : 0.8;
  });
  const [emergencyToggles, setEmergencyToggles] = useState(() => {
    const val = localStorage.getItem('safeguard_emergency_toggles');
    return val ? JSON.parse(val) : {
      alertPolice: true,
      shareLocation: true,
      recordAudio: true,
      sendSms: true
    };
  });

  const [googleMapsApiKey, setGoogleMapsApiKey] = useState(() => {
    return localStorage.getItem('safeguard_google_maps_key') || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  });

  // Dynamic history logs synced to localStorage
  const [historyLogs, setHistoryLogs] = useState(() => {
    const val = localStorage.getItem('safeguard_logs');
    if (val) return JSON.parse(val);
    
    // Default mock history data for the dashboard
    return [
      { id: 1, event: 'Safe Check-In Verified', time: '10:42 AM', date: 'Today', type: 'success' },
      { id: 2, event: 'Safety Timer Started - 5 Mins', time: '10:37 AM', date: 'Today', type: 'info' },
      { id: 3, event: 'SOS Alert Triggered - Decibel Peak', time: '08:15 PM', date: 'Yesterday', type: 'danger' },
      { id: 4, event: 'Fake Call Simulated', time: '03:10 PM', date: 'Yesterday', type: 'warning' },
      { id: 5, event: 'Safe Check-In Verified', time: '09:02 AM', date: '2 days ago', type: 'success' }
    ];
  });

  // Persistent audio and vibration state managers
  const sosAudioRef = useRef(null);
  const vibrationIntervalRef = useRef(null);

  // Sync state updaters
  const handleSetPinCode = (pin) => {
    setPinCode(pin);
    localStorage.setItem('safeguard_pin_code', pin);
  };

  const handleSetSirenVolume = (vol) => {
    setSirenVolume(vol);
    localStorage.setItem('safeguard_siren_volume', vol.toString());
  };

  const handleSetEmergencyToggles = (toggles) => {
    setEmergencyToggles(toggles);
    localStorage.setItem('safeguard_emergency_toggles', JSON.stringify(toggles));
  };

  const handleSetGoogleMapsApiKey = (key) => {
    setGoogleMapsApiKey(key);
    localStorage.setItem('safeguard_google_maps_key', key);
  };

  // Log unified updates helper
  const addLog = (event, type = 'info') => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog = {
      id: Date.now(),
      event,
      time: timeStr,
      date: 'Today',
      type
    };
    setHistoryLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem('safeguard_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearLogs = () => {
    setHistoryLogs([]);
    localStorage.setItem('safeguard_logs', JSON.stringify([]));
  };

  // Manage loop player and navigator vibration intervals safely
  useEffect(() => {
    if (!sosAudioRef.current) {
      sosAudioRef.current = new Audio('/siren.mp3');
      sosAudioRef.current.loop = true;
    }

    if (isSOSActive) {
      sosAudioRef.current.volume = sirenVolume;
      sosAudioRef.current.play().catch((e) => console.log('Audio play blocked by browser:', e));

      if ('vibrate' in navigator) {
        navigator.vibrate([500, 300, 500, 300, 500]);
        vibrationIntervalRef.current = setInterval(() => {
          navigator.vibrate([500, 300, 500, 300, 500]);
        }, 3000);
      }
    } else {
      if (sosAudioRef.current) {
        sosAudioRef.current.pause();
        sosAudioRef.current.currentTime = 0;
      }
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
        vibrationIntervalRef.current = null;
      }
      if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    }

    return () => {
      if (vibrationIntervalRef.current) {
        clearInterval(vibrationIntervalRef.current);
      }
    };
  }, [isSOSActive, sirenVolume]);

  // Render contents according to Active Tab selection
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <SOSButton isSOSActive={isSOSActive} setIsSOSActive={setIsSOSActive} addLog={addLog} />
            <CheckInTimer 
              isSOSActive={isSOSActive} 
              setIsSOSActive={setIsSOSActive} 
              pinCode={pinCode} 
              addLog={addLog} 
            />
            <LocationSharing />
            <EmergencyActions />
            <SafeRoutes googleMapsApiKey={googleMapsApiKey} />
          </>
        );
      case 'contacts':
        return (
          <ContactsAndHelp />
        );
      case 'history':
        return (
          <HistoryTab historyLogs={historyLogs} onClearLogs={handleClearLogs} />
        );
      case 'settings':
        return (
          <SettingsTab 
            pinCode={pinCode} 
            setPinCode={handleSetPinCode} 
            sirenVolume={sirenVolume} 
            setSirenVolume={handleSetSirenVolume} 
            emergencyToggles={emergencyToggles} 
            setEmergencyToggles={handleSetEmergencyToggles}
            googleMapsApiKey={googleMapsApiKey}
            setGoogleMapsApiKey={handleSetGoogleMapsApiKey}
            addLog={addLog}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="flex items-center gap-2">
          <Shield color="var(--primary-color)" size={28} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--primary-color)' }}>SafeGuard</h1>
        </div>
        <div 
          className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm" 
          style={{ backgroundColor: '#edf2f7', color: '#4a5568' }}
        >
          U
        </div>
      </header>

      <main className="main-content">
        {renderTabContent()}
      </main>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;

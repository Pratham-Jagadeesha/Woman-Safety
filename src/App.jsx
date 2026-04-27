import { Shield } from 'lucide-react';
import './App.css';
import SOSButton from './components/SOSButton';
import LocationSharing from './components/LocationSharing';
import SafeRoutes from './components/SafeRoutes';
import EmergencyActions from './components/EmergencyActions';
import ContactsAndHelp from './components/ContactsAndHelp';

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <div className="flex items-center gap-2">
          <Shield color="var(--primary-color)" size={28} />
          <h1 className="text-xl font-bold" style={{ color: 'var(--primary-color)' }}>SafeGuard</h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm" style={{ backgroundColor: '#edf2f7', color: '#4a5568' }}>
          U
        </div>
      </header>

      <main className="main-content">
        <SOSButton />
        <LocationSharing />
        <EmergencyActions />
        <SafeRoutes />
        <ContactsAndHelp />
      </main>
    </div>
  );
}

export default App;

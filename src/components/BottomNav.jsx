import React from 'react';
import { Home, Users, History, Settings } from 'lucide-react';

const TABS = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'contacts', label: 'Contacts', Icon: Users },
  { id: 'history', label: 'History', Icon: History },
  { id: 'settings', label: 'Settings', Icon: Settings },
];

export default function BottomNav({ activeTab, setActiveTab }) {
  return (
    <nav className="bottom-nav">
      {TABS.map(({ id, label, Icon }) => (
        <button key={id} className={`nav-item ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)} aria-label={label}>
          <Icon size={22} />
          <span>{label}</span>
          <div className="nav-dot" />
        </button>
      ))}
    </nav>
  );
}
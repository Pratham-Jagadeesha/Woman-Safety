import React, { useState, useEffect } from 'react';
import { Users, Plus, Trash2, X } from 'lucide-react';

export default function ContactsAndHelp() {
  const [contacts, setContacts] = useState([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [emergencyNums, setEmergencyNums] = useState(() => {
    const saved = localStorage.getItem('safeguard_emergency_numbers');
    return saved ? JSON.parse(saved) : { police: '100', helpline: '1091' };
  });

  // Re-read emergency numbers whenever the tab is rendered (in case they were changed in Settings)
  useEffect(() => {
    const saved = localStorage.getItem('safeguard_emergency_numbers');
    if (saved) setEmergencyNums(JSON.parse(saved));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('safeguard_contacts');
    setContacts(
      saved
        ? JSON.parse(saved)
        : [
            { id: 1, name: 'Mom', phone: '+91 98765 43210' },
            { id: 2, name: 'Brother', phone: '+91 87654 32109' },
          ]
    );
  }, []);

  const persist = (list) => {
    setContacts(list);
    localStorage.setItem('safeguard_contacts', JSON.stringify(list));
  };

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return;
    persist([...contacts, { id: Date.now(), name: name.trim(), phone: phone.trim() }]);
    setName('');
    setPhone('');
    setAdding(false);
  };

  const del = (id) => persist(contacts.filter(c => c.id !== id));

  return (
    <>
      {/* Trusted contacts */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-icon ci-green"><Users size={16} /></div>
            Trusted contacts
          </div>
          <button
            onClick={() => setAdding(v => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--primary-color)', fontWeight: 500 }}
          >
            {adding ? <><X size={15} /> Cancel</> : <><Plus size={15} /> Add</>}
          </button>
        </div>

        {adding && (
          <div style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '0.5px solid var(--surface-border)' }}>
            <div className="section-label">New contact</div>
            <input
              className="contact-form-input"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <input
              className="contact-form-input"
              placeholder="Phone number"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setAdding(false)}>Cancel</button>
              <button className="primary-btn" style={{ flex: 2 }} onClick={addContact}>Save</button>
            </div>
          </div>
        )}

        {contacts.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', padding: '16px 0' }}>
            No contacts yet.
          </p>
        ) : (
          contacts.map(c => (
            <div className="contact-item" key={c.id}>
              <div className="contact-avatar">{c.name[0].toUpperCase()}</div>
              <div>
                <div className="contact-name">{c.name}</div>
                <div className="contact-phone">{c.phone}</div>
              </div>
              <button className="contact-delete" onClick={() => del(c.id)}>
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Emergency helplines — numbers come from Settings */}
      <div className="card">
        <div className="emergency-row">
          <div>
            <div className="emergency-label">Police emergency</div>
            <div className="emergency-sub">{emergencyNums.police} — direct emergency line</div>
          </div>
          <a href={`tel:${emergencyNums.police}`} className="call-now-btn">Call now</a>
        </div>

        <div
          className="emergency-row"
          style={{ background: '#fff7ed', borderColor: '#fed7aa', marginTop: 8 }}
        >
          <div>
            <div className="emergency-label" style={{ color: '#92400e' }}>Women's helpline</div>
            <div className="emergency-sub" style={{ color: '#b45309' }}>
              {emergencyNums.helpline} — national helpline
            </div>
          </div>
          <a href={`tel:${emergencyNums.helpline}`} className="call-now-btn" style={{ background: '#d97706' }}>
            Call
          </a>
        </div>
      </div>
    </>
  );
}
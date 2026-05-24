import React, { useState, useEffect } from 'react';
import { Users, Phone, Plus, Trash2, X } from 'lucide-react';

export default function ContactsAndHelp() {
  const [contacts, setContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [error, setError] = useState('');

  // Load contacts on mount
  useEffect(() => {
    const saved = localStorage.getItem('safeguard_contacts');
    if (saved) {
      setContacts(JSON.parse(saved));
    } else {
      const defaultContacts = [
        { id: 1, name: 'Mom', phone: '+1 234 567 8900', initial: 'M' },
        { id: 2, name: 'Brother', phone: '+1 098 765 4321', initial: 'B' },
      ];
      setContacts(defaultContacts);
      localStorage.setItem('safeguard_contacts', JSON.stringify(defaultContacts));
    }
  }, []);

  const saveContacts = (updatedList) => {
    setContacts(updatedList);
    localStorage.setItem('safeguard_contacts', JSON.stringify(updatedList));
  };

  const handleAddContact = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      setError('Please fill in both name and phone number.');
      return;
    }

    const newContact = {
      id: Date.now(),
      name: newName.trim(),
      phone: newPhone.trim(),
      initial: newName.trim().charAt(0).toUpperCase() || '?'
    };

    const updated = [...contacts, newContact];
    saveContacts(updated);
    
    // Reset Form
    setNewName('');
    setNewPhone('');
    setIsAdding(false);
    setError('');
  };

  const handleDeleteContact = (id) => {
    const updated = contacts.filter(c => c.id !== id);
    saveContacts(updated);
  };

  return (
    <div className="card contacts-tab-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="icon-btn" style={{ backgroundColor: '#c6f6d5', color: '#38a169', width: '32px', height: '32px', padding: '0' }}>
              <Users size={16} />
            </div>
            <h2 className="text-lg font-bold">Trusted Contacts</h2>
          </div>
          {!isAdding ? (
            <button 
              className="add-contact-trigger flex items-center gap-1 text-sm font-semibold" 
              style={{ color: 'var(--primary-color)' }}
              onClick={() => { setIsAdding(true); setError(''); }}
            >
              <Plus size={16} /> Add
            </button>
          ) : (
            <button 
              className="text-sm font-semibold flex items-center gap-1" 
              style={{ color: 'var(--text-secondary)' }}
              onClick={() => setIsAdding(false)}
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleAddContact} className="p-4 bg-gray-50 border-b flex-col gap-3" style={{ backgroundColor: '#f7fafc', borderColor: 'var(--surface-border)' }}>
          <h3 className="text-xs font-bold text-secondary mb-1">ADD NEW TRUSTED CONTACT</h3>
          
          <div className="flex-col gap-1">
            <label className="text-xs font-semibold text-secondary">Full Name</label>
            <input 
              type="text" 
              value={newName} 
              onChange={(e) => setNewName(e.target.value)} 
              placeholder="e.g. Dad, Sister, Friend" 
              className="contact-form-input"
            />
          </div>

          <div className="flex-col gap-1 mt-2">
            <label className="text-xs font-semibold text-secondary">Phone Number</label>
            <input 
              type="tel" 
              value={newPhone} 
              onChange={(e) => setNewPhone(e.target.value)} 
              placeholder="e.g. +1 555-0199" 
              className="contact-form-input"
            />
          </div>

          {error && (
            <span className="text-xs text-danger-color font-semibold mt-1 block">{error}</span>
          )}

          <button type="submit" className="contact-submit-btn mt-2">
            Save Contact
          </button>
        </form>
      )}

      <div className="flex-col contacts-list-container">
        {contacts.length === 0 ? (
          <div className="p-8 text-center text-secondary text-sm">
            No trusted contacts added yet. Add contacts to notify them in case of emergency.
          </div>
        ) : (
          contacts.map(contact => (
            <div key={contact.id} className="contact-item flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="contact-avatar">{contact.initial}</div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{contact.name}</p>
                  <p className="text-xs text-secondary">{contact.phone}</p>
                </div>
              </div>
              <button 
                className="delete-contact-btn p-1 text-secondary hover:text-danger"
                onClick={() => handleDeleteContact(contact.id)}
                title="Remove Contact"
                style={{ color: '#a0aec0' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t" style={{ backgroundColor: '#f7fafc', borderColor: 'var(--surface-border)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-danger-color">
            <Phone size={18} color="#e53e3e" />
            <div className="flex-col">
              <span className="font-bold text-sm" style={{ color: '#e53e3e', lineHeight: '1' }}>Nearby Police: 911</span>
              <span className="text-secondary" style={{ fontSize: '0.65rem' }}>Direct official help hotline</span>
            </div>
          </div>
          <a href="tel:911" className="px-4 py-1.5 rounded-full text-xs font-bold text-white text-center" style={{ backgroundColor: '#e53e3e', textDecoration: 'none' }}>
            Call Now
          </a>
        </div>
      </div>
    </div>
  );
}

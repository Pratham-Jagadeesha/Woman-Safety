import { Users, Phone } from 'lucide-react';

export default function ContactsAndHelp() {
  const mockContacts = [
    { id: 1, name: 'Mom', phone: '+1 234 567 8900', initial: 'M' },
    { id: 2, name: 'Brother', phone: '+1 098 765 4321', initial: 'B' },
  ];

  return (
    <div className="card" style={{ padding: '0' }}>
      <div className="p-4 border-b" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="icon-btn" style={{ backgroundColor: '#c6f6d5', color: '#38a169', width: '32px', height: '32px', padding: '0' }}>
              <Users size={16} />
            </div>
            <h2 className="text-lg font-bold">Trusted Contacts</h2>
          </div>
          <button className="text-sm font-medium" style={{ color: 'var(--primary-color)' }}>
            + Add
          </button>
        </div>
      </div>

      <div className="flex-col">
        {mockContacts.map(contact => (
          <div key={contact.id} className="contact-item">
            <div className="flex items-center gap-3">
              <div className="contact-avatar">{contact.initial}</div>
              <div>
                <p className="font-medium text-sm">{contact.name}</p>
                <p className="text-xs text-secondary">{contact.phone}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-gray-50 border-t" style={{ backgroundColor: '#f7fafc', borderColor: 'var(--surface-border)', borderBottomLeftRadius: 'var(--radius-lg)', borderBottomRightRadius: 'var(--radius-lg)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-danger-color">
            <Phone size={18} color="#e53e3e" />
            <span className="font-bold text-sm" style={{ color: '#e53e3e' }}>Nearby Police: 911</span>
          </div>
          <button className="px-3 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#e53e3e' }}>
            Call Now
          </button>
        </div>
      </div>
    </div>
  );
}

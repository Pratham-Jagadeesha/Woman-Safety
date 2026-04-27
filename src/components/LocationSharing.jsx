import { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function LocationSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    // For demo purposes, mock a location after a short delay if sharing is enabled
    if (isSharing) {
      const timer = setTimeout(() => {
        setLocation({ lat: "40.7128° N", lng: "74.0060° W" }); // Mock coordinates (NYC)
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setLocation(null);
    }
  }, [isSharing]);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-btn" style={{ backgroundColor: '#ebf8ff', color: '#4299e1' }}>
            <MapPin size={20} />
          </div>
          <h2 className="text-lg font-bold">Live Location</h2>
        </div>
        <button 
          className="flex items-center gap-2 text-sm font-medium"
          style={{ color: isSharing ? 'var(--danger-color)' : 'var(--primary-color)' }}
          onClick={() => setIsSharing(!isSharing)}
        >
          {isSharing ? 'Stop Sharing' : 'Start Sharing'}
        </button>
      </div>
      
      {isSharing ? (
        <div className="flex-col gap-2 mt-4 p-3 bg-blue-50 rounded-lg" style={{ backgroundColor: '#ebf8ff', borderRadius: '0.5rem' }}>
          <div className="flex items-center gap-2 text-primary">
            <Navigation size={16} className="animate-pulse" />
            <span className="text-sm font-medium">Sharing with 3 trusted contacts</span>
          </div>
          {location && (
            <p className="text-xs text-secondary mt-1 ml-6">
              Lat: {location.lat}, Lng: {location.lng}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-secondary">
          Location sharing is currently off. Turn it on to share your live location with your emergency contacts.
        </p>
      )}
    </div>
  );
}

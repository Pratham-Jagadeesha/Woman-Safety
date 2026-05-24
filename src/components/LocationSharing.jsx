import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation } from 'lucide-react';

export default function LocationSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState(null);
  const watchRef = useRef(null);

  useEffect(() => {
    if (isSharing) {
      if (navigator.geolocation) {
        watchRef.current = navigator.geolocation.watchPosition(
          pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => setLocation({ lat: 12.9716, lng: 77.5946, mock: true }),
          { enableHighAccuracy: true }
        );
      } else {
        setLocation({ lat: 12.9716, lng: 77.5946, mock: true });
      }
    } else {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
      setLocation(null);
    }
    return () => { if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current); };
  }, [isSharing]);

  const fmtLat = (v) => `${Math.abs(v).toFixed(6)}° ${v >= 0 ? 'N' : 'S'}`;
  const fmtLng = (v) => `${Math.abs(v).toFixed(6)}° ${v >= 0 ? 'E' : 'W'}`;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon ci-blue"><MapPin size={16} /></div>
          Live location
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={isSharing} onChange={e => setIsSharing(e.target.checked)} />
          <div className="toggle-track" />
          <div className="toggle-thumb" />
        </label>
      </div>

      {!isSharing && (
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Location sharing is off. Enable to share with your contacts.
        </p>
      )}

      {isSharing && location && (
        <>
          <div className="loc-coords">
            Lat <span>{fmtLat(location.lat)}</span> &nbsp; Lng <span>{fmtLng(location.lng)}</span>
            {location.mock && <span style={{ color: 'var(--danger-color)', fontSize: 11, marginLeft: 8 }}>(mock)</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
            <Navigation size={14} color="var(--primary-color)" />
            Sharing with 3 trusted contacts
          </div>
        </>
      )}
    </div>
  );
}
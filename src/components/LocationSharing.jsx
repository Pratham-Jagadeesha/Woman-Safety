import { useState, useEffect } from 'react';
import { MapPin, Navigation, Compass, AlertTriangle, History } from 'lucide-react';

export default function LocationSharing() {
  const [isSharing, setIsSharing] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let watchId = null;

    if (isSharing) {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        const mockLoc = {
          lat: 40.7128,
          lng: -74.0060,
          accuracy: 15,
          isMock: true,
          timestamp: new Date().toLocaleTimeString()
        };
        setLocation(mockLoc);
        setHistory(prev => [mockLoc, ...prev].slice(0, 3));
      } else {
        watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLoc = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: Math.round(position.coords.accuracy),
              isMock: false,
              timestamp: new Date().toLocaleTimeString()
            };
            setLocation(newLoc);
            setError(null);
            setHistory(prev => [newLoc, ...prev].slice(0, 3));
          },
          (err) => {
            console.error("Geolocation error:", err);
            let errMsg = "SafeGuard cannot access your live location.";
            if (err.code === 1) {
              errMsg = "GPS Permission Denied. SafeGuard cannot access your live location.";
            } else if (err.code === 2) {
              errMsg = "Location unavailable. Please check your network and GPS connection.";
            } else if (err.code === 3) {
              errMsg = "Location request timed out.";
            }
            setError(errMsg);

            const mockLoc = {
              lat: 40.7128,
              lng: -74.0060,
              accuracy: 15,
              isMock: true,
              timestamp: new Date().toLocaleTimeString()
            };
            setLocation(mockLoc);
            setHistory(prev => [mockLoc, ...prev].slice(0, 3));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      }
    } else {
      setLocation(null);
      setError(null);
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [isSharing]);

  const formatLat = (lat) => {
    const dir = lat >= 0 ? 'N' : 'S';
    return `${Math.abs(lat).toFixed(6)}° ${dir}`;
  };

  const formatLng = (lng) => {
    const dir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lng).toFixed(6)}° ${dir}`;
  };

  return (
    <div className="card">
      <style>{`
        @keyframes rotateCompass {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(12deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-12deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes pulseGreen {
          0% { transform: scale(0.95); opacity: 0.6; box-shadow: 0 0 0 0 rgba(72, 187, 120, 0.7); }
          50% { transform: scale(1.1); opacity: 1; box-shadow: 0 0 0 6px rgba(72, 187, 120, 0); }
          100% { transform: scale(0.95); opacity: 0.6; box-shadow: 0 0 0 0 rgba(72, 187, 120, 0); }
        }
        .rotating-compass {
          animation: rotateCompass 5s ease-in-out infinite;
        }
        .pulsing-green-dot {
          width: 8px;
          height: 8px;
          background-color: var(--safe-color);
          border-radius: 50%;
          display: inline-block;
          animation: pulseGreen 2s infinite;
        }
        .warning-box {
          background-color: #fffaf0;
          border: 1px solid #feebc8;
          border-radius: var(--radius-md);
          padding: 0.75rem;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          color: #c05621;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-size: 0.8rem;
        }
        .location-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .location-data-card {
          background-color: var(--bg-color);
          border: 1px solid var(--surface-border);
          border-radius: var(--radius-md);
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
        }
        .location-label {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .location-value {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          font-family: monospace;
        }
        .history-panel {
          margin-top: 1.25rem;
          border-top: 1px dashed var(--surface-border);
          padding-top: 1rem;
        }
        .history-title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.5rem;
        }
        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }
        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.75rem;
          padding: 0.4rem 0.6rem;
          background-color: var(--bg-color);
          border-radius: 4px;
          border-left: 3px solid var(--primary-color);
        }
        .history-item.mock-item {
          border-left-color: var(--danger-color);
          background-color: #fff5f5;
        }
        .history-item-coords {
          font-family: monospace;
          color: var(--text-primary);
        }
        .history-item-meta {
          color: var(--text-secondary);
          font-size: 0.7rem;
        }
      `}</style>

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-btn" style={{ backgroundColor: '#ebf8ff', color: '#4299e1' }}>
            <MapPin size={20} />
          </div>
          <h2 className="text-lg font-bold">Live Location</h2>
        </div>
        <button 
          className="flex items-center gap-2 text-sm font-medium"
          style={{ 
            color: isSharing ? 'var(--danger-color)' : 'var(--primary-color)',
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isSharing ? '#fff5f5' : 'var(--primary-light)'
          }}
          onClick={() => setIsSharing(!isSharing)}
        >
          {isSharing ? 'Stop Sharing' : 'Start Sharing'}
        </button>
      </div>

      {isSharing ? (
        <div className="flex flex-col gap-3">
          {/* Active status indicator */}
          <div className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: '#f0fff4', border: '1px solid #c6f6d5' }}>
            <div className="flex items-center gap-2">
              <span className="pulsing-green-dot"></span>
              <span className="text-sm font-bold" style={{ color: 'var(--safe-color)' }}>
                {location?.isMock ? 'Live GPS Tracking Active' : 'Live GPS Tracking Active'}
              </span>
            </div>
            {/* Visual map-icon compass that rotates slightly */}
            <Compass size={18} className="rotating-compass" style={{ color: 'var(--safe-color)' }} />
          </div>

          {/* Friendly warning box if permission is denied / unavailable */}
          {error && (
            <div className="warning-box">
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <span className="font-bold" style={{ display: 'block', marginBottom: '2px' }}>GPS Signal Unavailable</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Coordinate details */}
          {location && (
            <div>
              <div className="location-info-grid">
                <div className="location-data-card">
                  <span className="location-label">Latitude</span>
                  <span className="location-value">{formatLat(location.lat)}</span>
                </div>
                <div className="location-data-card">
                  <span className="location-label">Longitude</span>
                  <span className="location-value">{formatLng(location.lng)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 px-1">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  Accuracy: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>± {location.accuracy} meters</span>
                </span>
                {location.isMock && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--danger-color)', fontWeight: 'bold' }}>
                    (Mock coordinates - GPS Permission Denied)
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg" style={{ backgroundColor: '#ebf8ff', borderRadius: '0.5rem' }}>
            <Navigation size={16} className="animate-pulse" style={{ color: 'var(--primary-color)' }} />
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Sharing live tracking with 3 trusted contacts</span>
          </div>

          {/* Premium Logs Panel */}
          {history.length > 0 && (
            <div className="history-panel">
              <h3 className="history-title">
                <History size={14} />
                <span>Live Tracking Logs (Last 3 updates)</span>
              </h3>
              <div className="history-list">
                {history.map((log, idx) => (
                  <div key={idx} className={`history-item ${log.isMock ? 'mock-item' : ''}`}>
                    <div className="flex flex-col">
                      <span className="history-item-coords">
                        {log.lat.toFixed(4)}°, {log.lng.toFixed(4)}°
                      </span>
                      {log.isMock && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--danger-color)', fontWeight: '500' }}>
                          Mock Coordinates
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="history-item-meta">±{log.accuracy}m</span>
                      <span className="history-item-meta">{log.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-secondary">
            Location sharing is currently off. Turn it on to share your live location with your emergency contacts.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#f7fafc', border: '1px solid var(--surface-border)' }}>
            <Compass size={18} style={{ color: 'var(--text-secondary)' }} />
            <span className="text-xs text-secondary">GPS system ready. Inactive.</span>
          </div>
        </div>
      )}
    </div>
  );
}


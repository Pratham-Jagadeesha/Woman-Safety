import React from 'react';
import { Map } from 'lucide-react';

export default function SafeRoutes() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon ci-purple"><Map size={16} /></div>
          Safe routes
        </div>
      </div>
      <svg className="map-svg-container" viewBox="0 0 340 160" xmlns="http://www.w3.org/2000/svg">
        <rect width="340" height="160" fill="var(--bg-color)" rx="10" />
        <line x1="0" y1="40" x2="340" y2="40" stroke="var(--surface-border)" strokeWidth="0.5" />
        <line x1="0" y1="80" x2="340" y2="80" stroke="var(--surface-border)" strokeWidth="0.5" />
        <line x1="0" y1="120" x2="340" y2="120" stroke="var(--surface-border)" strokeWidth="0.5" />
        <line x1="80" y1="0" x2="80" y2="160" stroke="var(--surface-border)" strokeWidth="0.5" />
        <line x1="170" y1="0" x2="170" y2="160" stroke="var(--surface-border)" strokeWidth="0.5" />
        <line x1="260" y1="0" x2="260" y2="160" stroke="var(--surface-border)" strokeWidth="0.5" />
        <path d="M30 130 Q60 80 120 70 Q180 60 220 50 Q260 40 300 30" stroke="#3b6fd4" strokeWidth="3" strokeLinecap="round" fill="none" strokeDasharray="6 4" />
        <circle cx="30" cy="130" r="7" fill="#3b6fd4" />
        <circle cx="300" cy="30" r="7" fill="#3b6fd4" />
        <circle cx="100" cy="110" r="6" fill="#ef4444" opacity="0.6" />
        <circle cx="190" cy="80" r="6" fill="#16a34a" opacity="0.7" />
        <circle cx="240" cy="55" r="6" fill="#16a34a" opacity="0.7" />
        <text x="30" y="148" fontSize="9" fill="#3b6fd4" textAnchor="middle">Start</text>
        <text x="300" y="22" fontSize="9" fill="#3b6fd4" textAnchor="middle">End</text>
        <text x="100" y="125" fontSize="8" fill="#ef4444" textAnchor="middle">Avoid</text>
        <text x="190" y="73" fontSize="8" fill="#16a34a" textAnchor="middle">Safe</text>
      </svg>
      <div className="map-legend">
        <div className="legend-item"><div className="legend-dot" style={{ background: '#16a34a' }} />Safe haven</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#ef4444' }} />Avoid zone</div>
        <div className="legend-item"><div className="legend-dot" style={{ background: '#3b6fd4' }} />Your route</div>
      </div>
    </div>
  );
}
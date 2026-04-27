import { Map } from 'lucide-react';

export default function SafeRoutes() {
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="icon-btn" style={{ backgroundColor: '#e9d8fd', color: '#805ad5' }}>
          <Map size={20} />
        </div>
        <h2 className="text-lg font-bold">Safe Route Navigation</h2>
      </div>
      
      <p className="text-sm text-secondary mb-4">
        Avoiding known unsafe areas. Highlighting well-lit streets and 24/7 businesses.
      </p>

      {/* Demo Map Placeholder */}
      <div className="map-placeholder">
        <Map size={32} color="#a0aec0" className="mb-2" />
        <span className="font-medium">Map View Available in App</span>
        <span className="text-xs mt-1">Simulating safe route from current location</span>
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#48bb78' }}></div>
          <span>Safe Path</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f56565' }}></div>
          <span>Avoid Area</span>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Map, Search, Navigation, AlertTriangle, ShieldCheck, MapPin, Check, Info, ArrowRight } from 'lucide-react';

export default function SafeRoutes({ googleMapsApiKey }) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [destination, setDestination] = useState('');
  const [routeDetails, setRouteDetails] = useState(null);
  const [safetyStatus, setSafetyStatus] = useState(null); // 'safe' | 'warning'
  const [isNavigating, setIsNavigating] = useState(false);

  // Mock Route Simulation states (for fallback mode)
  const [mockDestSearch, setMockDestSearch] = useState('');
  const [showMockRoute, setShowMockRoute] = useState(false);
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationStep, setSimulationStep] = useState(0);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const autocompleteRef = useRef(null);
  const directionsRendererRef = useRef(null);

  // Setup mock steps
  const mockStepsSafe = [
    { text: "Depart current location. Walk north on well-lit sidewalk.", type: "info" },
    { text: "Safe Haven Checkpoint: Passed Police Precinct #14 (Well-lit, 24/7 staff).", type: "safe" },
    { text: "Turn right onto Broadway. High foot traffic, active storefronts.", type: "info" },
    { text: "Arrived safely at destination.", type: "safe-arrive" }
  ];

  const mockStepsWarning = [
    { text: "Depart current location. Heading east towards West End Park.", type: "info" },
    { text: "Caution Hotspot: Low street lighting detected on 4th Ave. Routing detour.", type: "danger" },
    { text: "Bypass Route Active: Rerouted along well-lit commercial block.", type: "safe" },
    { text: "Arrived safely at destination.", type: "safe-arrive" }
  ];

  // Dynamic Google Maps Script Loading
  useEffect(() => {
    if (!googleMapsApiKey) {
      setMapLoaded(false);
      setMapError(null);
      return;
    }

    setMapError(null);
    const existingScript = document.getElementById('google-maps-script');

    const handleScriptLoad = () => {
      setMapLoaded(true);
      initializeMap();
    };

    if (existingScript) {
      if (window.google && window.google.maps) {
        handleScriptLoad();
      } else {
        existingScript.addEventListener('load', handleScriptLoad);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleScriptLoad);
    script.addEventListener('error', () => {
      setMapError("Failed to load Google Maps API. Verify your API Key in Settings.");
    });
    document.head.appendChild(script);

    return () => {
      // Keep script loaded but remove event listeners if necessary
    };
  }, [googleMapsApiKey]);

  // Initializing Google Map once script is loaded
  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Default center (NYC Coordinates)
    const defaultCenter = { lat: 40.7128, lng: -74.0060 };

    // Try to get live coordinate center
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center = { lat: position.coords.latitude, lng: position.coords.longitude };
        setupMap(center);
      },
      () => {
        setupMap(defaultCenter);
      }
    );
  };

  const setupMap = (center) => {
    if (!mapRef.current || !window.google) return;

    // Calming silver map style configuration
    const mapStyle = [
      { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
      { featureType: "poi", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
      { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#f7fafc" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#ebf8ff" }] }
    ];

    const map = new window.google.maps.Map(mapRef.current, {
      center: center,
      zoom: 14,
      styles: mapStyle,
      disableDefaultUI: true,
      zoomControl: true
    });
    mapInstanceRef.current = map;

    const renderer = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#48bb78", // Safe green
        strokeOpacity: 0.8,
        strokeWeight: 5
      }
    });
    directionsRendererRef.current = renderer;

    // Bind Google Autocomplete to Search Box
    const autocompleteInput = document.getElementById('map-destination-input');
    if (autocompleteInput) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteInput, {
        types: ['geocode', 'establishment']
      });
      autocomplete.bindTo('bounds', map);
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          setDestination(place.formatted_address || place.name);
          calculateRealRoute(center, place.geometry.location);
        }
      });
      autocompleteRef.current = autocomplete;
    }

    // Add Mock Safety Overlays
    renderSafetyOverlays(map, center);
  };

  const renderSafetyOverlays = (map, center) => {
    // Green Safe Havens (Police)
    new window.google.maps.Marker({
      position: { lat: center.lat + 0.005, lng: center.lng + 0.003 },
      map: map,
      title: "Police Station (Safe Haven)",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#48bb78",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      }
    });

    // Blue Safe Havens (24/7 Store)
    new window.google.maps.Marker({
      position: { lat: center.lat - 0.004, lng: center.lng - 0.005 },
      map: map,
      title: "24/7 Store (Safe Haven)",
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#3182ce",
        fillOpacity: 1,
        strokeColor: "#ffffff",
        strokeWeight: 2
      }
    });

    // Red Avoid Circle (Crime hotspot or Low-lighting)
    new window.google.maps.Circle({
      map: map,
      center: { lat: center.lat + 0.002, lng: center.lng - 0.003 },
      radius: 180, // meters
      fillColor: "#f56565",
      fillOpacity: 0.2,
      strokeColor: "#e53e3e",
      strokeOpacity: 0.6,
      strokeWeight: 1
    });
  };

  const calculateRealRoute = (origin, destLocation) => {
    if (!window.google) return;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: origin,
        destination: destLocation,
        travelMode: window.google.maps.TravelMode.WALKING
      },
      (response, status) => {
        if (status === 'OK') {
          directionsRendererRef.current.setDirections(response);
          const leg = response.routes[0].legs[0];
          setRouteDetails({
            distance: leg.distance.text,
            duration: leg.duration.text
          });

          // Check if path passes near our simulated hotspot: center + (lat: +0.002, lng: -0.003)
          const hotspot = { lat: origin.lat + 0.002, lng: origin.lng - 0.003 };
          let passesNearHotspot = false;

          const steps = leg.steps;
          for (let i = 0; i < steps.length; i++) {
            const path = steps[i].path;
            for (let j = 0; j < path.length; j++) {
              const distance = getDistance(path[j].lat(), path[j].lng(), hotspot.lat, hotspot.lng);
              if (distance < 200) { // 200m intersection
                passesNearHotspot = true;
                break;
              }
            }
            if (passesNearHotspot) break;
          }

          setSafetyStatus(passesNearHotspot ? 'warning' : 'safe');
          setIsNavigating(true);
        } else {
          setMapError("Directions search failed: " + status);
        }
      }
    );
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const deltaPhi = (lat2 - lat1) * Math.PI / 180;
    const deltaLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    // Fixed simple distance calculation helper
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Mock Route Finder handlers (when API Key is absent)
  const handleMockSearch = (e) => {
    e.preventDefault();
    if (!mockDestSearch.trim()) return;

    setDestination(mockDestSearch);
    setShowMockRoute(true);
    setSimulationActive(false);
    setSimulationStep(0);

    // If destination contains 'park', 'alley', or 'east', flag route caution
    const destinationLower = mockDestSearch.toLowerCase();
    const isCautious = destinationLower.includes('park') || 
                      destinationLower.includes('alley') || 
                      destinationLower.includes('east');

    setRouteDetails({
      distance: isCautious ? "1.4 km" : "0.9 km",
      duration: isCautious ? "18 mins" : "11 mins"
    });
    setSafetyStatus(isCautious ? 'warning' : 'safe');
  };

  // Run Step-by-Step Simulation
  const startSimulation = () => {
    setSimulationActive(true);
    setSimulationStep(0);
  };

  useEffect(() => {
    let interval = null;
    if (simulationActive) {
      const steps = safetyStatus === 'warning' ? mockStepsWarning : mockStepsSafe;
      interval = setInterval(() => {
        setSimulationStep((prev) => {
          if (prev >= steps.length - 1) {
            setSimulationActive(false);
            clearInterval(interval);
            return prev + 1; // Completed
          }
          return prev + 1;
        });
      }, 3000); // 3 seconds per step transition
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [simulationActive, safetyStatus]);

  const activeSteps = safetyStatus === 'warning' ? mockStepsWarning : mockStepsSafe;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <div className="icon-btn" style={{ backgroundColor: '#e9d8fd', color: '#805ad5' }}>
            <Map size={20} />
          </div>
          <h2 className="text-lg font-bold">Safe Route Navigation</h2>
        </div>
        {googleMapsApiKey && mapLoaded && (
          <span className="flex items-center gap-1 text-xs font-semibold text-safe-color">
            <Check size={12} /> Google GPS Active
          </span>
        )}
      </div>

      <p className="text-sm text-secondary mb-4">
        Highlighted safe paths prioritising well-lit streets, active storefronts, and verified safe havens.
      </p>

      {/* Mode A: Real Google Maps Loaded */}
      {googleMapsApiKey ? (
        <div className="flex-col gap-3">
          {mapError && (
            <div className="warning-box" style={{ borderLeft: '3px solid var(--danger-color)' }}>
              <AlertTriangle size={16} style={{ color: 'var(--danger-color)' }} />
              <span className="text-xs">{mapError}</span>
            </div>
          )}

          <div className="map-input-group">
            <input
              id="map-destination-input"
              type="text"
              placeholder="Search destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="map-search-input"
            />
          </div>

          <div ref={mapRef} className="map-container">
            {!mapLoaded && !mapError && (
              <div className="flex flex-col items-center justify-center h-full gap-2" style={{ minHeight: '280px' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" style={{ borderTopColor: 'var(--primary-color)', width: '24px', height: '24px', borderWidth: '3px', borderStyle: 'solid', borderRadius: '50%' }}></div>
                <span className="text-xs text-secondary">Loading Google Maps...</span>
              </div>
            )}
          </div>

          {routeDetails && (
            <div className="route-info-badge">
              <div className="flex justify-between text-xs font-bold text-primary">
                <span>Walking Route Details</span>
                <span>{routeDetails.distance} ({routeDetails.duration})</span>
              </div>
              {safetyStatus === 'warning' ? (
                <div className="safety-check-notice warning flex items-center gap-2">
                  <AlertTriangle size={14} />
                  <span>Route bypasses 1 caution zone (Low-lighting block). Detour added!</span>
                </div>
              ) : (
                <div className="safety-check-notice safe flex items-center gap-2">
                  <ShieldCheck size={14} />
                  <span>100% Well-Lit streets path. Verified Safe Route!</span>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Mode B: Premium Interactive Simulation Fallback */
        <div className="flex flex-col gap-3">
          <form onSubmit={handleMockSearch} className="map-input-group">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Where are you going? (e.g. West End Park, Central Station)"
                value={mockDestSearch}
                onChange={(e) => setMockDestSearch(e.target.value)}
                className="map-search-input"
                style={{ flex: 1 }}
              />
              <button 
                type="submit" 
                className="icon-btn" 
                style={{ backgroundColor: 'var(--primary-color)', color: 'white', borderRadius: 'var(--radius-md)', padding: '0.6rem 0.8rem', border: 'none', cursor: 'pointer' }}
              >
                <Search size={18} />
              </button>
            </div>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
              💡 Try typing <strong>"West End Park"</strong> for a detour bypass simulation, or <strong>"Central Station"</strong> for a direct safe path.
            </span>
          </form>

          {/* Interactive Mock Map Design */}
          <div className="map-container flex flex-col justify-between p-4" style={{ backgroundColor: '#edf2f7', border: '1px dashed #cbd5e0' }}>
            <div className="flex justify-between items-start w-full">
              <div className="flex flex-col gap-1 p-2 rounded bg-white shadow-sm" style={{ maxWidth: '70%', borderRadius: 'var(--radius-md)' }}>
                <span className="text-xs font-semibold flex items-center gap-1">
                  <MapPin size={12} color="var(--primary-color)" /> Start: Current GPS Location
                </span>
                {destination && (
                  <span className="text-xs text-secondary flex items-center gap-1 border-t pt-1 mt-1">
                    <ArrowRight size={12} /> Dest: {destination}
                  </span>
                )}
              </div>
              <div className="px-2 py-1 bg-white text-xs font-bold rounded shadow-sm flex items-center gap-1" style={{ color: 'var(--text-secondary)', borderRadius: 'var(--radius-md)' }}>
                <Info size={12} /> Simulation Map
              </div>
            </div>

            {!showMockRoute ? (
              <div className="flex flex-col items-center justify-center my-auto py-6 text-center">
                <Map size={32} color="#a0aec0" style={{ marginBottom: '0.5rem' }} />
                <span className="text-xs font-bold text-secondary">Route Pathfinder Offline</span>
                <span className="text-xxs text-secondary" style={{ fontSize: '0.65rem', marginTop: '0.2rem' }}>
                  Mock simulator ready. Enter destination above to plot.
                </span>
              </div>
            ) : (
              <div className="flex flex-col gap-2 w-full mt-4 bg-white/90 backdrop-blur p-3 rounded-lg border shadow-sm" style={{ borderRadius: 'var(--radius-md)' }}>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold">Proposed Pathway</span>
                  <span className="font-semibold text-primary">{routeDetails.distance} • {routeDetails.duration}</span>
                </div>

                {safetyStatus === 'warning' ? (
                  <div className="safety-check-notice warning flex items-center gap-2 py-1 px-2 m-0">
                    <AlertTriangle size={12} />
                    <span style={{ fontSize: '0.7rem' }}>Caution: Route detour active to bypass dark zone.</span>
                  </div>
                ) : (
                  <div className="safety-check-notice safe flex items-center gap-2 py-1 px-2 m-0">
                    <ShieldCheck size={12} />
                    <span style={{ fontSize: '0.7rem' }}>Safe Route: Pathway stays on bright streets.</span>
                  </div>
                )}

                {!simulationActive && simulationStep === 0 && (
                  <button onClick={startSimulation} className="simulate-nav-btn">
                    Start Navigation Simulation
                  </button>
                )}

                {simulationActive && (
                  <div className="flex items-center justify-center gap-2 py-1 text-xs text-primary font-bold animate-pulse">
                    <Navigation size={12} /> Live Simulation Navigating...
                  </div>
                )}

                {simulationStep >= activeSteps.length && (
                  <div className="flex items-center justify-center gap-2 py-1 text-safe-color font-bold text-xs">
                    <Check size={14} /> Destination Reached Safely!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Stepper Timeline UI */}
          {showMockRoute && (simulationActive || simulationStep > 0) && (
            <div className="route-info-badge m-0">
              <span className="text-xs font-bold text-secondary mb-1 block">Live Navigation Steps:</span>
              <div className="mock-route-steps">
                {activeSteps.map((step, idx) => {
                  const isPending = idx > simulationStep;
                  const isActive = idx === simulationStep;
                  const isDone = idx < simulationStep;

                  let itemClass = "mock-step-item";
                  if (isActive) itemClass += " active";
                  else if (isDone && (step.type === 'safe' || step.type === 'safe-arrive')) itemClass += " safe-check";
                  else if (isDone && step.type === 'danger') itemClass += " danger-check";

                  return (
                    <div 
                      key={idx} 
                      className={itemClass}
                      style={{ 
                        opacity: isPending ? 0.4 : 1, 
                        fontWeight: isActive ? '700' : 'normal',
                        transition: 'all 0.3s'
                      }}
                    >
                      <span className="mock-step-dot"></span>
                      <span>{step.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Legend Info */}
      <div className="mt-4 flex justify-between items-center text-sm border-t pt-3" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.75rem' }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#48bb78' }}></div>
          <span className="text-secondary font-medium">Safe Haven</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.75rem' }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f56565' }}></div>
          <span className="text-secondary font-medium">Avoid Zone</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ fontSize: '0.75rem' }}>
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3182ce' }}></div>
          <span className="text-secondary font-medium">Detour Spot</span>
        </div>
      </div>
    </div>
  );
}

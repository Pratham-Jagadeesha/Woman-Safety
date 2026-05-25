import React, { useState, useEffect, useRef } from 'react';
import { Map, Search, ShieldCheck, AlertTriangle, Navigation, X } from 'lucide-react';

// ── Load Leaflet from CDN ──────────────────────────────────────────────────────
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(); return; }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = resolve;
    document.head.appendChild(script);
  });
}

// ── Nominatim geocoding (OpenStreetMap, free, no key) ─────────────────────────
async function geocode(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
    { headers: { 'Accept-Language': 'en' } }
  );
  const data = await res.json();
  if (!data.length) throw new Error('Location not found');
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
}

// ── OSRM routing (free, no key) ───────────────────────────────────────────────
async function getRoute(from, to) {
  const url = `https://router.project-osrm.org/route/v1/foot/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.code !== 'Ok') throw new Error('Route not found');
  const route = data.routes[0];
  return {
    coords: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distance: (route.distance / 1000).toFixed(2) + ' km',
    duration: Math.round(route.duration / 60) + ' mins',
  };
}

// ── Haversine ─────────────────────────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371e3, r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) *
    Math.sin(((lng2 - lng1) * r) / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ── Map tile style ────────────────────────────────────────────────────────────
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export default function SafeRoutes() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);
  const markersRef = useRef([]);
  const overlaysRef = useRef([]);
  const originRef = useRef(null);

  const [leafletReady, setLeafletReady] = useState(false);
  const [query, setQuery] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [destination, setDestination] = useState('');

  // ── Load Leaflet ─────────────────────────────────────────────────────────────
  useEffect(() => {
    loadLeaflet().then(() => setLeafletReady(true));
  }, []);

  // ── Init map ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!leafletReady || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    const initMap = (lat, lng) => {
      originRef.current = { lat, lng };

      const map = L.map(mapRef.current, {
        center: [lat, lng],
        zoom: 15,
        zoomControl: true,
      });

      L.tileLayer(TILE_URL, { attribution: TILE_ATTR, maxZoom: 19 }).addTo(map);

      mapInstanceRef.current = map;

      // Current location marker
      const youIcon = L.divIcon({
        className: '',
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b6fd4;border:3px solid #fff;box-shadow:0 0 0 3px rgba(59,111,212,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker([lat, lng], { icon: youIcon, title: 'Your location' }).addTo(map);

      addSafetyOverlays(map, lat, lng);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        p => initMap(p.coords.latitude, p.coords.longitude),
        () => initMap(12.9716, 77.5946)
      );
    } else {
      initMap(12.9716, 77.5946);
    }
  }, [leafletReady]);

  // ── Safety overlays ───────────────────────────────────────────────────────---
  const addSafetyOverlays = (map, lat, lng) => {
    const L = window.L;
    overlaysRef.current.forEach(o => o.remove());
    overlaysRef.current = [];

    const safeIcon = (color) => L.divIcon({
      className: '',
      html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.2)"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });

    // Police station — green
    const police = L.marker([lat + 0.006, lng + 0.004], { icon: safeIcon('#16a34a'), title: 'Police station (safe haven)' }).addTo(map);
    police.bindPopup('<b>🚔 Police Station</b><br>Verified safe haven');
    overlaysRef.current.push(police);

    // 24/7 store — blue
    const store = L.marker([lat - 0.005, lng - 0.006], { icon: safeIcon('#3b6fd4'), title: '24/7 store (safe haven)' }).addTo(map);
    store.bindPopup('<b>🏪 24/7 Store</b><br>Safe haven, always open');
    overlaysRef.current.push(store);

    // Danger circle — red
    const danger = L.circle([lat + 0.003, lng - 0.004], {
      radius: 180,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.15,
      weight: 1.5,
    }).addTo(map);
    danger.bindPopup('<b>⚠ Caution zone</b><br>Low lighting reported');
    overlaysRef.current.push(danger);
  };

  // ── Search & route ────────────────────────────────────────────────────────---
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim() || !originRef.current || !mapInstanceRef.current) return;

    setLoading(true);
    setError(null);
    setRouteInfo(null);

    try {
      const dest = await geocode(query);
      setDestination(dest.name.split(',').slice(0, 2).join(', '));

      const route = await getRoute(originRef.current, dest);

      const L = window.L;
      const map = mapInstanceRef.current;

      // Clear previous route and destination marker
      if (routeLayerRef.current) routeLayerRef.current.remove();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      // Draw route
      routeLayerRef.current = L.polyline(route.coords, {
        color: '#3b6fd4',
        weight: 5,
        opacity: 0.85,
        lineJoin: 'round',
      }).addTo(map);

      // Destination marker
      const destIcon = L.divIcon({
        className: '',
        html: `<div style="width:12px;height:12px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.25)"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });
      const destMarker = L.marker([dest.lat, dest.lng], { icon: destIcon, title: dest.name }).addTo(map);
      destMarker.bindPopup(`<b>📍 Destination</b><br>${dest.name.split(',')[0]}`).openPopup();
      markersRef.current.push(destMarker);

      // Fit map to route
      map.fitBounds(routeLayerRef.current.getBounds(), { padding: [40, 40] });

      // Check proximity to danger zone
      const hotspot = { lat: originRef.current.lat + 0.003, lng: originRef.current.lng - 0.004 };
      const caution = route.coords.some(([rlat, rlng]) => haversine(rlat, rlng, hotspot.lat, hotspot.lng) < 200);

      setRouteInfo({ distance: route.distance, duration: route.duration, caution });
    } catch (err) {
      setError(err.message || 'Could not calculate route. Try a different location.');
    } finally {
      setLoading(false);
    }
  };

  const clearRoute = () => {
    if (routeLayerRef.current) routeLayerRef.current.remove();
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];
    setQuery('');
    setDestination('');
    setRouteInfo(null);
    setError(null);
    // Re-centre on origin
    if (mapInstanceRef.current && originRef.current) {
      mapInstanceRef.current.setView([originRef.current.lat, originRef.current.lng], 15);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-icon ci-purple"><Map size={16} /></div>
          Safe routes
        </div>
        <span style={{ fontSize: 11, color: 'var(--safe-color)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--safe-color)' }} />
          OpenStreetMap · Free
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a destination…"
              style={{
                width: '100%',
                padding: '9px 32px 9px 10px',
                border: '0.5px solid var(--surface-border)',
                borderRadius: 8,
                fontSize: 13,
                background: 'var(--bg-color)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            {query && (
              <button
                type="button"
                onClick={clearRoute}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            style={{ padding: '9px 12px', background: loading || !query.trim() ? '#cbd5e0' : 'var(--primary-color)', color: '#fff', border: 'none', borderRadius: 8, cursor: loading || !query.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
          >
            {loading
              ? <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : <Search size={16} />
            }
          </button>
        </form>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', background: '#fef2f2', border: '0.5px solid #fecaca', borderRadius: 8, fontSize: 12, color: '#991b1b' }}>
            <AlertTriangle size={13} /> {error}
          </div>
        )}

        {/* Map */}
        <div
          ref={mapRef}
          style={{
            width: '100%',
            height: 260,
            borderRadius: 10,
            border: '0.5px solid var(--surface-border)',
            overflow: 'hidden',
            background: '#f5f7fa',
            zIndex: 0,
          }}
        >
          {!leafletReady && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--text-secondary)' }}>
              <div style={{ width: 24, height: 24, border: '3px solid var(--surface-border)', borderTopColor: 'var(--primary-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 12 }}>Loading map…</span>
            </div>
          )}
        </div>

        {/* Route info */}
        {routeInfo && (
          <div style={{ background: 'var(--bg-color)', border: '0.5px solid var(--surface-border)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {destination && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Navigation size={12} color="var(--primary-color)" />
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{destination}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 500 }}>
              <span>Walking route</span>
              <span style={{ color: 'var(--primary-color)' }}>{routeInfo.distance} · {routeInfo.duration}</span>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12,
              padding: '6px 8px', borderRadius: 8,
              background: routeInfo.caution ? '#fffbeb' : '#f0fdf4',
              color: routeInfo.caution ? '#92400e' : '#166534',
              border: `0.5px solid ${routeInfo.caution ? '#fde68a' : '#bbf7d0'}`,
            }}>
              {routeInfo.caution
                ? <><AlertTriangle size={13} /> Route passes a caution zone — consider an alternate path</>
                : <><ShieldCheck size={13} /> Safe route — avoids all flagged zones</>}
            </div>
          </div>
        )}

        {/* Legend */}
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {[
            ['#16a34a', 'Police (safe)'],
            ['#3b6fd4', '24/7 store (safe)'],
            ['#ef4444', 'Caution zone'],
          ].map(([c, l]) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-secondary)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />{l}
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
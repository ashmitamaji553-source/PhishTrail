import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ForensicAnalysis, RelayHop } from '../types';
import { Globe, ZoomIn, ZoomOut, RotateCcw, MapPin } from 'lucide-react';

interface TraceMapProps {
  analysis: ForensicAnalysis;
}

export const TraceMap: React.FC<TraceMapProps> = ({ analysis }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const [activeHop, setActiveHop] = useState<RelayHop | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Dark Matter tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://carto.com/" target="_blank" class="text-blue-400 hover:underline">CARTO</a> | &copy; OSM')
        .addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // Collect valid hops with geo coordinates
    const geoHops: Array<{ hop: RelayHop; lat: number; lon: number; isOrigin: boolean }> = [];

    // Ensure origin geo is included
    if (analysis.originGeo && analysis.originGeo.lat && analysis.originGeo.lon) {
      geoHops.push({
        hop: {
          hopNumber: 1,
          fromIp: analysis.originIp,
          isOrigin: true,
          geo: {
            country: analysis.originGeo.country,
            countryCode: analysis.originGeo.countryCode,
            city: analysis.originGeo.city,
            region: analysis.originGeo.region,
            isp: analysis.originGeo.isp,
            asn: analysis.originGeo.asn,
            org: analysis.originGeo.org,
            lat: analysis.originGeo.lat,
            lon: analysis.originGeo.lon
          }
        },
        lat: analysis.originGeo.lat,
        lon: analysis.originGeo.lon,
        isOrigin: true
      });
    }

    // Add remaining relay hops
    analysis.hops.forEach((hop) => {
      if (hop.geo && hop.geo.lat && hop.geo.lon) {
        const isDuplicate = geoHops.some(
          g => Math.abs(g.lat - hop.geo!.lat) < 0.001 && Math.abs(g.lon - hop.geo!.lon) < 0.001
        );
        if (!isDuplicate) {
          geoHops.push({
            hop,
            lat: hop.geo.lat,
            lon: hop.geo.lon,
            isOrigin: Boolean(hop.isOrigin)
          });
        }
      }
    });

    if (geoHops.length === 0 && analysis.originGeo) {
      geoHops.push({
        hop: analysis.hops[0] || { hopNumber: 1, isOrigin: true },
        lat: analysis.originGeo.lat || 38.8951,
        lon: analysis.originGeo.lon || -77.0364,
        isOrigin: true
      });
    }

    const bounds = L.latLngBounds([]);

    // Draw route lines connecting hops
    if (geoHops.length > 1) {
      const latlngs: [number, number][] = geoHops.map(g => [g.lat, g.lon]);
      
      // Outer glow line
      L.polyline(latlngs, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.35,
        dashArray: '6, 8'
      }).addTo(layerGroup);

      // Core path line
      L.polyline(latlngs, {
        color: '#60a5fa',
        weight: 2,
        opacity: 0.95
      }).addTo(layerGroup);
    }

    // Add markers for each hop
    geoHops.forEach((item, index) => {
      bounds.extend([item.lat, item.lon]);

      const isOrigin = item.isOrigin || index === 0;
      const isDestination = index === geoHops.length - 1 && geoHops.length > 1;

      const html = isOrigin
        ? `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-white shadow-md font-bold text-[11px]">
              #1
            </div>
          </div>
        `
        : isDestination
        ? `
          <div class="relative flex items-center justify-center w-7 h-7">
            <div class="w-6 h-6 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center text-white shadow-md font-bold text-[10px]">
              MX
            </div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center w-6 h-6">
            <div class="w-5 h-5 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-white shadow-md font-bold text-[9px]">
              ${item.hop.hopNumber || index + 1}
            </div>
          </div>
        `;

      const icon = L.divIcon({
        className: 'custom-trace-pin',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const marker = L.marker([item.lat, item.lon], { icon }).addTo(layerGroup);

      // Clean readable popup content
      const geo = item.hop.geo || analysis.originGeo;
      const popupContent = `
        <div class="p-3 font-sans text-xs bg-slate-900 text-slate-100 border border-slate-700 rounded-lg shadow-xl min-w-[240px]">
          <div class="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-800">
            <span class="font-semibold ${isOrigin ? 'text-rose-400' : isDestination ? 'text-emerald-400' : 'text-blue-400'}">
              ${isOrigin ? 'ORIGIN (HOP #1)' : isDestination ? 'DESTINATION MX' : `RELAY HOP #${item.hop.hopNumber}`}
            </span>
            <span class="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-slate-200">
              ${geo.countryCode || 'IP'}
            </span>
          </div>
          <div class="space-y-1">
            <div class="font-mono text-white font-semibold text-[13px]">${item.hop.fromIp || analysis.originIp}</div>
            <div class="text-slate-200 text-xs">${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}</div>
            <div class="text-slate-400 text-[11px] truncate"><span class="text-slate-500">ISP:</span> ${geo.isp || 'N/A'}</div>
            ${geo.asn ? `<div class="text-slate-400 text-[11px]"><span class="text-slate-500">ASN:</span> ${geo.asn}</div>` : ''}
            ${item.hop.delaySeconds ? `<div class="text-amber-300 text-[11px] font-medium"><span class="text-slate-500">Transit Delay:</span> +${item.hop.delaySeconds}s</div>` : ''}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        closeButton: false
      });

      marker.on('click', () => {
        setActiveHop(item.hop);
      });
    });

    if (bounds.isValid()) {
      map.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 6,
        animate: true
      });
    }

    return () => {
      layerGroup.clearLayers();
    };
  }, [analysis]);

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn();
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut();
  const handleReset = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([20, 0], 2);
  };

  const origin = analysis.originGeo;

  return (
    <div id="forensic-trace-map-container" className="relative w-full h-[400px] lg:h-[450px] rounded-xl overflow-hidden border border-slate-800 bg-[#0D1527] shadow-sm flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-200 shadow-md">
          <Globe className="w-4 h-4 text-blue-400" aria-hidden="true" />
          <span className="font-semibold text-white">Origin:</span>
          <span className="font-mono text-slate-200">{origin.ip}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-300">{origin.city}, {origin.country}</span>
        </div>

        {/* Map Controls */}
        <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-md">
          <button
            id="map-zoom-in-btn"
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            id="map-zoom-out-btn"
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            id="map-reset-btn"
            type="button"
            onClick={handleReset}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Reset Global View"
            aria-label="Reset Global View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Stage */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Bottom HUD: Hop sequence and quick legend */}
      <div className="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-200 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-600 border border-white"></span>
            <span>Origin IP (#1)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 border border-white"></span>
            <span>Intermediate Relay</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-600 border border-white"></span>
            <span>Recipient MX</span>
          </div>
        </div>

        <div className="pointer-events-auto px-3 py-1.5 rounded-lg bg-slate-900/90 backdrop-blur-md border border-slate-700 text-xs text-slate-200 font-medium shadow-md">
          Total Relay Hops: <span className="text-white font-bold tabular-nums">{analysis.hops.length}</span>
        </div>
      </div>
    </div>
  );
};


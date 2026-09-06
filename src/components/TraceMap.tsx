import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ForensicAnalysis, RelayHop } from '../types';
import { ShieldAlert, Globe, Radio, Server, MapPin, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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

    // Initialize map if not yet created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Dark Matter tile layer for dark cybersecurity aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false })
        .addAttribution('&copy; <a href="https://carto.com/" target="_blank" class="text-cyan-600 hover:underline">CARTO</a> | &copy; OSM')
        .addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    // Clear previous markers & lines
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
    analysis.hops.forEach((hop, i) => {
      if (hop.geo && hop.geo.lat && hop.geo.lon) {
        // Skip duplicate coordinate if it's identical to the origin
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

    // If no hops had geo, fallback to origin
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
        color: '#06b6d4',
        weight: 4,
        opacity: 0.4,
        dashArray: '4, 8'
      }).addTo(layerGroup);

      // Core path line
      L.polyline(latlngs, {
        color: '#22d3ee',
        weight: 2,
        opacity: 0.9
      }).addTo(layerGroup);
    }

    // Add markers for each hop
    geoHops.forEach((item, index) => {
      bounds.extend([item.lat, item.lon]);

      const isOrigin = item.isOrigin || index === 0;
      const isDestination = index === geoHops.length - 1 && geoHops.length > 1;

      const markerColor = isOrigin
        ? '#ef4444' // Red for origin threat source
        : isDestination
        ? '#10b981' // Green for destination inbox
        : '#06b6d4'; // Cyan for intermediate relays

      const html = isOrigin
        ? `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-8 h-8 rounded-full bg-red-500/30 animate-ping"></div>
            <div class="w-6 h-6 rounded-full bg-red-950 border-2 border-red-500 flex items-center justify-center text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.8)]">
              <span class="text-[10px] font-bold">#1</span>
            </div>
          </div>
        `
        : isDestination
        ? `
          <div class="relative flex items-center justify-center w-7 h-7">
            <div class="w-6 h-6 rounded-full bg-emerald-950 border-2 border-emerald-400 flex items-center justify-center text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.7)]">
              <span class="text-[9px] font-bold">MX</span>
            </div>
          </div>
        `
        : `
          <div class="relative flex items-center justify-center w-6 h-6">
            <div class="w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.6)]">
              <span class="text-[8px] font-mono font-bold">${item.hop.hopNumber || index + 1}</span>
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

      // Popup content
      const geo = item.hop.geo || analysis.originGeo;
      const popupContent = `
        <div class="p-2 font-sans text-xs bg-slate-950 text-slate-100 border border-slate-700 rounded shadow-xl min-w-[220px]">
          <div class="flex items-center justify-between pb-1 mb-1.5 border-b border-slate-800">
            <span class="font-mono font-semibold ${isOrigin ? 'text-red-400' : 'text-cyan-400'}">
              ${isOrigin ? 'ORIGIN IP (HOP #1)' : isDestination ? 'DESTINATION MX' : `RELAY HOP #${item.hop.hopNumber}`}
            </span>
            <span class="px-1 py-0.5 text-[9px] font-mono rounded ${isOrigin ? 'bg-red-950/80 text-red-300' : 'bg-cyan-950/80 text-cyan-300'}">
              ${geo.countryCode || 'IP'}
            </span>
          </div>
          <div class="space-y-1">
            <div class="font-mono text-cyan-300 font-semibold text-[13px]">${item.hop.fromIp || analysis.originIp}</div>
            <div class="text-slate-300 text-[11px]">${geo.city || 'Unknown'}, ${geo.country || 'Unknown'}</div>
            <div class="text-slate-400 text-[10px] truncate"><span class="text-slate-500">ISP:</span> ${geo.isp || 'N/A'}</div>
            ${geo.asn ? `<div class="text-slate-400 text-[10px]"><span class="text-slate-500">ASN:</span> ${geo.asn}</div>` : ''}
            ${item.hop.delaySeconds ? `<div class="text-amber-400 text-[10px]"><span class="text-slate-500">Transit Delay:</span> +${item.hop.delaySeconds}s</div>` : ''}
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
      // Cleanup layers on unmount or re-render
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
    <div id="forensic-trace-map-container" class="relative w-full h-[400px] lg:h-[460px] rounded-xl overflow-hidden border border-cyan-900/40 bg-[#060c18] shadow-2xl flex flex-col">
      {/* Top Map HUD Bar */}
      <div class="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div class="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 text-xs text-slate-200 shadow-lg">
          <Radio class="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span class="font-mono text-cyan-400 font-semibold tracking-wide">ORIGIN TRACE:</span>
          <span class="font-mono text-slate-100">{origin.ip}</span>
          <span class="text-slate-500">|</span>
          <span class="text-slate-300">{origin.city}, {origin.country}</span>
        </div>

        {/* Map Controls */}
        <div class="pointer-events-auto flex items-center gap-1 p-1 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 shadow-lg">
          <button
            id="map-zoom-in-btn"
            onClick={handleZoomIn}
            class="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn class="w-3.5 h-3.5" />
          </button>
          <button
            id="map-zoom-out-btn"
            onClick={handleZoomOut}
            class="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut class="w-3.5 h-3.5" />
          </button>
          <button
            id="map-reset-btn"
            onClick={handleReset}
            class="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800/80 rounded transition-colors"
            title="Reset Global View"
          >
            <RotateCcw class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Leaflet Map Stage */}
      <div ref={mapContainerRef} class="w-full h-full z-0" />

      {/* Bottom HUD: Hop sequence and quick legend */}
      <div class="absolute bottom-3 left-3 right-3 z-[400] pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div class="pointer-events-auto flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.9)]"></span>
            <span>Origin IP / Client MTA</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.9)]"></span>
            <span>Relay Hop</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)]"></span>
            <span>Recipient MX</span>
          </div>
        </div>

        <div class="pointer-events-auto px-3 py-1.5 rounded-lg bg-slate-950/85 backdrop-blur-md border border-slate-800 text-[11px] font-mono text-cyan-400">
          Total Hops: <span class="text-white font-bold">{analysis.hops.length}</span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { RelayHop } from '../types';
import { Server, ArrowRight, Clock, ShieldCheck, MapPin, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

interface HopChainVisualizerProps {
  hops: RelayHop[];
  originIp: string;
}

export const HopChainVisualizer: React.FC<HopChainVisualizerProps> = ({ hops, originIp }) => {
  const [expandedHop, setExpandedHop] = useState<number | null>(null);
  const [copiedHop, setCopiedHop] = useState<number | null>(null);

  const toggleExpand = (hopNum: number) => {
    setExpandedHop(prev => (prev === hopNum ? null : hopNum));
  };

  const copyHopDetails = (hop: RelayHop, e: React.MouseEvent) => {
    e.stopPropagation();
    const info = `Hop #${hop.hopNumber}
From: ${hop.fromHost || 'unknown'} [${hop.fromIp || 'N/A'}]
By: ${hop.byHost || 'unknown'}
Protocol: ${hop.protocol || 'ESMTP'}
Delay: +${hop.delaySeconds || 0}s
Time: ${hop.timestamp || 'N/A'}
Geo: ${hop.geo?.city || 'N/A'}, ${hop.geo?.country || 'N/A'}`;
    navigator.clipboard.writeText(info);
    setCopiedHop(hop.hopNumber);
    setTimeout(() => setCopiedHop(null), 2000);
  };

  return (
    <div class="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
        <div class="flex items-center gap-2">
          <Server class="w-4 h-4 text-cyan-400" />
          <h3 class="text-sm font-semibold text-slate-100 tracking-wide">
            Received Header Chain Trace
          </h3>
        </div>
        <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{hops.length} Relay Hops Detected</span>
          <span class="text-slate-600">|</span>
          <span class="text-cyan-400">Origin: {originIp}</span>
        </div>
      </div>

      {/* Visual Pipeline Flow Summary */}
      <div class="mb-5 p-3 rounded-lg bg-slate-900/60 border border-slate-800 overflow-x-auto">
        <div class="flex items-center gap-2 min-w-max text-xs font-mono">
          {hops.map((hop, idx) => {
            const isOrigin = hop.isOrigin || idx === 0;
            const isLast = idx === hops.length - 1;

            return (
              <React.Fragment key={hop.hopNumber}>
                <div
                  onClick={() => toggleExpand(hop.hopNumber)}
                  class={`cursor-pointer px-3 py-1.5 rounded-md border flex items-center gap-2 transition-all ${
                    isOrigin
                      ? 'bg-red-950/40 border-red-500/50 text-red-300 hover:bg-red-900/50'
                      : isLast
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 hover:bg-emerald-900/50'
                      : 'bg-slate-800/60 border-cyan-900/50 text-cyan-300 hover:bg-slate-800'
                  }`}
                >
                  <span class="font-bold">
                    {isOrigin ? 'Origin #1' : isLast ? `MX #${hop.hopNumber}` : `Hop #${hop.hopNumber}`}
                  </span>
                  <span class="text-slate-400 text-[11px] truncate max-w-[130px]">
                    {hop.fromIp || hop.fromHost || 'Relay'}
                  </span>
                </div>
                {!isLast && (
                  <div class="flex items-center text-slate-600">
                    {hop.delaySeconds ? (
                      <span class="text-[10px] text-amber-400/80 px-1">+{hop.delaySeconds}s</span>
                    ) : null}
                    <ArrowRight class="w-3.5 h-3.5 text-cyan-600" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed Hop Cards */}
      <div class="space-y-2.5">
        {hops.map((hop, index) => {
          const isOrigin = hop.isOrigin || index === 0;
          const isLast = index === hops.length - 1;
          const isExpanded = expandedHop === hop.hopNumber;

          return (
            <div
              key={hop.hopNumber}
              class={`rounded-lg border transition-all ${
                isOrigin
                  ? 'border-red-950/80 bg-red-950/10 hover:border-red-700/50'
                  : isLast
                  ? 'border-emerald-950/80 bg-emerald-950/10 hover:border-emerald-700/50'
                  : 'border-slate-800/80 bg-slate-900/30 hover:border-cyan-800/50'
              }`}
            >
              {/* Main Hop Header Row */}
              <div
                onClick={() => toggleExpand(hop.hopNumber)}
                class="p-3 cursor-pointer flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div class="flex items-center gap-3">
                  <div
                    class={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${
                      isOrigin
                        ? 'bg-red-900/60 text-red-300 border border-red-500/50'
                        : isLast
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/50'
                        : 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/30'
                    }`}
                  >
                    {hop.hopNumber}
                  </div>

                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-mono font-semibold text-slate-100">
                        {hop.fromHost || 'Unknown Sender Host'}
                      </span>
                      {hop.fromIp && (
                        <span class="font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded text-[11px]">
                          [{hop.fromIp}]
                        </span>
                      )}
                      {isOrigin && (
                        <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-red-950 border border-red-500/40 text-red-300">
                          ATTACK ORIGIN
                        </span>
                      )}
                      {isLast && (
                        <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300">
                          INBOUND MX
                        </span>
                      )}
                    </div>

                    <div class="text-slate-400 text-[11px] mt-0.5 flex items-center gap-2">
                      <span>Received by: <strong class="text-slate-300">{hop.byHost || 'Local MTA'}</strong></span>
                      {hop.protocol && (
                        <span class="text-slate-500">• Protocol: {hop.protocol}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side stats & delay */}
                <div class="flex items-center gap-3 text-slate-400">
                  {hop.geo && (
                    <div class="flex items-center gap-1 text-[11px] text-slate-300">
                      <MapPin class="w-3 h-3 text-cyan-400" />
                      <span>{hop.geo.city}, {hop.geo.countryCode}</span>
                    </div>
                  )}

                  {hop.delaySeconds !== undefined && hop.delaySeconds > 0 && (
                    <div class="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                      <Clock class="w-3 h-3" />
                      <span>+{hop.delaySeconds}s delay</span>
                    </div>
                  )}

                  <button
                    onClick={(e) => copyHopDetails(hop, e)}
                    class="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-300"
                    title="Copy Hop Details"
                  >
                    {copiedHop === hop.hopNumber ? (
                      <Check class="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy class="w-3.5 h-3.5" />
                    )}
                  </button>

                  <div class="text-slate-500">
                    {isExpanded ? <ChevronUp class="w-4 h-4" /> : <ChevronDown class="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Hop Diagnostics */}
              {isExpanded && (
                <div class="px-3 pb-3 pt-1 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-300 space-y-2">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    <div>
                      <span class="text-slate-500 text-[10px] uppercase font-mono block">Timestamp:</span>
                      <span class="font-mono text-slate-200">{hop.timestamp || 'Not recorded'}</span>
                    </div>
                    <div>
                      <span class="text-slate-500 text-[10px] uppercase font-mono block">Network Provider / ISP:</span>
                      <span class="text-cyan-300">{hop.geo?.isp || 'Unknown Autonomous System'}</span>
                    </div>
                    <div>
                      <span class="text-slate-500 text-[10px] uppercase font-mono block">ASN Number:</span>
                      <span class="font-mono text-slate-300">{hop.geo?.asn || 'AS-UNASSIGNED'}</span>
                    </div>
                    <div>
                      <span class="text-slate-500 text-[10px] uppercase font-mono block">Coordinates:</span>
                      <span class="font-mono text-slate-300">
                        {hop.geo ? `${hop.geo.lat.toFixed(4)}, ${hop.geo.lon.toFixed(4)}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

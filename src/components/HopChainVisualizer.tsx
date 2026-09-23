import React, { useState } from 'react';
import { RelayHop } from '../types';
import { Server, ArrowRight, Clock, MapPin, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';

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
    <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#131C31] shadow-sm">
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <h3 className="text-base font-semibold text-white">
            Received Header Relay Chain
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="tabular-nums font-medium text-slate-300">{hops.length} Relay Hops</span>
          <span>·</span>
          <span>Origin: <strong className="font-mono text-white">{originIp}</strong></span>
        </div>
      </div>

      {/* Visual Pipeline Flow Summary */}
      <div className="mb-5 p-3 rounded-lg bg-slate-900 border border-slate-700/80 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max text-xs">
          {hops.map((hop, idx) => {
            const isOrigin = hop.isOrigin || idx === 0;
            const isLast = idx === hops.length - 1;

            return (
              <React.Fragment key={hop.hopNumber}>
                <button
                  type="button"
                  onClick={() => toggleExpand(hop.hopNumber)}
                  className={`px-3 py-1.5 rounded-md border flex items-center gap-2 transition-colors cursor-pointer text-left ${
                    isOrigin
                      ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 hover:bg-rose-500/20'
                      : isLast
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/20'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700/80'
                  }`}
                >
                  <span className="font-semibold tabular-nums">
                    {isOrigin ? '#1 Origin' : isLast ? `#${hop.hopNumber} MX` : `Hop #${hop.hopNumber}`}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono truncate max-w-[130px]">
                    {hop.fromIp || hop.fromHost || 'Relay'}
                  </span>
                </button>
                {!isLast && (
                  <div className="flex items-center text-slate-400">
                    {hop.delaySeconds ? (
                      <span className="text-[11px] text-amber-300 font-medium px-1 tabular-nums">+{hop.delaySeconds}s</span>
                    ) : null}
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Detailed Hop Cards */}
      <div className="space-y-2.5">
        {hops.map((hop, index) => {
          const isOrigin = hop.isOrigin || index === 0;
          const isLast = index === hops.length - 1;
          const isExpanded = expandedHop === hop.hopNumber;

          return (
            <div
              key={hop.hopNumber}
              className={`rounded-lg border transition-colors ${
                isOrigin
                  ? 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50'
                  : isLast
                  ? 'border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {/* Main Hop Header Row */}
              <div
                onClick={() => toggleExpand(hop.hopNumber)}
                className="p-3.5 cursor-pointer flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs tabular-nums flex-shrink-0 ${
                      isOrigin
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : isLast
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    }`}
                  >
                    {hop.hopNumber}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-white truncate">
                        {hop.fromHost || 'Unknown Sender Host'}
                      </span>
                      {hop.fromIp && (
                        <span className="font-mono text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded text-[11px] border border-blue-500/30">
                          {hop.fromIp}
                        </span>
                      )}
                      {isOrigin && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-rose-500/20 border border-rose-500/40 text-rose-300">
                          ORIGIN HOP
                        </span>
                      )}
                      {isLast && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                          INBOUND MX
                        </span>
                      )}
                    </div>

                    <div className="text-slate-400 text-xs mt-1 flex flex-wrap items-center gap-2">
                      <span>Received by: <strong className="text-slate-200">{hop.byHost || 'Local MTA'}</strong></span>
                      {hop.protocol && (
                        <span>· Protocol: <span className="text-slate-300">{hop.protocol}</span></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side stats & delay */}
                <div className="flex items-center gap-3 text-slate-300">
                  {hop.geo && (
                    <div className="flex items-center gap-1 text-xs text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
                      <span>{hop.geo.city}, {hop.geo.countryCode}</span>
                    </div>
                  )}

                  {hop.delaySeconds !== undefined && hop.delaySeconds > 0 && (
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 tabular-nums">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>+{hop.delaySeconds}s delay</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={(e) => copyHopDetails(hop, e)}
                    className="p-1.5 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                    title="Copy Hop Details"
                    aria-label="Copy Hop Details"
                  >
                    {copiedHop === hop.hopNumber ? (
                      <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Copy className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>

                  <div className="text-slate-400">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Expanded Hop Diagnostics */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-200 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <span className="text-slate-400 text-xs font-medium block">Timestamp:</span>
                      <span className="font-mono text-white text-xs">{hop.timestamp || 'Not recorded'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs font-medium block">Network Provider / ISP:</span>
                      <span className="text-blue-300 text-xs">{hop.geo?.isp || 'Unknown Autonomous System'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs font-medium block">ASN Number:</span>
                      <span className="font-mono text-slate-300 text-xs">{hop.geo?.asn || 'AS-UNASSIGNED'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs font-medium block">Coordinates:</span>
                      <span className="font-mono text-slate-300 text-xs">
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


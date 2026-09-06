import React from 'react';
import { ForensicAnalysis, ThreatLevel } from '../types';
import { ShieldAlert, ShieldCheck, ShieldX, Globe, Server, AlertTriangle, CheckCircle2, XCircle, Info, Lock } from 'lucide-react';

interface DashboardStatsProps {
  analysis: ForensicAnalysis;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ analysis }) => {
  const { fraudConfidence, riskScore, authentication, originGeo, spoofingIndicators } = analysis;

  // Determine threat level color themes
  const getThreatColor = (level: ThreatLevel) => {
    switch (level) {
      case 'CRITICAL_THREAT':
        return {
          text: 'text-red-400',
          bg: 'bg-red-950/30',
          border: 'border-red-500/40',
          badge: 'bg-red-500/20 text-red-300 border-red-500/50',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.25)]',
          stroke: '#ef4444'
        };
      case 'HIGH_RISK':
        return {
          text: 'text-orange-400',
          bg: 'bg-orange-950/30',
          border: 'border-orange-500/40',
          badge: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
          glow: 'shadow-[0_0_20px_rgba(249,115,22,0.25)]',
          stroke: '#f97316'
        };
      case 'SUSPICIOUS':
        return {
          text: 'text-amber-400',
          bg: 'bg-amber-950/30',
          border: 'border-amber-500/40',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
          stroke: '#f59e0b'
        };
      case 'LOW_RISK':
        return {
          text: 'text-blue-400',
          bg: 'bg-blue-950/30',
          border: 'border-blue-500/40',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/50',
          glow: 'shadow-[0_0_20px_rgba(59,130,246,0.25)]',
          stroke: '#3b82f6'
        };
      case 'CLEAN':
      default:
        return {
          text: 'text-emerald-400',
          bg: 'bg-emerald-950/30',
          border: 'border-emerald-500/40',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
          stroke: '#10b981'
        };
    }
  };

  const threat = getThreatColor(riskScore.level);

  // SVG Gauge calculations
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fraudConfidence / 100) * circumference;

  // Auth badge renderer
  const renderAuthBadge = (label: string, status: string, detail: string, sub?: string) => {
    const isPass = status.toLowerCase() === 'pass';
    const isFail = status.toLowerCase() === 'fail';
    const isSoftFail = status.toLowerCase() === 'softfail';

    const colorClass = isPass
      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
      : isFail
      ? 'bg-red-950/60 border-red-500/40 text-red-300'
      : isSoftFail
      ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
      : 'bg-slate-900/80 border-slate-700 text-slate-400';

    return (
      <div class={`p-3 rounded-lg border flex flex-col justify-between ${colorClass} transition-all`}>
        <div class="flex items-center justify-between">
          <span class="font-mono text-xs font-bold text-slate-200 tracking-wider">{label}</span>
          {isPass ? (
            <CheckCircle2 class="w-4 h-4 text-emerald-400" />
          ) : isFail ? (
            <XCircle class="w-4 h-4 text-red-400" />
          ) : isSoftFail ? (
            <AlertTriangle class="w-4 h-4 text-amber-400" />
          ) : (
            <Info class="w-4 h-4 text-slate-400" />
          )}
        </div>
        <div class="mt-2 flex items-baseline gap-1.5">
          <span class="text-sm font-black uppercase font-mono">{status}</span>
          {sub && <span class="text-[10px] font-mono text-slate-400 truncate">({sub})</span>}
        </div>
        <p class="mt-1 text-[11px] text-slate-400 line-clamp-2" title={detail}>
          {detail}
        </p>
      </div>
    );
  };

  return (
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Fraud Confidence Dial Card */}
      <div class={`p-4 rounded-xl border ${threat.border} ${threat.bg} ${threat.glow} backdrop-blur-md flex items-center gap-4`}>
        <div class="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
          <svg class="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#1e293b"
              strokeWidth="8"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={threat.stroke}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              class="transition-all duration-1000 ease-out"
            />
          </svg>
          <div class="absolute flex flex-col items-center justify-center">
            <span class={`text-2xl font-black font-mono leading-none ${threat.text}`}>
              {fraudConfidence}%
            </span>
            <span class="text-[9px] uppercase tracking-wider text-slate-400 mt-0.5">Confidence</span>
          </div>
        </div>

        <div class="flex flex-col">
          <span class="text-xs uppercase font-mono text-slate-400">Threat Verdict</span>
          <span class={`text-base font-bold tracking-tight mt-0.5 ${threat.text}`}>
            {riskScore.level.replace('_', ' ')}
          </span>
          <span class="text-xs text-slate-300 mt-1">
            {fraudConfidence >= 70
              ? 'Critical malicious traits detected.'
              : fraudConfidence >= 40
              ? 'Heuristic warning flags triggered.'
              : 'Cryptographically consistent mail.'}
          </span>
        </div>
      </div>

      {/* 2. Origin Geolocation & Network Card */}
      <div class="p-4 rounded-xl border border-cyan-900/40 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Globe class="w-4 h-4 text-cyan-400" />
            <span class="text-xs font-mono uppercase text-slate-400">Origin IP Geolocation</span>
          </div>
          <span class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
            {originGeo.countryCode || 'NET'}
          </span>
        </div>

        <div class="mt-2">
          <div class="text-base font-bold font-mono text-slate-100 tracking-wide">
            {originGeo.ip}
          </div>
          <div class="text-xs text-cyan-300 font-medium mt-0.5">
            {originGeo.city}, {originGeo.country}
          </div>
          <div class="text-[11px] text-slate-400 truncate mt-1" title={originGeo.isp}>
            <span class="text-slate-500">ISP:</span> {originGeo.isp}
          </div>
        </div>

        <div class="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>ASN: {originGeo.asn || 'AS-UNSPEC'}</span>
          <span class="text-slate-500 truncate max-w-[120px]" title={originGeo.reverseDns}>
            {originGeo.reverseDns || 'no-rdns'}
          </span>
        </div>
      </div>

      {/* 3. Authentication Trio (SPF, DKIM, DMARC) Card */}
      <div class="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex flex-col justify-between lg:col-span-2">
        <div class="flex items-center justify-between pb-2 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <Lock class="w-4 h-4 text-cyan-400" />
            <span class="text-xs font-mono uppercase text-slate-400">Protocol Verification (SPF / DKIM / DMARC)</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <span class="text-slate-400">Domain:</span>
            <span class="font-mono text-cyan-300 font-semibold">{analysis.from.domain}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
          {renderAuthBadge('SPF', authentication.spf.status, authentication.spf.detail)}
          {renderAuthBadge('DKIM', authentication.dkim.status, authentication.dkim.detail, authentication.dkim.selector ? `s=${authentication.dkim.selector}` : undefined)}
          {renderAuthBadge('DMARC', authentication.dmarc.status, authentication.dmarc.detail)}
        </div>
      </div>
    </div>
  );
};

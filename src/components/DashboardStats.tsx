import React from 'react';
import { ForensicAnalysis, ThreatLevel } from '../types';
import { Globe, Lock, CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react';

interface DashboardStatsProps {
  analysis: ForensicAnalysis;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ analysis }) => {
  const { fraudConfidence, riskScore, authentication, originGeo } = analysis;

  const getThreatStyle = (level: ThreatLevel) => {
    switch (level) {
      case 'CRITICAL_THREAT':
        return {
          title: 'Critical Threat Detected',
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          gaugeColor: '#f43f5e',
          badge: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
          summary: 'High probability of targeted phishing or business email compromise (BEC).'
        };
      case 'HIGH_RISK':
        return {
          title: 'High Risk Phishing',
          text: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          gaugeColor: '#f43f5e',
          badge: 'bg-rose-500/20 text-rose-200 border-rose-500/40',
          summary: 'Critical spoofing or credential-harvesting indicators detected.'
        };
      case 'SUSPICIOUS':
        return {
          title: 'Suspicious Email',
          text: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          gaugeColor: '#f59e0b',
          badge: 'bg-amber-500/20 text-amber-200 border-amber-500/40',
          summary: 'Unusual relay anomalies or heuristic warning triggers found.'
        };
      case 'LOW_RISK':
        return {
          title: 'Low Risk',
          text: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          gaugeColor: '#3b82f6',
          badge: 'bg-blue-500/20 text-blue-200 border-blue-500/40',
          summary: 'Minor routing irregularities, but no severe threat flags.'
        };
      case 'CLEAN':
      default:
        return {
          title: 'Legitimate / Clean',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          gaugeColor: '#10b981',
          badge: 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40',
          summary: 'All email authentication records passed; sender verified.'
        };
    }
  };

  const threat = getThreatStyle(riskScore.level);

  // SVG Gauge calculations
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (fraudConfidence / 100) * circumference;

  const renderAuthCard = (
    label: string,
    fullName: string,
    status: string,
    detail: string,
    description: string
  ) => {
    const s = status.toLowerCase();
    const isPass = s === 'pass';
    const isFail = s === 'fail';
    const isSoftFail = s === 'softfail';

    const color = isPass
      ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
      : isFail
      ? 'border-rose-500/30 bg-rose-500/5 text-rose-300'
      : isSoftFail
      ? 'border-amber-500/30 bg-amber-500/5 text-amber-300'
      : 'border-slate-700 bg-slate-900/60 text-slate-300';

    const statusBadge = isPass
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : isFail
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : isSoftFail
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : 'bg-slate-800 text-slate-400 border-slate-700';

    return (
      <div className={`p-3.5 rounded-lg border ${color} flex flex-col justify-between`}>
        <div>
          <div className="flex items-center justify-between gap-1">
            <span className="font-semibold text-xs sm:text-sm text-white">
              {label}
            </span>
            <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border uppercase tracking-wider ${statusBadge}`}>
              {status}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">{fullName}</span>
          <p className="text-xs text-slate-300 mt-2 line-clamp-2" title={detail}>
            {detail}
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          {description}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Threat Verdict & Confidence Score */}
      <div className={`p-5 rounded-xl border ${threat.border} ${threat.bg} flex items-center gap-4`}>
        <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center">
          <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#1e293b"
              strokeWidth="9"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={threat.gaugeColor}
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={`text-xl font-bold tabular-nums leading-none ${threat.text}`}>
              {fraudConfidence}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase mt-0.5">Score</span>
          </div>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs uppercase font-medium tracking-wider text-slate-400">
            Threat Level
          </span>
          <h3 className={`text-base font-bold truncate mt-0.5 ${threat.text}`}>
            {threat.title}
          </h3>
          <p className="text-xs text-slate-300 mt-1 leading-snug">
            {threat.summary}
          </p>
        </div>
      </div>

      {/* 2. Origin Geolocation & Network */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[#131C31] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Sender Location
            </span>
          </div>
          {originGeo.countryCode && (
            <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-800 border border-slate-700 text-slate-200">
              {originGeo.countryCode}
            </span>
          )}
        </div>

        <div className="my-2">
          <div className="text-sm font-semibold font-mono text-white tracking-wide">
            {originGeo.ip}
          </div>
          <div className="text-xs font-medium text-slate-200 mt-0.5">
            {originGeo.city ? `${originGeo.city}, ` : ''}{originGeo.country || 'Unknown location'}
          </div>
          <div className="text-xs text-slate-400 truncate mt-1" title={originGeo.isp}>
            <span className="text-slate-500">ISP:</span> {originGeo.isp || 'N/A'}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>ASN: {originGeo.asn || 'N/A'}</span>
          <span className="truncate max-w-[120px] font-mono text-[11px]" title={originGeo.reverseDns}>
            {originGeo.reverseDns || 'No rDNS'}
          </span>
        </div>
      </div>

      {/* 3. Authentication Trio (SPF, DKIM, DMARC) */}
      <div className="p-5 rounded-xl border border-slate-800 bg-[#131C31] flex flex-col justify-between lg:col-span-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Email Authentication Protocols
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Claimed Domain:</span>
            <span className="font-mono text-white font-medium bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              {analysis.from.domain}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
          {renderAuthCard(
            'SPF',
            'Sender Policy Framework',
            authentication.spf.status,
            authentication.spf.detail,
            'Verifies sending server IP'
          )}
          {renderAuthCard(
            'DKIM',
            'DomainKeys Identified Mail',
            authentication.dkim.status,
            authentication.dkim.detail,
            'Validates digital signature'
          )}
          {renderAuthCard(
            'DMARC',
            'Message Authentication',
            authentication.dmarc.status,
            authentication.dmarc.detail,
            'Enforces domain policy'
          )}
        </div>
      </div>
    </div>
  );
};


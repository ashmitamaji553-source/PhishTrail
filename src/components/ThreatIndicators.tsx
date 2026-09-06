import React from 'react';
import { ForensicAnalysis, SpoofingIndicator, PhishingRiskFactor } from '../types';
import { ShieldAlert, AlertOctagon, AlertTriangle, Link2, Key, Zap, CheckCircle, ExternalLink } from 'lucide-react';

interface ThreatIndicatorsProps {
  analysis: ForensicAnalysis;
}

export const ThreatIndicators: React.FC<ThreatIndicatorsProps> = ({ analysis }) => {
  const { spoofingIndicators, riskScore } = analysis;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-950/80 border-red-500/60 text-red-300';
      case 'high':
        return 'bg-orange-950/80 border-orange-500/60 text-orange-300';
      case 'medium':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
      default:
        return 'bg-blue-950/80 border-blue-500/60 text-blue-300';
    }
  };

  return (
    <div class="space-y-4">
      {/* 1. Spoofing Indicators Section */}
      <div class="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div class="flex items-center gap-2">
            <AlertOctagon class="w-4 h-4 text-red-400" />
            <h3 class="text-sm font-semibold text-slate-100 tracking-wide">
              Identity & Spoofing Indicators
            </h3>
          </div>
          <span class={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
            spoofingIndicators.length > 0
              ? 'bg-red-950 text-red-300 border border-red-500/40'
              : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
          }`}>
            {spoofingIndicators.length} Flagged Anomalies
          </span>
        </div>

        {spoofingIndicators.length === 0 ? (
          <div class="p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
            <CheckCircle class="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>No email address spoofing or header envelope discrepancies detected. From address matches Return-Path and verified signing domains.</span>
          </div>
        ) : (
          <div class="space-y-2.5">
            {spoofingIndicators.map((ind) => (
              <div
                key={ind.id}
                class="p-3 rounded-lg bg-slate-900/60 border border-slate-800/90 hover:border-slate-700 transition-colors"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="text-xs font-semibold text-slate-100">{ind.title}</span>
                  <span class={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold border ${getSeverityBadge(ind.severity)}`}>
                    {ind.severity}
                  </span>
                </div>
                <p class="text-xs text-slate-300 mt-1">{ind.description}</p>
                {ind.evidence && (
                  <div class="mt-2 p-1.5 rounded bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-cyan-300 break-all">
                    <span class="text-slate-500 mr-1">Evidence:</span> {ind.evidence}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. NLP Psychological & Credential Risk Triggers */}
      <div class="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
          <div class="flex items-center gap-2">
            <Zap class="w-4 h-4 text-amber-400" />
            <h3 class="text-sm font-semibold text-slate-100 tracking-wide">
              Heuristic & NLP Risk Triggers
            </h3>
          </div>
          <span class="text-xs font-mono text-slate-400">
            Raw NLP Score: <strong class="text-cyan-400">{riskScore.score}/100</strong>
          </span>
        </div>

        {/* Urgency & Action Badges */}
        <div class="space-y-3">
          {riskScore.urgencyKeywordsFound.length > 0 && (
            <div>
              <div class="text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle class="w-3.5 h-3.5 text-amber-400" />
                <span>Urgency & Panic Inducement Keywords:</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                {riskScore.urgencyKeywordsFound.map((kw, i) => (
                  <span
                    key={i}
                    class="px-2 py-0.5 rounded text-xs font-mono bg-amber-950/60 border border-amber-500/40 text-amber-300"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {riskScore.credentialHarvestingIndicators.length > 0 && (
            <div>
              <div class="text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Key class="w-3.5 h-3.5 text-red-400" />
                <span>Credential / Authentication Harvesters:</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                {riskScore.credentialHarvestingIndicators.map((kw, i) => (
                  <span
                    key={i}
                    class="px-2 py-0.5 rounded text-xs font-mono bg-red-950/60 border border-red-500/40 text-red-300"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {riskScore.actionRequiredKeywords.length > 0 && (
            <div>
              <div class="text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Zap class="w-3.5 h-3.5 text-orange-400" />
                <span>Financial / BEC Wire Keywords:</span>
              </div>
              <div class="flex flex-wrap gap-1.5">
                {riskScore.actionRequiredKeywords.map((kw, i) => (
                  <span
                    key={i}
                    class="px-2 py-0.5 rounded text-xs font-mono bg-orange-950/60 border border-orange-500/40 text-orange-300"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious Links */}
          {riskScore.suspiciousLinks.length > 0 && (
            <div class="pt-2 border-t border-slate-800">
              <div class="text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Link2 class="w-3.5 h-3.5 text-cyan-400" />
                <span>Extracted Hyperlinks ({riskScore.suspiciousLinks.length}):</span>
              </div>
              <div class="space-y-1.5">
                {riskScore.suspiciousLinks.map((link, idx) => (
                  <div
                    key={idx}
                    class="p-2 rounded bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div class="font-mono text-cyan-300 truncate max-w-full sm:max-w-md">
                      {link.display}
                    </div>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300 border border-amber-500/30">
                      {link.reason}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

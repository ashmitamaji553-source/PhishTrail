import React from 'react';
import { ForensicAnalysis } from '../types';
import { AlertOctagon, AlertTriangle, Link2, Key, Zap, CheckCircle } from 'lucide-react';

interface ThreatIndicatorsProps {
  analysis: ForensicAnalysis;
}

export const ThreatIndicators: React.FC<ThreatIndicatorsProps> = ({ analysis }) => {
  const { spoofingIndicators, riskScore } = analysis;

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'bg-rose-500/20 border-rose-500/40 text-rose-200';
      case 'high':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
      case 'medium':
        return 'bg-amber-500/20 border-amber-500/40 text-amber-200';
      default:
        return 'bg-blue-500/20 border-blue-500/40 text-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Spoofing Indicators Section */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#131C31] shadow-sm">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-400" aria-hidden="true" />
            <h3 className="text-base font-semibold text-white">
              Identity & Spoofing Indicators
            </h3>
          </div>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border tabular-nums ${
            spoofingIndicators.length > 0
              ? 'bg-rose-500/20 text-rose-200 border-rose-500/40'
              : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40'
          }`}>
            {spoofingIndicators.length} Flagged {spoofingIndicators.length === 1 ? 'Anomaly' : 'Anomalies'}
          </span>
        </div>

        {spoofingIndicators.length === 0 ? (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs sm:text-sm text-emerald-200">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" aria-hidden="true" />
            <span>No email address spoofing or header envelope discrepancies detected. From address matches Return-Path and verified signing domains.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {spoofingIndicators.map((ind) => (
              <div
                key={ind.id}
                className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-white">{ind.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] uppercase font-semibold border ${getSeverityBadge(ind.severity)}`}>
                    {ind.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{ind.description}</p>
                {ind.evidence && (
                  <div className="mt-2.5 p-2 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 break-all">
                    <span className="text-slate-400 mr-1.5 font-sans font-medium">Evidence:</span>
                    <span>{ind.evidence}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. NLP Psychological & Credential Risk Triggers */}
      <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#131C31] shadow-sm">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2 mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" aria-hidden="true" />
            <h3 className="text-base font-semibold text-white">
              Heuristic &amp; Language Risk Triggers
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Raw NLP Score: <strong className="text-white tabular-nums">{riskScore.score}/100</strong>
          </span>
        </div>

        {/* Urgency & Action Badges */}
        <div className="space-y-4">
          {riskScore.urgencyKeywordsFound.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
                <span>Urgency &amp; Panic Keywords:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {riskScore.urgencyKeywordsFound.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 border border-amber-500/30 text-amber-200"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {riskScore.credentialHarvestingIndicators.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-rose-400" aria-hidden="true" />
                <span>Credential &amp; Login Requests:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {riskScore.credentialHarvestingIndicators.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 border border-rose-500/30 text-rose-200"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {riskScore.actionRequiredKeywords.length > 0 && (
            <div>
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-orange-400" aria-hidden="true" />
                <span>Financial / Wire Transfer Triggers:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {riskScore.actionRequiredKeywords.map((kw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-500/10 border border-orange-500/30 text-orange-200"
                  >
                    "{kw}"
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious Links */}
          {riskScore.suspiciousLinks.length > 0 && (
            <div className="pt-3 border-t border-slate-800">
              <div className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-blue-400" aria-hidden="true" />
                <span>Extracted Hyperlinks ({riskScore.suspiciousLinks.length}):</span>
              </div>
              <div className="space-y-2">
                {riskScore.suspiciousLinks.map((link, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs"
                  >
                    <div className="font-mono text-slate-200 truncate max-w-full sm:max-w-md">
                      {link.display}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-200 border border-amber-500/30">
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


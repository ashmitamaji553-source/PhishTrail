import React, { useState } from 'react';
import { Shield, Radar, FolderArchive, Download, BookmarkPlus, Check, Sparkles, Terminal } from 'lucide-react';
import { ForensicAnalysis } from '../types';

interface HeaderNavProps {
  currentView: 'analyzer' | 'cases';
  onViewChange: (view: 'analyzer' | 'cases') => void;
  caseCount: number;
  currentAnalysis: ForensicAnalysis | null;
  onSaveCase: () => void;
  isCaseSaved: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  onViewChange,
  caseCount,
  currentAnalysis,
  onSaveCase,
  isCaseSaved
}) => {
  const [downloaded, setDownloaded] = useState(false);

  const handleExportCurrent = () => {
    if (!currentAnalysis) return;
    const a = currentAnalysis;
    const reportText = `=====================================================
PHISHTRAILS EMAIL FORENSIC TRACE REPORT
=====================================================
Case ID: ${a.id}
Date: ${a.analyzedAt}
Subject: ${a.subject}
Sender: "${a.from.displayName}" <${a.from.address}>
Domain: ${a.from.domain}
Return-Path: ${a.returnPath || 'N/A'}

FRAUD CONFIDENCE: ${a.fraudConfidence}%
THREAT LEVEL: ${a.riskScore.level}
AI VERDICT: ${a.aiReport?.verdict || 'N/A'}

AUTHENTICATION
-----------------------------------------------------
SPF: ${a.authentication.spf.status} (${a.authentication.spf.detail})
DKIM: ${a.authentication.dkim.status}
DMARC: ${a.authentication.dmarc.status}

ORIGIN GEOLOCATION TRACE
-----------------------------------------------------
Origin IP: ${a.originIp}
Location: ${a.originGeo.city}, ${a.originGeo.region}, ${a.originGeo.country} (${a.originGeo.countryCode})
Coordinates: ${a.originGeo.lat}, ${a.originGeo.lon}
ISP: ${a.originGeo.isp}
ASN: ${a.originGeo.asn}
Reverse DNS: ${a.originGeo.reverseDns}

RELAY HOPS (${a.hops.length} HOPS)
-----------------------------------------------------
${a.hops.map(h => `Hop #${h.hopNumber}: from ${h.fromHost || 'unknown'} [${h.fromIp || 'N/A'}] by ${h.byHost || 'MTA'} (+${h.delaySeconds || 0}s)`).join('\n')}

SPOOFING INDICATORS (${a.spoofingIndicators.length})
-----------------------------------------------------
${a.spoofingIndicators.map(s => `[${s.severity.toUpperCase()}] ${s.title}: ${s.description}`).join('\n')}

NLP THREAT KEYWORDS
-----------------------------------------------------
Urgency Triggers: ${a.riskScore.urgencyKeywordsFound.join(', ') || 'None'}
Credential Harvesting: ${a.riskScore.credentialHarvestingIndicators.join(', ') || 'None'}
Action Requests: ${a.riskScore.actionRequiredKeywords.join(', ') || 'None'}

=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phishtrails-${a.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <header class="w-full border-b border-cyan-900/30 bg-[#040813]/90 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div class="flex items-center gap-3">
          <div class="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-950 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield class="w-5 h-5 text-cyan-400" />
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span class="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400"></span>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <h1 class="text-base font-black tracking-wider text-slate-100 font-mono">
                PHISH<span class="text-cyan-400">TRAILS</span>
              </h1>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-950/80 border border-cyan-500/30 text-cyan-300">
                v1.2-DFIR
              </span>
            </div>
            <p class="text-[11px] text-slate-400">AI Email Threat Detection & Forensic Tracing</p>
          </div>
        </div>

        {/* Center View Mode Switcher */}
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800">
          <button
            id="view-analyzer-tab"
            onClick={() => onViewChange('analyzer')}
            class={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              currentView === 'analyzer'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radar class="w-3.5 h-3.5 text-cyan-400" />
            <span>Forensic Analyzer</span>
          </button>

          <button
            id="view-cases-tab"
            onClick={() => onViewChange('cases')}
            class={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
              currentView === 'cases'
                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderArchive class="w-3.5 h-3.5 text-cyan-400" />
            <span>Case Archive</span>
            <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-cyan-300">
              {caseCount}
            </span>
          </button>
        </div>

        {/* Right Actions */}
        <div class="flex items-center gap-2">
          {currentAnalysis && currentView === 'analyzer' && (
            <>
              <button
                id="save-case-btn"
                onClick={onSaveCase}
                class={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 border transition-all ${
                  isCaseSaved
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-cyan-300'
                }`}
                title="Save Analysis to Case List"
              >
                {isCaseSaved ? <Check class="w-3.5 h-3.5" /> : <BookmarkPlus class="w-3.5 h-3.5" />}
                <span>{isCaseSaved ? 'Saved in Cases' : 'Save Case'}</span>
              </button>

              <button
                id="export-report-btn"
                onClick={handleExportCurrent}
                class="px-3 py-1.5 rounded-lg text-xs font-mono bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 text-cyan-300 flex items-center gap-1.5 transition-colors"
                title="Export Forensic Analysis Report"
              >
                {downloaded ? <Check class="w-3.5 h-3.5 text-emerald-400" /> : <Download class="w-3.5 h-3.5" />}
                <span>{downloaded ? 'Exported' : 'Export DFIR'}</span>
              </button>
            </>
          )}

          {/* Engine Status Pill */}
          <div class="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Sensor Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

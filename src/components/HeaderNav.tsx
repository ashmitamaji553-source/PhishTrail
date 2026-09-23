import React, { useState } from 'react';
import { Shield, Radar, FolderArchive, Download, BookmarkPlus, Check } from 'lucide-react';
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
    <header className="w-full border-b border-slate-800 bg-[#0F172A] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400">
            <Shield className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">
              PhishTrails
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
              Email Threat & Forensic Analyzer
            </span>
          </div>
        </div>

        {/* Zone 2: View Switcher Tabs */}
        <nav className="flex items-center p-1 rounded-lg bg-slate-900 border border-slate-800" aria-label="Main Navigation">
          <button
            id="view-analyzer-tab"
            type="button"
            onClick={() => onViewChange('analyzer')}
            className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors ${
              currentView === 'analyzer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <Radar className="w-4 h-4" aria-hidden="true" />
            <span>Analyzer</span>
          </button>

          <button
            id="view-cases-tab"
            type="button"
            onClick={() => onViewChange('cases')}
            className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors ${
              currentView === 'cases'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
            }`}
          >
            <FolderArchive className="w-4 h-4" aria-hidden="true" />
            <span>Saved Cases</span>
            <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold tabular-nums bg-slate-800 text-slate-300">
              {caseCount}
            </span>
          </button>
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2">
          {currentAnalysis && currentView === 'analyzer' && (
            <>
              <button
                id="save-case-btn"
                type="button"
                onClick={onSaveCase}
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 border transition-colors ${
                  isCaseSaved
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                }`}
                title="Save Analysis to Case List"
              >
                {isCaseSaved ? (
                  <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <BookmarkPlus className="w-4 h-4 text-slate-400" aria-hidden="true" />
                )}
                <span>{isCaseSaved ? 'Saved' : 'Save Case'}</span>
              </button>

              <button
                id="export-report-btn"
                type="button"
                onClick={handleExportCurrent}
                className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Export Forensic Analysis Report"
              >
                {downloaded ? (
                  <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                ) : (
                  <Download className="w-4 h-4 text-slate-400" aria-hidden="true" />
                )}
                <span>{downloaded ? 'Exported' : 'Export Report'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};


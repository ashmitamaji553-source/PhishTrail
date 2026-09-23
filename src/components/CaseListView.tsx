import React, { useState } from 'react';
import { CaseRecord, CaseStatus, ForensicAnalysis } from '../types';
import {
  FolderArchive,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Filter
} from 'lucide-react';

interface CaseListViewProps {
  cases: CaseRecord[];
  activeCaseId?: string;
  onSelectCase: (analysis: ForensicAnalysis) => void;
  onUpdateCaseStatus: (id: string, status: CaseStatus, notes?: string) => void;
  onDeleteCase: (id: string) => void;
  onClose: () => void;
}

export const CaseListView: React.FC<CaseListViewProps> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onUpdateCaseStatus,
  onDeleteCase,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.originIp.includes(searchQuery) ||
      c.originCountry.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: CaseStatus) => {
    switch (status) {
      case 'confirmed_phish':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
      case 'investigating':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'false_positive':
        return 'bg-blue-500/15 border-blue-500/30 text-blue-300';
      case 'resolved':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
      case 'open':
      default:
        return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const exportReport = (record: CaseRecord) => {
    const a = record.analysis;
    const reportText = `=====================================================
PHISHTRAILS FORENSIC INCIDENT INVESTIGATION REPORT
=====================================================
Case ID: ${record.id}
Created: ${record.createdAt}
Investigator Status: ${record.status.toUpperCase()}
Analyst Notes: ${record.analystNotes || 'None'}

THREAT VERDICT & SUMMARY
-----------------------------------------------------
Fraud Confidence Score: ${record.fraudConfidence}%
Threat Classification: ${a.aiReport?.threatCategory || record.threatLevel}
AI / Heuristic Verdict: ${a.aiReport?.verdict || 'N/A'}
Incident Summary: ${a.aiReport?.summary || 'No summary'}

ENVELOPE METADATA
-----------------------------------------------------
Subject: ${record.subject}
From: ${record.sender}
Return-Path: ${a.returnPath || 'N/A'}
Reply-To: ${a.replyTo || 'N/A'}
To: ${a.to}
Date: ${a.date}
Message-ID: ${a.messageId}

ORIGIN GEOLOCATION
-----------------------------------------------------
Origin IP: ${record.originIp}
Country: ${record.originCountry} (${a.originGeo.countryCode})
City/Region: ${a.originGeo.city}, ${a.originGeo.region}
ISP: ${record.originIsp}
ASN: ${a.originGeo.asn}
Reverse DNS: ${a.originGeo.reverseDns}

AUTHENTICATION VERDICTS
-----------------------------------------------------
SPF: ${a.authentication.spf.status.toUpperCase()} (${a.authentication.spf.detail})
DKIM: ${a.authentication.dkim.status.toUpperCase()}
DMARC: ${a.authentication.dmarc.status.toUpperCase()}

SPOOFING ANOMALIES (${a.spoofingIndicators.length})
-----------------------------------------------------
${a.spoofingIndicators.map(ind => `[${ind.severity.toUpperCase()}] ${ind.title}: ${ind.description} (Evidence: ${ind.evidence})`).join('\n')}

RELAY HOPS CHAIN (${a.hops.length} HOPS)
-----------------------------------------------------
${a.hops.map(h => `Hop #${h.hopNumber}: from ${h.fromHost || 'unknown'} [${h.fromIp || 'N/A'}] by ${h.byHost || 'MTA'} (+${h.delaySeconds || 0}s)`).join('\n')}

RECOMMENDED MITIGATION ACTIONS
-----------------------------------------------------
${(a.aiReport?.recommendedActions || []).map((action, i) => `${i + 1}. ${action}`).join('\n')}

=====================================================
END OF PHISHTRAILS DFIR EXPORT
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `phish-report-${record.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#131C31] shadow-sm">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FolderArchive className="w-5 h-5 text-blue-400" aria-hidden="true" />
          <h2 className="text-base font-semibold text-white">
            Saved Forensic Cases
          </h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 tabular-nums">
            {cases.length} Total
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
        >
          Return to Analysis
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, sender, IP or country..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" aria-hidden="true" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="confirmed_phish">Confirmed Phish</option>
            <option value="false_positive">False Positive</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-800">
        {filteredCases.length === 0 ? (
          <div className="p-8 text-center text-xs sm:text-sm text-slate-400">
            No investigated cases match your query. Analyze an email and click "Save Case" to record findings here.
          </div>
        ) : (
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">Subject &amp; Sender</th>
                <th className="p-3 font-semibold">Threat Score</th>
                <th className="p-3 font-semibold">Origin Network</th>
                <th className="p-3 font-semibold">Case Status</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredCases.map((rec) => {
                const isActive = activeCaseId === rec.id;
                return (
                  <tr
                    key={rec.id}
                    className={`transition-colors ${
                      isActive ? 'bg-blue-950/30' : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-3 max-w-[280px]">
                      <div className="font-semibold text-white truncate" title={rec.subject}>
                        {rec.subject}
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5" title={rec.sender}>
                        {rec.sender}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold tabular-nums ${
                            rec.fraudConfidence >= 75
                              ? 'text-rose-400'
                              : rec.fraudConfidence >= 45
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {rec.fraudConfidence}%
                        </span>
                        <span className="text-[11px] text-slate-400 uppercase font-medium">({rec.threatLevel})</span>
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="text-white font-mono text-xs">{rec.originIp}</div>
                      <div className="text-xs text-slate-400 truncate max-w-[160px]">
                        {rec.originCountry} · {rec.originIsp}
                      </div>
                    </td>

                    <td className="p-3">
                      <select
                        value={rec.status}
                        onChange={(e) => onUpdateCaseStatus(rec.id, e.target.value as CaseStatus)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border ${getStatusBadge(
                          rec.status
                        )} cursor-pointer focus:outline-none`}
                      >
                        <option value="open">Open</option>
                        <option value="investigating">Investigating</option>
                        <option value="confirmed_phish">Confirmed Phish</option>
                        <option value="false_positive">False Positive</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </td>

                    <td className="p-3 text-slate-400 text-xs whitespace-nowrap">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectCase(rec.analysis)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Open Case in Dashboard"
                          aria-label="Open Case in Dashboard"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => exportReport(rec)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                          title="Export Incident Report"
                          aria-label="Export Incident Report"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteCase(rec.id)}
                          className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete Case"
                          aria-label="Delete Case"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};


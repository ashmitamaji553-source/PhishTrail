import React, { useState } from 'react';
import { CaseRecord, CaseStatus, ForensicAnalysis } from '../types';
import {
  FolderArchive,
  Search,
  Trash2,
  ExternalLink,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  AlertOctagon,
  FileText,
  ShieldAlert,
  ArrowUpDown
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
  const [selectedCaseForNotes, setSelectedCaseForNotes] = useState<CaseRecord | null>(null);
  const [notesInput, setNotesInput] = useState('');

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
        return 'bg-red-950/80 border-red-500/60 text-red-300';
      case 'investigating':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
      case 'false_positive':
        return 'bg-blue-950/80 border-blue-500/60 text-blue-300';
      case 'resolved':
        return 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
      case 'open':
      default:
        return 'bg-slate-900 border-slate-700 text-slate-300';
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
    <div class="p-5 rounded-2xl border border-cyan-900/40 bg-[#060c18] shadow-2xl backdrop-blur-md">
      {/* Header Bar */}
      <div class="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div class="flex items-center gap-2">
          <FolderArchive class="w-5 h-5 text-cyan-400" />
          <h2 class="text-base font-bold text-slate-100 font-mono tracking-wide">
            Investigated Cases & Saved Telemetry
          </h2>
          <span class="px-2 py-0.5 rounded-full text-xs font-mono bg-cyan-950 border border-cyan-500/40 text-cyan-300">
            {cases.length} Total
          </span>
        </div>

        <button
          onClick={onClose}
          class="px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
        >
          Return to Analyzer
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div class="relative flex-1 min-w-[240px]">
          <Search class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by subject, sender, IP or country..."
            class="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
        </div>

        <div class="flex items-center gap-2">
          <Filter class="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            class="px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50 font-mono"
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

      {/* Cases Table / Cards */}
      <div class="mt-4 overflow-x-auto rounded-xl border border-slate-800/80">
        {filteredCases.length === 0 ? (
          <div class="p-8 text-center text-xs text-slate-500 font-mono">
            No investigated cases matching query. Run an analysis and save it to this case log.
          </div>
        ) : (
          <table class="w-full text-left text-xs font-mono">
            <thead class="bg-slate-900/90 text-slate-400 border-b border-slate-800">
              <tr>
                <th class="p-3">Subject & Sender</th>
                <th class="p-3">Threat Confidence</th>
                <th class="p-3">Origin Network</th>
                <th class="p-3">Status</th>
                <th class="p-3">Date</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/50">
              {filteredCases.map((rec) => {
                const isActive = activeCaseId === rec.id;
                return (
                  <tr
                    key={rec.id}
                    class={`transition-colors ${
                      isActive ? 'bg-cyan-950/30' : 'hover:bg-slate-900/40'
                    }`}
                  >
                    <td class="p-3 max-w-[280px]">
                      <div class="font-semibold text-slate-100 truncate" title={rec.subject}>
                        {rec.subject}
                      </div>
                      <div class="text-[11px] text-slate-400 truncate mt-0.5" title={rec.sender}>
                        {rec.sender}
                      </div>
                    </td>

                    <td class="p-3">
                      <div class="flex items-center gap-2">
                        <span
                          class={`font-bold font-mono ${
                            rec.fraudConfidence >= 75
                              ? 'text-red-400'
                              : rec.fraudConfidence >= 45
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {rec.fraudConfidence}%
                        </span>
                        <span class="text-[10px] text-slate-500">({rec.threatLevel})</span>
                      </div>
                    </td>

                    <td class="p-3">
                      <div class="text-cyan-300 font-semibold">{rec.originIp}</div>
                      <div class="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {rec.originCountry} • {rec.originIsp}
                      </div>
                    </td>

                    <td class="p-3">
                      <select
                        value={rec.status}
                        onChange={(e) => onUpdateCaseStatus(rec.id, e.target.value as CaseStatus)}
                        class={`px-2 py-1 rounded text-[11px] font-mono border ${getStatusBadge(
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

                    <td class="p-3 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(rec.createdAt).toLocaleDateString()}
                    </td>

                    <td class="p-3 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectCase(rec.analysis)}
                          class="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Open Case in Dashboard"
                        >
                          <ExternalLink class="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => exportReport(rec)}
                          class="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-cyan-300 transition-colors"
                          title="Export Incident Report"
                        >
                          <Download class="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteCase(rec.id)}
                          class="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete Case"
                        >
                          <Trash2 class="w-4 h-4" />
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

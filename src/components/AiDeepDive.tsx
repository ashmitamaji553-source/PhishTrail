import React, { useState } from 'react';
import { ForensicAnalysis, AiForensicReport } from '../types';
import { Sparkles, ShieldAlert, Cpu, Terminal, Copy, Check, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AiDeepDiveProps {
  analysis: ForensicAnalysis;
  onUpdateAnalysis?: (updated: ForensicAnalysis) => void;
}

export const AiDeepDive: React.FC<AiDeepDiveProps> = ({ analysis, onUpdateAnalysis }) => {
  const [loading, setLoading] = useState(false);
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const report = analysis.aiReport;

  const handleRunAiAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ analysis })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.report && onUpdateAnalysis) {
        onUpdateAnalysis({
          ...analysis,
          aiReport: data.report
        });
      }
    } catch (err: any) {
      console.error('Failed to trigger AI deep dive:', err);
      setError(err?.message || 'Failed to communicate with AI threat intelligence');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIoc(label);
    setTimeout(() => setCopiedIoc(null), 2000);
  };

  return (
    <div class="p-4 rounded-xl border border-cyan-900/40 bg-gradient-to-b from-[#081226] to-[#040813] shadow-xl">
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
            <Sparkles class="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <h3 class="text-sm font-semibold text-slate-100 flex items-center gap-2">
              AI Threat Intelligence & Incident Response
            </h3>
            <p class="text-[11px] text-slate-400">Forensic reasoning, MITRE tactics & actionable containment steps</p>
          </div>
        </div>

        <button
          id="trigger-ai-deep-dive-btn"
          onClick={handleRunAiAnalysis}
          disabled={loading}
          class="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <RefreshCw class="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Analyzing Threat Model...</span>
            </>
          ) : (
            <>
              <Cpu class="w-3.5 h-3.5 text-cyan-400" />
              <span>Deep Analysis (Gemini)</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div class="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle class="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {report ? (
        <div class="space-y-4">
          {/* Verdict Banner */}
          <div class="p-3.5 rounded-lg bg-slate-900/80 border border-cyan-900/60 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span class="text-[10px] uppercase font-mono tracking-wider text-slate-400">AI Threat Classification</span>
              <div class="text-sm font-bold text-cyan-300 mt-0.5">{report.threatCategory}</div>
            </div>
            <div class="px-3 py-1 rounded-md text-xs font-mono font-bold uppercase bg-cyan-950/90 border border-cyan-500/40 text-cyan-300">
              {report.verdict}
            </div>
          </div>

          {/* Forensic Summary */}
          <div class="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-lg border border-slate-800">
            <span class="font-mono text-cyan-400 font-semibold uppercase text-[11px] block mb-1">Incident Summary:</span>
            {report.summary}
          </div>

          {/* MITRE ATT&CK & IOCs Grid */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* MITRE ATT&CK */}
            <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <span class="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
                MITRE ATT&CK Mapping
              </span>
              <div class="flex flex-wrap gap-1.5">
                {report.mitreTactics.map((tac, i) => (
                  <span
                    key={i}
                    class="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-900 text-cyan-300 border border-cyan-900/60"
                  >
                    {tac}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted IOCs */}
            <div class="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  Extracted Indicators of Compromise (IOCs)
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      [
                        ...(report.iocs.ips || []),
                        ...(report.iocs.domains || []),
                        ...(report.iocs.senders || [])
                      ].join('\n'),
                      'all-iocs'
                    )
                  }
                  class="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                >
                  {copiedIoc === 'all-iocs' ? <Check class="w-3 h-3 text-emerald-400" /> : <Copy class="w-3 h-3" />}
                  <span>Copy All</span>
                </button>
              </div>

              <div class="space-y-1.5 text-xs font-mono">
                {report.iocs.ips.map(ip => (
                  <div key={ip} class="flex items-center justify-between text-slate-300 bg-slate-900/90 px-2 py-1 rounded">
                    <span>IP: <strong class="text-cyan-300">{ip}</strong></span>
                    <button
                      onClick={() => copyToClipboard(ip, ip)}
                      class="text-slate-500 hover:text-cyan-300"
                      title="Copy IP"
                    >
                      {copiedIoc === ip ? <Check class="w-3 h-3 text-emerald-400" /> : <Copy class="w-3 h-3" />}
                    </button>
                  </div>
                ))}
                {report.iocs.domains.map(dom => (
                  <div key={dom} class="flex items-center justify-between text-slate-300 bg-slate-900/90 px-2 py-1 rounded">
                    <span>Domain: <strong class="text-amber-300">{dom}</strong></span>
                    <button
                      onClick={() => copyToClipboard(dom, dom)}
                      class="text-slate-500 hover:text-cyan-300"
                      title="Copy Domain"
                    >
                      {copiedIoc === dom ? <Check class="w-3 h-3 text-emerald-400" /> : <Copy class="w-3 h-3" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Incident Response Actions */}
          <div class="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/20">
            <span class="text-[11px] font-mono text-cyan-400 uppercase tracking-wider block mb-2">
              Recommended SOC Containment Actions
            </span>
            <ul class="space-y-1.5 text-xs text-slate-300">
              {report.recommendedActions.map((act, i) => (
                <li key={i} class="flex items-start gap-2">
                  <CheckCircle2 class="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div class="p-6 text-center text-xs text-slate-400">
          Click "Deep Analysis (Gemini)" to generate full incident response intelligence.
        </div>
      )}
    </div>
  );
};

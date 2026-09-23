import React, { useState } from 'react';
import { ForensicAnalysis } from '../types';
import { Sparkles, Cpu, Copy, Check, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

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
    <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#131C31] shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-4 h-4" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">
              Threat Intelligence &amp; Response Guidance
            </h3>
            <p className="text-xs text-slate-400">MITRE ATT&amp;CK tactics and actionable incident response steps</p>
          </div>
        </div>

        <button
          id="trigger-ai-deep-dive-btn"
          type="button"
          onClick={handleRunAiAnalysis}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-50 shadow-sm cursor-pointer"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Analyzing Threat...</span>
            </>
          ) : (
            <>
              <Cpu className="w-4 h-4" aria-hidden="true" />
              <span>{report ? 'Re-analyze with AI' : 'Deep Analysis'}</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {report ? (
        <div className="space-y-4">
          {/* Verdict Banner */}
          <div className="p-4 rounded-lg bg-slate-900 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400">Threat Classification</span>
              <div className="text-base font-bold text-white mt-0.5">{report.threatCategory}</div>
            </div>
            <div className="px-3 py-1 rounded-md text-xs font-semibold uppercase bg-slate-800 border border-slate-700 text-blue-300">
              {report.verdict}
            </div>
          </div>

          {/* Forensic Summary */}
          <div className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900 p-4 rounded-lg border border-slate-800">
            <span className="font-semibold text-white uppercase text-xs tracking-wider block mb-1.5">Executive Summary:</span>
            {report.summary}
          </div>

          {/* MITRE ATT&CK & IOCs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* MITRE ATT&CK */}
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xs font-semibold text-white uppercase tracking-wider block mb-2.5">
                MITRE ATT&amp;CK Mapping
              </span>
              <div className="flex flex-wrap gap-2">
                {report.mitreTactics.map((tac, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    {tac}
                  </span>
                ))}
              </div>
            </div>

            {/* Extracted IOCs */}
            <div className="p-4 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-semibold text-white uppercase tracking-wider">
                  Indicators of Compromise (IOCs)
                </span>
                <button
                  type="button"
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
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {copiedIoc === 'all-iocs' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIoc === 'all-iocs' ? 'Copied' : 'Copy All'}</span>
                </button>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                {report.iocs.ips.map(ip => (
                  <div key={ip} className="flex items-center justify-between text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                    <span>IP: <strong className="text-white">{ip}</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(ip, ip)}
                      className="text-slate-400 hover:text-white"
                      title="Copy IP"
                    >
                      {copiedIoc === ip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
                {report.iocs.domains.map(dom => (
                  <div key={dom} className="flex items-center justify-between text-slate-300 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800">
                    <span>Domain: <strong className="text-amber-200">{dom}</strong></span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(dom, dom)}
                      className="text-slate-400 hover:text-white"
                      title="Copy Domain"
                    >
                      {copiedIoc === dom ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Incident Response Actions */}
          <div className="p-4 rounded-lg bg-blue-950/20 border border-blue-500/20">
            <span className="text-xs font-semibold text-blue-300 uppercase tracking-wider block mb-2.5">
              Recommended Containment &amp; Next Steps
            </span>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-200">
              {report.recommendedActions.map((act, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{act}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-xs sm:text-sm text-slate-400">
          Click "Deep Analysis" to generate threat modeling and incident response intelligence.
        </div>
      )}
    </div>
  );
};


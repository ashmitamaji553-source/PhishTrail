import React, { useState } from 'react';
import { ForensicAnalysis } from '../types';
import { FileText, Copy, Check, Search, Eye } from 'lucide-react';

interface HeadersInspectorProps {
  analysis: ForensicAnalysis;
}

export const HeadersInspector: React.FC<HeadersInspectorProps> = ({ analysis }) => {
  const [activeTab, setActiveTab] = useState<'parsed' | 'raw' | 'body'>('parsed');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract key parsed headers
  const envelopeFields = [
    { label: 'Subject', value: analysis.subject },
    { label: 'From (Display Name)', value: analysis.from.displayName },
    { label: 'From (Address)', value: analysis.from.address },
    { label: 'From (Domain)', value: analysis.from.domain },
    { label: 'To', value: analysis.to },
    { label: 'Return-Path', value: analysis.returnPath || 'None specified' },
    { label: 'Reply-To', value: analysis.replyTo || 'None specified' },
    { label: 'Date', value: analysis.date },
    { label: 'Message-ID', value: analysis.messageId || 'None specified' },
    { label: 'Originating IP', value: `${analysis.originIp} (${analysis.originGeo.city}, ${analysis.originGeo.country})` }
  ];

  const filteredFields = envelopeFields.filter(
    f => f.label.toLowerCase().includes(searchQuery.toLowerCase()) || f.value.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div class="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      {/* Tab Navigation */}
      <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80 mb-3">
        <div class="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('parsed')}
            class={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'parsed'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Parsed Fields
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            class={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'raw'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Headers (RFC 5322)
          </button>
          <button
            onClick={() => setActiveTab('body')}
            class={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeTab === 'body'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Email Body Excerpt
          </button>
        </div>

        <button
          onClick={() =>
            copyToClipboard(
              activeTab === 'raw'
                ? analysis.rawHeaders
                : activeTab === 'body'
                ? analysis.bodySnippet
                : JSON.stringify(envelopeFields, null, 2)
            )
          }
          class="px-2.5 py-1.5 rounded-md text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center gap-1.5"
        >
          {copied ? <Check class="w-3.5 h-3.5 text-emerald-400" /> : <Copy class="w-3.5 h-3.5 text-cyan-400" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Tab: Parsed Envelope Fields */}
      {activeTab === 'parsed' && (
        <div class="space-y-3">
          <div class="relative">
            <Search class="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter headers (e.g. subject, return-path, domain)..."
              class="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
            />
          </div>

          <div class="overflow-x-auto rounded-lg border border-slate-800/80">
            <table class="w-full text-left text-xs font-mono">
              <thead class="bg-slate-900/90 text-slate-400 border-b border-slate-800">
                <tr>
                  <th class="p-2.5 w-1/3">Header Field</th>
                  <th class="p-2.5">Extracted Value</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/50">
                {filteredFields.map((field, idx) => (
                  <tr key={idx} class="hover:bg-slate-900/40">
                    <td class="p-2.5 text-slate-400 font-semibold">{field.label}</td>
                    <td class="p-2.5 text-cyan-300 break-all">{field.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Raw Headers */}
      {activeTab === 'raw' && (
        <div class="relative">
          <pre class="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-200/90 overflow-x-auto max-h-[380px] leading-relaxed whitespace-pre-wrap">
            {analysis.rawHeaders || 'No raw header section recorded.'}
          </pre>
        </div>
      )}

      {/* Tab: Email Body Excerpt */}
      {activeTab === 'body' && (
        <div class="relative">
          <pre class="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed whitespace-pre-wrap">
            {analysis.bodySnippet || 'No email body text provided or file contained headers only.'}
          </pre>
        </div>
      )}
    </div>
  );
};

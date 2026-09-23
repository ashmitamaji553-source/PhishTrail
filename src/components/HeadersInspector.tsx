import React, { useState } from 'react';
import { ForensicAnalysis } from '../types';
import { FileText, Copy, Check, Search } from 'lucide-react';

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
    <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#131C31] shadow-sm">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('parsed')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'parsed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Parsed Fields
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'raw'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Headers (RFC 5322)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('body')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors ${
              activeTab === 'body'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Email Body Excerpt
          </button>
        </div>

        <button
          type="button"
          onClick={() =>
            copyToClipboard(
              activeTab === 'raw'
                ? analysis.rawHeaders
                : activeTab === 'body'
                ? analysis.bodySnippet
                : JSON.stringify(envelopeFields, null, 2)
            )
          }
          className="px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" aria-hidden="true" /> : <Copy className="w-4 h-4 text-slate-400" aria-hidden="true" />}
          <span>{copied ? 'Copied' : 'Copy Content'}</span>
        </button>
      </div>

      {/* Tab: Parsed Envelope Fields */}
      {activeTab === 'parsed' && (
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter headers (e.g. subject, return-path, domain)..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-900 text-slate-300 border-b border-slate-800">
                <tr>
                  <th className="p-3 w-1/3 font-semibold">Header Field</th>
                  <th className="p-3 font-semibold">Extracted Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredFields.map((field, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition-colors">
                    <td className="p-3 text-slate-400 font-medium">{field.label}</td>
                    <td className="p-3 font-mono text-white text-xs break-all">{field.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Raw Headers */}
      {activeTab === 'raw' && (
        <div className="relative">
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed whitespace-pre-wrap selection:bg-blue-600/30">
            {analysis.rawHeaders || 'No raw header section recorded.'}
          </pre>
        </div>
      )}

      {/* Tab: Email Body Excerpt */}
      {activeTab === 'body' && (
        <div className="relative">
          <pre className="p-4 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 overflow-x-auto max-h-[380px] leading-relaxed whitespace-pre-wrap selection:bg-blue-600/30">
            {analysis.bodySnippet || 'No email body text provided or file contained headers only.'}
          </pre>
        </div>
      )}
    </div>
  );
};


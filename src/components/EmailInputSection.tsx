import React, { useState, useRef } from 'react';
import { SAMPLE_EMAILS, SampleEmail } from '../utils/sampleEmails';
import { Upload, Play, RotateCcw, HelpCircle, ChevronDown, ChevronUp, Lightbulb, ShieldAlert, Sparkles, Compass } from 'lucide-react';

interface EmailInputSectionProps {
  onAnalyze: (rawEmail: string) => void;
  isAnalyzing: boolean;
}

export const EmailInputSection: React.FC<EmailInputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_EMAILS[0].rawText);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_EMAILS[0].id);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [showLearningClues, setShowLearningClues] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedSample = SAMPLE_EMAILS.find(s => s.id === selectedSampleId);

  const handleSelectSample = (sample: SampleEmail) => {
    setSelectedSampleId(sample.id);
    setInputText(sample.rawText);
    setFileName(null);
  };

  const handleFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    setSelectedSampleId('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInputText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleManualSubmit = () => {
    if (!inputText.trim()) return;
    onAnalyze(inputText);
  };

  const handleClear = () => {
    setInputText('');
    setFileName(null);
    setSelectedSampleId('');
  };

  const filteredSamples = activeCategory === 'all'
    ? SAMPLE_EMAILS
    : SAMPLE_EMAILS.filter(s => s.category === activeCategory);

  const categories = [
    { id: 'all', label: 'All Cases', count: SAMPLE_EMAILS.length },
    { id: 'bec', label: 'CEO & Payroll BEC', count: SAMPLE_EMAILS.filter(s => s.category === 'bec').length },
    { id: 'credential_harvest', label: 'Credential Theft', count: SAMPLE_EMAILS.filter(s => s.category === 'credential_harvest').length },
    { id: 'qr_code_phish', label: 'Quishing / QR Phish', count: SAMPLE_EMAILS.filter(s => s.category === 'qr_code_phish').length },
    { id: 'malware_delivery', label: 'Malware Stagers', count: SAMPLE_EMAILS.filter(s => s.category === 'malware_delivery').length },
    { id: 'financial_fraud', label: 'Bank Fraud', count: SAMPLE_EMAILS.filter(s => s.category === 'financial_fraud').length },
    { id: 'legitimate', label: 'Legitimate / Clean', count: SAMPLE_EMAILS.filter(s => s.category === 'legitimate').length }
  ];

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-slate-800 bg-[#131C31] shadow-sm">
      {/* Header and Quick Guidance */}
      <div className="flex flex-col gap-3 pb-4 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" aria-hidden="true" />
              <h2 className="text-base sm:text-lg font-semibold text-white">
                Forensic Case Lab &amp; Email Analyzer
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Select an investigative case scenario below, or paste and upload raw .eml / RFC 5322 email headers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1.5 py-1 px-2.5 rounded-md hover:bg-blue-600/10 transition-colors"
          >
            <HelpCircle className="w-4 h-4" aria-hidden="true" />
            <span>How to extract headers in email clients</span>
            {showGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Quick Guide */}
        {showGuide && (
          <div className="mt-2 p-4 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-300 space-y-2">
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider">
              Extracting raw email headers in common email clients:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60">
                <span className="font-semibold text-blue-400 block mb-1">Gmail</span>
                <p>Open email &gt; Click the 3 dots (More) next to Reply &gt; Select <strong>"Show original"</strong> &gt; Click <strong>"Copy to clipboard"</strong>.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60">
                <span className="font-semibold text-blue-400 block mb-1">Microsoft Outlook</span>
                <p>Open message &gt; Click <strong>File &gt; Properties</strong> &gt; Copy text from the <strong>"Internet headers"</strong> box at the bottom.</p>
              </div>
              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700/60">
                <span className="font-semibold text-blue-400 block mb-1">Apple Mail</span>
                <p>Open email &gt; Click <strong>View &gt; Message &gt; Raw Source</strong> &gt; Press <strong>Cmd + A</strong> and <strong>Cmd + C</strong> to copy.</p>
              </div>
            </div>
          </div>
        )}

        {/* Interactive Case Lab Category Filters */}
        <div className="pt-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Simulated Forensic Test Scenarios ({SAMPLE_EMAILS.length}):</span>
            </span>

            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Test Case Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {filteredSamples.map((sample) => {
              const isSelected = selectedSampleId === sample.id;
              const diffBadge = sample.difficulty === 'Subtle & Advanced'
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : sample.difficulty === 'Medium'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-blue-500/10 text-blue-300 border-blue-500/30';

              return (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => handleSelectSample(sample)}
                  className={`p-3 rounded-lg text-left border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500 ring-1 ring-blue-500 shadow-md'
                      : 'bg-slate-900/80 border-slate-700/80 hover:bg-slate-900 hover:border-slate-600'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 truncate max-w-[120px]">
                        {sample.badge}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${diffBadge}`}>
                        {sample.difficulty}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-white leading-snug line-clamp-2">
                      {sample.title}
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                    {sample.description}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Test Case Inspector Banner */}
          {selectedSample && (
            <div className="mt-3 p-3.5 rounded-lg bg-slate-900/90 border border-slate-700 text-xs text-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Active Case Scenario:</span>
                  <span className="text-blue-400 font-medium">{selectedSample.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLearningClues(!showLearningClues)}
                  className="text-[11px] font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>{showLearningClues ? 'Hide Detective Clues' : 'Show Detective Clues'}</span>
                </button>
              </div>

              <p className="mt-2 text-slate-300 leading-relaxed">
                {selectedSample.scenario}
              </p>

              {showLearningClues && selectedSample.learningClues && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/80">
                  <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider block mb-1.5">
                    What to look for in this trace:
                  </span>
                  <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                    {selectedSample.learningClues.map((clue, idx) => (
                      <li key={idx} className="p-2 rounded bg-slate-950/70 border border-slate-800 flex items-start gap-1.5">
                        <span className="text-amber-400 font-bold">#{idx + 1}</span>
                        <span>{clue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Drag & Drop / Text Input */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Upload Box */}
        <div className="lg:col-span-1">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer h-full min-h-[170px] p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-950/20 text-blue-200'
                : 'border-slate-700 bg-slate-900/60 text-slate-400 hover:border-blue-500 hover:text-slate-200'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".eml,.txt,.msg"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-2 text-blue-400">
              <Upload className="w-5 h-5" aria-hidden="true" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              {fileName ? fileName : 'Upload .eml or .txt'}
            </span>
            <span className="text-[11px] text-slate-400 mt-1 max-w-[160px]">
              Drag &amp; drop file here, or click to browse
            </span>
          </div>
        </div>

        {/* Text Area */}
        <div className="lg:col-span-3 flex flex-col">
          <div className="relative flex-1">
            <textarea
              id="raw-email-textarea"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSelectedSampleId('');
              }}
              rows={8}
              aria-label="Raw email headers or message text"
              placeholder="Paste RFC 5322 raw headers here (Received: from ..., From: ..., Subject: ...)"
              className="w-full h-full min-h-[170px] p-3.5 rounded-lg bg-slate-900 border border-slate-700 text-xs sm:text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-y"
            />
          </div>

          {/* Action Row */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="tabular-nums">{inputText.split('\n').length} lines</span>
              <span>·</span>
              <span className="tabular-nums">{inputText.length} characters</span>
              {fileName && (
                <>
                  <span>·</span>
                  <span className="text-blue-400 font-medium truncate max-w-[200px]">
                    {fileName}
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                id="clear-input-btn"
                type="button"
                onClick={handleClear}
                className="px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Clear</span>
              </button>

              <button
                id="run-analysis-btn"
                type="button"
                onClick={handleManualSubmit}
                disabled={isAnalyzing || !inputText.trim()}
                className="px-5 py-2 rounded-lg text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Email...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                    <span>Run Forensic Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


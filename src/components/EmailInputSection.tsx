import React, { useState, useRef } from 'react';
import { SAMPLE_EMAILS, SampleEmail } from '../utils/sampleEmails';
import { Upload, FileCode, Play, RotateCcw, AlertTriangle, CheckCircle2, Shield } from 'lucide-react';

interface EmailInputSectionProps {
  onAnalyze: (rawEmail: string) => void;
  isAnalyzing: boolean;
}

export const EmailInputSection: React.FC<EmailInputSectionProps> = ({ onAnalyze, isAnalyzing }) => {
  const [inputText, setInputText] = useState<string>(SAMPLE_EMAILS[0].rawText);
  const [selectedSampleId, setSelectedSampleId] = useState<string>(SAMPLE_EMAILS[0].id);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <div class="p-5 rounded-2xl border border-cyan-900/40 bg-gradient-to-b from-[#081226]/80 to-[#040813]/90 shadow-2xl backdrop-blur-md">
      {/* Top Banner with Sample Selector */}
      <div class="flex flex-col gap-3 pb-4 border-b border-slate-800/80">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <FileCode class="w-4 h-4 text-cyan-400" />
            <h2 class="text-sm font-semibold text-slate-100 tracking-wide uppercase font-mono">
              Input Raw .EML or Email Headers
            </h2>
          </div>
          <span class="text-[11px] font-mono text-slate-400">
            Paste raw headers, drop a file, or test a threat sample below
          </span>
        </div>

        {/* Sample Chips */}
        <div class="flex flex-wrap gap-2 pt-1">
          {SAMPLE_EMAILS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample)}
              class={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-2 transition-all ${
                selectedSampleId === sample.id
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{sample.title}</span>
              <span class={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${sample.badgeColor}`}>
                {sample.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Drag & Drop / Text Input */}
      <div class="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Drag & Drop Zone */}
        <div class="lg:col-span-1 flex flex-col justify-between">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            class={`cursor-pointer h-full min-h-[160px] p-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-cyan-700 hover:text-cyan-300'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept=".eml,.txt,.msg"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              class="hidden"
            />
            <div class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-2">
              <Upload class="w-5 h-5 text-cyan-400" />
            </div>
            <span class="text-xs font-medium text-slate-200">
              {fileName ? fileName : 'Upload .EML / .TXT'}
            </span>
            <span class="text-[10px] text-slate-500 mt-1">
              Drag & drop raw message file or click to browse
            </span>
          </div>
        </div>

        {/* Right Column: Raw Text Editor */}
        <div class="lg:col-span-3 flex flex-col">
          <div class="relative flex-1">
            <textarea
              id="raw-email-textarea"
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSelectedSampleId('');
              }}
              rows={8}
              placeholder="Paste raw email RFC 5322 text or headers here (Received: from ..., From: ..., Subject: ...)"
              class="w-full h-full min-h-[180px] p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 resize-y"
            />
          </div>

          {/* Action Bar */}
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Lines: {inputText.split('\n').length}</span>
              <span>•</span>
              <span>Characters: {inputText.length}</span>
              {fileName && <span class="text-cyan-400">• Loaded: {fileName}</span>}
            </div>

            <div class="flex items-center gap-2">
              <button
                id="clear-input-btn"
                onClick={handleClear}
                class="px-3 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw class="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>

              <button
                id="run-analysis-btn"
                onClick={handleManualSubmit}
                disabled={isAnalyzing || !inputText.trim()}
                class="px-5 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isAnalyzing ? (
                  <>
                    <div class="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Hops & Risk...</span>
                  </>
                ) : (
                  <>
                    <Play class="w-3.5 h-3.5 fill-current" />
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

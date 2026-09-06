import React, { useState, useEffect } from 'react';
import { ForensicAnalysis, CaseRecord, CaseStatus } from './types';
import { parseRawEmail } from './utils/forensicEngine';
import { SAMPLE_EMAILS } from './utils/sampleEmails';
import { HeaderNav } from './components/HeaderNav';
import { EmailInputSection } from './components/EmailInputSection';
import { DashboardStats } from './components/DashboardStats';
import { TraceMap } from './components/TraceMap';
import { HopChainVisualizer } from './components/HopChainVisualizer';
import { ThreatIndicators } from './components/ThreatIndicators';
import { AiDeepDive } from './components/AiDeepDive';
import { HeadersInspector } from './components/HeadersInspector';
import { CaseListView } from './components/CaseListView';
import { ShieldAlert, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const LOCAL_STORAGE_CASES_KEY = 'phishtrails_saved_cases_v1';

export default function App() {
  const [currentAnalysis, setCurrentAnalysis] = useState<ForensicAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'analyzer' | 'cases'>('analyzer');
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize with the first sample on boot so app renders instantly
  useEffect(() => {
    try {
      const initial = parseRawEmail(SAMPLE_EMAILS[0].rawText);
      setCurrentAnalysis(initial);

      // Load saved cases from localStorage
      const saved = localStorage.getItem(LOCAL_STORAGE_CASES_KEY);
      if (saved) {
        setCases(JSON.parse(saved));
      } else {
        // Seed default initial case
        const seedCase: CaseRecord = {
          id: initial.id,
          createdAt: initial.analyzedAt,
          updatedAt: initial.analyzedAt,
          subject: initial.subject,
          sender: initial.from.address,
          fraudConfidence: initial.fraudConfidence,
          threatLevel: initial.riskScore.level,
          originIp: initial.originIp,
          originCountry: initial.originGeo.country,
          originIsp: initial.originGeo.isp,
          status: 'confirmed_phish',
          analystNotes: 'Initial high-urgency CEO wire transfer spearphishing simulation.',
          analysis: initial
        };
        setCases([seedCase]);
        localStorage.setItem(LOCAL_STORAGE_CASES_KEY, JSON.stringify([seedCase]));
      }
    } catch (e) {
      console.error('Error in initial bootstrap:', e);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAnalyze = async (rawEmail: string) => {
    setIsAnalyzing(true);
    try {
      // Try backend endpoint first
      let analysisResult: ForensicAnalysis;
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawEmail })
        });
        if (res.ok) {
          analysisResult = await res.json();
        } else {
          analysisResult = parseRawEmail(rawEmail);
        }
      } catch {
        // Direct client fallback
        analysisResult = parseRawEmail(rawEmail);
      }

      setCurrentAnalysis(analysisResult);
      setCurrentView('analyzer');
      showToast(`Analyzed: ${analysisResult.subject.slice(0, 30)}...`);
    } catch (err: any) {
      console.error('Analysis error:', err);
      showToast('Error parsing raw email text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveCase = () => {
    if (!currentAnalysis) return;

    const existingIdx = cases.findIndex(c => c.id === currentAnalysis.id);
    const newCase: CaseRecord = {
      id: currentAnalysis.id,
      createdAt: currentAnalysis.analyzedAt,
      updatedAt: new Date().toISOString(),
      subject: currentAnalysis.subject,
      sender: currentAnalysis.from.address,
      fraudConfidence: currentAnalysis.fraudConfidence,
      threatLevel: currentAnalysis.riskScore.level,
      originIp: currentAnalysis.originIp,
      originCountry: currentAnalysis.originGeo.country,
      originIsp: currentAnalysis.originGeo.isp,
      status: currentAnalysis.fraudConfidence > 60 ? 'confirmed_phish' : 'open',
      analystNotes: currentAnalysis.aiReport?.summary || '',
      analysis: currentAnalysis
    };

    let updatedCases: CaseRecord[];
    if (existingIdx >= 0) {
      updatedCases = [...cases];
      updatedCases[existingIdx] = newCase;
    } else {
      updatedCases = [newCase, ...cases];
    }

    setCases(updatedCases);
    localStorage.setItem(LOCAL_STORAGE_CASES_KEY, JSON.stringify(updatedCases));

    // Try background sync with server
    fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCase)
    }).catch(() => {});

    showToast('Case successfully saved to archive');
  };

  const handleUpdateCaseStatus = (id: string, status: CaseStatus, notes?: string) => {
    const updated = cases.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          ...(notes !== undefined ? { analystNotes: notes } : {}),
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    setCases(updated);
    localStorage.setItem(LOCAL_STORAGE_CASES_KEY, JSON.stringify(updated));

    fetch(`/api/cases/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, analystNotes: notes })
    }).catch(() => {});
  };

  const handleDeleteCase = (id: string) => {
    const updated = cases.filter(c => c.id !== id);
    setCases(updated);
    localStorage.setItem(LOCAL_STORAGE_CASES_KEY, JSON.stringify(updated));

    fetch(`/api/cases/${id}`, { method: 'DELETE' }).catch(() => {});
    showToast('Case deleted from archive');
  };

  const handleSelectCase = (analysis: ForensicAnalysis) => {
    setCurrentAnalysis(analysis);
    setCurrentView('analyzer');
    showToast(`Loaded case: ${analysis.subject.slice(0, 30)}...`);
  };

  const isCurrentSaved = Boolean(
    currentAnalysis && cases.some(c => c.id === currentAnalysis.id)
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-[999] px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-cyan-200 text-xs font-mono shadow-[0_0_20px_rgba(6,182,212,0.3)] flex items-center gap-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <HeaderNav
        currentView={currentView}
        onViewChange={setCurrentView}
        caseCount={cases.length}
        currentAnalysis={currentAnalysis}
        onSaveCase={handleSaveCase}
        isCaseSaved={isCurrentSaved}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {currentView === 'cases' ? (
          <CaseListView
            cases={cases}
            activeCaseId={currentAnalysis?.id}
            onSelectCase={handleSelectCase}
            onUpdateCaseStatus={handleUpdateCaseStatus}
            onDeleteCase={handleDeleteCase}
            onClose={() => setCurrentView('analyzer')}
          />
        ) : (
          <>
            {/* Input & Raw Upload Section */}
            <EmailInputSection
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
            />

            {/* Forensic Dashboard Panels */}
            {currentAnalysis && (
              <div className="space-y-6">
                {/* 1. Dashboard Top Stats (Fraud dial, Auth statuses, Geo card) */}
                <DashboardStats analysis={currentAnalysis} />

                {/* 2. Central Forensic Grid: Map + Timeline on Left, Deep Dive & Indicators on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column (7 cols): Map & Relay Hop Chain */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Visual Origin & Relay Map */}
                    <div>
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-mono uppercase text-slate-400 font-semibold tracking-wider">
                          Forensic Packet Route & Origin Geolocation
                        </span>
                        <span className="text-[11px] font-mono text-cyan-400">
                          {currentAnalysis.originGeo.city}, {currentAnalysis.originGeo.country}
                        </span>
                      </div>
                      <TraceMap analysis={currentAnalysis} />
                    </div>

                    {/* Received Header Hop Chain */}
                    <HopChainVisualizer
                      hops={currentAnalysis.hops}
                      originIp={currentAnalysis.originIp}
                    />
                  </div>

                  {/* Right Column (5 cols): AI Intelligence, Indicators & Header Inspector */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* AI Threat Deep-Dive & Remediation */}
                    <AiDeepDive
                      analysis={currentAnalysis}
                      onUpdateAnalysis={setCurrentAnalysis}
                    />

                    {/* Spoofing & NLP Phishing Indicators */}
                    <ThreatIndicators analysis={currentAnalysis} />

                    {/* Raw / Parsed Headers Inspector */}
                    <HeadersInspector analysis={currentAnalysis} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-[#040813] py-4 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>PhishTrails Forensic Threat Analyzer & Origin Tracer</span>
          <span className="text-cyan-500/80">Leaflet.js • RFC 5322 Parsing • AI Threat Intel</span>
        </div>
      </footer>
    </div>
  );
}

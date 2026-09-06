import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { parseRawEmail } from './src/utils/forensicEngine';
import { CaseRecord, ForensicAnalysis } from './src/types';

const app = express();
// Detect compiled production bundle vs live dev execution
const isCompiledBundle = typeof __filename !== 'undefined' && __filename.endsWith('.cjs');
const isProduction = process.env.NODE_ENV === 'production' || isCompiledBundle;

// In development, the dev server MUST bind to port 3000 behind nginx reverse proxy.
// In production (Cloud Run), the server MUST listen on process.env.PORT (defaults to 8080).
const PORT = isProduction && process.env.PORT
  ? parseInt(process.env.PORT, 10)
  : 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory case storage seeded with realistic baseline case
let casesDatabase: CaseRecord[] = [];

// Gemini client lazy initialization
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return aiClient;
}

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PhishTrails Forensic Engine',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString()
  });
});

// API: Analyze email or headers
app.post('/api/analyze', (req, res) => {
  try {
    const { rawEmail } = req.body;
    if (!rawEmail || typeof rawEmail !== 'string') {
      res.status(400).json({ error: 'rawEmail text is required' });
      return;
    }

    const analysis = parseRawEmail(rawEmail);
    res.json(analysis);
  } catch (err: any) {
    console.error('Error analyzing email:', err);
    res.status(500).json({ error: err?.message || 'Failed to parse email' });
  }
});

// API: AI Deep Dive using Gemini 3.8 Flash
app.post('/api/ai-deep-dive', async (req, res) => {
  try {
    const analysis: ForensicAnalysis = req.body.analysis;
    if (!analysis) {
      res.status(400).json({ error: 'Analysis payload is required' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Return heuristic fallback report if no API key is configured
      res.json({
        report: analysis.aiReport || {
          verdict: analysis.fraudConfidence > 60 ? 'HIGH RISK PHISHING' : 'BENIGN',
          summary: `Automated heuristic analysis computed a fraud confidence score of ${analysis.fraudConfidence}%. Origin IP ${analysis.originIp} located in ${analysis.originGeo.city}, ${analysis.originGeo.country}.`,
          threatCategory: analysis.fraudConfidence > 60 ? 'Spearphishing & Impersonation' : 'Standard Email',
          mitreTactics: ['T1566 - Phishing', 'T1566.002 - Spearphishing Link'],
          iocs: {
            ips: [analysis.originIp],
            domains: [analysis.from.domain],
            senders: [analysis.from.address]
          },
          recommendedActions: [
            'Inspect mail server quarantine logs',
            `Verify sender domain SPF TXT records for ${analysis.from.domain}`,
            'Review user endpoint security logs'
          ]
        },
        source: 'heuristic'
      });
      return;
    }

    const prompt = `You are an elite Digital Forensics and Incident Response (DFIR) Cyber Threat Analyst.
Analyze the following email forensic metadata and provide a structured JSON response:

Email Metadata:
- Subject: ${analysis.subject}
- From: "${analysis.from.displayName}" <${analysis.from.address}>
- Return-Path: ${analysis.returnPath}
- Origin IP: ${analysis.originIp} (${analysis.originGeo.city}, ${analysis.originGeo.country}, ISP: ${analysis.originGeo.isp}, ASN: ${analysis.originGeo.asn})
- SPF Status: ${analysis.authentication.spf.status} (${analysis.authentication.spf.detail})
- DKIM Status: ${analysis.authentication.dkim.status}
- DMARC Status: ${analysis.authentication.dmarc.status}
- Relay Hops Count: ${analysis.hops.length}
- Detected Spoofing Indicators: ${JSON.stringify(analysis.spoofingIndicators)}
- Phishing Urgency Keywords: ${analysis.riskScore.urgencyKeywordsFound.join(', ')}
- Email Snippet:
"""
${analysis.bodySnippet.slice(0, 1000)}
"""

Provide your forensic verdict in valid JSON with these exact keys:
{
  "verdict": "A concise verdict like 'CONFIRMED ADVERSARIAL PHISHING' or 'BENIGN VERIFIED SENDER'",
  "threatCategory": "Specific classification e.g. 'Business Email Compromise (BEC) - Executive Impersonation' or 'Credential Harvester' or 'Legitimate Notification'",
  "summary": "2-3 sentences explaining the technical forensic evidence, origin transit anomalies, and attack vector.",
  "mitreTactics": ["Array of applicable MITRE ATT&CK technique IDs and names e.g. T1566.002 Spearphishing Link"],
  "iocs": {
    "ips": ["List of suspect IPs"],
    "domains": ["List of suspect domains"],
    "senders": ["List of spoofed/adversarial addresses"]
  },
  "recommendedActions": [
    "Array of 3-4 concrete containment/remediation steps for SOC analysts (e.g. M365 tenant purge, firewall IP block, password reset, user notification)"
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '{}';
    const parsedReport = JSON.parse(text);

    res.json({
      report: parsedReport,
      source: 'gemini-3.8-flash'
    });
  } catch (err: any) {
    console.error('Gemini AI deep dive failed, falling back:', err);
    res.json({
      report: req.body?.analysis?.aiReport || {
        verdict: 'SUSPICIOUS',
        summary: 'Heuristic analysis completed. (AI service error occurred)',
        threatCategory: 'Email Threat Investigation',
        mitreTactics: ['T1566 - Phishing'],
        iocs: {
          ips: [req.body?.analysis?.originIp || 'Unknown'],
          domains: [req.body?.analysis?.from?.domain || 'Unknown'],
          senders: [req.body?.analysis?.from?.address || 'Unknown']
        },
        recommendedActions: ['Perform manual header review', 'Check sender reputation on AbuseIPDB']
      },
      source: 'heuristic-fallback'
    });
  }
});

// API: Cases list & management
app.get('/api/cases', (req, res) => {
  res.json(casesDatabase);
});

app.post('/api/cases', (req, res) => {
  const newCase: CaseRecord = req.body;
  if (!newCase || !newCase.id) {
    res.status(400).json({ error: 'Valid case object required' });
    return;
  }
  // Check if exists
  const existingIndex = casesDatabase.findIndex(c => c.id === newCase.id);
  if (existingIndex >= 0) {
    casesDatabase[existingIndex] = newCase;
  } else {
    casesDatabase.unshift(newCase);
  }
  res.json({ success: true, case: newCase });
});

app.patch('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  const { status, analystNotes } = req.body;
  const target = casesDatabase.find(c => c.id === id);
  if (!target) {
    res.status(404).json({ error: 'Case not found' });
    return;
  }
  if (status) target.status = status;
  if (analystNotes !== undefined) target.analystNotes = analystNotes;
  target.updatedAt = new Date().toISOString();
  res.json({ success: true, case: target });
});

app.delete('/api/cases/:id', (req, res) => {
  const { id } = req.params;
  casesDatabase = casesDatabase.filter(c => c.id !== id);
  res.json({ success: true });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Locate dist directory accurately whether run from project root or inside dist
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`PhishTrails server running in ${isProduction ? 'production' : 'development'} mode at http://0.0.0.0:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received, shutting down gracefully');
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer();

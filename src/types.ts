export type ThreatLevel = 'CLEAN' | 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL_THREAT';

export type AuthVerdict = 'pass' | 'fail' | 'softfail' | 'neutral' | 'none' | 'temperror' | 'permerror' | 'unknown';

export interface AuthStatus {
  status: AuthVerdict;
  details: string;
  detail?: string;
  domain?: string;
  selector?: string;
  rawHeader?: string;
}

export interface RelayHop {
  hopNumber: number;
  fromHost?: string;
  fromIp?: string;
  byHost?: string;
  byIp?: string;
  protocol?: string;
  timestamp?: string;
  delaySeconds?: number;
  isOrigin?: boolean;
  geo?: {
    country: string;
    countryCode: string;
    city: string;
    region?: string;
    lat: number;
    lon: number;
    isp: string;
    asn?: string;
    org?: string;
  };
}

export interface OriginGeo {
  ip: string;
  country: string;
  countryCode: string;
  city: string;
  region: string;
  isp: string;
  asn: string;
  org: string;
  lat: number;
  lon: number;
  reverseDns?: string;
  isPrivate?: boolean;
}

export interface SpoofingIndicator {
  id: string;
  type: 'display_name_spoof' | 'domain_mismatch' | 'spf_fail' | 'dkim_fail' | 'dmarc_fail' | 'reply_to_mismatch' | 'suspicious_tld' | 'punycode_homograph' | 'fake_brand';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  evidence: string;
}

export interface PhishingRiskFactor {
  name: string;
  weight: number;
  detected: boolean;
  description: string;
}

export interface PhishingRiskScore {
  score: number; // 0 to 100
  level: ThreatLevel;
  urgencyKeywordsFound: string[];
  credentialHarvestingIndicators: string[];
  actionRequiredKeywords: string[];
  suspiciousLinks: Array<{
    url: string;
    display: string;
    reason: string;
  }>;
  riskFactors: PhishingRiskFactor[];
}

export interface AiForensicReport {
  verdict: string;
  summary: string;
  threatCategory: string;
  mitreTactics: string[];
  iocs: {
    ips: string[];
    domains: string[];
    senders: string[];
  };
  recommendedActions: string[];
}

export interface ForensicAnalysis {
  id: string;
  analyzedAt: string;
  sourceType: 'eml' | 'headers';
  
  // Basic metadata
  subject: string;
  from: {
    raw: string;
    displayName: string;
    address: string;
    domain: string;
  };
  to: string;
  date: string;
  returnPath: string;
  replyTo?: string;
  messageId: string;
  
  // Security authentications
  authentication: {
    spf: AuthStatus;
    dkim: AuthStatus;
    dmarc: AuthStatus;
  };

  // Trace hops
  hops: RelayHop[];
  originIp: string;
  originGeo: OriginGeo;

  // Threat & Risk
  fraudConfidence: number; // 0 - 100%
  riskScore: PhishingRiskScore;
  spoofingIndicators: SpoofingIndicator[];
  
  // Email excerpts
  bodySnippet: string;
  rawHeaders: string;

  // AI intelligence
  aiReport?: AiForensicReport;
}

export type CaseStatus = 'open' | 'investigating' | 'confirmed_phish' | 'false_positive' | 'resolved';

export interface CaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  subject: string;
  sender: string;
  fraudConfidence: number;
  threatLevel: ThreatLevel;
  originIp: string;
  originCountry: string;
  originIsp: string;
  status: CaseStatus;
  analystNotes?: string;
  analysis: ForensicAnalysis;
}

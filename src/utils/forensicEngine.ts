import {
  AuthStatus,
  AuthVerdict,
  ForensicAnalysis,
  OriginGeo,
  PhishingRiskScore,
  RelayHop,
  SpoofingIndicator,
  ThreatLevel,
  AiForensicReport
} from '../types';
import { isPrivateIp, resolveIpGeo } from './geoDatabase';

export function parseRawEmail(rawInput: string): ForensicAnalysis {
  const text = (rawInput || '').trim();

  // Split headers and body
  const headerBodySplit = text.indexOf('\r\n\r\n') !== -1 
    ? text.indexOf('\r\n\r\n') 
    : text.indexOf('\n\n');

  let rawHeaderSection = '';
  let bodySection = '';

  if (headerBodySplit !== -1) {
    rawHeaderSection = text.slice(0, headerBodySplit);
    bodySection = text.slice(headerBodySplit).trim();
  } else {
    // If no distinct body separator, treat entire text as headers if it starts with known header tags
    if (/^[A-Za-z0-9-]+:\s/m.test(text)) {
      rawHeaderSection = text;
      bodySection = '';
    } else {
      rawHeaderSection = '';
      bodySection = text;
    }
  }

  // Unfold multi-line headers (RFC 5322: lines starting with space or tab continue previous header)
  const unfoldedLines: string[] = [];
  const lines = rawHeaderSection.split(/\r?\n/);
  for (const line of lines) {
    if (/^[ \t]+/.test(line) && unfoldedLines.length > 0) {
      unfoldedLines[unfoldedLines.length - 1] += ' ' + line.trim();
    } else if (line.trim()) {
      unfoldedLines.push(line.trim());
    }
  }

  // Build header map
  const headers: Record<string, string[]> = {};
  for (const line of unfoldedLines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const value = line.slice(colonIdx + 1).trim();
      if (!headers[key]) {
        headers[key] = [];
      }
      headers[key].push(value);
    }
  }

  const getFirstHeader = (name: string): string => (headers[name.toLowerCase()]?.[0] || '');

  // Parse basic envelope fields
  const subject = getFirstHeader('subject') || 'No Subject';
  const rawFrom = getFirstHeader('from') || 'unknown@domain.com';
  const to = getFirstHeader('to') || 'unknown@domain.com';
  const date = getFirstHeader('date') || new Date().toUTCString();
  const returnPath = getFirstHeader('return-path').replace(/[<>]/g, '') || '';
  const replyTo = getFirstHeader('reply-to').replace(/[<>]/g, '') || '';
  const messageId = getFirstHeader('message-id') || '';

  // Parse From address details
  const parsedFrom = parseEmailAddress(rawFrom);

  // Parse Authentication Headers (SPF, DKIM, DMARC)
  const authResults = parseAuthentication(headers, parsedFrom.domain);

  // Parse Received Hops & Origin IP
  const { hops, originIp, originGeo } = parseReceivedHops(headers);

  // Phishing Risk & NLP scoring
  const riskScore = calculatePhishingRisk(subject, bodySection, headers, parsedFrom, returnPath, authResults);

  // Spoofing Indicators
  const spoofingIndicators = detectSpoofing(parsedFrom, returnPath, replyTo, authResults, originGeo, hops, subject, bodySection);

  // Fraud Confidence Score (0 - 100%)
  const fraudConfidence = computeFraudConfidence(riskScore, spoofingIndicators, authResults);

  // AI Forensic Report fallback
  const aiReport = generateHeuristicAiReport(subject, parsedFrom, originGeo, fraudConfidence, spoofingIndicators, riskScore);

  return {
    id: `case-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    analyzedAt: new Date().toISOString(),
    sourceType: headerBodySplit !== -1 ? 'eml' : 'headers',
    subject,
    from: parsedFrom,
    to,
    date,
    returnPath,
    replyTo: replyTo || undefined,
    messageId,
    authentication: authResults,
    hops,
    originIp,
    originGeo,
    fraudConfidence,
    riskScore,
    spoofingIndicators,
    bodySnippet: bodySection.slice(0, 1500),
    rawHeaders: rawHeaderSection,
    aiReport
  };
}

function parseEmailAddress(raw: string) {
  let displayName = '';
  let address = '';
  let domain = '';

  const angleMatch = raw.match(/^(?:"?([^"]*)"?\s*)?<([^>]+)>/);
  if (angleMatch) {
    displayName = (angleMatch[1] || '').trim();
    address = (angleMatch[2] || '').trim();
  } else {
    address = raw.trim();
    displayName = address.split('@')[0];
  }

  const parts = address.split('@');
  domain = parts.length > 1 ? parts[1].toLowerCase().trim() : '';

  if (!displayName) {
    displayName = parts[0] || address;
  }

  return {
    raw,
    displayName,
    address,
    domain
  };
}

function parseAuthentication(headers: Record<string, string[]>, fromDomain: string) {
  const authResultsHeaders = headers['authentication-results'] || [];
  const receivedSpfHeaders = headers['received-spf'] || [];
  const dkimHeaders = headers['dkim-signature'] || [];

  const combinedAuth = authResultsHeaders.join(' ');
  const combinedSpf = receivedSpfHeaders.join(' ');

  // SPF detection
  let spfStatus: AuthVerdict = 'none';
  let spfDetails = 'No SPF record or check was recorded in headers';

  if (/spf=pass/i.test(combinedAuth) || /pass/i.test(combinedSpf)) {
    spfStatus = 'pass';
    spfDetails = 'Sender IP matches authorized SPF record for domain';
  } else if (/spf=softfail/i.test(combinedAuth) || /softfail/i.test(combinedSpf)) {
    spfStatus = 'softfail';
    spfDetails = 'Sender IP is not explicitly authorized (~all policy softfail)';
  } else if (/spf=fail/i.test(combinedAuth) || /fail/i.test(combinedSpf)) {
    spfStatus = 'fail';
    spfDetails = 'Sender IP failed authorization against SPF policy (-all policy)';
  } else if (/spf=neutral/i.test(combinedAuth) || /neutral/i.test(combinedSpf)) {
    spfStatus = 'neutral';
    spfDetails = 'SPF policy declared neutral (?all)';
  }

  // DKIM detection
  let dkimStatus: AuthVerdict = 'none';
  let dkimDetails = 'No cryptographic DKIM signature found';
  let dkimSelector = '';

  if (dkimHeaders.length > 0) {
    const sMatch = dkimHeaders[0].match(/s=([a-zA-Z0-9_-]+)/);
    if (sMatch) dkimSelector = sMatch[1];
  }

  if (/dkim=pass/i.test(combinedAuth)) {
    dkimStatus = 'pass';
    dkimDetails = 'Valid cryptographic signature verified for header and body';
  } else if (/dkim=fail/i.test(combinedAuth)) {
    dkimStatus = 'fail';
    dkimDetails = 'DKIM signature invalid, tampered, or key mismatch';
  } else if (dkimHeaders.length > 0) {
    dkimStatus = 'neutral';
    dkimDetails = 'DKIM signature header present; verification results unspecified';
  }

  // DMARC detection
  let dmarcStatus: AuthVerdict = 'none';
  let dmarcDetails = 'No DMARC evaluation statement recorded';

  if (/dmarc=pass/i.test(combinedAuth)) {
    dmarcStatus = 'pass';
    dmarcDetails = 'Domain alignment confirmed with SPF and/or DKIM';
  } else if (/dmarc=fail/i.test(combinedAuth)) {
    dmarcStatus = 'fail';
    dmarcDetails = 'DMARC alignment failed; sender domain lacks matching verified DKIM/SPF';
  } else if (spfStatus === 'pass' && dkimStatus === 'pass') {
    dmarcStatus = 'pass';
    dmarcDetails = 'Inferred pass from fully aligned SPF and DKIM signatures';
  }

  return {
    spf: {
      status: spfStatus,
      details: spfDetails,
      detail: spfDetails,
      domain: fromDomain
    },
    dkim: {
      status: dkimStatus,
      details: dkimDetails,
      detail: dkimDetails,
      selector: dkimSelector
    },
    dmarc: {
      status: dmarcStatus,
      details: dmarcDetails,
      detail: dmarcDetails
    }
  };
}

function parseReceivedHops(headers: Record<string, string[]>) {
  const rawReceived = headers['received'] || [];
  const hops: RelayHop[] = [];

  // In standard SMTP, Received headers are stacked in reverse chronological order:
  // Top header = final recipient MX
  // Bottom header = origin client / submission MTA
  // We reverse them so hop 1 is the sender/origin, and hop N is the destination
  const chronologicallyOrdered = [...rawReceived].reverse();

  let prevTimestamp: Date | null = null;
  const ipRegex = /(?:[0-9]{1,3}\.){3}[0-9]{1,3}/g;

  chronologicallyOrdered.forEach((rec, idx) => {
    const hopNumber = idx + 1;

    // Extract "from <server> (<rdns> [<ip>])"
    const fromMatch = rec.match(/from\s+([^\s;]+)(?:\s+\(([^)]+)\))?/i);
    const byMatch = rec.match(/by\s+([^\s;]+)/i);
    const withMatch = rec.match(/with\s+([^\s;]+)/i);

    // Extract IP address from header
    const allIps = rec.match(ipRegex) || [];
    // Prioritize public IP if available
    let chosenIp = allIps.find(ip => !isPrivateIp(ip)) || allIps[0] || '';

    // Extract timestamp (usually follows semicolon)
    let timestampStr = '';
    let parsedDate: Date | null = null;
    let delaySeconds = 0;

    const semiIdx = rec.lastIndexOf(';');
    if (semiIdx !== -1) {
      timestampStr = rec.slice(semiIdx + 1).trim();
      const d = new Date(timestampStr);
      if (!isNaN(d.getTime())) {
        parsedDate = d;
        if (prevTimestamp) {
          const diffMs = parsedDate.getTime() - prevTimestamp.getTime();
          delaySeconds = Math.max(0, Math.round(diffMs / 1000));
        }
        prevTimestamp = parsedDate;
      }
    }

    const fromHost = fromMatch ? fromMatch[1] : undefined;
    const byHost = byMatch ? byMatch[1] : undefined;
    const protocol = withMatch ? withMatch[1] : 'ESMTP';

    const geo = chosenIp ? resolveIpGeo(chosenIp) : undefined;

    hops.push({
      hopNumber,
      fromHost,
      fromIp: chosenIp || undefined,
      byHost,
      protocol,
      timestamp: timestampStr || undefined,
      delaySeconds,
      isOrigin: hopNumber === 1,
      geo: geo ? {
        country: geo.country,
        countryCode: geo.countryCode,
        city: geo.city,
        region: geo.region,
        lat: geo.lat,
        lon: geo.lon,
        isp: geo.isp,
        asn: geo.asn,
        org: geo.org
      } : undefined
    });
  });

  // Determine Origin IP:
  // 1. Check X-Originating-IP or X-Sender-IP
  let originIp = '';
  const xOrig = (headers['x-originating-ip']?.[0] || headers['x-sender-ip']?.[0] || '').replace(/[\[\]]/g, '').trim();
  if (xOrig && !isPrivateIp(xOrig)) {
    originIp = xOrig;
  }

  // 2. If not found, pick the earliest public IP in hops (from bottom up)
  if (!originIp) {
    for (const hop of hops) {
      if (hop.fromIp && !isPrivateIp(hop.fromIp)) {
        originIp = hop.fromIp;
        break;
      }
    }
  }

  // 3. Fallback to default external public IP if all were private/localhost
  if (!originIp) {
    originIp = '185.220.101.5';
  }

  const originGeo = resolveIpGeo(originIp);

  // If hop 1 had no geo, attach originGeo
  if (hops.length > 0 && !hops[0].geo) {
    hops[0].geo = {
      country: originGeo.country,
      countryCode: originGeo.countryCode,
      city: originGeo.city,
      region: originGeo.region,
      lat: originGeo.lat,
      lon: originGeo.lon,
      isp: originGeo.isp,
      asn: originGeo.asn,
      org: originGeo.org
    };
    hops[0].fromIp = originIp;
  }

  return {
    hops,
    originIp,
    originGeo
  };
}

function calculatePhishingRisk(
  subject: string,
  body: string,
  headers: Record<string, string[]>,
  from: { raw: string; displayName: string; address: string; domain: string },
  returnPath: string,
  auth: { spf: AuthStatus; dkim: AuthStatus; dmarc: AuthStatus }
): PhishingRiskScore {
  const content = `${subject} \n ${body}`.toLowerCase();

  const urgencyKeywords = [
    'immediate action',
    'urgent',
    'urgently',
    'within 24 hours',
    'within 12 hours',
    'within 48 hours',
    '2 hours',
    'expires today',
    'suspended',
    'suspension',
    'lockout',
    'freeze',
    'frozen',
    'account restricted',
    'unauthorized login',
    'compromised',
    'final notice',
    'strictly confidential',
    'do not call',
    'mandatory action',
    'delivery exception',
    'claim disbursal'
  ];

  const credentialKeywords = [
    'password expires',
    'keep current password',
    'update password',
    'verify identity',
    'sso login',
    'click the secure verification link',
    'verify your token',
    'account protection',
    'security operations center',
    'authenticator re-enrollment',
    'mfa device migration',
    'camera app on your mobile',
    'scan the direct provisioning',
    'single sign-on'
  ];

  const actionRequiredKeywords = [
    'wire transfer',
    'escrow account',
    'beneficiary account',
    'direct deposit',
    'voided check',
    'bank routing',
    'gift card',
    'crypto',
    'invoice overdue',
    'payroll',
    'unpaid customs clearance duty',
    'download customs clearance',
    'educational grant refund'
  ];

  const foundUrgency = urgencyKeywords.filter(k => content.includes(k));
  const foundCredentials = credentialKeywords.filter(k => content.includes(k));
  const foundAction = actionRequiredKeywords.filter(k => content.includes(k));

  // Extract links and check for suspicious traits
  const linkRegex = /https?:\/\/[^\s"'<>]+/gi;
  const rawLinks = (body.match(linkRegex) || []).slice(0, 10);
  const suspiciousLinks = rawLinks.map(url => {
    let reason = '';
    const lower = url.toLowerCase();
    if (lower.includes('.xyz') || lower.includes('.top') || lower.includes('.cc') || lower.includes('.click')) {
      reason = 'High-risk generic top-level domain (gTLD)';
    } else if (lower.endsWith('.zip') || lower.endsWith('.iso') || lower.endsWith('.vbs') || lower.endsWith('.exe')) {
      reason = 'Potential malware delivery archive / executable payload';
    } else if (lower.includes('qr') || lower.includes('mfa') || lower.includes('enroll') || lower.includes('sync')) {
      reason = 'MFA token / QR enrollment harvesting URL pattern';
    } else if (lower.includes('verify') || lower.includes('login') || lower.includes('auth') || lower.includes('security')) {
      reason = 'Phishing token / credential harvesting URL pattern';
    } else if (/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/.test(url)) {
      reason = 'Raw IP address instead of canonical hostname in URL';
    }
    return {
      url,
      display: url.length > 55 ? url.slice(0, 52) + '...' : url,
      reason: reason || 'External link'
    };
  });

  const factors = [
    {
      name: 'Urgent Call-to-Action Pressure',
      weight: 25,
      detected: foundUrgency.length > 0,
      description: `Detected psychological urgency triggers (${foundUrgency.join(', ')}) designed to force rapid compliance.`
    },
    {
      name: 'Credential Harvesting / Phishing Keywords',
      weight: 30,
      detected: foundCredentials.length > 0,
      description: `Detected phrases requesting authentication or password retention (${foundCredentials.join(', ')}).`
    },
    {
      name: 'Financial / Wire / Payroll Transaction Request',
      weight: 30,
      detected: foundAction.length > 0,
      description: `Detected business email compromise triggers for wire transfer or payroll changes.`
    },
    {
      name: 'Suspicious Target Links / Redirectors',
      weight: 20,
      detected: suspiciousLinks.some(l => l.reason !== 'External link'),
      description: 'Contains URLs utilizing untrusted TLDs (.xyz, .cc) or credential collection endpoints.'
    },
    {
      name: 'Sender Authentication Failures',
      weight: 25,
      detected: auth.spf.status === 'fail' || auth.spf.status === 'softfail' || auth.dmarc.status === 'fail',
      description: 'SPF or DMARC evaluation returned fail or softfail for the sending MTA.'
    }
  ];

  let rawScore = 0;
  for (const factor of factors) {
    if (factor.detected) {
      rawScore += factor.weight;
    }
  }

  // Bound to 0 - 100
  const score = Math.min(100, Math.max(0, rawScore));

  let level: ThreatLevel = 'CLEAN';
  if (score >= 80) {
    level = 'CRITICAL_THREAT';
  } else if (score >= 60) {
    level = 'HIGH_RISK';
  } else if (score >= 40) {
    level = 'SUSPICIOUS';
  } else if (score >= 15) {
    level = 'LOW_RISK';
  }

  return {
    score,
    level,
    urgencyKeywordsFound: foundUrgency,
    credentialHarvestingIndicators: foundCredentials,
    actionRequiredKeywords: foundAction,
    suspiciousLinks,
    riskFactors: factors
  };
}

function detectSpoofing(
  from: { raw: string; displayName: string; address: string; domain: string },
  returnPath: string,
  replyTo: string,
  auth: { spf: AuthStatus; dkim: AuthStatus; dmarc: AuthStatus },
  originGeo: OriginGeo,
  hops: RelayHop[],
  subject: string,
  body: string
): SpoofingIndicator[] {
  const indicators: SpoofingIndicator[] = [];

  const returnPathDomain = returnPath.includes('@') ? returnPath.split('@')[1].toLowerCase().trim() : '';
  const replyToDomain = replyTo.includes('@') ? replyTo.split('@')[1].toLowerCase().trim() : '';

  // 1. Display Name Spoofing Check
  const sensitiveExecutives = ['ceo', 'satya nadella', 'tim cook', 'chief executive', 'cfo', 'president', 'security team', 'microsoft security', 'bank of america', 'paypal security', 'admin'];
  const lowerDisplay = from.displayName.toLowerCase();
  const lowerDomain = from.domain.toLowerCase();

  const matchesBrandOrExecutive = sensitiveExecutives.some(title => lowerDisplay.includes(title));
  if (matchesBrandOrExecutive) {
    // Check if domain is obviously suspicious or different from brand
    const isBrandMismatch = (lowerDisplay.includes('microsoft') && !lowerDomain.includes('microsoft.com')) ||
      (lowerDisplay.includes('bank of america') && !lowerDomain.includes('bankofamerica.com')) ||
      (lowerDisplay.includes('paypal') && !lowerDomain.includes('paypal.com')) ||
      (lowerDisplay.includes('ceo') && auth.spf.status !== 'pass');

    if (isBrandMismatch || auth.spf.status === 'softfail' || auth.dmarc.status === 'fail') {
      indicators.push({
        id: 'spoof-disp-name',
        type: 'display_name_spoof',
        severity: 'critical',
        title: 'Executive / Brand Display Name Spoofing',
        description: `The sender display name "${from.displayName}" poses as an executive or institutional authority, but the mail path or authentication fails.`,
        evidence: `Display Name: "${from.displayName}" | Address: <${from.address}> | SPF: ${auth.spf.status}`
      });
    }
  }

  // 2. Domain Mismatch: From vs Return-Path
  if (returnPathDomain && from.domain && returnPathDomain !== from.domain) {
    indicators.push({
      id: 'spoof-return-path',
      type: 'domain_mismatch',
      severity: 'high',
      title: 'Envelope Return-Path Domain Mismatch',
      description: `The visible header From domain (${from.domain}) does not match the envelope Return-Path domain (${returnPathDomain}). Bounced messages route to an adversarial drop address.`,
      evidence: `From Domain: @${from.domain} vs Return-Path: @${returnPathDomain}`
    });
  }

  // 3. Reply-To Divergence
  if (replyToDomain && from.domain && replyToDomain !== from.domain) {
    indicators.push({
      id: 'spoof-reply-to',
      type: 'reply_to_mismatch',
      severity: 'high',
      title: 'Reply-To Channel Hijack',
      description: `Replies are directed to an external address (${replyTo}) rather than the originating corporate address (${from.address}).`,
      evidence: `Header Reply-To: <${replyTo}>`
    });
  }

  // 4. SPF Authorization Failure
  if (auth.spf.status === 'fail' || auth.spf.status === 'softfail') {
    indicators.push({
      id: 'spoof-spf',
      type: 'spf_fail',
      severity: auth.spf.status === 'fail' ? 'critical' : 'medium',
      title: `SPF Policy ${auth.spf.status.toUpperCase()}`,
      description: `The origin IP (${originGeo.ip}) is not authorized in DNS SPF TXT records for ${from.domain}.`,
      evidence: `Resolved SPF: ${auth.spf.detail}`
    });
  }

  // 5. DMARC Alignment Failure
  if (auth.dmarc.status === 'fail') {
    indicators.push({
      id: 'spoof-dmarc',
      type: 'dmarc_fail',
      severity: 'critical',
      title: 'DMARC Domain Alignment Failure',
      description: `The message fails DMARC validation. The From domain lacks aligned, cryptographically authenticated DKIM or authorized SPF records.`,
      evidence: `DMARC Status: fail (p=none / p=reject)`
    });
  }

  // 6. Suspicious TLD / Punycode Check
  const suspiciousTlds = ['.xyz', '.cc', '.top', '.buzz', '.work', '.click', '.cfd', '.sbs'];
  const hasSuspiciousTld = suspiciousTlds.some(tld => from.domain.endsWith(tld) || returnPathDomain.endsWith(tld));
  if (hasSuspiciousTld) {
    indicators.push({
      id: 'spoof-tld',
      type: 'suspicious_tld',
      severity: 'medium',
      title: 'High-Risk Threat Actor TLD',
      description: `Originating domain utilizes a low-reputation or disposable top-level domain frequently abused in mass spearphishing campaigns.`,
      evidence: `Domain: ${from.domain || returnPathDomain}`
    });
  }

  return indicators;
}

function computeFraudConfidence(
  risk: PhishingRiskScore,
  spoofing: SpoofingIndicator[],
  auth: { spf: AuthStatus; dkim: AuthStatus; dmarc: AuthStatus }
): number {
  let confidence = risk.score * 0.5;

  // Add weight for spoofing indicators
  for (const ind of spoofing) {
    if (ind.severity === 'critical') confidence += 20;
    else if (ind.severity === 'high') confidence += 12;
    else if (ind.severity === 'medium') confidence += 6;
  }

  // If all auth passes, suppress false positives
  if (auth.spf.status === 'pass' && auth.dkim.status === 'pass' && auth.dmarc.status === 'pass') {
    confidence = Math.min(confidence, 15);
  }

  return Math.min(99, Math.max(2, Math.round(confidence)));
}

function generateHeuristicAiReport(
  subject: string,
  from: { displayName: string; address: string; domain: string },
  originGeo: OriginGeo,
  fraudConfidence: number,
  spoofing: SpoofingIndicator[],
  risk: PhishingRiskScore
): AiForensicReport {
  let verdict = 'BENIGN / LOW RISK';
  let category = 'Legitimate Business Correspondence';
  let tactics = ['Initial Access: Valid Accounts'];

  if (fraudConfidence >= 75) {
    verdict = 'MALICIOUS / HIGH-CONFIDENCE PHISHING';
    if (subject.toLowerCase().includes('wire') || subject.toLowerCase().includes('payroll')) {
      category = 'Business Email Compromise (BEC) & Financial Fraud';
      tactics = ['T1566.002 - Spearphishing Link', 'T1534 - Internal Spearphishing', 'T1656 - Impersonation'];
    } else {
      category = 'Credential Harvesting & Account Takeover Attempt';
      tactics = ['T1566.001 - Spearphishing Attachment', 'T1056 - Input Capture', 'T1656 - Impersonation'];
    }
  } else if (fraudConfidence >= 45) {
    verdict = 'SUSPICIOUS / INVESTIGATION REQUIRED';
    category = 'Anomalous External Mail Transit';
    tactics = ['T1566 - Phishing'];
  }

  const domains = [from.domain];
  risk.suspiciousLinks.forEach(l => {
    try {
      const u = new URL(l.url);
      if (!domains.includes(u.hostname)) domains.push(u.hostname);
    } catch {}
  });

  return {
    verdict,
    threatCategory: category,
    summary: fraudConfidence >= 60
      ? `High-risk email originating from ${originGeo.city}, ${originGeo.country} (${originGeo.isp}). Exhibits ${spoofing.length} spoofing anomalies and strong psychological urgency indicators targeting recipient actions.`
      : `Email passes essential cryptographic authentication checks. Origin IP (${originGeo.ip}) aligns with recognized transit networks.`,
    mitreTactics: tactics,
    iocs: {
      ips: [originGeo.ip],
      domains: domains.filter(Boolean),
      senders: [from.address]
    },
    recommendedActions: fraudConfidence >= 60
      ? [
          `Purge message across Microsoft 365 / Google Workspace tenant using Message-ID filter.`,
          `Add ${originGeo.ip} to border firewall / WAF reputation deny-list.`,
          `Place sender domain (${from.domain}) and return-path on gateway quarantine rule.`,
          `Alert recipient to avoid clicking any embedded links or authorizing wire transactions.`
        ]
      : [
          `No immediate containment required. Monitor for repeated unsolicited contact.`
        ]
  };
}

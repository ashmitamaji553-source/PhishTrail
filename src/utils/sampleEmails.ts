export interface SampleEmail {
  id: string;
  title: string;
  category: 'bec' | 'credential_harvest' | 'malware_delivery' | 'legitimate' | 'qr_code_phish' | 'financial_fraud';
  badge: string;
  badgeColor: string;
  difficulty: 'Easy Spot' | 'Medium' | 'Subtle & Advanced';
  scenario: string;
  learningClues: string[];
  description: string;
  rawText: string;
}

export const SAMPLE_EMAILS: SampleEmail[] = [
  {
    id: 'sample-ceo-wire',
    title: 'Urgent Wire Transfer (CEO Impersonation)',
    category: 'bec',
    badge: 'BEC / Spearphishing',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-950/40',
    difficulty: 'Medium',
    scenario: 'Adversary leverages authority intimidation to rush CFO into a $148,500 unauthorized wire transfer before market close.',
    learningClues: [
      'From display name claims to be CEO, but Return-Path points to offshore-notice-desk.cc',
      'Origin IP (185.220.101.5) traces to St. Petersburg bulletproof hosting rather than corporate headquarters',
      'SPF softfail and DMARC fail confirm the sending server is not authorized to deliver on behalf of the company'
    ],
    description: 'Display name spoofing, SPF softfail, Return-Path mismatch, bulletproof VPS in St. Petersburg.',
    rawText: `Delivered-To: victim-cfo@enterprise-corp.com
Received: by 209.85.220.41 with SMTP id m20csp3011400qkb;
        Fri, 04 Sep 2026 14:22:15 -0700 (PDT)
X-Received: by 104.244.42.1 with SMTP id relay-aws-02.compute-1.amazonaws.com;
        Fri, 04 Sep 2026 14:21:40 -0700 (PDT)
Received: from mail-mta-pool.selectel-cloud.net (relay-node-77.selectel-cloud.net [185.220.101.5])
        by mx-inbound.enterprise-corp.com (Postfix) with ESMTPS id 4KzP9v2Qlxz2
        for <victim-cfo@enterprise-corp.com>; Fri, 04 Sep 2026 14:20:10 -0700 (PDT)
Received: from DESKTOP-ATTACK-01 (unknown [185.220.101.5])
        by relay-node-77.selectel-cloud.net (MTA) with ESMTP id 88102391;
        Fri, 04 Sep 2026 21:18:32 +0300
Return-Path: <exec-dispatch@offshore-notice-desk.cc>
Authentication-Results: mx-inbound.enterprise-corp.com;
        spf=softfail (sender IP 185.220.101.5 does not match enterprise-corp.com SPF record);
        dkim=fail (signature did not verify for enterprise-corp.com);
        dmarc=fail action=none header.from=enterprise-corp.com
Received-SPF: softfail (mx-inbound.enterprise-corp.com: domain of exec-dispatch@offshore-notice-desk.cc does not designate 185.220.101.5 as permitted sender)
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=offshore-notice-desk.cc; s=default;
        bh=9Xkzj3K2...; b=LkzWq01...
X-Originating-IP: [185.220.101.5]
From: "Satya Nadella (CEO)" <satya.nadella@enterprise-corp.com>
Reply-To: <ceo.priority.private@mail-forward-relay.com>
To: "Chief Financial Officer" <victim-cfo@enterprise-corp.com>
Subject: CONFIDENTIAL & URGENT: Acquisition Deposit - Process Wire Transfer Today
Date: Fri, 04 Sep 2026 14:18:22 -0700
Message-ID: <20260904141822.A89F01@enterprise-corp.com>
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8

Hi,

Are you currently at your desk? 

We are finalizing an expedited confidential acquisition transaction before market close today. I need you to initiate a wire transfer of $148,500 immediately to our vendor escrow account. 

Do not call or discuss this via Slack as our board NDA is strictly active until Monday's official press release. Please reply to this email immediately with confirmation so I can forward the beneficiary account routing details.

Immediate action required within the next 2 hours.

Regards,
Satya Nadella
Chief Executive Officer
Enterprise Corp Global`
  },
  {
    id: 'sample-m365-harvest',
    title: 'Microsoft 365 Password Expiry (Credential Harvester)',
    category: 'credential_harvest',
    badge: 'Credential Theft',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-950/40',
    difficulty: 'Easy Spot',
    scenario: 'Fake Microsoft 365 tenant notification threatening lockout unless employee verifies their active SSO password on a harvested login page.',
    learningClues: [
      'Authentic Microsoft notices never provide a direct link to "keep your current password"',
      'Link points to untrusted gTLD (.xyz) rather than *.microsoft.com or *.microsoftonline.com',
      'DKIM is absent and DMARC returns fail with p=reject on microsoft.com'
    ],
    description: 'Lookalike domain, suspicious urgent wording, credential harvesting portal link.',
    rawText: `Delivered-To: employee.jane@target-firm.org
Received: by 40.92.74.20 with SMTP id eop-mta-01;
        Thu, 03 Sep 2026 09:15:20 -0400
Received: from exit-gw-01.offshore-transit.sc (exit-gw-01.offshore-transit.sc [45.154.255.89])
        by mx01.target-firm.org (Postfix) with ESMTPS id 98ZPA81K
        for <employee.jane@target-firm.org>; Thu, 03 Sep 2026 09:14:48 -0400
Return-Path: <security-noreply@microsoft-tenant-auth-portal.com>
Authentication-Results: mx01.target-firm.org;
        spf=none (no SPF record for microsoft-tenant-auth-portal.com);
        dkim=none;
        dmarc=fail (p=reject) header.from=microsoft.com
X-Originating-IP: [45.154.255.89]
From: "Microsoft Security Operations" <account-protection@microsoft.com>
To: <employee.jane@target-firm.org>
Subject: URGENT: Your Microsoft 365 Password Expires in 24 Hours - Keep Current Password
Date: Thu, 03 Sep 2026 09:14:12 -0400
Message-ID: <MS365-SEC-202609030914@microsoft.com>
Content-Type: text/plain; charset=UTF-8

Dear Microsoft 365 User,

Your corporate domain single sign-on (SSO) password is scheduled to expire in 24 hours. Failure to update will result in immediate suspension of Outlook, OneDrive, and Teams access.

To retain your current password and prevent service interruption, click the secure verification link below immediately:

https://portal-login-microsoft-secure-auth.xyz/verify-token?id=99283

Verify within 24 hours to prevent account lockout.

Microsoft Security Operations Center
One Microsoft Way, Redmond, WA 98052`
  },
  {
    id: 'sample-legit-github',
    title: 'Legitimate GitHub Security Alert (Clean Email)',
    category: 'legitimate',
    badge: 'Legitimate / Clean',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40',
    difficulty: 'Easy Spot',
    scenario: 'Dependabot automated advisory notification sent from genuine GitHub SMTP infrastructure with full cryptographic alignment.',
    learningClues: [
      'SPF pass from official GitHub IP range (140.82.112.4)',
      'Valid cryptographic DKIM signature signed with GitHub domain key (s=pf2023)',
      'DMARC pass with strict rejection alignment (dis=NONE)'
    ],
    description: 'Fully aligned SPF pass, DKIM pass, DMARC pass from genuine GitHub infrastructure.',
    rawText: `Delivered-To: dev-lead@mycompany.io
Received: by 209.85.220.41 with SMTP id k18csp128710gqh;
        Wed, 02 Sep 2026 11:32:04 -0700 (PDT)
Received: from smtp.github.com (smtp.github.com [140.82.112.4])
        by mx.google.com with ESMTPS id f19si421921plm.12.2026.09.02.11.32.03
        for <dev-lead@mycompany.io>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Wed, 02 Sep 2026 11:32:03 -0700 (PDT)
Return-Path: <noreply@github.com>
Authentication-Results: mx.google.com;
        dkim=pass header.i=@github.com header.s=pf2023 header.b=bM291Q9;
        spf=pass (google.com: domain of noreply@github.com designates 140.82.112.4 as permitted sender) smtp.mailfrom=noreply@github.com;
        dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=github.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=github.com;
        s=pf2023; t=1756837923;
        h=from:to:subject:date:message-id:mime-version:content-type;
        bh=uK8s21098XZa=; b=bM291Q9129849281...
From: "GitHub" <noreply@github.com>
To: <dev-lead@mycompany.io>
Subject: [GitHub] Security advisory alert: Dependabot found 1 high severity vulnerability
Date: Wed, 02 Sep 2026 18:31:58 +0000
Message-ID: <github/repo-security/alert-991283@github.com>
Content-Type: text/plain; charset=UTF-8

Hello dev-lead,

Dependabot detected 1 high severity security vulnerability in package 'express' for your repository 'enterprise-api'.

Details:
- Package: express
- Affected versions: < 4.21.0
- Patched version: 4.21.2
- Advisory: CVE-2024-43796

You can review this advisory and create an automated pull request at:
https://github.com/mycompany/enterprise-api/security/dependabot/1

Thanks,
The GitHub Team`
  },
  {
    id: 'sample-bank-alert',
    title: 'Bank of America Unauthorized Login Alert',
    category: 'financial_fraud',
    badge: 'Financial Fraud',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-950/40',
    difficulty: 'Medium',
    scenario: 'Panic-inducing fake bank security alert alleging an unauthorized Russian login to bait the customer into visiting a mock banking portal.',
    learningClues: [
      'Origin IP traces to Amsterdam quasi-network bulletproof transit rather than Bank of America network',
      'Return-Path points to bounce-notice@bofa-security-alert-center.com (typosquatting domain)',
      'Artificial 12-hour deadline to freeze account funds'
    ],
    description: 'DMARC fail, Russian transit node, panic inducement, fake customer service number.',
    rawText: `Delivered-To: customer992@yahoo.com
Received: by 104.244.42.1 with SMTP id aws-relay-east;
        Tue, 01 Sep 2026 06:10:05 -0500
Received: from mta-pool-ams2.quasi-net.nl (mta-pool-ams2.quasi-net.nl [91.240.118.14])
        by mx-inbound.mail.yahoo.com with ESMTPS id 81Ka98Lkx2
        for <customer992@yahoo.com>; Tue, 01 Sep 2026 06:09:41 -0500
Return-Path: <bounce-notice@bofa-security-alert-center.com>
Authentication-Results: mx.yahoo.com;
        spf=fail (domain bankofamerica.com does not permit IP 91.240.118.14);
        dkim=fail;
        dmarc=fail (p=reject) header.from=bankofamerica.com
X-Originating-IP: [91.240.118.14]
From: "Bank of America Fraud Department" <fraud-alert@bankofamerica.com>
To: <customer992@yahoo.com>
Subject: CRITICAL: Unauthorized login attempt from Moscow, RU - Account Restricted
Date: Tue, 01 Sep 2026 06:08:12 -0500
Message-ID: <BOA-ALERT-20260901-0992@bankofamerica.com>
Content-Type: text/plain; charset=UTF-8

Bank of America Security Notice

We detected an unauthorized sign-in attempt to your online banking profile:
Location: Moscow, Russian Federation
Device: Linux x86_64
IP Address: 95.173.136.29
Time: Today at 04:12 AM EST

To safeguard your funds, your checking and debit card privileges have been temporarily frozen.

You must immediately verify your identity and confirm recent transactions:
Visit: https://bankofamerica-secure-identity-check.com/login?case=99812

If you do not verify your profile within 12 hours, your accounts will be permanently suspended pending branch visit.

Bank of America, N.A. Member FDIC.`
  },
  {
    id: 'sample-hr-payroll',
    title: 'HR Urgent Direct Deposit Change (Payroll BEC)',
    category: 'bec',
    badge: 'Payroll Scam',
    badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-950/40',
    difficulty: 'Subtle & Advanced',
    scenario: 'Sophisticated social engineering targeting HR payroll staff with an employee reply-to redirect from an African ISP.',
    learningClues: [
      'Originates from Nigerian ISP IP (198.51.100.45)',
      'Reply-To diverts replies to consultant-desk.org instead of the employee corporate mailbox',
      'SPF softfail indicates sending MTA is unauthorized'
    ],
    description: 'Impersonates employee requesting urgent bank routing change before payday.',
    rawText: `Delivered-To: hr-payroll@globalcorp.net
Received: by 209.85.220.41 with SMTP id mx-corp-01;
        Mon, 31 Aug 2026 08:04:15 -0400
Received: from static-dsl-lagos-88.spectranet.ng (static-dsl-lagos-88.spectranet.ng [198.51.100.45])
        by mx-in.globalcorp.net with ESMTP id 129AK928
        for <hr-payroll@globalcorp.net>; Mon, 31 Aug 2026 08:03:50 -0400
Return-Path: <employee-mail-forwarder@consultant-desk.org>
Authentication-Results: mx-in.globalcorp.net;
        spf=softfail (IP 198.51.100.45 not authorized for globalcorp.net);
        dkim=none;
        dmarc=fail header.from=globalcorp.net
X-Originating-IP: [198.51.100.45]
From: "Marcus Vance" <marcus.vance@globalcorp.net>
Reply-To: <marcus.vance.private@consultant-desk.org>
To: "Payroll Department" <hr-payroll@globalcorp.net>
Subject: Urgent: Change of Direct Deposit Bank Account Details for Next Payroll
Date: Mon, 31 Aug 2026 08:02:11 -0400
Message-ID: <20260831080211.786512@globalcorp.net>
Content-Type: text/plain; charset=UTF-8

Good morning Payroll,

I recently changed my primary bank account due to unauthorized card charges on my old checking account. 

Could you please update my direct deposit bank routing information immediately for this Friday's upcoming paycheck? 

Please confirm if you can update it today so I can send over my new voided check and account details right away.

Thank you,
Marcus Vance
Senior Systems Architect`
  },
  {
    id: 'sample-quishing-mfa',
    title: 'MFA Reset QR Code Phish ("Quishing")',
    category: 'qr_code_phish',
    badge: 'Quishing / QR Phish',
    badgeColor: 'border-purple-500/30 text-purple-400 bg-purple-950/40',
    difficulty: 'Subtle & Advanced',
    scenario: 'Evasion tactic using an embedded mobile QR code to bypass enterprise email gateway URL scanners and capture Okta/Authenticator tokens.',
    learningClues: [
      'Origin IP (185.244.25.109) traces to an offshore bulletproof server in Belize',
      'Return-Path uses suspicious .top TLD instead of internal corporate IT domain',
      'Instructs target to scan with personal phone camera, bypassing enterprise corporate browser protections'
    ],
    description: 'Bypasses standard URL filters by directing user to scan mobile QR code to migrate Authenticator app.',
    rawText: `Delivered-To: staff-operations@fintech-partners.com
Received: by 209.85.220.41 with SMTP id m20csp482910;
        Tue, 15 Sep 2026 10:14:22 -0400
Received: from mta-pool-01.cdn-delivery.top (cdn-delivery-node01.docu-sign-auth.top [185.244.25.109])
        by mx-inbound.fintech-partners.com (Postfix) with ESMTPS id 3Kp91Zb
        for <staff-operations@fintech-partners.com>; Tue, 15 Sep 2026 10:13:58 -0400
Return-Path: <it-migration@docu-sign-auth.top>
Authentication-Results: mx-inbound.fintech-partners.com;
        spf=fail (185.244.25.109 is not permitted by fintech-partners.com);
        dkim=fail;
        dmarc=fail (p=quarantine) header.from=fintech-partners.com
X-Originating-IP: [185.244.25.109]
From: "IT Global Security Helpdesk" <security-mfa@fintech-partners.com>
Reply-To: <admin-tokens@docu-sign-auth.top>
To: "Staff Member" <staff-operations@fintech-partners.com>
Subject: MANDATORY ACTION: Corporate MFA Device Migration - Authenticator Re-Enrollment
Date: Tue, 15 Sep 2026 10:12:00 -0400
Message-ID: <MFA-UPGRADE-20260915-001@fintech-partners.com>
Content-Type: text/plain; charset=UTF-8

Dear Fintech Partners Team Member,

Our IT department is upgrading our Multi-Factor Authentication (MFA) system to Microsoft / Okta FIDO2 security standards. All active employees must re-enroll their corporate mobile authenticator within 24 hours to prevent account lockout.

INSTRUCTIONS:
1. Open the Camera app on your mobile phone.
2. Scan the direct provisioning enrollment link below:

https://auth-mobile-qr-enrollment.docu-sign-auth.top/mfa/sync?emp=98124

3. Approve the push request and verify your current enterprise password when prompted.

Failure to re-enroll will result in temporary suspension of VPN and Single Sign-On (SSO) privileges starting tomorrow at 8:00 AM.

IT Infrastructure & Cyber Defense Center
Fintech Partners International`
  },
  {
    id: 'sample-dhl-malware',
    title: 'DHL Delivery Exception (Malware Stager)',
    category: 'malware_delivery',
    badge: 'Malware Stager',
    badgeColor: 'border-rose-500/30 text-rose-400 bg-rose-950/40',
    difficulty: 'Medium',
    scenario: 'Fake courier notification attempting to deliver a ZIP/VBS payload disguised as a shipping customs invoice.',
    learningClues: [
      'Origin IP (185.107.56.23) traces to a bulletproof server in Reykjavík, Iceland',
      'From address spoofs dhl.com while Return-Path points to delivery-notice.cc',
      'Download link serves an archive file (*.iso / *.vbs) rather than a PDF document'
    ],
    description: 'Spoofs DHL Express with failed delivery notification leading to an infected download server.',
    rawText: `Delivered-To: logistics-manager@acme-mfg.com
Received: by 104.244.42.1 with SMTP id relay-aws-03;
        Wed, 16 Sep 2026 04:31:18 -0500
Received: from gateway.dhl-package-tracker.cc (relay-jump-09.dhl-package-tracker.cc [185.107.56.23])
        by mx01.acme-mfg.com with ESMTPS id 92LA901P
        for <logistics-manager@acme-mfg.com>; Wed, 16 Sep 2026 04:30:44 -0500
Return-Path: <tracking-dispatch@dhl-package-tracker.cc>
Authentication-Results: mx01.acme-mfg.com;
        spf=fail (sender IP 185.107.56.23 is not authorized for dhl.com);
        dkim=fail;
        dmarc=fail (p=reject) header.from=dhl.com
X-Originating-IP: [185.107.56.23]
From: "DHL Express Support" <support@dhl.com>
To: <logistics-manager@acme-mfg.com>
Subject: DHL Express: Waybill #9821049281 - Delivery Exception & Customs Clearance Required
Date: Wed, 16 Sep 2026 04:29:10 -0500
Message-ID: <DHL-WAYBILL-20260916@dhl.com>
Content-Type: text/plain; charset=UTF-8

Dear Customer,

Your inbound DHL Express shipment (Waybill #9821049281) could not be delivered on September 15 due to unpaid customs clearance duty ($14.20 USD) and an incomplete delivery address.

To avoid return to sender, review the attached airway bill and confirm your delivery address:

Download Customs Clearance Documents & Receipt:
https://download-dhl-customs-docs.dhl-package-tracker.cc/invoices/Waybill-9821049281.zip

Please inspect and pay within 48 hours to schedule courier re-delivery.

DHL Express Global Dispatch Center
Excellence. Simply Delivered.`
  },
  {
    id: 'sample-academic-relay',
    title: 'Compromised University Mail Server Relay',
    category: 'credential_harvest',
    badge: 'Compromised Relay',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-950/40',
    difficulty: 'Subtle & Advanced',
    scenario: 'Adversary uses legitimate compromised academic infrastructure in Brazil to bypass spam filters and distribute financial aid phishing.',
    learningClues: [
      'Origin IP (177.105.44.82) is a real university network in São Paulo, Brazil (.br)',
      'Sender claims to be Student Financial Aid Office with urgency keywords',
      'SPF may return neutral or pass for the academic relay, but DKIM is unsigned and content is hostile'
    ],
    description: 'Attack originates from a real hijacked Brazilian academic relay, confounding basic IP reputation filters.',
    rawText: `Delivered-To: student-affairs@state-college.edu
Received: by 209.85.220.41 with SMTP id mx-relay-02;
        Thu, 17 Sep 2026 14:10:05 -0300
Received: from smtpgw-sec.pucsp-student.br (smtpgw-sec.pucsp-student.br [177.105.44.82])
        by mx-inbound.state-college.edu with ESMTP id 88Ka109L
        for <student-affairs@state-college.edu>; Thu, 17 Sep 2026 14:09:22 -0300
Return-Path: <bursar-aid-dispatch@pucsp-student.br>
Authentication-Results: mx-inbound.state-college.edu;
        spf=pass (smtpgw-sec.pucsp-student.br designates 177.105.44.82 as permitted sender);
        dkim=none;
        dmarc=none header.from=pucsp-student.br
X-Originating-IP: [177.105.44.82]
From: "Financial Aid Administration" <aid-grants@state-college.edu>
Reply-To: <student-scholarships-direct@consultant-desk.org>
To: "Enrolled Students" <student-affairs@state-college.edu>
Subject: URGENT: Federal Educational Grant Refund ($2,450) - Claim Disbursal Today
Date: Thu, 17 Sep 2026 14:08:00 -0300
Message-ID: <AID-GRANT-20260917@pucsp-student.br>
Content-Type: text/plain; charset=UTF-8

Dear Student,

You have an unclaimed educational grant refund of $2,450.00 from the Student Financial Aid Disbursal Office for the current academic semester.

Due to state fiscal deadlines, funds not claimed by 11:59 PM today will be returned to the general reserve fund.

Claim your direct deposit disbursal:
https://student-aid-direct-deposit-portal.xyz/claim?sid=991823

Please complete your direct deposit bank verification immediately to receive your payment within 24 hours.

Student Financial Aid Commission`
  },
  {
    id: 'sample-legit-paypal',
    title: 'Legitimate PayPal Payment Receipt (Clean Email)',
    category: 'legitimate',
    badge: 'Legitimate / Clean',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40',
    difficulty: 'Easy Spot',
    scenario: 'Standard transactional receipt from PayPal Inc. with strict SPF and DKIM 2048-bit cryptographic signatures passing DMARC.',
    learningClues: [
      'Origin IP (173.0.84.225) belongs to PayPal Inc. AS11643 in San Jose, California',
      'DKIM pass with selector header.s=pp-s1 and domain paypal.com',
      'DMARC pass with strict rejection policy enforced'
    ],
    description: 'Authentic transactional receipt with 100% cryptographic validation across SPF, DKIM, and DMARC.',
    rawText: `Delivered-To: buyer.user@gmail.com
Received: by 209.85.220.41 with SMTP id c19csp319020qkb;
        Fri, 18 Sep 2026 09:25:12 -0700 (PDT)
Received: from mx01.phx.paypal.com (mx01.phx.paypal.com [173.0.84.225])
        by mx.google.com with ESMTPS id p20si194821plm.14.2026.09.18.09.25.10
        for <buyer.user@gmail.com>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Fri, 18 Sep 2026 09:25:10 -0700 (PDT)
Return-Path: <service@paypal.com>
Authentication-Results: mx.google.com;
        dkim=pass header.i=@paypal.com header.s=pp-s1 header.b=X9b21A;
        spf=pass (google.com: domain of service@paypal.com designates 173.0.84.225 as permitted sender) smtp.mailfrom=service@paypal.com;
        dmarc=pass (p=REJECT sp=REJECT dis=NONE) header.from=paypal.com
DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=paypal.com;
        s=pp-s1; t=1758197110;
        h=from:to:subject:date:message-id:content-type;
        bh=o9Lks81729A=; b=X9b21AZq819280182...
From: "PayPal" <service@paypal.com>
To: <buyer.user@gmail.com>
Subject: Receipt for your payment to DigitalOcean LLC
Date: Fri, 18 Sep 2026 09:25:08 -0700
Message-ID: <1758197108.99281.paypal@paypal.com>
Content-Type: text/plain; charset=UTF-8

Hello Buyer,

You sent a payment of $42.00 USD to DigitalOcean LLC (billing@digitalocean.com).

Transaction Details:
- Transaction ID: 9KL88291X00918
- Date: September 18, 2026
- Payment method: PayPal Balance
- Merchant: DigitalOcean LLC

If you have questions about this payment, please log in to your account at:
https://www.paypal.com/myaccount/transactions/

Thank you for using PayPal.
PayPal, Inc.`
  }
];

export interface SampleEmail {
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  description: string;
  rawText: string;
}

export const SAMPLE_EMAILS: SampleEmail[] = [
  {
    id: 'sample-ceo-wire',
    title: 'Urgent Wire Transfer (CEO Impersonation)',
    badge: 'BEC / Spearphishing',
    badgeColor: 'border-red-500/30 text-red-400 bg-red-950/40',
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
    badge: 'Credential Theft',
    badgeColor: 'border-amber-500/30 text-amber-400 bg-amber-950/40',
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
    badge: 'Legitimate / Clean',
    badgeColor: 'border-emerald-500/30 text-emerald-400 bg-emerald-950/40',
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
    badge: 'Financial Fraud',
    badgeColor: 'border-red-500/30 text-red-400 bg-red-950/40',
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
    badge: 'Payroll Scam',
    badgeColor: 'border-orange-500/30 text-orange-400 bg-orange-950/40',
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
  }
];

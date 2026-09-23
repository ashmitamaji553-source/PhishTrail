import { OriginGeo } from '../types';

export function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim();
  if (clean === '127.0.0.1' || clean === 'localhost' || clean === '::1') return true;
  if (clean.startsWith('10.')) return true;
  if (clean.startsWith('192.168.')) return true;
  if (clean.startsWith('169.254.')) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(clean)) return true;
  return false;
}

// Known threat networks and common server hosts
const KNOWN_IP_REGISTRY: Record<string, Partial<OriginGeo>> = {
  // Russian / Eastern European suspicious bulletproof VPS
  '185.220.101.5': {
    country: 'Russia',
    countryCode: 'RU',
    city: 'St. Petersburg',
    region: 'Northwestern',
    isp: 'Selectel VPS & Bulletproof Relays',
    asn: 'AS49505',
    org: 'Selectel Hosting Ltd',
    lat: 59.9343,
    lon: 30.3351,
    reverseDns: 'relay-node-77.selectel-cloud.net'
  },
  // Bulletproof bullet hosting / DGA botnet in Belize
  '185.244.25.109': {
    country: 'Belize',
    countryCode: 'BZ',
    city: 'Belize City',
    region: 'Belize District',
    isp: 'Offshore Bulletproof Host Co.',
    asn: 'AS59882',
    org: 'Belize Cyber Relays Corp',
    lat: 17.5046,
    lon: -88.1962,
    reverseDns: 'cdn-delivery-node01.docu-sign-auth.top'
  },
  // Compromised university server in São Paulo
  '177.105.44.82': {
    country: 'Brazil',
    countryCode: 'BR',
    city: 'São Paulo',
    region: 'São Paulo',
    isp: 'Universidade Estadual Telecon',
    asn: 'AS28573',
    org: 'Compromised Academic SMTP Gateway',
    lat: -23.5505,
    lon: -46.6333,
    reverseDns: 'smtpgw-sec.pucsp-student.br'
  },
  // Compromised cloud IoT jump host in Reykjavik, Iceland
  '185.107.56.23': {
    country: 'Iceland',
    countryCode: 'IS',
    city: 'Reykjavík',
    region: 'Capital Region',
    isp: 'Nordic Bulletproof Cloud ehf',
    asn: 'AS44550',
    org: 'Reykjavik Datacenter Relays',
    lat: 64.1466,
    lon: -21.9426,
    reverseDns: 'relay-jump-09.dhl-package-tracker.cc'
  },
  // Legitimate PayPal Inc. infrastructure
  '173.0.84.225': {
    country: 'United States',
    countryCode: 'US',
    city: 'San Jose',
    region: 'California',
    isp: 'PayPal Inc.',
    asn: 'AS11643',
    org: 'PayPal Global Network Operations',
    lat: 37.3382,
    lon: -121.8863,
    reverseDns: 'mx01.phx.paypal.com'
  },
  '194.147.140.22': {
    country: 'Romania',
    countryCode: 'RO',
    city: 'Bucharest',
    region: 'Ilfov',
    isp: 'Bucuresti Host Fast Ltd',
    asn: 'AS208685',
    org: 'Host-VPS-Networks',
    lat: 44.4268,
    lon: 26.1025,
    reverseDns: 'mail-mta-3.secure-host-eu.ro'
  },
  '45.154.255.89': {
    country: 'Seychelles',
    countryCode: 'SC',
    city: 'Victoria',
    region: 'Mahé',
    isp: 'Offshore Privacy Transit',
    asn: 'AS62005',
    org: 'CyberShield Anonymous Transit',
    lat: -4.6191,
    lon: 55.4513,
    reverseDns: 'exit-gw-01.offshore-transit.sc'
  },
  '91.240.118.14': {
    country: 'Netherlands',
    countryCode: 'NL',
    city: 'Amsterdam',
    region: 'North Holland',
    isp: 'Quasi Networks Bulletproof Transit',
    asn: 'AS200000',
    org: 'Quasi Networks Ltd',
    lat: 52.3676,
    lon: 4.9041,
    reverseDns: 'mta-pool-ams2.quasi-net.nl'
  },
  '198.51.100.45': {
    country: 'Nigeria',
    countryCode: 'NG',
    city: 'Lagos',
    region: 'Lagos State',
    isp: 'Spectranet Broadband Nigeria',
    asn: 'AS37146',
    org: 'Spectranet 4G/LTE',
    lat: 6.5244,
    lon: 3.3792,
    reverseDns: 'static-dsl-lagos-88.spectranet.ng'
  },
  // Legitimate tech giants / mail services
  '140.82.112.4': {
    country: 'United States',
    countryCode: 'US',
    city: 'San Francisco',
    region: 'California',
    isp: 'GitHub / Microsoft Corp',
    asn: 'AS36459',
    org: 'GitHub Network Operations',
    lat: 37.7749,
    lon: -122.4194,
    reverseDns: 'smtp.github.com'
  },
  '209.85.220.41': {
    country: 'United States',
    countryCode: 'US',
    city: 'Mountain View',
    region: 'California',
    isp: 'Google LLC',
    asn: 'AS15169',
    org: 'Google Mail Delivery MTA',
    lat: 37.3861,
    lon: -122.0839,
    reverseDns: 'mail-sor-f41.google.com'
  },
  '40.92.74.20': {
    country: 'United States',
    countryCode: 'US',
    city: 'Redmond',
    region: 'Washington',
    isp: 'Microsoft Corporation',
    asn: 'AS8075',
    org: 'Exchange Online Protection',
    lat: 47.6740,
    lon: -122.1215,
    reverseDns: 'mail-eop-nam04.protection.outlook.com'
  },
  '198.2.180.12': {
    country: 'United States',
    countryCode: 'US',
    city: 'Atlanta',
    region: 'Georgia',
    isp: 'Mailchimp / The Rocket Science Group',
    asn: 'AS14782',
    org: 'Mailchimp MTA Service',
    lat: 33.7490,
    lon: -84.3880,
    reverseDns: 'mail180-12.atl41.mandrillapp.com'
  },
  '104.244.42.1': {
    country: 'United States',
    countryCode: 'US',
    city: 'Ashburn',
    region: 'Virginia',
    isp: 'Amazon Web Services',
    asn: 'AS16509',
    org: 'AWS Cloud EC2 Relays',
    lat: 39.0438,
    lon: -77.4874,
    reverseDns: 'ec2-104-244-42-1.compute-1.amazonaws.com'
  },
  '185.199.110.153': {
    country: 'United Kingdom',
    countryCode: 'GB',
    city: 'London',
    region: 'England',
    isp: 'Fastly CDN Edge Nodes',
    asn: 'AS54113',
    org: 'Fastly Inc',
    lat: 51.5074,
    lon: -0.1278,
    reverseDns: 'edge-lon-01.fastly.net'
  },
  '103.253.144.18': {
    country: 'Singapore',
    countryCode: 'SG',
    city: 'Singapore',
    region: 'Central',
    isp: 'SingTel Global Carrier Services',
    asn: 'AS7473',
    org: 'Singapore Telecommunications Ltd',
    lat: 1.3521,
    lon: 103.8198,
    reverseDns: 'mta-edge02.singtel.sg'
  }
};

// Deterministic geolocator fallback based on IP hashing
export function resolveIpGeo(ip: string): OriginGeo {
  const cleanIp = (ip || '').trim();

  if (isPrivateIp(cleanIp)) {
    return {
      ip: cleanIp || '127.0.0.1',
      country: 'Private Network',
      countryCode: 'LAN',
      city: 'Local Host',
      region: 'Internal Network',
      isp: 'Internal RFC1918 / Private Routing',
      asn: 'AS-PRIVATE',
      org: 'Local Subnet',
      lat: 38.8951,
      lon: -77.0364,
      reverseDns: 'localhost.localdomain',
      isPrivate: true
    };
  }

  // Check exact lookup
  if (KNOWN_IP_REGISTRY[cleanIp]) {
    const data = KNOWN_IP_REGISTRY[cleanIp];
    return {
      ip: cleanIp,
      country: data.country || 'Unknown',
      countryCode: data.countryCode || 'UN',
      city: data.city || 'Unknown',
      region: data.region || 'Region',
      isp: data.isp || 'Internet Service Provider',
      asn: data.asn || 'AS0000',
      org: data.org || 'Autonomous System',
      lat: data.lat || 0,
      lon: data.lon || 0,
      reverseDns: data.reverseDns || `ip-${cleanIp.replace(/\./g, '-')}.net`,
      isPrivate: false
    };
  }

  // Deterministic geo mapping for any arbitrary IP
  const octets = cleanIp.split('.').map(o => parseInt(o, 10) || 0);
  const hash = (octets[0] * 31 + octets[1] * 17 + octets[2] * 7 + (octets[3] || 0)) % 1000;

  const candidateRegions = [
    { country: 'United States', countryCode: 'US', city: 'Dallas', region: 'Texas', isp: 'DigitalOcean Cloud Droplets', asn: 'AS14061', lat: 32.7767, lon: -96.7970 },
    { country: 'Germany', countryCode: 'DE', city: 'Frankfurt', region: 'Hesse', isp: 'Hetzner Online GmbH', asn: 'AS24940', lat: 50.1109, lon: 8.6821 },
    { country: 'Russia', countryCode: 'RU', city: 'Moscow', region: 'Central Federal', isp: 'Rostelecom Data Transit', asn: 'AS12389', lat: 55.7558, lon: 37.6173 },
    { country: 'France', countryCode: 'FR', city: 'Paris', region: 'Île-de-France', isp: 'OVHcloud Dedicated MTA', asn: 'AS16276', lat: 48.8566, lon: 2.3522 },
    { country: 'China', countryCode: 'CN', city: 'Shenzhen', region: 'Guangdong', isp: 'Tencent Cloud Computing', asn: 'AS45090', lat: 22.5431, lon: 114.0579 },
    { country: 'Brazil', countryCode: 'BR', city: 'São Paulo', region: 'São Paulo', isp: 'Claro Brasil Telecom', asn: 'AS28573', lat: -23.5505, lon: -46.6333 },
    { country: 'India', countryCode: 'IN', city: 'Mumbai', region: 'Maharashtra', isp: 'Tata Communications Ltd', asn: 'AS4755', lat: 19.0760, lon: 72.8777 },
    { country: 'Netherlands', countryCode: 'NL', city: 'Rotterdam', region: 'South Holland', isp: 'Leaseweb Global B.V.', asn: 'AS60781', lat: 51.9244, lon: 4.4777 },
    { country: 'Ukraine', countryCode: 'UA', city: 'Kyiv', region: 'Kyiv City', isp: 'Kyivstar GSM / Data Systems', asn: 'AS15895', lat: 50.4501, lon: 30.5234 },
    { country: 'United Kingdom', countryCode: 'GB', city: 'Manchester', region: 'North West', isp: 'Vodafone Enterprise Transit', asn: 'AS5378', lat: 53.4808, lon: -2.2426 }
  ];

  const pick = candidateRegions[hash % candidateRegions.length];

  return {
    ip: cleanIp,
    country: pick.country,
    countryCode: pick.countryCode,
    city: pick.city,
    region: pick.region,
    isp: pick.isp,
    asn: pick.asn,
    org: `${pick.isp} Infrastructure`,
    lat: pick.lat + ((octets[3] % 20) - 10) * 0.05,
    lon: pick.lon + ((octets[2] % 20) - 10) * 0.05,
    reverseDns: `mta-${octets[0]}-${octets[1]}.transit-peer.net`,
    isPrivate: false
  };
}

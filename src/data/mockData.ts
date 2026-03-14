// Mock data for SEAGuard prototype — realistic ASEAN geography

export type ZoneLevel = 'evacuation' | 'caution' | 'danger';
export type DisasterType = 'flood' | 'landslide' | 'earthquake' | 'typhoon';
export type AlertLevel = 1 | 2 | 3;

export interface DisasterZone {
  id: string;
  center: [number, number];
  radius: number;
  level: ZoneLevel;
  disasterType: DisasterType;
  name: string;
  country: string;
  description: string;
}

export interface PopulationCluster {
  id: string;
  position: [number, number];
  count: number;
  zoneId: string;
  disasterType: DisasterType;
  severity: ZoneLevel;
  areaName: string;
  country: string;
  snapshotUrl: string;
  sarContact: { name: string; phone: string; team: string };
}

export interface Alert {
  id: string;
  level: AlertLevel;
  title: string;
  disasterType: DisasterType;
  area: string;
  country: string;
  time: string;
  action: string;
  read: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  category: 'sar' | 'ambulance' | 'police' | 'fire' | 'hospital';
  phone: string;
  distance: string;
  status: 'active' | 'busy';
  country: string;
  city: string;
  lat: number;
  lng: number;
}

export interface DisasterReport {
  id: string;
  country: string;
  disasterType: DisasterType;
  severity: ZoneLevel;
  date: string;
  affectedPopulation: number;
  title: string;
  summary: string;
  timeline: { time: string; event: string }[];
}

export interface DisasterNews {
  id: string;
  title: string;
  summary: string;
  source: string;
  date: string;
  imageUrl: string;
  country: string;
  disasterType: DisasterType;
  isGlobal: boolean;
  videoUrl?: string;
  sourceUrl?: string;
}

export interface CountryStatus {
  country: string;
  activeDisasters: number;
  affectedPopulation: number;
  alertLevel: ZoneLevel;
  recentEvents: string[];
  prediction: string;
}

export interface SurvivalTip {
  id: string;
  title: string;
  icon: string;
  description: string;
  disasterType: DisasterType | 'general';
  steps: string[];
}

// Jakarta area floods
export const disasterZones: DisasterZone[] = [
  {
    id: 'z1', center: [-6.200, 106.845], radius: 2500,
    level: 'danger', disasterType: 'flood', name: 'North Jakarta Flood Zone',
    country: 'Indonesia', description: 'Severe flooding from Ciliwung River overflow',
  },
  {
    id: 'z2', center: [-6.180, 106.830], radius: 1800,
    level: 'caution', disasterType: 'flood', name: 'Kelapa Gading Alert Area',
    country: 'Indonesia', description: 'Rising water levels detected by drone surveillance',
  },
  {
    id: 'z3', center: [-6.220, 106.860], radius: 2000,
    level: 'caution', disasterType: 'flood', name: 'East Jakarta Monitoring',
    country: 'Indonesia', description: 'Potential flood path from upstream',
  },
  {
    id: 'z4', center: [-6.260, 106.810], radius: 3000,
    level: 'evacuation', disasterType: 'flood', name: 'South Jakarta Evacuation Shelter',
    country: 'Indonesia', description: 'Designated evacuation area with shelters and medical aid',
  },
  // Philippines landslide
  {
    id: 'z5', center: [14.420, 121.040], radius: 1500,
    level: 'danger', disasterType: 'landslide', name: 'Rizal Province Landslide',
    country: 'Philippines', description: 'Active landslide zone after heavy rain',
  },
  {
    id: 'z6', center: [14.440, 121.060], radius: 2000,
    level: 'caution', disasterType: 'landslide', name: 'Antipolo Highland Warning',
    country: 'Philippines', description: 'Soil instability detected via drone imaging',
  },
  {
    id: 'z7', center: [14.460, 121.080], radius: 2500,
    level: 'evacuation', disasterType: 'landslide', name: 'Antipolo Evacuation Center',
    country: 'Philippines', description: 'Evacuation center with capacity for 2,000 people',
  },
  // Thailand floods
  {
    id: 'z8', center: [13.760, 100.520], radius: 2200,
    level: 'caution', disasterType: 'flood', name: 'Chao Phraya Overflow Risk',
    country: 'Thailand', description: 'River level approaching critical threshold',
  },
  {
    id: 'z9', center: [13.740, 100.500], radius: 2800,
    level: 'evacuation', disasterType: 'flood', name: 'Bangkok Central Shelter',
    country: 'Thailand', description: 'Protected evacuation area with flood barriers',
  },
  // Vietnam
  {
    id: 'z10', center: [16.060, 108.220], radius: 2000,
    level: 'danger', disasterType: 'typhoon', name: 'Da Nang Typhoon Impact Zone',
    country: 'Vietnam', description: 'Direct typhoon impact area — immediate evacuation required',
  },
  {
    id: 'z11', center: [16.080, 108.200], radius: 2500,
    level: 'evacuation', disasterType: 'typhoon', name: 'Da Nang Evacuation Hub',
    country: 'Vietnam', description: 'Government-designated typhoon shelter',
  },
];

export const populationClusters: PopulationCluster[] = [
  {
    id: 'p1', position: [-6.195, 106.850], count: 342, zoneId: 'z1',
    disasterType: 'flood', severity: 'danger', areaName: 'Kampung Melayu',
    country: 'Indonesia', snapshotUrl: '/placeholder.svg',
    sarContact: { name: 'BASARNAS Team Alpha', phone: '+62-21-6541-308', team: 'SAR Team A' },
  },
  {
    id: 'p2', position: [-6.205, 106.840], count: 187, zoneId: 'z1',
    disasterType: 'flood', severity: 'danger', areaName: 'Bidara Cina',
    country: 'Indonesia', snapshotUrl: '/placeholder.svg',
    sarContact: { name: 'BASARNAS Team Bravo', phone: '+62-21-6541-309', team: 'SAR Team B' },
  },
  {
    id: 'p3', position: [-6.175, 106.825], count: 95, zoneId: 'z2',
    disasterType: 'flood', severity: 'caution', areaName: 'Kelapa Gading Timur',
    country: 'Indonesia', snapshotUrl: '/placeholder.svg',
    sarContact: { name: 'Jakarta Rescue Unit', phone: '+62-21-6542-100', team: 'Rescue Unit 3' },
  },
  {
    id: 'p4', position: [14.425, 121.045], count: 78, zoneId: 'z5',
    disasterType: 'landslide', severity: 'danger', areaName: 'Barangay San Jose',
    country: 'Philippines', snapshotUrl: '/placeholder.svg',
    sarContact: { name: 'NDRRMC Rescue', phone: '+63-2-8911-1406', team: 'NDRRMC Unit 1' },
  },
  {
    id: 'p5', position: [13.755, 100.525], count: 210, zoneId: 'z8',
    disasterType: 'flood', severity: 'caution', areaName: 'Bang Kho Laem',
    country: 'Thailand', snapshotUrl: '/placeholder.svg',
    sarContact: { name: 'Thai DDPM Team', phone: '+66-2-637-3000', team: 'DDPM Unit 5' },
  },
  {
    id: 'p6', position: [16.065, 108.225], count: 156, zoneId: 'z10',
    disasterType: 'typhoon', severity: 'danger', areaName: 'Hai Chau District',
    country: 'Vietnam', snapshotUrl: '/placeholder.svg',
    sarContact: { name: 'Vietnam PCTT', phone: '+84-236-3822-333', team: 'PCTT Unit 2' },
  },
];

export const alerts: Alert[] = [
  {
    id: 'a1', level: 3, title: 'EVACUATE NOW — North Jakarta', disasterType: 'flood',
    area: 'Kampung Melayu, North Jakarta', country: 'Indonesia',
    time: '2 min ago', action: 'Move to South Jakarta Evacuation Shelter immediately. Follow marked evacuation routes.',
    read: false,
  },
  {
    id: 'a2', level: 2, title: 'Flood Warning — Kelapa Gading', disasterType: 'flood',
    area: 'Kelapa Gading, North Jakarta', country: 'Indonesia',
    time: '15 min ago', action: 'Prepare emergency kit. Be ready to evacuate within 30 minutes.',
    read: false,
  },
  {
    id: 'a3', level: 3, title: 'Landslide Alert — Rizal Province', disasterType: 'landslide',
    area: 'Barangay San Jose, Rizal', country: 'Philippines',
    time: '8 min ago', action: 'Evacuate uphill immediately. Avoid valleys and river paths.',
    read: true,
  },
  {
    id: 'a4', level: 1, title: 'Monitor — Chao Phraya River', disasterType: 'flood',
    area: 'Bang Kho Laem, Bangkok', country: 'Thailand',
    time: '1 hr ago', action: 'Stay informed. Monitor water levels and official announcements.',
    read: true,
  },
  {
    id: 'a5', level: 2, title: 'Typhoon Warning — Da Nang', disasterType: 'typhoon',
    area: 'Hai Chau, Da Nang', country: 'Vietnam',
    time: '25 min ago', action: 'Secure property and prepare to relocate to nearest evacuation center.',
    read: false,
  },
];

export const emergencyContacts: EmergencyContact[] = [
  { id: 'c1', name: 'BASARNAS SAR HQ', category: 'sar', phone: '+62-21-6541-308', distance: '2.1 km', status: 'active', country: 'Indonesia', city: 'Jakarta', lat: -6.195, lng: 106.845 },
  { id: 'c2', name: 'RS Fatmawati Hospital', category: 'hospital', phone: '+62-21-7501-524', distance: '4.5 km', status: 'active', country: 'Indonesia', city: 'Jakarta', lat: -6.290, lng: 106.797 },
  { id: 'c3', name: 'Jakarta Police District', category: 'police', phone: '110', distance: '1.8 km', status: 'active', country: 'Indonesia', city: 'Jakarta', lat: -6.210, lng: 106.850 },
  { id: 'c4', name: 'Ambulance Emergency', category: 'ambulance', phone: '118', distance: '3.2 km', status: 'busy', country: 'Indonesia', city: 'Jakarta', lat: -6.220, lng: 106.830 },
  { id: 'c5', name: 'Fire Department Jakarta', category: 'fire', phone: '113', distance: '2.7 km', status: 'active', country: 'Indonesia', city: 'Jakarta', lat: -6.180, lng: 106.840 },
  { id: 'c6', name: 'NDRRMC Philippines', category: 'sar', phone: '+63-2-8911-1406', distance: '—', status: 'active', country: 'Philippines', city: 'Manila', lat: 14.420, lng: 121.040 },
  { id: 'c7', name: 'Thai DDPM', category: 'sar', phone: '+66-2-637-3000', distance: '—', status: 'active', country: 'Thailand', city: 'Bangkok', lat: 13.760, lng: 100.520 },
  { id: 'c8', name: 'RS Cipto Mangunkusumo', category: 'hospital', phone: '+62-21-3100-302', distance: '5.1 km', status: 'active', country: 'Indonesia', city: 'Jakarta', lat: -6.196, lng: 106.845 },
  { id: 'c9', name: 'Pemadam Kebakaran Surabaya', category: 'fire', phone: '+62-31-350-8280', distance: '—', status: 'active', country: 'Indonesia', city: 'Surabaya', lat: -7.250, lng: 112.750 },
  { id: 'c10', name: 'Vietnam PCTT Da Nang', category: 'sar', phone: '+84-236-3822-333', distance: '—', status: 'active', country: 'Vietnam', city: 'Da Nang', lat: 16.060, lng: 108.220 },
];

export const disasterReports: DisasterReport[] = [
  {
    id: 'r1', country: 'Indonesia', disasterType: 'flood', severity: 'danger',
    date: '2026-02-23', affectedPopulation: 12500,
    title: 'Jakarta Metropolitan Flooding',
    summary: 'Ciliwung River overflow caused severe flooding across North Jakarta affecting 12,500+ residents.',
    timeline: [
      { time: '06:00', event: 'Heavy rainfall begins across Greater Jakarta' },
      { time: '09:30', event: 'Ciliwung River reaches critical level' },
      { time: '10:15', event: 'Flooding reported in Kampung Melayu' },
      { time: '11:00', event: 'Evacuation order issued for North Jakarta' },
      { time: '12:30', event: 'Drone surveillance deployed for population mapping' },
    ],
  },
  {
    id: 'r2', country: 'Philippines', disasterType: 'landslide', severity: 'danger',
    date: '2026-02-22', affectedPopulation: 3200,
    title: 'Rizal Province Landslide',
    summary: 'Continuous rainfall triggered landslide in Rizal Province highlands.',
    timeline: [
      { time: '14:00', event: 'Soil cracks detected by drone patrol' },
      { time: '16:00', event: 'Warning level raised to Siaga 2' },
      { time: '18:30', event: 'Landslide occurred in Barangay San Jose' },
      { time: '19:00', event: 'Emergency response teams deployed' },
    ],
  },
  {
    id: 'r3', country: 'Thailand', disasterType: 'flood', severity: 'caution',
    date: '2026-02-23', affectedPopulation: 5800,
    title: 'Chao Phraya River Rising',
    summary: 'River levels approaching critical threshold in Bangkok metropolitan area.',
    timeline: [
      { time: '08:00', event: 'Water level monitoring shows steady rise' },
      { time: '12:00', event: 'Siaga 1 issued for riverside communities' },
      { time: '15:00', event: 'Preventive sandbagging initiated' },
    ],
  },
  {
    id: 'r4', country: 'Vietnam', disasterType: 'typhoon', severity: 'danger',
    date: '2026-02-24', affectedPopulation: 8900,
    title: 'Typhoon Approaching Da Nang',
    summary: 'Category 3 typhoon expected to make landfall in central Vietnam within 24 hours.',
    timeline: [
      { time: '00:00', event: 'Typhoon detected 400km east of Da Nang' },
      { time: '06:00', event: 'National warning issued for central coast' },
      { time: '12:00', event: 'Mass evacuation of coastal areas begins' },
    ],
  },
];

export const disasterNews: DisasterNews[] = [
  {
    id: 'n1', title: 'Jakarta Floods Displace Thousands as Rainy Season Intensifies',
    summary: 'North Jakarta residents evacuated as Ciliwung River overflows. BASARNAS deploys drone surveillance for population mapping and rescue coordination.',
    source: 'BNPB Indonesia', date: '2026-02-24', imageUrl: '/placeholder.svg',
    country: 'Indonesia', disasterType: 'flood', isGlobal: false,
    sourceUrl: 'https://bnpb.go.id',
  },
  {
    id: 'n2', title: 'Typhoon Nearing Vietnam Coast — Evacuations Underway',
    summary: 'Category 3 typhoon expected to make landfall near Da Nang. Over 8,000 residents relocated to inland evacuation centers.',
    source: 'Vietnam PCTT', date: '2026-02-24', imageUrl: '/placeholder.svg',
    country: 'Vietnam', disasterType: 'typhoon', isGlobal: false,
    sourceUrl: 'https://phongchongthientai.mard.gov.vn',
  },
  {
    id: 'n3', title: 'ASEAN Disaster Risk Index 2026 Released',
    summary: 'New report highlights increasing flood and typhoon risks across Southeast Asia. Indonesia, Philippines, and Vietnam ranked as highest risk.',
    source: 'AHA Centre', date: '2026-02-23', imageUrl: '/placeholder.svg',
    country: '', disasterType: 'flood', isGlobal: true,
    sourceUrl: 'https://ahacentre.org',
  },
  {
    id: 'n4', title: 'Landslide Claims Lives in Rizal Province',
    summary: 'Heavy monsoon rains trigger devastating landslide in Rizal. NDRRMC rescue teams continue search operations.',
    source: 'NDRRMC Philippines', date: '2026-02-22', imageUrl: '/placeholder.svg',
    country: 'Philippines', disasterType: 'landslide', isGlobal: false,
    sourceUrl: 'https://ndrrmc.gov.ph',
  },
  {
    id: 'n5', title: 'UN Warns of Increased Disaster Frequency in Asia-Pacific',
    summary: 'United Nations report projects 40% increase in extreme weather events across Asia-Pacific by 2030, urging immediate preparedness measures.',
    source: 'UN OCHA', date: '2026-02-21', imageUrl: '/placeholder.svg',
    country: '', disasterType: 'flood', isGlobal: true,
    sourceUrl: 'https://www.unocha.org',
  },
  {
    id: 'n6', title: 'Bangkok Flood Barriers Tested as River Levels Rise',
    summary: 'Bangkok authorities activate flood barrier systems along Chao Phraya River. Residents advised to monitor official channels.',
    source: 'Thai DDPM', date: '2026-02-23', imageUrl: '/placeholder.svg',
    country: 'Thailand', disasterType: 'flood', isGlobal: false,
    sourceUrl: 'https://www.disaster.go.th',
  },
];

export const countryStatuses: CountryStatus[] = [
  {
    country: 'Indonesia', activeDisasters: 3, affectedPopulation: 18500, alertLevel: 'danger',
    recentEvents: ['Jakarta Flooding', 'Bandung Landslide Risk', 'Java Earthquake Monitoring'],
    prediction: 'Heavy rainfall expected to continue through March. High flood risk in northern Java coastal areas.',
  },
  {
    country: 'Philippines', activeDisasters: 2, affectedPopulation: 5200, alertLevel: 'danger',
    recentEvents: ['Rizal Landslide', 'Cebu Flood Watch'],
    prediction: 'Monsoon season approaching. Elevated landslide risk in highland provinces.',
  },
  {
    country: 'Thailand', activeDisasters: 1, affectedPopulation: 5800, alertLevel: 'caution',
    recentEvents: ['Chao Phraya River Rising'],
    prediction: 'River levels expected to stabilize within 48 hours if rainfall decreases.',
  },
  {
    country: 'Vietnam', activeDisasters: 1, affectedPopulation: 8900, alertLevel: 'danger',
    recentEvents: ['Typhoon Approaching Da Nang'],
    prediction: 'Typhoon landfall expected within 24 hours. Central coast at highest risk.',
  },
  {
    country: 'Malaysia', activeDisasters: 0, affectedPopulation: 0, alertLevel: 'evacuation',
    recentEvents: [],
    prediction: 'No active threats. Monsoon transition period — low risk.',
  },
  {
    country: 'Myanmar', activeDisasters: 1, affectedPopulation: 3100, alertLevel: 'caution',
    recentEvents: ['Irrawaddy Delta Flood Watch'],
    prediction: 'Moderate flooding possible in delta region. Monitoring ongoing.',
  },
  {
    country: 'Cambodia', activeDisasters: 0, affectedPopulation: 0, alertLevel: 'evacuation',
    recentEvents: [],
    prediction: 'Stable conditions. Mekong river levels within normal range.',
  },
  {
    country: 'Laos', activeDisasters: 0, affectedPopulation: 0, alertLevel: 'evacuation',
    recentEvents: [],
    prediction: 'No immediate threats. Seasonal flooding possible from April.',
  },
  {
    country: 'Singapore', activeDisasters: 0, affectedPopulation: 0, alertLevel: 'evacuation',
    recentEvents: [],
    prediction: 'Low risk. Urban drainage systems operating normally.',
  },
  {
    country: 'Brunei', activeDisasters: 0, affectedPopulation: 0, alertLevel: 'evacuation',
    recentEvents: [],
    prediction: 'No active threats detected.',
  },
];

export const survivalTips: SurvivalTip[] = [
  {
    id: 's1', title: 'During a Flood', icon: '🌊', disasterType: 'flood',
    description: 'Quick actions that can save your life during flooding',
    steps: [
      'Move to higher ground immediately',
      'Avoid walking through flowing water — 15cm can knock you down',
      'Do not drive through flooded roads',
      'Disconnect electrical equipment if safe to do so',
      'Keep emergency kit with water, flashlight, and first aid',
    ],
  },
  {
    id: 's2', title: 'Landslide Warning Signs', icon: '⛰️', disasterType: 'landslide',
    description: 'Recognize these signs and evacuate early',
    steps: [
      'New cracks in ground or walls',
      'Tilting trees, fences, or utility poles',
      'Sudden change in water flow or color in streams',
      'Rumbling sounds from the hillside',
      'Move away from the path of a landslide — go to high ground perpendicular to the slide',
    ],
  },
  {
    id: 's3', title: 'Typhoon Preparedness', icon: '🌀', disasterType: 'typhoon',
    description: 'Prepare before the storm arrives',
    steps: [
      'Board up windows and secure outdoor objects',
      'Stock 3 days of water and non-perishable food',
      'Charge all devices and portable batteries',
      'Know your nearest evacuation shelter location',
      'Stay indoors and away from windows during the storm',
    ],
  },
  {
    id: 's4', title: 'Emergency Kit Essentials', icon: '🎒', disasterType: 'general',
    description: 'Always have these items ready',
    steps: [
      'Water: 3L per person per day for 3 days',
      'First aid kit with personal medications',
      'Flashlight with extra batteries',
      'Important documents in waterproof bag',
      'Fully charged power bank',
      'Whistle to signal for help',
    ],
  },
];

export const educationGuides = [
  {
    id: 'e1', title: 'What to Do During a Flood',
    icon: '🌊', items: [
      'Move to higher ground immediately',
      'Avoid walking through flowing water',
      'Do not drive through flooded roads',
      'Disconnect electrical equipment if safe',
      'Follow official evacuation routes',
      'Keep emergency kit ready at all times',
    ],
  },
  {
    id: 'e2', title: 'Landslide Warning Signs',
    icon: '⛰️', items: [
      'New cracks in ground or pavement',
      'Tilting trees or utility poles',
      'Sudden increase or decrease in water flow',
      'Rumbling sounds from the hillside',
      'Doors or windows sticking for first time',
      'Bulging ground at base of slope',
    ],
  },
  {
    id: 'e3', title: 'Emergency Preparedness Checklist',
    icon: '✅', items: [
      'Store 3-day supply of water (1 gallon/person/day)',
      'Pack essential medications',
      'Keep important documents in waterproof bag',
      'Charge phone and portable battery',
      'Know your evacuation route',
      'Establish family meeting point',
    ],
  },
];

export const aseanCountries = [
  'Indonesia', 'Philippines', 'Thailand', 'Malaysia', 'Vietnam',
  'Myanmar', 'Cambodia', 'Laos', 'Singapore', 'Brunei',
];

export const aseanLanguages: Record<string, { name: string; nativeName: string }> = {
  'Indonesia': { name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  'Philippines': { name: 'Filipino', nativeName: 'Filipino' },
  'Thailand': { name: 'Thai', nativeName: 'ภาษาไทย' },
  'Malaysia': { name: 'Malay', nativeName: 'Bahasa Melayu' },
  'Vietnam': { name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  'Myanmar': { name: 'Burmese', nativeName: 'မြန်မာစာ' },
  'Cambodia': { name: 'Khmer', nativeName: 'ភាសាខ្មែរ' },
  'Laos': { name: 'Lao', nativeName: 'ພາສາລາວ' },
  'Singapore': { name: 'English', nativeName: 'English' },
  'Brunei': { name: 'Malay', nativeName: 'Bahasa Melayu' },
};

export const countryFlags: Record<string, string> = {
  'Indonesia': '🇮🇩',
  'Philippines': '🇵🇭',
  'Thailand': '🇹🇭',
  'Malaysia': '🇲🇾',
  'Vietnam': '🇻🇳',
  'Myanmar': '🇲🇲',
  'Cambodia': '🇰🇭',
  'Laos': '🇱🇦',
  'Singapore': '🇸🇬',
  'Brunei': '🇧🇳',
};

export const countryDefaultCenters: Record<string, [number, number]> = {
  'Indonesia': [-6.200, 106.845],
  'Philippines': [14.420, 121.040],
  'Thailand': [13.760, 100.520],
  'Malaysia': [3.139, 101.687],
  'Vietnam': [16.060, 108.220],
  'Myanmar': [16.866, 96.196],
  'Cambodia': [11.562, 104.888],
  'Laos': [17.975, 102.633],
  'Singapore': [1.352, 103.820],
  'Brunei': [4.930, 114.950],
};

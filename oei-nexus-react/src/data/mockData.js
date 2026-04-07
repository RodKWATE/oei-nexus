// ── Navigation ─────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { id: 'home',    label: '🏠 Home' },
  { id: 'score',   label: '📊 Score' },
  { id: 'explorer',label: '🌍 Explorer' },
  { id: 'impact',  label: '📈 Dashboard' },
  { id: 'finance', label: '💰 Finance' },
  { id: 'ai',      label: '🤖 AI Advisor' },
  { id: 'academy', label: '🎓 Academy' },
  { id: 'lab',     label: '🧩 Open Lab' },
]

// ── Hero stats ──────────────────────────────────────────────────────────────
export const HERO_STATS = [
  { value: '2,847', label: 'Projects Evaluated' },
  { value: '94',    label: 'Countries' },
  { value: '$12.3B',label: 'Capital Mobilized' },
  { value: '41M',   label: 'Lives Impacted' },
]

// ── OEI Dimensions ─────────────────────────────────────────────────────────
export const DIMENSIONS = [
  { id: 'digital',     icon: '💻', name: 'Digitalization',  score: 85, change: +6,  color: '#4DB6AC', gradient: 'linear-gradient(90deg,#009688,#4DB6AC)', bg: 'rgba(0,150,136,0.15)',   border: 'rgba(0,150,136,0.3)' },
  { id: 'sdg7',        icon: '⚡', name: 'SDG7 Alignment',  score: 90, change: +12, color: '#90CAF9', gradient: 'linear-gradient(90deg,#1565C0,#90CAF9)', bg: 'rgba(21,101,192,0.15)',  border: 'rgba(21,101,192,0.3)' },
  { id: 'finance',     icon: '💹', name: 'Finance',          score: 72, change: -3,  color: '#81C784', gradient: 'linear-gradient(90deg,#2E7D32,#81C784)', bg: 'rgba(76,175,80,0.15)',   border: 'rgba(76,175,80,0.3)' },
  { id: 'inclusion',   icon: '🤝', name: 'Inclusion',        score: 78, change: +4,  color: '#00E676', gradient: 'linear-gradient(90deg,#009688,#00E676)', bg: 'rgba(0,150,136,0.15)',   border: 'rgba(0,150,136,0.3)' },
  { id: 'governance',  icon: '🏛️', name: 'Governance',       score: 65, change: -2,  color: '#CE93D8', gradient: 'linear-gradient(90deg,#7B1FA2,#CE93D8)', bg: 'rgba(156,39,176,0.15)',  border: 'rgba(156,39,176,0.3)' },
  { id: 'impact',      icon: '🌱', name: 'Impact',           score: 80, change: +9,  color: '#FFCC02', gradient: 'linear-gradient(90deg,#E65100,#FFCC02)', bg: 'rgba(255,152,0,0.15)',   border: 'rgba(255,152,0,0.3)' },
]

// ── AI Insights ─────────────────────────────────────────────────────────────
export const INSIGHTS = [
  { color: '#4CAF50', text: '<strong>SDG7 score is exceptional (90/100)</strong> — strong off-grid coverage and renewable capacity align well with UN energy targets. Consider documenting methodology for replication.' },
  { color: '#FF9800', text: '<strong>Governance score (65/100) is the key weakness.</strong> Establish a formal community accountability board and publish quarterly transparency reports to unlock 8–12 additional points.' },
  { color: '#FF9800', text: '<strong>Finance dimension (72/100) can be improved</strong> by diversifying funding sources. Adding diaspora bonds or green sukuk would increase the score by an estimated +6 points.' },
  { color: '#2196F3', text: '<strong>Overall trajectory is positive.</strong> With targeted governance improvements, this project can reach <strong>Platinum Level (85+)</strong> within the next evaluation cycle.' },
]

// ── Map projects ────────────────────────────────────────────────────────────
export const MAP_PROJECTS = [
  { id: 1, name: 'SolarGrid West Africa',      score: 78, country: 'Senegal',   tech: '☀️ Solar',         level: 'Gold',     co2: '-24k tCO₂', users: '1.2M', budget: '$48M',  left: '38%', top: '56%', dotColor: '#26A69A', selected: true },
  { id: 2, name: 'Himalayan Clean Energy Hub', score: 91, country: 'Nepal',     tech: '💧 Hydro + Solar',  level: 'Platinum', co2: '-62k tCO₂', users: '3.4M', budget: '$120M', left: '64%', top: '38%', dotColor: '#FFD54F' },
  { id: 3, name: 'Amazon Rural Electrification',score:74, country: 'Brazil',    tech: '☀️ Solar',         level: 'Gold',     co2: '-18k tCO₂', users: '890k', budget: '$34M',  left: '26%', top: '68%', dotColor: '#26A69A' },
  { id: 4, name: 'Sahel Wind + Storage',       score: 68, country: 'Niger',     tech: '🌬️ Wind + 🔋',   level: 'Silver',   co2: '-31k tCO₂', users: '640k', budget: '$27M',  left: '45%', top: '52%', dotColor: '#90CAF9' },
  { id: 5, name: 'Southeast Asia AI Grid',     score: 88, country: 'Indonesia', tech: '🤖 AI Grid',       level: 'Platinum', co2: '-88k tCO₂', users: '8.1M', budget: '$240M', left: '74%', top: '60%', dotColor: '#FFD54F' },
  { id: 6, name: 'Nile Delta Solar Farms',     score: 82, country: 'Egypt',     tech: '☀️ Solar',         level: 'Gold',     co2: '-44k tCO₂', users: '2.8M', budget: '$95M',  left: '52%', top: '46%', dotColor: '#26A69A' },
  { id: 7, name: 'Rajasthan Solar',            score: 76, country: 'India',     tech: '☀️ Solar',         level: 'Gold',     co2: '-38k tCO₂', users: '2.1M', budget: '$72M',  left: '62%', top: '47%', dotColor: '#26A69A' },
  { id: 8, name: 'East Africa Grid',           score: 71, country: 'Kenya',     tech: '⚡ Mini-Grid',     level: 'Gold',     co2: '-19k tCO₂', users: '980k', budget: '$41M',  left: '53%', top: '60%', dotColor: '#26A69A' },
]

// ── KPI metrics ─────────────────────────────────────────────────────────────
export const KPIS = [
  { icon: '🌱', value: '2.84M', label: 'tCO₂ Reduced / Year',   delta: '+8.2% vs last year', up: true,  color: 'linear-gradient(90deg,#009688,#4DB6AC)' },
  { icon: '⚡', value: '18.6 TWh', label: 'Clean Energy Produced',delta: '+14.3% vs last year',up: true,  color: 'linear-gradient(90deg,#FFD54F,#FF8F00)' },
  { icon: '👥', value: '41.2M', label: 'People Served',          delta: '+5.7M this quarter', up: true,  color: 'linear-gradient(90deg,#1976D2,#90CAF9)' },
  { icon: '💰', value: '$12.3B', label: 'Capital Mobilized',     delta: '+$2.1B this year',   up: true,  color: 'linear-gradient(90deg,#7B1FA2,#CE93D8)' },
]

// ── Finance projects ─────────────────────────────────────────────────────────
export const FINANCE_PROJECTS = [
  {
    icon: '☀️', iconBg: 'linear-gradient(135deg,rgba(255,193,7,0.15),rgba(255,152,0,0.15))',
    badge: '✦ Gold 78', badgeStyle: { background:'rgba(255,193,7,0.12)', color:'#FFD54F', border:'1px solid rgba(255,193,7,0.2)' },
    name: 'SolarGrid West Africa', location: '🌍 Senegal · Mali · Guinea',
    raised: '$31.2M', goal: '$48M', pct: 65,
    metrics: ['📈 12.4% IRR', '⏱ 15-yr tenor', '🌱 SDG7 aligned'],
  },
  {
    icon: '💧', iconBg: 'linear-gradient(135deg,rgba(255,213,79,0.15),rgba(255,193,7,0.15))',
    badge: '✦ Platinum 91', badgeStyle: { background:'rgba(224,224,224,0.1)', color:'#E0E0E0', border:'1px solid rgba(224,224,224,0.2)' },
    name: 'Himalayan Clean Energy Hub', location: '🌏 Nepal · Bhutan',
    raised: '$88M', goal: '$120M', pct: 73,
    metrics: ['📈 9.8% IRR', '⏱ 20-yr tenor', '💚 Green Bond'],
  },
  {
    icon: '🤖', iconBg: 'linear-gradient(135deg,rgba(0,150,136,0.15),rgba(76,175,80,0.15))',
    badge: '✦ Platinum 88', badgeStyle: { background:'rgba(224,224,224,0.1)', color:'#E0E0E0', border:'1px solid rgba(224,224,224,0.2)' },
    name: 'Southeast Asia AI Grid', location: '🌏 Indonesia · Philippines',
    raised: '$160M', goal: '$240M', pct: 67,
    metrics: ['📈 15.2% IRR', '⏱ 10-yr tenor', '🏦 DFI eligible'],
  },
]

// ── Courses ──────────────────────────────────────────────────────────────────
export const COURSES = [
  {
    emoji: '🌱', bg: 'linear-gradient(135deg,#0D2545,#1565C0)',
    level: 'LEVEL 1 — FOUNDATION', levelColor: '#26A69A',
    title: 'OEI Practitioner',
    desc: 'Master the fundamentals of OEI scoring, SDG7 alignment, and energy inclusion theory.',
    meta: ['📚 8 modules', '⏱ 24 hours', '🌐 Self-paced'],
    cta: 'Start Free →', primary: true,
  },
  {
    emoji: '⚡', bg: 'linear-gradient(135deg,#004D40,#00796B)',
    level: 'LEVEL 2 — PROFESSIONAL', levelColor: '#FFD54F',
    title: 'OEI Architect',
    desc: 'Design and evaluate complex energy inclusion programs using the full OEI methodology.',
    meta: ['📚 14 modules', '⏱ 48 hours', '🧪 + Live Project'],
    cta: 'Enroll — $299', primary: false,
  },
  {
    emoji: '🏛️', bg: 'linear-gradient(135deg,#1A237E,#283593)',
    level: 'LEVEL 3 — EXPERT', levelColor: '#E0E0E0',
    title: 'OEI Expert Advisor',
    desc: 'Become a certified OEI evaluator for institutional clients, DFIs, and national programs.',
    meta: ['📚 20 modules', '⏱ 80 hours', '🎓 UN-recognized'],
    cta: 'Apply — $799', primary: false,
  },
  {
    emoji: '💰', bg: 'linear-gradient(135deg,#006064,#00838F)',
    level: 'SPECIALIZATION', levelColor: '#26A69A',
    title: 'Green Finance & OEI',
    desc: 'Deep dive into OEI-linked financial instruments, green bonds, and blended finance structures.',
    meta: ['📚 10 modules', '⏱ 30 hours', '💼 CFA relevant'],
    cta: 'Enroll — $199', primary: false,
  },
  {
    emoji: '🤖', bg: 'linear-gradient(135deg,#01579B,#0277BD)',
    level: 'SPECIALIZATION', levelColor: '#26A69A',
    title: 'AI for Energy Systems',
    desc: 'Apply machine learning and IoT to optimize energy project monitoring and OEI scoring.',
    meta: ['📚 12 modules', '⏱ 36 hours', '💻 Coding required'],
    cta: 'Enroll — $249', primary: false,
  },
  {
    emoji: '🌍', bg: 'linear-gradient(135deg,#4A148C,#6A1B9A)',
    level: 'SPECIALIZATION', levelColor: '#CE93D8',
    title: 'Gender & Energy Inclusion',
    desc: 'Integrate gender-responsive frameworks into energy project design and OEI evaluation.',
    meta: ['📚 8 modules', '⏱ 20 hours', '🤝 UN Women certified'],
    cta: 'Enroll — $149', primary: false,
  },
]

// ── Repositories ─────────────────────────────────────────────────────────────
export const REPOS = [
  { icon: '📊', name: 'oei-score-engine',     lang: 'Python',     langColor: '#3572A5', stars: 482, forks: 134, badge: 'Active', badgeVariant: 'green', desc: 'Core scoring library implementing the full OEI 6-dimension methodology. Supports batch evaluation and API deployment.' },
  { icon: '🌍', name: 'oei-global-dataset',   lang: 'CSV/JSON',   langColor: '#e34c26', stars: 341, forks: 89,  badge: 'Updated', badgeVariant: 'teal', desc: 'Curated dataset of 2,847 energy projects with OEI scores, geospatial data, and impact indicators. Updated quarterly.' },
  { icon: '🤖', name: 'oei-ml-models',        lang: 'Python',     langColor: '#3572A5', stars: 298, forks: 71,  badge: 'v2.0', badgeVariant: 'blue',  desc: 'Trained ML models for OEI score prediction, gap detection, and governance risk classification.' },
  { icon: '🗺️', name: 'oei-explorer-ui',      lang: 'TypeScript', langColor: '#f1e05a', stars: 187, forks: 52,  badge: 'Active', badgeVariant: 'green', desc: 'React-based frontend for the Global Project Explorer. Embeddable in institutional websites and dashboards.' },
  { icon: '⚡', name: 'oei-realtime-monitor', lang: 'Go',         langColor: '#2b7489', stars: 214, forks: 48,  badge: 'Beta', badgeVariant: 'teal',  desc: 'IoT data ingestion pipeline for real-time energy monitoring. Supports MQTT, HTTP, and LoRaWAN protocols.' },
  { icon: '📝', name: 'oei-methodology-spec', lang: 'Markdown',   langColor: '#083fa1', stars: 325, forks: 94,  badge: 'Official', badgeVariant: 'gold', desc: 'Official OEI methodology documentation, scoring rubrics, and validation guidelines. Open for community review.' },
]

// ── API endpoints ────────────────────────────────────────────────────────────
export const API_ENDPOINTS = [
  { method: 'POST', path: '/v2/score/evaluate',       desc: 'Submit project data — returns full OEI score breakdown' },
  { method: 'GET',  path: '/v2/projects/{id}',        desc: 'Retrieve project profile with scores and impact metrics' },
  { method: 'GET',  path: '/v2/projects/search',      desc: 'Search and filter projects by country, technology, score range' },
  { method: 'POST', path: '/v2/ai/recommend',         desc: 'Get AI recommendations to improve a project\'s OEI score' },
  { method: 'GET',  path: '/v2/impact/live',          desc: 'Real-time global impact aggregates (CO₂, energy, beneficiaries)' },
  { method: 'GET',  path: '/v2/finance/opportunities',desc: 'List open investment opportunities filtered by score and region' },
]

// ── Contributors ──────────────────────────────────────────────────────────────
export const CONTRIBUTORS = [
  { avatar: '🧑‍💻', name: 'Amadou Diallo',  action: 'Added Mali grid dataset · 2h ago',               pts: '+480 pts', bg: 'rgba(0,150,136,0.15)',   border: 'rgba(0,150,136,0.2)' },
  { avatar: '👩‍🔬', name: 'Priya Menon',    action: 'Improved ML model accuracy by 4% · 1d ago',       pts: '+360 pts', bg: 'rgba(21,101,192,0.15)',  border: 'rgba(21,101,192,0.2)' },
  { avatar: '🧑‍🏫', name: 'João Ferreira',  action: 'Translated methodology to Portuguese · 2d ago',   pts: '+290 pts', bg: 'rgba(76,175,80,0.15)',   border: 'rgba(76,175,80,0.2)' },
  { avatar: '👩‍💼', name: 'Fatima Al-Hassan',action: 'Documented MENA governance rubric · 3d ago',     pts: '+245 pts', bg: 'rgba(255,152,0,0.15)',   border: 'rgba(255,152,0,0.2)' },
]

// ── AI chat messages ──────────────────────────────────────────────────────────
export const INITIAL_MESSAGES = [
  {
    role: 'bot',
    text: `Welcome to the <strong>OEI Advisor</strong>. I can help you:<br/><br/>
• Estimate your project's OEI Score across 6 dimensions<br/>
• Identify governance, finance, or inclusion gaps<br/>
• Generate actionable recommendations for improvement<br/><br/>
Describe your energy project — location, technology, scale, and target population.`,
  },
  {
    role: 'user',
    text: `We're developing a 50MW solar farm in rural Cameroon serving 400,000 people. The project has a public-private structure with the government holding 30%. We have a basic digital monitoring system but no community board. Financing is 60% debt from development banks.`,
  },
  {
    role: 'bot',
    scoreEstimate: true,
    text: `I've analyzed your project against the OEI framework. Here's my initial assessment:`,
    score: 71,
    level: 'Gold Level (preliminary)',
    weaknesses: ['Governance −18 pts', 'Digital Maturity −11 pts', 'Inclusion −9 pts'],
  },
  {
    role: 'user',
    text: 'How can we improve the governance score?',
  },
  {
    role: 'bot',
    text: `To improve your <strong>Governance score from ~52 to 70+</strong>, I recommend:<br/><br/>
1. <strong>Establish a Community Advisory Board</strong> (CAB) with ≥40% women representation — +8 pts<br/>
2. <strong>Publish quarterly transparency reports</strong> on OEI Nexus Open Lab — +4 pts<br/>
3. <strong>Implement a grievance mechanism</strong> accessible via SMS/USSD — +5 pts<br/>
4. <strong>Adopt an ESMP</strong> (Environmental & Social Management Plan) aligned with IFC PS4 — +3 pts<br/><br/>
These four interventions alone would push your estimated OEI Score to <strong>91/100 — Platinum Level</strong>.`,
  },
]

export const AI_DIMENSION_SCORES = [
  { icon: '💻', name: 'Digitalization', score: 64, pct: 64, color: '#009688' },
  { icon: '⚡', name: 'SDG7',           score: 88, pct: 88, color: '#1976D2' },
  { icon: '💹', name: 'Finance',        score: 74, pct: 74, color: '#81C784' },
  { icon: '🤝', name: 'Inclusion',      score: 69, pct: 69, color: '#00E676' },
  { icon: '🏛️', name: 'Governance',     score: 52, pct: 52, color: '#CE93D8' },
  { icon: '🌱', name: 'Impact',         score: 81, pct: 81, color: '#FFCC02' },
]

export const AI_RECOMMENDATIONS = [
  { text: 'Create a Community Advisory Board with gender parity', points: '+8 pts Governance' },
  { text: 'Integrate IoT sensors for real-time impact monitoring', points: '+6 pts Digital' },
  { text: 'Add diaspora bond tranche to diversify funding', points: '+5 pts Finance' },
  { text: 'Publish ESMP and quarterly transparency reports', points: '+4 pts Governance' },
]

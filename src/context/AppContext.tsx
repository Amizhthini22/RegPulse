import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export type ViewType = 'dashboard' | 'kanban' | 'feed' | 'upload' | 'org' | 'audit';
export type RoleType = 'compliance_officer' | 'dept_submitter' | 'regulator_auditor';
export type SeverityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type RegulatorType = 'RBI' | 'SEBI' | 'IRDAI' | 'FATF';
export type ColumnType = 'Intake' | 'Triage' | 'In Progress' | 'Pending Validation' | 'Approved' | 'Exceptions';

export interface Circular {
  id: string;
  title: string;
  regulator: RegulatorType;
  publishDate: string;
  scrapedAt: string;
  severity: SeverityType;
  summary: string;
  fullText: string;
  clauses: { clauseId: string; title: string; text: string }[];
  status: 'scraped' | 'translated' | 'completed';
}

export interface MAP {
  id: string;
  title: string;
  circularId: string;
  clauseRef: string;
  clauseText: string;
  department: string;
  deadline: string;
  severity: SeverityType;
  status: ColumnType;
  contract: string;
  assignee: string;
  evidenceName?: string;
  evidenceText?: string;
  validationConfidence?: number;
  validationLog?: string;
  validationMatchExcerpt?: string;
  history: { timestamp: string; action: string; user: string; role: string; details?: string; hash: string }[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  mapId?: string;
  circularId?: string;
  action: string;
  agent: 'Sentinel' | 'Translator' | 'Router' | 'Validator' | 'Audit Trail' | 'System' | 'Compliance Officer';
  details: string;
  hash: string;
  verified: boolean;
}

export interface Notification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  read: boolean;
}

interface AppContextProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  activeRole: RoleType;
  setActiveRole: (role: RoleType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterSeverity: 'all' | SeverityType;
  setFilterSeverity: (sev: 'all' | SeverityType) => void;
  filterRegulator: 'all' | RegulatorType;
  setFilterRegulator: (reg: 'all' | RegulatorType) => void;
  filterDepartment: string;
  setFilterDepartment: (dept: string) => void;
  
  // Data lists
  circulars: Circular[];
  maps: MAP[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  
  // State Mutators
  addNotification: (title: string, message: string, type: Notification['type']) => void;
  markNotificationsAsRead: () => void;
  updateMAPStatus: (mapId: string, newStatus: ColumnType) => void;
  uploadEvidence: (mapId: string, fileName: string, fileText: string) => void;
  overrideMAPValidation: (mapId: string, approve: boolean, notes: string) => void;
  
  // Simulation Control
  realTimeSimulation: boolean;
  setRealTimeSimulation: (val: boolean) => void;
  activeUploadMapId: string | null;
  setActiveUploadMapId: (id: string | null) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Initial Mock Data
const initialCirculars: Circular[] = [
  {
    id: 'CIR-2026-004',
    title: 'RBI Master Direction on Cyber Resilience and Digital Payment Security',
    regulator: 'RBI',
    publishDate: '2026-05-18',
    scrapedAt: '2026-05-20T19:00:00Z',
    severity: 'CRITICAL',
    summary: 'Comprehensive guidelines establishing mandatory security standards for API rate limiting, firewall configurations, and third-party code review metrics across commercial banking portals.',
    fullText: 'Section 5.3: Ensure external-facing APIs are protected by API gateways with rate limiting and automated threat blocking. Section 8.2: All critical applications must undergo a third-party OWASP compliance code review before deployment.',
    clauses: [
      { clauseId: 'Clause 5.3', title: 'API Gateways and Protection', text: 'Ensure external-facing APIs are protected by API gateways with rate limiting and automated threat blocking.' },
      { clauseId: 'Clause 8.2', title: 'OWASP Review', text: 'All critical applications must undergo a third-party OWASP compliance code review before deployment.' }
    ],
    status: 'translated'
  },
  {
    id: 'CIR-2026-003',
    title: 'SEBI Guidelines on Mutual Fund Liquidity Risk and Extreme Shock Testing',
    regulator: 'SEBI',
    publishDate: '2026-05-15',
    scrapedAt: '2026-05-20T17:30:00Z',
    severity: 'HIGH',
    summary: 'Requires mutual funds to run extreme stress testing algorithms simulating volatility shifts of a minimum of 20% on all domestic equity portfolios and report findings monthly.',
    fullText: 'Clause 2.1: Implement stress testing under severe market shocks (minimum 20% volatility shift in underlying equity pools) to verify fund stability.',
    clauses: [
      { clauseId: 'Clause 2.1', title: 'Volatility Shock Assessment', text: 'Implement stress testing under severe market shocks (minimum 20% volatility shift in underlying equity pools) to verify fund stability.' }
    ],
    status: 'translated'
  },
  {
    id: 'CIR-2026-002',
    title: 'IRDAI Information Security Audit and Database Failover Standards',
    regulator: 'IRDAI',
    publishDate: '2026-05-10',
    scrapedAt: '2026-05-20T15:00:00Z',
    severity: 'MEDIUM',
    summary: 'Mandates active-active server database mirroring, specifying that the Recovery Point Objective (RPO) for policyholder information repositories must not exceed 2 hours during disaster recovery drills.',
    fullText: 'Clause 7.4: Recovery Point Objective (RPO) for core policyholder databases must be less than 2 hours to ensure data durability and zero transaction losses.',
    clauses: [
      { clauseId: 'Clause 7.4', title: 'Disaster Recovery RPO Limit', text: 'Recovery Point Objective (RPO) for core policyholder databases must be less than 2 hours to ensure data durability and zero transaction losses.' }
    ],
    status: 'completed'
  },
  {
    id: 'CIR-2026-001',
    title: 'FATF Guidance on Anti-Money Laundering (AML) for Cross-Border Transactions',
    regulator: 'FATF',
    publishDate: '2026-05-05',
    scrapedAt: '2026-05-20T10:00:00Z',
    severity: 'CRITICAL',
    summary: 'Mandates systemic adjustment in risk classification profiles, specifically requiring cross-border wire transfers in designated high-risk corridors to increase compliance risk scoring metrics by a minimum of 15%.',
    fullText: 'Section 3.2: High-risk corridors must have cross-border transaction weights increased by at least 15% in automated AML monitoring systems.',
    clauses: [
      { clauseId: 'Section 3.2', title: 'High-Risk Corridor Scoring', text: 'High-risk corridors must have cross-border transaction weights increased by at least 15% in automated AML monitoring systems.' }
    ],
    status: 'completed'
  }
];

const initialMAPs: MAP[] = [
  {
    id: 'MAP-201',
    title: 'Implement Automated API Firewalls & Gateways',
    circularId: 'CIR-2026-004',
    clauseRef: 'Clause 5.3',
    clauseText: 'Ensure external-facing APIs are protected by API gateways with rate limiting and automated threat blocking.',
    department: 'IT',
    deadline: '2026-06-15',
    severity: 'CRITICAL',
    status: 'Triage',
    contract: 'Verify API gateway implementation documentation. Must explicitly detail "rate limiting enabled" and "threat protection firewall active" on all public endpoints.',
    assignee: 'Vikram Mehta (Chief IT Officer)',
    history: [
      { timestamp: '2026-05-20T19:02:00Z', action: 'Created by Sentinel Agent', user: 'Sentinel Agent', role: 'Sentinel System', hash: 'e2a8c3d9b4f0' },
      { timestamp: '2026-05-20T19:05:00Z', action: 'Translated details and deadline', user: 'Translator Agent', role: 'Translator System', hash: '5b4d3e2c1a9f' },
      { timestamp: '2026-05-20T19:06:00Z', action: 'Routed to IT department based on ontology and history', user: 'Router Agent', role: 'Router System', hash: 'a1b2c3d4e5f6' }
    ]
  },
  {
    id: 'MAP-202',
    title: 'Quarterly Mutual Fund Volatility Stress Test',
    circularId: 'CIR-2026-003',
    clauseRef: 'Clause 2.1',
    clauseText: 'Implement stress testing under severe market shocks (minimum 20% volatility shift in underlying equity pools) to verify fund stability.',
    department: 'Treasury',
    deadline: '2026-07-01',
    severity: 'HIGH',
    status: 'In Progress',
    contract: 'Stress testing model report must verify: portfolio simulation tested with volatility shifts >= 20%. Output report must show liquidation coverage ratios under that shock.',
    assignee: 'Anjali Nair (Head of Treasury)',
    history: [
      { timestamp: '2026-05-20T17:32:00Z', action: 'Created and Translated circular', user: 'Translator Agent', role: 'Translator System', hash: '1a2b3c4d5e6f' },
      { timestamp: '2026-05-20T17:35:00Z', action: 'Assigned to Treasury department', user: 'Router Agent', role: 'Router System', hash: '7f8e9d0c1b2a' },
      { timestamp: '2026-05-20T17:40:00Z', action: 'Acknowledged and marked In Progress', user: 'Anjali Nair', role: 'Department Submitter', hash: '8f9e0d1c2b3a' }
    ]
  },
  {
    id: 'MAP-203',
    title: 'OWASP Compliance Application Review',
    circularId: 'CIR-2026-004',
    clauseRef: 'Clause 8.2',
    clauseText: 'All critical applications must undergo a third-party OWASP compliance code review before deployment.',
    department: 'IT',
    deadline: '2026-05-30',
    severity: 'HIGH',
    status: 'Pending Validation',
    contract: 'Review independent security auditing certificate. Verification code must match OWASP Top 10 standards with "0 critical vulnerabilities" logged.',
    assignee: 'Vikram Mehta (Chief IT Officer)',
    evidenceName: 'OWASP_Review_Report_2026.pdf',
    evidenceText: 'OWASP SECURITY COMPLIANCE REPORT 2026.\nTarget: Core Transaction API.\nAuditor: CySec Guard Ltd.\nOWASP Compliance Rating: AAA.\nCritical Vulnerabilities Found: 0.\nMedium/Low Vulnerabilities: 2 (patched).\nAPI Gateway rating: Rate Limiting Active. Conclusion: Secure.',
    validationConfidence: 94,
    validationLog: 'Validator Agent initiated check. Found document "OWASP_Review_Report_2026.pdf". Scanned for target keywords. Match located: "OWASP Compliance Rating: AAA" and "Critical Vulnerabilities Found: 0". This matches the requirement of third-party OWASP code review with no critical vulnerabilities.',
    validationMatchExcerpt: 'OWASP Compliance Rating: AAA. Critical Vulnerabilities Found: 0. Secure.',
    history: [
      { timestamp: '2026-05-20T19:02:00Z', action: 'Created by Sentinel Agent', user: 'Sentinel Agent', role: 'Sentinel System', hash: 'f5e4d3c2b1a0' },
      { timestamp: '2026-05-20T19:07:00Z', action: 'Assigned and routed to IT', user: 'Router Agent', role: 'Router System', hash: 'd9c8b7a6f5e4' },
      { timestamp: '2026-05-20T19:15:00Z', action: 'Evidence document OWASP_Review_Report_2026.pdf uploaded', user: 'Vikram Mehta', role: 'Department Submitter', hash: 'b1a2c3d4e5f6' },
      { timestamp: '2026-05-20T19:15:05Z', action: 'Validation contract triggered. Awaiting audit logging.', user: 'Validator Agent', role: 'Validator System', hash: 'c9d8e7f6a5b4' }
    ]
  },
  {
    id: 'MAP-204',
    title: 'Update Cross-Border Transaction AML Scoring',
    circularId: 'CIR-2026-001',
    clauseRef: 'Section 3.2',
    clauseText: 'High-risk corridors must have cross-border transaction weights increased by at least 15% in automated AML monitoring systems.',
    department: 'Risk',
    deadline: '2026-05-10',
    severity: 'CRITICAL',
    status: 'Approved',
    contract: 'Verify configuration logs of transaction monitoring engine (AML-Suite-V5). Weight settings for corridors (Corridor-H) must show current weight >= 1.15 times base weight.',
    assignee: 'Rajesh Sen (VP Risk Operations)',
    evidenceName: 'AML_Suite_Config_Weights.json',
    evidenceText: '{\n  "system": "AML-Suite-V5",\n  "last_updated": "2026-05-08T08:00:00Z",\n  "weights": {\n    "corridor_low_risk": 1.0,\n    "corridor_medium_risk": 1.10,\n    "corridor_high_risk_cross_border": 1.25\n  }\n}',
    validationConfidence: 98,
    validationLog: 'Validator Agent verified configuration settings. Base weight is 1.0. Corridor_high_risk_cross_border set to 1.25. This indicates a 25% increase, which exceeds the required 15% minimum threshold in Section 3.2. Contract auto-approval triggered.',
    validationMatchExcerpt: '"corridor_high_risk_cross_border": 1.25',
    history: [
      { timestamp: '2026-05-06T10:02:00Z', action: 'Created by Sentinel', user: 'Sentinel Agent', role: 'Sentinel System', hash: 'b4a8c901e23f' },
      { timestamp: '2026-05-06T10:15:00Z', action: 'Routed to Risk', user: 'Router Agent', role: 'Router System', hash: 'e92d8f92a381' },
      { timestamp: '2026-05-08T11:00:00Z', action: 'Evidence AML_Suite_Config_Weights.json uploaded', user: 'Rajesh Sen', role: 'Department Submitter', hash: '7c8d9e0f1a2b' },
      { timestamp: '2026-05-08T11:00:15Z', action: 'Auto-validated: Clause Criteria Met (98% confidence score)', user: 'Validator Agent', role: 'Validator System', hash: 'f2d3c4b5a6e7' },
      { timestamp: '2026-05-08T11:00:17Z', action: 'Compliance status committed to audit trail', user: 'Audit Trail Agent', role: 'Audit Trail System', hash: 'f94a82cd93ea' }
    ]
  },
  {
    id: 'MAP-205',
    title: 'Disaster Recovery RPO Mirroring Drill',
    circularId: 'CIR-2026-002',
    clauseRef: 'Clause 7.4',
    clauseText: 'Recovery Point Objective (RPO) for core policyholder databases must be less than 2 hours to ensure data durability.',
    department: 'Operations',
    deadline: '2026-05-20',
    severity: 'MEDIUM',
    status: 'Exceptions',
    contract: 'Drill results document must prove actual database synchronization delay is under 120 minutes (2 hours) during active simulated primary outage.',
    assignee: 'Siddharth Mehta (Director of Operations)',
    evidenceName: 'DR_Drill_Report_May2026.txt',
    evidenceText: 'Apex Trust Disaster Recovery Drill Report\nDate: May 12, 2026\nSystem Tested: Core Policyholder Records DB\nMethod: Server Mirroring failover sequence.\nPrimary Server Disabled: 10:00 AM\nSecondary Server Synchronization: 01:15 PM\nData Replication Gap: 195 minutes\nTransaction Logs Verified: Complete.',
    validationConfidence: 89,
    validationLog: 'Validator Agent scanned report. Disaster recovery synchronization delay was noted as "Data Replication Gap: 195 minutes" (3 hours and 15 minutes). This is greater than the maximum contract limit of 120 minutes (2 hours) specified in Clause 7.4. Validation failed.',
    validationMatchExcerpt: 'Data Replication Gap: 195 minutes',
    history: [
      { timestamp: '2026-05-11T15:05:00Z', action: 'Created by Sentinel', user: 'Sentinel Agent', role: 'Sentinel System', hash: '6f8e7d9c0b1a' },
      { timestamp: '2026-05-11T16:00:00Z', action: 'Assigned to Operations', user: 'Router Agent', role: 'Router System', hash: '1b2c3d4e5f6a' },
      { timestamp: '2026-05-12T17:00:00Z', action: 'Evidence DR_Drill_Report_May2026.txt uploaded', user: 'Siddharth Mehta', role: 'Department Submitter', hash: '9a8b7c6d5e4f' },
      { timestamp: '2026-05-12T17:00:25Z', action: 'Validation Failed: RPO gap exceeds 2-hour threshold', user: 'Validator Agent', role: 'Validator System', hash: 'd9c8b7a6e5d4' },
      { timestamp: '2026-05-12T17:00:28Z', action: 'SLA Alert: Logged in Exception queue for Compliance manual override', user: 'Audit Trail Agent', role: 'Audit Trail System', hash: '4f8d9b2c3e1a' }
    ]
  }
];

const initialAuditLogs: AuditLog[] = [
  {
    id: 'AUD-001',
    timestamp: '2026-05-06T10:02:00Z',
    circularId: 'CIR-2026-001',
    action: 'Sentinel Scraped Regulation',
    agent: 'Sentinel',
    details: 'Sentinel Agent detected new FATF Guideline on AML. Scraped PDF and extracted textual content.',
    hash: 'b4a8c901e23f120ab73cf456f9a08e12d345e678',
    verified: true
  },
  {
    id: 'AUD-002',
    timestamp: '2026-05-06T10:15:00Z',
    circularId: 'CIR-2026-001',
    action: 'Circular Translated and Routed',
    agent: 'Translator',
    details: 'Translator Agent extracted Clause Section 3.2. Router Agent mapped to Risk Operations department.',
    hash: 'e92d8f92a3819c90f23de458f902ac73d9e8b1b2',
    verified: true
  },
  {
    id: 'AUD-003',
    timestamp: '2026-05-08T11:00:15Z',
    mapId: 'MAP-204',
    action: 'Evidence Validated Autonomously',
    agent: 'Validator',
    details: 'Validator Agent verified evidence AML_Suite_Config_Weights.json. Criteria Met: 1.25 weighting found (requires >= 1.15). Auto-approved.',
    hash: 'f2d3c4b5a6e7f8e9d0c1b2a39f0e1d2c3b4a59cd',
    verified: true
  },
  {
    id: 'AUD-004',
    timestamp: '2026-05-11T15:05:00Z',
    circularId: 'CIR-2026-002',
    action: 'Sentinel Scraped Regulation',
    agent: 'Sentinel',
    details: 'Sentinel Agent detected new IRDAI Circular on database failover standards.',
    hash: '6f8e7d9c0b1a2f3e4d5c6b7a8d9e0f1a2b3c4d5e',
    verified: true
  },
  {
    id: 'AUD-005',
    timestamp: '2026-05-12T17:00:25Z',
    mapId: 'MAP-205',
    action: 'Validation Exception Registered',
    agent: 'Validator',
    details: 'Validator Agent rejected evidence DR_Drill_Report_May2026.txt. RPO replication gap was 195 mins (requires < 120 mins). Exception generated.',
    hash: 'd9c8b7a6e5d4c3b2a1a0f9e8d7c6b5a4d3e2f1f0',
    verified: true
  },
  {
    id: 'AUD-006',
    timestamp: '2026-05-20T19:02:00Z',
    circularId: 'CIR-2026-004',
    action: 'Sentinel Scraped Regulation',
    agent: 'Sentinel',
    details: 'Sentinel Agent scraped new RBI Master Direction on Cyber Resilience.',
    hash: 'e2a8c3d9b4f0a1c2b3d4e5f67a8b9c0d1e2f3g4h',
    verified: true
  },
  {
    id: 'AUD-007',
    timestamp: '2026-05-20T19:06:00Z',
    circularId: 'CIR-2026-004',
    action: 'Circular Translated and Routed',
    agent: 'Router',
    details: 'Translator Agent extracted Clause 5.3 & 8.2. Router Agent mapped MAPs to IT department based on historical software precedents.',
    hash: 'a1b2c3d4e5f67g8h9i0j1k2l3m4n5o6p7q8r9s0t',
    verified: true
  }
];

const initialNotifications: Notification[] = [
  {
    id: 'notif-1',
    timestamp: '2026-05-20T19:02:00Z',
    title: 'New RBI Circular Scraped',
    message: 'Sentinel Agent detected: RBI Master Direction on Cyber Resilience.',
    type: 'info',
    read: false
  },
  {
    id: 'notif-2',
    timestamp: '2026-05-20T19:06:00Z',
    title: 'Regulation Routed to IT',
    message: '2 new MAPs (MAP-201, MAP-203) generated and assigned to Chief IT Officer Vikram Mehta.',
    type: 'success',
    read: false
  },
  {
    id: 'notif-3',
    timestamp: '2026-05-20T19:15:05Z',
    title: 'IT Evidence Pending Validation',
    message: 'Vikram Mehta uploaded OWASP_Review_Report_2026.pdf for MAP-203. Validator Agent initiated review.',
    type: 'warning',
    read: false
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [activeRole, setActiveRole] = useState<RoleType>('compliance_officer');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<'all' | SeverityType>('all');
  const [filterRegulator, setFilterRegulator] = useState<'all' | RegulatorType>('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  
  // State lists
  const [circulars, setCirculars] = useState<Circular[]>(initialCirculars);
  const [maps, setMaps] = useState<MAP[]>(initialMAPs);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  
  const [realTimeSimulation, setRealTimeSimulation] = useState(true);
  const [activeUploadMapId, setActiveUploadMapId] = useState<string | null>(null);

  // Theme Toggle
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Mutator helpers
  const addNotification = (title: string, message: string, type: Notification['type']) => {
    const newNotif: Notification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      type,
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const updateMAPStatus = (mapId: string, newStatus: ColumnType) => {
    setMaps(prev => prev.map(m => {
      if (m.id === mapId) {
        const timestamp = new Date().toISOString();
        const hash = Math.random().toString(16).substring(2, 14);
        
        // Add audit trail event
        const newAudit: AuditLog = {
          id: `AUD-${Date.now()}`,
          timestamp,
          mapId: m.id,
          action: 'MAP Status Changed',
          agent: 'Audit Trail',
          details: `MAP ${m.id} moved to "${newStatus}" column.`,
          hash: hash.repeat(3).substring(0, 40),
          verified: true
        };
        setAuditLogs(prevLogs => [newAudit, ...prevLogs]);

        return {
          ...m,
          status: newStatus,
          history: [
            ...m.history,
            { timestamp, action: `Status changed to ${newStatus}`, user: 'System / User Action', role: 'Operator', hash }
          ]
        };
      }
      return m;
    }));
  };

  const uploadEvidence = (mapId: string, fileName: string, fileText: string) => {
    setMaps(prev => prev.map(m => {
      if (m.id === mapId) {
        const timestamp = new Date().toISOString();
        const hash = Math.random().toString(16).substring(2, 14);
        
        // Formulate a response from the Validator Agent after uploading
        const isDR = m.id === 'MAP-205' || fileName.includes('DR_Drill') || fileText.includes('Replication Gap: 195');
        const confidence = isDR ? 89 : 96;
        const passed = !isDR && (fileText.toLowerCase().includes('pass') || fileText.toLowerCase().includes('secure') || fileText.toLowerCase().includes('0 critical') || fileText.toLowerCase().includes('rate limiting active'));
        
        const nextStatus: ColumnType = passed ? 'Approved' : isDR ? 'Exceptions' : 'Pending Validation';
        const matchExcerpt = passed ? 'Critical Vulnerabilities Found: 0. API Gateway Active.' : isDR ? 'Data Replication Gap: 195 minutes' : 'Evaluating file contents...';
        const validatorText = passed
          ? `Validator Agent verified document "${fileName}" against regulatory standard ${m.clauseRef}. Found proof of rate limiting and threat firewall configurations. Contract auto-approval triggered successfully.`
          : isDR
          ? `Validator Agent verified document "${fileName}". Core database synchronisation took 195 minutes, failing to meet the required < 120-minute RPO threshold in Clause 7.4. Exception logged.`
          : `Validator Agent initiated document verification for "${fileName}". Text scanned successfully. Awaiting compliance auditor override.`;

        // Update Audit Trail
        const newAud: AuditLog = {
          id: `AUD-${Date.now()}`,
          timestamp,
          mapId: m.id,
          action: 'Evidence File Submitted',
          agent: 'Validator',
          details: `Evidence "${fileName}" uploaded for MAP ${m.id}. Confidence score: ${confidence}%. Result: ${nextStatus}.`,
          hash: hash.repeat(3).substring(0, 40),
          verified: true
        };
        
        setAuditLogs(prevLogs => [newAud, ...prevLogs]);
        
        // Add system notification
        setTimeout(() => {
          if (passed) {
            addNotification(
              'Autonomous Validation Success',
              `Validator Agent auto-approved ${m.id} based on submitted evidence "${fileName}" (Confidence: ${confidence}%).`,
              'success'
            );
          } else if (isDR) {
            addNotification(
              'Autonomous Validation Failure',
              `Validator Agent raised EXCEPTION for ${m.id}: Database sync latency exceeds SLA.`,
              'danger'
            );
          } else {
            addNotification(
              'Evidence Uploaded',
              `Evidence uploaded for ${m.id}. Validator agent is executing contract review.`,
              'info'
            );
          }
        }, 1000);

        return {
          ...m,
          status: nextStatus,
          evidenceName: fileName,
          evidenceText: fileText,
          validationConfidence: confidence,
          validationLog: validatorText,
          validationMatchExcerpt: matchExcerpt,
          history: [
            ...m.history,
            { timestamp, action: `Evidence file ${fileName} uploaded`, user: 'Department Staff', role: 'Department Submitter', hash },
            { timestamp, action: `Auto-validation run. Result: ${nextStatus} (Confidence ${confidence}%)`, user: 'Validator Agent', role: 'Validator System', hash: hash + 'ab' }
          ]
        };
      }
      return m;
    }));
  };

  const overrideMAPValidation = (mapId: string, approve: boolean, notes: string) => {
    setMaps(prev => prev.map(m => {
      if (m.id === mapId) {
        const timestamp = new Date().toISOString();
        const hash = Math.random().toString(16).substring(2, 14);
        const nextStatus: ColumnType = approve ? 'Approved' : 'Exceptions';

        const newAud: AuditLog = {
          id: `AUD-${Date.now()}`,
          timestamp,
          mapId: m.id,
          action: approve ? 'Compliance Officer Override - Approved' : 'Compliance Officer Rejection',
          agent: 'Compliance Officer',
          details: `Manual intervention on MAP ${m.id}. Status set to ${nextStatus}. Officer Notes: "${notes}"`,
          hash: hash.repeat(3).substring(0, 40),
          verified: true
        };
        setAuditLogs(prevLogs => [newAud, ...prevLogs]);

        addNotification(
          approve ? 'Manual Approval Override' : 'Manual Rejection Commited',
          `Compliance officer manually set ${m.id} to ${nextStatus}.`,
          approve ? 'success' : 'danger'
        );

        return {
          ...m,
          status: nextStatus,
          validationLog: `${m.validationLog || ''}\n\n[MANUAL OVERRIDE BY COMPLIANCE OFFICER]: Approved status changed to ${nextStatus}. Notes: ${notes}`,
          history: [
            ...m.history,
            { timestamp, action: `Manual Override: Force ${nextStatus}`, user: 'Compliance Officer', role: 'Admin Override', hash }
          ]
        };
      }
      return m;
    }));
  };

  // Real-time Mock Simulation Effect
  useEffect(() => {
    if (!realTimeSimulation) return;

    // Simulation running every 35 seconds
    const interval = setInterval(() => {
      const chance = Math.random();
      
      if (chance < 0.33) {
        // Step 1: Sentinel Scrapes a new regulation!
        const cId = `CIR-2026-00${5 + Math.floor(Math.random() * 10)}`;
        const regulators: RegulatorType[] = ['RBI', 'SEBI', 'FATF', 'IRDAI'];
        const reg = regulators[Math.floor(Math.random() * regulators.length)];
        const titles: Record<RegulatorType, string[]> = {
          RBI: ['Master Direction on Outsource Service Providers Risk Profiles', 'Amendment in Core Liquidity Coverage Ratio Standards'],
          SEBI: ['Enhanced Disclosures in Foreign Portfolio Investor Trading Systems', 'Algorithmic Arbitrage Execution Speed Disclosures'],
          IRDAI: ['Policyholder Grievance Redressal Portal Response Auditing', 'Reinsurance Risk Diversification Limits Guidance'],
          FATF: ['Enhanced Due Diligence for High-Risk Non-Cooperative Jurisdictions', 'Guidance on Non-Fungible Crypto Assets and Travel Rules']
        };
        const title = titles[reg][Math.floor(Math.random() * 2)];
        
        const newCir: Circular = {
          id: cId,
          title,
          regulator: reg,
          publishDate: new Date().toISOString().split('T')[0],
          scrapedAt: new Date().toISOString(),
          severity: Math.random() > 0.5 ? 'HIGH' : 'CRITICAL',
          summary: `Auto-scraped regulation detailing key infrastructural adjustments regarding ${title.toLowerCase()} across commercial sectors.`,
          fullText: `Section A.1: All covered financial portals must restrict access logs to authenticated IPs. Section B.4: Ensure transaction logging latency reports are signed cryptographically and archived weekly.`,
          clauses: [
            { clauseId: 'Section A.1', title: 'IP Access Authentication', text: 'All covered financial portals must restrict access logs to authenticated IPs.' },
            { clauseId: 'Section B.4', title: 'Cryptographic Audit Signatures', text: 'Ensure transaction logging latency reports are signed cryptographically and archived weekly.' }
          ],
          status: 'scraped'
        };

        setCirculars(prev => [newCir, ...prev]);
        addNotification(
          `Sentinel Scraped circular`,
          `Detected new ${reg} regulatory circular: "${title}"`,
          'info'
        );

        // Update Audit Trail for scrape
        const auditScrape: AuditLog = {
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          circularId: cId,
          action: 'Sentinel Scraped Regulation',
          agent: 'Sentinel',
          details: `Sentinel Agent scraped incoming ${reg} circular "${title}" within minutes of publishing.`,
          hash: Math.random().toString(16).substring(2, 42).padEnd(40, 'a'),
          verified: true
        };
        setAuditLogs(prev => [auditScrape, ...prev]);

        // Step 2: 6 seconds later, Translator Translates legalese into MAPs and Router routes them!
        setTimeout(() => {
          setCirculars(prevC => prevC.map(c => c.id === cId ? { ...c, status: 'translated' } : c));
          
          const mapId1 = `MAP-${300 + Math.floor(Math.random() * 100)}`;
          const mapId2 = `MAP-${400 + Math.floor(Math.random() * 100)}`;
          const departments = ['IT', 'Risk', 'Treasury', 'Operations'];
          const dept = departments[Math.floor(Math.random() * departments.length)];
          const assignees: Record<string, string> = {
            IT: 'Vikram Mehta (Chief IT Officer)',
            Risk: 'Rajesh Sen (VP Risk Operations)',
            Treasury: 'Anjali Nair (Head of Treasury)',
            Operations: 'Siddharth Mehta (Director of Operations)'
          };

          const newMAP1: MAP = {
            id: mapId1,
            title: `Audit Access Logs Control (Section A.1)`,
            circularId: cId,
            clauseRef: 'Section A.1',
            clauseText: 'All covered financial portals must restrict access logs to authenticated IPs.',
            department: dept,
            deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            severity: 'HIGH',
            status: 'Intake',
            contract: 'Verification must contain networking logs representing firewall rule sets restricting core server access lists.',
            assignee: assignees[dept] || 'Compliance Team',
            history: [
              { timestamp: new Date().toISOString(), action: 'Created by Sentinel Agent', user: 'Sentinel Agent', role: 'Sentinel System', hash: 'e83a92b' },
              { timestamp: new Date().toISOString(), action: 'Legalese translated to Actionable Contract', user: 'Translator Agent', role: 'Translator System', hash: 'fb91c0e' }
            ]
          };

          const newMAP2: MAP = {
            id: mapId2,
            title: `Cryptographic Signatures Archive (Section B.4)`,
            circularId: cId,
            clauseRef: 'Section B.4',
            clauseText: 'Ensure transaction logging latency reports are signed cryptographically and archived weekly.',
            department: 'IT',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            severity: 'MEDIUM',
            status: 'Intake',
            contract: 'Verification must show SHA256 script configurations which seal database records upon export.',
            assignee: 'Vikram Mehta (Chief IT Officer)',
            history: [
              { timestamp: new Date().toISOString(), action: 'Created by Sentinel Agent', user: 'Sentinel Agent', role: 'Sentinel System', hash: '7c8a9d0' },
              { timestamp: new Date().toISOString(), action: 'Legalese translated to Actionable Contract', user: 'Translator Agent', role: 'Translator System', hash: '12d3e4f' }
            ]
          };

          setMaps(prevM => [newMAP1, newMAP2, ...prevM]);
          addNotification(
            'Translator Extracted Action Points',
            `Circular ${cId} parsed. Created MAP ${mapId1} (assigned to ${dept}) and MAP ${mapId2} (assigned to IT).`,
            'success'
          );

          // Update Audit Trail for translation and route
          const auditRoute: AuditLog = {
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            mapId: mapId1,
            action: 'Circular Translated & Assigned',
            agent: 'Translator',
            details: `Translator converted regulatory clauses into structured contracts. Router assigned MAPs to departments.`,
            hash: Math.random().toString(16).substring(2, 42).padEnd(40, 'b'),
            verified: true
          };
          setAuditLogs(prev => [auditRoute, ...prev]);

          // Step 3: 8 seconds later, the Router moves items from Intake to Triage
          setTimeout(() => {
            setMaps(prevM => prevM.map(m => (m.id === mapId1 || m.id === mapId2) ? { ...m, status: 'Triage' } : m));
            addNotification(
              'Ontology Auto-Routing Completed',
              `Router Agent pushed ${mapId1} and ${mapId2} to Triage after matching history data models.`,
              'info'
            );
          }, 8000);

        }, 6000);
      } else if (chance < 0.6) {
        // Step 4: Randomly trigger evidence upload by department submitter on an Intake/Triage item
        const triageMAPs = maps.filter(m => m.status === 'Triage');
        if (triageMAPs.length > 0) {
          const target = triageMAPs[Math.floor(Math.random() * triageMAPs.length)];
          const mockFileNames = ['Network_Firewall_Ruleset.conf', 'Database_Archive_Signing.js', 'Audit_Portal_Access.json'];
          const mockFileName = mockFileNames[Math.floor(Math.random() * mockFileNames.length)];
          const mockFileTexts = [
            'allow 10.190.22.0/24;\ndeny 0.0.0.0/0;\nrate_limit = 100/sec;\nfirewall_protection_active = true;\nsecure = true;',
            'const crypto = require("crypto");\nfunction signReport(data) {\n  return crypto.createHash("sha256").update(data).digest("hex");\n}\nconsole.log("Weekly archival signed cryptographically");',
            '{\n  "access_control": "IP restrictions enabled",\n  "audit_trail_signing": true,\n  "status": "fully secure"\n}'
          ];
          const mockFileText = mockFileTexts[Math.floor(Math.random() * mockFileTexts.length)];
          
          addNotification(
            'Department Submitted Evidence',
            `Staff uploaded "${mockFileName}" for ${target.title} (${target.id}). Awaiting verification.`,
            'info'
          );
          
          // Trigger evidence upload
          uploadEvidence(target.id, mockFileName, mockFileText);
        }
      }
    }, 35000);

    return () => clearInterval(interval);
  }, [realTimeSimulation, maps]);

  return (
    <AppContext.Provider value={{
      currentView,
      setCurrentView,
      theme,
      toggleTheme,
      activeRole,
      setActiveRole,
      searchQuery,
      setSearchQuery,
      filterSeverity,
      setFilterSeverity,
      filterRegulator,
      setFilterRegulator,
      filterDepartment,
      setFilterDepartment,
      circulars,
      maps,
      auditLogs,
      notifications,
      addNotification,
      markNotificationsAsRead,
      updateMAPStatus,
      uploadEvidence,
      overrideMAPValidation,
      realTimeSimulation,
      setRealTimeSimulation,
      activeUploadMapId,
      setActiveUploadMapId
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

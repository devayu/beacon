export interface ScanOptions {
  timeout?: number;
  waitUntil?: "load" | "domcontentloaded" | "networkidle";
  includeSelectors?: string[];
  excludeSelectors?: string[];
  disableRules?: string[];
  tags?: string[];
  viewport?: { width: number; height: number };
  userAgent?: string;
  screenshot?: boolean;
  highlightViolations?: boolean;
  outputDir?: string;
  colorScheme?: "light" | "dark" | "no-preference";
  reducedMotion?: "reduce" | "no-preference";
  cookies?: Array<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
  }>;
  localStorage?: Record<string, string>;
}

export interface AccessibilityViolation {
  id: string;
  impact: "minor" | "moderate" | "serious" | "critical";
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
}

export interface ScanResult {
  url: string;
  timestamp: string;
  violations: AccessibilityViolation[];
  possibleViolations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  testEnvironment: {
    userAgent: string;
    viewport: { width: number; height: number };
  };
}

export interface DarkModeInfo {
  cssMediaQuery: boolean;
  localStorage: string[];
  cookies: string[];
  dataAttributes: Array<{
    tag: string;
    attribute: string | null;
  }>;
  bodyClasses: string[];
  htmlClasses: string[];
}

export interface ReportSummary {
  totalUrls: number;
  totalViolations: number;
  criticalViolations: number;
  seriousViolations: number;
  averageViolationsPerPage: string | number;
  scanTimestamp: string;
}

export interface Report {
  summary: ReportSummary;
  results: ScanResult[];
}

export const MOBILE_VIEWPORTS = {
  iPhoneSE: { width: 375, height: 667 },
  iPhone12: { width: 390, height: 844 },
  iPad: { width: 768, height: 1024 },
  androidPhone: { width: 360, height: 640 },
} as const;

export * from "./types/job";
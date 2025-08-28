import { AccessibilityViolation } from "../types";

export interface PriorityFactor {
  score: number;
  reasoning: string;
}

export interface PriorityScoreFactors {
  impact: PriorityFactor;
  reach: PriorityFactor;
  frequency: PriorityFactor;
  legalRisk: PriorityFactor;
  reuseFactory: PriorityFactor;
  effort: PriorityFactor;
}

export interface ViolationPriorityScore {
  violationId: string;
  factors: PriorityScoreFactors;
  totalScore: number;
  recommendation: string;
  priority: "Critical" | "High" | "Medium" | "Low";
}

export interface BatchPriorityResult {
  violations: ViolationPriorityScore[];
  summary: {
    totalViolations: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    averageScore: number;
  };
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

export interface ViolationContext {
  url: string;
  pageTitle?: string;
  userAgent?: string;
  viewport?: { width: number; height: number };
  industry?: string;
  complianceLevel?: "AA" | "AAA";
}

export interface EnhancedViolation extends AccessibilityViolation {
  context?: ViolationContext;
  wcagCodes?: string[];
  wcagLevel?: "A" | "AA" | "AAA";
}

export interface AIProviderConfig {
  provider: "openai" | "gemini";
  model: string;
  temperature: number;
  maxTokens?: number;
}

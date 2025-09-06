import { AccessibilityViolation } from "@beacon/db";

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
  ruleId: string;
  id: string;
  factors: PriorityScoreFactors;
  totalScore: number;
  recommendation: string;
  explanation: string;
  detailedExplanation: string;
  technicalRecommendation: string;
  priority: "URGENT" | "HIGH" | "MEDIUM" | "LOW";
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
  transformedResult?: TransformedViolationResult[];
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

export interface TransformedViolationResult {
  ruleId: string;
  explanation: string;
  detailedExplanation: string;
  recommendation: string;
  priorityScore: number;
}

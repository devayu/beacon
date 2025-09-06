import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import {
  AIProviderConfig,
  BatchPriorityResult,
  PriorityScoreFactors,
  TransformedViolationResult,
  ViolationContext,
  ViolationPriorityScore,
} from "../types";
import { getSystemPrompt, buildBatchPrompt } from "../utils/prompt";
import { logger } from "@beacon/logger";
import { AccessibilityViolation } from "@beacon/db";
import { config as envConfig } from "../config";
export class PriorityScorer {
  private openai: OpenAI;
  private genai: GoogleGenAI;
  private config: AIProviderConfig;

  constructor(config: Partial<AIProviderConfig> = {}) {
    this.config = {
      provider: "gemini",
      model: "gemini-2.5-flash",
      temperature: 0,
      maxTokens: 4000,
      ...config,
    };

    this.openai = new OpenAI({
      apiKey: envConfig.model.openai,
    });
    this.genai = new GoogleGenAI({
      apiKey: envConfig.model.gemini,
    });
  }

  async createPriorityScore(
    violations: AccessibilityViolation[],
    context?: ViolationContext
  ): Promise<BatchPriorityResult> {
    if (!violations || violations.length === 0) {
      return this.createEmptyResult();
    }

    try {
      logger.info(
        `Analyzing ${violations.length} violations for priority scoring`
      );

      // Process in batches to avoid token limits
      const batchSize = 10;
      const violationScores: ViolationPriorityScore[] = [];

      for (let i = 0; i < violations.length; i += batchSize) {
        const batch = violations.slice(i, i + batchSize);
        const batchResults = await this.processBatch(batch, context);
        violationScores.push(...batchResults);
      }

      return this.createBatchResult(violationScores);
    } catch (error) {
      logger.error("Priority scoring failed:", error);
      throw new Error(
        `Priority scoring failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private async processBatch(
    violations: AccessibilityViolation[],
    context?: ViolationContext
  ): Promise<ViolationPriorityScore[]> {
    const prompt = buildBatchPrompt(violations, context);

    try {
      let response: string;

      if (this.config.provider === "openai") {
        response = await this.callOpenAI(prompt);
      } else {
        response = (await this.callGemini(prompt)) ?? "";
      }

      return this.parseAIResponse(response, violations);
    } catch (error) {
      logger.error("AI API call failed:", error);
      // Return default scores if AI fails
      return violations.map((v) => this.createDefaultScore(v));
    }
  }

  private async callGemini(prompt: string): Promise<string | undefined> {
    const res = await this.genai.models.generateContent({
      model: this.config.model,
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: this.config.temperature,
      },
    });

    return res.text;
  }

  private async callOpenAI(prompt: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        { role: "system", content: getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response.choices[0]?.message?.content || "";
  }

  private parseAIResponse(
    response: string,
    violations: AccessibilityViolation[]
  ): ViolationPriorityScore[] {
    try {
      // The AI returns JSON.stringify() result, so we parse it to get the actual JSON
      let jsonText = response.trim();

      // If response is a stringified JSON (starts and ends with quotes), parse it first
      if (jsonText.startsWith('"') && jsonText.endsWith('"')) {
        jsonText = JSON.parse(jsonText);
      }

      // Now parse the actual JSON array
      const parsedScores = JSON.parse(jsonText);
      logger.info(
        "Successfully parsed AI scores for",
        parsedScores.length,
        "violations"
      );

      return parsedScores.map((scoreData: any, index: number) => {
        const violation = violations[index];
        const totalScore = this.calculateTotalScore(scoreData.factors);

        return {
          id: violation.id,
          ruleId: violation.ruleId,
          factors: scoreData.factors,
          totalScore,
          recommendation:
            scoreData.recommendation || `Fix the ${violation.id} issue`,
          explanation:
            scoreData.explanation || "This affects users with disabilities",
          detailedExplanation:
            scoreData.detailedExplanation ||
            "This issue creates barriers for some users",
          technicalRecommendation:
            scoreData.technicalRecommendation || violation.help,
          priority: this.determinePriority(totalScore),
        };
      });
    } catch (error) {
      logger.error("Failed to parse AI response:", error);
      // Return default scores if parsing fails
      return violations.map((v) => this.createDefaultScore(v));
    }
  }

  private calculateTotalScore(factors: PriorityScoreFactors): number {
    const weights = {
      impact: 0.25,
      reach: 0.2,
      frequency: 0.15,
      legalRisk: 0.2,
      reuseFactory: 0.1,
      effort: 0.1,
    };

    return Math.round(
      factors.impact.score * weights.impact +
        factors.reach.score * weights.reach +
        factors.frequency.score * weights.frequency +
        factors.legalRisk.score * weights.legalRisk +
        factors.reuseFactory.score * weights.reuseFactory +
        factors.effort.score * weights.effort
    );
  }

  private determinePriority(
    totalScore: number
  ): "URGENT" | "HIGH" | "MEDIUM" | "LOW" {
    if (totalScore >= 8.5) return "URGENT";
    if (totalScore >= 7) return "HIGH";
    if (totalScore >= 5) return "MEDIUM";
    return "LOW";
  }

  private createDefaultScore(
    violation: AccessibilityViolation
  ): ViolationPriorityScore {
    const impactScore = this.getDefaultImpactScore(violation.impact);

    const factors: PriorityScoreFactors = {
      impact: {
        score: impactScore,
        reasoning: `${violation.impact} impact violation`,
      },
      reach: { score: 5, reasoning: "Default reach estimate" },
      frequency: {
        score: Math.min(violation.nodes.length, 10),
        reasoning: `${violation.nodes.length} instances found`,
      },
      legalRisk: { score: 6, reasoning: "Standard compliance risk" },
      reuseFactory: { score: 5, reasoning: "Moderate reuse potential" },
      effort: { score: 7, reasoning: "Estimated medium effort" },
    };

    const totalScore = this.calculateTotalScore(factors);

    return {
      id: violation.id,
      ruleId: violation.ruleId,
      factors,
      totalScore,
      recommendation: `Fix the ${violation.id} issue`,
      explanation: "This affects users with disabilities",
      detailedExplanation: "This issue creates barriers for some users",
      technicalRecommendation: violation.help,
      priority: this.determinePriority(totalScore),
    };
  }

  private getDefaultImpactScore(impact: string): number {
    switch (impact) {
      case "critical":
        return 10;
      case "serious":
        return 8;
      case "moderate":
        return 6;
      case "minor":
        return 4;
      default:
        return 5;
    }
  }

  private createEmptyResult(): BatchPriorityResult {
    return {
      violations: [],
      summary: {
        totalViolations: 0,
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        averageScore: 0,
      },
      recommendations: {
        immediate: [],
        shortTerm: [],
        longTerm: [],
      },
    };
  }

  private createBatchResult(
    violationScores: ViolationPriorityScore[]
  ): BatchPriorityResult {
    const summary = {
      totalViolations: violationScores.length,
      criticalCount: violationScores.filter((v) => v.priority === "URGENT")
        .length,
      highCount: violationScores.filter((v) => v.priority === "HIGH").length,
      mediumCount: violationScores.filter((v) => v.priority === "MEDIUM")
        .length,
      lowCount: violationScores.filter((v) => v.priority === "LOW").length,
      averageScore:
        violationScores.reduce((sum, v) => sum + v.totalScore, 0) /
          violationScores.length || 0,
    };

    // Sort by priority and total score
    const sortedViolations = violationScores.sort((a, b) => {
      const priorityOrder = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.totalScore - a.totalScore;
    });

    const recommendations = {
      immediate: sortedViolations
        .filter((v) => v.priority === "URGENT")
        .slice(0, 3)
        .map((v) => v.recommendation),
      shortTerm: sortedViolations
        .filter((v) => v.priority === "HIGH")
        .slice(0, 5)
        .map((v) => v.recommendation),
      longTerm: sortedViolations
        .filter((v) => ["Medium", "Low"].includes(v.priority))
        .slice(0, 3)
        .map((v) => v.recommendation),
    };

    // Generate transformed result
    const transformedResult = this.generateTransformedResult(sortedViolations);

    return {
      violations: sortedViolations,
      summary,
      recommendations,
      transformedResult,
    };
  }

  private generateTransformedResult(
    violationScores: ViolationPriorityScore[]
  ): TransformedViolationResult[] {
    return violationScores.map((violation) => ({
      ruleId: violation.ruleId,
      explanation: violation.explanation,
      detailedExplanation: violation.detailedExplanation,
      recommendation: violation.technicalRecommendation,
      priorityScore: violation.totalScore,
    }));
  }
}

let priorityScorerInstance: PriorityScorer | null = null;

export function getPriorityScorer(): PriorityScorer {
  if (!priorityScorerInstance) {
    priorityScorerInstance = new PriorityScorer();
  }
  return priorityScorerInstance;
}

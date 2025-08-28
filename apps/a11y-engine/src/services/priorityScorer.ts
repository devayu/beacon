import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import { logger } from "./logger";
import {
  AccessibilityViolation,
  EnhancedViolation,
  ViolationPriorityScore,
  BatchPriorityResult,
  ViolationContext,
  AIProviderConfig,
  PriorityScoreFactors,
} from "../types";

export class PriorityScorer {
  private openai: OpenAI;
  private genai: GoogleGenAI;
  private config: AIProviderConfig;

  constructor(config: Partial<AIProviderConfig> = {}) {
    this.config = {
      provider: "gemini",
      model: "gemini-2.5-flash",
      temperature: 0.1,
      maxTokens: 4000,
      ...config,
    };

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.genai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
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
    const prompt = this.buildBatchPrompt(violations, context);

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
        { role: "system", content: this.getSystemPrompt() },
        { role: "user", content: prompt },
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });

    return response.choices[0]?.message?.content || "";
  }

  private buildBatchPrompt(
    violations: AccessibilityViolation[],
    context?: ViolationContext
  ): string {
    const contextInfo = context
      ? `
**PAGE CONTEXT:**
- URL: ${context.url}
- Industry: ${context.industry || "General"}
- Compliance Target: WCAG ${context.complianceLevel || "AA"}
- Page Title: ${context.pageTitle || "Unknown"}
- Viewport: ${context.viewport?.width || 1920}x${context.viewport?.height || 1080}
`
      : "";

    const violationsText = violations
      .map((violation, index) => {
        return `
**VIOLATION ${index + 1}:**
- ID: ${violation.id}
- Impact: ${violation.impact}
- Description: ${violation.description}
- Help: ${violation.help}
- Help URL: ${violation.helpUrl}
- Elements affected: ${violation.nodes.length}
- Sample element: ${violation.nodes[0]?.html || "N/A"}
- Sample target: ${violation.nodes[0]?.target?.join(", ") || "N/A"}
- Failure summary: ${violation.nodes[0]?.failureSummary || "N/A"}`;
      })
      .join("\n");

    return `${this.getSystemPrompt()}

${contextInfo}

**VIOLATIONS TO ANALYZE:**
${violationsText}

Return a JSON array with one object per violation in the same order:
[
  {
    "violationId": "violation-rule-id",
    "factors": {
      "impact": {"score": number, "reasoning": "explanation"},
      "reach": {"score": number, "reasoning": "explanation"}, 
      "frequency": {"score": number, "reasoning": "explanation"},
      "legalRisk": {"score": number, "reasoning": "explanation"},
      "reuseFactory": {"score": number, "reasoning": "explanation"},
      "effort": {"score": number, "reasoning": "explanation"}
    },
    "recommendation": "specific actionable steps"
  }
]`;
  }

  private getSystemPrompt(): string {
    return `You are an expert accessibility consultant analyzing WCAG violations for prioritization.

Score each violation on 6 factors (1-10 scale):

**IMPACT** (User experience severity):
- 10: Blocks task completion (keyboard traps, missing focus)
- 8-9: Major barriers (missing alt text, no skip links)  
- 6-7: Moderate barriers (contrast, missing labels)
- 4-5: Minor issues (link text, heading order)
- 1-3: Subtle issues (minor contrast, duplicate IDs)

**REACH** (Users affected):
- Screen reader: ~2%, Keyboard: ~8%, Low vision: ~4%
- Weight by violation impact on each group
- Consider page traffic and importance

**FREQUENCY** (Issue prevalence):
- 10: 20+ instances or site-wide pattern
- 8-9: 10-19 instances or template issue  
- 6-7: 5-9 instances or component issue
- 4-5: 2-4 instances or page-specific
- 1-3: Single instance

**LEGAL RISK** (Compliance exposure):
- 10: Level A, high lawsuit risk (keyboard, alt text)
- 8-9: Level AA, commonly cited (contrast, labels)
- 6-7: Important AA (focus, error handling)  
- 4-5: Less critical AA or AAA
- 1-3: Edge cases

**REUSE FACTOR** (Fix scope):
- 10: Design system/component affects many pages
- 8-9: Template fix affects page type
- 6-7: Pattern used multiple places
- 4-5: Similar patterns exist elsewhere  
- 1-3: Unique one-off issue

**EFFORT** (Implementation ease):
- 10: Simple text/attribute change
- 8-9: Markup restructuring
- 6-7: Interactive behavior changes
- 4-5: Layout or design changes
- 1-3: Complex component rewrite

Return valid JSON only.`;
  }

  private parseAIResponse(
    response: string,
    violations: AccessibilityViolation[]
  ): ViolationPriorityScore[] {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }

      const parsedScores = JSON.parse(jsonMatch[0]);

      return parsedScores.map((scoreData: any, index: number) => {
        const violation = violations[index];
        const totalScore = this.calculateTotalScore(scoreData.factors);

        return {
          violationId: violation.id,
          factors: scoreData.factors,
          totalScore,
          recommendation: scoreData.recommendation,
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
  ): "Critical" | "High" | "Medium" | "Low" {
    if (totalScore >= 8.5) return "Critical";
    if (totalScore >= 7) return "High";
    if (totalScore >= 5) return "Medium";
    return "Low";
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
      violationId: violation.id,
      factors,
      totalScore,
      recommendation: `Fix ${violation.id}: ${violation.help}`,
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
      criticalCount: violationScores.filter((v) => v.priority === "Critical")
        .length,
      highCount: violationScores.filter((v) => v.priority === "High").length,
      mediumCount: violationScores.filter((v) => v.priority === "Medium")
        .length,
      lowCount: violationScores.filter((v) => v.priority === "Low").length,
      averageScore:
        violationScores.reduce((sum, v) => sum + v.totalScore, 0) /
          violationScores.length || 0,
    };

    // Sort by priority and total score
    const sortedViolations = violationScores.sort((a, b) => {
      const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      return priorityDiff !== 0 ? priorityDiff : b.totalScore - a.totalScore;
    });

    const recommendations = {
      immediate: sortedViolations
        .filter((v) => v.priority === "Critical")
        .slice(0, 3)
        .map((v) => v.recommendation),
      shortTerm: sortedViolations
        .filter((v) => v.priority === "High")
        .slice(0, 5)
        .map((v) => v.recommendation),
      longTerm: sortedViolations
        .filter((v) => ["Medium", "Low"].includes(v.priority))
        .slice(0, 3)
        .map((v) => v.recommendation),
    };

    return {
      violations: sortedViolations,
      summary,
      recommendations,
    };
  }
}

let priorityScorerInstance: PriorityScorer | null = null;

export function getPriorityScorer(): PriorityScorer {
  if (!priorityScorerInstance) {
    priorityScorerInstance = new PriorityScorer();
  }
  return priorityScorerInstance;
}

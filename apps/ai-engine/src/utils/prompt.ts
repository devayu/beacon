import { AccessibilityViolation, ViolationContext } from "../types";


export function buildBatchPrompt(
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

    return `${getSystemPrompt()}

${contextInfo}

**VIOLATIONS TO ANALYZE:**
${violationsText}

Create a JSON array with one object per violation in exact order, then return JSON.stringify() of that array.

Structure each object like:
{
  "violationId": "rule-id-here",
  "factors": {
    "impact": {"score": number, "reasoning": "simple explanation"},
    "reach": {"score": number, "reasoning": "simple explanation"}, 
    "frequency": {"score": number, "reasoning": "simple explanation"},
    "legalRisk": {"score": number, "reasoning": "simple explanation"},
    "reuseFactory": {"score": number, "reasoning": "simple explanation"},
    "effort": {"score": number, "reasoning": "simple explanation"}
  },
  "recommendation": "simple fix steps in everyday language",
  "explanation": "short sentence explaining the issue",
  "detailedExplanation": "real-world analogy then actual issue explanation 2-3 sentences",
  "technicalRecommendation": "specific code examples and technical implementation steps"
}

CRITICAL: Return ONLY JSON.stringify(yourArrayObject). Nothing else. No markdown. No explanations.`;
  }
export function getSystemPrompt(): string {
    return `You are an accessibility expert. Score violations on 6 factors (1-10 scale) and provide user-friendly explanations.

SCORING (simple guidelines):
- IMPACT: How much this hurts users (10=stops them completely, 1=minor annoyance)
- REACH: How many people affected (10=many users, 1=few users)  
- FREQUENCY: How often this appears (10=everywhere on site, 1=one place)
- LEGAL RISK: Lawsuit chances (10=very likely to cause problems, 1=unlikely)
- REUSE FACTOR: How much fixing helps (10=fixes many pages, 1=fixes one thing)
- EFFORT: How easy to fix (10=very easy, 1=very hard)

RESPONSE REQUIREMENTS:
1. recommendation: Use simple words, no technical terms
2. explanation: Short simple sentence about why this matters
3. detailedExplanation: Start with a real-world analogy then explain the issue (2-3 sentences max)
4. technicalRecommendation: Include specific code examples and technical steps

CRITICAL: Return ONLY JSON.stringify(yourArrayObject). No markdown. No code blocks. No explanations.`;
  }
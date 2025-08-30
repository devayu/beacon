import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

interface ViolationPriority {
  violationId: string;
  factors: {
    impact: { score: number; reasoning: string };
    reach: { score: number; reasoning: string };
    frequency: { score: number; reasoning: string };
    legalRisk: { score: number; reasoning: string };
    reuseFactory: { score: number; reasoning: string };
    effort: { score: number; reasoning: string };
  };
  totalScore: number;
  recommendation: string;
  explanation: string;
  detailedExplanation: string;
  technicalRecommendation: string;
  priority: "Critical" | "High" | "Medium" | "Low";
}

interface ViolationCardProps {
  violation: ViolationPriority;
}

export function ViolationCard({ violation }: ViolationCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "critical";
      case "High":
        return "high";
      case "Medium":
        return "medium";
      case "Low":
        return "low";
      default:
        return "secondary";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-red-600";
    if (score >= 6) return "text-orange-600";
    if (score >= 4) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <Card
      className="w-full cursor-pointer transition-colors hover:bg-slate-50/5"
      onClick={() => setExpanded(!expanded)}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant="outline">{violation.violationId}</Badge>
            <Badge variant={getPriorityColor(violation.priority) as any}>
              {violation.priority}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 border border-gray-600 rounded text-center bg-primary">
                <div className="text-lg font-bold text-primary-foreground">
                  {violation.totalScore}
                </div>
              </div>
              {/* <span className="text-xs text-gray-500">? scores out of 10</span> */}
            </div>
            <div className="text-slate-400">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Basic Explanation - Always Visible */}
          <div className="text-gray-300">{violation.explanation}</div>

          {/* Simple Recommendation - Always Visible */}
          {/* <div className="text-gray-300">
            <span className="font-medium text-white">Quick fix: </span>
            {violation.recommendation}
          </div> */}

          {/* Expanded Details */}
          {expanded && (
            <div className="space-y-6 pt-4 border-t border-gray-600">
              {/* Detailed Explanation */}
              <div>
                <h4 className="font-semibold mb-3 text-white">
                  Detailed Explanation
                </h4>
                <div className="p-4  border border-gray-600 rounded-lg">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {violation.detailedExplanation}
                  </p>
                </div>
              </div>

              {/* Technical Implementation */}
              <div>
                <h4 className="font-semibold mb-3 text-white">
                  Technical Implementation
                </h4>
                <div className="p-4 bg-zinc-900 border border-gray-600 rounded-lg">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap overflow-x-auto">
                    {violation.technicalRecommendation}
                  </pre>
                </div>
              </div>

              {/* Priority Analysis */}
              <div>
                <h4 className="font-semibold mb-3 text-white">
                  Priority Analysis
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(violation.factors).map(([key, factor]) => (
                    <div
                      key={key}
                      className="p-3 border border-gray-600 rounded-lg"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize text-white">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span
                          className={`font-bold ${getScoreColor(factor.score)}`}
                        >
                          {factor.score}/10
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">
                        {factor.reasoning}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface ScorecardSectionProps {
  scorecard: Array<{
    name?: string;
    score: number;
    comment?: string;
    commentary?: string;
  }>;
  getScoreValue: (score: number) => number;
  scoreColor: (score: number) => string;
}

const formatSkillName = (name: string): string => {
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const ScorecardSection: React.FC<ScorecardSectionProps> = ({
  scorecard,
  getScoreValue,
  scoreColor,
}) => {
  return (
    <Card className="mb-6 overflow-hidden border-border bg-card shadow-md">
      <CardHeader className="border-b border-border bg-background p-6">
        <CardTitle className="text-xl font-bold text-white">
          Skills Scorecard
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-5">
          {scorecard.map(({ name, score, comment, commentary }, index) => {
            const label = name ? formatSkillName(name) : `Skill ${index + 1}`;
            const details = commentary || comment || "";

            return (
              <div key={`${label}-${index}`} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-amber-500 px-3 py-1 text-sm font-bold text-black shadow-sm">
                      {score}/10
                    </span>
                  </div>
                </div>

                <Progress
                  value={getScoreValue(score)}
                  className={`h-2 ${scoreColor(score)}`}
                />

                {details ? (
                  <p className="text-sm leading-relaxed text-white">
                    {details}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScorecardSection;

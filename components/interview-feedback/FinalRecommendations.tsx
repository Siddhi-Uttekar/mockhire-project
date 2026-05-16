import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinalRecommendations as FinalRecommendationsType } from "@/types/feedback";
import { Star, Target, TrendingUp } from "lucide-react";

interface FinalRecommendationsProps {
  recommendations: FinalRecommendationsType;
}

const FinalRecommendations: React.FC<FinalRecommendationsProps> = ({
  recommendations,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-border shadow-md bg-card">
        <CardHeader className="bg-background border-b border-border">
          <CardTitle className="flex items-center font-bold text-foreground">
            <Target className="w-5 h-5 mr-2 text-amber-200" />
            Practice Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            {recommendations.practice_focus_areas?.length > 0 ? (
              recommendations.practice_focus_areas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mr-3 mt-0.5 flex-shrink-0 shadow-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm sm:text-base text-foreground leading-relaxed">
                    {area}
                  </span>
                </li>
              ))
            ) : (
              <p className="text-muted-foreground text-sm">
                No specific focus areas identified
              </p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Overall Impression & Final Tip */}
      <div className="space-y-6">
        <Card className="border-border shadow-md bg-card">
          <CardHeader className="bg-background border-b border-border">
            <CardTitle className="flex items-center font-bold text-foreground">
              <Star className="w-5 h-5 mr-2 text-amber-200" />
              Overall Impression
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-foreground leading-relaxed">
              {recommendations.overall_impression}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center font-bold text-foreground">
              <TrendingUp className="w-5 h-5 mr-2 text-amber-200" />
              Pro Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground font-semibold leading-relaxed">
              {recommendations.final_tip}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FinalRecommendations;

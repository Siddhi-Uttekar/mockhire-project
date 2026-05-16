"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

const feedbackSchema = z.object({
  overallExperience: z.number().min(1).max(5),
  nps: z.number().min(0).max(10),
  bestPart: z.string().optional(),
  worstPart: z.string().optional(),
  platformUsability: z.number().min(1).max(5),
  clarityOfInstructions: z.number().min(1).max(5),
  technicalIssues: z.enum(["yes", "no"]),
  technicalIssuesDescription: z.string().optional(),
  fairness: z.number().min(1).max(5),
  relevance: z.number().min(1).max(5),
  opportunityToDemonstrateSkills: z.enum(["yes", "no"]),
  inclusivity: z.string().optional(),
  feedbackHelpfulness: z.number().min(1).max(5),
  feedbackConstructiveness: z.number().min(1).max(5),
  feedbackTimeliness: z.number().min(1).max(5),
  mostUsefulFeedback: z.string().optional(),
  perceptionChange: z.string().optional(),
  perceptionChangeDescription: z.string().optional(),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

interface CandidateFeedbackFormProps {
  interviewId: string;
  onSubmitSuccess: () => void;
}

export function CandidateFeedbackForm({
  interviewId,
  onSubmitSuccess,
}: CandidateFeedbackFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      overallExperience: 3,
      nps: 5,
      bestPart: "",
      worstPart: "",
      platformUsability: 3,
      clarityOfInstructions: 3,
      technicalIssues: "no",
      technicalIssuesDescription: "",
      fairness: 3,
      relevance: 3,
      opportunityToDemonstrateSkills: "yes",
      inclusivity: "",
      feedbackHelpfulness: 3,
      feedbackConstructiveness: 3,
      feedbackTimeliness: 3,
      mostUsefulFeedback: "",
      perceptionChange: "",
      perceptionChangeDescription: "",
    },
  });

  const onSubmit = async (data: FeedbackFormValues) => {
    console.log("Submitting feedback data:", data);
    setIsSubmitting(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch("/api/feedback/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...data, interviewId }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit feedback");
      }
      onSubmitSuccess();
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border shadow-lg bg-card">
      <CardHeader className="bg-background border-b border-border">
        <CardTitle className="text-2xl font-bold text-foreground">
          Share Your Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Controller
            name="overallExperience"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Overall Experience
                </Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <Controller
            name="nps"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  How likely are you to recommend us to a friend or colleague?
                </Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <div className="space-y-2">
            <Label className="text-foreground font-medium" htmlFor="bestPart">
              What was the best part of your experience? (Optional)
            </Label>
            <Controller
              name="bestPart"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="bestPart"
                  className="border-border bg-background focus:border-amber-200"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium" htmlFor="worstPart">
              What was the worst part of your experience? (Optional)
            </Label>
            <Controller
              name="worstPart"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="worstPart"
                  className="border-border bg-background focus:border-amber-200"
                  {...field}
                />
              )}
            />
          </div>
          <Controller
            name="platformUsability"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Platform Usability
                </Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                    min={1}
                    max={5}
                    step={1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <Controller
            name="clarityOfInstructions"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Clarity of Instructions
                </Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                        /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <Controller
            name="fairness"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Fairness</Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                        /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <Controller
            name="relevance"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Relevance</Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                        /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <Controller
            name="feedbackHelpfulness"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Feedback Helpfulness
                </Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                        /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <Controller
            name="feedbackConstructiveness"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Feedback Constructiveness
                </Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                        /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <Controller
            name="feedbackTimeliness"
            control={control}
            render={({ field }) => (
              <div className="space-y-2">
                <Label className="text-foreground font-medium">
                  Feedback Timeliness
                </Label>
                <div className="flex items-center space-x-4">
                  {/* <Slider
                            min={1}
                            max={5}
                            step={1}
                            value={[field.value]}
                            onValueChange={(value) => field.onChange(value[0])}
                            className="w-full"
                        /> */}
                  <span className="font-bold text-amber-200 text-lg">
                    {field.value}
                  </span>
                </div>
              </div>
            )}
          />
          <div className="space-y-2">
            <Label
              className="text-foreground font-medium"
              htmlFor="mostUsefulFeedback"
            >
              What was the most useful feedback you received? (Optional)
            </Label>
            <Controller
              name="mostUsefulFeedback"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="mostUsefulFeedback"
                  className="border-border bg-background focus:border-amber-200"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-foreground font-medium"
              htmlFor="perceptionChange"
            >
              Did this interview change your perception of the company?
              (Optional)
            </Label>
            <Controller
              name="perceptionChange"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="perceptionChange"
                  className="border-border bg-background focus:border-amber-200"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-foreground font-medium"
              htmlFor="perceptionChangeDescription"
            >
              Please describe how your perception changed. (Optional)
            </Label>
            <Controller
              name="perceptionChangeDescription"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="perceptionChangeDescription"
                  className="border-border bg-background focus:border-amber-200"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium" htmlFor="inclusivity">
              Any feedback on inclusivity? (Optional)
            </Label>
            <Controller
              name="inclusivity"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="inclusivity"
                  className="border-border bg-background focus:border-amber-200"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Did you experience any technical issues?
            </Label>
            <Controller
              name="technicalIssues"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant={field.value === "yes" ? "default" : "outline"}
                    className={
                      field.value === "yes"
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "border-border text-foreground hover:bg-card"
                    }
                    onClick={() => field.onChange("yes")}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "no" ? "default" : "outline"}
                    className={
                      field.value === "no"
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "border-border text-foreground hover:bg-card"
                    }
                    onClick={() => field.onChange("no")}
                  >
                    No
                  </Button>
                </div>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label
              className="text-foreground font-medium"
              htmlFor="technicalIssuesDescription"
            >
              If yes, please describe the technical issues you faced. (Optional)
            </Label>
            <Controller
              name="technicalIssuesDescription"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="technicalIssuesDescription"
                  className="border-border bg-background focus:border-amber-200"
                  {...field}
                />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-foreground font-medium">
              Did you have a fair opportunity to demonstrate your skills?
            </Label>
            <Controller
              name="opportunityToDemonstrateSkills"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant={field.value === "yes" ? "default" : "outline"}
                    className={
                      field.value === "yes"
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "border-border text-foreground hover:bg-card"
                    }
                    onClick={() => field.onChange("yes")}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={field.value === "no" ? "default" : "outline"}
                    className={
                      field.value === "no"
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                        : "border-border text-foreground hover:bg-card"
                    }
                    onClick={() => field.onChange("no")}
                  >
                    No
                  </Button>
                </div>
              )}
            />
          </div>

          {Object.keys(errors).length > 0 && (
            <div className="rounded-md border border-red-500 bg-red-50 p-4 text-sm text-red-700">
              <h3 className="font-bold">Please fix the following errors:</h3>
              <pre className="mt-2 whitespace-pre-wrap">
                {JSON.stringify(
                  Object.fromEntries(
                    Object.entries(errors).map(([key, value]) => [
                      key,
                      (value as any).message,
                    ])
                  ),
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {error && <p className="text-red-600 font-medium">{error}</p>}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 shadow-lg"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Feedback
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

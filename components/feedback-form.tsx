"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent } from "@/components/ui/card";
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Monitor,
  FileText,
  AlertCircle,
  Award,
  TrendingUp,
  Heart,
} from "lucide-react";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

const FormSchema = z.object({
  overallExperience: z.string(),
  nps: z.string(),
  bestPart: z.string(),
  worstPart: z.string(),
  platformUsability: z.string(),
  clarityOfInstructions: z.string(),
  technicalIssues: z.enum(["yes", "no"]),
  technicalIssuesDescription: z.string().optional(),
  fairness: z.string(),
  relevance: z.string(),
  opportunityToDemonstrateSkills: z.enum(["yes", "no"]),
  inclusivity: z.string(),
  feedbackHelpfulness: z.string(),
  feedbackConstructiveness: z.string(),
  feedbackTimeliness: z.string(),
  mostUsefulFeedback: z.string(),
  perceptionChange: z.enum(["improved", "worsened", "no_change"]),
  perceptionChangeDescription: z.string().optional(),
});

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      technicalIssues: "no",
      perceptionChange: "no_change",
    },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch("/api/feedback", {
        method: "POST",
        credentials: "same-origin",
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to submit feedback");
      }

      toast.success(
        "Thank you for your feedback! Your input helps us improve.",
        {
          duration: 5000,
        }
      );
      form.reset();
      setIsSubmitted(true);
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <Card className="border-border shadow-lg bg-card">
        <CardContent className="py-12">
          <div className="flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
            <h2 className="text-2xl font-bold text-foreground">
              Feedback Submitted
            </h2>
            <p className="max-w-2xl text-muted-foreground">
              Thanks for sharing your experience. Your feedback has been saved.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Overall Experience */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-border">
            <Star className="w-6 h-6 text-amber-200" />
            <h2 className="text-xl font-bold text-foreground">
              Overall Experience
            </h2>
          </div>

          <FormField
            control={form.control}
            name="overallExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How would you rate your overall interview experience?
                </FormLabel>
                <FormDescription className="text-sm text-muted-foreground">
                  Rate from 1 (very dissatisfied) to 5 (very satisfied)
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Dissatisfied</SelectItem>
                    <SelectItem value="2">2 - Dissatisfied</SelectItem>
                    <SelectItem value="3">3 - Neutral</SelectItem>
                    <SelectItem value="4">4 - Satisfied</SelectItem>
                    <SelectItem value="5">5 - Very Satisfied</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nps"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  Would you recommend us to others?
                </FormLabel>
                <FormDescription className="text-sm text-muted-foreground">
                  Rate from 0 (not likely) to 10 (extremely likely)
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[...Array(11)].map((_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i} -{" "}
                        {i <= 6
                          ? "Not Likely"
                          : i <= 8
                          ? "Likely"
                          : "Very Likely"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 2: Experience Highlights */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-border">
            <MessageSquare className="w-6 h-6 text-amber-200" />
            <h2 className="text-xl font-bold text-foreground">
              Your Experience
            </h2>
          </div>

          <FormField
            control={form.control}
            name="bestPart"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-amber-200" />
                  What was the best part of your interview?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share what you enjoyed most about the process..."
                    className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20 min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="worstPart"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                  <ThumbsDown className="w-4 h-4 text-amber-200" />
                  What could we improve?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Help us understand any challenges or frustrations..."
                    className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20 min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 3: Platform Usability */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-border">
            <Monitor className="w-6 h-6 text-amber-200" />
            <h2 className="text-xl font-bold text-foreground">
              Platform Experience
            </h2>
          </div>

          <FormField
            control={form.control}
            name="platformUsability"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How easy was it to use our platform?
                </FormLabel>
                <FormDescription className="text-sm text-muted-foreground">
                  Rate from 1 (very difficult) to 5 (very easy)
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Difficult</SelectItem>
                    <SelectItem value="2">2 - Difficult</SelectItem>
                    <SelectItem value="3">3 - Neutral</SelectItem>
                    <SelectItem value="4">4 - Easy</SelectItem>
                    <SelectItem value="5">5 - Very Easy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clarityOfInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How clear were the instructions?
                </FormLabel>
                <FormDescription className="text-sm text-gray-500">
                  Rate from 1 (very unclear) to 5 (very clear)
                </FormDescription>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Unclear</SelectItem>
                    <SelectItem value="2">2 - Unclear</SelectItem>
                    <SelectItem value="3">3 - Neutral</SelectItem>
                    <SelectItem value="4">4 - Clear</SelectItem>
                    <SelectItem value="5">5 - Very Clear</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="technicalIssues"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Did you encounter any technical issues?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="yes"
                        id="tech-yes"
                        className="border-amber-200 text-amber-200"
                      />
                      <FormLabel
                        htmlFor="tech-yes"
                        className="font-normal cursor-pointer"
                      >
                        Yes
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="no"
                        id="tech-no"
                        className="border-amber-200 text-amber-200"
                      />
                      <FormLabel
                        htmlFor="tech-no"
                        className="font-normal cursor-pointer"
                      >
                        No
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("technicalIssues") === "yes" && (
            <FormField
              control={form.control}
              name="technicalIssuesDescription"
              render={({ field }) => (
                <FormItem className="ml-6 p-4 bg-background border-l-4 border-border rounded-r-lg">
                  <FormLabel className="text-base font-semibold text-foreground">
                    Please describe the technical issues
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Help us understand what went wrong so we can fix it..."
                      className="border-border focus:border-amber-200 focus:ring-amber-200/20 bg-background min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Section 4: Additional Questions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-border">
            <FileText className="w-6 h-6 text-amber-200" />
            <h2 className="text-xl font-bold text-foreground">
              Additional Feedback
            </h2>
          </div>

          <FormField
            control={form.control}
            name="fairness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How fair was the interview process?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Unfair</SelectItem>
                    <SelectItem value="2">2 - Unfair</SelectItem>
                    <SelectItem value="3">3 - Neutral</SelectItem>
                    <SelectItem value="4">4 - Fair</SelectItem>
                    <SelectItem value="5">5 - Very Fair</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relevance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How relevant were the questions to the role?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Not Relevant</SelectItem>
                    <SelectItem value="2">2 - Slightly Relevant</SelectItem>
                    <SelectItem value="3">3 - Moderately Relevant</SelectItem>
                    <SelectItem value="4">4 - Very Relevant</SelectItem>
                    <SelectItem value="5">5 - Extremely Relevant</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="opportunityToDemonstrateSkills"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-200" />
                  Did you have a fair opportunity to demonstrate your skills?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="yes"
                        id="skills-yes"
                        className="border-amber-200 text-amber-200"
                      />
                      <FormLabel
                        htmlFor="skills-yes"
                        className="font-normal cursor-pointer"
                      >
                        Yes
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="no"
                        id="skills-no"
                        className="border-amber-200 text-amber-200"
                      />
                      <FormLabel
                        htmlFor="skills-no"
                        className="font-normal cursor-pointer"
                      >
                        No
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="inclusivity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500" />
                  Any feedback on inclusivity and diversity?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="We value diverse perspectives. Share your thoughts on our inclusivity..."
                    className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20 min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Section 5: Feedback Quality */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-2 border-b-2 border-border">
            <TrendingUp className="w-6 h-6 text-amber-200" />
            <h2 className="text-xl font-bold text-foreground">
              Interview Feedback Quality
            </h2>
          </div>

          <FormField
            control={form.control}
            name="feedbackHelpfulness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How helpful was the feedback you received?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Not Helpful</SelectItem>
                    <SelectItem value="2">2 - Slightly Helpful</SelectItem>
                    <SelectItem value="3">3 - Moderately Helpful</SelectItem>
                    <SelectItem value="4">4 - Very Helpful</SelectItem>
                    <SelectItem value="5">5 - Extremely Helpful</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedbackConstructiveness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How constructive was the feedback?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Not Constructive</SelectItem>
                    <SelectItem value="2">2 - Slightly Constructive</SelectItem>
                    <SelectItem value="3">
                      3 - Moderately Constructive
                    </SelectItem>
                    <SelectItem value="4">4 - Very Constructive</SelectItem>
                    <SelectItem value="5">
                      5 - Extremely Constructive
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="feedbackTimeliness"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  How timely was the feedback?
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20">
                      <SelectValue placeholder="Select your rating" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="1">1 - Very Delayed</SelectItem>
                    <SelectItem value="2">2 - Delayed</SelectItem>
                    <SelectItem value="3">3 - Acceptable</SelectItem>
                    <SelectItem value="4">4 - Timely</SelectItem>
                    <SelectItem value="5">5 - Very Timely</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mostUsefulFeedback"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  What was the most useful feedback you received?
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share which feedback helped you the most..."
                    className="border-border bg-background focus:border-amber-200 focus:ring-amber-200/20 min-h-[100px] resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="perceptionChange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-semibold text-foreground">
                  Did this interview change your perception of our company?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="improved"
                        id="perception-improved"
                        className="border-amber-200 text-amber-200"
                      />
                      <FormLabel
                        htmlFor="perception-improved"
                        className="font-normal cursor-pointer"
                      >
                        Yes, it improved my perception
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="worsened"
                        id="perception-worsened"
                        className="border-amber-200 text-amber-200"
                      />
                      <FormLabel
                        htmlFor="perception-worsened"
                        className="font-normal cursor-pointer"
                      >
                        Yes, it worsened my perception
                      </FormLabel>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="no_change"
                        id="perception-no-change"
                        className="border-amber-200 text-amber-200"
                      />
                      <FormLabel
                        htmlFor="perception-no-change"
                        className="font-normal cursor-pointer"
                      >
                        No, it stayed the same
                      </FormLabel>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.watch("perceptionChange") !== "no_change" && (
            <FormField
              control={form.control}
              name="perceptionChangeDescription"
              render={({ field }) => (
                <FormItem className="ml-6 p-4 bg-background border-l-4 border-border rounded-r-lg">
                  <FormLabel className="text-base font-semibold text-foreground">
                    Please tell us more
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What specifically influenced your perception?"
                      className="border-border focus:border-amber-200 focus:ring-amber-200/20 bg-background min-h-[80px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <span className="animate-pulse">Submitting...</span>
              </>
            ) : (
              <>Submit Feedback</>
            )}
          </Button>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Thank you for taking the time to share your feedback!
          </p>
        </div>
      </form>
    </Form>
  );
}

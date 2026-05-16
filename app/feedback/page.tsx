import { FeedbackForm } from "@/components/feedback-form";

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="container mx-auto py-12 md:py-20 px-4 md:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6">
              Share Your Feedback
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Your insights are valuable to us. Please let us know about your
              interview experience and help us improve our process.
            </p>
          </div>
          <div className="bg-card rounded-2xl shadow-xl border border-border p-6 md:p-10 lg:p-12">
            <FeedbackForm />
          </div>
        </div>
      </div>
    </div>
  );
}

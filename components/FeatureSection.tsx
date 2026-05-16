import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Book, Video, Star, Users, Calendar, Clock } from "lucide-react";

const FeatureSection: React.FC = () => {
  const features = [
    {
      icon: <Video className="h-8 w-8 text-amber-300" />,
      title: "Realistic AI Interviews",
      description:
        "Practice with our lifelike AI interviewer that asks relevant questions and responds to your answers naturally.",
    },
    {
      icon: <Star className="h-8 w-8 text-amber-300" />,
      title: "Industry-Specific Questions",
      description:
        "Access thousands of questions curated for different industries, roles, and seniority levels.",
    },
    {
      icon: <Book className="h-8 w-8 text-amber-300" />,
      title: "Instant AI Feedback",
      description:
        "Get personalized feedback on your responses, including content, delivery, and areas for improvement.",
    },
    {
      icon: <Users className="h-8 w-8 text-amber-300" />,
      title: "Behavioral Analysis",
      description:
        "Receive insights on your communication skills, confidence level, and overall interview performance.",
    },
    {
      icon: <Calendar className="h-8 w-8 text-amber-300" />,
      title: "Interview Scheduling (Soon)",
      description:
        "Set up regular practice sessions and track your progress with our comprehensive dashboard.",
    },
    {
      icon: <Clock className="h-8 w-8 text-amber-300" />,
      title: "Time Management",
      description:
        "Learn to deliver concise and impactful responses within appropriate time frames.",
    },
  ];

  return (
    <section id="features" className="section-padding bg-pink-wash-gradient">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Packed With <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            MockHire combines cutting-edge AI technology with expert interview
            knowledge to give you the edge in your job search
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-card border border-border hover:border-amber-300/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all duration-300"
            >
              <CardContent className="pt-6">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureSection;

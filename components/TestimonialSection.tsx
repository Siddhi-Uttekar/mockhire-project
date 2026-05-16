import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

const TestimonialSection: React.FC = () => {
  const testimonials = [
    {
      name: "Ishwari Abuj",
      position: "Product Manager at BharatCore Labs",
      image: "https://avatar.iran.liara.run/public/80",
      stars: 5,
      text: "Amazing application. I was able to practice for my product management interviews with real-world scenarios. The AI feedback was spot on and helped me refine my answers. I landed my dream job at BharatCore Labs thanks to MockHire!",
    },
    {
      name: "Sneha Gonjari",
      position: "Software Engineer at InnoVista Systems",
      image: "https://avatar.iran.liara.run/public/88",
      stars: 4,
      text: "MockHire  is a game changer for me! Truly helped with my interview prep. Helped me for my interview preparation really well! Thank you MockHire",
    },
    {
      name: "Siddhi Uttekar",
      position: " junior developer at TechWave Solutions",
      image: "https://avatar.iran.liara.run/public/88",
      stars: 5,
      text: "I used to get nervous in interviews, but MockHire realistic mock sessions completely changed my game.  myself with clarity. It's really help me, Thanks to MockHire.",
    },
  ];

  const renderStars = (count: number) => {
    return Array(count)
      .fill(0)
      .map((_, i) => (
        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
      ));
  };

  return (
    <section id="testimonials" className="section-padding bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Candidates who <span className="gradient-text">got the call.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex mb-4">
                  {renderStars(testimonial.stars)}
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0 overflow-hidden mr-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.position}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

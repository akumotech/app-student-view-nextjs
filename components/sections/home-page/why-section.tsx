"use client";

import { Code, Users, CreditCard, TrendingUp, Lightbulb, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function WhySection() {
  const features = [
    {
      icon: Code,
      title: "Real-World Projects",
      description:
        "Apply everything you learn in hands-on projects that simulate professional environments.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Users,
      title: "One-on-One Support",
      description: "Instructors and mentors are by your side throughout the program and beyond.",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: CreditCard,
      title: "Flexible Payment Plans",
      description:
        "Education should be accessible. That's why we offer personalized payment schedules designed around your situation.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: TrendingUp,
      title: "Ongoing Career Coaching",
      description: "Resume prep, interview training, LinkedIn branding, and long-term guidance.",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">
            <Heart className="size-3 mr-1" />
            Why Choose Us
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Education That Puts <span className="text-primary">You First</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            The IT world moves fast—but shortcuts won't get you far. That's why at aKumoSolutions,
            we focus on lasting skills, problem-solving, and the <em>DevOps mentality</em>. We
            empower you not only to land a job but to grow into a career that supports your future
            and your family's future.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/30 hover:scale-[1.02]"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-xl ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className={`size-6 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom emphasis */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-center mb-4">
                <Lightbulb className="size-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Our Philosophy</h3>
              <p className="text-lg text-muted-foreground">
                We believe success is built, not rushed. Every student receives the attention,
                resources, and ongoing support needed to build a sustainable career in technology.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

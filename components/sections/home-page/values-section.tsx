"use client";

import { Target, BookOpen, TrendingUp, Eye, Heart, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ValuesSection() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven Program",
      description:
        "We believe success is built, not rushed. That's why we support our students even after the 8-month program ends—because your growth doesn't stop at graduation.",
      color: "text-red-600",
      bgColor: "bg-red-50",
      gradient: "from-red-50 to-red-100/50",
    },
    {
      icon: BookOpen,
      title: "Education-First",
      description:
        "We don't cut corners. We teach thoroughly, with patience and clarity, so you can apply your skills with confidence.",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      gradient: "from-blue-50 to-blue-100/50",
    },
    {
      icon: TrendingUp,
      title: "Career Longevity Over Quick Wins",
      description:
        "We prepare you for sustainable growth, not just your first job. Our focus is on building skills that will serve you throughout your entire career.",
      color: "text-green-600",
      bgColor: "bg-green-50",
      gradient: "from-green-50 to-green-100/50",
    },
    {
      icon: Eye,
      title: "Transparent Curriculum",
      description:
        "You'll always know what you're learning, why it matters, and how it connects to your future success in the industry.",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      gradient: "from-purple-50 to-purple-100/50",
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">
            <Heart className="size-3 mr-1" />
            Our Values
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            What Sets Us <span className="text-primary">Apart</span>
          </h2>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Our commitment to your success goes beyond just teaching technical skills. These core
            values guide everything we do.
          </p>
        </div>

        {/* Values grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
          {values.map((value, index) => (
            <Card
              key={index}
              className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-background to-muted/30 hover:scale-[1.02] relative overflow-hidden"
            >
              {/* Background decoration */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${value.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />

              <CardContent className="p-8 relative">
                <div className="space-y-4">
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl ${value.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                  >
                    <value.icon className={`size-8 ${value.color}`} />
                  </div>

                  {/* Content */}
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">{value.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom emphasis */}
        <div className="mt-16">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="flex items-center justify-center mb-6">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Zap className="size-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Your Success is Our Mission</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                These aren't just words on a website. They're the principles that guide every
                decision we make, every lesson we teach, and every interaction we have with our
                students.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

"use client";

import { ArrowRight, CheckCircle, Users, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

export function NewHeroSection() {
  const router = useRouter();

  const stats = [
    { icon: Users, label: "Students Trained", value: "500+" },
    { icon: Award, label: "Job Placement Rate", value: "85%" },
    { icon: Clock, label: "Program Duration", value: "8 Months" },
  ];

  const highlights = [
    "Real-World Projects",
    "One-on-One Support",
    "Flexible Payment Plans",
    "Ongoing Career Coaching",
  ];

  return (
    <section className="relative w-full py-16 md:py-24 lg:py-32 bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16 items-center">
          {/* Main content */}
          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-6">
              <Badge variant="secondary" className="w-fit">
                🚀 Next Cohort Starts November 2024
              </Badge>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl xl:text-7xl/none bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Build a Career That Lasts.{" "}
                <span className="text-primary">Start With Cloud & DevOps.</span>
              </h1>

              <p className="max-w-[600px] text-lg md:text-xl text-muted-foreground leading-relaxed">
                At aKumoSolutions, we don't just teach tools—we prepare you for a lifelong career in
                tech. Learn through real-world projects, one-on-one mentorship, and career support
                that stays with you long after graduation.
              </p>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {highlights.map((highlight, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="size-4 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{highlight}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="h-12 px-8 cursor-pointer group"
                onClick={() => router.push("/signup")}
              >
                Register Now
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 cursor-pointer"
                onClick={() => {
                  // TODO: Replace with actual info session registration
                  router.push("/signup");
                }}
              >
                Join an Info Session
              </Button>
            </div>
          </div>

          {/* Stats cards */}
          <div className="space-y-4">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-r from-background to-muted/50"
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <stat.icon className="size-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Trust indicator */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="p-6 text-center">
                <div className="text-sm font-medium text-primary">Trusted by professionals at</div>
                <div className="text-xs text-muted-foreground mt-1">
                  AWS • Microsoft • Google • Meta
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

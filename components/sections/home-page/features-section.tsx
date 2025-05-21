"use client";

import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: CheckCircle,
    title: "Real-time Code Scanning",
    description:
      "Continuously scan your codebase for bugs, code smells, and anti-patterns as you code.",
  },
  {
    icon: CheckCircle,
    title: "Security Vulnerability Detection",
    description:
      "Identify security risks and vulnerabilities before they reach production.",
  },
  {
    icon: CheckCircle,
    title: "Code Quality Metrics",
    description:
      "Track maintainability, complexity, and test coverage with actionable metrics.",
  },
  {
    icon: CheckCircle,
    title: "Pull Request Integration",
    description:
      "Get instant feedback and suggestions directly in your pull requests.",
  },
  {
    icon: CheckCircle,
    title: "Team Collaboration",
    description:
      "Collaborate with your team, assign issues, and resolve problems together.",
  },
  {
    icon: CheckCircle,
    title: "Multi-language Support",
    description:
      "Analyze code in JavaScript, Python, Java, Go, and more—all in one platform.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              CodeSight: Your Complete Code Analysis Toolkit
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              CodeSight empowers developers and teams to write better, more
              secure code with automated analysis and actionable insights.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-3 lg:gap-12">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="hover:shadow-2xl transition-all duration-300"
            >
              <CardContent className="pt-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

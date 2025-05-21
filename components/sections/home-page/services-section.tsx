"use client";

import { CheckCircle, AlertTriangle, Github, Cloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Connect Your Repository",
    description:
      "Easily connect your GitHub, GitLab, or Bitbucket repository to CodeSight.",
    icon: Github,
  },
  {
    title: "Automated Analysis",
    description:
      "Every commit and pull request is automatically analyzed for bugs, vulnerabilities, and code quality.",
    icon: CheckCircle,
  },
  {
    title: "Instant Feedback",
    description:
      "Receive actionable feedback and detailed reports directly in your workflow.",
    icon: AlertTriangle,
  },
  {
    title: "Collaborate & Resolve",
    description:
      "Assign issues, discuss solutions, and resolve problems as a team—all within CodeSight.",
    icon: Cloud,
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="w-full py-12 md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              How It Works
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              How CodeSight Works
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Get up and running in minutes. CodeSight fits seamlessly into your
              existing workflow.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="hover:shadow-2xl transition-all duration-300"
            >
              <CardContent className="pt-6 flex flex-col items-center text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="size-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

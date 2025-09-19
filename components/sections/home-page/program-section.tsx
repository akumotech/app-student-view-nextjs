"use client";

import {
  Calendar,
  CheckCircle,
  Code,
  Cloud,
  Container,
  GitBranch,
  Settings,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export function ProgramSection() {
  const curriculum = [
    {
      icon: Settings,
      title: "Introduction to IT & Linux",
      description: "Foundation skills and system administration",
      duration: "Weeks 1-4",
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
    {
      icon: Code,
      title: "Scripting with Bash, Python, and Git",
      description: "Automation and version control fundamentals",
      duration: "Weeks 5-8",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Cloud,
      title: "Cloud Computing with AWS",
      description: "Cloud services and infrastructure management",
      duration: "Weeks 9-16",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      icon: GitBranch,
      title: "Infrastructure as Code with Terraform",
      description: "Automated infrastructure provisioning",
      duration: "Weeks 17-20",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Container,
      title: "Containerization with Docker",
      description: "Application containerization and deployment",
      duration: "Weeks 21-24",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Settings,
      title: "Orchestration with Kubernetes",
      description: "Container orchestration at scale",
      duration: "Weeks 25-28",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      icon: GitBranch,
      title: "CI/CD with Jenkins",
      description: "Continuous integration and deployment pipelines",
      duration: "Weeks 29-32",
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const milestones = [
    "AWS Cloud Practitioner Certification",
    "Terraform Associate Certification",
    "Docker Certified Associate",
    "Kubernetes Application Developer (CKAD)",
    "Final Capstone Project",
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">
            <Calendar className="size-3 mr-1" />
            The Program
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            An 8-Month Journey. <span className="text-primary">A Lifetime of Opportunity.</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Our Agile & DevOps program is built for ambitious learners—whether you're starting fresh
            in tech or looking to advance your career. You'll train intensively, but never alone.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
          {/* Curriculum */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-8">Comprehensive Curriculum</h3>
            <div className="space-y-4">
              {curriculum.map((module, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-3 rounded-lg ${module.bgColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <module.icon className={`size-5 ${module.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg">{module.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {module.duration}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground">{module.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Milestones & Progress */}
          <div className="space-y-8">
            {/* Progress indicator */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  Program Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Completion Rate</span>
                    <span className="font-medium">32 Weeks</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Intensive training with hands-on projects and real-world applications
                </p>
              </CardContent>
            </Card>

            {/* Certification milestones */}
            <Card>
              <CardHeader>
                <CardTitle>Certification Milestones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="size-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{milestone}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Final project highlight */}
            <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-background to-primary/5">
              <CardContent className="p-6 text-center">
                <div className="space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="size-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">Capstone Project</h4>
                  <p className="text-sm text-muted-foreground">
                    Plan, document, implement, and maintain a full real-world system—just like you
                    would on the job.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-bold mb-2">Ready to Transform Your Career?</h3>
              <p className="text-muted-foreground mb-4">
                Every step prepares you for certification milestones and real-world success.
              </p>
              <Badge variant="default" className="text-sm">
                Next Cohort: November 2024
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

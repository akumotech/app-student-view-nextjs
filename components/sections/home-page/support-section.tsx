"use client";

import { Clock, Presentation, UserCheck, Users, Shield, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SupportSection() {
  const supportFeatures = [
    {
      icon: Clock,
      title: "Dedicated Office Hours",
      description: "One-on-one time with instructors whenever you need help or clarification.",
      availability: "Weekly",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Presentation,
      title: "Optional Demo Fridays",
      description: "Showcase and validate your skills in a supportive environment.",
      availability: "Weekly",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: UserCheck,
      title: "Career Coaching",
      description: "Resume, LinkedIn, and interview prep to help you land your dream job.",
      availability: "Ongoing",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      icon: Users,
      title: "Alumni Network & Mentorship",
      description: "Connect with graduates who've successfully transitioned to tech careers.",
      availability: "Lifetime",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  const communityStats = [
    { label: "Active Alumni", value: "200+" },
    { label: "Industry Mentors", value: "50+" },
    { label: "Career Placements", value: "85%" },
    { label: "Average Salary Increase", value: "150%" },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">
            <Shield className="size-3 mr-1" />
            Support System
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Your Success Is <span className="text-primary">Our Commitment</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            At aKumoSolutions, you're never just another student. You're part of a community. From
            the first class to your first promotion, you'll have access to comprehensive support.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[2fr_1fr] lg:gap-16">
          {/* Support features */}
          <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-8">Comprehensive Support Network</h3>
            <div className="grid gap-6 md:grid-cols-2">
              {supportFeatures.map((feature, index) => (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-background to-muted/50 hover:scale-[1.02]"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2.5 rounded-lg ${feature.bgColor} group-hover:scale-110 transition-transform duration-300`}
                        >
                          <feature.icon className={`size-5 ${feature.color}`} />
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {feature.availability}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Community stats */}
          <div className="space-y-6">
            {/* Stats card */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Community Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {communityStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                    <span className="font-bold text-lg">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community highlight */}
            <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-background to-primary/5">
              <CardContent className="p-6">
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="size-6 text-primary" />
                  </div>
                  <h4 className="font-semibold">24/7 Community Access</h4>
                  <p className="text-sm text-muted-foreground">
                    Join our active Slack workspace where students, alumni, and instructors
                    collaborate and support each other.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Lifetime support */}
            <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <CardContent className="p-6 text-center">
                <div className="space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="size-5 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800">Lifetime Access</h4>
                  <p className="text-sm text-green-700">
                    Your relationship with aKumoSolutions doesn't end at graduation. We're here for
                    your entire career journey.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom testimonial preview */}
        <div className="mt-16">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Users className="size-8 text-primary" />
                </div>
                <blockquote className="text-lg italic text-muted-foreground">
                  "The support didn't end when I graduated. My mentor helped me negotiate my first
                  tech salary, and I still reach out to the community when I face new challenges at
                  work."
                </blockquote>
                <div className="text-sm">
                  <div className="font-medium">Sarah M.</div>
                  <div className="text-muted-foreground">DevOps Engineer at TechCorp</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Star, Quote, TrendingUp, Users, MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ResultsSection() {
  const testimonials = [
    {
      id: 1,
      name: "Maria Rodriguez",
      role: "DevOps Engineer",
      company: "TechFlow Solutions",
      location: "Austin, TX",
      previousRole: "Restaurant Manager",
      salaryIncrease: "180%",
      timeToJob: "2 months post-graduation",
      avatar: "/api/placeholder/150/150",
      quote:
        "I went from managing a restaurant to deploying cloud infrastructure. The hands-on projects and one-on-one mentorship made all the difference. Now I'm leading automation initiatives at my company.",
      rating: 5,
      cohort: "Spring 2024",
    },
    {
      id: 2,
      name: "David Kim",
      role: "Cloud Solutions Architect",
      company: "InnovateNow",
      location: "Seattle, WA",
      previousRole: "Retail Associate",
      salaryIncrease: "220%",
      timeToJob: "1 month post-graduation",
      avatar: "/api/placeholder/150/150",
      quote:
        "The program didn't just teach me tools—it taught me how to think like a DevOps professional. The career coaching helped me negotiate a salary I never thought possible.",
      rating: 5,
      cohort: "Fall 2023",
    },
    {
      id: 3,
      name: "Aisha Patel",
      role: "Senior Site Reliability Engineer",
      company: "DataCore Systems",
      location: "San Francisco, CA",
      previousRole: "Administrative Assistant",
      salaryIncrease: "200%",
      timeToJob: "3 weeks post-graduation",
      avatar: "/api/placeholder/150/150",
      quote:
        "As a single mother, I needed flexible payment options and ongoing support. aKumoSolutions delivered on both. I'm now providing a stable future for my family in tech.",
      rating: 5,
      cohort: "Summer 2024",
    },
    {
      id: 4,
      name: "James Thompson",
      role: "Infrastructure Engineer",
      company: "CloudFirst Inc",
      location: "Denver, CO",
      previousRole: "Construction Worker",
      salaryIncrease: "160%",
      timeToJob: "6 weeks post-graduation",
      avatar: "/api/placeholder/150/150",
      quote:
        "The transition from construction to tech seemed impossible, but the instructors believed in me when I didn't believe in myself. The alumni network is incredible—always willing to help.",
      rating: 5,
      cohort: "Winter 2024",
    },
  ];

  const successStats = [
    { label: "Average Salary Increase", value: "165%", icon: TrendingUp },
    { label: "Job Placement Rate", value: "85%", icon: Users },
    { label: "Career Transitions", value: "90%", icon: MapPin },
    { label: "Student Satisfaction", value: "4.9/5", icon: Star },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">
            <Star className="size-3 mr-1" />
            Success Stories
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            Real People. <span className="text-primary">Real Results.</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Our students come from diverse backgrounds—immigrants, career changers, parents, and
            community leaders. What they share is ambition: the drive to create a better future.
          </p>
        </div>

        {/* Success stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {successStats.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <stat.icon className="size-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:gap-12 mb-16">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="group hover:shadow-xl transition-all duration-500 border-0 bg-gradient-to-br from-background to-muted/30 hover:scale-[1.02] relative overflow-hidden"
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl" />

              <CardContent className="p-8 relative">
                <div className="space-y-6">
                  {/* Quote */}
                  <div className="relative">
                    <Quote className="absolute -top-2 -left-2 size-8 text-primary/20" />
                    <p className="text-muted-foreground leading-relaxed italic pl-6">
                      "{testimonial.quote}"
                    </p>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  {/* Profile */}
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-14 h-14 border-2 border-primary/20">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-primary font-medium">{testimonial.role}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.company} • {testimonial.location}
                        </div>
                      </div>

                      {/* Success metrics */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="size-3 mr-1" />+{testimonial.salaryIncrease} salary
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="size-3 mr-1" />
                          {testimonial.cohort}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Previously: {testimonial.previousRole} • Hired: {testimonial.timeToJob}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <Card className="max-w-4xl mx-auto border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:30px_30px]" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

            <CardContent className="p-8 md:p-12 text-center relative">
              <div className="space-y-6">
                <div className="flex items-center justify-center">
                  <div className="p-4 rounded-2xl bg-primary/10">
                    <Users className="size-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl md:text-3xl font-bold">Your Success Story Starts Here</h3>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Join hundreds of professionals who've transformed their careers through our
                    comprehensive DevOps program. Their stories are proof that with determination
                    and support, anyone can thrive.
                  </p>
                </div>
                <Badge variant="default" className="text-sm">
                  Ready to write your success story?
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

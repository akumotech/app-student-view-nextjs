"use client";

import { ArrowRight, Calendar, Users, Clock, CheckCircle, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function CtaSection() {
  const router = useRouter();

  const urgencyFactors = [
    "Limited seats available",
    "Early bird pricing ends soon",
    "Next cohort starts November 2024",
    "Personal payment plans available",
  ];

  const infoSessions = [
    {
      date: "October 19, 2024",
      time: "7:00 PM EST",
      format: "Virtual",
      topics: ["Program Overview", "Career Outcomes", "Q&A Session"],
    },
    {
      date: "October 26, 2024",
      time: "2:00 PM EST",
      format: "Virtual",
      topics: ["Live Demo", "Payment Options", "Admission Process"],
    },
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-grid-black/[0.02] bg-[size:60px_60px]" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-6 mb-16">
          <Badge variant="secondary" className="mb-4">
            <Rocket className="size-3 mr-1" />
            Take Action Now
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-6xl font-bold tracking-tight">
            Ready to <span className="text-primary">Start?</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            Your future in Agile & DevOps begins with one choice: the choice to invest in yourself.
            Join our upcoming info session or register now to secure your spot in the next cohort.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
          {/* Main CTA */}
          <div className="space-y-8">
            {/* Primary actions */}
            <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/15 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />

              <CardContent className="p-8 md:p-12 relative">
                <div className="space-y-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl md:text-3xl font-bold">Transform Your Career Today</h3>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Don't wait for the perfect moment. The best time to start building your tech
                      career is now.
                    </p>
                  </div>

                  {/* Primary CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      size="lg"
                      className="h-14 px-8 text-lg cursor-pointer group"
                      onClick={() => router.push("/signup")}
                    >
                      Register for November Cohort
                      <ArrowRight className="ml-2 size-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 text-lg cursor-pointer bg-background/80 backdrop-blur"
                      onClick={() => {
                        // TODO: Replace with actual info session registration
                        router.push("/signup");
                      }}
                    >
                      <Calendar className="mr-2 size-5" />
                      Join Info Session
                    </Button>
                  </div>

                  {/* Urgency indicators */}
                  <div className="grid gap-3 md:grid-cols-2 max-w-2xl mx-auto">
                    {urgencyFactors.map((factor, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="size-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Info sessions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-center">Upcoming Info Sessions</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {infoSessions.map((session, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{session.date}</div>
                            <div className="text-sm text-muted-foreground">{session.time}</div>
                          </div>
                          <Badge variant="secondary">{session.format}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="text-sm font-medium">What we'll cover:</div>
                          <ul className="text-sm text-muted-foreground space-y-1">
                            {session.topics.map((topic, topicIndex) => (
                              <li key={topicIndex} className="flex items-center space-x-2">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                <span>{topic}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick stats */}
            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                    <Users className="size-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-800">500+</div>
                    <div className="text-sm text-green-700">Successful Graduates</div>
                  </div>
                  <div className="text-xs text-green-600">
                    Join a community of successful professionals
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <h4 className="font-semibold">Program Timeline</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Registration Deadline:</span>
                      <span className="font-medium">Nov 1, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program Starts:</span>
                      <span className="font-medium">Nov 15, 2024</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Graduation:</span>
                      <span className="font-medium">July 2025</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact info */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6 text-center">
                <div className="space-y-3">
                  <h4 className="font-semibold">Questions?</h4>
                  <p className="text-sm text-muted-foreground">
                    We're here to help you make the right decision for your future.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => (window.location.href = "mailto:support@akumosolutions.io")}
                  >
                    Contact Us
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Final motivation */}
            <Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-background to-primary/5">
              <CardContent className="p-6 text-center">
                <div className="space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                    <Rocket className="size-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">Your Future Awaits</h4>
                  <p className="text-sm text-muted-foreground">
                    Every day you wait is another day you could be building the career you deserve.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { CheckCircle, Mail, Phone, MapPin, Linkedin, Twitter, Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function NewFooterSection() {
  const quickLinks = [
    { label: "Program Overview", href: "#program" },
    { label: "Success Stories", href: "#results" },
    { label: "Tuition & Payment", href: "#tuition" },
    { label: "Contact Us", href: "mailto:support@akumosolutions.io" },
  ];

  const socialLinks = [
    {
      icon: Linkedin,
      href: "#",
      label: "LinkedIn",
      color: "hover:text-blue-600",
    },
    {
      icon: Twitter,
      href: "#",
      label: "Twitter",
      color: "hover:text-blue-400",
    },
    {
      icon: Github,
      href: "#",
      label: "GitHub",
      color: "hover:text-gray-800",
    },
  ];

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: "support@akumosolutions.io",
      href: "mailto:support@akumosolutions.io",
    },
    {
      icon: Phone,
      label: "Phone",
      value: "+1 (555) 123-4567",
      href: "tel:+15551234567",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Remote & Online",
      href: "#",
    },
  ];

  return (
    <footer className="w-full border-t bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Main footer content */}
      <div className="container mx-auto px-4 md:px-6 max-w-7xl py-16">
        <div className="grid gap-12 lg:grid-cols-[2fr_1fr_1fr] lg:gap-16">
          {/* Company info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center">
                <CheckCircle className="size-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">aKumoSolutions</h3>
                <p className="text-sm text-muted-foreground">Cloud & DevOps Bootcamp</p>
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed max-w-md">
              Empowering ambitious learners to build lasting careers in Cloud & DevOps through
              comprehensive training, real-world projects, and ongoing support that extends far
              beyond graduation.
            </p>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-4 max-w-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-primary">500+</div>
                <div className="text-xs text-muted-foreground">Graduates</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">85%</div>
                <div className="text-xs text-muted-foreground">Job Placement</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-primary">165%</div>
                <div className="text-xs text-muted-foreground">Avg Salary Increase</div>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className={`text-muted-foreground ${social.color} transition-colors`}
                  onClick={() => {
                    // TODO: Replace with actual social media links
                    console.log(`Navigate to ${social.label}`);
                  }}
                >
                  <social.icon className="size-5" />
                  <span className="sr-only">{social.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Quick Links</h4>
            <nav className="space-y-3">
              {quickLinks.map((link, index) => (
                <div key={index}>
                  {link.href.startsWith("mailto:") ? (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary justify-start"
                      onClick={() => (window.location.href = link.href)}
                    >
                      {link.label}
                    </Button>
                  ) : (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-sm font-normal text-muted-foreground hover:text-primary justify-start"
                      onClick={() => {
                        // Smooth scroll to section
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: "smooth" });
                        }
                      }}
                    >
                      {link.label}
                    </Button>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Contact info */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold">Get in Touch</h4>
            <div className="space-y-4">
              {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <contact.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground">{contact.label}</div>
                    {contact.href.startsWith("mailto:") || contact.href.startsWith("tel:") ? (
                      <Button
                        variant="link"
                        className="h-auto p-0 text-sm font-medium hover:text-primary justify-start"
                        onClick={() => (window.location.href = contact.href)}
                      >
                        {contact.value}
                      </Button>
                    ) : (
                      <div className="text-sm font-medium">{contact.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Contact CTA */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <h5 className="font-semibold text-sm">Questions?</h5>
                  <p className="text-xs text-muted-foreground">
                    We're here to help you make the right decision.
                  </p>
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => (window.location.href = "mailto:support@akumosolutions.io")}
                  >
                    <Mail className="size-3 mr-1" />
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t bg-muted/30">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>© 2024 aKumoSolutions.</span>
              <span>Built with</span>
              <Heart className="size-3 text-red-500 fill-current" />
              <span>for ambitious learners.</span>
            </div>

            {/* Additional info */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                Next Cohort: November 2024
              </Badge>
              <div className="text-xs text-muted-foreground">Transforming careers since 2020</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

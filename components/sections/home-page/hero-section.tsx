"use client";

import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-b from-background to-muted/40">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px] items-center">
          <div className="flex flex-col justify-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none">
                Automated Code Analysis for Modern Teams
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Uncover bugs, improve code quality, and ship with confidence.
                CodeSight analyzes your codebase in real time, providing
                actionable insights and security alerts for every commit and
                pull request.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="h-12 cursor-pointer">
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 cursor-pointer"
              >
                See Live Demo
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CheckCircle className="size-4 text-green-500" />
                <span>Real-time scanning</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="size-4 text-green-500" />
                <span>Security alerts</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="size-4 text-green-500" />
                <span>Actionable insights</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[500px] overflow-hidden rounded-xl border bg-background p-2 shadow-xl flex items-center justify-center min-h-[320px]">
              <Image
                src="/preview.png"
                alt="CodeSight dashboard preview"
                width={500}
                height={320}
                className="rounded-lg object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

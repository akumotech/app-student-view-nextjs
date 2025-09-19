"use client";

import { DollarSign, Calendar, Award, CreditCard, Shield, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function TuitionSection() {
  const router = useRouter();

  const paymentOptions = [
    {
      title: "Upfront Deposit",
      amount: "$300",
      description: "Applied directly to your tuition",
      highlight: true,
    },
    {
      title: "Monthly Payments",
      amount: "$580-900",
      description: "Spread across 13-20 months",
      highlight: false,
    },
    {
      title: "Total Investment",
      amount: "$12,000",
      description: "Complete program cost",
      highlight: false,
    },
  ];

  const paymentFeatures = [
    "No interest charges",
    "Flexible payment schedule",
    "Payment plans adjusted to your comfort level",
    "Scholarships available for qualifying candidates",
  ];

  const scholarshipTypes = [
    {
      title: "Community Leaders",
      description: "For active community organizers and volunteers",
      discount: "Up to 20%",
    },
    {
      title: "Non-Profit Workers",
      description: "For current or former non-profit employees",
      discount: "Up to 15%",
    },
    {
      title: "Military Veterans",
      description: "For veterans transitioning to civilian careers",
      discount: "Up to 25%",
    },
  ];

  const valueProposition = [
    "Industry-recognized certifications",
    "Real-world project portfolio",
    "Career coaching and job placement support",
    "Lifetime access to alumni network",
    "Average 165% salary increase",
    "85% job placement rate",
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6 max-w-7xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="mb-4">
            <DollarSign className="size-3 mr-1" />
            Investment & Payment
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            An Investment in <span className="text-primary">Your Future</span>
          </h2>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed">
            We believe financial barriers shouldn't block your path to a successful tech career.
            That's why we offer flexible payment options designed around your situation.
          </p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[1fr_400px] lg:gap-16">
          {/* Main content */}
          <div className="space-y-12">
            {/* Payment options */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Flexible Payment Options</h3>
              <div className="grid gap-6 md:grid-cols-3">
                {paymentOptions.map((option, index) => (
                  <Card
                    key={index}
                    className={`group transition-all duration-300 ${
                      option.highlight
                        ? "border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl"
                        : "hover:shadow-lg border-0 bg-gradient-to-br from-background to-muted/50"
                    }`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-3xl font-bold text-primary">{option.amount}</div>
                        <div className="text-sm text-muted-foreground">{option.description}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Payment features */}
              <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100/50">
                <CardContent className="p-6">
                  <div className="grid gap-3 md:grid-cols-2">
                    {paymentFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                        <span className="text-sm text-green-800">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Scholarships */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold">Scholarship Opportunities</h3>
              <div className="grid gap-4 md:grid-cols-3">
                {scholarshipTypes.map((scholarship, index) => (
                  <Card key={index} className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{scholarship.title}</h4>
                          <Badge variant="secondary">{scholarship.discount}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* ROI Calculator */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="size-5 text-primary" />
                  Return on Investment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Program Investment:</span>
                    <span className="font-semibold">$12,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Average Salary Increase:</span>
                    <span className="font-semibold text-green-600">+$35,000/year</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">ROI in Year 1:</span>
                      <span className="font-bold text-lg text-primary">290%</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on average student outcomes and salary data
                </p>
              </CardContent>
            </Card>

            {/* What's included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What's Included</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {valueProposition.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="size-4 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment security */}
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <CardContent className="p-6 text-center">
                <div className="space-y-3">
                  <div className="w-10 h-10 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="size-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800">Secure Payments</h4>
                  <p className="text-sm text-blue-700">
                    All payments processed securely with industry-standard encryption and fraud
                    protection.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardContent className="p-6 text-center space-y-4">
                <h4 className="font-semibold">Ready to Get Started?</h4>
                <p className="text-sm text-muted-foreground">
                  Secure your spot with just $300 down
                </p>
                <Button className="w-full" onClick={() => router.push("/signup")}>
                  <CreditCard className="size-4 mr-2" />
                  Register Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

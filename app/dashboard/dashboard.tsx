"use client";

import type React from "react";
import { useEffect, useState } from "react";
import {
  BarChart,
  Calendar,
  Clock,
  Code2,
  Cpu,
  FileCode,
  Laptop,
  Loader2,
  LockKeyhole,
  Package,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

// Base type for time-related statistics
export interface TimeStats {
  total_seconds: number;
  percent: number;
  text: string;
  hours: number;
  minutes: number;
}

// Language statistics
export interface Language extends TimeStats {
  name: string;
}

// Editor statistics
export interface Editor extends TimeStats {
  name: string;
}

// Dependency statistics
export interface Dependency extends TimeStats {
  name: string;
}

// Operating system statistics
export interface OperatingSystem extends TimeStats {
  name: string;
}

// Project statistics
export interface Project extends TimeStats {
  name: string;
}

// Category statistics
export interface Category extends TimeStats {
  name: string;
}

// Best day information
export interface BestDay {
  date: string;
  total_seconds: number;
  text: string;
}

// Main dashboard data structure
export interface DashboardData {
  id: string;
  user_id: string;
  range: string;
  start: string;
  end: string;
  human_readable_total_including_other_language: string;
  daily_average_including_other_language: number;
  human_readable_daily_average_including_other_language: string;
  categories: Category[];
  languages: Language[];
  editors: Editor[];
  dependencies: Dependency[];
  operating_systems: OperatingSystem[];
  projects: Project[];
  best_day: BestDay;
}

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchDashboard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const baseUrl =
          process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
        const token = localStorage.getItem("authToken") || "";

        // 1️⃣ First fetch the current user's email
        const userResponse = await fetch(`${baseUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!userResponse.ok) {
          throw new Error(`Failed to fetch user info: ${userResponse.status}`);
        }

        const userResult = await userResponse.json();

        const userEmail = userResult?.email;
        if (!userEmail) {
          throw new Error("User email not found in response.");
        }

        // 2️⃣ Then fetch the dashboard data using the email
        const dashboardResponse = await fetch(`${baseUrl}/wakatime/usage`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userEmail }),
        });

        if (dashboardResponse.status === 404) {
          setError(
            "No WakaTime data found. Please authenticate your account by clicking the 'WakaTime Auth' button at the top."
          );
          setDashboardData(null);
          return;
        }

        if (!dashboardResponse.ok) {
          throw new Error(
            `Failed to fetch dashboard data: ${dashboardResponse.status}`
          );
        }

        const dashboardResult = await dashboardResponse.json();
        setDashboardData(dashboardResult.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch data. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        {/* Show loading indicator while fetching data */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Show dashboard only when we have data */}
        {dashboardData && (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {new Date(dashboardData.start).toLocaleDateString()} -{" "}
                {new Date(dashboardData.end).toLocaleDateString()}
              </div>
            </div>

            <Tabs
              defaultValue="overview"
              className="space-y-4"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="languages">Languages</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Coding Time
                      </CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.categories[0].text}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Daily average:{" "}
                        {
                          dashboardData.human_readable_daily_average_including_other_language
                        }
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Top Language
                      </CardTitle>
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {dashboardData.languages[0].name}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.languages[0].text} (
                        {dashboardData.languages[0].percent.toFixed(1)}%)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Top Project
                      </CardTitle>
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold truncate">
                        {dashboardData.projects[0].name}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.projects[0].text} (
                        {dashboardData.projects[0].percent.toFixed(1)}%)
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Best Day
                      </CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Date(
                          dashboardData.best_day.date
                        ).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {dashboardData.best_day.text}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.languages.slice(0, 5).map((language) => (
                          <div className="grid gap-2" key={language.name}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">
                                  {language.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {language.text}
                                </span>
                                <span className="text-sm font-medium">
                                  {language.percent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={language.percent}
                              className="h-2"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.projects.map((project) => (
                          <div className="grid gap-2" key={project.name}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-medium truncate max-w-[180px]">
                                  {project.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {project.text}
                                </span>
                              </div>
                            </div>
                            <Progress value={project.percent} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="col-span-2">
                    <CardHeader>
                      <CardTitle>Top Dependencies</CardTitle>
                      <CardDescription>
                        {" Libraries and frameworks you've used the most"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {dashboardData.dependencies
                          .slice(0, 5)
                          .map((dependency) => (
                            <div className="grid gap-2" key={dependency.name}>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {dependency.name}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {dependency.text}
                                  </span>
                                </div>
                              </div>
                              <Progress
                                value={dependency.percent}
                                max={10}
                                className="h-2"
                              />
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Info</CardTitle>
                      <CardDescription>
                        Your development environment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Operating System</span>
                          <span className="ml-auto text-sm text-muted-foreground">
                            {dashboardData.operating_systems[0].name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Editor</span>
                          <span className="ml-auto text-sm text-muted-foreground">
                            {dashboardData.editors[0].name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Categories</span>
                          <span className="ml-auto text-sm text-muted-foreground">
                            {dashboardData.categories[0].name}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="languages" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Language Breakdown</CardTitle>
                    <CardDescription>
                      Time spent coding in different languages
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dashboardData.languages.map((language) => (
                        <div className="grid gap-2" key={language.name}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Code2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {language.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {language.text}
                              </span>
                              <span className="text-sm font-medium">
                                {language.percent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <Progress value={language.percent} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Breakdown</CardTitle>
                    <CardDescription>
                      Time spent on different projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dashboardData.projects.map((project) => (
                        <div className="grid gap-2" key={project.name}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileCode className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {project.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground">
                                {project.text}
                              </span>
                              <span className="text-sm font-medium">
                                {project.percent.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <Progress value={project.percent} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="dependencies" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Dependencies</CardTitle>
                    <CardDescription>
                      {"Libraries and frameworks you've used the most"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dashboardData.dependencies
                        .slice(0, 10)
                        .map((dependency) => (
                          <div className="grid gap-2" key={dependency.name}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {dependency.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {dependency.text}
                                </span>
                                <span className="text-sm font-medium">
                                  {dependency.percent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                            <Progress
                              value={dependency.percent}
                              max={10}
                              className="h-2"
                            />
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Show message when no data is available yet */}
        {/* {!dashboardData && !isLoading && (
          <div className="flex justify-center items-center py-12 text-muted-foreground">
            <p>Please Authenticate with WakaTime to view your data</p>
          </div>
        )} */}
        {!dashboardData && !isLoading && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 opacity-50">
                  <CardTitle className="text-sm font-medium">
                    Total Coding Time
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center h-16">
                    <LockKeyhole className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 opacity-50">
                  <CardTitle className="text-sm font-medium">
                    Top Language
                  </CardTitle>
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center h-16">
                    <LockKeyhole className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 opacity-50">
                  <CardTitle className="text-sm font-medium">
                    Top Project
                  </CardTitle>
                  <FileCode className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center h-16">
                    <LockKeyhole className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 opacity-50">
                  <CardTitle className="text-sm font-medium">
                    Best Day
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-center h-16">
                    <LockKeyhole className="h-8 w-8 text-muted-foreground opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs
              defaultValue="overview"
              className="space-y-4 opacity-60"
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="overview" disabled>
                  Overview
                </TabsTrigger>
                <TabsTrigger value="languages" disabled>
                  Languages
                </TabsTrigger>
                <TabsTrigger value="projects" disabled>
                  Projects
                </TabsTrigger>
                <TabsTrigger value="dependencies" disabled>
                  Dependencies
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4 bg-muted/50">
                    <CardHeader className="opacity-50">
                      <CardTitle>Languages</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div className="grid gap-2" key={i}>
                            <div className="flex items-center justify-between">
                              <div className="h-4 w-24 bg-muted rounded"></div>
                              <div className="h-4 w-16 bg-muted rounded"></div>
                            </div>
                            <Progress value={0} className="h-2 bg-muted" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3 bg-muted/50">
                    <CardHeader className="opacity-50">
                      <CardTitle>Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => (
                          <div className="grid gap-2" key={i}>
                            <div className="flex items-center justify-between">
                              <div className="h-4 w-32 bg-muted rounded"></div>
                              <div className="h-4 w-16 bg-muted rounded"></div>
                            </div>
                            <Progress value={0} className="h-2 bg-muted" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card className="col-span-2 bg-muted/50">
                    <CardHeader className="opacity-50">
                      <CardTitle>Top Dependencies</CardTitle>
                      <CardDescription>
                        {"Libraries and frameworks you've used the most"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div className="grid gap-2" key={i}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-muted-foreground" />
                                <div className="h-4 w-24 bg-muted rounded"></div>
                              </div>
                              <div className="h-4 w-16 bg-muted rounded"></div>
                            </div>
                            <Progress value={0} className="h-2 bg-muted" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-muted/50">
                    <CardHeader className="opacity-50">
                      <CardTitle>System Info</CardTitle>
                      <CardDescription>
                        Your development environment
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Laptop className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Operating System</span>
                          <div className="ml-auto h-4 w-16 bg-muted rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Editor</span>
                          <div className="ml-auto h-4 w-16 bg-muted rounded"></div>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Categories</span>
                          <div className="ml-auto h-4 w-16 bg-muted rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}

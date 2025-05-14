"use client";

import { useState } from "react";
import {
  BarChart,
  Calendar,
  Clock,
  Code2,
  Cpu,
  FileCode,
  Laptop,
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
import type { DashboardData } from "@/lib/dashboard-types";

interface DashboardProps {
  data: DashboardData;
}

export default function Dashboard({ data }: DashboardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="flex w-full flex-col bg-muted/40">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Coding Dashboard
          </h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {new Date(data.start).toLocaleDateString()} -{" "}
              {new Date(data.end).toLocaleDateString()}
            </span>
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
                    {data.human_readable_total}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily average:{" "}
                    {data.human_readable_daily_average_including_other_language}
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
                    {data.languages[0]?.name || "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.languages[0]?.text} (
                    {data.languages[0]?.percent.toFixed(1)}%)
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
                    {data.projects[0]?.name || "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.projects[0]?.text} (
                    {data.projects[0]?.percent.toFixed(1)}%)
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
                    {new Date(data.best_day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {data.best_day.text}
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
                    {data.languages.slice(0, 5).map((language) => (
                      <div className="grid gap-2" key={language.name}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{language.name}</span>
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

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.projects.map((project) => (
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
                    {"Libraries and frameworks you've used the most"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.dependencies.slice(0, 5).map((dependency) => (
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
                          max={15}
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
                        {data.operating_systems[0]?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Editor</span>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {data.editors[0]?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Categories</span>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {data.categories[0]?.name}
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
                  {data.languages.map((language) => (
                    <div className="grid gap-2" key={language.name}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Code2 className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{language.name}</span>
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
                  {data.projects.map((project) => (
                    <div className="grid gap-2" key={project.name}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileCode className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{project.name}</span>
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
                  {data.dependencies.slice(0, 10).map((dependency) => (
                    <div className="grid gap-2" key={dependency.name}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{dependency.name}</span>
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
                        max={15}
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

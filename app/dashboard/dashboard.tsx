"use client";

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
import type {
  DashboardData,
  Editor,
  OperatingSystem,
  Category,
  Language,
  Project,
  Dependency,
} from "@/lib/dashboard-types";

interface DashboardProps {
  data: DashboardData;
}

export default function Dashboard({ data }: DashboardProps) {
  // Safety check to prevent errors
  if (!data || !data.data || !Array.isArray(data.data)) {
    console.error("Invalid data structure received:", data);
    return (
      <div className="flex w-full flex-col bg-muted/40">
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium mb-2">Data Loading Error</h3>
            <p className="text-muted-foreground">
              The dashboard data structure is invalid. Please try refreshing the
              page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Find the day with the most coding activity
  const mostActiveDay = data.data.reduce(
    (max, day) =>
      day.grand_total.total_seconds > max.grand_total.total_seconds ? day : max,
    data.data[0] || {
      grand_total: {
        total_seconds: 0,
        digital: "",
        decimal: "",
        hours: 0,
        minutes: 0,
        text: "",
      },
    }
  );

  // Aggregate languages across all days
  const aggregatedLanguages = data.data.reduce((acc, day) => {
    day.languages.forEach((lang) => {
      const existing = acc.find((l) => l.name === lang.name);
      if (existing) {
        existing.total_seconds += lang.total_seconds;
      } else {
        acc.push({ ...lang });
      }
    });
    return acc;
  }, [] as Language[]);

  // Calculate percentages for aggregated languages
  const totalLanguageSeconds = aggregatedLanguages.reduce(
    (sum, lang) => sum + lang.total_seconds,
    0
  );
  aggregatedLanguages.forEach((lang) => {
    lang.percent =
      totalLanguageSeconds > 0
        ? (lang.total_seconds / totalLanguageSeconds) * 100
        : 0;
  });

  // Sort languages by total seconds
  aggregatedLanguages.sort((a, b) => b.total_seconds - a.total_seconds);

  // Aggregate projects across all days
  const aggregatedProjects = data.data.reduce((acc, day) => {
    day.projects.forEach((project) => {
      const existing = acc.find((p) => p.name === project.name);
      if (existing) {
        existing.total_seconds += project.total_seconds;
      } else {
        acc.push({ ...project });
      }
    });
    return acc;
  }, [] as Project[]);

  // Calculate percentages for aggregated projects
  const totalProjectSeconds = aggregatedProjects.reduce(
    (sum, project) => sum + project.total_seconds,
    0
  );
  aggregatedProjects.forEach((project) => {
    project.percent =
      totalProjectSeconds > 0
        ? (project.total_seconds / totalProjectSeconds) * 100
        : 0;
  });

  // Sort projects by total seconds
  aggregatedProjects.sort((a, b) => b.total_seconds - a.total_seconds);

  // Aggregate dependencies across all days
  const aggregatedDependencies = data.data.reduce((acc, day) => {
    day.dependencies.forEach((dep) => {
      const existing = acc.find((d) => d.name === dep.name);
      if (existing) {
        existing.total_seconds += dep.total_seconds;
      } else {
        acc.push({ ...dep });
      }
    });
    return acc;
  }, [] as Dependency[]);

  // Calculate percentages for aggregated dependencies
  const totalDependencySeconds = aggregatedDependencies.reduce(
    (sum, dep) => sum + dep.total_seconds,
    0
  );
  aggregatedDependencies.forEach((dep) => {
    dep.percent =
      totalDependencySeconds > 0
        ? (dep.total_seconds / totalDependencySeconds) * 100
        : 0;
  });

  // Sort dependencies by total seconds
  aggregatedDependencies.sort((a, b) => b.total_seconds - a.total_seconds);

  const initialEditor: Editor = {
    name: "N/A",
    total_seconds: -1,
    percent: 0,
    text: "",
    hours: 0,
    minutes: 0,
    seconds: 0,
    digital: "",
    decimal: "",
  };
  const mostUsedEditor = data.data
    .flatMap((day) => day.editors)
    .reduce(
      (max, editor) =>
        editor.total_seconds > max.total_seconds ? editor : max,
      initialEditor
    );

  const initialOS: OperatingSystem = {
    name: "N/A",
    total_seconds: -1,
    percent: 0,
    text: "",
    hours: 0,
    minutes: 0,
    seconds: 0,
    digital: "",
    decimal: "",
  };
  const mostUsedOS = data.data
    .flatMap((day) => day.operating_systems)
    .reduce(
      (max, os) => (os.total_seconds > max.total_seconds ? os : max),
      initialOS
    );

  const initialCategory: Category = {
    name: "N/A",
    total_seconds: -1,
    percent: 0,
    text: "",
    hours: 0,
    minutes: 0,
    seconds: 0,
    digital: "",
    decimal: "",
  };
  const mostUsedCategory = data.data
    .flatMap((day) => day.categories)
    .reduce(
      (max, category) =>
        category.total_seconds > max.total_seconds ? category : max,
      initialCategory
    );

  return (
    <div className="flex w-full flex-col bg-muted/40">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              {new Date(data.start).toLocaleDateString()} -{" "}
              {new Date(data.end).toLocaleDateString()}
            </span>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
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
                    {data.cumulative_total.text}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Daily average:{" "}
                    {data.daily_average.text_including_other_language}
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
                    {aggregatedLanguages[0]?.name || "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {aggregatedLanguages[0]?.text} (
                    {aggregatedLanguages[0]?.percent.toFixed(1)}%)
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
                    {aggregatedProjects[0]?.name || "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {aggregatedProjects[0]?.text} (
                    {aggregatedProjects[0]?.percent.toFixed(1)}%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Active Day
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {mostActiveDay.range
                      ? new Date(mostActiveDay.range.date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          }
                        )
                      : "-"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {mostActiveDay.grand_total?.text || "-"}
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
                    {aggregatedLanguages.slice(0, 5).map((language) => (
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
                    {aggregatedProjects.slice(0, 5).map((project) => (
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
                    {aggregatedDependencies.slice(0, 5).map((dependency) => (
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
                          max={20}
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
                        {mostUsedOS.name !== "N/A" ? mostUsedOS.name : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Editor</span>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {mostUsedEditor.name !== "N/A"
                          ? mostUsedEditor.name
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Categories</span>
                      <span className="ml-auto text-sm text-muted-foreground">
                        {mostUsedCategory.name !== "N/A"
                          ? mostUsedCategory.name
                          : "-"}
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
                  {aggregatedLanguages.map((language) => (
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
                  {aggregatedProjects.map((project) => (
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
                  {aggregatedDependencies.slice(0, 10).map((dependency) => (
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
                        max={20}
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

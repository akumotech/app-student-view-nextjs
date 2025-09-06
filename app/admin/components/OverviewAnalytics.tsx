import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Award, Users, Play, TrendingUp, Target, UserCheck } from "lucide-react";
import type { OverviewStats } from "./types";

interface OverviewAnalyticsProps {
  stats: OverviewStats;
}

export default function OverviewAnalytics({ stats }: OverviewAnalyticsProps) {
  const certificateEngagementRate =
    stats.total_students > 0 ? (stats.students_with_certificates / stats.total_students) * 100 : 0;

  const demoEngagementRate =
    stats.total_students > 0 ? (stats.students_with_demos / stats.total_students) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students with Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students_with_certificates}</div>
            <p className="text-xs text-muted-foreground">
              {certificateEngagementRate.toFixed(1)}% of students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students with Demos</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students_with_demos}</div>
            <p className="text-xs text-muted-foreground">
              {demoEngagementRate.toFixed(1)}% of students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Certificates</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.avg_certificates_per_student.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">per student</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Demos</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg_demos_per_student.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">per student</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificate Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Students with Certificates</span>
                <span>
                  {stats.students_with_certificates} / {stats.total_students}
                </span>
              </div>
              <Progress value={certificateEngagementRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {certificateEngagementRate.toFixed(1)}% engagement rate
              </p>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Total Certificates:{" "}
                <span className="font-medium text-foreground">{stats.total_certificates}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Play className="h-5 w-5" />
              Demo Engagement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Students with Demos</span>
                <span>
                  {stats.students_with_demos} / {stats.total_students}
                </span>
              </div>
              <Progress value={demoEngagementRate} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {demoEngagementRate.toFixed(1)}% engagement rate
              </p>
            </div>
            <div className="pt-2 border-t">
              <div className="text-sm text-muted-foreground">
                Total Demos:{" "}
                <span className="font-medium text-foreground">{stats.total_demos}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

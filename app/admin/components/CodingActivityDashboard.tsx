import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code, Clock, Users, AlertCircle, TrendingUp } from "lucide-react";
import type { CodingActivityStats } from "./types";

interface CodingActivityDashboardProps {
  codingActivity: CodingActivityStats;
}

export default function CodingActivityDashboard({ codingActivity }: CodingActivityDashboardProps) {
  // Convert seconds to readable format
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours === 0) {
      return `${minutes}m`;
    }
    return `${hours}h ${minutes}m`;
  };

  // Get top languages by coding time
  const topLanguages = Object.entries(codingActivity.per_language)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Get top students by coding time
  const topStudents = Object.entries(codingActivity.per_student)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const totalStudents = Object.keys(codingActivity.per_student).length;
  const activeStudents = totalStudents - codingActivity.inactive_students.length;
  const activityRate = totalStudents > 0 ? (activeStudents / totalStudents) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Coding Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatTime(codingActivity.total_coding_seconds)}
            </div>
            <p className="text-xs text-muted-foreground">across all students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Students</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              {activityRate.toFixed(1)}% activity rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {codingActivity.inactive_students.length}
            </div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Languages Used</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.keys(codingActivity.per_language).length}
            </div>
            <p className="text-xs text-muted-foreground">different languages</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Languages */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5" />
              Top Programming Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topLanguages.length > 0 ? (
              <div className="space-y-4">
                {topLanguages.map(([language, seconds], index) => {
                  const percentage =
                    codingActivity.total_coding_seconds > 0
                      ? (seconds / codingActivity.total_coding_seconds) * 100
                      : 0;

                  return (
                    <div key={language} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                          <span className="font-medium capitalize">{language}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatTime(seconds)}</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% of total coding time
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No language data available</p>
            )}
          </CardContent>
        </Card>

        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Most Active Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStudents.length > 0 ? (
              <div className="space-y-3">
                {topStudents.map(([studentId, seconds], index) => {
                  const percentage =
                    codingActivity.total_coding_seconds > 0
                      ? (seconds / codingActivity.total_coding_seconds) * 100
                      : 0;

                  return (
                    <div
                      key={studentId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={index < 3 ? "default" : "outline"}
                          className={`text-xs ${
                            index === 0
                              ? "bg-yellow-500"
                              : index === 1
                                ? "bg-gray-400"
                                : index === 2
                                  ? "bg-amber-600"
                                  : ""
                          }`}
                        >
                          #{index + 1}
                        </Badge>
                        <span className="text-sm font-medium">Student {studentId}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatTime(seconds)}</div>
                        <div className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No student activity data available
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inactive Students Alert */}
      {codingActivity.inactive_students.length > 0 && (
        <Card className="border-orange-200/50 bg-gradient-to-br from-orange-50 to-orange-100/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold flex items-center gap-3 text-orange-800">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              Inactive Students Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="text-2xl font-bold text-orange-800">
                  {codingActivity.inactive_students.length}
                </span>
              </div>
              <div>
                <p className="text-base font-medium text-orange-800">
                  Students with no recent coding activity
                </p>
                <p className="text-sm text-orange-700/80">
                  These students may need additional support or follow-up
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-orange-800">Student IDs</h4>
                <span className="text-xs text-orange-600">
                  Showing {Math.min(10, codingActivity.inactive_students.length)} of{" "}
                  {codingActivity.inactive_students.length}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {codingActivity.inactive_students.slice(0, 10).map((studentId) => (
                  <Badge
                    key={studentId}
                    variant="outline"
                    className="text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100 transition-colors text-center justify-center"
                  >
                    #{studentId}
                  </Badge>
                ))}
                {codingActivity.inactive_students.length > 10 && (
                  <Badge
                    variant="outline"
                    className="text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100 transition-colors text-center justify-center col-span-2 sm:col-span-1"
                  >
                    +{codingActivity.inactive_students.length - 10} more
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Heatmap Summary */}
      {Object.keys(codingActivity.heatmap).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Activity Heatmap Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {Object.entries(codingActivity.heatmap)
                .slice(0, 7)
                .map(([date, dayData]) => (
                  <div key={date} className="text-center">
                    <div className="font-medium mb-1">
                      {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
                    </div>
                    <div className="space-y-1">
                      {Object.entries(dayData).map(([hour, activity]) => (
                        <div
                          key={`${date}-${hour}`}
                          className={`h-2 rounded ${activity > 0 ? "bg-green-400" : "bg-gray-200"}`}
                          title={`${hour}:00 - ${formatTime(activity)}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Green indicates coding activity during that hour
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

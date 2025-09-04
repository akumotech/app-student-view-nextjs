import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, Clock, TrendingDown, Activity } from "lucide-react";
import type { EngagementStats } from "./types";

interface EngagementMetricsProps {
  engagement: EngagementStats;
  totalStudents?: number;
}

export default function EngagementMetrics({
  engagement,
  totalStudents = 0,
}: EngagementMetricsProps) {
  const inactive7dRate =
    totalStudents > 0 ? (engagement.inactive_students_7d / totalStudents) * 100 : 0;
  const inactive30dRate =
    totalStudents > 0 ? (engagement.inactive_students_30d / totalStudents) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive (7 days)</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {engagement.inactive_students_7d}
            </div>
            <p className="text-xs text-muted-foreground">
              {inactive7dRate.toFixed(1)}% of students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive (30 days)</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {engagement.inactive_students_30d}
            </div>
            <p className="text-xs text-muted-foreground">
              {inactive30dRate.toFixed(1)}% of students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk Students</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {engagement.at_risk_students.length}
            </div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {engagement.active_streaks.length}
            </div>
            <p className="text-xs text-muted-foreground">students on streaks</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Engagement Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Attention Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Inactive Students Warning */}
              {engagement.inactive_students_7d > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium text-orange-800">7-Day Inactive</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    {engagement.inactive_students_7d} students haven't been active in the past week
                  </p>
                </div>
              )}

              {/* Long-term Inactive */}
              {engagement.inactive_students_30d > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-red-800">30-Day Inactive</span>
                  </div>
                  <p className="text-sm text-red-700">
                    {engagement.inactive_students_30d} students haven't been active in the past
                    month
                  </p>
                </div>
              )}

              {/* At Risk Students */}
              {engagement.at_risk_students.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-800">At Risk</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-2">
                    {engagement.at_risk_students.length} students identified as at risk
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {engagement.at_risk_students.slice(0, 5).map((studentId) => (
                      <Badge key={studentId} variant="outline" className="text-xs">
                        ID: {studentId}
                      </Badge>
                    ))}
                    {engagement.at_risk_students.length > 5 && (
                      <Badge variant="outline" className="text-xs">
                        +{engagement.at_risk_students.length - 5} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* No Issues */}
              {engagement.inactive_students_7d === 0 &&
                engagement.inactive_students_30d === 0 &&
                engagement.at_risk_students.length === 0 && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-800">All Good!</span>
                    </div>
                    <p className="text-sm text-green-700">
                      No immediate engagement concerns detected
                    </p>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Active Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {engagement.active_streaks.length > 0 ? (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Students maintaining active streaks
                  </p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {engagement.active_streaks.slice(0, 10).map((streak, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-green-50 rounded"
                      >
                        <span className="text-sm">
                          {streak.student_name || `Student ${streak.student_id || index + 1}`}
                        </span>
                        <Badge variant="outline" className="text-green-700">
                          {streak.streak_days || streak.days || "Active"} days
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {engagement.active_streaks.length > 10 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      +{engagement.active_streaks.length - 10} more students with active streaks
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active streaks recorded</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Flame, UserX } from "lucide-react";
import { getEngagement } from "../api/analytics";

export default function EngagementTab({ batchId }: { batchId?: string }) {
  const [engagement, setEngagement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getEngagement(batchId ? Number(batchId) : undefined)
      .then(setEngagement)
      .catch(() => setError("Failed to load engagement data."))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading engagement data...</div>
      </div>
    );
  if (error)
    return <div className="flex items-center justify-center p-8 text-destructive">{error}</div>;
  if (!engagement) return null;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{engagement.inactive_students_7d}</div>
          <p className="text-xs text-muted-foreground">7 days inactive</p>
          <div className="text-lg font-semibold mt-2">{engagement.inactive_students_30d}</div>
          <p className="text-xs text-muted-foreground">30 days inactive</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">At-Risk Students</CardTitle>
          <UserX className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{engagement.at_risk_students.length}</div>
          <p className="text-xs text-muted-foreground">
            {engagement.at_risk_students.length === 0
              ? "No students at risk"
              : "Students need attention"}
          </p>
          {engagement.at_risk_students.length > 0 && (
            <div className="mt-2 space-y-1">
              {engagement.at_risk_students.slice(0, 3).map((id: number) => (
                <div key={id} className="text-xs text-muted-foreground">
                  Student #{id}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
          <Flame className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{engagement.active_streaks.length}</div>
          <p className="text-xs text-muted-foreground">
            {engagement.active_streaks.length === 0 ? "No active streaks" : "Students on streak"}
          </p>
          {engagement.active_streaks.length > 0 && (
            <div className="mt-2 space-y-1">
              {engagement.active_streaks.slice(0, 3).map((s: any) => (
                <div key={s.student_id} className="text-xs text-muted-foreground">
                  Student #{s.student_id}: {s.days} days
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

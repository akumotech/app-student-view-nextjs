"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Video, Users, BarChart3, TrendingUp } from "lucide-react";
import { getOverviewStats } from "../api/analytics";

const kpiCards = [
  {
    label: "Total Students",
    icon: <Users className="h-4 w-4 text-muted-foreground" />,
    key: "total_students",
  },
  {
    label: "Total Certificates",
    icon: <Award className="h-4 w-4 text-muted-foreground" />,
    key: "total_certificates",
  },
  {
    label: "Total Demos",
    icon: <Video className="h-4 w-4 text-muted-foreground" />,
    key: "total_demos",
  },
  {
    label: "Students w/ Certificates",
    icon: <Award className="h-4 w-4 text-muted-foreground" />,
    key: "students_with_certificates",
  },
  {
    label: "Students w/ Demos",
    icon: <Video className="h-4 w-4 text-muted-foreground" />,
    key: "students_with_demos",
  },
  {
    label: "Avg Certificates/Student",
    icon: <BarChart3 className="h-4 w-4 text-muted-foreground" />,
    key: "avg_certificates_per_student",
    format: (v: number) => v.toFixed(2),
  },
  {
    label: "Avg Demos/Student",
    icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    key: "avg_demos_per_student",
    format: (v: number) => v.toFixed(2),
  },
];

export default function OverviewTab({ batchId }: { batchId?: string }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("OverviewTab - Fetching data for batchId:", batchId);
    setLoading(true);
    setError(null);
    getOverviewStats(batchId ? Number(batchId) : undefined)
      .then((data) => {
        console.log("OverviewTab - Received data:", data);
        setStats(data);
      })
      .catch((err) => {
        console.error("OverviewTab - Error:", err);
        setError("Failed to load overview stats.");
      })
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading overview...</div>
      </div>
    );
  if (error)
    return <div className="flex items-center justify-center p-8 text-destructive">{error}</div>;
  if (!stats) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ label, icon, key, format }) => (
          <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              {icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {format ? format(stats[key]) : (stats[key] ?? "-")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

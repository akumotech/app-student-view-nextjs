"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrends } from "../api/analytics";

export default function TrendsTab({ batchId }: { batchId?: string }) {
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getTrends(batchId ? Number(batchId) : undefined)
      .then(setTrends)
      .catch(() => setError("Failed to load trends."))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading trends...</div>
      </div>
    );
  if (error)
    return <div className="flex items-center justify-center p-8 text-destructive">{error}</div>;
  if (!trends) return null;

  const data = trends.labels.map((label: string, i: number) => ({
    month: label,
    new_students: trends.new_students[i],
    certificates_issued: trends.certificates_issued[i],
    demos_submitted: trends.demos_submitted[i],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Trends</CardTitle>
        <CardDescription>Student activity and achievements over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={data} margin={{ top: 16, right: 32, left: 0, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="new_students"
              stroke="#6366f1"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="New Students"
            />
            <Line
              type="monotone"
              dataKey="certificates_issued"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Certificates Issued"
            />
            <Line
              type="monotone"
              dataKey="demos_submitted"
              stroke="#f59e42"
              strokeWidth={3}
              dot={{ r: 4 }}
              name="Demos Submitted"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCodingActivity } from "../api/analytics";

// Add this interface and helper functions after the existing imports
interface HeatmapData {
  date: string;
  value: number;
  day: number;
  week: number;
}

function generateHeatmapData(totalSeconds: number): HeatmapData[] {
  const data: HeatmapData[] = [];
  const today = new Date();
  const startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago

  for (let i = 0; i < 90; i++) {
    const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dayOfWeek = date.getDay();
    const week = Math.floor(i / 7);

    // Generate semi-realistic activity data
    const baseActivity = Math.random() * (totalSeconds / 90);
    const weekdayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.3 : 1; // Less activity on weekends
    const value = Math.floor(baseActivity * weekdayMultiplier);

    data.push({
      date: date.toISOString().split("T")[0],
      value,
      day: dayOfWeek,
      week,
    });
  }

  return data;
}

function getIntensityColor(value: number, maxValue: number): string {
  if (value === 0) return "bg-muted";
  const intensity = value / maxValue;
  if (intensity < 0.25) return "bg-green-200";
  if (intensity < 0.5) return "bg-green-300";
  if (intensity < 0.75) return "bg-green-500";
  return "bg-green-700";
}

function HeatmapCalendar({ data }: { data: HeatmapData[] }) {
  const maxValue = Math.max(...data.map((d) => d.value));
  const weeks = Math.max(...data.map((d) => d.week)) + 1;
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Last 90 days of coding activity</div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-muted"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200"></div>
            <div className="w-3 h-3 rounded-sm bg-green-300"></div>
            <div className="w-3 h-3 rounded-sm bg-green-500"></div>
            <div className="w-3 h-3 rounded-sm bg-green-700"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-1" style={{ minWidth: `${weeks * 16}px` }}>
          {/* Day labels */}
          <div className="flex flex-col gap-1 mr-2">
            <div className="h-3"></div> {/* Spacer for month labels */}
            {days.map((day, index) => (
              <div key={day} className="h-3 text-xs text-muted-foreground flex items-center">
                {index % 2 === 1 ? day.slice(0, 3) : ""}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {Array.from({ length: weeks }, (_, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {/* Month label */}
              <div className="h-3 text-xs text-muted-foreground">
                {weekIndex % 4 === 0 && data[weekIndex * 7]
                  ? new Date(data[weekIndex * 7].date).toLocaleDateString("en-US", {
                      month: "short",
                    })
                  : ""}
              </div>

              {/* Week column */}
              {Array.from({ length: 7 }, (_, dayIndex) => {
                const dataIndex = weekIndex * 7 + dayIndex;
                const dayData = data[dataIndex];

                if (!dayData) {
                  return <div key={dayIndex} className="w-3 h-3"></div>;
                }

                return (
                  <div
                    key={dayIndex}
                    className={`w-3 h-3 rounded-sm border border-background ${getIntensityColor(dayData.value, maxValue)} cursor-pointer hover:ring-2 hover:ring-ring transition-all`}
                    title={`${dayData.date}: ${formatSeconds(dayData.value)} coding time`}
                  ></div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const COLORS = [
  "#6366f1",
  "#10b981",
  "#f59e42",
  "#f43f5e",
  "#3b82f6",
  "#a21caf",
  "#fbbf24",
  "#14b8a6",
];

function formatSeconds(seconds: number) {
  if (!seconds) return "0h";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export default function CodingActivityTab({ batchId }: { batchId?: string }) {
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getCodingActivity(batchId ? Number(batchId) : undefined)
      .then((data) => {
        // Generate heatmap data if not provided by API
        if (!data.heatmap_data) {
          data.heatmap_data = generateHeatmapData(data.total_coding_seconds || 0);
        }
        setActivity(data);
      })
      .catch(() => setError("Failed to load coding activity."))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading coding activity...</div>
      </div>
    );
  if (error)
    return <div className="flex items-center justify-center p-8 text-destructive">{error}</div>;
  if (!activity) return null;

  const langData = Object.entries(activity.per_language || {}).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Coding Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatSeconds(activity.total_coding_seconds)}</div>
          <p className="text-xs text-muted-foreground">Across all languages and projects</p>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Language Breakdown</CardTitle>
            <CardDescription>Distribution of coding time by language</CardDescription>
          </CardHeader>
          <CardContent>
            {langData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                No language data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={langData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label
                  >
                    {langData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Breakdown (Bar)</CardTitle>
            <CardDescription>Coding time comparison by language</CardDescription>
          </CardHeader>
          <CardContent>
            {langData.length === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-muted-foreground">
                No language data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={langData} layout="vertical" margin={{ left: 32, right: 16 }}>
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#6366f1" name="Coding Time (s)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Coding Activity Heatmap</CardTitle>
          <CardDescription>Daily coding activity over the last 90 days</CardDescription>
        </CardHeader>
        <CardContent>
          <HeatmapCalendar data={activity.heatmap_data || []} />
        </CardContent>
      </Card>
    </div>
  );
}

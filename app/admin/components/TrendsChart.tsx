import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Users, Award, Play } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { TrendsStats } from "./types";

interface TrendsChartProps {
  trends: TrendsStats;
}

export default function TrendsChart({ trends }: TrendsChartProps) {
  if (!trends.labels || trends.labels.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Trends Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No trend data available</p>
        </CardContent>
      </Card>
    );
  }

  const maxValues = {
    students: Math.max(...trends.new_students),
    certificates: Math.max(...trends.certificates_issued),
    demos: Math.max(...trends.demos_submitted),
  };

  const totalMaxValue = Math.max(maxValues.students, maxValues.certificates, maxValues.demos);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Activity Trends
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-700">
                {trends.new_students.reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-blue-600">New Students</div>
            </div>

            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Award className="h-6 w-6 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-700">
                {trends.certificates_issued.reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-green-600">Certificates Issued</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Play className="h-6 w-6 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-700">
                {trends.demos_submitted.reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-purple-600">Demos Submitted</div>
            </div>
          </div>

          {/* Area Chart */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground border-b border-border/50 pb-2">
              Timeline View
            </h4>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trends.labels.map((label, index) => ({
                    period: label,
                    students: trends.new_students[index],
                    certificates: trends.certificates_issued[index],
                    demos: trends.demos_submitted[index],
                  }))}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorCertificates" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorDemos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="period"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={{ stroke: "#e5e7eb" }}
                    tickLine={{ stroke: "#e5e7eb" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                    labelStyle={{ fontWeight: "600", color: "#374151" }}
                  />
                  <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="url(#colorStudents)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="certificates"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#colorCertificates)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="demos"
                    stackId="1"
                    stroke="#8b5cf6"
                    fill="url(#colorDemos)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

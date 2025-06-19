"use client";
import type { DashboardData } from "@/lib/dashboard-types";

export default function DashboardStats({ data }: { data: DashboardData }) {
  return (
    <div>
      {/* TODO: Render dashboard stats, charts, etc. */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

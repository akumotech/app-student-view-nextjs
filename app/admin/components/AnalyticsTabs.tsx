"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CodingActivityTab from "./CodingActivityTab";
import OverviewTab from "./OverviewTab";
import TrendsTab from "./TrendsTab";
import EngagementTab from "./EngagementTab";
import type { BatchRead } from "./types";

interface AnalyticsTabsProps {
  batches: BatchRead[];
}

export default function AnalyticsTabs({ batches }: AnalyticsTabsProps) {
  const [batchId, setBatchId] = useState<string>("");

  const batchOptions = [
    { label: "All Batches", value: "" },
    ...batches.map((batch) => ({
      label: batch.name,
      value: String(batch.id),
    })),
  ];

  return (
    <div className="container mx-auto p-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Visual insights into student and project activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-w-[180px]"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            aria-label="Select batch"
          >
            {batchOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="coding">Coding Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <OverviewTab batchId={batchId} />
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <TrendsTab batchId={batchId} />
        </TabsContent>
        <TabsContent value="engagement" className="space-y-4">
          <EngagementTab batchId={batchId} />
        </TabsContent>
        <TabsContent value="coding" className="space-y-4">
          <CodingActivityTab batchId={batchId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

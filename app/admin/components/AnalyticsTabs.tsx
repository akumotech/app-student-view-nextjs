"use client";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import CodingActivityTab from "./CodingActivityTab";
import OverviewTab from "./OverviewTab";
import TrendsTab from "./TrendsTab";
import EngagementTab from "./EngagementTab";

const batchOptions = [
  { label: "All Batches", value: "" },
  // TODO: Dynamically load batch options from API if needed
];

export default function AnalyticsTabs() {
  const [batchId, setBatchId] = useState<string>("");

  return (
    <div className="flex w-full flex-col bg-muted/40">
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
            <p className="text-muted-foreground">
              Visual insights into student and project activity
            </p>
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
    </div>
  );
}

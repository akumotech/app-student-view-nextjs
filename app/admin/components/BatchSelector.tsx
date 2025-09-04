import { Card, CardContent } from "@/components/ui/card";
import { Filter } from "lucide-react";
import type { BatchRead } from "./types";

interface BatchSelectorProps {
  batches: BatchRead[];
  selectedBatchId: number | null;
  onBatchChange: (batchId: number | null) => void;
  className?: string;
}

export default function BatchSelector({
  batches,
  selectedBatchId,
  onBatchChange,
  className = "",
}: BatchSelectorProps) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="h-4 w-4" />
        <span>Filter:</span>
      </div>
      <select
        className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-w-[160px]"
        value={selectedBatchId ? selectedBatchId.toString() : "all"}
        onChange={(e) => {
          const value = e.target.value;
          onBatchChange(value === "all" ? null : parseInt(value, 10));
        }}
      >
        <option value="all">All Batches</option>
        {batches.map((batch) => (
          <option key={batch.id} value={batch.id.toString()}>
            {batch.name}
            {batch.registration_key_active ? "" : " (Inactive)"}
          </option>
        ))}
      </select>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import type { BatchRead } from "../../components/types";
import { makeUrl } from "@/lib/utils";

interface BatchEditDialogProps {
  batch: BatchRead | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedBatch: BatchRead) => void;
}

export default function BatchEditDialog({ batch, isOpen, onClose, onSave }: BatchEditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    slack_channel: "",
    curriculum: "",
    registration_key_active: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Update form data when batch changes
  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name || "",
        start_date: batch.start_date ? new Date(batch.start_date).toISOString().split("T")[0] : "",
        end_date: batch.end_date ? new Date(batch.end_date).toISOString().split("T")[0] : "",
        slack_channel: batch.slack_channel || "",
        curriculum: batch.curriculum || "",
        registration_key_active: batch.registration_key_active,
      });
    }
  }, [batch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;

    setIsLoading(true);
    try {
      const response = await fetch(makeUrl("batchById", { batch_id: batch.id }), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date,
          slack_channel: formData.slack_channel,
          curriculum: formData.curriculum || null,
          registration_key_active: formData.registration_key_active,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update batch");
      }

      const updatedBatch = await response.json();
      onSave(updatedBatch);
      toast.success("Batch updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating batch:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update batch");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (!batch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            Edit Batch: {batch.name}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Batch Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter batch name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slack_channel" className="text-sm font-medium">
                Slack Channel *
              </Label>
              <Input
                id="slack_channel"
                value={formData.slack_channel}
                onChange={(e) => handleInputChange("slack_channel", e.target.value)}
                placeholder="Enter Slack channel"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-sm font-medium">
                Start Date *
              </Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => handleInputChange("start_date", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-sm font-medium">
                End Date *
              </Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => handleInputChange("end_date", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="curriculum" className="text-sm font-medium">
              Curriculum
            </Label>
            <Textarea
              id="curriculum"
              value={formData.curriculum}
              onChange={(e) => handleInputChange("curriculum", e.target.value)}
              placeholder="Enter curriculum details (optional)"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="registration_key_active"
              checked={formData.registration_key_active}
              onCheckedChange={(checked) => handleInputChange("registration_key_active", checked)}
            />
            <Label htmlFor="registration_key_active" className="text-sm font-medium">
              Registration Key Active
            </Label>
          </div>

          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

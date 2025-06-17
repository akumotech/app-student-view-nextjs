import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserOverview, BatchRead } from "./types";

interface UserEditDialogProps {
  user: UserOverview | null;
  batches: BatchRead[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: {
    name: string;
    email: string;
    role: string;
    batchId: number | null;
    disabled: boolean;
  }) => void;
}

export default function UserEditDialog({
  user,
  batches,
  open,
  onOpenChange,
  onSave,
}: UserEditDialogProps) {
  const [batchId, setBatchId] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      setBatchId(user.student_detail?.batch?.id ?? null);
    }
  }, [user, open]);

  const handleSave = () => {
    onSave({
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "",
      batchId,
      disabled: !!user?.disabled,
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student Batch</DialogTitle>
          <DialogDescription>
            Only the batch assignment can be updated here. Other fields are
            read-only.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input value={user.name} readOnly disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={user.email} readOnly disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <Input value={user.role} readOnly disabled />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Batch</label>
            <select
              value={batchId ?? ""}
              onChange={(e) =>
                setBatchId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">None</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

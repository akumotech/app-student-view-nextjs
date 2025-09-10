"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Certificate,
  CertificateCreate,
  CertificateUpdate,
} from "../../api/fetchCertificates";
import type { UserOverview } from "../../components/types";

interface CertificateEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CertificateCreate | CertificateUpdate, studentId: number) => void;
  users: UserOverview[];
  title: string;
  initialData?: Certificate;
}

export default function CertificateEditDialog({
  isOpen,
  onClose,
  onSubmit,
  users,
  title,
  initialData,
}: CertificateEditDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    date_issued: "",
    date_expired: "",
    description: "",
  });
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        issuer: initialData.issuer || "",
        date_issued: initialData.date_issued || "",
        date_expired: initialData.date_expired || "",
        description: initialData.description || "",
      });
      setSelectedStudentId(initialData.student_id);
    } else {
      setFormData({
        name: "",
        issuer: "",
        date_issued: "",
        date_expired: "",
        description: "",
      });
      setSelectedStudentId(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudentId) {
      alert("Please select a student");
      return;
    }

    if (!formData.name.trim()) {
      alert("Certificate name is required");
      return;
    }

    setIsLoading(true);
    try {
      const submitData = {
        name: formData.name.trim(),
        issuer: formData.issuer.trim() || undefined,
        date_issued: formData.date_issued || undefined,
        date_expired: formData.date_expired || undefined,
        description: formData.description.trim() || undefined,
      };

      await onSubmit(submitData, selectedStudentId);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Certificate Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., Python Fundamentals"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={(e) => handleInputChange("issuer", e.target.value)}
                placeholder="e.g., Akumo Technology"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student">Student *</Label>
            <Select
              value={selectedStudentId?.toString() || ""}
              onValueChange={(value) => setSelectedStudentId(Number(value))}
              disabled={!!initialData} // Disable for edit mode
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_issued">Date Issued</Label>
              <Input
                id="date_issued"
                type="date"
                value={formData.date_issued}
                onChange={(e) => handleInputChange("date_issued", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_expired">Date Expired</Label>
              <Input
                id="date_expired"
                type="date"
                value={formData.date_expired}
                onChange={(e) => handleInputChange("date_expired", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Additional details about the certificate..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

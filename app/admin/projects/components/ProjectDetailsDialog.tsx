"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Clock,
  Users,
  MessageSquare,
  Edit,
  Trash2,
  GraduationCap,
  UserCog,
} from "lucide-react";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { ProjectRead } from "../../components/types";

interface ProjectDetailsDialogProps {
  project: ProjectRead | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (project: ProjectRead) => void;
  onDelete: (projectId: number) => void;
}

export default function ProjectDetailsDialog({
  project,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: ProjectDetailsDialogProps) {
  const router = useRouter();
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [projectDetails, setProjectDetails] = useState<any>(null);

  useEffect(() => {
    if (project && isOpen) {
      fetchProjectDetails();
    }
  }, [project, isOpen]);

  const fetchProjectDetails = async () => {
    if (!project) return;

    setIsLoadingDetails(true);
    try {
      const response = await fetch(makeUrl("adminProjectById", { project_id: project.id }), {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setProjectDetails(result.data);
        }
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = () => {
    if (!project) return;

    if (
      confirm(
        `Are you sure you want to delete the project "${project.name}"? This action cannot be undone.`,
      )
    ) {
      onDelete(project.id);
      onClose();
    }
  };

  if (!project) return null;

  const details = projectDetails || project;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{project.name}</span>
            <Badge className={getStatusBadgeColor(project.status)}>{project.status}</Badge>
          </DialogTitle>
          <DialogDescription>
            Detailed information about the project and its progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Project Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GraduationCap className="h-4 w-4" />
                  Batch
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.batch?.name || `Batch ${project.batch_id}`}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDate(project.start_date)} - {formatDate(project.end_date)}
                </p>
              </div>
            </div>

            {project.description && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageSquare className="h-4 w-4" />
                  Description
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
            )}

            {project.happy_hour && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Happy Hour
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(project.happy_hour)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Statistics */}
          {details.statistics && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Statistics</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {details.statistics.total_students}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Students</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {details.statistics.active_students}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Students</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {details.statistics.total_interviews}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Interviews</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {details.statistics.completed_interviews}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </div>
          )}

          {!isLoadingDetails && !details.statistics && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Project Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {project.student_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Students</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {project.interview_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Interviews</div>
                </div>
              </div>
            </div>
          )}

          {isLoadingDetails && (
            <div className="text-center py-4">
              <p className="text-muted-foreground">Loading project details...</p>
            </div>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Timeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{formatDateTime(project.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="ml-2">{formatDateTime(project.updated_at)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Project
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                router.push(`/admin/projects/${project.id}/students`);
              }}
            >
              <UserCog className="h-4 w-4 mr-2" />
              Manage Students
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button onClick={() => onEdit(project)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

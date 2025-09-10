import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar,
  Clock,
  FileText,
  Linkedin,
  ExternalLink,
  User,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { MyProjectData } from "../api/fetchMyProject";

interface MyProjectCardProps {
  projectData: MyProjectData;
}

export default function MyProjectCard({ projectData }: MyProjectCardProps) {
  const { project, student_project } = projectData;

  // Edit state
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    resume_url: student_project?.resume_url ?? "",
    linkedin_url: student_project?.linkedin_url ?? "",
    offer_date: student_project?.offer_date ?? "",
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "assigned":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
      case "dropped":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "planning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to update student project data
      toast.success("Project details updated successfully");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating project details:", error);
      toast.error("Failed to update project details");
    }
  };

  const handleCancel = () => {
    setEditData({
      resume_url: student_project?.resume_url ?? "",
      linkedin_url: student_project?.linkedin_url ?? "",
      offer_date: student_project?.offer_date ?? "",
    });
    setIsEditing(false);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/30 border-b">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold">{project.name}</CardTitle>
              <CardDescription className="text-base">
                {project.batch_name} •{" "}
                {student_project?.assigned_at
                  ? `Assigned ${formatDate(student_project.assigned_at)}`
                  : "Not assigned"}
              </CardDescription>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-3 max-w-2xl">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          {/* Status Section */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Project Status:</span>
              <Badge className={getStatusBadgeColor(project.status)} variant="secondary">
                {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Your Status:</span>
              <Badge className={getStatusBadgeColor(student_project?.status ?? "unknown")}>
                {student_project?.status
                  ? student_project.status.charAt(0).toUpperCase() + student_project.status.slice(1)
                  : "Unknown"}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Project Timeline */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Project Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(project.start_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">{formatDate(project.end_date)}</p>
                  </div>
                </div>
                {project.happy_hour && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">Happy Hour</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(project.happy_hour)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Personal Details */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Details
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2"
              >
                {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditing ? "Cancel" : "Edit"}
              </Button>
            </div>

            <div className="space-y-4">
              {/* Resume URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resume URL
                </Label>
                {isEditing ? (
                  <Input
                    type="url"
                    placeholder="https://example.com/resume.pdf"
                    value={editData.resume_url}
                    onChange={(e) => setEditData({ ...editData, resume_url: e.target.value })}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    {student_project?.resume_url ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600 hover:text-blue-800"
                        onClick={() => window.open(student_project.resume_url, "_blank")}
                      >
                        View Resume
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">No resume uploaded</p>
                    )}
                  </div>
                )}
              </div>

              {/* LinkedIn URL */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn Profile
                </Label>
                {isEditing ? (
                  <Input
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={editData.linkedin_url}
                    onChange={(e) => setEditData({ ...editData, linkedin_url: e.target.value })}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    {student_project?.linkedin_url ? (
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600 hover:text-blue-800"
                        onClick={() => window.open(student_project.linkedin_url, "_blank")}
                      >
                        View LinkedIn
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground">No LinkedIn profile added</p>
                    )}
                  </div>
                )}
              </div>

              {/* Offer Date */}
              <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Offer Date
                </Label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={editData.offer_date}
                    onChange={(e) => setEditData({ ...editData, offer_date: e.target.value })}
                  />
                ) : (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    {student_project?.offer_date ? (
                      <p className="text-sm">{formatDate(student_project.offer_date)}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">No offer date set</p>
                    )}
                  </div>
                )}
              </div>

              {/* Save/Cancel buttons */}
              {isEditing && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} size="sm" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Save Changes
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

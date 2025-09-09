import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, FileText, Linkedin, ExternalLink, User } from "lucide-react";
import type { MyProjectData } from "../api/fetchMyProject";

interface MyProjectCardProps {
  projectData: MyProjectData;
}

export default function MyProjectCard({ projectData }: MyProjectCardProps) {
  const { project, assignment } = projectData;

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

  return (
    <div className="space-y-6">
      {/* Project Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{project.name}</CardTitle>
              <CardDescription className="mt-2">
                Project ID: {project.name} • Batch: {project.batch_id}
              </CardDescription>
            </div>
            <Badge className={getStatusBadgeColor(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.description && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">Description</h4>
              <p className="text-sm">{project.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Start Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(project.start_date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">End Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(project.end_date)}</p>
              </div>
            </div>
          </div>

          {project.happy_hour && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Happy Hour</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(project.happy_hour)}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignment Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Project Details
          </CardTitle>
          <CardDescription>Your project details and status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Project Status</p>
              <Badge className={getStatusBadgeColor(assignment.status)}>
                {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Project Start Date</p>
              <p className="text-sm text-muted-foreground">{formatDate(assignment.assigned_at)}</p>
            </div>
          </div>

          {assignment.offer_date && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Offer Date</p>
                <p className="text-sm text-muted-foreground">{formatDate(project.end_date)}</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {assignment.resume_url && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Resume</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                    onClick={() => window.open(assignment.resume_url, "_blank")}
                  >
                    View Resume
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {assignment.linkedin_url && (
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">LinkedIn Profile</p>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-blue-600 hover:text-blue-800"
                    onClick={() => window.open(assignment.linkedin_url, "_blank")}
                  >
                    View LinkedIn
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

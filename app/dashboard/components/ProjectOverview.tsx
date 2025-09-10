"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  ExternalLink,
  FileText,
  GraduationCap,
  MapPin,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";

interface ProjectData {
  project: {
    id: number;
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    happy_hour?: string;
    status: string;
    batch?: {
      id: number;
      name: string;
    };
  };
  assignment: {
    id: number;
    resume_url?: string;
    linkedin_url?: string;
    offer_date?: string;
    status: string;
    assigned_at: string;
  };
}

export default function ProjectOverview() {
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const response = await fetch(makeUrl("studentsMyProject"), {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setProjectData(data.data);
          } else {
            setProjectData(null);
          }
        } else {
          if (response.status !== 404) {
            setError("Failed to load project information");
          }
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
        setError("Failed to load project information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectData();
  }, []);

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "dropped":
        return "bg-red-100 text-red-800";
      case "planning":
        return "bg-yellow-100 text-yellow-800";
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

  if (isLoading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            My Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground">Loading project information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            My Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!projectData) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            My Project
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium">No Active Project</h3>
              <p className="text-muted-foreground max-w-sm">
                You haven't been assigned to a project yet. Your instructor will assign you to a
                project soon.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { project, assignment } = projectData;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          My Project
        </CardTitle>
        <CardDescription>Your current project assignment and progress</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{project.name}</h3>
              {project.description && (
                <p className="text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
            <Badge className={getStatusBadgeColor(assignment.status)}>{assignment.status}</Badge>
          </div>

          {project.batch && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Batch: {project.batch.name}</span>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" />
              Project Timeline
            </div>
            <div className="text-sm text-muted-foreground">
              <div>Start: {formatDate(project.start_date)}</div>
              <div>End: {formatDate(project.end_date)}</div>
            </div>
          </div>

          {project.happy_hour && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Clock className="h-4 w-4" />
                Happy Hour
              </div>
              <div className="text-sm text-muted-foreground">
                {formatDateTime(project.happy_hour)}
              </div>
            </div>
          )}
        </div>

        {/* Assignment Details */}
        <div className="space-y-3">
          <h4 className="font-medium">Assignment Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Assigned:</span>
              <div>{formatDate(assignment.assigned_at)}</div>
            </div>
            {assignment.offer_date && (
              <div className="text-sm">
                <span className="text-muted-foreground">Offer Date:</span>
                <div>{formatDate(assignment.offer_date)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Action Links */}
        {(assignment.resume_url || assignment.linkedin_url) && (
          <div className="space-y-3">
            <h4 className="font-medium">Resources</h4>
            <div className="flex flex-wrap gap-2">
              {assignment.resume_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(assignment.resume_url, "_blank")}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  View Resume
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
              {assignment.linkedin_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(assignment.linkedin_url, "_blank")}
                  className="flex items-center gap-2"
                >
                  <MapPin className="h-4 w-4" />
                  LinkedIn Profile
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

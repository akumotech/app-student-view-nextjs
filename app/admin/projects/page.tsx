"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Users, Calendar, Eye } from "lucide-react";
import { makeUrl } from "@/lib/utils";
import type { ProjectRead, BatchRead } from "../components/types";
import ProjectCreateDialog from "./components/ProjectCreateDialog";
import ProjectEditDialog from "./components/ProjectEditDialog";
import ProjectDetailsDialog from "./components/ProjectDetailsDialog";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [batches, setBatches] = useState<BatchRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectRead | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [batchFilter, setBatchFilter] = useState("all");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }
    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      toast.error("You are not authorized to view this page.");
      router.replace("/dashboard?error=unauthorized_admin_page");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [projectsResponse, batchesResponse] = await Promise.all([
        fetch(makeUrl("adminProjectsList"), { credentials: "include" }),
        fetch(makeUrl("adminBatches"), { credentials: "include" }),
      ]);

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData.data?.projects || projectsData.data || []);
      } else {
        toast.error("Failed to load projects");
      }

      if (batchesResponse.ok) {
        const batchesData = await batchesResponse.json();
        setBatches(batchesData.data || batchesData || []);
      } else {
        toast.error("Failed to load batches");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchData();
    }
  }, [isAuthenticated, user]);

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

  const getBatchName = (batchId: number) => {
    const batch = batches.find((b) => b.id === batchId);
    return batch?.name || `Batch ${batchId}`;
  };

  const handleViewProject = (project: ProjectRead) => {
    setSelectedProject(project);
    setIsDetailsDialogOpen(true);
  };

  const handleEditProject = (project: ProjectRead) => {
    setEditingProject(project);
    setIsEditDialogOpen(true);
  };

  const handleCreateProject = () => {
    setIsCreateDialogOpen(true);
  };

  const handleProjectCreated = (newProject: ProjectRead) => {
    setProjects((prev) => [newProject, ...prev]);
    setIsCreateDialogOpen(false);
    // Optionally refresh to get updated counts
    setTimeout(() => fetchData(), 1000);
  };

  const handleProjectUpdated = (updatedProject: ProjectRead) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
    setEditingProject(null);
    setIsEditDialogOpen(false);
  };

  const handleProjectDeleted = async (projectId: number) => {
    try {
      const response = await fetch(makeUrl("adminProjectById", { project_id: projectId }), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
        toast.success("Project deleted successfully");
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    }
  };

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    const matchesBatch = batchFilter === "all" || project.batch_id.toString() === batchFilter;
    return matchesSearch && matchesStatus && matchesBatch;
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Project Management</h1>
          <p className="text-lg text-muted-foreground">
            Manage projects, student assignments, and interviews
          </p>
        </div>
        <Button
          onClick={handleCreateProject}
          className="flex items-center space-x-2 shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Plus className="h-4 w-4" />
          <span>Create Project</span>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Statuses</option>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setBatchFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-foreground">
            Projects ({filteredProjects.length})
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage all projects in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-10">Loading projects...</div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {projects.length === 0
                  ? "No projects found. Create your first project to get started."
                  : "No projects match the current filters."}
              </p>
              {projects.length === 0 ? (
                <Button onClick={handleCreateProject}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setBatchFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="font-medium text-muted-foreground">Project Name</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Batch</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Timeline</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Students</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Interviews</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {project.description}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {project.batch?.name || getBatchName(project.batch_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(project.start_date).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          to {new Date(project.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{project.student_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{project.interview_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProject(project)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProject(project)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ProjectCreateDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleProjectCreated}
        batches={batches}
      />

      <ProjectEditDialog
        project={editingProject}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setEditingProject(null);
          setIsEditDialogOpen(false);
        }}
        onSuccess={handleProjectUpdated}
        batches={batches}
      />

      <ProjectDetailsDialog
        project={selectedProject}
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setSelectedProject(null);
          setIsDetailsDialogOpen(false);
        }}
        onEdit={handleEditProject}
        onDelete={handleProjectDeleted}
      />
    </div>
  );
}

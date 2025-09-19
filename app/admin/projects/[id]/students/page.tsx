"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  ArrowLeft,
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  Star,
  TrendingUp,
} from "lucide-react";
import { makeUrl } from "@/lib/utils";
import type {
  ProjectRead,
  BatchRead,
  StudentProjectAssignment,
} from "@/app/admin/components/types";

// Define StudentRead type based on the API response
interface StudentRead {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  batch?: {
    id: number;
    name: string;
  };
}

export default function ProjectStudentsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuth();

  // State
  const [project, setProject] = useState<ProjectRead | null>(null);
  const [availableStudents, setAvailableStudents] = useState<StudentRead[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<StudentProjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selection state
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }

    if (isAuthenticated) {
      fetchProjectData();
    }
  }, [isAuthenticated, authLoading, projectId]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);

      // Fetch project details
      const projectResponse = await fetch(makeUrl("adminProjectById", { project_id: projectId }), {
        credentials: "include",
      });

      if (!projectResponse.ok) {
        throw new Error(`HTTP error! status: ${projectResponse.status}`);
      }

      const projectData = await projectResponse.json();
      if (projectData.success) {
        setProject(projectData.data);
      } else {
        throw new Error(projectData.message || "Failed to fetch project");
      }

      // Fetch available students (not assigned to any project)
      const studentsResponse = await fetch(makeUrl("adminStudents"), {
        credentials: "include",
      });

      if (!studentsResponse.ok) {
        throw new Error(`HTTP error! status: ${studentsResponse.status}`);
      }

      const studentsData = await studentsResponse.json();
      if (studentsData.success) {
        setAvailableStudents(studentsData.data);
      } else {
        throw new Error(studentsData.message || "Failed to fetch students");
      }

      // Fetch assigned students for this project
      const assignedResponse = await fetch(
        makeUrl("adminProjectStudents", { project_id: projectId }),
        {
          credentials: "include",
        },
      );

      if (!assignedResponse.ok) {
        throw new Error(`HTTP error! status: ${assignedResponse.status}`);
      }

      const assignedData = await assignedResponse.json();
      if (assignedData.success) {
        setAssignedStudents(assignedData.data.assignments || assignedData.data);
      } else {
        throw new Error(assignedData.message || "Failed to fetch assigned students");
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
      toast.error("Failed to load project data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to assign");
      return;
    }

    try {
      // Send individual requests for each student
      const promises = selectedStudents.map((studentId) =>
        fetch(makeUrl("adminProjectStudents", { project_id: projectId }), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: studentId,
          }),
        }),
      );

      const responses = await Promise.all(promises);

      // Check if all requests were successful
      const failedRequests = responses.filter((response) => !response.ok);
      if (failedRequests.length > 0) {
        throw new Error(`Failed to assign ${failedRequests.length} students`);
      }

      // Parse all responses
      const results = await Promise.all(responses.map((response) => response.json()));
      const failedAssignments = results.filter((result) => !result.success);

      if (failedAssignments.length > 0) {
        throw new Error(`Failed to assign ${failedAssignments.length} students`);
      }

      toast.success(`${selectedStudents.length} students assigned successfully`);
      setSelectedStudents([]);
      fetchProjectData(); // Refresh data
    } catch (error) {
      console.error("Error assigning students:", error);
      toast.error("Failed to assign students");
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!confirm("Are you sure you want to remove this student from the project?")) {
      return;
    }

    try {
      const response = await fetch(
        makeUrl("adminProjectStudentUpdate", { project_id: projectId, student_id: studentId }),
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: studentId,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Student removed successfully");
        fetchProjectData(); // Refresh data
      } else {
        throw new Error(data.message || "Failed to remove student");
      }
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Failed to remove student");
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "assigned":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "dropped":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter available students based on search
  const filteredAvailableStudents = availableStudents.filter(
    (student) =>
      student.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Loading project students...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">Project not found</p>
          <Button onClick={() => router.push("/admin/projects")} className="mt-4">
            Back to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/admin/projects")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
      </div>

      {/* Available Students Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Students ({filteredAvailableStudents.length})
          </CardTitle>
          <CardDescription>Select students to assign to this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Students Table */}
            {filteredAvailableStudents.length === 0 ? (
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No Students Available</h3>
                <p className="text-muted-foreground">
                  {searchTerm
                    ? "No students match your search criteria."
                    : "All students have been assigned to projects."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedStudents.length === filteredAvailableStudents.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedStudents(filteredAvailableStudents.map((s) => s.id));
                            } else {
                              setSelectedStudents([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Batch</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAvailableStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.includes(student.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(
                                  selectedStudents.filter((id) => id !== student.id),
                                );
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{student.user.name}</TableCell>
                        <TableCell>{student.user.email}</TableCell>
                        <TableCell>{student.batch?.name || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Assign Button */}
                {selectedStudents.length > 0 && (
                  <div className="flex justify-end">
                    <Button onClick={handleAssignStudents} className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Assign {selectedStudents.length} Student
                      {selectedStudents.length > 1 ? "s" : ""}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Assigned Students Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Onboarded Students ({assignedStudents.length})
          </CardTitle>
          <CardDescription>Students currently onboarded to this project</CardDescription>
        </CardHeader>
        <CardContent>
          {assignedStudents.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No Students Onboarded</h3>
              <p className="text-muted-foreground">
                Assign students from the available list above to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Onboarded Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignedStudents.map((assignment) => (
                  <TableRow
                    key={assignment.assignment.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/admin/students/${assignment.student?.id}`)}
                  >
                    <TableCell className="font-medium">
                      {assignment.student?.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell>{assignment.student?.user?.email || "Unknown"}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(assignment.assignment.status)}>
                        {assignment.assignment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(assignment.assignment.assigned_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Implement edit functionality
                            toast.info("Edit functionality coming soon");
                          }}
                          title="Edit Student Assignment"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStudent(assignment.assignment.student_id);
                          }}
                          title="Remove Student from Project"
                        >
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
}

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
} from "lucide-react";
import { makeUrl } from "@/lib/utils";
import type { ProjectRead, BatchRead, StudentProjectAssignment } from "../../../components/types";

interface Student {
  id: number;
  user: {
    id: number;
    email: string;
    name: string;
  };
  batch: {
    id: number;
    name: string;
  };
}

export default function ProjectStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<ProjectRead | null>(null);
  const [batch, setBatch] = useState<BatchRead | null>(null);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [assignedStudents, setAssignedStudents] = useState<StudentProjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  // Selection state
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

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

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin" && projectId) {
      fetchData();
    }
  }, [isAuthenticated, user, projectId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch project details first
      const projectResponse = await fetch(makeUrl("adminProjectById", { project_id: projectId }), {
        credentials: "include",
      });

      let currentProject: ProjectRead | null = null;
      if (projectResponse.ok) {
        const projectData = await projectResponse.json();
        if (projectData.success) {
          currentProject = projectData.data;
          setProject(currentProject);

          // Fetch batch details
          const batchResponse = await fetch(makeUrl("adminBatches"), {
            credentials: "include",
          });

          if (batchResponse.ok) {
            const batchData = await batchResponse.json();
            const projectBatch = batchData.data?.find(
              (b: BatchRead) => b.id === currentProject?.batch_id,
            );
            setBatch(projectBatch);
          }
        }
      }

      // Fetch assigned students first
      const assignedResponse = await fetch(
        makeUrl("adminProjectStudents", { project_id: projectId }),
        {
          credentials: "include",
        },
      );

      let currentAssignedStudents: StudentProjectAssignment[] = [];
      if (assignedResponse.ok) {
        const assignedData = await assignedResponse.json();
        if (assignedData.success) {
          // Backend returns {assignments: [...], total_count: ...}
          const assignments = assignedData.data?.assignments || [];
          currentAssignedStudents = Array.isArray(assignments) ? assignments : [];
          setAssignedStudents(currentAssignedStudents);
        }
      }

      // Fetch available students (from project's batch, not assigned to this project)
      if (currentProject) {
        const studentsResponse = await fetch(makeUrl("adminUsers"), {
          credentials: "include",
        });

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          if (studentsData.success) {
            // Backend returns {users: [...], total_count: ..., page: ..., page_size: ...}
            const users = studentsData.data?.users || [];

            // Ensure users is an array
            if (!Array.isArray(users)) {
              console.error("Users data is not an array:", users);
              setAvailableStudents([]);
              return;
            }

            // Filter students from the project's batch who are not assigned to this project
            const assignedStudentIds = Array.isArray(currentAssignedStudents)
              ? currentAssignedStudents.map((assigned) => assigned.assignment.student_id)
              : [];

            const studentUsers = users.filter((user: any) => user.role === "student");

            const projectBatchStudents = users.filter(
              (user: any) =>
                user.role === "student" &&
                user.student_detail?.batch?.id === currentProject?.batch_id &&
                !assignedStudentIds.includes(user.student_detail?.id),
            );

            setAvailableStudents(
              projectBatchStudents.map((user: any) => user.student_detail).filter(Boolean),
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelection = (studentId: number, checked: boolean) => {
    if (checked) {
      setSelectedStudents((prev) => [...prev, studentId]);
    } else {
      setSelectedStudents((prev) => prev.filter((id) => id !== studentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const filteredStudentIds = filteredAvailableStudents.map((s) => s.id);
      setSelectedStudents(filteredStudentIds);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleAssignSelected = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsAssigning(true);
    try {
      // Assign students one by one (since the API expects single assignment)
      const assignmentPromises = selectedStudents.map((studentId) => {
        const assignmentData = {
          student_id: studentId,
          resume_url: null,
          linkedin_url: null,
          offer_date: null,
          status: "active",
        };

        return fetch(makeUrl("adminProjectStudents", { project_id: projectId }), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(assignmentData),
        });
      });

      const responses = await Promise.all(assignmentPromises);
      const results = await Promise.all(responses.map((r) => r.json()));

      const successful = results.filter((r) => r.success).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`Successfully assigned ${successful} student(s) to project`);
        if (failed > 0) {
          toast.warning(`${failed} student(s) failed to assign`);
        }
        setSelectedStudents([]);
        fetchData(); // Refresh data
      } else {
        toast.error("Failed to assign any students");
      }
    } catch (error) {
      console.error("Error assigning students:", error);
      toast.error("Failed to assign students");
    } finally {
      setIsAssigning(false);
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
        },
      );

      if (response.ok) {
        toast.success("Student removed from project successfully");
        fetchData(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({}));
        toast.error(errorData.detail || "Failed to remove student");
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
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/projects")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{project.name} - Student Management</h1>
            <p className="text-muted-foreground">
              Batch: {batch?.name || `Batch ${project.batch_id}`}
            </p>
          </div>
        </div>
      </div>

      {/* Available Students Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Available Students
          </CardTitle>
          <CardDescription>
            Students from {batch?.name || `Batch ${project.batch_id}`} who can be assigned to this
            project
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableStudents.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium">All Students Assigned</h3>
              <p className="text-muted-foreground">
                All students from this batch are already assigned to the project.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={handleAssignSelected}
                  disabled={selectedStudents.length === 0 || isAssigning}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  {isAssigning ? "Assigning..." : `Assign Selected (${selectedStudents.length})`}
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedStudents.length === filteredAvailableStudents.length &&
                          filteredAvailableStudents.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAvailableStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={(checked) =>
                            handleStudentSelection(student.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">{student.user.name}</TableCell>
                      <TableCell>{student.user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">Available</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          )}
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
                  <TableRow key={assignment.assignment.id}>
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
                          onClick={() => {
                            // TODO: Implement edit functionality
                            toast.info("Edit functionality coming soon");
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveStudent(assignment.assignment.student_id)}
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

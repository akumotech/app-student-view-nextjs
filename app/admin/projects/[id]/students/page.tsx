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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Eye,
  Star,
  TrendingUp,
} from "lucide-react";
import { makeUrl } from "@/lib/utils";
import type {
  ProjectRead,
  BatchRead,
  StudentProjectAssignment,
  InterviewWithStudentDetails,
} from "../../../components/types";

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

  // Feedback dialog state
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedStudentForFeedback, setSelectedStudentForFeedback] =
    useState<StudentProjectAssignment | null>(null);
  const [studentInterviews, setStudentInterviews] = useState<InterviewWithStudentDetails[]>([]);
  const [isLoadingInterviews, setIsLoadingInterviews] = useState(false);

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

  const handleViewFeedback = async (assignment: StudentProjectAssignment) => {
    setSelectedStudentForFeedback(assignment);
    setIsFeedbackDialogOpen(true);
    setIsLoadingInterviews(true);

    try {
      // Fetch all completed interviews for this student
      const response = await fetch(makeUrl("adminBookedInterviews"), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        // Filter interviews for this specific student and project
        const studentInterviews = data.data.interviews.filter(
          (interview: InterviewWithStudentDetails) =>
            interview.student_id === assignment.assignment.student_id &&
            interview.project_id === projectId &&
            interview.status === "completed",
        );
        setStudentInterviews(studentInterviews);
      }
    } catch (error) {
      console.error("Error fetching student interviews:", error);
      toast.error("Failed to load interview feedback");
      setStudentInterviews([]);
    } finally {
      setIsLoadingInterviews(false);
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

  const calculateAverageRating = (interview: InterviewWithStudentDetails) => {
    const ratings = [
      interview.behavioral_rating,
      interview.technical_rating,
      interview.communication_rating,
      interview.body_language_rating,
      interview.professionalism_rating,
      interview.about_you_rating,
    ].filter((rating) => rating !== undefined && rating !== null);

    if (ratings.length === 0) return "0";
    return (ratings.reduce((sum, rating) => sum + (rating || 0), 0) / ratings.length).toFixed(1);
  };

  const getOverallPerformance = (averageRating: number) => {
    if (averageRating >= 8) return { label: "Excellent", color: "text-green-600" };
    if (averageRating >= 6) return { label: "Good", color: "text-blue-600" };
    if (averageRating >= 4) return { label: "Fair", color: "text-yellow-600" };
    return { label: "Needs Improvement", color: "text-red-600" };
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
                          onClick={() => handleViewFeedback(assignment)}
                          title="View Interview Feedback"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
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
                          onClick={() => handleRemoveStudent(assignment.assignment.student_id)}
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

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Interview Feedback - {selectedStudentForFeedback?.student?.user?.name || "Student"}
            </DialogTitle>
            <DialogDescription>
              Review all completed interview feedback and ratings for this student
            </DialogDescription>
          </DialogHeader>

          {isLoadingInterviews ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading interview feedback...</p>
            </div>
          ) : studentInterviews.length === 0 ? (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Interview Feedback</h3>
              <p className="text-muted-foreground">
                This student hasn't completed any interviews yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Summary */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Overall Performance Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {studentInterviews.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Interviews Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {(
                        studentInterviews.reduce((sum, interview) => {
                          const avg = parseFloat(calculateAverageRating(interview));
                          return sum + avg;
                        }, 0) / studentInterviews.length
                      ).toFixed(1)}
                    </div>
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-2xl font-bold ${
                        getOverallPerformance(
                          studentInterviews.reduce((sum, interview) => {
                            const avg = parseFloat(calculateAverageRating(interview));
                            return sum + avg;
                          }, 0) / studentInterviews.length,
                        ).color
                      }`}
                    >
                      {
                        getOverallPerformance(
                          studentInterviews.reduce((sum, interview) => {
                            const avg = parseFloat(calculateAverageRating(interview));
                            return sum + avg;
                          }, 0) / studentInterviews.length,
                        ).label
                      }
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Performance</div>
                  </div>
                </div>
              </div>

              {/* Individual Interview Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interview Details</h3>
                {studentInterviews.map((interview, index) => {
                  const avgRating = calculateAverageRating(interview);
                  const performance = getOverallPerformance(parseFloat(avgRating));

                  return (
                    <Card key={interview.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">
                              Interview #{index + 1} - {interview.interview_type}
                            </CardTitle>
                            <CardDescription>
                              Completed on {new Date(interview.updated_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className={`text-2xl font-bold ${performance.color}`}>
                              {avgRating}/10
                            </div>
                            <div className="text-sm text-muted-foreground">{performance.label}</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Rating Breakdown */}
                        <div>
                          <h4 className="font-medium mb-2">Rating Breakdown</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {interview.behavioral_rating && (
                              <div className="flex justify-between">
                                <span className="text-sm">Behavioral:</span>
                                <span className="font-medium">
                                  {interview.behavioral_rating}/10
                                </span>
                              </div>
                            )}
                            {interview.technical_rating && (
                              <div className="flex justify-between">
                                <span className="text-sm">Technical:</span>
                                <span className="font-medium">{interview.technical_rating}/10</span>
                              </div>
                            )}
                            {interview.communication_rating && (
                              <div className="flex justify-between">
                                <span className="text-sm">Communication:</span>
                                <span className="font-medium">
                                  {interview.communication_rating}/10
                                </span>
                              </div>
                            )}
                            {interview.body_language_rating && (
                              <div className="flex justify-between">
                                <span className="text-sm">Body Language:</span>
                                <span className="font-medium">
                                  {interview.body_language_rating}/10
                                </span>
                              </div>
                            )}
                            {interview.professionalism_rating && (
                              <div className="flex justify-between">
                                <span className="text-sm">Professionalism:</span>
                                <span className="font-medium">
                                  {interview.professionalism_rating}/10
                                </span>
                              </div>
                            )}
                            {interview.about_you_rating && (
                              <div className="flex justify-between">
                                <span className="text-sm">About You:</span>
                                <span className="font-medium">{interview.about_you_rating}/10</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Feedback Comments */}
                        {interview.feedback && (
                          <div>
                            <h4 className="font-medium mb-2">Feedback & Comments</h4>
                            <div className="bg-muted/30 p-3 rounded-lg">
                              <ul className="space-y-1">
                                {interview.feedback
                                  .split("\n")
                                  .filter((line) => line.trim())
                                  .map((line, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                      <span className="text-muted-foreground mt-1">•</span>
                                      <span className="text-sm">{line.trim()}</span>
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

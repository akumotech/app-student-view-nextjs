"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { makeUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Eye, Edit, Trash2, Calendar, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import type {
  InterviewSessionRead,
  InterviewSessionCreate,
  InterviewSessionUpdate,
  InterviewSessionListResponse,
  InterviewWithStudentDetails,
  InterviewReviewUpdate,
} from "@/app/admin/components/types";

export default function AdminInterviewsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<InterviewSessionRead[]>([]);
  const [bookedInterviews, setBookedInterviews] = useState<InterviewWithStudentDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<InterviewSessionRead | null>(null);
  const [selectedInterview, setSelectedInterview] = useState<InterviewWithStudentDetails | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.replace("/dashboard?error=unauthorized_admin_page");
      return;
    }

    if (isAuthenticated && user?.role === "admin") {
      fetchSessions();
      fetchBookedInterviews();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(makeUrl("adminInterviewSessions"), {
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
        setSessions(data.data.sessions || []);
      }
    } catch (error) {
      console.error("Error fetching interview sessions:", error);
      toast.error("Failed to fetch interview sessions");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookedInterviews = async () => {
    try {
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
        setBookedInterviews(data.data.interviews || []);
      }
    } catch (error) {
      console.error("Error fetching booked interviews:", error);
      toast.error("Failed to fetch booked interviews");
    }
  };

  const handleCreateSession = async (sessionData: InterviewSessionCreate) => {
    try {
      const response = await fetch(makeUrl("adminInterviewSessions"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview session created successfully");
        setIsCreateDialogOpen(false);
        fetchSessions();
      } else {
        throw new Error(data.message || "Failed to create session");
      }
    } catch (error) {
      console.error("Error creating interview session:", error);
      toast.error("Failed to create interview session");
    }
  };

  const handleUpdateSession = async (sessionId: number, sessionData: InterviewSessionUpdate) => {
    try {
      const response = await fetch(
        makeUrl("adminInterviewSessionById", { session_id: sessionId }),
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sessionData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview session updated successfully");
        setIsEditDialogOpen(false);
        setSelectedSession(null);
        fetchSessions();
      } else {
        throw new Error(data.message || "Failed to update session");
      }
    } catch (error) {
      console.error("Error updating interview session:", error);
      toast.error("Failed to update interview session");
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!confirm("Are you sure you want to delete this interview session?")) {
      return;
    }

    try {
      const response = await fetch(
        makeUrl("adminInterviewSessionById", { session_id: sessionId }),
        {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview session deleted successfully");
        fetchSessions();
      } else {
        throw new Error(data.message || "Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting interview session:", error);
      toast.error("Failed to delete interview session");
    }
  };

  const handleStartInterview = (interview: InterviewWithStudentDetails) => {
    setSelectedInterview(interview);
    setIsReviewDialogOpen(true);
  };

  const handleEditReview = (interview: InterviewWithStudentDetails) => {
    setSelectedInterview(interview);
    setIsReviewDialogOpen(true);
  };

  const handleUpdateReview = async (reviewData: InterviewReviewUpdate) => {
    if (!selectedInterview) return;

    try {
      const response = await fetch(
        makeUrl("adminInterviewReviewUpdate", { interview_id: selectedInterview.id }),
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reviewData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview review updated successfully");
        setIsReviewDialogOpen(false);
        setSelectedInterview(null);
        fetchBookedInterviews();
      } else {
        throw new Error(data.message || "Failed to update review");
      }
    } catch (error) {
      console.error("Error updating interview review:", error);
      toast.error("Failed to update interview review");
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.interviewer?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && session.is_active) ||
      (statusFilter === "inactive" && !session.is_active);

    return matchesSearch && matchesStatus;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Interview Management</h1>
            <p className="text-muted-foreground">Loading interview sessions...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-muted/40">
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Interview Management</h1>
            <p className="text-muted-foreground">Not authenticated</p>
          </div>
        </main>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-muted/40">
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Interview Management</h1>
            <p className="text-muted-foreground">Access denied. Admin role required.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Interview Management</h1>
              <p className="text-muted-foreground">
                Manage interview sessions and time slots for students
              </p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Interview Session</DialogTitle>
                  <DialogDescription>
                    Create a new interview session with available time slots.
                  </DialogDescription>
                </DialogHeader>
                <CreateSessionForm onSubmit={handleCreateSession} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search sessions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sessions</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Sessions</CardTitle>
            <CardDescription>Manage interview sessions and their time slots</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSessions.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No interview sessions found</h3>
                <p className="text-muted-foreground mb-4">
                  {sessions.length === 0
                    ? "Create your first interview session to get started."
                    : "No sessions match your current filters."}
                </p>
                {sessions.length === 0 && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{session.name}</div>
                          {session.description && (
                            <div className="text-sm text-muted-foreground">
                              {session.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{session.interviewer || "Not specified"}</TableCell>
                      <TableCell>
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(session.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin/interviews/${session.id}/slots`)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Slots
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSession(session);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSession(session.id)}
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

        {/* Scheduled Interviews Table */}
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Interviews</CardTitle>
              <CardDescription>Manage and review scheduled interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {bookedInterviews.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No scheduled interviews found</h3>
                  <p className="text-muted-foreground">
                    Interviews will appear here once students book time slots.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Interview Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookedInterviews.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {interview.student_name || "Unknown Student"}
                            </div>
                            {interview.student_email && (
                              <div className="text-sm text-muted-foreground">
                                {interview.student_email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {interview.slot_scheduled_at
                            ? new Date(interview.slot_scheduled_at).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Not scheduled"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{interview.interview_type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={interview.status === "completed" ? "default" : "secondary"}
                          >
                            {interview.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {interview.status === "scheduled" ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartInterview(interview)}
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Start Interview
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditReview(interview)}
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Edit Review
                              </Button>
                            )}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Interview Session</DialogTitle>
              <DialogDescription>Update the interview session details.</DialogDescription>
            </DialogHeader>
            {selectedSession && (
              <EditSessionForm
                session={selectedSession}
                onSubmit={(data) => handleUpdateSession(selectedSession.id, data)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Review Dialog */}
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {selectedInterview?.status === "scheduled" ? "Start Interview" : "Edit Review"}
              </DialogTitle>
              <DialogDescription>
                {selectedInterview?.status === "scheduled"
                  ? "Provide ratings and feedback for this interview."
                  : "Update the interview review and ratings."}
              </DialogDescription>
            </DialogHeader>
            {selectedInterview && (
              <ReviewForm
                interview={selectedInterview}
                onSubmit={handleUpdateReview}
                onCancel={() => {
                  setIsReviewDialogOpen(false);
                  setSelectedInterview(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// Create Session Form Component
function CreateSessionForm({ onSubmit }: { onSubmit: (data: InterviewSessionCreate) => void }) {
  const [formData, setFormData] = useState<InterviewSessionCreate>({
    name: "",
    description: "",
    interviewer: "",
    is_active: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Session Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="interviewer">Interviewer</Label>
        <Input
          id="interviewer"
          value={formData.interviewer}
          onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active (students can book slots)</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Create Session</Button>
      </div>
    </form>
  );
}

// Edit Session Form Component
function EditSessionForm({
  session,
  onSubmit,
}: {
  session: InterviewSessionRead;
  onSubmit: (data: InterviewSessionUpdate) => void;
}) {
  const [formData, setFormData] = useState<InterviewSessionUpdate>({
    name: session.name,
    description: session.description || "",
    interviewer: session.interviewer || "",
    is_active: session.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Session Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="interviewer">Interviewer</Label>
        <Input
          id="interviewer"
          value={formData.interviewer}
          onChange={(e) => setFormData({ ...formData, interviewer: e.target.value })}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
        />
        <Label htmlFor="is_active">Active (students can book slots)</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Update Session</Button>
      </div>
    </form>
  );
}

// Review Form Component
function ReviewForm({
  interview,
  onSubmit,
  onCancel,
}: {
  interview: InterviewWithStudentDetails;
  onSubmit: (data: InterviewReviewUpdate) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<InterviewReviewUpdate>({
    feedback: interview.feedback || "",
    behavioral_rating: interview.behavioral_rating || undefined,
    technical_rating: interview.technical_rating || undefined,
    communication_rating: interview.communication_rating || undefined,
    body_language_rating: interview.body_language_rating || undefined,
    professionalism_rating: interview.professionalism_rating || undefined,
    about_you_rating: interview.about_you_rating || undefined,
    status: interview.status === "scheduled" ? "completed" : interview.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const calculateAverageRating = () => {
    const ratings = [
      formData.behavioral_rating,
      formData.technical_rating,
      formData.communication_rating,
      formData.body_language_rating,
      formData.professionalism_rating,
      formData.about_you_rating,
    ].filter((rating) => rating !== undefined && rating !== null);

    if (ratings.length === 0) return 0;
    return (ratings.reduce((sum, rating) => sum + (rating || 0), 0) / ratings.length).toFixed(1);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="behavioral_rating">Behavioral Rating (0-10)</Label>
          <Input
            id="behavioral_rating"
            type="number"
            min="0"
            max="10"
            value={formData.behavioral_rating || ""}
            onChange={(e) =>
              setFormData({ ...formData, behavioral_rating: parseInt(e.target.value) || undefined })
            }
          />
        </div>
        <div>
          <Label htmlFor="technical_rating">Technical Rating (0-10)</Label>
          <Input
            id="technical_rating"
            type="number"
            min="0"
            max="10"
            value={formData.technical_rating || ""}
            onChange={(e) =>
              setFormData({ ...formData, technical_rating: parseInt(e.target.value) || undefined })
            }
          />
        </div>
        <div>
          <Label htmlFor="communication_rating">Communication Rating (0-10)</Label>
          <Input
            id="communication_rating"
            type="number"
            min="0"
            max="10"
            value={formData.communication_rating || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                communication_rating: parseInt(e.target.value) || undefined,
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="body_language_rating">Body Language & Tone (0-10)</Label>
          <Input
            id="body_language_rating"
            type="number"
            min="0"
            max="10"
            value={formData.body_language_rating || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                body_language_rating: parseInt(e.target.value) || undefined,
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="professionalism_rating">Professionalism (0-10)</Label>
          <Input
            id="professionalism_rating"
            type="number"
            min="0"
            max="10"
            value={formData.professionalism_rating || ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                professionalism_rating: parseInt(e.target.value) || undefined,
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="about_you_rating">About You (0-10)</Label>
          <Input
            id="about_you_rating"
            type="number"
            min="0"
            max="10"
            value={formData.about_you_rating || ""}
            onChange={(e) =>
              setFormData({ ...formData, about_you_rating: parseInt(e.target.value) || undefined })
            }
          />
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="text-sm text-muted-foreground mb-2">Average Rating:</div>
        <div className="text-2xl font-bold">{calculateAverageRating()}/10</div>
      </div>

      <div>
        <Label htmlFor="feedback">Feedback & Comments</Label>
        <Textarea
          id="feedback"
          value={formData.feedback || ""}
          onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
          placeholder="Provide detailed feedback about the interview..."
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {interview.status === "scheduled" ? "Complete Interview" : "Update Review"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Clock,
  Users,
  Star,
  MessageSquare,
  User,
} from "lucide-react";
import { toast } from "sonner";
import type { DemoRead } from "@/lib/dashboard-types";
import {
  fetchAvailableDemoSessionsAction,
  fetchMyDemoSignupsAction,
  signupForDemoSessionAction,
  updateDemoSignupAction,
  cancelDemoSignupAction,
} from "../actions";

// Type definitions
export interface DemoSessionSummary {
  id: number;
  session_date: string;
  is_active: boolean;
  is_cancelled: boolean;
  max_scheduled: number | null;
  title: string | null;
  signup_count: number;
  user_signed_up: boolean;
}

export interface DemoSignupCreate {
  demo_id: number | null;
  signup_notes: string | null;
}

export interface DemoSignupUpdate {
  demo_id: number | null;
  signup_notes: string | null;
  status: string | null;
}

export interface DemoSignupRead {
  id: number;
  session_id: number;
  student_id: number;
  demo_id: number | null;
  signup_notes: string | null;
  status: string;
  did_present: boolean | null;
  presentation_notes: string | null;
  presentation_rating: number | null;
  scheduled_at: string;
  updated_at: string;
  student: {
    id: number;
    name: string;
    email: string;
  } | null;
  demo: {
    id: number;
    title: string;
    description: string | null;
    demo_url: string;
    github_url: string | null;
    technologies: string | null;
    thumbnail_url: string | null;
  } | null;
}

interface DemoSessionSignupsProps {
  demos: DemoRead[];
}

export default function DemoSessionSignups({ demos }: DemoSessionSignupsProps) {
  const [availableSessions, setAvailableSessions] = useState<DemoSessionSummary[]>([]);
  const [mySignups, setMySignups] = useState<DemoSignupRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DemoSessionSummary | null>(null);
  const [editingSignup, setEditingSignup] = useState<DemoSignupRead | null>(null);
  const [viewingNotesSignup, setViewingNotesSignup] = useState<DemoSignupRead | null>(null);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [signupForm, setSignupForm] = useState({
    demo_id: null as number | null,
    signup_notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sessionsResult, signupsResult] = await Promise.all([
        fetchAvailableDemoSessionsAction(),
        fetchMyDemoSignupsAction(),
      ]);

      if (sessionsResult.success) {
        setAvailableSessions(sessionsResult.data);
      } else {
        console.error("Failed to fetch demo sessions:", sessionsResult.error);
        toast.error("Failed to load demo sessions");
      }

      if (signupsResult.success) {
        setMySignups(signupsResult.data);
      } else {
        console.error("Failed to fetch demo signups:", signupsResult.error);
        toast.error("Failed to load your demo signups");
      }
    } catch (error) {
      console.error("Error loading demo session data:", error);
      toast.error("Failed to load demo session data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupClick = (session: DemoSessionSummary) => {
    if (session.user_signed_up) {
      toast.info("You're already signed up for this session");
      return;
    }
    if (session.signup_count >= (session.max_scheduled || 0)) {
      toast.error("This session is full");
      return;
    }
    setSelectedSession(session);
    setSignupForm({ demo_id: null, signup_notes: "" });
    setIsSignupDialogOpen(true);
  };

  const handleSignupSubmit = async () => {
    if (!selectedSession) return;

    startTransition(async () => {
      try {
        const result = await signupForDemoSessionAction(selectedSession.id, signupForm);
        if (result.success) {
          toast.success("Successfully signed up for demo session!");
          setIsSignupDialogOpen(false);
          await loadData(); // Refresh data
        } else {
          toast.error(result.error || "Failed to sign up for demo session");
        }
      } catch (error) {
        console.error("Error signing up:", error);
        toast.error("An error occurred while signing up");
      }
    });
  };

  const handleEditClick = (signup: DemoSignupRead) => {
    setEditingSignup(signup);
    setSignupForm({
      demo_id: signup.demo_id,
      signup_notes: signup.signup_notes || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingSignup) return;

    startTransition(async () => {
      try {
        const updateData: DemoSignupUpdate = {
          demo_id: signupForm.demo_id,
          signup_notes: signupForm.signup_notes || null,
          status: null, // Don't change status
        };

        const result = await updateDemoSignupAction(editingSignup.id, updateData);
        if (result.success) {
          toast.success("Demo signup updated successfully!");
          setIsEditDialogOpen(false);
          await loadData(); // Refresh data
        } else {
          toast.error(result.error || "Failed to update demo signup");
        }
      } catch (error) {
        console.error("Error updating signup:", error);
        toast.error("An error occurred while updating signup");
      }
    });
  };

  const handleCancelSignup = async (signupId: number) => {
    if (!confirm("Are you sure you want to cancel this demo signup?")) return;

    startTransition(async () => {
      try {
        const result = await cancelDemoSignupAction(signupId);
        if (result.success) {
          toast.success("Demo signup cancelled successfully!");
          await loadData(); // Refresh data
        } else {
          toast.error(result.error || "Failed to cancel demo signup");
        }
      } catch (error) {
        console.error("Error cancelling signup:", error);
        toast.error("An error occurred while cancelling signup");
      }
    });
  };

  const handleViewNotes = (signup: DemoSignupRead) => {
    setViewingNotesSignup(signup);
    setIsNotesDialogOpen(true);
  };

  const getStatusBadge = (signup: DemoSignupRead) => {
    switch (signup.status) {
      case "presented":
        return (
          <Badge variant="secondary" className="text-green-600 border-green-600">
            ✅ Presented
          </Badge>
        );
      case "no_show":
        return <Badge variant="destructive">❌ No Show</Badge>;
      case "signed_up":
      default:
        return <Badge variant="outline">📝 Signed Up</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return "Invalid date";
    }

    const parts = dateString.split("-");
    if (parts.length !== 3) {
      return "Invalid date format";
    }

    const [year, month, day] = parts.map(Number);

    // Validate the parsed numbers
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return "Invalid date values";
    }

    const date = new Date(year, month - 1, day);

    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading demo sessions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Available Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Available Demo Sessions
          </CardTitle>
          <CardDescription>
            Sign up to present your demo during upcoming Friday sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No demo sessions available at the moment
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {availableSessions.map((session) => (
                <Card key={session.id} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {session.title || "Friday Demo Session"}
                      </CardTitle>
                      {session.user_signed_up && (
                        <Badge variant="secondary" className="text-green-600">
                          ✅ Signed Up
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatDate(session.session_date)}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {session.signup_count}/{session.max_scheduled || "∞"} spots filled
                      </div>
                      <div>
                        {session.is_cancelled ? (
                          <Badge variant="destructive">Cancelled</Badge>
                        ) : !session.is_active ? (
                          <Badge variant="secondary">Inactive</Badge>
                        ) : session.signup_count >= (session.max_scheduled || 0) ? (
                          <Badge variant="outline" className="text-yellow-600">
                            Full
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600">
                            Open
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSignupClick(session)}
                      disabled={
                        isPending ||
                        session.user_signed_up ||
                        session.is_cancelled ||
                        !session.is_active ||
                        session.signup_count >= (session.max_scheduled || 0)
                      }
                      className="w-full"
                      variant={session.user_signed_up ? "outline" : "default"}
                    >
                      {session.user_signed_up
                        ? "Already Signed Up"
                        : session.signup_count >= (session.max_scheduled || 0)
                          ? "Session Full"
                          : "Sign Up"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Signups */}
      <Card>
        <CardHeader>
          <CardTitle>My Demo Signups</CardTitle>
          <CardDescription>Manage your scheduled demo presentations</CardDescription>
        </CardHeader>
        <CardContent>
          {mySignups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              You haven't signed up for any demo sessions yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Date</TableHead>
                    <TableHead>Demo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mySignups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell>{formatDate(signup.scheduled_at)}</TableCell>
                      <TableCell>
                        {signup.demo ? (
                          <div>
                            <div className="font-medium">{signup.demo.title}</div>
                            {signup.demo.description && (
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {signup.demo.description}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No demo selected</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(signup)}</TableCell>
                      <TableCell>
                        {signup.presentation_rating ? (
                          renderStars(signup.presentation_rating)
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {signup.presentation_notes || signup.signup_notes ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewNotes(signup)}
                            className="h-8 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            View Notes
                          </Button>
                        ) : (
                          <span className="text-muted-foreground text-sm">No notes</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditClick(signup)}
                            disabled={isPending || signup.status === "presented"}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelSignup(signup.id)}
                            disabled={isPending || signup.status === "presented"}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Signup Dialog */}
      <Dialog open={isSignupDialogOpen} onOpenChange={setIsSignupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Up for Demo Session</DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="font-medium">{selectedSession.title || "Friday Demo Session"}</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(selectedSession.session_date)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="demo-select">Select Demo to Present</Label>
                <select
                  id="demo-select"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={signupForm.demo_id?.toString() || ""}
                  onChange={(e) =>
                    setSignupForm((prev) => ({
                      ...prev,
                      demo_id: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  disabled={isPending}
                >
                  <option value="">Choose a demo (optional)</option>
                  {demos.map((demo) => (
                    <option key={demo.id} value={demo.id.toString()}>
                      {demo.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-notes">Notes (Optional)</Label>
                <Textarea
                  id="signup-notes"
                  placeholder="Add any notes about your presentation..."
                  value={signupForm.signup_notes}
                  onChange={(e) =>
                    setSignupForm((prev) => ({ ...prev, signup_notes: e.target.value }))
                  }
                  rows={3}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSignupDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSignupSubmit} disabled={isPending}>
              {isPending ? "Signing Up..." : "Sign Up"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Demo Signup</DialogTitle>
          </DialogHeader>
          {editingSignup && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="font-medium">Demo Session</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(editingSignup.scheduled_at)}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-demo-select">Select Demo to Present</Label>
                <select
                  id="edit-demo-select"
                  className="w-full p-2 border border-input rounded-md bg-background"
                  value={signupForm.demo_id?.toString() || ""}
                  onChange={(e) =>
                    setSignupForm((prev) => ({
                      ...prev,
                      demo_id: e.target.value ? parseInt(e.target.value) : null,
                    }))
                  }
                  disabled={isPending}
                >
                  <option value="">Choose a demo (optional)</option>
                  {demos.map((demo) => (
                    <option key={demo.id} value={demo.id.toString()}>
                      {demo.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-signup-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-signup-notes"
                  placeholder="Add any notes about your presentation..."
                  value={signupForm.signup_notes}
                  onChange={(e) =>
                    setSignupForm((prev) => ({ ...prev, signup_notes: e.target.value }))
                  }
                  rows={3}
                  disabled={isPending}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isPending}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Viewing Dialog */}
      <Dialog open={isNotesDialogOpen} onOpenChange={setIsNotesDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Notes & Feedback</DialogTitle>
          </DialogHeader>
          {viewingNotesSignup && (
            <div className="space-y-4">
              {/* Session Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="font-medium">Demo Session</div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(viewingNotesSignup.scheduled_at)}
                </div>
                {viewingNotesSignup.demo && (
                  <div className="mt-2">
                    <div className="text-sm font-medium">Demo: {viewingNotesSignup.demo.title}</div>
                  </div>
                )}
              </div>

              {/* Notes and Feedback */}
              <div className="space-y-4">
                {viewingNotesSignup.presentation_notes && (
                  <div className="rounded-md bg-blue-50 p-4 border-l-4 border-blue-200">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-blue-900 mb-2">Feedback</div>
                        <div className="text-blue-800 leading-relaxed whitespace-pre-wrap">
                          {viewingNotesSignup.presentation_notes}
                        </div>
                        {viewingNotesSignup.presentation_rating && (
                          <div className="mt-3 pt-3 border-t border-blue-200">
                            <div className="text-sm font-medium text-blue-900 mb-1">Rating</div>
                            {renderStars(viewingNotesSignup.presentation_rating)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {viewingNotesSignup.signup_notes && (
                  <div className="rounded-md bg-gray-50 p-4 border-l-4 border-gray-200">
                    <div className="flex items-start gap-3">
                      <User className="h-5 w-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 mb-2">Your Notes</div>
                        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {viewingNotesSignup.signup_notes}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {!viewingNotesSignup.presentation_notes && !viewingNotesSignup.signup_notes && (
                  <div className="text-center py-8 text-muted-foreground">
                    No notes or feedback available for this signup.
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

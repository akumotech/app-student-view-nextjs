"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
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
  ExternalLink,
  Copy,
  Check,
  Video,
  Globe,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import type { DemoRead } from "@/lib/dashboard-types";
import type { DemoSessionSummary } from "../api/fetchDemoSessions";
import type { DemoSignupRead } from "../api/fetchMyDemoSignups";
import {
  signupForDemoSession,
  updateDemoSignup,
  cancelDemoSignup,
  type DemoSignupCreate,
  type DemoSignupUpdate,
} from "../api/demoSignupActions";
import { formatTimeForDisplay, formatSessionDateTime } from "@/lib/utils";

interface DemoSessionSignupsProps {
  demos: DemoRead[];
  initialSessions: DemoSessionSummary[];
  initialSignups: DemoSignupRead[];
}

// Meeting platform detection and validation utilities
const detectMeetingPlatform = (url: string): { platform: string; icon: React.ReactNode } => {
  const lowerUrl = url.toLowerCase();

  if (lowerUrl.includes("zoom.us")) {
    return { platform: "Zoom", icon: <Video className="h-4 w-4 text-blue-600" /> };
  } else if (lowerUrl.includes("meet.google.com")) {
    return { platform: "Google Meet", icon: <Video className="h-4 w-4 text-green-600" /> };
  } else if (lowerUrl.includes("teams.microsoft.com")) {
    return { platform: "Microsoft Teams", icon: <Video className="h-4 w-4 text-purple-600" /> };
  } else if (lowerUrl.includes("webex.com")) {
    return { platform: "Webex", icon: <Video className="h-4 w-4 text-orange-600" /> };
  } else if (lowerUrl.includes("gotomeeting.com")) {
    return { platform: "GoToMeeting", icon: <Video className="h-4 w-4 text-yellow-600" /> };
  } else {
    return { platform: "Video Call", icon: <Globe className="h-4 w-4 text-gray-600" /> };
  }
};

const CopyButton = ({ text, label }: { text: string; label: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1">
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copied" : "Copy"}
    </Button>
  );
};

const MeetingLinkDisplay = ({ session }: { session: DemoSessionSummary }) => {
  if (session.zoom_link) {
    const { platform, icon } = detectMeetingPlatform(session.zoom_link);

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          {icon}
          <span className="font-medium text-green-600">Meeting link available</span>
          <Badge variant="outline" className="text-green-600 border-green-600">
            {platform}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="default"
            size="sm"
            className="flex-1 bg-green-600 hover:bg-green-700"
            onClick={() => window.open(session.zoom_link!, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Join {platform}
          </Button>
          <CopyButton text={session.zoom_link} label="Meeting Link" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="h-4 w-4 text-yellow-500" />
      <span>Meeting link will be provided closer to the session</span>
    </div>
  );
};

export default function DemoSessionSignups({
  demos,
  initialSessions,
  initialSignups,
}: DemoSessionSignupsProps) {
  const router = useRouter();
  const [availableSessions, setAvailableSessions] = useState<DemoSessionSummary[]>(initialSessions);
  const [mySignups, setMySignups] = useState<DemoSignupRead[]>(initialSignups);
  const [isLoading, setIsLoading] = useState(false);
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
        const result = await signupForDemoSession(selectedSession.id, signupForm);

        if (result && (result.id || result.session_id)) {
          // We have a valid signup result
          toast.success("Successfully signed up for demo session!");
          setIsSignupDialogOpen(false);
          router.refresh();
        } else if (result === null) {
          // Explicit null return (API error)
          toast.error("Failed to sign up for demo session. Please try again.");
        } else {
          // Unexpected result structure but not null
          toast.warning(
            "Signup completed but with unexpected response. Refreshing to check status...",
          );
          router.refresh();
        }
      } catch (error) {
        console.error(`[UI] Signup error:`, error);
        toast.error("An error occurred while signing up");
        // Still refresh in case the signup actually worked despite the error
        setTimeout(() => {
          router.refresh();
        }, 1000);
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

        const result = await updateDemoSignup(editingSignup.id, updateData);
        if (result) {
          toast.success("Demo signup updated successfully!");
          setIsEditDialogOpen(false);
          router.refresh();
        } else {
          toast.error("Failed to update demo signup");
        }
      } catch (error) {
        toast.error("An error occurred while updating signup");
      }
    });
  };

  const handleCancelSignup = async (signupId: number) => {
    if (!confirm("Are you sure you want to cancel this demo signup?")) return;

    startTransition(async () => {
      try {
        const success = await cancelDemoSignup(signupId);
        if (success) {
          toast.success("Demo signup cancelled successfully!");
          router.refresh();
        } else {
          toast.error("Failed to cancel demo signup");
        }
      } catch (error) {
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

    try {
      // Handle both ISO timestamps and simple date strings
      let dateOnly = dateString;
      if (dateString.includes("T")) {
        // Extract date part from ISO timestamp
        dateOnly = dateString.split("T")[0];
      }

      const parts = dateOnly.split("-");
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
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid date";
    }
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
        {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>}
      </div>
    );
  };

  // Helper function to get session date for a signup
  const getSessionDate = (signup: DemoSignupRead): string => {
    const session = availableSessions.find((s) => s.id === signup.session_id);
    return session?.session_date || "Unknown date";
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
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4" />
                          {formatDate(session.session_date)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimeForDisplay(session.session_time || "15:00:00")} Central Time
                        </div>
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

                    <div className="mb-3">
                      <MeetingLinkDisplay session={session} />
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
                      <TableCell>{formatDate(getSessionDate(signup))}</TableCell>
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
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {formatTimeForDisplay(selectedSession.session_time || "15:00:00")} Central Time
                </div>
                <div className="mt-2">
                  <MeetingLinkDisplay session={selectedSession} />
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
                  {formatDate(getSessionDate(editingSignup))}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {(() => {
                    const session = availableSessions.find(
                      (s) => s.id === editingSignup.session_id,
                    );
                    return formatTimeForDisplay(session?.session_time || "15:00:00");
                  })()}{" "}
                  Central Time
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
                  {formatDate(getSessionDate(viewingNotesSignup))}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {(() => {
                    const session = availableSessions.find(
                      (s) => s.id === viewingNotesSignup.session_id,
                    );
                    return formatTimeForDisplay(session?.session_time || "15:00:00");
                  })()}{" "}
                  Central Time
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

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
import { ArrowLeft, CheckCircle, XCircle, Star, MessageSquare, User } from "lucide-react";
import { toast } from "sonner";
import type { DemoSession, DemoSignup, UpdateSignupAdmin } from "../api/fetchDemoSessions";
import { fetchSessionSignupsAction, updateSignupAction } from "../demo-sessions/actions";

interface SessionSignupsProps {
  session: DemoSession;
  onBack: () => void;
}

export default function SessionSignups({ session, onBack }: SessionSignupsProps) {
  const [signups, setSignups] = useState<DemoSignup[]>(session.signups || []);

  // Always load signups if the array is empty but signup_count > 0, or if signups is null/undefined
  const shouldFetchSignups =
    !session.signups ||
    (Array.isArray(session.signups) && session.signups.length === 0 && session.signup_count > 0);

  const [isLoading, setIsLoading] = useState(shouldFetchSignups);
  const [isFeedbackDialogOpen, setIsFeedbackDialogOpen] = useState(false);
  const [selectedSignup, setSelectedSignup] = useState<DemoSignup | null>(null);
  const [isPending, startTransition] = useTransition();

  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    did_present: false,
    presentation_notes: "",
    presentation_rating: 0,
    status: "signed_up",
  });

  // Fetch signups if needed
  useEffect(() => {
    if (shouldFetchSignups) {
      fetchSignups();
    } else {
    }
  }, [session.id, shouldFetchSignups]);

  const fetchSignups = async () => {
    setIsLoading(true);
    try {
      const result = await fetchSessionSignupsAction(session.id);

      if (result.success) {
        setSignups(result.data);
      } else {
        toast.error(result.error || "Failed to load signups");
      }
    } catch (error) {
      console.error("🔍 ADMIN: Fetch signups error:", error);
      toast.error("An error occurred while loading signups");
    } finally {
      setIsLoading(false);
    }
  };

  const openFeedbackDialog = (signup: DemoSignup) => {
    setSelectedSignup(signup);
    setFeedbackForm({
      did_present: signup.did_present ?? false,
      presentation_notes: signup.presentation_notes ?? "",
      presentation_rating: signup.presentation_rating ?? 0,
      status: signup.status,
    });
    setIsFeedbackDialogOpen(true);
  };

  const handleQuickAction = (signup: DemoSignup, action: "presented" | "no_show") => {
    const updateData: UpdateSignupAdmin = {
      did_present: action === "presented",
      status: action === "presented" ? "presented" : "no_show",
    };

    startTransition(async () => {
      try {
        const result = await updateSignupAction(signup.id, updateData);
        if (result.success) {
          setSignups((prev) =>
            prev.map((s) => (s.id === result.data.id ? (result.data as DemoSignup) : s)),
          );
          toast.success(`Marked as ${action === "presented" ? "presented" : "no show"}`);
        } else {
          toast.error(result.error || "Failed to update signup");
        }
      } catch (error) {
        console.error("Quick action error:", error);
        toast.error("An error occurred while updating the signup");
      }
    });
  };

  const handleSaveFeedback = () => {
    if (!selectedSignup) return;

    const updateData: UpdateSignupAdmin = {
      did_present: feedbackForm.did_present,
      presentation_notes: feedbackForm.presentation_notes || undefined,
      presentation_rating: feedbackForm.presentation_rating || undefined,
      status: feedbackForm.status,
    };

    startTransition(async () => {
      try {
        const result = await updateSignupAction(selectedSignup.id, updateData);
        if (result.success) {
          setSignups((prev) =>
            prev.map((s) => (s.id === result.data.id ? (result.data as DemoSignup) : s)),
          );
          setIsFeedbackDialogOpen(false);
          setSelectedSignup(null);
          toast.success("Feedback saved successfully!");
        } else {
          toast.error(result.error || "Failed to save feedback");
        }
      } catch (error) {
        console.error("Save feedback error:", error);
        toast.error("An error occurred while saving feedback");
      }
    });
  };

  const getStatusBadge = (signup: DemoSignup) => {
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
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const renderStars = (
    rating: number,
    interactive = false,
    onChange?: (rating: number) => void,
  ) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive && onChange ? () => onChange(star) : undefined}
          />
        ))}
        {rating > 0 && <span className="ml-2 text-sm text-muted-foreground">({rating}/5)</span>}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-muted-foreground">Loading signups...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
            <div>
              <CardTitle>Demo Session - {formatDate(session.session_date)}</CardTitle>
              <CardDescription>
                {signups.length} student{signups.length !== 1 ? "s" : ""} signed up (Max:{" "}
                {session.max_scheduled})
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {signups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No students have signed up for this session yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Demo</TableHead>
                    <TableHead>Signup Notes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signups.map((signup) => (
                    <TableRow key={signup.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{signup.student.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {signup.student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {signup.demo ? (
                          <div>
                            <div className="font-medium">{signup.demo.title}</div>
                            {signup.demo.description && (
                              <div className="text-sm text-muted-foreground max-w-xs truncate">
                                {signup.demo.description}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No demo selected</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {signup.signup_notes ? (
                          <div className="max-w-xs truncate" title={signup.signup_notes}>
                            {signup.signup_notes}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
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
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(signup, "presented")}
                            disabled={isPending}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Presented
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickAction(signup, "no_show")}
                            disabled={isPending}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            No Show
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openFeedbackDialog(signup)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Feedback
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

      {/* Feedback Dialog */}
      <Dialog open={isFeedbackDialogOpen} onOpenChange={setIsFeedbackDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Presentation Feedback</DialogTitle>
          </DialogHeader>
          {selectedSignup && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <div>
                    <div className="font-medium">{selectedSignup.student.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedSignup.student.email}
                    </div>
                  </div>
                </div>
                {selectedSignup.demo && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="font-medium text-sm">Demo: {selectedSignup.demo.title}</div>
                    {selectedSignup.demo.description && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedSignup.demo.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Presentation Status */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Presentation Status</Label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="did_present"
                      checked={feedbackForm.did_present === true}
                      onChange={() =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          did_present: true,
                          status: "presented",
                        }))
                      }
                    />
                    <span>✅ Presented</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="did_present"
                      checked={feedbackForm.did_present === false}
                      onChange={() =>
                        setFeedbackForm((prev) => ({
                          ...prev,
                          did_present: false,
                          status: "no_show",
                        }))
                      }
                    />
                    <span>❌ No Show</span>
                  </label>
                </div>
              </div>

              {/* Rating */}
              {feedbackForm.did_present && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Presentation Rating</Label>
                  {renderStars(feedbackForm.presentation_rating, true, (rating) =>
                    setFeedbackForm((prev) => ({ ...prev, presentation_rating: rating })),
                  )}
                </div>
              )}

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="presentation_notes" className="text-base font-medium">
                  Presentation Notes
                </Label>
                <Textarea
                  id="presentation_notes"
                  placeholder={
                    feedbackForm.did_present
                      ? "Add feedback about the presentation..."
                      : "Add notes about the absence..."
                  }
                  value={feedbackForm.presentation_notes}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({ ...prev, presentation_notes: e.target.value }))
                  }
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFeedbackDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFeedback} disabled={isPending}>
              {isPending ? "Saving..." : "Save Feedback"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Users,
  Eye,
  Clock,
  ExternalLink,
  Copy,
  Check,
  Video,
  Globe,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import type { DemoSession, CreateDemoSession, UpdateDemoSession } from "../api/fetchDemoSessions";
import {
  createDemoSessionAction,
  updateDemoSessionAction,
  type CreateDemoSessionData,
  type UpdateDemoSessionData,
} from "../demo-sessions/actions";
import {
  formatTimeForDisplay,
  formatTimeForInput,
  formatTimeForApi,
  formatSessionDateTime,
  getDefaultSessionTime,
  getCommonSessionTimes,
} from "@/lib/utils";

interface DemoSessionManagementProps {
  initialSessions: DemoSession[];
  onSessionSelect: (session: DemoSession) => void;
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

const validateMeetingUrl = (url: string): boolean => {
  if (!url.trim()) return true; // Empty URL is valid (optional field)

  try {
    const urlObj = new URL(url);
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
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

export default function DemoSessionManagement({
  initialSessions,
  onSessionSelect,
}: DemoSessionManagementProps) {
  const [sessions, setSessions] = useState<DemoSession[]>(initialSessions);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<DemoSession | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [formData, setFormData] = useState<CreateDemoSession>({
    session_date: "",
    session_time: getDefaultSessionTime(),
    max_scheduled: 8,
    title: "Friday Demo Session",
    description: "",
    notes: "",
    zoom_link: "",
    is_active: true,
    is_cancelled: false,
  });

  const resetForm = () => {
    setFormData({
      session_date: "",
      session_time: getDefaultSessionTime(),
      max_scheduled: 8,
      title: "Friday Demo Session",
      description: "",
      notes: "",
      zoom_link: "",
      is_active: true,
      is_cancelled: false,
    });
  };

  const handleCreateSession = () => {
    if (!formData.session_date) {
      toast.error("Please select a session date");
      return;
    }

    if (formData.zoom_link && !validateMeetingUrl(formData.zoom_link)) {
      toast.error("Please enter a valid meeting URL");
      return;
    }

    startTransition(async () => {
      const result = await createDemoSessionAction({
        session_date: formData.session_date,
        session_time: formatTimeForApi(formData.session_time || getDefaultSessionTime()),
        max_scheduled: formData.max_scheduled,
        title: formData.title,
        description: formData.description,
        notes: formData.notes,
        zoom_link: formData.zoom_link || undefined,
        is_active: formData.is_active,
        is_cancelled: formData.is_cancelled,
      });

      if (result.success) {
        setSessions((prev) =>
          [...prev, result.data as DemoSession].sort(
            (a, b) => new Date(b.session_date).getTime() - new Date(a.session_date).getTime(),
          ),
        );
        setIsCreateDialogOpen(false);
        resetForm();
        toast.success("Demo session created successfully!");
      } else {
        toast.error(result.error || "Failed to create demo session");
      }
    });
  };

  const handleEditSession = () => {
    if (!editingSession) return;

    if (formData.zoom_link && !validateMeetingUrl(formData.zoom_link)) {
      toast.error("Please enter a valid meeting URL");
      return;
    }

    startTransition(async () => {
      const result = await updateDemoSessionAction(editingSession.id, {
        session_date: formData.session_date,
        session_time: formatTimeForApi(formData.session_time || getDefaultSessionTime()),
        max_scheduled: formData.max_scheduled,
        title: formData.title,
        description: formData.description,
        notes: formData.notes,
        zoom_link: formData.zoom_link || undefined,
      });

      if (result.success) {
        setSessions((prev) =>
          prev.map((s) => (s.id === result.data.id ? (result.data as DemoSession) : s)),
        );
        setIsEditDialogOpen(false);
        setEditingSession(null);
        resetForm();
        toast.success("Demo session updated successfully!");
      } else {
        toast.error(result.error || "Failed to update demo session");
      }
    });
  };

  const handleToggleActive = (session: DemoSession) => {
    startTransition(async () => {
      const result = await updateDemoSessionAction(session.id, {
        is_active: !session.is_active,
      });

      if (result.success) {
        const updatedSession = result.data as DemoSession;
        setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
        toast.success(
          `Session ${updatedSession.is_active ? "activated" : "deactivated"} successfully!`,
        );
      } else {
        toast.error(result.error || "Failed to update session status");
      }
    });
  };

  const handleToggleCancelled = (session: DemoSession) => {
    startTransition(async () => {
      const result = await updateDemoSessionAction(session.id, {
        is_cancelled: !session.is_cancelled,
      });

      if (result.success) {
        const updatedSession = result.data as DemoSession;
        setSessions((prev) => prev.map((s) => (s.id === updatedSession.id ? updatedSession : s)));
        toast.success(
          `Session ${updatedSession.is_cancelled ? "cancelled" : "reactivated"} successfully!`,
        );
      } else {
        toast.error(result.error || "Failed to update session status");
      }
    });
  };

  const openEditDialog = (session: DemoSession) => {
    setEditingSession(session);
    setFormData({
      session_date: session.session_date.split("T")[0], // Format for date input
      session_time: formatTimeForInput(session.session_time || getDefaultSessionTime()),
      max_scheduled: session.max_scheduled,
      title: session.title || "Friday Demo Session",
      description: session.description || "",
      notes: session.notes || "",
      zoom_link: session.zoom_link || "",
      is_active: session.is_active,
      is_cancelled: session.is_cancelled,
    });
    setIsEditDialogOpen(true);
  };

  const getSessionStatus = (session: DemoSession) => {
    if (session.is_cancelled) {
      return <Badge variant="destructive">🔴 Cancelled</Badge>;
    }
    if (!session.is_active) {
      return <Badge variant="secondary">⚫ Inactive</Badge>;
    }
    if (session.signup_count >= session.max_scheduled) {
      return (
        <Badge variant="outline" className="text-yellow-600 border-yellow-600">
          🟡 Full
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-green-600 border-green-600">
        🟢 Active
      </Badge>
    );
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

    const date = new Date(year, month - 1, day); // month is 0-indexed

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

  // Get next Friday as default date
  const getNextFriday = () => {
    const today = new Date();
    const daysUntilFriday = (5 - today.getDay() + 7) % 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    return nextFriday.toISOString().split("T")[0];
  };

  useEffect(() => {
    if (isCreateDialogOpen && !formData.session_date) {
      setFormData((prev) => ({ ...prev, session_date: getNextFriday() }));
    }
  }, [isCreateDialogOpen]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Demo Session Management
              </CardTitle>
              <CardDescription>
                Manage Friday demo sessions where students showcase their projects
              </CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signups</TableHead>
                  <TableHead>Meeting Link</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{formatDate(session.session_date)}</span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeForDisplay(session.session_time || "15:00:00")} Central
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {session.title || "Friday Demo Session"}
                        </span>
                        {session.description && (
                          <span className="text-sm text-muted-foreground">
                            {session.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getSessionStatus(session)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {session.signup_count}/{session.max_scheduled}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {session.zoom_link ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {detectMeetingPlatform(session.zoom_link).icon}
                            <span className="text-xs text-muted-foreground">
                              {detectMeetingPlatform(session.zoom_link).platform}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(session.zoom_link!, "_blank")}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Join
                          </Button>
                          <CopyButton text={session.zoom_link} label="Meeting Link" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-muted-foreground">
                            Link will be added later
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            onSessionSelect(session);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Signups
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(session)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant={session.is_active ? "destructive" : "outline"}
                          size="sm"
                          onClick={() => handleToggleActive(session)}
                          disabled={isPending}
                          className="min-w-24"
                        >
                          {session.is_active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant={session.is_cancelled ? "outline" : "destructive"}
                          size="sm"
                          onClick={() => handleToggleCancelled(session)}
                          disabled={isPending}
                        >
                          {session.is_cancelled ? "Uncancel" : "Cancel"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No demo sessions found. Create your first session to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Demo Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="session_date">Session Date</Label>
                <Input
                  id="session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, session_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="session_time">Session Time (Central)</Label>
                <Input
                  id="session_time"
                  type="time"
                  value={formData.session_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, session_time: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">Default: 3:00 PM Central Time</p>
              </div>
            </div>
            <div>
              <Label htmlFor="title">Session Title</Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Friday Demo Session"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the session"
              />
            </div>
            <div>
              <Label htmlFor="max_scheduled">Maximum Students</Label>
              <Input
                id="max_scheduled"
                type="number"
                min="1"
                max="20"
                value={formData.max_scheduled}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, max_scheduled: parseInt(e.target.value) || 8 }))
                }
              />
            </div>
            <div>
              <Label htmlFor="notes">Admin Notes</Label>
              <Input
                id="notes"
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes for admins"
              />
            </div>
            <div>
              <Label htmlFor="zoom_link">Zoom Link (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="zoom_link"
                  type="url"
                  value={formData.zoom_link}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zoom_link: e.target.value }))}
                  placeholder="https://zoom.us/j/1234567890"
                />
                {formData.zoom_link && <CopyButton text={formData.zoom_link} label="Zoom Link" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a valid URL (e.g., https://zoom.us/j/1234567890) if you want to pre-fill it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSession} disabled={isPending}>
              {isPending ? "Creating..." : "Create Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Session Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Demo Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_session_date">Session Date</Label>
                <Input
                  id="edit_session_date"
                  type="date"
                  value={formData.session_date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, session_date: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit_session_time">Session Time (Central)</Label>
                <Input
                  id="edit_session_time"
                  type="time"
                  value={formData.session_time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, session_time: e.target.value }))
                  }
                />
                <p className="text-xs text-muted-foreground mt-1">Time in Central timezone</p>
              </div>
            </div>
            <div>
              <Label htmlFor="edit_title">Session Title</Label>
              <Input
                id="edit_title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Friday Demo Session"
              />
            </div>
            <div>
              <Label htmlFor="edit_description">Description</Label>
              <Input
                id="edit_description"
                type="text"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the session"
              />
            </div>
            <div>
              <Label htmlFor="edit_max_scheduled">Maximum Students</Label>
              <Input
                id="edit_max_scheduled"
                type="number"
                min="1"
                max="20"
                value={formData.max_scheduled}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, max_scheduled: parseInt(e.target.value) || 8 }))
                }
              />
            </div>
            <div>
              <Label htmlFor="edit_notes">Admin Notes</Label>
              <Input
                id="edit_notes"
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Internal notes for admins"
              />
            </div>
            {editingSession?.zoom_link && (
              <div>
                <Label>Zoom Link</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input value={editingSession.zoom_link} readOnly className="flex-1" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(editingSession.zoom_link!, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Open
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Zoom link is auto-generated and cannot be edited here
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="edit_zoom_link">Zoom Link (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="edit_zoom_link"
                  type="url"
                  value={formData.zoom_link}
                  onChange={(e) => setFormData((prev) => ({ ...prev, zoom_link: e.target.value }))}
                  placeholder="https://zoom.us/j/1234567890"
                />
                {formData.zoom_link && <CopyButton text={formData.zoom_link} label="Zoom Link" />}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Enter a valid URL (e.g., https://zoom.us/j/1234567890) if you want to pre-fill it.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSession} disabled={isPending}>
              {isPending ? "Updating..." : "Update Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

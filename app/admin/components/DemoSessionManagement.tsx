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
import { Calendar, Plus, Edit, Trash2, Users, Eye } from "lucide-react";
import { toast } from "sonner";
import type { DemoSession, CreateDemoSession, UpdateDemoSession } from "../api/fetchDemoSessions";
import {
  createDemoSessionAction,
  updateDemoSessionAction,
  type CreateDemoSessionData,
  type UpdateDemoSessionData,
} from "../demo-sessions/actions";

interface DemoSessionManagementProps {
  initialSessions: DemoSession[];
  onSessionSelect: (session: DemoSession) => void;
}

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
    max_scheduled: 8,
  });

  const resetForm = () => {
    setFormData({
      session_date: "",
      max_scheduled: 8,
    });
  };

  const handleCreateSession = () => {
    if (!formData.session_date) {
      toast.error("Please select a session date");
      return;
    }

    startTransition(async () => {
      const result = await createDemoSessionAction({
        session_date: formData.session_date,
        max_scheduled: formData.max_scheduled,
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

    startTransition(async () => {
      const result = await updateDemoSessionAction(editingSession.id, {
        session_date: formData.session_date,
        max_scheduled: formData.max_scheduled,
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
      max_scheduled: session.max_scheduled,
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
    const date = new Date(dateString);
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
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signups</TableHead>
                  <TableHead>Max Capacity</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {formatDate(session.session_date)}
                    </TableCell>
                    <TableCell>{getSessionStatus(session)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{session.signup_count}</span>
                      </div>
                    </TableCell>
                    <TableCell>{session.max_scheduled}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSessionSelect(session)}
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
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Demo Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="session_date">Session Date</Label>
              <Input
                id="session_date"
                type="date"
                value={formData.session_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, session_date: e.target.value }))}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Demo Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_session_date">Session Date</Label>
              <Input
                id="edit_session_date"
                type="date"
                value={formData.session_date}
                onChange={(e) => setFormData((prev) => ({ ...prev, session_date: e.target.value }))}
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

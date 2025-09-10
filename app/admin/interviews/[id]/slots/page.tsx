"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { makeUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Plus, ArrowLeft, Clock, Calendar, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import type {
  InterviewSessionRead,
  InterviewSlotRead,
  InterviewSlotCreate,
  InterviewSlotUpdate,
} from "@/app/admin/components/types";

export default function InterviewSlotsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const sessionId = parseInt(params.id as string);

  const [session, setSession] = useState<InterviewSessionRead | null>(null);
  const [slots, setSlots] = useState<InterviewSlotRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlotRead | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      router.replace("/dashboard?error=unauthorized_admin_page");
      return;
    }

    if (isAuthenticated && user?.role === "admin" && sessionId) {
      fetchSession();
      fetchSlots();
    }
  }, [authLoading, isAuthenticated, user, router, sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(
        makeUrl("adminInterviewSessionById", { session_id: sessionId }),
        {
          method: "GET",
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
      if (data.success && data.data) {
        setSession(data.data);
      }
    } catch (error) {
      console.error("Error fetching interview session:", error);
      toast.error("Failed to fetch interview session");
    }
  };

  const fetchSlots = async () => {
    try {
      const response = await fetch(
        makeUrl("adminInterviewSessionSlots", { session_id: sessionId }),
        {
          method: "GET",
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
      if (data.success && data.data) {
        setSlots(data.data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching interview slots:", error);
      toast.error("Failed to fetch interview slots");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSlot = async (slotData: InterviewSlotCreate) => {
    try {
      const response = await fetch(
        makeUrl("adminInterviewSessionSlots", { session_id: sessionId }),
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(slotData),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview slot created successfully");
        setIsCreateDialogOpen(false);
        fetchSlots();
      } else {
        throw new Error(data.message || "Failed to create slot");
      }
    } catch (error) {
      console.error("Error creating interview slot:", error);
      toast.error("Failed to create interview slot");
    }
  };

  const handleUpdateSlot = async (slotId: number, slotData: InterviewSlotUpdate) => {
    try {
      const response = await fetch(makeUrl("adminInterviewSlotById", { slot_id: slotId }), {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(slotData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview slot updated successfully");
        setIsEditDialogOpen(false);
        setSelectedSlot(null);
        fetchSlots();
      } else {
        throw new Error(data.message || "Failed to update slot");
      }
    } catch (error) {
      console.error("Error updating interview slot:", error);
      toast.error("Failed to update interview slot");
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!confirm("Are you sure you want to delete this interview slot?")) {
      return;
    }

    try {
      const response = await fetch(makeUrl("adminInterviewSlotById", { slot_id: slotId }), {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview slot deleted successfully");
        fetchSlots();
      } else {
        throw new Error(data.message || "Failed to delete slot");
      }
    } catch (error) {
      console.error("Error deleting interview slot:", error);
      toast.error("Failed to delete interview slot");
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const availableSlots = slots.filter((slot) => slot.is_available).length;
  const bookedSlots = slots.filter((slot) => !slot.is_available).length;

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Interview Slots</h1>
            <p className="text-muted-foreground">Loading interview slots...</p>
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
            <h1 className="text-3xl font-bold tracking-tight">Interview Slots</h1>
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
            <h1 className="text-3xl font-bold tracking-tight">Interview Slots</h1>
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
          <div className="flex items-center gap-4 mb-4">
            <Button variant="outline" size="sm" onClick={() => router.push("/admin/interviews")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {session?.name || "Interview Slots"}
              </h1>
              <p className="text-muted-foreground">
                {session?.description || "Manage time slots for this interview session"}
              </p>
              {session?.interviewer && (
                <p className="text-sm text-muted-foreground mt-1">
                  Interviewer: {session.interviewer}
                </p>
              )}
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Interview Slot</DialogTitle>
                  <DialogDescription>
                    Add a new time slot to this interview session.
                  </DialogDescription>
                </DialogHeader>
                <CreateSlotForm onSubmit={handleCreateSlot} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slots.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{availableSlots}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Booked</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{bookedSlots}</div>
            </CardContent>
          </Card>
        </div>

        {/* Slots Table */}
        <Card>
          <CardHeader>
            <CardTitle>Interview Slots</CardTitle>
            <CardDescription>Manage time slots for this interview session</CardDescription>
          </CardHeader>
          <CardContent>
            {slots.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No interview slots found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first interview slot to get started.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Scheduled Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Interviewee</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slots.map((slot) => (
                    <TableRow key={slot.id}>
                      <TableCell>
                        <div className="font-medium">{formatDateTime(slot.scheduled_at)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={slot.is_available ? "default" : "secondary"}>
                          {slot.is_available ? "Available" : "Booked"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(slot.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {slot.student_name || (slot.is_available ? "Available" : "Not specified")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id)}
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Interview Slot</DialogTitle>
              <DialogDescription>Update the interview slot details.</DialogDescription>
            </DialogHeader>
            {selectedSlot && (
              <EditSlotForm
                slot={selectedSlot}
                onSubmit={(data) => handleUpdateSlot(selectedSlot.id, data)}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// Create Slot Form Component
function CreateSlotForm({ onSubmit }: { onSubmit: (data: InterviewSlotCreate) => void }) {
  const [formData, setFormData] = useState<InterviewSlotCreate>({
    session_id: 0, // Will be set by parent
    scheduled_at: "",
    is_available: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="scheduled_at">Scheduled Time *</Label>
        <Input
          id="scheduled_at"
          type="datetime-local"
          value={formData.scheduled_at}
          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label htmlFor="is_available">Available for booking</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Create Slot</Button>
      </div>
    </form>
  );
}

// Edit Slot Form Component
function EditSlotForm({
  slot,
  onSubmit,
}: {
  slot: InterviewSlotRead;
  onSubmit: (data: InterviewSlotUpdate) => void;
}) {
  const [formData, setFormData] = useState<InterviewSlotUpdate>({
    scheduled_at: new Date(slot.scheduled_at).toISOString().slice(0, 16),
    is_available: slot.is_available,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="scheduled_at">Scheduled Time *</Label>
        <Input
          id="scheduled_at"
          type="datetime-local"
          value={formData.scheduled_at}
          onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
          required
        />
      </div>
      <div className="flex items-center space-x-2">
        <Switch
          id="is_available"
          checked={formData.is_available}
          onCheckedChange={(checked) => setFormData({ ...formData, is_available: checked })}
        />
        <Label htmlFor="is_available">Available for booking</Label>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit">Update Slot</Button>
      </div>
    </form>
  );
}

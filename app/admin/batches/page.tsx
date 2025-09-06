"use client";

import { useEffect, useState } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import Link from "next/link";
import { Copy, Plus, Edit } from "lucide-react";
import type { BatchRead } from "../components/types";
import { makeUrl } from "@/lib/utils";
import BatchEditDialog from "./components/BatchEditDialog";

export default function ExistingBatchesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<BatchRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newlyCreatedBatchInfo, setNewlyCreatedBatchInfo] = useState<{
    id: string;
    name: string;
    registrationKey: string;
  } | null>(null);

  // Edit dialog state
  const [editingBatch, setEditingBatch] = useState<BatchRead | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }
    if (!authLoading && isAuthenticated && user?.role !== "admin" && user?.role !== "instructor") {
      toast.error("You are not authorized to view this page.");
      router.replace("/dashboard?error=unauthorized_admin_page");
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const newBatchId = urlParams.get("newBatchId");
      const batchName = urlParams.get("batchName");
      const regKey = urlParams.get("regKey");
      if (newBatchId && batchName && regKey) {
        setNewlyCreatedBatchInfo({
          id: newBatchId,
          name: batchName,
          registrationKey: regKey,
        });
      }
    }
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(makeUrl("batches"), {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch batches");
        }

        const data = await response.json();
        setBatches(data);
      } catch (error) {
        console.error("Error fetching batches:", error);
        toast.error("Failed to load batches");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchBatches();
    }
  }, [isAuthenticated, user]);

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Registration key copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleEditBatch = (batch: BatchRead) => {
    setEditingBatch(batch);
    setIsEditDialogOpen(true);
  };

  const handleBatchUpdate = (updatedBatch: BatchRead) => {
    setBatches((prev) =>
      prev.map((batch) => (batch.id === updatedBatch.id ? updatedBatch : batch)),
    );
    setEditingBatch(null);
    setIsEditDialogOpen(false);
  };

  const handleCloseEditDialog = () => {
    setEditingBatch(null);
    setIsEditDialogOpen(false);
  };

  // Filter batches based on search term and status
  const filteredBatches = batches.filter((batch) => {
    const matchesSearch = batch.name.toLowerCase().includes(searchTerm.toLowerCase());
    // (batch.description && batch.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && batch.registration_key_active) ||
      (statusFilter === "inactive" && !batch.registration_key_active);

    return matchesSearch && matchesStatus;
  });

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "instructor")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Existing Batches</h1>
          <p className="text-lg text-muted-foreground">Manage and view all batches in the system</p>
        </div>
        <Link href="/admin/batches/newBatch">
          <Button className="flex items-center space-x-2 shadow-sm hover:shadow-md transition-all duration-200">
            <Plus className="h-4 w-4" />
            <span>Create New Batch</span>
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Batches</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Newly Created Batch Success Message */}
      {newlyCreatedBatchInfo && (
        <Card className="border-green-200/50 bg-gradient-to-br from-green-50 to-green-100/50 shadow-lg">
          <CardContent className="pt-8 pb-6">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-green-800">
                  ✅ Batch "{newlyCreatedBatchInfo.name}" created successfully!
                </h3>
                <p className="text-base text-green-700/90">
                  Registration Key:{" "}
                  <code className="bg-white px-3 py-2 rounded-md text-sm font-mono border border-green-300 shadow-sm">
                    {newlyCreatedBatchInfo.registrationKey}
                  </code>
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNewlyCreatedBatchInfo(null)}
                className="text-green-600 hover:text-green-800 hover:bg-green-50 transition-colors"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-foreground">All Batches</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            List of all batches in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p>Loading batches...</p>
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                {batches.length === 0
                  ? "No batches found."
                  : "No batches match the current filters."}
              </p>
              {batches.length === 0 ? (
                <Link href="/admin/batches/newBatch">
                  <Button>Create Your First Batch</Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/50">
                  <TableHead className="font-medium text-muted-foreground">ID</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Name</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Slack Channel</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Start Date</TableHead>
                  <TableHead className="font-medium text-muted-foreground">End Date</TableHead>
                  <TableHead className="font-medium text-muted-foreground">
                    Registration Key
                  </TableHead>
                  <TableHead className="font-medium text-muted-foreground">Active</TableHead>
                  <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBatches.map((batch) => (
                  <TableRow key={batch.id} className="hover:bg-muted/30 transition-colors">
                    <TableCell>{batch.id}</TableCell>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.slack_channel}</TableCell>
                    <TableCell>{new Date(batch.start_date).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(batch.end_date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Input
                          type="text"
                          readOnly
                          value={batch.registration_key}
                          className="font-mono text-xs p-1 h-auto"
                          size={10}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyToClipboard(batch.registration_key)}
                          className="h-6 w-6"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          batch.registration_key_active
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {batch.registration_key_active ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBatch(batch)}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
        {batches.length > 0 && (
          <CardFooter className="text-sm text-muted-foreground">
            Total batches: {batches.length}
          </CardFooter>
        )}
      </Card>

      {/* Batch Edit Dialog */}
      <BatchEditDialog
        batch={editingBatch}
        isOpen={isEditDialogOpen}
        onClose={handleCloseEditDialog}
        onSave={handleBatchUpdate}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { getBaseUrl } from "@/lib/utils";
import Link from "next/link";
import { Copy } from "lucide-react";

// Define BatchRead type locally based on openapi.json / backend docs
// TODO: Centralize this type
interface BatchRead {
  id: number;
  name: string;
  slack_channel: string;
  start_date: string;
  end_date: string;
  curriculum?: string | null;
  registration_key: string;
  registration_key_active: boolean;
}

interface NewlyCreatedBatchInfo {
  id: string;
  name: string;
  registrationKey: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [batches, setBatches] = useState<BatchRead[]>([]);
  const [isLoadingBatches, setIsLoadingBatches] = useState(true);
  const [newlyCreatedBatchInfo, setNewlyCreatedBatchInfo] =
    useState<NewlyCreatedBatchInfo | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated_admin");
      return;
    }
    if (
      !authLoading &&
      isAuthenticated &&
      user?.role !== "admin" &&
      user?.role !== "instructor"
    ) {
      toast.error("You are not authorized to view this page.");
      router.replace("/dashboard?error=unauthorized_admin_page");
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const newBatchId = searchParams.get("newBatchId");
    const batchName = searchParams.get("batchName");
    const regKey = searchParams.get("regKey");

    if (newBatchId && batchName && regKey) {
      setNewlyCreatedBatchInfo({
        id: newBatchId,
        name: batchName,
        registrationKey: regKey,
      });
      // Optional: Clear query params after reading them
      // router.replace('/admin', undefined); // Next.js 13 way to clear params without scroll issues
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (
      isAuthenticated &&
      (user?.role === "admin" || user?.role === "instructor")
    ) {
      const fetchBatches = async () => {
        setIsLoadingBatches(true);
        try {
          const backendUrl = getBaseUrl();
          const response = await fetch(`${backendUrl}/batches/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          });

          const result = await response.json();
          if (!result) {
            const errorData = await response.json().catch(() => ({}));
            toast.error(
              errorData.detail ||
                errorData.message ||
                "Failed to fetch batches."
            );
            throw new Error("Failed to fetch batches");
          }
          setBatches(result as BatchRead[]);
        } catch (error) {
          console.error("Error fetching batches:", error);
          // Toast error already handled for known API errors
        } finally {
          setIsLoadingBatches(false);
        }
      };
      fetchBatches();
    }
  }, [isAuthenticated, user]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Registration key copied to clipboard!");
  };

  if (authLoading || isLoadingBatches) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "instructor")
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Link href="/admin/batches" passHref>
          <Button>Create New Batch</Button>
        </Link>
      </div>

      {newlyCreatedBatchInfo && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              Batch &apos;{newlyCreatedBatchInfo.name}&apos; Created
              Successfully!
            </CardTitle>
            <CardDescription className="text-green-700">
              Use the registration key below to enroll students in this new
              batch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">
                Registration Key:
              </p>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={newlyCreatedBatchInfo.registrationKey}
                  className="bg-white text-green-900 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopyToClipboard(newlyCreatedBatchInfo.registrationKey)
                  }
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Existing Batches</CardTitle>
          <CardDescription>List of all batches in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {batches.length === 0 && !isLoadingBatches ? (
            <p>
              No batches found.{" "}
              <Link
                href="/admin/batches"
                className="text-blue-600 hover:underline"
              >
                Create one now
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Slack Channel</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Registration Key</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>{batch.id}</TableCell>
                    <TableCell className="font-medium">{batch.name}</TableCell>
                    <TableCell>{batch.slack_channel}</TableCell>
                    <TableCell>
                      {new Date(batch.start_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(batch.end_date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Input
                          type="text"
                          readOnly
                          value={batch.registration_key}
                          className="font-mono text-xs p-1 h-auto"
                          size={10} // Keep input small
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleCopyToClipboard(batch.registration_key)
                          }
                          className="h-6 w-6" // smaller button
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {batch.registration_key_active ? "Yes" : "No"}
                    </TableCell>
                    <TableCell>
                      {/* Placeholder for future actions like Edit/Delete */}
                      <Button variant="outline" size="sm" disabled>
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
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import { Copy, Search, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import DashboardStats from "./DashboardStats";
import UserEditDialog from "./UserEditDialog";
import type {
  DashboardStats as DashboardStatsType,
  UserOverview,
  BatchRead,
  NewlyCreatedBatchInfo,
  CertificateRead,
  DemoRead,
} from "./types";
import "./admin-print.css";
import { useAuth } from "@/lib/auth-context";
import { makeUrl } from "@/lib/utils";
import { fetchBatchStudents } from "../api/fetchBatchStudents";

interface AdminDashboardContentsProps {
  stats: DashboardStatsType;
  users: {
    users: UserOverview[];
    total_count: number;
    page?: number;
    page_size?: number;
  };
  batches: BatchRead[];
}

export default function AdminDashboardContents({
  stats,
  users,
  batches,
}: AdminDashboardContentsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  // State for user management
  const [userList, setUserList] = useState<UserOverview[]>(users.users);
  const [usersTotal, setUsersTotal] = useState(users.total_count);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [isLoadingBatch, setIsLoadingBatch] = useState(false);

  // State for modals
  const [editingUser, setEditingUser] = useState<UserOverview | null>(null);
  const [isUserEditDialogOpen, setIsUserEditDialogOpen] = useState(false);

  // Legacy state for existing batch functionality
  const [legacyBatches, setLegacyBatches] = useState<BatchRead[]>(batches);
  const [isLoadingLegacyBatches] = useState(false);
  const [newlyCreatedBatchInfo, setNewlyCreatedBatchInfo] = useState<NewlyCreatedBatchInfo | null>(
    null,
  );

  // Add state for student profile modal
  const [studentProfile, setStudentProfile] = useState<UserOverview["student_detail"] | null>(null);

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
    }
  }, [searchParams]);

  // Filtering and pagination (client-side for now)
  useEffect(() => {
    let filtered = users.users;
    if (searchTerm) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }
    // Batch filter (client-side fallback)
    if (batchFilter !== "all") {
      filtered = filtered.filter(
        (u) =>
          u.student_detail &&
          u.student_detail.batch &&
          String(u.student_detail.batch.id) === batchFilter,
      );
    }
    setUsersTotal(filtered.length);
    setUserList(filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize));
  }, [searchTerm, roleFilter, batchFilter, users.users, currentPage, pageSize]);

  // Fetch users for selected batch (server-side for all, client-side for batch)
  useEffect(() => {
    if (batchFilter === "all") {
      setUserList(users.users);
      setUsersTotal(users.total_count);
      return;
    }
    setIsLoadingBatch(true);
    fetchBatchStudents(batchFilter)
      .then((batchUsers) => {
        if (batchUsers) {
          // Apply role and search filter to batch users
          let filtered = batchUsers;
          if (searchTerm) {
            filtered = filtered.filter(
              (u) =>
                u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(searchTerm.toLowerCase()),
            );
          }
          if (roleFilter !== "all") {
            filtered = filtered.filter((u) => u.role === roleFilter);
          }
          setUserList(filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize));
          setUsersTotal(filtered.length);
        }
      })
      .finally(() => setIsLoadingBatch(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchFilter]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Registration key copied to clipboard!");
  };

  const handleUserEdit = (user: UserOverview) => {
    setEditingUser(user);
    setIsUserEditDialogOpen(true);
  };

  const handleUserUpdate = async (updated: {
    name: string;
    email: string;
    role: string;
    batchId: number | null;
    disabled: boolean;
  }) => {
    if (!editingUser || !editingUser.student_detail) return;
    try {
      const studentId = editingUser.student_detail.id;
      const url = makeUrl("adminStudentById", { student_id: studentId });
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ batch_id: updated.batchId }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        const errorMessage = result.message || result.error || "Failed to update student batch.";
        toast.error(errorMessage);
        return;
      }
      toast.success(result.message || "Student batch updated successfully.");
      setIsUserEditDialogOpen(false);
      setEditingUser(null);
      // Optionally refetch or update userList here
    } catch (error) {
      console.error("Error updating student batch:", error);
      toast.error("Failed to update student batch");
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "instructor":
        return "bg-orange-100 text-orange-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const totalPages = Math.ceil(usersTotal / pageSize);

  useEffect(() => {
    if (studentProfile) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [studentProfile]);

  return (
    <div className="container mx-auto p-4 py-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Link href="/admin/batches" passHref>
            <Button>Create New Batch</Button>
          </Link>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>
      <DashboardStats stats={stats} />
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <Input
          placeholder="Search users by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64"
        />
        <select
          className="border rounded px-2 py-1"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="instructor">Instructor</option>
          <option value="student">Student</option>
        </select>
        <select
          className="border rounded px-2 py-1"
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
        >
          <option value="all">All Batches</option>
          {batches.map((batch) => (
            <option key={batch.id} value={String(batch.id)}>
              {batch.name}
            </option>
          ))}
        </select>
        {isLoadingBatch && (
          <span className="ml-2 text-sm text-gray-500">Loading batch users...</span>
        )}
      </div>
      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users, roles, and permissions.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Users Table */}
          {isLoadingUsers ? (
            <div className="text-center py-10">Loading users...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>WakaTime</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userList.map((user) => (
                    <TableRow
                      key={user.id}
                      className="cursor-pointer hover:bg-muted"
                      onClick={() => {
                        if (user.role === "student" && user.student_detail) {
                          setStudentProfile(user.student_detail);
                        }
                      }}
                    >
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                      </TableCell>
                      <TableCell>{user.student_detail?.batch?.name || "N/A"}</TableCell>
                      <TableCell>
                        {user.wakatime_connected ? (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-green-600">
                              Connected
                            </Badge>
                            {user.student_detail?.wakatime_stats && (
                              <span className="text-sm text-muted-foreground">
                                {user.student_detail.wakatime_stats.text}
                              </span>
                            )}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            Not Connected
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.disabled ? "destructive" : "secondary"}>
                          {user.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (user.role === "student" && user.student_detail) {
                              handleUserEdit(user);
                            }
                          }}
                          disabled={user.role !== "student" || !user.student_detail}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Pagination */}
              <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, usersTotal)} of {usersTotal} users
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {/* Legacy batch creation success message */}
      {newlyCreatedBatchInfo && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">
              Batch &apos;{newlyCreatedBatchInfo.name}&apos; Created Successfully!
            </CardTitle>
            <CardDescription className="text-green-700">
              Use the registration key below to enroll students in this new batch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div>
              <p className="text-sm font-semibold text-green-800 mb-1">Registration Key:</p>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={newlyCreatedBatchInfo.registrationKey}
                  className="bg-white text-green-900 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(newlyCreatedBatchInfo.registrationKey)}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Legacy Existing Batches */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Batches</CardTitle>
          <CardDescription>List of all batches in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {legacyBatches.length === 0 && !isLoadingLegacyBatches ? (
            <p>
              No batches found.{" "}
              <Link href="/admin/batches" className="text-blue-600 hover:underline">
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
                {legacyBatches.map((batch) => (
                  <TableRow key={batch.id}>
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
                    <TableCell>{batch.registration_key_active ? "Yes" : "No"}</TableCell>
                    <TableCell>
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
        {legacyBatches.length > 0 && (
          <CardFooter className="text-sm text-muted-foreground">
            Total batches: {legacyBatches.length}
          </CardFooter>
        )}
      </Card>
      {/* User Edit Dialog */}
      <UserEditDialog
        user={editingUser}
        batches={legacyBatches}
        open={isUserEditDialogOpen}
        onOpenChange={setIsUserEditDialogOpen}
        onSave={handleUserUpdate}
      />
      {/* Student Profile Dialog */}
      <Dialog
        open={!!studentProfile}
        onOpenChange={(open) => {
          if (!open) setStudentProfile(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Student Profile</DialogTitle>
          </DialogHeader>
          {studentProfile && (
            <div className="space-y-6">
              {/* Top Section: Name, Email, Role, Status, Batch */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold">{studentProfile.user.name}</h2>
                  <div className="text-muted-foreground">{studentProfile.user.email}</div>
                  {studentProfile.batch && (
                    <div className="text-muted-foreground">Batch: {studentProfile.batch.name}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className="capitalize">{studentProfile.user.role}</Badge>
                  <Badge variant={studentProfile.user.disabled ? "destructive" : "secondary"}>
                    {studentProfile.user.disabled ? "Disabled" : "Active"}
                  </Badge>
                </div>
              </div>
              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentProfile.project ? (
                      <>
                        <div className="font-semibold">{studentProfile.project.name}</div>
                        <div className="text-xs mt-2">
                          {studentProfile.project.start_date && (
                            <>
                              Start: {studentProfile.project.start_date}
                              <br />
                            </>
                          )}
                          {studentProfile.project.end_date && (
                            <>End: {studentProfile.project.end_date}</>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-muted-foreground">No project assigned</div>
                    )}
                  </CardContent>
                </Card>
                {/* WakaTime Stats */}
                {studentProfile.wakatime_stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>7 Days Average Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        <div>
                          <span className="font-semibold">Total Time:</span>{" "}
                          {studentProfile.wakatime_stats.text ||
                            studentProfile.wakatime_stats.digital}
                        </div>
                        <div>
                          <span className="font-semibold">Hours:</span>{" "}
                          {studentProfile.wakatime_stats.hours}
                        </div>
                        <div>
                          <span className="font-semibold">Last Updated:</span>{" "}
                          {studentProfile.wakatime_stats.last_updated
                            ? new Date(studentProfile.wakatime_stats.last_updated).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              {/* Certificates Section as Table */}
              <div>
                <h3 className="font-semibold mb-2">Certificates</h3>
                {studentProfile.certificates.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Issuer</TableHead>
                        <TableHead>Date Issued</TableHead>
                        <TableHead>Date Expired</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentProfile.certificates.map((cert: CertificateRead) => (
                        <TableRow key={cert.id}>
                          <TableCell>{cert.name}</TableCell>
                          <TableCell>{cert.issuer}</TableCell>
                          <TableCell>{cert.date_issued}</TableCell>
                          <TableCell>{cert.date_expired || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-muted-foreground">No certificates</div>
                )}
              </div>
              {/* Demos Section as Table */}
              <div>
                <h3 className="font-semibold mb-2">Demos</h3>
                {studentProfile.demos.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Demo URL</TableHead>
                        <TableHead>GitHub</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentProfile.demos.map((demo: DemoRead) => (
                        <TableRow key={demo.id}>
                          <TableCell>{demo.title}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {demo.description || "—"}
                          </TableCell>
                          <TableCell>
                            {demo.demo_url ? (
                              <a
                                href={demo.demo_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                Link
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell>
                            {demo.github_url ? (
                              <a
                                href={demo.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                GitHub
                              </a>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-muted-foreground">No demos</div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setStudentProfile(null)} type="button" className="no-print">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

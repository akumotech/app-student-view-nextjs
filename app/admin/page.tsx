"use client";

import { useEffect, useState, Suspense } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";
import Link from "next/link";
import {
  Copy,
  Users,
  GraduationCap,
  Calendar,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";
import type { CertificateRead, DemoRead } from "@/lib/dashboard-types";
import "./admin-print.css";

// Enhanced types based on API documentation
interface DashboardStats {
  total_users: number;
  total_students: number;
  total_instructors: number;
  total_admins: number;
  active_batches: number;
  total_certificates: number;
  total_demos: number;
  users_with_wakatime: number;
}

interface UserOverview {
  id: number;
  email: string;
  name: string;
  role: "student" | "instructor" | "admin" | "user";
  disabled: boolean;
  wakatime_connected: boolean;
  student_detail?: {
    id: number;
    user: {
      id: number;
      email: string;
      name: string;
      role: string;
      disabled: boolean;
    };
    batch?: {
      id: number;
      name: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      slack_channel?: string;
      curriculum?: string | null;
    };
    project?: {
      id: number;
      name: string;
      start_date?: string;
      end_date?: string;
    };
    certificates: CertificateRead[];
    demos: DemoRead[];
    wakatime_stats?: {
      hours: number;
      digital: string;
      text: string;
    };
  };
}

// Legacy batch interface for existing functionality
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

// This new component will contain the original logic
function AdminDashboardContents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  // State for dashboard stats
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // State for user management
  const [users, setUsers] = useState<UserOverview[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // State for modals
  const [editingUser, setEditingUser] = useState<UserOverview | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");

  // Legacy state for existing batch functionality
  const [legacyBatches, setLegacyBatches] = useState<BatchRead[]>([]);
  const [isLoadingLegacyBatches, setIsLoadingLegacyBatches] = useState(true);
  const [newlyCreatedBatchInfo, setNewlyCreatedBatchInfo] =
    useState<NewlyCreatedBatchInfo | null>(null);

  // Add state for student profile modal
  const [studentProfile, setStudentProfile] = useState<
    UserOverview["student_detail"] | null
  >(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log("Admin page: Redirecting to login - user not authenticated");
      router.replace("/login?error=unauthenticated_admin");
      return;
    }
    if (
      !authLoading &&
      isAuthenticated &&
      user?.role !== "admin" &&
      user?.role !== "instructor"
    ) {
      console.log(
        "Admin page: Access denied - insufficient permissions",
        user?.role
      );
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
    }
  }, [searchParams, router]);

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setIsLoadingStats(true);
      const response = await fetch(makeUrl("adminStats"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const result = await response.json();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
      toast.error("Failed to load dashboard stats");
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Fetch users with pagination and filtering
  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);
      const url = makeUrl("adminUsers") + "?" + params.toString();
      const response = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const result = await response.json();
      if (result.success) {
        setUsers(result.data.users);
        setUsersTotal(result.data.total_count);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Legacy fetch batches function
  const fetchLegacyBatches = async () => {
    try {
      setIsLoadingLegacyBatches(true);
      const response = await fetch(makeUrl("batches"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const result = await response.json();
      if (result) {
        setLegacyBatches(result as BatchRead[]);
      }
    } catch (error) {
      console.error("Error fetching legacy batches:", error);
    } finally {
      setIsLoadingLegacyBatches(false);
    }
  };

  // Update user role
  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(
        makeUrl("adminUserRole", { user_id: userId }),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      toast.success("User role updated successfully");
      fetchUsers(); // Refresh the user list
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  useEffect(() => {
    if (
      isAuthenticated &&
      (user?.role === "admin" || user?.role === "instructor")
    ) {
      fetchStats();
      fetchUsers();
      fetchLegacyBatches();
    }
  }, [isAuthenticated, user, currentPage, searchTerm, roleFilter]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        isAuthenticated &&
        (user?.role === "admin" || user?.role === "instructor")
      ) {
        setCurrentPage(1); // Reset to first page when searching
        fetchUsers();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Registration key copied to clipboard!");
  };

  const handleRoleEdit = (user: UserOverview) => {
    setEditingUser(user);
    setNewRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (editingUser && newRole) {
      await updateUserRole(editingUser.id, newRole);
      setIsRoleDialogOpen(false);
      setEditingUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Failed to logout. Please try again.");
    }
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

  // Add effect to set modal-open class on body when modal is open
  useEffect(() => {
    if (studentProfile) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    // Clean up on unmount
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [studentProfile]);

  if (authLoading || isLoadingStats) {
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
        <div className="flex items-center gap-4">
          <Link href="/admin/batches" passHref>
            <Button>Create New Batch</Button>
          </Link>
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_students}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Batches
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active_batches}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                WakaTime Connected
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.users_with_wakatime}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage users, roles, and permissions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="admin">Admins</option>
              <option value="user">Users</option>
            </select>
          </div>

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
                  {users.map((user) => (
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
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.student_detail?.batch?.name || "N/A"}
                      </TableCell>
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
                        <Badge
                          variant={user.disabled ? "destructive" : "secondary"}
                        >
                          {user.disabled ? "Disabled" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRoleEdit(user);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit Role
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
                  {Math.min(currentPage * pageSize, usersTotal)} of {usersTotal}{" "}
                  users
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
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
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
                {legacyBatches.map((batch) => (
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
                          size={10}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleCopyToClipboard(batch.registration_key)
                          }
                          className="h-6 w-6"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {batch.registration_key_active ? "Yes" : "No"}
                    </TableCell>
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

      {/* Role Edit Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
            <DialogDescription>
              Change the role for {editingUser?.name} ({editingUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="user">User</option>
              <option value="student">Student</option>
              <option value="instructor">Instructor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRoleUpdate}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <h2 className="text-2xl font-bold">
                    {studentProfile.user.name}
                  </h2>
                  <div className="text-muted-foreground">
                    {studentProfile.user.email}
                  </div>
                  {studentProfile.batch && (
                    <div className="text-muted-foreground">
                      Batch: {studentProfile.batch.name}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Badge className="capitalize">
                    {studentProfile.user.role}
                  </Badge>
                  <Badge
                    variant={
                      studentProfile.user.disabled ? "destructive" : "secondary"
                    }
                  >
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
                        <div className="font-semibold">
                          {studentProfile.project.name}
                        </div>
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
                      <div className="text-muted-foreground">
                        No project assigned
                      </div>
                    )}
                  </CardContent>
                </Card>
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
                      {studentProfile.certificates.map(
                        (cert: CertificateRead) => (
                          <TableRow key={cert.id}>
                            <TableCell>{cert.name}</TableCell>
                            <TableCell>{cert.issuer}</TableCell>
                            <TableCell>{cert.date_issued}</TableCell>
                            <TableCell>{cert.date_expired || "—"}</TableCell>
                          </TableRow>
                        )
                      )}
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
            <Button
              onClick={() => setStudentProfile(null)}
              type="button"
              className="no-print"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// The default export page component will now wrap AdminDashboardContents in Suspense
export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading admin page...</p>
        </div>
      }
    >
      <AdminDashboardContents />
    </Suspense>
  );
}

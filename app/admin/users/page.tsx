"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { UserOverview } from "../components/types";
import { makeUrl } from "@/lib/utils";
import { fetchBatchStudents } from "../api/fetchBatchStudents";
import { fetchUsers } from "../api/fetchUsers";
import UserEditDialog from "../components/UserEditDialog";
import StudentProfileDialog from "../components/StudentProfileDialog";

export default function UsersManagementPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [userList, setUserList] = useState<UserOverview[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [editingUser, setEditingUser] = useState<UserOverview | null>(null);
  const [isUserEditDialogOpen, setIsUserEditDialogOpen] = useState(false);
  const [studentProfile, setStudentProfile] = useState<UserOverview["student_detail"] | null>(null);
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }
    if (!authLoading && isAuthenticated && user?.role !== "admin") {
      toast.error("You are not authorized to view this page.");
      router.replace("/dashboard?error=unauthorized_admin_page");
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch batches for filtering
  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const response = await fetch(makeUrl("batches"), {
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
        }
      } catch (error) {
        console.error("Error fetching batches:", error);
      }
    };

    if (isAuthenticated && user?.role === "admin") {
      fetchBatches();
    }
  }, [isAuthenticated, user]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page when search changes
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [roleFilter, batchFilter]);

  // Fetch users with server-side pagination and filtering
  const loadUsers = async () => {
    if (!isAuthenticated || user?.role !== "admin") return;

    setIsLoadingUsers(true);
    try {
      // For batch filtering, use the existing fetchBatchStudents function
      if (batchFilter !== "all") {
        const batchUsers = await fetchBatchStudents(batchFilter);
        if (batchUsers) {
          // Apply client-side search and role filtering for batch-specific users
          let filtered = batchUsers;
          if (debouncedSearchTerm) {
            filtered = filtered.filter(
              (u) =>
                u.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
            );
          }
          if (roleFilter !== "all") {
            filtered = filtered.filter((u) => u.role === roleFilter);
          }

          // Apply client-side pagination for batch users
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          const paginatedUsers = filtered.slice(startIndex, endIndex);

          setUserList(paginatedUsers);
          setUsersTotal(filtered.length);
        } else {
          setUserList([]);
          setUsersTotal(0);
        }
      } else {
        // Use server-side pagination for all users
        const result = await fetchUsers({
          page: currentPage,
          pageSize,
          role: roleFilter !== "all" ? roleFilter : undefined,
          search: debouncedSearchTerm || undefined,
        });

        if (result) {
          setUserList(result.users);
          setUsersTotal(result.totalCount);
        } else {
          toast.error("Failed to load users");
          setUserList([]);
          setUsersTotal(0);
        }
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      setUserList([]);
      setUsersTotal(0);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load users when filters or pagination changes
  useEffect(() => {
    loadUsers();
  }, [isAuthenticated, user, currentPage, roleFilter, batchFilter, debouncedSearchTerm]);

  const totalPages = Math.ceil(usersTotal / pageSize);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "instructor":
        return "bg-blue-100 text-blue-800";
      case "student":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">User Management</h1>
        <p className="text-lg text-muted-foreground">Manage users, roles, and permissions</p>
      </div>

      {/* Filters */}
      <Card className="border-border/50 shadow-sm">
        <CardContent className="pt-8 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="all">All Batches</option>
                {batches.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setBatchFilter("all");
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-xl font-semibold text-foreground">Users</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Manage all users in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <div className="text-center py-10">Loading users...</div>
          ) : !Array.isArray(userList) || userList.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                {!Array.isArray(userList)
                  ? "Failed to load users. Please check the console for errors."
                  : "No users found."}
              </p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          ) : userList.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">No users match the current filters.</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setRoleFilter("all");
                  setBatchFilter("all");
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-muted/50">
                    <TableHead className="font-medium text-muted-foreground">Name</TableHead>
                    <TableHead className="font-medium text-muted-foreground">Email</TableHead>
                    <TableHead className="font-medium text-muted-foreground">Role</TableHead>
                    <TableHead className="font-medium text-muted-foreground">Batch</TableHead>
                    <TableHead className="font-medium text-muted-foreground">WakaTime</TableHead>
                    <TableHead className="font-medium text-muted-foreground">Status</TableHead>
                    <TableHead className="font-medium text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.isArray(userList) &&
                    userList.map((user) => (
                      <TableRow
                        key={user.id}
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
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

      {/* User Edit Dialog */}
      <UserEditDialog
        user={editingUser}
        batches={batches}
        open={isUserEditDialogOpen}
        onOpenChange={setIsUserEditDialogOpen}
        onSave={handleUserUpdate}
      />

      {/* Student Profile Dialog */}
      <StudentProfileDialog
        isOpen={!!studentProfile}
        onClose={() => setStudentProfile(null)}
        studentProfile={studentProfile}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, BookOpen, Phone } from "lucide-react";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";
import { MainNav } from "@/components/dashboard-navbar";

interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone_number: string | null;
  role: string;
  disabled: boolean | null;
  student_id: number | null;
  wakatime_access_token_encrypted: string | null;
}

interface StudentInfo {
  id: number;
  user_id: number;
  batch_id: number;
  project_id: number | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone_number: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(makeUrl("usersMe"), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUser(userData);
      setEditForm({
        name: userData.name || "",
        email: userData.email || "",
        phone_number: userData.phone_number || "",
      });

      // If user has student_id, fetch student information
      if (userData.student_id) {
        await fetchStudentInfo(userData.student_id);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("Failed to load profile information");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudentInfo = async (studentId: number) => {
    try {
      const response = await fetch(makeUrl("studentsById", { student_id: studentId }), {
        credentials: "include",
      });

      if (response.ok) {
        const studentData = await response.json();
        setStudentInfo(studentData);
      }
    } catch (error) {
      console.error("Error fetching student info:", error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      const response = await fetch(makeUrl("usersMe"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editForm.name,
          email: editForm.email,
          phone_number: editForm.phone_number,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update profile");
      }

      const result = await response.json();
      if (result.success) {
        setUser(result.data.user);
        toast.success("Profile updated successfully!");
        setIsEditing(false);
      } else {
        throw new Error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    try {
      const response = await fetch(makeUrl("usersMePassword"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to change password");
      }

      const result = await response.json();
      if (result.success) {
        toast.success("Password changed successfully!");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
      } else {
        throw new Error(result.message || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error instanceof Error ? error.message : "Failed to change password");
    }
  };

  const handleCancelPasswordChange = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  };

  const handleLogout = async () => {
    try {
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Failed to logout:", error);
      toast.error("Failed to logout. Please try again.");
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin":
        return "destructive";
      case "instructor":
        return "default";
      case "student":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <header className="bg-background shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <MainNav />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Profile</h1>
              <p className="text-lg text-muted-foreground">Loading your profile information...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/40">
        <header className="bg-background shadow">
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
              <MainNav />
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">Profile</h1>
              <p className="text-lg text-muted-foreground">Unable to load profile information.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
            <MainNav />
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-foreground">Profile</h1>
            <p className="text-lg text-muted-foreground">
              View and manage your account information
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  Basic Information
                </CardTitle>
                <CardDescription>Your account details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">{user.name || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      placeholder="Enter your email address"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone_number">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone_number"
                      type="tel"
                      value={editForm.phone_number}
                      onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                      placeholder="(555) 123-4567"
                    />
                  ) : (
                    <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.phone_number || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>User ID</Label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <span className="font-mono text-sm text-muted-foreground">#{user.id}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} size="sm">
                        Save Changes
                      </Button>
                      <Button onClick={handleCancel} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={handleEdit} variant="outline" size="sm">
                      Edit Information
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Account Status */}
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                  Account Status
                </CardTitle>
                <CardDescription>Your account permissions and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadgeVariant(user.role)} className="text-sm">
                      {user.role}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.disabled ? "destructive" : "default"} className="text-sm">
                      {user.disabled ? "Disabled" : "Active"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>WakaTime Integration</Label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.wakatime_access_token_encrypted ? "default" : "outline"}
                      className="text-sm"
                    >
                      {user.wakatime_access_token_encrypted ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>Account created and managed by your administrator.</p>
                  <p>Contact support for role or status changes.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Password Change Section */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-semibold flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Shield className="h-6 w-6 text-red-600" />
                </div>
                Change Password
              </CardTitle>
              <CardDescription>Update your account password for security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isChangingPassword ? (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last updated: Not available</p>
                  </div>
                  <Button onClick={() => setIsChangingPassword(true)} variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                      placeholder="Enter your current password"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                      }
                      placeholder="Enter your new password"
                    />
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters with uppercase, lowercase, and number
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                      }
                      placeholder="Confirm your new password"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handlePasswordChange} size="sm">
                      Change Password
                    </Button>
                    <Button onClick={handleCancelPasswordChange} variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Student Information */}
          {studentInfo && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  Student Information
                </CardTitle>
                <CardDescription>Your enrollment and academic details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Student ID</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span className="font-mono text-sm">#{studentInfo.id}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Batch ID</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span className="font-mono text-sm">#{studentInfo.batch_id}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Project ID</Label>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <span className="font-mono text-sm">
                        {studentInfo.project_id ? `#${studentInfo.project_id}` : "Not assigned"}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">
                  <p>Student enrollment information is managed by your instructors.</p>
                  <p>Contact your instructor for batch or project assignment changes.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}

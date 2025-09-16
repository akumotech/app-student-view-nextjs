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
import {
  Copy,
  Search,
  ChevronLeft,
  ChevronRight,
  Edit,
  Plus,
  Users,
  TrendingUp,
  BarChart3,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DashboardStats from "./DashboardStats";
import OverviewTab from "./OverviewTab";
import TrendsTab from "./TrendsTab";
import EngagementTab from "./EngagementTab";
import CodingActivityTab from "./CodingActivityTab";
import BatchSelector from "./BatchSelector";

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

  // State for user management (simplified for dashboard)
  const [usersTotal] = useState(users.total_count);

  // State for batch filtering
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Legacy state for existing batch functionality
  const [legacyBatches, setLegacyBatches] = useState<BatchRead[]>(batches);
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

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Registration key copied to clipboard!");
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
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Monitor student progress, batch performance, and system analytics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/batches/newBatch">
            <Button className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200">
              <Plus className="h-4 w-4" />
              Create Batch
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="hover:bg-muted/50 transition-colors"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Quick Actions & Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/users">
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 border-0 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50">
            <CardContent className="p-8">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                  <Users className="h-7 w-7 text-blue-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-blue-900">Manage Users</h3>
                  <p className="text-sm text-blue-700/80">{usersTotal} total users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/batches">
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10 border-0 bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50">
            <CardContent className="p-8">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-green-500/10 rounded-xl group-hover:bg-green-500/20 transition-colors">
                  <BarChart3 className="h-7 w-7 text-green-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-green-900">View Batches</h3>
                  <p className="text-sm text-green-700/80">{batches.length} active batches</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/demo-sessions">
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 border-0 bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50">
            <CardContent className="p-8">
              <div className="flex items-center gap-5">
                <div className="p-3 bg-purple-500/10 rounded-xl group-hover:bg-purple-500/20 transition-colors">
                  <Activity className="h-7 w-7 text-purple-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg text-purple-900">Demo Sessions</h3>
                  <p className="text-sm text-purple-700/80">Manage sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Core Statistics */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-foreground/5 rounded-lg">
            <BarChart3 className="h-6 w-6 text-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground">System Overview</h2>
        </div>
        <DashboardStats stats={stats} />
      </div>

      {/* Analytics Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-foreground/5 rounded-lg">
              <TrendingUp className="h-6 w-6 text-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Analytics & Insights</h2>
          </div>
          <BatchSelector
            batches={batches}
            selectedBatchId={selectedBatchId}
            onBatchChange={setSelectedBatchId}
            className="w-auto"
          />
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="trends"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger
              value="engagement"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <AlertTriangle className="h-4 w-4" />
              Engagement
            </TabsTrigger>
            <TabsTrigger
              value="coding"
              className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg transition-all"
            >
              <Activity className="h-4 w-4" />
              Coding Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <OverviewTab batchId={selectedBatchId?.toString()} />
          </TabsContent>

          <TabsContent value="trends" className="space-y-8">
            <TrendsTab batchId={selectedBatchId?.toString()} />
          </TabsContent>

          <TabsContent value="engagement" className="space-y-8">
            <EngagementTab batchId={selectedBatchId?.toString()} />
          </TabsContent>

          <TabsContent value="coding" className="space-y-8">
            <CodingActivityTab batchId={selectedBatchId?.toString()} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Legacy batch creation success message */}
      {newlyCreatedBatchInfo && (
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200/50 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-800 text-xl">
              ✅ Batch &apos;{newlyCreatedBatchInfo.name}&apos; Created Successfully!
            </CardTitle>
            <CardDescription className="text-green-700/90 text-base">
              Use the registration key below to enroll students in this new batch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-green-800">Registration Key:</p>
              <div className="flex items-center gap-3">
                <Input
                  readOnly
                  value={newlyCreatedBatchInfo.registrationKey}
                  className="bg-white text-green-900 font-mono text-sm border-green-300 focus:border-green-400 focus:ring-green-400/20"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyToClipboard(newlyCreatedBatchInfo.registrationKey)}
                  className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 transition-colors"
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Profile Dialog */}
      <Dialog
        open={!!studentProfile}
        onOpenChange={(open) => {
          if (!open) setStudentProfile(null);
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold text-foreground">
              Student Profile
            </DialogTitle>
          </DialogHeader>
          {studentProfile && (
            <div className="space-y-8">
              {/* Top Section: Name, Email, Role, Status, Batch */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-border/50 pb-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-foreground">{studentProfile.user.name}</h2>
                  <div className="text-lg text-muted-foreground">{studentProfile.user.email}</div>
                  {studentProfile.batch && (
                    <div className="text-muted-foreground">Batch: {studentProfile.batch.name}</div>
                  )}
                </div>
                <div className="flex gap-3">
                  <Badge className="capitalize text-sm px-3 py-1">{studentProfile.user.role}</Badge>
                  <Badge
                    variant={studentProfile.user.disabled ? "destructive" : "secondary"}
                    className="text-sm px-3 py-1"
                  >
                    {studentProfile.user.disabled ? "Disabled" : "Active"}
                  </Badge>
                </div>
              </div>
              {/* Project Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold text-foreground">Project</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {studentProfile.project ? (
                      <div className="space-y-3">
                        <div className="text-lg font-semibold text-foreground">
                          {studentProfile.project.name}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          {studentProfile.project.start_date && (
                            <div>Start: {studentProfile.project.start_date}</div>
                          )}
                          {studentProfile.project.end_date && (
                            <div>End: {studentProfile.project.end_date}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-base">No project assigned</div>
                    )}
                  </CardContent>
                </Card>
                {/* WakaTime Stats */}
                {studentProfile.wakatime_stats && (
                  <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-semibold text-foreground">
                        7 Days Average Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-muted-foreground">Total Time:</span>
                          <span className="font-semibold text-foreground">
                            {studentProfile.wakatime_stats.text ||
                              studentProfile.wakatime_stats.digital}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-muted-foreground">Hours:</span>
                          <span className="font-semibold text-foreground">
                            {studentProfile.wakatime_stats.hours}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-muted-foreground">Last Updated:</span>
                          <span className="font-semibold text-foreground">
                            {studentProfile.wakatime_stats.last_updated
                              ? new Date(
                                  studentProfile.wakatime_stats.last_updated,
                                ).toLocaleString()
                              : "—"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              {/* Certificates Section as Table */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground border-b border-border/50 pb-2">
                  Certificates
                </h3>
                {studentProfile.certificates.length > 0 ? (
                  <Card className="border-border/50 shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-muted/50">
                          <TableHead className="font-medium text-muted-foreground">Name</TableHead>
                          <TableHead className="font-medium text-muted-foreground">
                            Issuer
                          </TableHead>
                          <TableHead className="font-medium text-muted-foreground">
                            Date Issued
                          </TableHead>
                          <TableHead className="font-medium text-muted-foreground">
                            Date Expired
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentProfile.certificates.map((cert: CertificateRead) => (
                          <TableRow key={cert.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{cert.name}</TableCell>
                            <TableCell>{cert.issuer}</TableCell>
                            <TableCell>{cert.date_issued}</TableCell>
                            <TableCell>{cert.date_expired || "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <div className="text-muted-foreground text-base">No certificates found</div>
                )}
              </div>
              {/* Demos Section as Table */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-foreground border-b border-border/50 pb-2">
                  Demos
                </h3>
                {studentProfile.demos.length > 0 ? (
                  <Card className="border-border/50 shadow-sm">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-muted/50">
                          <TableHead className="font-medium text-muted-foreground">Title</TableHead>
                          <TableHead className="font-medium text-muted-foreground">
                            Description
                          </TableHead>
                          <TableHead className="font-medium text-muted-foreground">
                            Demo Link
                          </TableHead>
                          <TableHead className="font-medium text-muted-foreground">
                            GitHub
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentProfile.demos.map((demo: DemoRead) => (
                          <TableRow key={demo.id} className="hover:bg-muted/30">
                            <TableCell className="font-medium">{demo.title}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {demo.description || "—"}
                            </TableCell>
                            <TableCell>
                              {demo.demo_url ? (
                                <a
                                  href={demo.demo_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
                                >
                                  View Demo
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
                                  className="text-blue-600 hover:text-blue-700 hover:underline transition-colors font-medium"
                                >
                                  View Code
                                </a>
                              ) : (
                                "—"
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Card>
                ) : (
                  <div className="text-muted-foreground text-base">No demos found</div>
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

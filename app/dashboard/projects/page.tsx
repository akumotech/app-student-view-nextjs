"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { makeUrl } from "@/lib/utils";
import { fetchMyProject } from "@/app/dashboard/projects/api/fetchMyProject";
import MyProjectCard from "@/app/dashboard/projects/components/MyProjectCard";
import NoProjectCard from "@/app/dashboard/projects/components/NoProjectCard";
import ProjectsError from "@/app/dashboard/projects/components/ProjectsError";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, BookOpen, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import type { MyProjectData } from "@/app/dashboard/projects/api/fetchMyProject";
import type { InterviewSlotRead, InterviewRead, InterviewType } from "@/app/admin/components/types";
import ResumeContent from "./components/ResumeContent";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [projectData, setProjectData] = useState<MyProjectData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Interview state
  const [availableSlots, setAvailableSlots] = useState<InterviewSlotRead[]>([]);
  const [myInterviews, setMyInterviews] = useState<InterviewRead[]>([]);
  const [completedInterviews, setCompletedInterviews] = useState<InterviewRead[]>([]);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<InterviewSlotRead | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }

    if (!authLoading && isAuthenticated && user?.role !== "student") {
      router.replace("/dashboard?error=unauthorized_student_page");
      return;
    }

    if (isAuthenticated && user?.role === "student") {
      fetchProjectData();
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchProjectData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchMyProject();
      setProjectData(data);

      // Fetch interview data if user has a project
      if (data) {
        await Promise.all([fetchAvailableSlots(), fetchMyInterviews(), fetchCompletedInterviews()]);
      }
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch(makeUrl("studentInterviewSlotsAvailable"), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setAvailableSlots(data.data.slots || []);
      }
    } catch (error) {
      console.error("Error fetching available slots:", error);
    }
  };

  const fetchMyInterviews = async () => {
    try {
      const response = await fetch(makeUrl("studentMyInterviews"), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setMyInterviews(data.data.interviews || []);
      }
    } catch (error) {
      console.error("Error fetching my interviews:", error);
    }
  };

  const fetchCompletedInterviews = async () => {
    try {
      const response = await fetch(makeUrl("studentMyCompletedInterviews"), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setCompletedInterviews(data.data.interviews || []);
      }
    } catch (error) {
      console.error("Error fetching completed interviews:", error);
    }
  };

  const handleBookSlot = async (slotId: number) => {
    if (!projectData) {
      toast.error("No project data available");
      return;
    }

    try {
      const response = await fetch(makeUrl("studentInterviewSlotBook", { slot_id: slotId }), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          project_id: projectData.project.id,
          status: "scheduled",
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Interview slot booked successfully");
        setIsBookingDialogOpen(false);
        setSelectedSlot(null);
        // Refresh interview data
        await Promise.all([fetchAvailableSlots(), fetchMyInterviews(), fetchCompletedInterviews()]);
      } else {
        throw new Error(data.message || "Failed to book slot");
      }
    } catch (error) {
      console.error("Error booking interview slot:", error);
      toast.error("Failed to book interview slot");
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

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const getInterviewTypeBadgeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "initial":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "technical":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "behavioral":
        return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300";
      case "final":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Process interview data for chart
  const processChartData = () => {
    if (!completedInterviews || completedInterviews.length === 0) {
      return [];
    }

    return completedInterviews
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime())
      .map((interview, index) => {
        const ratings = [
          interview.behavioral_rating,
          interview.technical_rating,
          interview.communication_rating,
          interview.body_language_rating,
          interview.professionalism_rating,
          interview.about_you_rating,
        ].filter((rating) => rating !== null && rating !== undefined);

        const averageRating =
          ratings.length > 0
            ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1)
            : "0.0";

        return {
          name: `Interview ${index + 1}`,
          date: new Date(interview.updated_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          fullDate: new Date(interview.updated_at).toLocaleDateString(),
          average: parseFloat(averageRating),
          behavioral: interview.behavioral_rating || 0,
          technical: interview.technical_rating || 0,
          communication: interview.communication_rating || 0,
          bodyLanguage: interview.body_language_rating || 0,
          professionalism: interview.professionalism_rating || 0,
          aboutYou: interview.about_you_rating || 0,
          type: interview.interview_type,
        };
      });
  };

  const processPieChartData = (interview: any) => {
    const data = [
      { name: "Behavioral", value: interview.behavioral_rating || 0, color: "#8884d8" },
      { name: "Technical", value: interview.technical_rating || 0, color: "#82ca9d" },
      { name: "Communication", value: interview.communication_rating || 0, color: "#ffc658" },
      { name: "Body Language", value: interview.body_language_rating || 0, color: "#ff7300" },
      { name: "Professionalism", value: interview.professionalism_rating || 0, color: "#8dd1e1" },
      { name: "About You", value: interview.about_you_rating || 0, color: "#d084d0" },
    ].filter((item) => item.value > 0);

    return data;
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <DashboardHeader title="Dashboard" />
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">My Project</h1>
            <p className="text-muted-foreground">Loading your project information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <ProjectsError message="Not authenticated" />;
  }

  if (user.role !== "student") {
    return (
      <div className="min-h-screen bg-muted/40">
        <DashboardHeader title="Dashboard" />
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div
            className="p-4 mb-4 text-sm text-orange-700 bg-orange-100 rounded-lg dark:bg-gray-800 dark:text-orange-400"
            role="alert"
          >
            <span className="font-medium">Access Restricted:</span> This page is only available to
            students. Please contact your instructor if you believe this is an error.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <DashboardHeader title="Dashboard" />
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">My Project</h1>
          <p className="text-muted-foreground">
            View your assigned project details and track your progress
          </p>
        </div>

        {projectData ? (
          <Tabs defaultValue="project" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="project">Project Details</TabsTrigger>
              <TabsTrigger value="interviews">Interviews</TabsTrigger>
              <TabsTrigger value="resume">Resume Content</TabsTrigger>
            </TabsList>

            <TabsContent value="project" className="space-y-6">
              <MyProjectCard projectData={projectData} />
            </TabsContent>

            <TabsContent value="interviews" className="space-y-6">
              <Tabs defaultValue="available" className="space-y-6">
                <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                  <TabsTrigger value="available">Available Slots</TabsTrigger>
                  <TabsTrigger value="my-interviews">My Interviews</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>

                <TabsContent value="available" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Available Interview Slots</CardTitle>
                      <CardDescription>
                        Book an available time slot for your interview
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {availableSlots.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No available slots</h3>
                          <p className="text-muted-foreground">
                            There are currently no available interview slots. Check back later.
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Scheduled Time</TableHead>
                              <TableHead>Interview Session</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead>Interviewer</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {availableSlots.map((slot) => (
                              <TableRow key={slot.id}>
                                <TableCell>
                                  <div className="font-medium">
                                    {formatDateTime(slot.scheduled_at)}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">
                                      {slot.session_name || `Session ${slot.session_id}`}
                                    </div>
                                    <div className="text-sm text-muted-foreground capitalize">
                                      {slot.interview_type} Interview
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm text-muted-foreground max-w-xs">
                                    {slot.session_description || "No description available"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm">
                                    {slot.session_interviewer || "Not specified"}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setSelectedSlot(slot);
                                      setIsBookingDialogOpen(true);
                                    }}
                                  >
                                    <BookOpen className="h-4 w-4 mr-2" />
                                    Book Slot
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="my-interviews" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>My Interviews</CardTitle>
                      <CardDescription>All your scheduled and completed interviews</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {myInterviews.length === 0 ? (
                        <div className="text-center py-8">
                          <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No interviews scheduled</h3>
                          <p className="text-muted-foreground">
                            You haven't booked any interview slots yet.
                          </p>
                        </div>
                      ) : (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Scheduled Time</TableHead>
                              <TableHead>Created</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {myInterviews.map((interview) => (
                              <TableRow key={interview.id}>
                                <TableCell>
                                  <Badge
                                    className={getInterviewTypeBadgeColor(interview.interview_type)}
                                  >
                                    {interview.interview_type}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Badge className={getStatusBadgeColor(interview.status)}>
                                    {interview.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {interview.slot_id ? "Scheduled" : "Not scheduled"}
                                </TableCell>
                                <TableCell>
                                  {new Date(interview.created_at).toLocaleDateString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="completed" className="space-y-6">
                  {/* Progress Chart */}
                  {completedInterviews.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Interview Progress</CardTitle>
                        <CardDescription>
                          Track your improvement across all interview categories over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80 sm:h-96 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={processChartData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis
                                domain={[0, 10]}
                                tick={{ fontSize: 12 }}
                                label={{
                                  value: "Rating (0-10)",
                                  angle: -90,
                                  position: "insideLeft",
                                }}
                              />
                              <Tooltip
                                content={({ active, payload, label }) => {
                                  if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                                        <p className="font-medium">{data.fullDate}</p>
                                        <p className="text-sm text-muted-foreground mb-2">
                                          {data.type} Interview
                                        </p>
                                        <div className="space-y-1">
                                          <p className="text-sm">
                                            <span className="font-medium">Average:</span>{" "}
                                            {data.average}/10
                                          </p>
                                          {data.behavioral > 0 && (
                                            <p className="text-sm">
                                              <span className="font-medium">Behavioral:</span>{" "}
                                              {data.behavioral}/10
                                            </p>
                                          )}
                                          {data.technical > 0 && (
                                            <p className="text-sm">
                                              <span className="font-medium">Technical:</span>{" "}
                                              {data.technical}/10
                                            </p>
                                          )}
                                          {data.communication > 0 && (
                                            <p className="text-sm">
                                              <span className="font-medium">Communication:</span>{" "}
                                              {data.communication}/10
                                            </p>
                                          )}
                                          {data.bodyLanguage > 0 && (
                                            <p className="text-sm">
                                              <span className="font-medium">Body Language:</span>{" "}
                                              {data.bodyLanguage}/10
                                            </p>
                                          )}
                                          {data.professionalism > 0 && (
                                            <p className="text-sm">
                                              <span className="font-medium">Professionalism:</span>{" "}
                                              {data.professionalism}/10
                                            </p>
                                          )}
                                          {data.aboutYou > 0 && (
                                            <p className="text-sm">
                                              <span className="font-medium">About You:</span>{" "}
                                              {data.aboutYou}/10
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  }
                                  return null;
                                }}
                              />
                              <Legend />
                              <Line
                                type="monotone"
                                dataKey="average"
                                stroke="#8884d8"
                                strokeWidth={3}
                                dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                                name="Average Rating"
                              />
                              <Line
                                type="monotone"
                                dataKey="behavioral"
                                stroke="#82ca9d"
                                strokeWidth={2}
                                dot={{ fill: "#82ca9d", strokeWidth: 2, r: 3 }}
                                name="Behavioral"
                              />
                              <Line
                                type="monotone"
                                dataKey="technical"
                                stroke="#ffc658"
                                strokeWidth={2}
                                dot={{ fill: "#ffc658", strokeWidth: 2, r: 3 }}
                                name="Technical"
                              />
                              <Line
                                type="monotone"
                                dataKey="communication"
                                stroke="#ff7300"
                                strokeWidth={2}
                                dot={{ fill: "#ff7300", strokeWidth: 2, r: 3 }}
                                name="Communication"
                              />
                              <Line
                                type="monotone"
                                dataKey="bodyLanguage"
                                stroke="#8dd1e1"
                                strokeWidth={2}
                                dot={{ fill: "#8dd1e1", strokeWidth: 2, r: 3 }}
                                name="Body Language"
                              />
                              <Line
                                type="monotone"
                                dataKey="professionalism"
                                stroke="#d084d0"
                                strokeWidth={2}
                                dot={{ fill: "#d084d0", strokeWidth: 2, r: 3 }}
                                name="Professionalism"
                              />
                              <Line
                                type="monotone"
                                dataKey="aboutYou"
                                stroke="#ffb347"
                                strokeWidth={2}
                                dot={{ fill: "#ffb347", strokeWidth: 2, r: 3 }}
                                name="About You"
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Improvement Indicators */}
                        {processChartData().length > 1 && (
                          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="text-center p-6 bg-muted rounded-lg">
                              <div className="text-3xl font-bold text-blue-600">
                                {processChartData()[processChartData().length - 1].average}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Latest Average
                              </div>
                            </div>
                            <div className="text-center p-6 bg-muted rounded-lg">
                              <div className="text-3xl font-bold text-green-600">
                                {processChartData().length > 1
                                  ? (
                                      processChartData()[processChartData().length - 1].average -
                                      processChartData()[0].average
                                    ).toFixed(1)
                                  : "0.0"}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Total Improvement
                              </div>
                            </div>
                            <div className="text-center p-6 bg-muted rounded-lg sm:col-span-2 lg:col-span-1">
                              <div className="text-3xl font-bold text-purple-600">
                                {processChartData().length}
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                Interviews Completed
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle>Completed Interviews</CardTitle>
                      <CardDescription>
                        Your completed interviews with feedback and ratings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {completedInterviews.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">No completed interviews</h3>
                          <p className="text-muted-foreground">
                            You haven't completed any interviews yet.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {completedInterviews.map((interview) => (
                            <Card key={interview.id}>
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-lg">
                                      <Badge
                                        className={getInterviewTypeBadgeColor(
                                          interview.interview_type,
                                        )}
                                      >
                                        {interview.interview_type}
                                      </Badge>
                                    </CardTitle>
                                    <CardDescription>
                                      Completed on{" "}
                                      {new Date(interview.updated_at).toLocaleDateString()}
                                    </CardDescription>
                                  </div>
                                  <Badge className={getStatusBadgeColor(interview.status)}>
                                    {interview.status}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                  {/* Feedback Section - Left Side */}
                                  <div className="space-y-4">
                                    {interview.feedback && (
                                      <div>
                                        <h4 className="font-medium mb-4">Feedback</h4>
                                        <ul className="space-y-3">
                                          {interview.feedback
                                            .split("\n")
                                            .filter((line) => line.trim())
                                            .map((feedbackItem, index) => (
                                              <li key={index} className="flex items-start gap-3">
                                                <span className="text-primary mt-1 text-sm">•</span>
                                                <span className="text-sm text-muted-foreground leading-relaxed">
                                                  {feedbackItem.trim()}
                                                </span>
                                              </li>
                                            ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>

                                  {/* Pie Chart Section - Right Side */}
                                  {(interview.behavioral_rating ||
                                    interview.technical_rating ||
                                    interview.communication_rating ||
                                    interview.body_language_rating ||
                                    interview.professionalism_rating ||
                                    interview.about_you_rating) && (
                                    <div className="space-y-4">
                                      <h4 className="font-medium">Performance Breakdown</h4>
                                      <div className="h-72 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                            <Pie
                                              data={processPieChartData(interview)}
                                              cx="50%"
                                              cy="50%"
                                              labelLine={false}
                                              label={({ name, value }) => `${name}: ${value}`}
                                              outerRadius={100}
                                              fill="#8884d8"
                                              dataKey="value"
                                            >
                                              {processPieChartData(interview).map(
                                                (entry, index) => (
                                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                                ),
                                              )}
                                            </Pie>
                                            <Tooltip />
                                          </PieChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="resume" className="space-y-6">
              <ResumeContent projectData={projectData} />
            </TabsContent>
          </Tabs>
        ) : (
          <NoProjectCard />
        )}

        {/* Booking Dialog */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Book Interview Slot</DialogTitle>
              <DialogDescription>
                Confirm your booking for this interview slot. The interview type has been
                pre-selected by your instructor.
              </DialogDescription>
            </DialogHeader>
            {selectedSlot && (
              <BookingForm
                key={selectedSlot.id}
                slot={selectedSlot}
                onBook={() => handleBookSlot(selectedSlot.id)}
                onCancel={() => {
                  setIsBookingDialogOpen(false);
                  setSelectedSlot(null);
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

// Booking Form Component
function BookingForm({
  slot,
  onBook,
  onCancel,
}: {
  slot: InterviewSlotRead;
  onBook: () => void;
  onCancel: () => void;
}) {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInterviewTypeDisplay = (type: string) => {
    switch (type) {
      case "initial":
        return "Initial Interview";
      case "technical":
        return "Technical Interview";
      case "behavioral":
        return "Behavioral Interview";
      case "final":
        return "Final Interview";
      default:
        return type;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Selected Time Slot</Label>
        <div className="p-3 bg-muted rounded-md">
          <div className="font-medium">{formatDateTime(slot.scheduled_at)}</div>
        </div>
      </div>

      <div>
        <Label>Interview Session</Label>
        <div className="p-3 bg-muted rounded-md">
          <div className="font-medium">{slot.session_name || `Session ${slot.session_id}`}</div>
          {slot.session_description && (
            <div className="text-sm text-muted-foreground mt-1">{slot.session_description}</div>
          )}
          {slot.session_interviewer && (
            <div className="text-sm text-muted-foreground mt-1">
              Interviewer: {slot.session_interviewer}
            </div>
          )}
        </div>
      </div>

      <div>
        <Label>Interview Type</Label>
        <div className="p-3 bg-muted rounded-md">
          <div className="font-medium">{getInterviewTypeDisplay(slot.interview_type)}</div>
          <p className="text-sm text-muted-foreground mt-1">
            This interview type has been pre-selected by your instructor
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Book Slot</Button>
      </div>
    </form>
  );
}

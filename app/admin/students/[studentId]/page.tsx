"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  User,
  Calendar,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";

// Types
interface StudentData {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    created_at?: string;
  };
  batch: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
  };
  student_project?: {
    id: number;
    project_id: number;
    status: string;
    assigned_at: string;
    resume_url?: string;
    linkedin_url?: string;
    offer_date?: string;
    project?: {
      id: number;
      name: string;
      description: string;
    };
  };
}

interface InterviewData {
  id: number;
  interview_type: string;
  status: string;
  scheduled_at: string;
  feedback?: string;
  behavioral_rating?: number;
  technical_rating?: number;
  communication_rating?: number;
  body_language_rating?: number;
  professionalism_rating?: number;
  about_you_rating?: number;
  created_at: string;
  updated_at: string;
}

interface ResumeData {
  education: any[];
  experience: any[];
  skills: any[];
  publications: any[];
}

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [interviews, setInterviews] = useState<InterviewData[]>([]);
  const [resumeData, setResumeData] = useState<ResumeData>({
    education: [],
    experience: [],
    skills: [],
    publications: [],
  });
  const [loading, setLoading] = useState(true);
  const [resumeLoaded, setResumeLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch student basic data
  const fetchStudentData = async () => {
    try {
      const response = await fetch(makeUrl("adminStudentDetail", { student_id: studentId }), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setStudentData(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch student data");
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      toast.error("Failed to load student information");
    }
  };

  // Fetch interview data (lazy loaded)
  const fetchInterviewData = async () => {
    try {
      const response = await fetch(makeUrl("adminStudentInterviews", { student_id: studentId }), {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setInterviews(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch interview data");
      }
    } catch (error) {
      console.error("Error fetching interview data:", error);
      toast.error("Failed to load interview data");
    }
  };

  // Fetch resume data (lazy loaded)
  const fetchResumeData = async () => {
    if (resumeLoaded) return; // Prevent duplicate fetches

    try {
      const [educationRes, experienceRes, skillsRes, publicationsRes] = await Promise.all([
        fetch(makeUrl("adminStudentResumeEducation", { student_id: studentId }), {
          credentials: "include",
        }),
        fetch(makeUrl("adminStudentResumeExperience", { student_id: studentId }), {
          credentials: "include",
        }),
        fetch(makeUrl("adminStudentResumeSkills", { student_id: studentId }), {
          credentials: "include",
        }),
        fetch(makeUrl("adminStudentResumePublications", { student_id: studentId }), {
          credentials: "include",
        }),
      ]);

      const [educationData, experienceData, skillsData, publicationsData] = await Promise.all([
        educationRes.json(),
        experienceRes.json(),
        skillsRes.json(),
        publicationsRes.json(),
      ]);

      setResumeData({
        education: educationData.success ? educationData.data : [],
        experience: experienceData.success ? experienceData.data : [],
        skills: skillsData.success ? skillsData.data : [],
        publications: publicationsData.success ? publicationsData.data : [],
      });

      setResumeLoaded(true);
    } catch (error) {
      console.error("Error fetching resume data:", error);
      toast.error("Failed to load resume data");
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === "interviews" && interviews.length === 0) {
      fetchInterviewData();
    } else if (activeTab === "resume" && !resumeLoaded) {
      fetchResumeData();
    }
  }, [activeTab]);

  // Initial data load
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      await fetchStudentData();
      setLoading(false);
    };

    loadInitialData();
  }, [studentId]);

  const getStatusBadgeColor = (status: string | undefined) => {
    if (!status) {
      return "bg-gray-100 text-gray-800";
    }
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateAverageRating = (interview: InterviewData) => {
    const ratings = [
      interview.behavioral_rating,
      interview.technical_rating,
      interview.communication_rating,
      interview.body_language_rating,
      interview.professionalism_rating,
      interview.about_you_rating,
    ].filter((rating) => rating !== null && rating !== undefined);

    if (ratings.length === 0) return 0;
    return (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40">
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <div className="h-8 w-64 mb-2 bg-muted animate-pulse rounded" />
            <div className="h-4 w-96 bg-muted animate-pulse rounded" />
          </div>
          <div className="space-y-6">
            <div className="h-32 w-full bg-muted animate-pulse rounded" />
            <div className="h-64 w-full bg-muted animate-pulse rounded" />
          </div>
        </main>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen bg-muted/40">
        <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Student Not Found</h1>
            <p className="text-gray-600 mb-6">The requested student could not be found.</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-0 h-auto font-normal"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <span>/</span>
            <span>Students</span>
            <span>/</span>
            <span className="text-foreground font-medium">{studentData.user.name}</span>
          </nav>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <User className="h-8 w-8" />
                {studentData.user.name}
              </h1>
              <p className="text-muted-foreground mt-1">
                Student ID: {studentData.id} • {studentData.batch.name}
              </p>
            </div>
          </div>
        </div>

        {/* Student Overview Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
                <p className="font-medium">{studentData.user.email}</p>
              </div>

              {studentData.user.phone && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="font-medium">{studentData.user.phone}</p>
                </div>
              )}

              {studentData.user.created_at && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Joined
                  </div>
                  <p className="font-medium">
                    {new Date(studentData.user.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  Batch
                </div>
                <p className="font-medium">{studentData.batch.name}</p>
              </div>

              {studentData.student_project && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      Project
                    </div>
                    <p className="font-medium">
                      {studentData.student_project.project?.name || "No project assigned"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4" />
                      Status
                    </div>
                    <Badge className={getStatusBadgeColor(studentData.student_project.status)}>
                      {studentData.student_project.status}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="interviews" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Interviews
            </TabsTrigger>
            <TabsTrigger value="resume" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resume
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Assignment</CardTitle>
                <CardDescription>Current project and assignment details</CardDescription>
              </CardHeader>
              <CardContent>
                {studentData.student_project ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Project Name
                        </label>
                        <p className="text-lg font-semibold">
                          {studentData.student_project.project?.name || "No project assigned"}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                          <Badge
                            className={getStatusBadgeColor(studentData.student_project.status)}
                          >
                            {studentData.student_project.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Assigned Date
                        </label>
                        <p className="text-lg">
                          {new Date(studentData.student_project.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                      {studentData.student_project.offer_date && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Offer Date
                          </label>
                          <p className="text-lg">
                            {new Date(studentData.student_project.offer_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Project Description
                      </label>
                      <p className="mt-1 text-sm">
                        {studentData.student_project.project?.description ||
                          "No description available"}
                      </p>
                    </div>

                    {(studentData.student_project.resume_url ||
                      studentData.student_project.linkedin_url) && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-muted-foreground">Links</label>
                          <div className="flex flex-wrap gap-2">
                            {studentData.student_project.resume_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={studentData.student_project.resume_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Resume
                                </a>
                              </Button>
                            )}
                            {studentData.student_project.linkedin_url && (
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={studentData.student_project.linkedin_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Briefcase className="h-4 w-4 mr-2" />
                                  LinkedIn
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Project Assigned</h3>
                    <p className="text-muted-foreground">
                      This student has not been assigned to any project yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Interview History
                </CardTitle>
                <CardDescription>
                  All interview sessions and feedback for this student
                </CardDescription>
              </CardHeader>
              <CardContent>
                {interviews.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">No Interviews Found</h3>
                    <p className="text-muted-foreground">
                      This student has not completed any interviews yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {interviews.map((interview) => (
                      <div key={interview.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold capitalize">
                              {interview.interview_type} Interview
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(interview.scheduled_at)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusBadgeColor(interview.status)}>
                              {interview.status}
                            </Badge>
                            {interview.status === "completed" && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {calculateAverageRating(interview)}/10
                              </Badge>
                            )}
                          </div>
                        </div>

                        {interview.status === "completed" && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                              {interview.behavioral_rating && (
                                <div>
                                  <span className="text-muted-foreground">Behavioral:</span>
                                  <span className="ml-2 font-medium">
                                    {interview.behavioral_rating}/10
                                  </span>
                                </div>
                              )}
                              {interview.technical_rating && (
                                <div>
                                  <span className="text-muted-foreground">Technical:</span>
                                  <span className="ml-2 font-medium">
                                    {interview.technical_rating}/10
                                  </span>
                                </div>
                              )}
                              {interview.communication_rating && (
                                <div>
                                  <span className="text-muted-foreground">Communication:</span>
                                  <span className="ml-2 font-medium">
                                    {interview.communication_rating}/10
                                  </span>
                                </div>
                              )}
                              {interview.body_language_rating && (
                                <div>
                                  <span className="text-muted-foreground">Body Language:</span>
                                  <span className="ml-2 font-medium">
                                    {interview.body_language_rating}/10
                                  </span>
                                </div>
                              )}
                              {interview.professionalism_rating && (
                                <div>
                                  <span className="text-muted-foreground">Professionalism:</span>
                                  <span className="ml-2 font-medium">
                                    {interview.professionalism_rating}/10
                                  </span>
                                </div>
                              )}
                              {interview.about_you_rating && (
                                <div>
                                  <span className="text-muted-foreground">About You:</span>
                                  <span className="ml-2 font-medium">
                                    {interview.about_you_rating}/10
                                  </span>
                                </div>
                              )}
                            </div>

                            {interview.feedback && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">
                                  Feedback
                                </label>
                                <div className="mt-1 p-3 bg-muted rounded-md">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {interview.feedback}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Resume Content
                </CardTitle>
                <CardDescription>Student's resume information and portfolio</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Education Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Education
                    </h4>
                    {resumeData.education.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No education information available.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {resumeData.education.map((edu, index) => (
                          <div key={index} className="border-l-2 border-blue-200 pl-4">
                            <h5 className="font-medium">
                              {edu.major} {edu.degree_type && `(${edu.degree_type})`}
                            </h5>
                            <p className="text-sm text-muted-foreground">{edu.school}</p>
                            <p className="text-sm text-muted-foreground">{edu.location}</p>
                            <p className="text-sm text-muted-foreground">
                              {edu.start_date} - {edu.end_date}
                            </p>
                            {edu.gpa && (
                              <p className="text-sm text-muted-foreground">GPA: {edu.gpa}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Experience Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Experience
                    </h4>
                    {resumeData.experience.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No work experience available.</p>
                    ) : (
                      <div className="space-y-4">
                        {resumeData.experience.map((exp, index) => (
                          <div key={index} className="border-l-2 border-green-200 pl-4">
                            <h5 className="font-medium">{exp.title}</h5>
                            <p className="text-sm text-muted-foreground">{exp.company}</p>
                            <p className="text-sm text-muted-foreground">
                              {exp.start_date} - {exp.end_date}
                            </p>
                            {exp.description && (
                              <div className="mt-2">
                                <p className="text-sm">{exp.description}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Skills Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      Skills
                    </h4>
                    {resumeData.skills.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        No skills information available.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-sm">
                            {skill.skill_name}
                            {skill.proficiency_level && (
                              <span className="ml-1 text-xs opacity-75">
                                ({skill.proficiency_level})
                              </span>
                            )}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Publications Section */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Publications
                    </h4>
                    {resumeData.publications.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No publications available.</p>
                    ) : (
                      <div className="space-y-3">
                        {resumeData.publications.map((pub, index) => (
                          <div key={index} className="border-l-2 border-purple-200 pl-4">
                            <h5 className="font-medium">{pub.title}</h5>
                            {pub.authors && (
                              <p className="text-sm text-muted-foreground">By: {pub.authors}</p>
                            )}
                            {pub.venue && (
                              <p className="text-sm text-muted-foreground">
                                Published in: {pub.venue}
                              </p>
                            )}
                            <p className="text-sm text-muted-foreground">{pub.publication_date}</p>
                            {pub.url && (
                              <a
                                href={pub.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline"
                              >
                                View Publication
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

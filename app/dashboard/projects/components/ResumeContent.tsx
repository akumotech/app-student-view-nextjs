"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Edit,
  Trash2,
  GraduationCap,
  Briefcase,
  Code,
  FileText,
  Award,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";

// ProjectData interface removed - using flexible any type for projectData

interface ResumeContentProps {
  projectData: any; // Accept any project data structure since we only need the student_project.id
}

// Types for resume content
interface EducationEntry {
  id?: number;
  major: string;
  school: string;
  location: string;
  start_date?: string;
  end_date?: string;
  gpa?: number;
  degree_type?: string;
  description?: string;
}

interface ExperienceEntry {
  id?: number;
  title: string;
  company: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  is_current: boolean;
  description: string;
}

interface SkillEntry {
  id?: number;
  skill_name: string;
  category?: string;
  proficiency_level?: string;
}

interface PublicationEntry {
  id?: number;
  title: string;
  publication_date?: string;
  url?: string;
  description?: string;
  authors?: string;
  venue?: string;
}

// CertificationEntry interface removed - using existing certificate system

export default function ResumeContent({ projectData }: ResumeContentProps) {
  const [educationEntries, setEducationEntries] = useState<EducationEntry[]>([]);
  const [experienceEntries, setExperienceEntries] = useState<ExperienceEntry[]>([]);
  const [skillEntries, setSkillEntries] = useState<SkillEntry[]>([]);
  const [publicationEntries, setPublicationEntries] = useState<PublicationEntry[]>([]);
  // Certifications are handled through the existing certificate system

  const [isLoading, setIsLoading] = useState(true);
  const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
  const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isPublicationDialogOpen, setIsPublicationDialogOpen] = useState(false);
  // Certification dialog removed - using existing certificate system

  const [editingEducation, setEditingEducation] = useState<EducationEntry | null>(null);
  const [editingExperience, setEditingExperience] = useState<ExperienceEntry | null>(null);
  const [editingSkill, setEditingSkill] = useState<SkillEntry | null>(null);
  const [editingPublication, setEditingPublication] = useState<PublicationEntry | null>(null);
  // Certification editing removed - using existing certificate system

  useEffect(() => {
    fetchResumeContent();
  }, [projectData]);

  const fetchResumeContent = async () => {
    try {
      setIsLoading(true);

      // Fetch all resume content in parallel (certifications handled by existing certificate system)
      const [educationRes, experienceRes, skillsRes, publicationsRes] = await Promise.all([
        fetch(makeUrl("studentsResumeEducation"), { credentials: "include" }),
        fetch(makeUrl("studentsResumeExperience"), { credentials: "include" }),
        fetch(makeUrl("studentsResumeSkills"), { credentials: "include" }),
        fetch(makeUrl("studentsResumePublications"), { credentials: "include" }),
      ]);

      if (educationRes.ok) {
        const educationData = await educationRes.json();
        setEducationEntries(educationData);
      }

      if (experienceRes.ok) {
        const experienceData = await experienceRes.json();
        setExperienceEntries(experienceData);
      }

      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkillEntries(skillsData);
      }

      if (publicationsRes.ok) {
        const publicationsData = await publicationsRes.json();
        setPublicationEntries(publicationsData);
      }

      // Certifications are handled by the existing certificate system
    } catch (error) {
      console.error("Error fetching resume content:", error);
      toast.error("Failed to load resume content");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEducation = async (data: EducationEntry) => {
    try {
      // Convert empty date strings to null
      const processedData = {
        ...data,
        start_date: data.start_date && data.start_date.trim() !== "" ? data.start_date : null,
        end_date: data.end_date && data.end_date.trim() !== "" ? data.end_date : null,
      };

      const response = await fetch(makeUrl("studentsResumeEducation"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setEducationEntries([...educationEntries, newEntry]);
        toast.success("Education entry added successfully");
        setIsEducationDialogOpen(false);
      } else {
        throw new Error("Failed to add education entry");
      }
    } catch (error) {
      console.error("Error adding education:", error);
      toast.error("Failed to add education entry");
    }
  };

  const handleAddExperience = async (data: ExperienceEntry) => {
    try {
      // Convert empty date strings to null
      const processedData = {
        ...data,
        start_date: data.start_date && data.start_date.trim() !== "" ? data.start_date : null,
        end_date: data.end_date && data.end_date.trim() !== "" ? data.end_date : null,
      };

      const response = await fetch(makeUrl("studentsResumeExperience"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setExperienceEntries([...experienceEntries, newEntry]);
        toast.success("Experience entry added successfully");
        setIsExperienceDialogOpen(false);
      } else {
        throw new Error("Failed to add experience entry");
      }
    } catch (error) {
      console.error("Error adding experience:", error);
      toast.error("Failed to add experience entry");
    }
  };

  const handleAddSkill = async (data: SkillEntry) => {
    try {
      const response = await fetch(makeUrl("studentsResumeSkills"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setSkillEntries([...skillEntries, newEntry]);
        toast.success("Skill added successfully");
        setIsSkillDialogOpen(false);
      } else {
        throw new Error("Failed to add skill");
      }
    } catch (error) {
      console.error("Error adding skill:", error);
      toast.error("Failed to add skill");
    }
  };

  const handleAddPublication = async (data: PublicationEntry) => {
    try {
      // Convert empty date strings to null
      const processedData = {
        ...data,
        publication_date:
          data.publication_date && data.publication_date.trim() !== ""
            ? data.publication_date
            : null,
      };

      const response = await fetch(makeUrl("studentsResumePublications"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(processedData),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setPublicationEntries([...publicationEntries, newEntry]);
        toast.success("Publication added successfully");
        setIsPublicationDialogOpen(false);
      } else {
        throw new Error("Failed to add publication");
      }
    } catch (error) {
      console.error("Error adding publication:", error);
      toast.error("Failed to add publication");
    }
  };

  // Certification handling removed - using existing certificate system

  const handleDeleteEducation = async (id: number) => {
    try {
      const response = await fetch(makeUrl("studentsResumeEducationById", { education_id: id }), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setEducationEntries(educationEntries.filter((entry) => entry.id !== id));
        toast.success("Education entry deleted successfully");
      } else {
        throw new Error("Failed to delete education entry");
      }
    } catch (error) {
      console.error("Error deleting education:", error);
      toast.error("Failed to delete education entry");
    }
  };

  const handleDeleteExperience = async (id: number) => {
    try {
      const response = await fetch(makeUrl("studentsResumeExperienceById", { experience_id: id }), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setExperienceEntries(experienceEntries.filter((entry) => entry.id !== id));
        toast.success("Experience entry deleted successfully");
      } else {
        throw new Error("Failed to delete experience entry");
      }
    } catch (error) {
      console.error("Error deleting experience:", error);
      toast.error("Failed to delete experience entry");
    }
  };

  const handleDeleteSkill = async (id: number) => {
    try {
      const response = await fetch(makeUrl("studentsResumeSkillsById", { skill_id: id }), {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSkillEntries(skillEntries.filter((entry) => entry.id !== id));
        toast.success("Skill deleted successfully");
      } else {
        throw new Error("Failed to delete skill");
      }
    } catch (error) {
      console.error("Error deleting skill:", error);
      toast.error("Failed to delete skill");
    }
  };

  const handleDeletePublication = async (id: number) => {
    try {
      const response = await fetch(
        makeUrl("studentsResumePublicationsById", { publication_id: id }),
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (response.ok) {
        setPublicationEntries(publicationEntries.filter((entry) => entry.id !== id));
        toast.success("Publication deleted successfully");
      } else {
        throw new Error("Failed to delete publication");
      }
    } catch (error) {
      console.error("Error deleting publication:", error);
      toast.error("Failed to delete publication");
    }
  };

  // Certification deletion removed - using existing certificate system

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-muted-foreground">Loading resume content...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Education Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <CardTitle>Education</CardTitle>
            </div>
            <Dialog open={isEducationDialogOpen} onOpenChange={setIsEducationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Education</DialogTitle>
                  <DialogDescription>
                    Add your educational background and achievements.
                  </DialogDescription>
                </DialogHeader>
                <EducationForm
                  onSubmit={handleAddEducation}
                  onCancel={() => setIsEducationDialogOpen(false)}
                  initialData={editingEducation}
                />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Your educational background, degrees, and academic achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {educationEntries.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No education entries</h3>
              <p className="text-muted-foreground mb-4">
                Add your educational background to showcase your academic achievements.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {educationEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{entry.major}</h4>
                        {entry.degree_type && <Badge variant="outline">{entry.degree_type}</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4" />
                          {entry.school}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {entry.location}
                        </span>
                        {entry.gpa && <span>GPA: {entry.gpa}</span>}
                      </div>
                      {entry.start_date && entry.end_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {entry.start_date} - {entry.end_date}
                        </div>
                      )}
                      {entry.description && <p className="text-sm">{entry.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingEducation(entry);
                          setIsEducationDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => entry.id && handleDeleteEducation(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              <CardTitle>Experience</CardTitle>
            </div>
            <Dialog open={isExperienceDialogOpen} onOpenChange={setIsExperienceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Experience</DialogTitle>
                  <DialogDescription>
                    Add your work experience and professional achievements.
                  </DialogDescription>
                </DialogHeader>
                <ExperienceForm
                  onSubmit={handleAddExperience}
                  onCancel={() => setIsExperienceDialogOpen(false)}
                  initialData={editingExperience}
                />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Your professional work experience and career achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          {experienceEntries.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No experience entries</h3>
              <p className="text-muted-foreground mb-4">
                Add your work experience to showcase your professional background.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {experienceEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{entry.title}</h4>
                        {entry.is_current && <Badge variant="default">Current</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{entry.company}</span>
                        {entry.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {entry.location}
                          </span>
                        )}
                      </div>
                      {entry.start_date && entry.end_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {entry.start_date} - {entry.is_current ? "Present" : entry.end_date}
                        </div>
                      )}
                      {entry.description && (
                        <div className="text-sm">
                          <ul className="list-disc list-inside space-y-1">
                            {entry.description
                              .split("\n")
                              .filter((line) => line.trim())
                              .map((line, idx) => (
                                <li key={idx}>{line.trim()}</li>
                              ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingExperience(entry);
                          setIsExperienceDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => entry.id && handleDeleteExperience(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              <CardTitle>Skills</CardTitle>
            </div>
            <Dialog open={isSkillDialogOpen} onOpenChange={setIsSkillDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Skill</DialogTitle>
                  <DialogDescription>Add your technical and soft skills.</DialogDescription>
                </DialogHeader>
                <SkillForm
                  onSubmit={handleAddSkill}
                  onCancel={() => setIsSkillDialogOpen(false)}
                  initialData={editingSkill}
                />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Your technical skills, programming languages, and competencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skillEntries.length === 0 ? (
            <div className="text-center py-8">
              <Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No skills added</h3>
              <p className="text-muted-foreground mb-4">
                Add your skills to showcase your technical and professional competencies.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skillEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="group relative bg-muted/50 px-2 py-1 rounded-md hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-sm">{entry.skill_name}</span>
                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-1 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => {
                          setEditingSkill(entry);
                          setIsSkillDialogOpen(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0"
                        onClick={() => entry.id && handleDeleteSkill(entry.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {(entry.category || entry.proficiency_level) && (
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {entry.category && entry.proficiency_level ? (
                        <span>
                          {entry.category} • {entry.proficiency_level}
                        </span>
                      ) : (
                        <span>{entry.category || entry.proficiency_level}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle>Publications</CardTitle>
            </div>
            <Dialog open={isPublicationDialogOpen} onOpenChange={setIsPublicationDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Publication
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Publication</DialogTitle>
                  <DialogDescription>
                    Add your research papers, articles, and publications.
                  </DialogDescription>
                </DialogHeader>
                <PublicationForm
                  onSubmit={handleAddPublication}
                  onCancel={() => setIsPublicationDialogOpen(false)}
                  initialData={editingPublication}
                />
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Your research papers, articles, and academic publications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {publicationEntries.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No publications</h3>
              <p className="text-muted-foreground mb-4">
                Add your publications to showcase your research and academic work.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {publicationEntries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{entry.title}</h4>
                        {entry.url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={entry.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                      {entry.authors && (
                        <p className="text-sm text-muted-foreground">Authors: {entry.authors}</p>
                      )}
                      {entry.venue && (
                        <p className="text-sm text-muted-foreground">Venue: {entry.venue}</p>
                      )}
                      {entry.publication_date && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {entry.publication_date}
                        </div>
                      )}
                      {entry.description && <p className="text-sm">{entry.description}</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingPublication(entry);
                          setIsPublicationDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => entry.id && handleDeletePublication(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications are handled by the existing certificate system in the dashboard */}
    </div>
  );
}

// Form Components
function EducationForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: EducationEntry) => void;
  onCancel: () => void;
  initialData?: EducationEntry | null;
}) {
  const [formData, setFormData] = useState<EducationEntry>({
    major: initialData?.major || "",
    school: initialData?.school || "",
    location: initialData?.location || "",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    gpa: initialData?.gpa || undefined,
    degree_type: initialData?.degree_type || "",
    description: initialData?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="major">Major/Field of Study *</Label>
          <Input
            id="major"
            value={formData.major}
            onChange={(e) => setFormData({ ...formData, major: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="school">School/University *</Label>
          <Input
            id="school"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="degree_type">Degree Type</Label>
          <Select
            value={formData.degree_type}
            onValueChange={(value) => setFormData({ ...formData, degree_type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select degree type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Associate">Associate</SelectItem>
              <SelectItem value="Bachelor's">Bachelor's</SelectItem>
              <SelectItem value="Master's">Master's</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
              <SelectItem value="Certificate">Certificate</SelectItem>
              <SelectItem value="Diploma">Diploma</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="gpa">GPA</Label>
          <Input
            id="gpa"
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={formData.gpa || ""}
            onChange={(e) =>
              setFormData({ ...formData, gpa: parseFloat(e.target.value) || undefined })
            }
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Additional details about your education..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Education</Button>
      </div>
    </form>
  );
}

function ExperienceForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: ExperienceEntry) => void;
  onCancel: () => void;
  initialData?: ExperienceEntry | null;
}) {
  const [formData, setFormData] = useState<ExperienceEntry>({
    title: initialData?.title || "",
    company: initialData?.company || "",
    location: initialData?.location || "",
    start_date: initialData?.start_date || "",
    end_date: initialData?.end_date || "",
    is_current: initialData?.is_current || false,
    description: initialData?.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Job Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="company">Company *</Label>
          <Input
            id="company"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            disabled={formData.is_current}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="is_current"
            checked={formData.is_current}
            onCheckedChange={(checked) => setFormData({ ...formData, is_current: checked })}
          />
          <Label htmlFor="is_current">Currently working here</Label>
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter each achievement or responsibility on a new line. Each line will be displayed as a bullet point."
          required
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Experience</Button>
      </div>
    </form>
  );
}

function SkillForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: SkillEntry) => void;
  onCancel: () => void;
  initialData?: SkillEntry | null;
}) {
  const [formData, setFormData] = useState<SkillEntry>({
    skill_name: initialData?.skill_name || "",
    category: initialData?.category || "",
    proficiency_level: initialData?.proficiency_level || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="skill_name">Skill Name *</Label>
        <Input
          id="skill_name"
          value={formData.skill_name}
          onChange={(e) => setFormData({ ...formData, skill_name: e.target.value })}
          required
        />
      </div>
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData({ ...formData, category: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Programming Languages">Programming Languages</SelectItem>
            <SelectItem value="Frameworks">Frameworks</SelectItem>
            <SelectItem value="Tools">Tools</SelectItem>
            <SelectItem value="Soft Skills">Soft Skills</SelectItem>
            <SelectItem value="Languages">Languages</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="proficiency_level">Proficiency Level</Label>
        <Select
          value={formData.proficiency_level}
          onValueChange={(value) => setFormData({ ...formData, proficiency_level: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select proficiency level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="Expert">Expert</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Skill</Button>
      </div>
    </form>
  );
}

function PublicationForm({
  onSubmit,
  onCancel,
  initialData,
}: {
  onSubmit: (data: PublicationEntry) => void;
  onCancel: () => void;
  initialData?: PublicationEntry | null;
}) {
  const [formData, setFormData] = useState<PublicationEntry>({
    title: initialData?.title || "",
    publication_date: initialData?.publication_date || "",
    url: initialData?.url || "",
    description: initialData?.description || "",
    authors: initialData?.authors || "",
    venue: initialData?.venue || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="authors">Authors</Label>
          <Input
            id="authors"
            value={formData.authors}
            onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
            placeholder="List all authors"
          />
        </div>
        <div>
          <Label htmlFor="venue">Venue</Label>
          <Input
            id="venue"
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            placeholder="Journal, Conference, etc."
          />
        </div>
        <div>
          <Label htmlFor="publication_date">Publication Date</Label>
          <Input
            id="publication_date"
            type="date"
            value={formData.publication_date}
            onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the publication..."
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Publication</Button>
      </div>
    </form>
  );
}

// CertificationForm component removed - using existing certificate system

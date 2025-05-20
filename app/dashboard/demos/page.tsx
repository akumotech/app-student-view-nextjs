"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Play,
  Github,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Trash2,
  Edit,
  ImageIcon,
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { DemoRead } from "@/lib/dashboard-types";
import { MainNav } from "@/components/dashboard-navbar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  demo_url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  github_url: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  technologies: z.string(),
  thumbnail_url: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
});

// Simple Badge component for demo tags
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground mr-1 mb-1">
      {children}
    </span>
  );
}

export default function DemosPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [demos, setDemos] = useState<DemoRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDemoId, setCurrentDemoId] = useState<number | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      demo_url: "",
      github_url: "",
      technologies: "",
      thumbnail_url: "",
    },
  });

  const getStudentId = () => {
    if (user && user.id) return user.id;
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.id) return parsed.id;
      } catch {}
    }
    return null;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchDemos();
  }, [isAuthenticated, router]);

  const fetchDemos = async () => {
    try {
      setIsLoading(true);
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const token = localStorage.getItem("authToken") || "";
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found");

      const response = await fetch(`${baseUrl}/students/${student_id}/demos`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          logout();
          return;
        }
        throw new Error(`Failed to fetch demos. Status: ${response.status}`);
      }

      const data = await response.json();
      setDemos(data);
    } catch (error) {
      console.error("Error fetching demos:", error);
      toast.error("Failed to load demos");
    } finally {
      setIsLoading(false);
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const token = localStorage.getItem("authToken") || "";
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found");

      // Only send required fields and correct key names to backend
      const payload: { title: string; link: string; description?: string } = {
        title: values.title,
        link: values.demo_url,
      };
      if (values.description) payload.description = values.description;

      const endpoint =
        isEditMode && currentDemoId
          ? `${baseUrl}/students/${student_id}/demos/${currentDemoId}`
          : `${baseUrl}/students/${student_id}/demos`;

      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditMode ? "update" : "create"} demo. Status: ${response.status}`
        );
      }

      await fetchDemos();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`Demo ${isEditMode ? "updated" : "created"} successfully`);
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} demo:`,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} demo`);
    }
  };

  const handleEdit = (demo: DemoRead) => {
    setIsEditMode(true);
    setCurrentDemoId(demo.id);

    form.reset({
      title: demo.title,
      description: demo.description,
      demo_url: demo.demo_url,
      github_url: demo.github_url,
      technologies: demo.technologies.join(", "),
      thumbnail_url: demo.thumbnail_url,
    });

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this demo?")) {
      return;
    }

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";
      const token = localStorage.getItem("authToken") || "";
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found");

      const response = await fetch(
        `${baseUrl}/students/${student_id}/demos/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete demo. Status: ${response.status}`);
      }

      await fetchDemos();
      toast.success("Demo deleted successfully");
    } catch (error) {
      console.error("Error deleting demo:", error);
      toast.error("Failed to delete demo");
    }
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setCurrentDemoId(null);
    form.reset({
      title: "",
      description: "",
      demo_url: "",
      github_url: "",
      technologies: "",
      thumbnail_url: "",
    });
    setIsDialogOpen(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="bg-background shadow">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Dashboard
            </h1>
            <MainNav />
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm">
            Logout
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">My Project Demos</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Demo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Demo" : "Add New Demo"}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Update your project demo information below."
                    : "Enter the details of your project demo below."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Personal Portfolio Website"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of your project"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="demo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Demo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Link to the live demo of your project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="github_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>GitHub URL (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://github.com/..."
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Link to the source code repository
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="technologies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Technologies</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="React, Node.js, MongoDB, etc. (comma separated)"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          List the technologies used, separated by commas
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="thumbnail_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thumbnail URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormDescription>
                          Link to a screenshot or thumbnail image of your
                          project
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">
                      {isEditMode ? "Update Demo" : "Add Demo"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading demos...</div>
        ) : demos.length === 0 ? (
          <div className="text-center py-10 bg-muted rounded-lg">
            <Play className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No demos yet</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Add your project demos to showcase your work.
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Demo
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {demos.map((demo) => (
              <Card key={demo.id} className="overflow-hidden flex flex-col">
                {demo.thumbnail_url ? (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={demo.thumbnail_url || "/placeholder.svg"}
                      alt={demo.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{demo.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(demo)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(demo.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {demo.description && (
                    <CardDescription className="line-clamp-2">
                      {demo.description}
                    </CardDescription>
                  )}
                </CardHeader>

                <CardContent className="pb-2 flex-grow">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Array.isArray(demo.technologies) &&
                      demo.technologies.map((tech, index) => (
                        <Badge key={index}>{tech}</Badge>
                      ))}
                  </div>
                </CardContent>

                <CardFooter className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <a
                      href={demo.demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Demo
                    </a>
                  </Button>

                  {demo.github_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      asChild
                    >
                      <a
                        href={demo.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center"
                      >
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </a>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

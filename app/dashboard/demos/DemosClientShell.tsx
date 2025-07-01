"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Play, Github, ExternalLink, MoreHorizontal, Plus, Trash2, Edit } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { DemoRead } from "@/lib/dashboard-types";
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
import { makeUrl, makeUrlWithParams } from "@/lib/utils";
import DemoSessionSignups from "./components/DemoSessionSignups";

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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground mr-1 mb-1">
      {children}
    </span>
  );
}

export default function DemosClientShell({
  initialDemos,
  user,
}: {
  initialDemos: DemoRead[];
  user: any;
}) {
  const router = useRouter();
  const [demos, setDemos] = useState<DemoRead[]>(initialDemos || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDemoId, setCurrentDemoId] = useState<number | null>(null);
  const [isNotStudent, setIsNotStudent] = useState(false);

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

  const fetchDemos = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsNotStudent(false);
      const response = await fetch(makeUrl("studentsDemos"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        } else if (response.status === 403) {
          setIsNotStudent(true);
          setDemos([]);
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
  }, [router]);

  const getStudentId = () => {
    if (user && user.student_id) return user.student_id;
    const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.student_id) return parsed.student_id;
      } catch {}
    }
    return null;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found for this operation.");
      const payload: { title: string; link: string; description?: string } = {
        title: values.title,
        link: values.demo_url,
      };
      if (values.description) payload.description = values.description;
      let endpoint = "";
      if (isEditMode && currentDemoId) {
        endpoint = makeUrlWithParams("/api/students/{student_id}/demos/{demo_id}", {
          student_id,
          demo_id: currentDemoId,
        });
      } else {
        endpoint = makeUrlWithParams("/api/students/{student_id}/demos", {
          student_id,
        });
      }
      const method = isEditMode ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditMode ? "update" : "create"} demo. Status: ${response.status}`,
        );
      }
      await fetchDemos();
      setIsDialogOpen(false);
      form.reset();
      toast.success(`Demo ${isEditMode ? "updated" : "created"} successfully`);
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} demo:`, error);
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
      technologies: Array.isArray(demo.technologies) ? demo.technologies.join(", ") : "",
      thumbnail_url: demo.thumbnail_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this demo?")) {
      return;
    }
    try {
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found for this operation.");
      const response = await fetch(
        makeUrlWithParams("/api/students/{student_id}/demos/{demo_id}", {
          student_id,
          demo_id: id,
        }),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        },
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

  return (
    <Tabs defaultValue="demos" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="demos">My Demos</TabsTrigger>
        <TabsTrigger value="sessions">Demo Sessions</TabsTrigger>
      </TabsList>

      <TabsContent value="demos" className="space-y-6">
        <div className="flex justify-between items-center">
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
                <DialogTitle>{isEditMode ? "Edit Demo" : "Add New Demo"}</DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Update your project demo information below."
                    : "Enter the details of your project demo below."}
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Personal Portfolio Website" {...field} />
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
                          <Textarea placeholder="Brief description of your project" {...field} />
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
                          <Input placeholder="https://github.com/..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit" disabled={isLoading}>
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
        ) : isNotStudent ? (
          <div className="text-center py-10 bg-muted rounded-lg">
            <h3 className="text-lg font-medium">You are not registered as a student.</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Please contact your instructor to register as a student.
            </p>
          </div>
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
                    <CardDescription className="line-clamp-2">{demo.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {Array.isArray(demo.technologies) &&
                      demo.technologies.map((tech, index) => <Badge key={index}>{tech}</Badge>)}
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1" asChild>
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
                    <Button variant="outline" size="sm" className="flex-1" asChild>
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
      </TabsContent>

      <TabsContent value="sessions" className="space-y-6">
        <DemoSessionSignups demos={demos} />
      </TabsContent>
    </Tabs>
  );
}

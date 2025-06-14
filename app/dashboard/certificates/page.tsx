"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Award, Plus } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CertificateRead } from "@/lib/dashboard-types";
import { MainNav } from "@/components/dashboard-navbar";
import { Textarea } from "@/components/ui/textarea";
import { CertificateCard } from "@/components/ui/certificate-card";
import { makeUrl, makeUrlWithParams } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  issuer: z.string().min(2, {
    message: "Issuer must be at least 2 characters.",
  }),
  date_issued: z.string(),
  date_expired: z.string(),
  credential_id: z.string().optional(),
  credential_url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
});

export default function CertificatesPage() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCertificateId, setCurrentCertificateId] = useState<
    number | null
  >(null);
  const [isNotStudent, setIsNotStudent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      issuer: "",
      date_issued: new Date().toISOString().split("T")[0],
      date_expired: "",
      credential_id: "",
      credential_url: "",
      description: "",
    },
  });

  const fetchCertificates = useCallback(async () => {
    try {
      setIsLoading(true);
      setIsNotStudent(false);
      const response = await fetch(makeUrl("studentsCertificates"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401) {
          logout();
          return;
        } else if (response.status === 403) {
          setIsNotStudent(true);
          setCertificates([]);
          return;
        }
        throw new Error(
          `Failed to fetch certificates. Status: ${response.status}`
        );
      }

      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Failed to load certificates");
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  const getStudentId = () => {
    if (user && user.student_id) return user.student_id;
    const storedUser =
      typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.student_id) return parsed.student_id;
      } catch {}
    }
    return null;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchCertificates();
  }, [isAuthenticated, router, fetchCertificates]);

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
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found");
      let endpoint = "";
      if (isEditMode && currentCertificateId) {
        endpoint = makeUrlWithParams(
          "/api/students/{student_id}/certificates/{certificate_id}",
          {
            student_id,
            certificate_id: currentCertificateId,
          }
        );
      } else {
        endpoint = makeUrlWithParams(
          "/api/students/{student_id}/certificates",
          {
            student_id,
          }
        );
      }
      const method = isEditMode ? "PUT" : "POST";
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditMode ? "update" : "create"} certificate. Status: ${response.status}`
        );
      }

      await fetchCertificates();
      setIsDialogOpen(false);
      form.reset();
      toast.success(
        `Certificate ${isEditMode ? "updated" : "created"} successfully`
      );
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} certificate:`,
        error
      );
      toast.error(`Failed to ${isEditMode ? "update" : "create"} certificate`);
    }
  };

  const handleEdit = (certificate: CertificateRead) => {
    setIsEditMode(true);
    setCurrentCertificateId(certificate.id);
    console.log(certificate);

    form.reset({
      name: certificate.name,
      issuer: certificate.issuer,
      date_issued: certificate.date_issued
        ? certificate.date_issued.split("T")[0]
        : "",
      date_expired: certificate.date_expired
        ? certificate.date_expired.split("T")[0]
        : "",
      credential_id: certificate.credential_id,
      credential_url: certificate.credential_url,
      description: certificate.description,
    });

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this certificate?")) {
      return;
    }

    try {
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found");

      const response = await fetch(
        makeUrlWithParams(
          "/api/students/{student_id}/certificates/{certificate_id}",
          {
            student_id,
            certificate_id: id,
          }
        ),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to delete certificate. Status: ${response.status}`
        );
      }

      await fetchCertificates();
      toast.success("Certificate deleted successfully");
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate");
    }
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setCurrentCertificateId(null);
    form.reset({
      name: "",
      issuer: "",
      date_issued: new Date().toISOString().split("T")[0],
      date_expired: "",
      credential_id: "",
      credential_url: "",
      description: "",
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
          <h2 className="text-xl font-semibold">My Certificates</h2>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? "Edit Certificate" : "Add New Certificate"}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode
                    ? "Update your certificate information below."
                    : "Enter the details of your certificate below."}
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. AWS Certified Solutions Architect"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="issuer"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issuer</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Amazon Web Services"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date_issued"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issue Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="date_expired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date Expired</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="credential_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential ID (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. ABC123XYZ" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="credential_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credential URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
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
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description of the certificate and skills it represents"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit">
                      {isEditMode ? "Update Certificate" : "Add Certificate"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="text-center py-10">Loading certificates...</div>
        ) : isNotStudent ? (
          <div className="text-center py-10 bg-muted rounded-lg">
            <Award className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">
              You are not registered as a student.
            </h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Please contact your instructor to register as a student.
            </p>
            <Button onClick={handleLogout}>
              <Plus className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        ) : certificates.length === 0 ? (
          <div className="text-center py-10 bg-muted rounded-lg">
            <Award className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium">No certificates yet</h3>
            <p className="text-muted-foreground mt-2 mb-4">
              Add your professional certifications to showcase your skills.
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Certificate
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

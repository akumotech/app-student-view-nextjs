"use client";

import { useState, ReactElement } from "react";
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
import { Award, Plus, ExternalLink, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import type { CertificateRead } from "@/lib/dashboard-types";
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
import { Badge } from "@/components/ui/badge";
import { CertificateCard } from "@/components/ui/certificate-card";
import { useAuth } from "@/lib/auth-context";
import { createCertificate, updateCertificate, deleteCertificate } from "../api/certificateActions";
import { sendGTMEvent } from "@next/third-parties/google";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  issuer: z.string().min(1, { message: "Issuer is required." }),
  date_issued: z.string().min(1, { message: "Issue date is required." }),
  date_expired: z.string().optional(),
  credential_id: z.string().optional(),
  credential_url: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  description: z.string().optional(),
});

type Props = {
  certificates: CertificateRead[];
  user: any;
};

export default function CertificatesClientShell({
  certificates: initialCertificates,
  user,
}: Props): ReactElement {
  const router = useRouter();
  const { logout } = useAuth();
  const [certificates, setCertificates] = useState<CertificateRead[]>(initialCertificates || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentCertificateId, setCurrentCertificateId] = useState<number | null>(null);

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

  const getStudentId = () => {
    if (user && user.student_id) return user.student_id;
    return null;
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
      setIsLoading(true);
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found");

      let result;
      if (isEditMode && currentCertificateId) {
        result = await updateCertificate(student_id, currentCertificateId, values);
      } else {
        result = await createCertificate(student_id, values);
      }

      if (result) {
        setIsDialogOpen(false);
        form.reset();
        toast.success(`Certificate ${isEditMode ? "updated" : "created"} successfully`);
        router.refresh(); // Refresh to get updated data
      } else {
        throw new Error(`Failed to ${isEditMode ? "update" : "create"} certificate`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "creating"} certificate:`, error);
      toast.error(`Failed to ${isEditMode ? "update" : "create"} certificate`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (certificate: CertificateRead) => {
    setIsEditMode(true);
    setCurrentCertificateId(certificate.id);
    form.reset({
      name: certificate.name,
      issuer: certificate.issuer,
      date_issued: certificate.date_issued ? certificate.date_issued.split("T")[0] : "",
      date_expired: certificate.date_expired ? certificate.date_expired.split("T")[0] : "",
      credential_id: certificate.credential_id,
      credential_url: certificate.credential_url,
      description: certificate.description,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;

    try {
      setIsLoading(true);
      const student_id = getStudentId();
      if (!student_id) throw new Error("No student ID found");

      const success = await deleteCertificate(student_id, id);
      if (success) {
        toast.success("Certificate deleted successfully");
        router.refresh(); // Refresh to get updated data
      } else {
        throw new Error("Failed to delete certificate");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate");
    } finally {
      setIsLoading(false);
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
    sendGTMEvent({ event: "buttonClicked", value: "addCertificate", user: user.name });
    setIsDialogOpen(true);
  };

  return (
    <>
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
              <DialogTitle>{isEditMode ? "Edit Certificate" : "Add New Certificate"}</DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Update your certificate information below."
                  : "Enter the details of your certificate below."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AWS Certified Solutions Architect" {...field} />
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
                        <Input placeholder="e.g. Amazon Web Services" {...field} />
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
    </>
  );
}

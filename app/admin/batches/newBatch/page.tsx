"use client";

import { useEffect, useState } from "react";

// Force dynamic rendering
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { makeUrl } from "@/lib/utils";

const batchFormSchema = z.object({
  name: z.string().min(3, "Batch name must be at least 3 characters"),
  slack_channel: z.string().min(1, "Slack channel is required"),
  start_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid start date",
  }),
  end_date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid end date",
  }),
  curriculum: z.string().optional(),
});

type BatchFormValues = z.infer<typeof batchFormSchema>;

export default function AdminCreateBatchPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login?error=unauthenticated");
      return;
    }
    if (!authLoading && isAuthenticated && user?.role !== "admin" && user?.role !== "instructor") {
      toast.error("You are not authorized to view this page.");
      router.replace("/dashboard?error=unauthorized_admin_page");
    }
  }, [authLoading, isAuthenticated, user, router]);

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchFormSchema),
    defaultValues: {
      name: "",
      slack_channel: "",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
      curriculum: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (values: BatchFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch(makeUrl("batches"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        const errorMessage =
          result.error ||
          result.message ||
          (result.detail
            ? typeof result.detail === "string"
              ? result.detail
              : JSON.stringify(result.detail)
            : "Failed to create batch. Please try again.");
        toast.error(errorMessage);
        return;
      }

      // If we get here, the response was ok (200-299)
      toast.success(result.message || "Batch created successfully!");
      const newBatch = result.data || result; // Handle different response structures
      form.reset();
      router.push(
        `/admin/batches?newBatchId=${newBatch.id}&batchName=${encodeURIComponent(newBatch.name)}&regKey=${encodeURIComponent(newBatch.registration_key)}`,
      );
    } catch (error) {
      console.error("Batch creation error:", error);
      toast.error("An unexpected error occurred during batch creation.");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== "admin" && user?.role !== "instructor")) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create New Batch</CardTitle>
          <CardDescription>
            Fill in the details below to create a new batch. You will be redirected to the admin
            dashboard where the new batch and its registration key will be shown.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Fall 2024 Cohort" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slack_channel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slack Channel</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., #fall-2024-batch" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
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
                name="curriculum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Curriculum / Focus (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Full-Stack Web Development with React & Node.js"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Batch..." : "Create Batch & View Key"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

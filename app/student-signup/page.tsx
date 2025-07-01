"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth, BackendAPIResponse } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { signupStudent } from "./api/signupStudent";

const studentSignupFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  batch_registration_key: z.string().min(1, { message: "Batch registration key is required." }),
});

type StudentSignupFormValues = z.infer<typeof studentSignupFormSchema>;

// For FastAPI HTTPValidationError (typically on 422 responses)
interface ValidationErrorDetail {
  loc: (string | number)[];
  msg: string;
  type: string;
}
interface HTTPValidationError {
  detail: ValidationErrorDetail[];
}

// Use the existing BackendAPIResponse type, data will be null or an empty object on success
type StudentSignupApiResponse = BackendAPIResponse<null | object>;

// This new component will contain the original logic
function StudentSignupFormContents() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, loading: authLoading, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const registrationKeyFromQuery = searchParams.get("key");

  const form = useForm<StudentSignupFormValues>({
    resolver: zodResolver(studentSignupFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      batch_registration_key: registrationKeyFromQuery || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard?message=already_logged_in");
    }
  }, [authLoading, isAuthenticated, router]);

  const onSubmit = async (values: StudentSignupFormValues) => {
    setIsLoading(true);
    try {
      const response = await signupStudent(
        values.name,
        values.email,
        values.password,
        values.batch_registration_key,
      );
      if (!response.success) {
        let apiErrorMessage = response.message || "Student signup failed. Please try again.";
        if (response.error) {
          if (typeof response.error === "string") {
            apiErrorMessage = response.error;
          } else if (Array.isArray(response.error)) {
            apiErrorMessage = response.error.join(", ");
          } else {
            apiErrorMessage = JSON.stringify(response.error);
          }
        }
        toast.error(apiErrorMessage);
      } else {
        toast.success(response.message || "Signup successful! Logging you in...");
        // Auto-login after signup
        const loginResp = await login(values.email, values.password);
        if (loginResp.success) {
          router.push("/dashboard");
        } else {
          toast.error("Signup succeeded, but login failed. Please log in manually.");
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Student signup error:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast.error(`Student signup failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Student Registration</CardTitle>
          <CardDescription>
            Create your account using the registration key provided by your instructor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="********" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="batch_registration_key"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Registration Key</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your batch key" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Log in here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// The default export page component will now wrap StudentSignupFormContents in Suspense
export default function StudentSignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p>Loading page...</p>
        </div>
      }
    >
      <StudentSignupFormContents />
    </Suspense>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectsErrorProps {
  message: string;
  onRetry?: () => void;
}

export default function ProjectsError({ message, onRetry }: ProjectsErrorProps) {
  return (
    <div className="min-h-screen bg-muted/40">
      <main className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
              <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-red-600 dark:text-red-400">Error Loading Projects</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            {onRetry && (
              <Button onClick={onRetry} variant="outline" className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

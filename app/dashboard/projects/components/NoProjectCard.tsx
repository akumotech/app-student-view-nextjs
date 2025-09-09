import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileX, Clock, Users } from "lucide-react";

export default function NoProjectCard() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FileX className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>No Project Assigned</CardTitle>
          <CardDescription>You haven't been assigned to any project yet.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Projects are typically assigned by administrators based on your batch and availability.
            Once assigned, you'll be able to view all project details, track your progress, and
            access related resources.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">Assignment Timeline</p>
                <p className="text-xs text-muted-foreground">
                  Projects are usually assigned at the beginning of each batch cycle
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">Contact Support</p>
                <p className="text-xs text-muted-foreground">
                  Reach out to your instructor if you have questions about project assignments
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

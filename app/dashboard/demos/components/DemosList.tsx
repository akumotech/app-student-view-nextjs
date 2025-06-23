"use client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ExternalLink, Github, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import type { DemoRead } from "@/lib/dashboard-types";
import React from "react";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground mr-1 mb-1">
      {children}
    </span>
  );
}

export default function DemosList({
  demos,
  onEdit,
  onDelete,
}: {
  demos: DemoRead[];
  onEdit?: (demo: DemoRead) => void;
  onDelete?: (id: number) => void;
}) {
  if (!demos.length) {
    return (
      <div className="text-center py-10 bg-muted rounded-lg">
        <h3 className="text-lg font-medium">No demos yet</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          Add your project demos to showcase your work.
        </p>
      </div>
    );
  }
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {demos.map((demo) => (
        <Card key={demo.id} className="overflow-hidden flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{demo.title}</CardTitle>
              {(onEdit || onDelete) && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {onEdit && (
                      <DropdownMenuItem onClick={() => onEdit(demo)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                    )}
                    {onDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(demo.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
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
  );
}

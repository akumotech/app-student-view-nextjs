"use client";

import {
  Calendar,
  ExternalLink,
  Link2,
  MoreHorizontal,
  Award,
  Edit,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { CertificateRead } from "@/lib/dashboard-types";
import { Badge } from "./badge";

interface CertificateCardProps {
  certificate: CertificateRead;
  onEdit: (certificate: CertificateRead) => void;
  onDelete: (id: number) => void;
}

export function CertificateCard({
  certificate,
  onEdit,
  onDelete,
}: CertificateCardProps) {
  const isExpired =
    certificate.date_expired && new Date(certificate.date_expired) < new Date();

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        {/* Decorative header with gradient */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-500 to-purple-500" />

        <CardHeader className="pt-6">
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-full bg-primary/10">
                <Award className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold line-clamp-2">
                  {certificate.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {certificate.issuer}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(certificate)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(certificate.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <div className="flex flex-wrap gap-x-2 gap-y-1">
              <span>
                <span className="text-muted-foreground">Issued:</span>{" "}
                <span className="font-medium">
                  {new Date(certificate.date_issued).toLocaleDateString()}
                </span>
              </span>

              {certificate.date_expired && (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    isExpired ? "text-destructive" : ""
                  )}
                >
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">Expires:</span>{" "}
                  <span className="font-medium">
                    {new Date(certificate.date_expired).toLocaleDateString()}
                  </span>
                  {isExpired && (
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 border-destructive text-destructive"
                    >
                      Expired
                    </Badge>
                  )}
                </span>
              )}
            </div>
          </div>

          {certificate.credential_id && (
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <Badge
                variant="secondary"
                className="font-mono text-xs px-2 py-0"
              >
                {certificate.credential_id}
              </Badge>
            </div>
          )}

          {certificate.description && (
            <div className="pt-1 border-t">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {certificate.description}
              </p>
            </div>
          )}
        </CardContent>

        {certificate.credential_url && (
          <CardFooter className="pt-0">
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1 hover:bg-primary/5"
              asChild
            >
              <a
                href={certificate.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Credential</span>
              </a>
            </Button>
          </CardFooter>
        )}
      </div>
    </Card>
  );
}

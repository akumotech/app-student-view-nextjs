"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Printer } from "lucide-react";
import type { UserOverview } from "./types";

interface StudentProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: UserOverview["student_detail"] | null;
}

// Type guard to ensure studentProfile has required fields
const isValidStudentProfile = (
  profile: UserOverview["student_detail"] | null,
): profile is NonNullable<UserOverview["student_detail"]> => {
  return profile !== null && profile !== undefined && profile.user !== undefined;
};

export default function StudentProfileDialog({
  isOpen,
  onClose,
  studentProfile,
}: StudentProfileDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    try {
      setIsPrinting(true);
      // Small delay to ensure state update
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 100);
    } catch (error) {
      console.error("Error printing:", error);
      setIsPrinting(false);
    }
  };

  if (!isValidStudentProfile(studentProfile)) return null;

  const { user, batch, project, certificates = [], demos = [], wakatime_stats } = studentProfile;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-foreground">
                Student Profile
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button variant="outline" size="sm" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <div className="space-y-6">
              {/* Student Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <div className="text-muted-foreground">{user.email}</div>
                  {batch && <div className="text-muted-foreground">Batch: {batch.name}</div>}
                </div>
                <div className="flex gap-2">
                  <Badge className="capitalize">{user.role}</Badge>
                  <Badge variant={user.disabled ? "destructive" : "secondary"}>
                    {user.disabled ? "Disabled" : "Active"}
                  </Badge>
                </div>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{certificates?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Total earned</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Demos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{demos?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Projects completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">WakaTime</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {wakatime_stats ? "Connected" : "Not Connected"}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {wakatime_stats ? "Active tracking" : "No data"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Project and WakaTime Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project ? (
                      <div className="space-y-2">
                        <div className="font-semibold">{project.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.start_date && <div>Start: {project.start_date}</div>}
                          {project.end_date && <div>End: {project.end_date}</div>}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No project assigned</div>
                    )}
                  </CardContent>
                </Card>

                {/* WakaTime Stats */}
                {wakatime_stats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>7 Days Average Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <span className="font-semibold">Total Time:</span>{" "}
                          {wakatime_stats?.text || wakatime_stats?.digital || "—"}
                        </div>
                        <div>
                          <span className="font-semibold">Hours:</span>{" "}
                          {wakatime_stats?.hours || "—"}
                        </div>
                        <div>
                          <span className="font-semibold">Last Updated:</span>{" "}
                          {wakatime_stats?.last_updated
                            ? new Date(wakatime_stats.last_updated).toLocaleString()
                            : "—"}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Certificates Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Certificates ({certificates?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {certificates && certificates.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Issuer</TableHead>
                            <TableHead>Date Issued</TableHead>
                            <TableHead>Date Expired</TableHead>
                            <TableHead>Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {certificates.map((cert) => (
                            <TableRow key={cert.id}>
                              <TableCell className="font-medium">{cert.name}</TableCell>
                              <TableCell>{cert.issuer || "—"}</TableCell>
                              <TableCell>{cert.date_issued || "—"}</TableCell>
                              <TableCell>{cert.date_expired || "—"}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {cert.description || "—"}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No certificates found</p>
                  )}
                </CardContent>
              </Card>

              {/* Demos Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Demos ({demos?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                  {demos && demos.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Demo Date</TableHead>
                            <TableHead>Status</TableHead>
                            {/* <TableHead>GitHub</TableHead> */}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {demos.map((demo) => (
                            <TableRow key={demo.id}>
                              <TableCell className="font-medium">{demo.title}</TableCell>
                              <TableCell className="max-w-xs truncate">
                                {demo.description || "—"}
                              </TableCell>
                              <TableCell>{demo.demo_date || "—"}</TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="capitalize">
                                  {demo.status || "Unknown"}
                                </Badge>
                              </TableCell>
                              {/* <TableCell>
                                {demo.github_url ? (
                                  <a
                                    href={demo.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    View
                                  </a>
                                ) : (
                                  "—"
                                )}
                              </TableCell> */}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No demos found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          .print-content,
          .print-content * {
            visibility: visible;
          }

          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            color: black;
            font-size: 12px;
            line-height: 1.4;
          }

          .print-content .no-print {
            display: none !important;
          }

          .print-content .bg-muted\\/30 {
            background: #f5f5f5 !important;
            border: 1px solid #ddd !important;
          }

          .print-content .border {
            border: 1px solid #ddd !important;
          }

          .print-content .shadow {
            box-shadow: none !important;
          }

          .print-content .rounded-lg {
            border-radius: 4px !important;
          }

          .print-content table {
            border-collapse: collapse;
            width: 100%;
          }

          .print-content th,
          .print-content td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: left;
          }

          .print-content th {
            background: #f5f5f5;
            font-weight: bold;
          }

          .print-content .page-break {
            page-break-before: always;
          }

          .print-content h1,
          .print-content h2,
          .print-content h3 {
            color: black !important;
            margin: 8px 0 4px 0;
          }

          .print-content .text-muted-foreground {
            color: #666 !important;
          }

          .print-content .text-blue-600 {
            color: #0066cc !important;
          }
        }
      `}</style>

      {/* Print Content */}
      {isPrinting && (
        <div className="print-content">
          <div className="p-6">
            {/* Print Header */}
            <div className="text-center mb-6 border-b pb-4">
              <h1 className="text-2xl font-bold">{user.name} - Student Profile</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="text-sm text-muted-foreground">
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>

            {/* Student Info */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h2 className="font-bold">Student Information</h2>
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {user.role}
                  </p>
                  <p>
                    <strong>Status:</strong> {user.disabled ? "Disabled" : "Active"}
                  </p>
                </div>
                <div>
                  <h2 className="font-bold">Academic Information</h2>
                  <p>
                    <strong>Batch:</strong> {batch?.name || "Not assigned"}
                  </p>
                  <p>
                    <strong>Project:</strong> {project?.name || "Not assigned"}
                  </p>
                  <p>
                    <strong>Certificates:</strong> {certificates?.length || 0}
                  </p>
                  <p>
                    <strong>Demos:</strong> {demos?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificates */}
            {certificates && certificates.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Certificates ({certificates.length})</h2>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Issuer</th>
                      <th>Date Issued</th>
                      <th>Date Expired</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((cert) => (
                      <tr key={cert.id}>
                        <td>{cert.name}</td>
                        <td>{cert.issuer || "—"}</td>
                        <td>{cert.date_issued || "—"}</td>
                        <td>{cert.date_expired || "—"}</td>
                        <td>{cert.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Demos */}
            {demos && demos.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">Demos ({demos.length})</h2>
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Demo Date</th>
                      <th>Status</th>
                      <th>GitHub URL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demos.map((demo) => (
                      <tr key={demo.id}>
                        <td>{demo.title}</td>
                        <td>{demo.description || "—"}</td>
                        <td>{demo.demo_date || "—"}</td>
                        <td>{demo.status || "—"}</td>
                        <td>{demo.github_url || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* WakaTime Stats */}
            {wakatime_stats && (
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">WakaTime Statistics</h2>
                <div className="p-4 border rounded">
                  <p>
                    <strong>Total Time:</strong>{" "}
                    {wakatime_stats?.text || wakatime_stats?.digital || "—"}
                  </p>
                  <p>
                    <strong>Hours:</strong> {wakatime_stats?.hours || "—"}
                  </p>
                  <p>
                    <strong>Last Updated:</strong>{" "}
                    {wakatime_stats?.last_updated
                      ? new Date(wakatime_stats.last_updated).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

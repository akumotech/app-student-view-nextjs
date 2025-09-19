"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Trash2, Plus, Search, Filter } from "lucide-react";
import type { Certificate, CertificateCreate, CertificateUpdate } from "../api/fetchCertificates";
import type { UserOverview } from "../components/types";
import type { BatchRead } from "../components/types";
import {
  fetchCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from "../api/fetchCertificates";
import { fetchUsers } from "../api/fetchUsers";
import { fetchBatches } from "../api/fetchBatches";
import CertificateEditDialog from "./components/CertificateEditDialog";

interface CertificatesClientProps {
  initialCertificates: Certificate[];
  initialUsers: UserOverview[];
  initialBatches: BatchRead[];
}

export default function CertificatesClient({
  initialCertificates,
  initialUsers,
  initialBatches,
}: CertificatesClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [certificates, setCertificates] = useState<Certificate[]>(initialCertificates || []);
  const [users, setUsers] = useState<UserOverview[]>(
    Array.isArray(initialUsers) ? initialUsers : [],
  );
  const [batches, setBatches] = useState<BatchRead[]>(initialBatches || []);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);

  // Reset student filter when batch changes
  useEffect(() => {
    setSelectedStudentId(null);
  }, [selectedBatchId]);

  // Get students filtered by selected batch (for student dropdown)
  const availableStudents = selectedBatchId
    ? (users || []).filter((user) => user.student_detail?.batch?.id === selectedBatchId)
    : [];

  // Filter certificates based on search and filters
  const filteredCertificates = (certificates || []).filter((cert) => {
    // Search filter (works across all certificates, independent of batch/student filters)
    const matchesSearch =
      !searchTerm ||
      cert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description?.toLowerCase().includes(searchTerm.toLowerCase());

    // Sequential filtering: Batch first, then Student within that batch
    if (selectedBatchId) {
      // If batch is selected, check if certificate belongs to a student in that batch
      const certUser = (users || []).find((u) => u.id === cert.student_id);
      const matchesBatch = certUser?.student_detail?.batch?.id === selectedBatchId;

      if (!matchesBatch) return false;

      // If student is also selected, check if certificate belongs to that specific student
      if (selectedStudentId) {
        const matchesStudent = cert.student_id === selectedStudentId;
        return matchesSearch && matchesStudent;
      }

      return matchesSearch;
    }

    // If no batch selected, apply search only (show all certificates matching search)
    return matchesSearch;
  });

  const refetchData = async () => {
    setIsLoading(true);
    try {
      const [newCertificates, newUsers, newBatches] = await Promise.all([
        fetchCertificates(selectedStudentId || undefined, selectedBatchId || undefined),
        fetchUsers(),
        fetchBatches(),
      ]);

      if (newCertificates) setCertificates(newCertificates);
      if (newUsers && Array.isArray(newUsers)) setUsers(newUsers);
      if (newBatches) setBatches(newBatches);
    } catch (error) {
      console.error("Error refetching data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCertificate = async (
    certificateData: CertificateCreate | CertificateUpdate,
    studentId: number,
  ) => {
    try {
      const newCertificate = await createCertificate(
        certificateData as CertificateCreate,
        studentId,
      );
      if (newCertificate) {
        setCertificates((prev) => [...prev, newCertificate]);
        toast.success("Certificate created successfully!");
        setIsCreateDialogOpen(false);
        await refetchData();
      } else {
        toast.error("Failed to create certificate");
      }
    } catch (error) {
      console.error("Error creating certificate:", error);
      toast.error("Failed to create certificate");
    }
  };

  const handleEditCertificate = async (
    certificateId: number,
    certificateData: CertificateUpdate,
  ) => {
    try {
      const updatedCertificate = await updateCertificate(certificateId, certificateData);
      if (updatedCertificate) {
        setCertificates((prev) =>
          prev.map((cert) => (cert.id === certificateId ? updatedCertificate : cert)),
        );
        toast.success("Certificate updated successfully!");
        setIsEditDialogOpen(false);
        setEditingCertificate(null);
        await refetchData();
      } else {
        toast.error("Failed to update certificate");
      }
    } catch (error) {
      console.error("Error updating certificate:", error);
      toast.error("Failed to update certificate");
    }
  };

  const handleDeleteCertificate = async (certificateId: number) => {
    if (!confirm("Are you sure you want to delete this certificate?")) {
      return;
    }

    try {
      const success = await deleteCertificate(certificateId);
      if (success) {
        setCertificates((prev) => prev.filter((cert) => cert.id !== certificateId));
        toast.success("Certificate deleted successfully!");
        await refetchData();
      } else {
        toast.error("Failed to delete certificate");
      }
    } catch (error) {
      console.error("Error deleting certificate:", error);
      toast.error("Failed to delete certificate");
    }
  };

  const handleEditClick = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setEditingCertificate(null);
  };

  const getStudentName = (studentId: number) => {
    if (!Array.isArray(users)) return `Student ${studentId}`;
    const student = users.find((u) => u.id === studentId);
    return student ? `${student.name} (${student.email})` : `Student ${studentId}`;
  };

  const getStudentBatch = (studentId: number) => {
    if (!Array.isArray(users) || !Array.isArray(batches)) return "No batch";
    const student = users.find((u) => u.id === studentId);
    if (!student?.student_detail?.batch?.id) return "No batch";
    const batch = batches.find((b) => b.id === student.student_detail?.batch?.id);
    return batch ? batch.name : "Unknown batch";
  };

  if (!user || user.role !== "admin") {
    router.push("/login");
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Certificates</h1>
          <p className="text-gray-600 mt-2">Manage student certificates and achievements</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Certificate
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search certificates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Student</label>
              <select
                value={selectedStudentId || ""}
                onChange={(e) =>
                  setSelectedStudentId(e.target.value ? Number(e.target.value) : null)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedBatchId}
              >
                <option value="">
                  {selectedBatchId ? "All Students in Batch" : "Select a batch first"}
                </option>
                {availableStudents.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Batch</label>
              <select
                value={selectedBatchId || ""}
                onChange={(e) => setSelectedBatchId(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Batches</option>
                {Array.isArray(batches) &&
                  batches.map((batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Certificates Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Certificates</CardTitle>
          <CardDescription>
            {filteredCertificates.length} certificate{filteredCertificates.length !== 1 ? "s" : ""}{" "}
            found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Certificate Name</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Issuer</TableHead>
                  <TableHead>Date Issued</TableHead>
                  <TableHead>Date Expired</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCertificates.map((certificate) => (
                  <TableRow key={certificate.id}>
                    <TableCell className="font-medium">{certificate.name}</TableCell>
                    <TableCell>{getStudentName(certificate.student_id)}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{getStudentBatch(certificate.student_id)}</Badge>
                    </TableCell>
                    <TableCell>{certificate.issuer || "—"}</TableCell>
                    <TableCell>
                      {certificate.date_issued
                        ? new Date(certificate.date_issued).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {certificate.date_expired
                        ? new Date(certificate.date_expired).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {certificate.description || "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(certificate)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCertificate(certificate.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CertificateEditDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateCertificate}
        users={Array.isArray(users) ? users : []}
        title="Create Certificate"
      />

      {editingCertificate && (
        <CertificateEditDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onSubmit={(data, studentId) => handleEditCertificate(editingCertificate.id, data)}
          users={Array.isArray(users) ? users : []}
          title="Edit Certificate"
          initialData={editingCertificate}
        />
      )}
    </div>
  );
}

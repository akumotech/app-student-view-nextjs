"use client";
import type { CertificateRead } from "@/lib/dashboard-types";

export default function CertificatesList({ certificates }: { certificates: CertificateRead[] }) {
  return (
    <div>
      <h2>Your Certificates</h2>
      <ul>
        {certificates.map((cert) => (
          <li key={cert.id}>
            <strong>{cert.name}</strong> — {cert.issuer} ({cert.date_issued})
          </li>
        ))}
      </ul>
    </div>
  );
}

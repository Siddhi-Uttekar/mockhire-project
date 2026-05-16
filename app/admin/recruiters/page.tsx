"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Recruiter {
  id: string;
  name: string;
  email: string;
  companyName: string;
  companyWebsite: string;
  linkedinProfile: string;
}

export default function AdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState<Recruiter[]>([]);

  useEffect(() => {
    async function fetchRecruiters() {
      try {
        const response = await fetch("/api/admin/recruiters/pending");
        if (!response.ok) {
          throw new Error("Failed to fetch recruiters");
        }
        const data = await response.json();
        setRecruiters(data);
      } catch (error) {
        toast.error("Failed to fetch pending recruiters.");
      }
    }
    fetchRecruiters();
  }, []);

  async function handleVerification(userId: string, status: "VERIFIED" | "REJECTED") {
    try {
      const response = await fetch("/api/admin/recruiters/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update recruiter status");
      }

      setRecruiters((prevRecruiters) =>
        prevRecruiters.filter((recruiter) => recruiter.id !== userId)
      );
      toast.success(`Recruiter has been ${status.toLowerCase()}.`);
    } catch (error) {
      toast.error("Failed to update recruiter status.");
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Pending Recruiter Verifications</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Company</th>
              <th className="py-2">Website</th>
              <th className="py-2">LinkedIn</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {recruiters.map((recruiter) => (
              <tr key={recruiter.id}>
                <td className="border px-4 py-2">{recruiter.name}</td>
                <td className="border px-4 py-2">{recruiter.email}</td>
                <td className="border px-4 py-2">{recruiter.companyName}</td>
                <td className="border px-4 py-2">
                  <a href={recruiter.companyWebsite} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </td>
                <td className="border px-4 py-2">
                  <a href={recruiter.linkedinProfile} target="_blank" rel="noopener noreferrer">
                    Link
                  </a>
                </td>
                <td className="border px-4 py-2">
                  <Button onClick={() => handleVerification(recruiter.id, "VERIFIED")}>
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleVerification(recruiter.id, "REJECTED")}
                    className="ml-2"
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import JobPostingForm from "@/components/JobPostingForm";
import RecruiterNavbar from "@/components/RecruiterNavbar";
import { toast } from "sonner";

const EditJobPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/jobs/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setJob(data.job);
        } else {
          toast.error("Failed to fetch job details.");
        }
      } catch (error) {
        toast.error("An error occurred while fetching job details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchJob();
    }
  }, [id]);

  return (
    <div>
      <RecruiterNavbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Edit Job</h1>
        <div className="max-w-2xl mx-auto">
          {isLoading ? (
            <p>Loading...</p>
          ) : job ? (
            <JobPostingForm job={job} />
          ) : (
            <p>Job not found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditJobPage;
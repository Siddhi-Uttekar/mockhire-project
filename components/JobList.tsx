"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Trash2,
  Edit,
  MapPin,
  Eye,
  Users,
  Clock,
  DollarSign,
  Briefcase,
  Globe,
  Plus,
  MoreVertical,
  Archive,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  aboutCompany?: string;
  responsibilities?: string;
  qualifications?: string;
  benefits?: string;
  createdAt: string;
  status?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  category?: string;
  remote?: boolean;
  viewCount?: number;
  _count?: {
    applications: number;
  };
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PUBLISHED: "bg-pink-950/20 text-orange-300",
  CLOSED: "bg-red-100 text-red-800",
  ARCHIVED: "bg-yellow-100 text-yellow-800",
};

const JobList = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const fetchJobs = async () => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You must be logged in to view jobs.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/jobs?recruiter=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        toast.error("Failed to fetch jobs.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching jobs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleDelete = async (jobId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this job? This action cannot be undone.",
      )
    ) {
      try {
        const token =
          localStorage.getItem("token") || localStorage.getItem("accessToken");
        const response = await fetch(`/api/jobs/${jobId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          toast.success("Job deleted successfully");
          fetchJobs();
        } else {
          toast.error("Failed to delete job.");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the job.");
      }
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success(`Job ${newStatus.toLowerCase()}`);
        fetchJobs();
      } else {
        toast.error("Failed to update job status.");
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  };

  const formatJobType = (type: string) => {
    return (
      type
        ?.replace("_", " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase()) || ""
    );
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const formatNum = (n: number) => {
      if (n >= 1000) return `$${(n / 1000).toFixed(0)}k`;
      return `$${n}`;
    };
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}`;
    if (min) return `From ${formatNum(min)}`;
    if (max) return `Up to ${formatNum(max)}`;
    return null;
  };

  const filteredJobs =
    jobs.filter((job) => {
      if (filter !== "all" && job.status !== filter) return false;
      if (filterCategory && job.category !== filterCategory) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!job.title.toLowerCase().includes(query) && !job.description.toLowerCase().includes(query)) return false;
      }
      return true;
    });

  const jobCounts = {
    all: jobs.length,
    PUBLISHED: jobs.filter((j) => j.status === "PUBLISHED").length,
    DRAFT: jobs.filter((j) => j.status === "DRAFT").length,
    CLOSED: jobs.filter((j) => j.status === "CLOSED").length,
  };

  const uniqueCategories = Array.from(new Set(jobs.map((j) => j.category).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-950/100"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={
              filter === "all" ? "bg-blue-900 hover:bg-slate-800" : ""
            }
          >
            All ({jobCounts.all})
          </Button>
          <Button
            variant={filter === "PUBLISHED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("PUBLISHED")}
            className={
              filter === "PUBLISHED"
                ? "bg-blue-900 hover:bg-slate-800"
                : ""
            }
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Active ({jobCounts.PUBLISHED})
          </Button>
          <Button
            variant={filter === "DRAFT" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("DRAFT")}
            className={
              filter === "DRAFT" ? "bg-blue-900 hover:bg-slate-800" : ""
            }
          >
            Drafts ({jobCounts.DRAFT})
          </Button>
          <Button
            variant={filter === "CLOSED" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("CLOSED")}
            className={
              filter === "CLOSED" ? "bg-blue-900 hover:bg-slate-800" : ""
            }
          >
            <XCircle className="w-3 h-3 mr-1" />
            Closed ({jobCounts.CLOSED})
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="">All Categories</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Link href="/recruiter/post-job">
            <Button className="bg-blue-900 hover:bg-slate-800">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {jobs.length === 0
                ? "No jobs posted yet"
                : `No ${filter.toLowerCase()} jobs`}
            </h2>
            <p className="text-gray-500 mb-4">
              {jobs.length === 0
                ? "Start by posting your first job listing"
                : "Try a different filter"}
            </p>
            {jobs.length === 0 && (
              <Link href="/recruiter/post-job">
                <Button className="bg-blue-900 hover:bg-slate-800">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Your First Job
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Job Info */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-semibold">{job.title}</h3>
                          <Badge
                            className={STATUS_COLORS[job.status || "DRAFT"]}
                          >
                            {job.status || "DRAFT"}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          {job.remote && (
                            <span className="flex items-center gap-1">
                              <Globe className="w-4 h-4" />
                              Remote
                            </span>
                          )}
                          {job.jobType && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-4 h-4" />
                              {formatJobType(job.jobType)}
                            </span>
                          )}
                          {formatSalary(job.salaryMin, job.salaryMax) && (
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {formatSalary(job.salaryMin, job.salaryMax)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-600 line-clamp-2">
                      {job.description}
                    </p>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {job.skills.slice(0, 5).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 5}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Posted{" "}
                        {formatDistanceToNow(new Date(job.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {job.viewCount || 0} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {job._count?.applications || 0} applications
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center gap-2">
                    <Link href={`/recruiter/edit-job/${job.id}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </Link>

                    {job.status === "DRAFT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-orange-300 border-pink-950/20 hover:bg-pink-950/10"
                        onClick={() => handleStatusChange(job.id, "PUBLISHED")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Publish
                      </Button>
                    )}

                    {job.status === "PUBLISHED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-orange-600 border-orange-200 hover:bg-orange-50"
                        onClick={() => handleStatusChange(job.id, "CLOSED")}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Close
                      </Button>
                    )}

                    {job.status === "CLOSED" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-orange-300 border-pink-950/20 hover:bg-pink-950/10"
                        onClick={() => handleStatusChange(job.id, "PUBLISHED")}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Reopen
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDelete(job.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobList;

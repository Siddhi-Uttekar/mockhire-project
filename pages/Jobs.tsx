"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  MapPin,
  Clock,
  DollarSign,
  Building,
  Briefcase,
  Search,
  Filter,
  Globe,
  ChevronDown,
  X,
} from "lucide-react";

interface Job {
  id: string;
  title: string;
  location: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  recruiterId: string;
  status?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  category?: string;
  remote?: boolean;
  applicationDeadline?: string;
  viewCount?: number;
  recruiter?: {
    id: string;
    name?: string;
    companyName?: string;
  };
  _count?: {
    applications: number;
  };
}

const JOB_TYPES = [
  { value: "", label: "All Types" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

const EXPERIENCE_LEVELS = [
  { value: "", label: "All Levels" },
  { value: "ENTRY_LEVEL", label: "Entry Level" },
  { value: "MID_LEVEL", label: "Mid Level" },
  { value: "SENIOR", label: "Senior" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
];

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "Engineering", label: "Engineering" },
  { value: "Design", label: "Design" },
  { value: "Marketing", label: "Marketing" },
  { value: "Sales", label: "Sales" },
  { value: "Product", label: "Product" },
  { value: "Operations", label: "Operations" },
  { value: "Finance", label: "Finance" },
  { value: "HR", label: "HR" },
  { value: "Legal", label: "Legal" },
  { value: "Other", label: "Other" },
];

const Jobs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [jobType, setJobType] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [category, setCategory] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (jobType) params.append("jobType", jobType);
      if (experienceLevel) params.append("experienceLevel", experienceLevel);
      if (category) params.append("category", category);
      if (remoteOnly) params.append("remote", "true");
      params.append("page", page.toString());
      params.append("limit", "12");

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      if (data?.jobs) {
        setJobs(data.jobs);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotal(data.pagination?.total || data.jobs.length);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, jobType, experienceLevel, category, remoteOnly, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  async function handleApply(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedJob) return;
    setSubmitting(true);
    setErrorMessage(null);

    const formEl = e.currentTarget as HTMLFormElement;
    const form = new FormData(formEl);
    form.append("jobId", String(selectedJob.id));

    // Add auth token if available
    const token = localStorage.getItem("accessToken");

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/applications", {
        method: "POST",
        headers,
        body: form,
      });
      const data = await res.json();

      if (data?.success) {
        setSuccessMessage("Application submitted successfully!");
        formEl.reset();
        setSelectedJob(null);
      } else {
        setErrorMessage(data?.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to submit application.");
    } finally {
      setSubmitting(false);
      setTimeout(() => {
        setSuccessMessage(null);
        setErrorMessage(null);
      }, 5000);
    }
  }

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

  const clearFilters = () => {
    setSearchQuery("");
    setJobType("");
    setExperienceLevel("");
    setCategory("");
    setRemoteOnly(false);
    setPage(1);
  };

  const hasFilters =
    searchQuery || jobType || experienceLevel || category || remoteOnly;

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero Section */}
      <div className="bg-card border-b border-border py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Find Your Dream Job
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Discover {total} job opportunities from top companies
          </p>

          {/* Search Bar */}
          <div className="bg-background rounded-lg p-2 flex flex-col md:flex-row gap-2 max-w-3xl border border-border shadow-sm">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search jobs by title, skills, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent focus-visible:ring-0 px-0 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="md:w-auto text-foreground border-border hover:bg-card"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasFilters && (
                <Badge className="ml-2 bg-primary text-primary-foreground">
                  Active
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6 bg-card border-border">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Filters</h3>
                {hasFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    Clear all
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => {
                      setJobType(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {JOB_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => {
                      setExperienceLevel(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {EXPERIENCE_LEVELS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setPage(1);
                    }}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={remoteOnly}
                      onChange={(e) => {
                        setRemoteOnly(e.target.checked);
                        setPage(1);
                      }}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="flex items-center gap-1">
                      <Globe className="w-4 h-4" />
                      Remote only
                    </span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results count */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-muted-foreground">
            Showing {jobs.length} of {total} jobs
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-950/100"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No jobs found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="h-full hover:shadow-lg transition-shadow border border-border hover:border-amber-300 bg-card"
                >
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-2">
                        <h2 className="font-bold text-xl line-clamp-1">
                          {job.title}
                        </h2>
                        {job.remote && (
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            <Globe className="w-3 h-3 mr-1" />
                            Remote
                          </Badge>
                        )}
                      </div>
                      <p className="text-amber-200 font-medium flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {job.recruiter?.companyName || "Company"}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-muted-foreground line-clamp-2 text-sm">
                        {job.description}
                      </p>
                    </div>

                    {/* Job Meta */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location}
                      </div>
                      {job.jobType && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Briefcase className="w-4 h-4 mr-2" />
                          {formatJobType(job.jobType)}
                          {job.experienceLevel &&
                            ` · ${formatJobType(job.experienceLevel)}`}
                        </div>
                      )}
                      {formatSalary(job.salaryMin, job.salaryMax) && (
                        <div className="flex items-center text-sm text-muted-foreground">
                          <DollarSign className="w-4 h-4 mr-2" />
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </div>
                      )}
                    </div>

                    {/* Skills */}
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {job.skills.slice(0, 3).map((skill, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{job.skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      {job._count?.applications !== undefined && (
                        <span>{job._count.applications} applicants</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/jobs/${job.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </Link>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => setSelectedJob(job)}
                          >
                            Apply Now
                          </Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
                          <DialogTitle>
                            Apply for {selectedJob?.title}
                          </DialogTitle>
                          <DialogDescription>
                            {selectedJob?.recruiter?.companyName && (
                              <span>
                                at {selectedJob.recruiter.companyName}
                              </span>
                            )}
                          </DialogDescription>

                          <form
                            className="mt-4 space-y-4"
                            onSubmit={handleApply}
                          >
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium mb-1 block text-foreground">
                                  First Name *
                                </label>
                                <Input
                                  name="firstName"
                                  placeholder="John"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block text-foreground">
                                  Last Name *
                                </label>
                                <Input
                                  name="lastName"
                                  placeholder="Doe"
                                  required
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-sm font-medium mb-1 block text-foreground">
                                  Email *
                                </label>
                                <Input
                                  name="email"
                                  type="email"
                                  placeholder="john@example.com"
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block text-foreground">
                                  Phone *
                                </label>
                                <Input
                                  name="phone"
                                  placeholder="+1 234 567 8900"
                                  required
                                />
                              </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium mb-1 block text-foreground">
                                LinkedIn Profile
                              </label>
                              <Input
                                name="linkedin"
                                placeholder="https://linkedin.com/in/yourprofile"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-1 block">
                                Cover Letter
                              </label>
                              <textarea
                                name="coverLetter"
                                placeholder="Tell us why you're interested in this role..."
                                className="w-full border border-border bg-background rounded-md p-3 min-h-[100px] text-foreground placeholder:text-muted-foreground"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium mb-1 block">
                                Resume (PDF/DOC) *
                              </label>
                              <Input
                                name="resume"
                                type="file"
                                accept=".pdf,.doc,.docx"
                                required
                              />
                            </div>

                            {errorMessage && (
                              <div className="p-3 bg-red-950/20 text-red-100 rounded-md text-sm border border-red-500/30">
                                {errorMessage}
                              </div>
                            )}

                            {successMessage && (
                              <div className="p-3 bg-amber-500/15 text-amber-100 rounded-md text-sm border border-amber-400/30">
                                {successMessage}
                              </div>
                            )}

                            <DialogFooter className="gap-2">
                              <DialogClose asChild>
                                <Button type="button" variant="outline">
                                  Cancel
                                </Button>
                              </DialogClose>
                              <Button
                                type="submit"
                                disabled={submitting}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                              >
                                {submitting
                                  ? "Submitting..."
                                  : "Submit Application"}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;

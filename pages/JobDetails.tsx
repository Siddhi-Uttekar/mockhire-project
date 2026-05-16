"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { redirect, useParams, useRouter } from "next/navigation";
import Link from "next/link";
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
  Globe,
  Calendar,
  Eye,
  Users,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

const JobDetails = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);

  useEffect(() => {
    if (!id) {
      redirect("/jobs");
      return;
    }

    async function fetchJob() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        if (data?.success && data.job) {
          setJob(data.job);
        } else {
          setJob(null);
        }
      } catch (err) {
        console.error(err);
        setJob(null);
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  const handleApply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!job) return;

    setSubmitting(true);
    setErrorMessage(null);

    const formEl = e.currentTarget as HTMLFormElement;
    const form = new FormData(formEl);
    form.append("jobId", job.id);

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
        setShowApplyDialog(false);
        formEl.reset();
      } else {
        setErrorMessage(data?.message || "Failed to submit application.");
      }
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to submit application.");
    } finally {
      setSubmitting(false);
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
    if (min && max) return `${formatNum(min)} - ${formatNum(max)}/year`;
    if (min) return `From ${formatNum(min)}/year`;
    if (max) return `Up to ${formatNum(max)}/year`;
    return null;
  };

  const parseList = (field: any): string[] => {
    if (Array.isArray(field)) return field;
    if (!field) return [];
    try {
      const parsed = JSON.parse(field);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {}
    return String(field)
      .split(/\n|;/)
      .map((s) => s.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-950/100"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-16">
        <div className="text-center">
          <Briefcase className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="mb-6 text-gray-600">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/jobs">
            <Button className="bg-blue-900 hover:bg-slate-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Success Banner */}
      {successMessage && (
        <div className="fixed top-0 left-0 right-0 bg-blue-900 text-white py-3 px-4 text-center z-50">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {successMessage}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 md:py-16">
        <Link
          href="/jobs"
          className="text-sky-300 hover:underline flex items-center mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {job.remote && (
                        <Badge className="bg-blue-100 text-blue-700">
                          <Globe className="w-3 h-3 mr-1" />
                          Remote
                        </Badge>
                      )}
                      {job.status === "CLOSED" && (
                        <Badge variant="destructive">Closed</Badge>
                      )}
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1 font-medium">
                        <Building className="w-4 h-4" />
                        {job.recruiter?.companyName || "Company"}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </span>
                    </div>
                  </div>
                  <div className="bg-pink-950/20 w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold text-sky-300">
                    {(job.recruiter?.companyName || job.title || " ")
                      .substring(0, 2)
                      .toUpperCase()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {job.jobType && (
                    <Badge variant="secondary">
                      {formatJobType(job.jobType)}
                    </Badge>
                  )}
                  {job.experienceLevel && (
                    <Badge variant="secondary">
                      {formatJobType(job.experienceLevel)}
                    </Badge>
                  )}
                  {job.category && (
                    <Badge variant="outline">{job.category}</Badge>
                  )}
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill: string, i: number) => (
                      <Badge
                        key={i}
                        className="bg-pink-950/10 text-sky-100 border-slate-600/60"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* About Company */}
            {job.aboutCompany && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Building className="w-5 h-5 text-sky-300" />
                    About the Company
                  </h2>
                  <p className="text-gray-700 whitespace-pre-line">
                    {job.aboutCompany}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Job Description */}
            <Card className="border border-gray-200 bg-white">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Job Description</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {job.description}
                </p>
              </CardContent>
            </Card>

            {/* Responsibilities */}
            {job.responsibilities && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Key Responsibilities
                  </h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {parseList(job.responsibilities).map(
                      (item: string, index: number) => (
                        <li key={index} className="text-gray-700">
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Qualifications */}
            {job.qualifications && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">
                    Requirements & Qualifications
                  </h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {parseList(job.qualifications).map(
                      (item: string, index: number) => (
                        <li key={index} className="text-gray-700">
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Benefits */}
            {job.benefits && (
              <Card className="border border-gray-200 bg-white">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Benefits & Perks</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    {parseList(job.benefits).map(
                      (item: string, index: number) => (
                        <li key={index} className="text-gray-700">
                          {item}
                        </li>
                      ),
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 border border-gray-200 bg-white">
              <CardContent className="p-6">
                <h2 className="text-lg font-bold mb-4">Job Summary</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">
                        {job.recruiter?.companyName || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium">{job.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Job Type</p>
                      <p className="font-medium">
                        {formatJobType(job.jobType) || "Full Time"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Experience Level</p>
                      <p className="font-medium">
                        {formatJobType(job.experienceLevel) || "Mid Level"}
                      </p>
                    </div>
                  </div>

                  {formatSalary(job.salaryMin, job.salaryMax) && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Salary Range</p>
                        <p className="font-medium">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Posted</p>
                      <p className="font-medium">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {job.applicationDeadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Apply By</p>
                        <p className="font-medium">
                          {new Date(
                            job.applicationDeadline,
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {job.viewCount !== undefined && (
                    <div className="flex items-start gap-3">
                      <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Views</p>
                        <p className="font-medium">{job.viewCount}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                {job.status !== "CLOSED" && (
                  <Dialog
                    open={showApplyDialog}
                    onOpenChange={setShowApplyDialog}
                  >
                    <DialogTrigger asChild>
                      <Button className="w-full bg-blue-900 hover:bg-slate-800 text-white py-6">
                        Apply for this Job
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogTitle>Apply for {job.title}</DialogTitle>
                      <DialogDescription>
                        {job.recruiter?.companyName && (
                          <span>at {job.recruiter.companyName}</span>
                        )}
                      </DialogDescription>

                      <form className="mt-4 space-y-4" onSubmit={handleApply}>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              First Name *
                            </label>
                            <Input
                              name="firstName"
                              placeholder="John"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-1 block">
                              Last Name *
                            </label>
                            <Input name="lastName" placeholder="Doe" required />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium mb-1 block">
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
                            <label className="text-sm font-medium mb-1 block">
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
                          <label className="text-sm font-medium mb-1 block">
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
                            placeholder="Tell us why you're interested in this role and what makes you a great fit..."
                            className="w-full border rounded-md p-3 min-h-[120px]"
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
                          <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
                            {errorMessage}
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
                            className="bg-blue-900 hover:bg-slate-800"
                          >
                            {submitting
                              ? "Submitting..."
                              : "Submit Application"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}

                {job.status === "CLOSED" && (
                  <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
                    This position is no longer accepting applications
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;

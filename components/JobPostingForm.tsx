"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Job } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface JobPostingFormProps {
  job?: Job;
  onSuccess?: () => void;
}

const JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
];
const EXPERIENCE_LEVELS = [
  "ENTRY_LEVEL",
  "MID_LEVEL",
  "SENIOR",
  "LEAD",
  "EXECUTIVE",
];
const JOB_CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "Product",
  "Operations",
  "Finance",
  "HR",
  "Legal",
  "Other",
];

const JobPostingForm: React.FC<JobPostingFormProps> = ({ job, onSuccess }) => {
  const router = useRouter();

  // Basic info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);

  // Job details
  const [jobType, setJobType] = useState("FULL_TIME");
  const [experienceLevel, setExperienceLevel] = useState("MID_LEVEL");
  const [category, setCategory] = useState("Engineering");

  // Salary
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  // Company info
  const [aboutCompany, setAboutCompany] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [benefits, setBenefits] = useState("");

  // Application deadline
  const [applicationDeadline, setApplicationDeadline] = useState("");

  // Status
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">("PUBLISHED");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setDescription(job.description);
      setLocation(job.location);
      setRemote(job.remote || false);
      setJobType(job.jobType || "FULL_TIME");
      setExperienceLevel(job.experienceLevel || "MID_LEVEL");
      setCategory(job.category || "Engineering");
      setSalaryMin(job.salaryMin?.toString() || "");
      setSalaryMax(job.salaryMax?.toString() || "");
      setSkills(job.skills || []);
      setAboutCompany(job.aboutCompany || "");
      setResponsibilities(job.responsibilities || "");
      setQualifications(job.qualifications || "");
      setBenefits(job.benefits || "");
      setStatus(job.status || "PUBLISHED");
      if (job.applicationDeadline) {
        setApplicationDeadline(
          new Date(job.applicationDeadline).toISOString().split("T")[0],
        );
      }
    }
  }, [job]);

  const addSkill = () => {
    const skill = skillInput.trim();
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e: React.FormEvent, saveAsDraft = false) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token =
        localStorage.getItem("token") || localStorage.getItem("accessToken");
      if (!token) {
        toast.error("You must be logged in.");
        setIsLoading(false);
        return;
      }

      const url = job ? `/api/jobs/${job.id}` : "/api/jobs";
      const method = job ? "PUT" : "POST";

      const payload = {
        title,
        description,
        location,
        remote,
        jobType,
        experienceLevel,
        category,
        salaryMin: salaryMin ? parseInt(salaryMin) : null,
        salaryMax: salaryMax ? parseInt(salaryMax) : null,
        skills,
        aboutCompany,
        responsibilities,
        qualifications,
        benefits,
        applicationDeadline: applicationDeadline || null,
        status: saveAsDraft ? "DRAFT" : status,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          `Job ${job ? "updated" : saveAsDraft ? "saved as draft" : "posted"} successfully!`,
        );
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/recruiter/view-jobs");
        }
      } else {
        toast.error(
          data.message || `Failed to ${job ? "update" : "post"} job.`,
        );
      }
    } catch (error) {
      toast.error("An error occurred.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatJobType = (type: string) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatExperienceLevel = (level: string) => {
    return level
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Senior Software Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md "
              >
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="e.g., San Francisco, CA"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2 flex items-end gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remote}
                  onChange={(e) => setRemote(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span>Remote position</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobType">Job Type</Label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md "
              >
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatJobType(type)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <select
                id="experienceLevel"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                disabled={isLoading}
                className="w-full px-3 py-2 border rounded-md "
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {formatExperienceLevel(level)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary & Skills */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compensation & Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salaryMin">Salary Range (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="salaryMin"
                  type="number"
                  placeholder="Min"
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
                <span>-</span>
                <Input
                  id="salaryMax"
                  type="number"
                  placeholder="Max"
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">Annual salary in USD</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationDeadline">
                Application Deadline (Optional)
              </Label>
              <Input
                id="applicationDeadline"
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                disabled={isLoading}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Skills</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (e.g., React, Node.js)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                disabled={isLoading}
              />
              <Button
                type="button"
                onClick={addSkill}
                variant="outline"
                disabled={isLoading}
              >
                Add
              </Button>
            </div>
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {skill}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Job Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aboutCompany">About the Company</Label>
            <Textarea
              id="aboutCompany"
              placeholder="Tell candidates about your company culture, mission, and values..."
              value={aboutCompany}
              onChange={(e) => setAboutCompany(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              placeholder="Provide a detailed overview of the role and what the candidate will be working on..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              required
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="responsibilities">Key Responsibilities</Label>
            <Textarea
              id="responsibilities"
              placeholder="List the main responsibilities and duties for this role..."
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualifications">Required Qualifications</Label>
            <Textarea
              id="qualifications"
              placeholder="List the required qualifications, education, and experience..."
              value={qualifications}
              onChange={(e) => setQualifications(e.target.value)}
              disabled={isLoading}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits & Perks</Label>
            <Textarea
              id="benefits"
              placeholder="Describe the benefits, perks, and what makes this opportunity special..."
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              disabled={isLoading}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={(e) => handleSubmit(e, true)}
          disabled={isLoading}
        >
          Save as Draft
        </Button>
        <Button
          type="submit"
          className="bg-blue-800 hover:bg-blue-900 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Publishing..." : job ? "Update Job" : "Publish Job"}
        </Button>
      </div>
    </form>
  );
};

export default JobPostingForm;

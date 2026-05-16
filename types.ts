export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE";
export type ExperienceLevel =
  | "ENTRY_LEVEL"
  | "MID_LEVEL"
  | "SENIOR"
  | "LEAD"
  | "EXECUTIVE";
export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW_SCHEDULED"
  | "INTERVIEWED"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  aboutCompany?: string;
  responsibilities?: string;
  qualifications?: string;
  benefits?: string;
  createdAt: string;
  updatedAt?: string;

  // New fields
  status?: JobStatus;
  jobType?: JobType;
  experienceLevel?: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  category?: string;
  remote?: boolean;
  applicationDeadline?: string;
  viewCount?: number;

  // Recruiter info
  recruiterId?: string;
  recruiter?: {
    id: string;
    name?: string;
    companyName?: string;
  };

  // Counts
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  jobId: string;
  candidateId?: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  coverLetter?: string;
  status: ApplicationStatus;
  notes?: string;
  createdAt: string;
  updatedAt?: string;

  job?: Job;
  candidate?: {
    id: string;
    name?: string;
    email: string;
  };
}

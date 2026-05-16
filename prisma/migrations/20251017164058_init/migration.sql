-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('CANDIDATE', 'RECRUITER');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "uid" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'email',
    "tags" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'CANDIDATE',
    "companyName" TEXT,
    "companyWebsite" TEXT,
    "companySize" TEXT,
    "industry" TEXT,
    "jobTitle" TEXT,
    "phoneNumber" TEXT,
    "linkedinProfile" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "pronouns" TEXT,
    "bio" TEXT,
    "location" TEXT,
    "website" TEXT,
    "calendar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."social_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."interviews" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "questions" TEXT NOT NULL,
    "techstack" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "finalized" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."feedbacks" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "strengths" TEXT NOT NULL,
    "areasForImprovement" TEXT NOT NULL,
    "finalAssessment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_scores" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT NOT NULL,

    CONSTRAINT "category_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."detailed_feedbacks" (
    "id" TEXT NOT NULL,
    "feedbackId" TEXT NOT NULL,
    "overallAnalysis" TEXT NOT NULL,
    "notableStrengths" TEXT NOT NULL,
    "areasForImprovement" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "technicalSkillsScore" INTEGER NOT NULL,
    "technicalSkillsCommentary" TEXT NOT NULL,
    "problemSolvingScore" INTEGER NOT NULL,
    "problemSolvingCommentary" TEXT NOT NULL,
    "communicationScore" INTEGER NOT NULL,
    "communicationCommentary" TEXT NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "confidenceCommentary" TEXT NOT NULL,
    "practiceFocusAreas" TEXT NOT NULL,
    "overallImpression" TEXT NOT NULL,
    "finalTip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "detailed_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_feedbacks" (
    "id" TEXT NOT NULL,
    "detailedFeedbackId" TEXT NOT NULL,
    "questionId" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "candidateAnswer" TEXT NOT NULL,
    "candidateAnswerSummary" TEXT,
    "actualAnswer" TEXT,
    "expectedIdealPoints" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "evaluationScore" INTEGER NOT NULL,
    "evaluationCoverage" TEXT NOT NULL,
    "evaluationMissedPoints" TEXT NOT NULL,
    "evaluationDepth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "question_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."jobs" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "requirements" TEXT NOT NULL,
    "responsibilities" TEXT NOT NULL,
    "salary" TEXT NOT NULL,
    "posted" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "industry" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."candidate_feedbacks" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "overallExperience" INTEGER NOT NULL,
    "nps" INTEGER NOT NULL,
    "bestPart" TEXT,
    "worstPart" TEXT,
    "platformUsability" INTEGER NOT NULL,
    "clarityOfInstructions" INTEGER NOT NULL,
    "technicalIssues" BOOLEAN NOT NULL,
    "technicalIssuesDescription" TEXT,
    "fairness" INTEGER NOT NULL,
    "relevance" INTEGER NOT NULL,
    "opportunityToDemonstrateSkills" BOOLEAN NOT NULL,
    "inclusivity" TEXT,
    "feedbackHelpfulness" INTEGER NOT NULL,
    "feedbackConstructiveness" INTEGER NOT NULL,
    "feedbackTimeliness" INTEGER NOT NULL,
    "mostUsefulFeedback" TEXT,
    "perceptionChange" TEXT NOT NULL,
    "perceptionChangeDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidate_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_uid_key" ON "public"."User"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "social_links_userId_type_key" ON "public"."social_links"("userId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "detailed_feedbacks_feedbackId_key" ON "public"."detailed_feedbacks"("feedbackId");

-- AddForeignKey
ALTER TABLE "public"."social_links" ADD CONSTRAINT "social_links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."interviews" ADD CONSTRAINT "interviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedbacks" ADD CONSTRAINT "feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."feedbacks" ADD CONSTRAINT "feedbacks_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "public"."interviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_scores" ADD CONSTRAINT "category_scores_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "public"."feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."detailed_feedbacks" ADD CONSTRAINT "detailed_feedbacks_feedbackId_fkey" FOREIGN KEY ("feedbackId") REFERENCES "public"."feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question_feedbacks" ADD CONSTRAINT "question_feedbacks_detailedFeedbackId_fkey" FOREIGN KEY ("detailedFeedbackId") REFERENCES "public"."detailed_feedbacks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."candidate_feedbacks" ADD CONSTRAINT "candidate_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

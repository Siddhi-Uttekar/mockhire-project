"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileText,
  CheckCircle,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  skills: string[];
  experience: string;
  education: string;
  projects: string;
  achievements: string;
}

const ByResumePage = () => {
  const router = useRouter();
  const [resume, setResume] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResume | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [selectedDuration, setSelectedDuration] = useState(5);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResume(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resume) {
      alert("Please upload a resume");
      return;
    }
    setIsParsing(true);
    setError(null);
    setParsedData(null);
    setQuestions([]);

    const formData = new FormData();
    formData.append("resume", resume);

    try {
      const response = await fetch("/api/parse-resume", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume");
      }

      const data = await response.json();
      setParsedData(data);
      setIsModalOpen(true);
    } catch (error) {
      setError("Failed to parse resume. Please try again.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleStartInterview = () => {
    if (!parsedData) return;
    sessionStorage.setItem("resumeData", JSON.stringify(parsedData));
    router.push(
      `/interview/by-resume/interview?level=${selectedLevel}&duration=${selectedDuration}`
    );
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Compact Header Section */}
        <div className="mb-6 text-center">
            <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-card rounded-full shadow-md border border-border">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <p className="text-xs text-foreground font-medium">
              AI-Powered Resume Analysis
            </p>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
            Interview by <span className="gradient-text">Resume</span>
          </h1>

          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Upload your resume and let our AI generate personalized interview
            questions
          </p>
        </div>

        {/* Compact Features - Inline */}
        <div className="max-w-3xl mx-auto mb-6 flex flex-wrap justify-center gap-4">
          <div className="flex items-center gap-2 bg-card backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-sm">
            <FileText className="w-4 h-4 text-amber-200 flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Smart Parsing
            </span>
          </div>

          <div className="flex items-center gap-2 bg-card backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-sm">
            <Sparkles className="w-4 h-4 text-amber-200 flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">
              AI Questions
            </span>
          </div>

          <div className="flex items-center gap-2 bg-card backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-sm">
            <CheckCircle className="w-4 h-4 text-amber-200 flex-shrink-0" />
            <span className="text-sm font-medium text-foreground">
              Instant Feedback
            </span>
          </div>
        </div>

        {/* Compact Upload Section */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-xl border border-border overflow-hidden">
            <div className="bg-background border-b border-border p-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-200" />
                Upload Your Resume
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                PDF format • Max 10MB
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume"
                    className={`
                      flex flex-col items-center justify-center w-full h-40
                      border-2 border-dashed rounded-xl cursor-pointer 
                      transition-all duration-200
                      ${
                        resume
                          ? "border-amber-300 bg-amber-500/10"
                          : "border-border bg-background hover:bg-muted"
                      }
                    `}
                  >
                    <div className="flex flex-col items-center justify-center py-4">
                      {resume ? (
                        <>
                          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-2">
                            <CheckCircle className="w-6 h-6 text-primary-foreground" />
                          </div>
                          <p className="mb-1 text-base font-semibold text-foreground">
                            {resume.name}
                          </p>
                          <p className="text-xs text-amber-200">
                            {(resume.size / 1024).toFixed(2)} KB
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Click to change
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground mb-2" />
                          <p className="mb-1 text-base font-semibold text-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF (MAX. 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!resume || isParsing}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
              >
                {isParsing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Analyzing Your Resume...</span>
                  </>
                ) : (
                  <>
                    <span>Parse Resume & Continue</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-red-800">
                  Upload Failed
                </p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Compact Help Section */}
            <div className="mt-4 bg-card border border-border rounded-xl p-4">
            <h3 className="font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              Tips for Best Results
            </h3>
            <ul className="space-y-1.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Use a well-formatted, recent resume</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>Ensure skills and experience are clearly listed</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>PDF format works best for accurate parsing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Compact Settings Modal */}
      {isModalOpen && parsedData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-in fade-in duration-200">
          <div className="bg-card rounded-2xl shadow-2xl max-w-2xl w-full border border-border max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
            {/* Compact Modal Header */}
            <div className="bg-card p-6 relative overflow-hidden border-b border-border">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-1 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  Interview Settings
                </h2>
                <p className="text-center text-muted-foreground text-sm">
                  Customize your AI-powered practice
                </p>
              </div>
            </div>

            <div className="p-6">
              {/* Compact Resume Preview */}
              <div className="mb-6 bg-background border border-border rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm text-foreground">
                      Resume Parsed Successfully!
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {parsedData.name && `${parsedData.name} • `}
                      {parsedData.skills?.length || 0} skills identified
                    </p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-amber-200" />
                </div>
              </div>

              {/* Interview Level */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3 text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  Difficulty Level
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    className={`p-4 border-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedLevel === "Beginner"
                        ? "bg-card border-amber-300 text-foreground shadow-lg scale-105"
                        : "border-border hover:border-amber-300 hover:bg-background hover:scale-102"
                    }`}
                    onClick={() => setSelectedLevel("Beginner")}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">🌱</div>
                      <div className="font-bold text-base mb-0.5">Beginner</div>
                      <div className="text-xs text-muted-foreground">
                        Fundamental concepts
                      </div>
                    </div>
                  </button>
                  <button
                    className={`p-4 border-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedLevel === "Professional"
                        ? "bg-card border-amber-300 text-foreground shadow-lg scale-105"
                        : "border-border hover:border-amber-300 hover:bg-background hover:scale-102"
                    }`}
                    onClick={() => setSelectedLevel("Professional")}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">💼</div>
                      <div className="font-bold text-base mb-0.5">
                        Professional
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Advanced scenarios
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Interview Duration */}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-3 text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                  Duration
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 15, 30].map((duration) => (
                    <button
                      key={duration}
                      className={`p-3 border-2 rounded-xl font-semibold transition-all duration-200 ${
                        selectedDuration === duration
                          ? "bg-card border-amber-300 text-foreground shadow-lg scale-110"
                          : "border-border hover:border-amber-300 hover:bg-background hover:scale-105"
                      }`}
                      onClick={() => setSelectedDuration(duration)}
                    >
                      <div className="text-center">
                        <div className="text-xl mb-0.5">⏱️</div>
                        <div className="text-base font-bold">{duration}</div>
                        <div className="text-xs text-muted-foreground">min</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Compact Info Card */}
              <div className="bg-background border border-border rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-amber-900 mb-1">
                      🎯 Ready to begin?
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Your interview will be personalized based on your resume.
                      You'll receive detailed feedback even from short sessions!
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-muted text-foreground rounded-xl hover:bg-card font-semibold transition-all hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStartInterview}
                  className="flex-2 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2 group"
                >
                  <span>Start Interview</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ByResumePage;

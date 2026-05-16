
"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const ContactUsForm = () => {
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [candidates, setCandidates] = useState("");
  const [preferredDates, setPreferredDates] = useState("");
  const [mode, setMode] = useState("AI Interviewer");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock API call — replace with real endpoint if needed
      await new Promise((resolve) => setTimeout(resolve, 900));
      toast.success("Thanks! We received your request 🤝 — we'll get back soon.");
      // reset
      setCompany("");
      setJobTitle("");
      setContactName("");
      setEmail("");
      setPhone("");
      setCandidates("");
      setPreferredDates("");
      setMode("AI Interviewer");
      setNotes("");
      // navigate to admin page for review
      if (typeof window !== 'undefined') {
        window.location.href = '/admin';
      }
    } catch (error) {
      toast.error("Failed to send request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <section className="w-full max-w-6xl mx-auto px-4 flex items-center justify-center bg-pink-950/10 p-8">
        <div className="w-full max-w-xl text-center">
          <h1 className="text-4xl font-extrabold">Request AI Interview 🤖🤝</h1>
          <p className="text-lg text-gray-700 mb-6">
            Want our AI interviewer to conduct or assist interviews for your role? Fill the form and our team will reach out.
          </p>

          <ul className="mx-auto text-left inline-block text-lg space-y-3 mb-6 list-disc pl-5">
            <li>Quick setup — we handle interviewer configuration</li>
            <li>AI-driven evaluation tailored to your tech stack</li>
            <li>Data privacy — resumes and answers are secure</li>
          </ul>

          <p className="text-sm text-gray-500 mb-8">
            We typically reply within 1-2 business days.
          </p>

          <div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("contact-form");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-900 text-white rounded shadow"
            >
              Request Interview ↓
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="max-w-4xl mx-auto p-6 bg-blue-800 shadow">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="company">Company</Label>
              <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="jobTitle">Position</Label>
              <Input id="jobTitle" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Job title" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Full name" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="candidates"># Candidates</Label>
              <Input id="candidates" value={candidates} onChange={(e) => setCandidates(e.target.value)} placeholder="e.g., 5" disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="preferredDates">Preferred dates/times</Label>
              <Input id="preferredDates" value={preferredDates} onChange={(e) => setPreferredDates(e.target.value)} placeholder="e.g., 2026-02-01, mornings" disabled={isLoading} />
            </div>

            <div>
              <Label htmlFor="mode">Interview Mode</Label>
              <select id="mode" className="w-full border rounded px-2 py-2" value={mode} onChange={(e) => setMode(e.target.value)} disabled={isLoading}>
                <option>AI Interviewer</option>
                <option>Human-assisted (AI + Reviewer)</option>
                <option>Onsite / Live Moderator</option>
              </select>
            </div>

            <div>
              <Label htmlFor="notes">Additional details</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add context, tech stack, skills to focus on, or questions to include" disabled={isLoading} />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" className="bg-blue-900" disabled={isLoading}>{isLoading ? "Sending..." : "Request Interview"}</Button>
              <button type="button" className="text-sm text-white" onClick={() => { setCompany(''); setJobTitle(''); setContactName(''); setEmail(''); setPhone(''); setCandidates(''); setPreferredDates(''); setMode('AI Interviewer'); setNotes(''); }}>Clear</button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
};

export default ContactUsForm;

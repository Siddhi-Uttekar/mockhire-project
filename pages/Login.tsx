"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/hooks/userUser";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, login } = useUserStore();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(email, password, role);

      if (result.success && result.user) {
        toast.success("Login successful!");
        if (result.user.role === "RECRUITER") {
          router.push("/recruiter");
        } else {
          router.push("/");
        }
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err: any) {
      const message = "An unexpected error occurred. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderLogin = async (providerType: "google" | "github") => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(`/api/auth/${providerType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        window.location.href = data.redirectUrl;
      } else {
        setError(data.message || `Failed to sign in with ${providerType}`);
        toast.error(data.message || `Failed to sign in with ${providerType}`);
      }
    } catch (err: any) {
      const message = `Failed to sign in with ${providerType}. Please try again.`;
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
      <div className="container max-w-md mx-4 bg-white rounded-lg">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-3">
                <Label className="text-base font-medium">I am a:</Label>
                <RadioGroup
                  value={role}
                  onValueChange={(value) =>
                    setRole(value as "CANDIDATE" | "RECRUITER")
                  }
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="CANDIDATE" id="candidate" />
                    <Label htmlFor="candidate" className="cursor-pointer">
                      👨‍💻 Job Seeker / Candidate
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="RECRUITER" id="recruiter" />
                    <Label htmlFor="recruiter" className="cursor-pointer">
                      🧑‍💼 Recruiter / Employer
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center mb-2">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-blue-800 hover:bg-blue-900 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <div className="flex items-center my-4">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="mx-2 text-gray-400 text-xs">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full mb-2 flex items-center justify-center gap-2"
              onClick={() => handleProviderLogin("google")}
              disabled={isLoading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 533.5 544.3"
              >
                <path
                  fill="#4285F4"
                  d="M533.5 278.4c0-17.4-1.6-34.2-4.6-50.4H272.1v95.3h146.9c-6.3 34-25 62.7-53.4 82l86.1 66.9c50.3-46.4 81.8-114.8 81.8-193.8z"
                />
                <path
                  fill="#34A853"
                  d="M272.1 544.3c72.9 0 134-24.2 178.6-65.8l-86.1-66.9c-24 16.1-54.8 25.6-92.5 25.6-71 0-131.2-47.9-152.7-112.3H30.1v70.8c44.6 88.1 136.3 148.6 242 148.6z"
                />
                <path
                  fill="#FBBC05"
                  d="M119.4 324.9c-10.2-30.2-10.2-62.6 0-92.8V161.3H30.1c-39.6 79.1-39.6 172.5 0 251.6l89.3-67.9z"
                />
                <path
                  fill="#EA4335"
                  d="M272.1 107.4c39.6-.6 77.6 13.7 106.8 39.6l80-80.1C413.6 23.3 344.7-1.5 272.1 0 166.4 0 74.7 60.5 30.1 148.6l89.3 67.9c21.5-64.4 81.7-112.3 152.7-112.3z"
                />
              </svg>
              Continue with Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-center">
              <span className="text-gray-500">Don't have an account?</span>{" "}
              <Link href="/signup" className="text-sky-300 hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;

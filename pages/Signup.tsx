// "use client";
// import React, { useState } from "react";
// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { useUserStore } from "@/hooks/userUser";
// import axios from "axios";

// const Signup = () => {
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const { register } = useUserStore();
//   const router = useRouter();

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null);
//     setSuccess(null);

//     if (!firstName.trim() || !email.trim() || !password.trim()) {
//       setError("First name, email, and password are required.");
//       return;
//     }
//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const fullName = `${firstName} ${lastName}`.trim();
//       const result = await register({
//         email,
//         password,
//         name: fullName,
//         displayName: fullName,
//       });

//       if (result.success) {
//         setSuccess("Account created successfully!");
//         toast.success("Account created successfully!");
//         router.push("/");
//       } else {
//         setError(result.message);
//         toast.error(result.message);
//       }
//     } catch (err: any) {
//       const message = "An error occurred during signup.";
//       setError(message);
//       toast.error(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleProviderSignup = async (providerType: "google" | "github") => {
//     setError(null);
//     setSuccess(null);
//     setIsLoading(true);

//     try {
//       const response = await axios.post(`/api/auth/${providerType}`);

//       if (response.data.success) {
//         window.location.href = response.data.redirectUrl;
//       } else {
//         setError(
//           response.data.message || `Failed to sign up with ${providerType}`
//         );
//         toast.error(
//           response.data.message || `Failed to sign up with ${providerType}`
//         );
//       }
//     } catch (err: any) {
//       const message = `Failed to sign up with ${providerType}. Please try again.`;
//       setError(message);
//       toast.error(message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
//       <div className="container max-w-md mx-4 bg-white rounded-lg">
//         <Card className="w-full">
//           <CardHeader className="space-y-1 text-center">
//             <CardTitle className="text-2xl font-bold">
//               Create an account
//             </CardTitle>
//             <CardDescription>
//               Enter your details below to create your account
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <form onSubmit={handleSignup} className="space-y-4">
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label htmlFor="firstName">
//                     First name <span className="text-red-500">*</span>
//                   </Label>
//                   <Input
//                     id="firstName"
//                     placeholder="Your first name"
//                     value={firstName}
//                     onChange={(e) => setFirstName(e.target.value)}
//                     disabled={isLoading}
//                     required
//                   />
//                 </div>
//                 <div className="space-y-2">
//                   <Label htmlFor="lastName">Last name</Label>
//                   <Input
//                     id="lastName"
//                     placeholder="last name"
//                     value={lastName}
//                     onChange={(e) => setLastName(e.target.value)}
//                     disabled={isLoading}
//                   />
//                 </div>
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="email">
//                   Email <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="name@example.com"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   disabled={isLoading}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password">
//                   Password <span className="text-red-500">*</span>
//                 </Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   disabled={isLoading}
//                   required
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="confirmPassword">Confirm Password</Label>
//                 <Input
//                   id="confirmPassword"
//                   type="password"
//                   value={confirmPassword}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   disabled={isLoading}
//                 />
//               </div>
//               {error && (
//                 <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center mb-2">
//                   {error}
//                 </div>
//               )}
//               {success && (
//                 <div className="bg-pink-950/20 border border-orange-600 text-orange-200 px-4 py-2 rounded text-center mb-2">
//                   {success}
//                 </div>
//               )}
//               <Button
//                 type="submit"
//                 className="w-full bg-blue-800 hover:bg-blue-900 text-white"
//                 disabled={isLoading}
//               >
//                 {isLoading ? "Creating Account..." : "Create Account"}
//               </Button>
//             </form>
//             <div className="flex items-center my-4">
//               <div className="flex-grow border-t border-gray-200"></div>
//               <span className="mx-2 text-gray-400 text-xs">OR</span>
//               <div className="flex-grow border-t border-gray-200"></div>
//             </div>
//             <Button
//               type="button"
//               variant="outline"
//               className="w-full mb-2 flex items-center justify-center gap-2"
//               onClick={() => handleProviderSignup("google")}
//               disabled={isLoading}
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="20"
//                 height="20"
//                 viewBox="0 0 533.5 544.3"
//               >
//                 <path
//                   fill="#4285F4"
//                   d="M533.5 278.4c0-17.4-1.6-34.2-4.6-50.4H272.1v95.3h146.9c-6.3 34-25 62.7-53.4 82l86.1 66.9c50.3-46.4 81.8-114.8 81.8-193.8z"
//                 />
//                 <path
//                   fill="#34A853"
//                   d="M272.1 544.3c72.9 0 134-24.2 178.6-65.8l-86.1-66.9c-24 16.1-54.8 25.6-92.5 25.6-71 0-131.2-47.9-152.7-112.3H30.1v70.8c44.6 88.1 136.3 148.6 242 148.6z"
//                 />
//                 <path
//                   fill="#FBBC05"
//                   d="M119.4 324.9c-10.2-30.2-10.2-62.6 0-92.8V161.3H30.1c-39.6 79.1-39.6 172.5 0 251.6l89.3-67.9z"
//                 />
//                 <path
//                   fill="#EA4335"
//                   d="M272.1 107.4c39.6-.6 77.6 13.7 106.8 39.6l80-80.1C413.6 23.3 344.7-1.5 272.1 0 166.4 0 74.7 60.5 30.1 148.6l89.3 67.9c21.5-64.4 81.7-112.3 152.7-112.3z"
//                 />
//               </svg>
//               Continue with Google
//             </Button>
//           </CardContent>
//           <CardFooter className="flex flex-col">
//             <div className="text-sm text-center">
//               <span className="text-gray-500">Already have an account?</span>{" "}
//               <Link href="/login" className="text-sky-300 hover:underline">
//                 Login
//               </Link>
//             </div>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Signup;


// pages/signup.tsx (replace your existing signup component)
"use client";
import React, { useState } from "react";
import Link from "next/link";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUserStore } from "@/hooks/userUser";
import axios from "axios";

const Signup = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"CANDIDATE" | "RECRUITER">("CANDIDATE");

  // Common fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Recruiter-specific fields
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [industry, setIndustry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [linkedinProfile, setLinkedinProfile] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useUserStore();
  const router = useRouter();

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !email.trim() || !password.trim()) {
      setError("First name, email, and password are required.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (role === "RECRUITER") {
      setStep(2);
    } else {
      handleFinalSubmit();
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!companyName.trim() || !jobTitle.trim() || !phoneNumber.trim()) {
      setError("Company name, job title, and phone number are required.");
      return;
    }

    handleFinalSubmit();
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);

    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const userData = {
        email,
        password,
        name: fullName,
        displayName: fullName,
        role,
        ...(role === "RECRUITER" && {
          companyName,
          companyWebsite,
          companySize,
          industry,
          jobTitle,
          phoneNumber,
          linkedinProfile,
        }),
      };

      const result = await register(userData);

      if (result.success) {
        setSuccess("Account created successfully!");
        toast.success("Account created successfully!");
        router.push("/");
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err: any) {
      const message = "An error occurred during signup.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignup = async (providerType: "google" | "github") => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await axios.post(`/api/auth/${providerType}`);

      if (response.data.success) {
        window.location.href = response.data.redirectUrl;
      } else {
        setError(
          response.data.message || `Failed to sign up with ${providerType}`
        );
        toast.error(
          response.data.message || `Failed to sign up with ${providerType}`
        );
      }
    } catch (err: any) {
      const message = `Failed to sign up with ${providerType}. Please try again.`;
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-4">
      {/* Role Selection */}
      <div className="space-y-3">
        <Label className="text-base font-medium">I am a:</Label>
        <RadioGroup
          value={role}
          onValueChange={(value) => setRole(value as "CANDIDATE" | "RECRUITER")}
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            placeholder="Your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            placeholder="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">
          Password <span className="text-red-500">*</span>
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-800 hover:bg-blue-900 text-white"
        disabled={isLoading}
      >
        {role === "RECRUITER" ? "Continue" : "Create Account"}
      </Button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-sky-300">
          🧑‍💼 Recruiter Information
        </h3>
        <p className="text-sm text-gray-600">
          Help us verify your company and set up your recruiter profile
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName">
          Company Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="companyName"
          placeholder="Your company name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobTitle">
          Your Job Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="jobTitle"
          placeholder="e.g., HR Manager, Talent Acquisition"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">
          Phone Number <span className="text-red-500">*</span>
        </Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyWebsite">Company Website</Label>
        <Input
          id="companyWebsite"
          type="url"
          placeholder="https://yourcompany.com"
          value={companyWebsite}
          onChange={(e) => setCompanyWebsite(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="companySize">Company Size</Label>
        <Select value={companySize} onValueChange={setCompanySize}>
          <SelectTrigger>
            <SelectValue placeholder="Select company size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-10">1-10 employees</SelectItem>
            <SelectItem value="11-50">11-50 employees</SelectItem>
            <SelectItem value="51-200">51-200 employees</SelectItem>
            <SelectItem value="201-500">201-500 employees</SelectItem>
            <SelectItem value="501-1000">501-1000 employees</SelectItem>
            <SelectItem value="1000+">1000+ employees</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry</Label>
        <Input
          id="industry"
          placeholder="e.g., Technology, Healthcare, Finance"
          value={industry}
          onChange={(e) => setIndustry(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="linkedinProfile">LinkedIn Profile</Label>
        <Input
          id="linkedinProfile"
          type="url"
          placeholder="https://linkedin.com/in/yourprofile"
          value={linkedinProfile}
          onChange={(e) => setLinkedinProfile(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex space-x-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => setStep(1)}
          disabled={isLoading}
        >
          Back
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-blue-800 hover:bg-blue-900 text-white"
          disabled={isLoading}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
      <div className="container max-w-md mx-4 bg-white rounded-lg">
        <Card className="w-full">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">
              {step === 1 ? "Create an account" : "Complete Your Profile"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Choose your role and enter your basic details"
                : "Tell us about your company to complete registration"
              }
            </CardDescription>
            {step === 2 && (
              <div className="flex justify-center space-x-2 mt-2">
                <div className="w-4 h-4 rounded-full bg-pink-950/100"></div>
                <div className="w-4 h-4 rounded-full bg-pink-950/100"></div>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 1 ? renderStep1() : renderStep2()}

            {step === 1 && (
              <>
                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="mx-2 text-gray-400 text-xs">OR</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mb-2 flex items-center justify-center gap-2"
                  onClick={() => handleProviderSignup("google")}
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
              </>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded text-center mb-2">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-pink-950/20 border border-orange-600 text-orange-200 px-4 py-2 rounded text-center mb-2">
                {success}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-sm text-center">
              <span className="text-gray-500">Already have an account?</span>{" "}
              <Link href="/login" className="text-sky-300 hover:underline">
                Login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
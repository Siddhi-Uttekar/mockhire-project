"use client";
import { useEffect, useState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProfilePictureUpload from "./ProfilePictureUpload";
import TagSelector from "./TagSelector";
import ResumeUpload from "./ResumeUpload";
import SocialLinks from "./SocialLinks";
import Link from "next/link";
import axios from "axios";
import { useUserStore } from "@/hooks/userUser";
import { UserProfile } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type FormDataType = {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  pronouns: string;
  website: string;
  calendar: string;
  profilePicture: File | string | null;
  resume: File | string | null;
  tags: string[];
  socialLinks: {
    twitter: string;
    linkedin: string;
    instagram: string;
    github: string;
  };
};

const ProfileBuilder = () => {
  const { user, isAuthenticated, setUser } = useUserStore();

  // Helper function to get social link URL by type
  const getSocialLinkUrl = (type: string) => {
    const link = user?.socialLinks?.find((link) => link.type === type);
    return link?.url || "";
  };

  const [formData, setFormData] = useState<FormDataType>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
    location: user?.location || "",
    pronouns: user?.pronouns || "",
    website: user?.website || "",
    calendar: user?.calendar || "",
    profilePicture: user?.profilePicture || "" || null,
    resume: user?.resume || "" || null,
    tags:
      typeof user?.tags === "string"
        ? (user.tags as string).split(",").map((tag) => tag.trim())
        : (user as any)?.tags || [],
    socialLinks: {
      twitter: getSocialLinkUrl("twitter"),
      linkedin: getSocialLinkUrl("linkedin"),
      instagram: getSocialLinkUrl("instagram"),
      github: getSocialLinkUrl("github"),
    },
  });
  const router = useRouter();

  const [bioCount, setBioCount] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const maxBioLength = 500;

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBioChange = (value: string) => {
    if (value.length <= maxBioLength) {
      setBioCount(value.length);
      handleInputChange("bio", value);
    }
  };

  const handleFileUpload = (field: string, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    let profilePictureUrl =
      typeof formData.profilePicture === "string" ? formData.profilePicture : "";
    let resumeUrl = typeof formData.resume === "string" ? formData.resume : "";

    try {
      setIsLoading(true);

      if (formData?.profilePicture instanceof File) {
        const picForm = new FormData();
        picForm.append("file", formData.profilePicture);
        picForm.append("fileName", `${user?.displayName}'s picture`);
        picForm.append("folder", `profile-pictures/${user.uid}`);
        const picRes = await axios.post("/api/upload-imagekit", picForm);
        profilePictureUrl = picRes.data.url;
      }

      if (formData.resume instanceof File) {
        const resumeForm = new FormData();
        resumeForm.append("file", formData?.resume);
        resumeForm.append("fileName", `${user?.displayName}'s resume`);
        resumeForm.append("folder", `resumes/${user.uid}`);
        const resumeRes = await axios.post("/api/upload-imagekit", resumeForm);
        resumeUrl = resumeRes.data.url;
      }

      const updateData = {
        displayName: `${formData.firstName} ${formData.lastName}`.trim(),
        firstName: formData.firstName,
        lastName: formData.lastName,
        tags: formData.tags,
        socialLinks: formData.socialLinks,
        email: user.email,
        pronouns: formData.pronouns,
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        calendar: formData.calendar,
        profilePicture: profilePictureUrl,
        resume: resumeUrl,
      };

      const response = await axios.put(`/api/users/${user.id}`, updateData);

      if (response.data.success) {
        const updatedUser = response.data.user;
        setUser(updatedUser as any);

        // Helper to get social link URL from array
        const getSocialUrl = (type: string) => {
          const link = updatedUser?.socialLinks?.find(
            (l: any) => l.type === type
          );
          return link?.url || "";
        };

        setFormData({
          firstName: updatedUser?.firstName || "",
          lastName: updatedUser?.lastName || "",
          bio: updatedUser?.bio || "",
          location: updatedUser?.location || "",
          pronouns: updatedUser?.pronouns || "",
          website: updatedUser?.website || "",
          calendar: updatedUser?.calendar || "",
          profilePicture: updatedUser?.profilePicture || "",
          resume: updatedUser?.resume || "",
          tags:
            typeof updatedUser?.tags === "string"
              ? (updatedUser.tags as string).split(",").map((tag) => tag.trim())
              : updatedUser?.tags || [],
          socialLinks: {
            twitter: getSocialUrl("twitter"),
            linkedin: getSocialUrl("linkedin"),
            instagram: getSocialUrl("instagram"),
            github: getSocialUrl("github"),
          },
        });
        toast.message("Profile updated");
      }
    } catch (error) {
      console.error("Error occured while saving profile", error);
      toast.error("Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, []);

  return (
    <div className="space-y-6 pb-20 ">
      <Card className="shadow-md border rounded-2xl dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-xl font-semibold text-gray-900 dark:text-white">
            Basic Information
            <Link href="/profile">
              <Button variant="link">Back to profile</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <ProfilePictureUpload
              onImageChange={(file) =>
                handleInputChange("profilePicture", file)
              }
              defaultImage={
                typeof formData.profilePicture == "string"
                  ? formData.profilePicture
                  : user?.profilePicture || ""
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-sm font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-sm font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
              value={formData.bio}
              onChange={(e) => handleBioChange(e.target.value)}
              className="rounded-lg min-h-[120px] resize-none"
            />
            <div className="text-right text-sm text-gray-500 dark:text-gray-400">
              {bioCount}/{maxBioLength}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 w-full">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <input
                type="text"
                className="rounded-lg w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your location"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pronouns" className="text-sm font-medium">
                Pronouns
              </Label>
              <Select
                value={formData.pronouns}
                onValueChange={(value) => handleInputChange("pronouns", value)}
              >
                <SelectTrigger className="rounded-lg w-full">
                  <SelectValue placeholder="Select pronouns" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="he/him">He/Him</SelectItem>
                  <SelectItem value="she/her">She/Her</SelectItem>
                  <SelectItem value="they/them">They/Them</SelectItem>
                  <SelectItem value="prefer-not-to-say">
                    Prefer not to say
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website" className="text-sm font-medium">
                Website/Portfolio
              </Label>
              <Input
                id="website"
                placeholder="https://yourwebsite.com"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calendar" className="text-sm font-medium">
                Calendar Link
              </Label>
              <Input
                id="calendar"
                placeholder="https://calendly.com/yourusername"
                value={formData.calendar}
                onChange={(e) => handleInputChange("calendar", e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md border rounded-2xl dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Resume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResumeUpload
            onFileChange={(file) => handleFileUpload("resume", file)}
            currentFile={formData.resume}
            resumeUrl={
              typeof formData.resume == "string" ? formData.resume : null
            }
            onResumeRemove={() => handleFileUpload("resume", null)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-md border rounded-2xl dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Skills & Interests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TagSelector
            selectedTags={formData.tags}
            onTagsChange={(tags) => handleInputChange("tags", tags)}
          />
        </CardContent>
      </Card>

      <Card className="shadow-md border rounded-2xl dark:bg-gray-900/50 dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Social Links
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SocialLinks
            socialLinks={formData.socialLinks}
            onSocialLinksChange={(links) =>
              handleInputChange("socialLinks", links)
            }
          />
        </CardContent>
      </Card>

      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleSaveProfile}
          className="shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 rounded-2xl px-6 py-3 bg-blue-900 hover:bg-slate-800 text-white"
        >
          {isLoading ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <div className="flex gap-1">
              <Save className="h-5 w-5 mr-2" />
              Save Profile
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ProfileBuilder;

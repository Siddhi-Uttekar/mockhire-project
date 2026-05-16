"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Edit,
  Download,
  MapPin,
  Calendar,
  Globe,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/react-avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import InterviewHistoryCard from "./interviewhistorycard";

// Twitter icon component since it's not in lucide-react
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

interface SocialLink {
  id: string;
  type: string;
  url: string;
}

interface UserProfile {
  id: string;
  uid: string;
  email: string;
  name: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  tags?: string;
  bio?: string;
  location?: string;
  website?: string;
  calendar?: string;
  profilePicture?: string;
  resume?: string;
  pronouns?: string;
  role: "CANDIDATE" | "RECRUITER";
  socialLinks?: SocialLink[];
}

const ProfileView = () => {
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [hasFetchedProfile, setHasFetchedProfile] = useState(false);
  const { user, isLoading } = useProtectedRoute();

  // Fetch profile data only once when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id || hasFetchedProfile) {
        return;
      }

      try {
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(`/api/users/${user.id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (response.data.success) {
          setProfileData(response.data.user);
          setHasFetchedProfile(true);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      }
    };

    if (user?.id && !hasFetchedProfile) {
      fetchProfile();
    }
  }, [user?.id, hasFetchedProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-950/100 mx-auto mb-4"></div>
          <p className="text-muted-foreground">⏳ Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileData && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-muted-foreground">No profile data found</p>
        </div>
      </div>
    );
  }

  const displayUser = profileData || user;

  // Parse tags from string to array
  const tags = displayUser?.tags
    ? typeof displayUser.tags === "string"
      ? displayUser.tags.split(",").filter(Boolean)
      : displayUser.tags
    : [];

  // Get social links
  const getSocialLinkUrl = (type: string) => {
    if (profileData?.socialLinks) {
      const link = profileData.socialLinks.find(
        (l) => l.type.toLowerCase() === type.toLowerCase(),
      );
      return link?.url || "";
    }
    return "";
  };

  const socialPlatforms = [
    {
      name: "twitter",
      label: "Twitter",
      icon: TwitterIcon,
      color: "text-blue-500",
      emoji: "🐦",
      url: getSocialLinkUrl("twitter"),
    },
    {
      name: "linkedin",
      label: "LinkedIn",
      icon: ExternalLink,
      color: "text-blue-600",
      emoji: "💼",
      url: getSocialLinkUrl("linkedin"),
    },
    {
      name: "github",
      label: "GitHub",
      icon: ExternalLink,
      color: "text-gray-800",
      emoji: "💻",
      url: getSocialLinkUrl("github"),
    },
    {
      name: "instagram",
      label: "Instagram",
      icon: ExternalLink,
      color: "text-pink-500",
      emoji: "📸",
      url: getSocialLinkUrl("instagram"),
    },
  ];

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 section-padding pt-20">
      <Card className="shadow-md border rounded-2xl bg-card border-border">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Picture */}
            <div className="flex-shrink-0">
              <Avatar className="w-32 h-32 border-4 border-background shadow-lg">
                <AvatarImage src={displayUser?.profilePicture || undefined} />
                <AvatarFallback className="bg-background text-foreground text-2xl font-semibold">
                  {(displayUser?.firstName?.[0] ||
                    displayUser?.name?.[0] ||
                    "") +
                    (displayUser?.lastName?.[0] ||
                      displayUser?.name?.[1] ||
                      "")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-foreground">
                    👋 {displayUser?.displayName || displayUser?.name || "User"}
                  </h1>
                  <p className="text-muted-foreground font-medium">
                    👤 {displayUser?.pronouns || "he/him"}
                  </p>
                </div>
                <Link href={"/profile/settings"} className="flex-shrink-0">
                  <Button
                    variant="outline"
                    className="rounded-lg hover:bg-card hover:border-border"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    ✏️ Edit Profile
                  </Button>
                </Link>
              </div>

              <p className="text-foreground leading-relaxed">
                {displayUser?.bio || "No bio provided"}
              </p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {displayUser?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    📌 {displayUser.location}
                  </div>
                )}
                {displayUser?.website && (
                  <a
                    href={displayUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-amber-200 transition-colors"
                  >
                    <Globe className="h-4 w-4" />
                    Portfolio
                  </a>
                )}
                {displayUser?.calendar && (
                  <a
                    href={displayUser.calendar}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-amber-200 transition-colors"
                  >
                    <Calendar className="h-4 w-4" />
                    📅 Schedule Meeting
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills & Interests Card */}
      <Card className="shadow-md border rounded-2xl bg-card border-border">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            🎯 Skills & Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-pink-950/20 hover:bg-pink-950/30 text-orange-300 dark:bg-blue-900/50 dark:text-sky-200 dark:hover:bg-blue-900/70 rounded-full px-3 py-1"
                >
                  ⭐ {tag}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground">No skills added yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resume Card */}
      <Card className="shadow-md border rounded-2xl bg-card border-border">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            📄 Resume
          </h2>
          {displayUser?.resume ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-red-950/30 p-2">
                  <svg
                    className="h-6 w-6 text-red-300"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    📄 Resume
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-lg hover:border-border hover:bg-card"
                asChild
              >
                <a
                  href={displayUser.resume}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="h-4 w-4 mr-2" />
                  📥 Download
                </a>
              </Button>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <svg
                className="mx-auto mb-4 h-12 w-12 text-muted-foreground/70"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p>📭 No resume uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card className="shadow-md border rounded-2xl bg-card border-border">
        <CardContent className="p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            🔗 Social Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {socialPlatforms.map((platform) => {
              const IconComponent = platform.icon;
              const hasLink = platform.url && platform.url.trim() !== "";
              return (
                <div
                  key={platform.name}
                  className="flex items-center gap-3 rounded-lg border border-border bg-background p-3"
                >
                  <span className="text-lg">{platform.emoji}</span>
                  <IconComponent className={`h-5 w-5 ${platform.color}`} />
                  <span className="font-medium text-foreground">
                    {platform.label}
                  </span>
                  {hasLink ? (
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto text-sm text-amber-200 hover:underline"
                    >
                      👀 View Profile
                    </a>
                  ) : (
                    <span className="ml-auto text-sm text-muted-foreground">
                      ❌ Not connected
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Interview History Card */}
      <InterviewHistoryCard />
    </div>
  );
};

export default ProfileView;

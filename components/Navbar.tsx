"use client";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { UserProfile } from "@/types";
import { useUserStore } from "@/hooks/userUser";
import { getSessionServer, signOutServer } from "@/lib/actions/auth.action";

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInterviewDropdownOpen, setInterviewDropdownOpen] = useState(false);
  const pathname = usePathname();
  // Hide navbar on actual interview session pages, but show EXACTLY on by-position/by-resume configuration pages
  const isInterviewPage =
    pathname?.startsWith("/interview") &&
    pathname !== "/interview/by-position" &&
    pathname !== "/interview/by-resume";
  const isRecruiterPage = pathname?.startsWith("/recruiter");
  const router = useRouter();
  const { setUser: setUserState, user: userState, logout } = useUserStore();

  const handleNavlinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOutServer();
      router.push("/");
      logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  if (isInterviewPage || isRecruiterPage) {
    return null;
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 lg:px-8 py-4 max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center select-none shrink-0">
            <Link
              onClick={handleNavlinkClick}
              href="/"
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold">
                <span className="inline-block">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                MockHire
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link
              onClick={handleNavlinkClick}
              href="/"
              className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
            >
              Home
            </Link>
            <Link
              onClick={handleNavlinkClick}
              href="/jobs"
              className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
            >
              Jobs
            </Link>
            <Link
              onClick={handleNavlinkClick}
              href="/feedback"
              className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
            >
              Feedback
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setInterviewDropdownOpen(true)}
              onMouseLeave={() => setInterviewDropdownOpen(false)}
            >
              <button className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors">
                Interview
              </button>
              {isInterviewDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-md shadow-lg z-10 w-max">
                  <div className="flex">
                    {/* By Position Section */}
                    <div className="p-4 border-r border-border">
                      <h3 className="font-bold text-foreground mb-2 text-lg">
                        Practice by Position
                      </h3>
                      <ul>
                        {[
                          {
                            name: "Full Stack Developer",
                            path: "/interview/by-position?role=full-stack-developer",
                          },
                          {
                            name: "Data Scientist",
                            path: "/interview/by-position?role=data-scientist",
                          },
                          {
                            name: "Project Manager",
                            path: "/interview/by-position?role=project-manager",
                          },
                          {
                            name: "Software Engineer",
                            path: "/interview/by-position?role=software-engineer",
                          },
                          {
                            name: "Product Manager",
                            path: "/interview/by-position?role=product-manager",
                          },
                        ].map((role) => (
                          <li key={role.name}>
                            <Link
                              href={role.path}
                              onClick={handleNavlinkClick}
                              className="block text-base text-muted-foreground hover:bg-background hover:text-foreground p-2 rounded"
                            >
                              {role.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <Link
                        href="/interview/by-position"
                        onClick={handleNavlinkClick}
                        className="text-base text-amber-200 hover:underline mt-4 block text-center"
                      >
                        Explore More
                      </Link>
                    </div>
                    {/* By Resume Section */}
                    <div className="p-4 flex flex-col justify-center items-center min-w-[200px]">
                      <h3 className="font-bold text-foreground mb-2 text-lg">
                        By Resume
                      </h3>
                      <p className="text-base text-muted-foreground mb-4 text-center">
                        Get a tailored interview based on your resume.
                      </p>
                      <Link
                        href="/interview/by-resume"
                        onClick={handleNavlinkClick}
                      >
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                          Start Interview
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {!userState && (
              <>
                <Link
                  onClick={handleNavlinkClick}
                  href="/#features"
                  className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
                >
                  Features
                </Link>
                <Link
                  onClick={handleNavlinkClick}
                  href="/#how-it-works"
                  className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
                >
                  How it works
                </Link>
                <Link
                  onClick={handleNavlinkClick}
                  href="/#testimonials"
                  className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
                >
                  Testimonials
                </Link>
              </>
            )}
            {userState && (
              <Link
                onClick={handleNavlinkClick}
                href="/profile/feedback"
                className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
              >
                Past Feedbacks
              </Link>
            )}
            {userState?.role === "CANDIDATE" && (
              <Link
                onClick={handleNavlinkClick}
                href="/jobs/applied"
                className="text-base font-medium text-muted-foreground hover:text-amber-200 transition-colors"
              >
                My Applications
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {!userState ? (
              <>
                <Link onClick={handleNavlinkClick} href="/login">
                  <Button
                    variant="ghost"
                    className="text-base font-medium text-muted-foreground hover:text-foreground hover:bg-card"
                  >
                    Login
                  </Button>
                </Link>
                <Link onClick={handleNavlinkClick} href="/signup">
                  <Button className="text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground">
                    Sign Up Free
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="text-base font-medium border border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-600"
                >
                  Logout
                </Button>
                <div
                  className="ml-2 cursor-pointer"
                  onClick={() => router.push("/profile")}
                  title="Profile"
                >
                  <div className="w-10 h-10 select-none rounded-full text-xs bg-card flex items-center justify-center text-amber-100 font-bold border border-border hover:bg-muted transition">
                    {userState?.profilePicture ? (
                      <Image
                        src={userState.profilePicture}
                        alt="User Avatar"
                        className="w-full h-full rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                    ) : userState.displayName ? (
                      userState.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                    ) : (
                      userState.email?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              <Link
                onClick={handleNavlinkClick}
                href="/"
                className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
              >
                Home
              </Link>
              <Link
                onClick={handleNavlinkClick}
                href="/jobs"
                className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
              >
                Jobs
              </Link>
              <Link
                onClick={handleNavlinkClick}
                href="/feedback"
                className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
              >
                Feedback
              </Link>
              <div
                className="relative"
                onMouseEnter={() => setInterviewDropdownOpen(true)}
                onMouseLeave={() => setInterviewDropdownOpen(false)}
              >
                <button className="text-lg text-muted-foreground hover:text-amber-200 transition-colors">
                  Interview
                </button>
                {isInterviewDropdownOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-card border border-border rounded-md shadow-lg z-10 w-max">
                    <div className="flex">
                      {/* By Position Section */}
                      <div className="p-4 border-r border-border">
                        <h3 className="font-bold text-foreground mb-2 text-lg">
                          Practice by Position
                        </h3>
                        <ul>
                          {[
                            {
                              name: "Full Stack Developer",
                              path: "/interview/by-position?role=full-stack-developer",
                            },
                            {
                              name: "Data Scientist",
                              path: "/interview/by-position?role=data-scientist",
                            },
                            {
                              name: "Project Manager",
                              path: "/interview/by-position?role=project-manager",
                            },
                            {
                              name: "Software Engineer",
                              path: "/interview/by-position?role=software-engineer",
                            },
                            {
                              name: "Product Manager",
                              path: "/interview/by-position?role=product-manager",
                            },
                          ].map((role) => (
                            <li key={role.name}>
                              <Link
                                href={role.path}
                                onClick={handleNavlinkClick}
                                className="block text-base text-muted-foreground hover:bg-background hover:text-foreground p-2 rounded"
                              >
                                {role.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                        <Link
                          href="/interview/by-position"
                          onClick={handleNavlinkClick}
                          className="text-base text-amber-200 hover:underline mt-4 block text-center"
                        >
                          Explore More
                        </Link>
                      </div>
                      {/* By Resume Section */}
                      <div className="p-4 flex flex-col justify-center items-center min-w-[200px]">
                        <h3 className="font-bold text-foreground mb-2 text-lg">
                          By Resume
                        </h3>
                        <p className="text-base text-muted-foreground mb-4 text-center">
                          Get a tailored interview based on your resume.
                        </p>
                        <Link
                          href="/interview/by-resume"
                          onClick={handleNavlinkClick}
                        >
                          <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                            Start Interview
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {!userState && (
                <>
                  <Link
                    onClick={handleNavlinkClick}
                    href="/#features"
                    className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
                  >
                    Features
                  </Link>
                  <Link
                    onClick={handleNavlinkClick}
                    href="/#how-it-works"
                    className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
                  >
                    How it works
                  </Link>
                  <Link
                    onClick={handleNavlinkClick}
                    href="/#testimonials"
                    className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
                  >
                    Testimonials
                  </Link>
                </>
              )}
              {userState && (
                <Link
                  onClick={handleNavlinkClick}
                  href="/profile/feedback"
                  className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
                >
                  Past Feedbacks
                </Link>
              )}
              {userState?.role === "CANDIDATE" && (
                <Link
                  onClick={handleNavlinkClick}
                  href="/jobs/applied"
                  className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
                >
                  My Applications
                </Link>
              )}
              {userState && (
                <Link
                  onClick={handleNavlinkClick}
                  href="/profile/feedback"
                  className="text-lg text-muted-foreground hover:text-amber-200 transition-colors py-2"
                >
                  Past Feedbacks
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {!userState ? (
                  <>
                    <Link
                      onClick={handleNavlinkClick}
                      href="/login"
                      className="w-full"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-lg"
                      >
                        Login
                      </Button>
                    </Link>
                    <Link
                      onClick={handleNavlinkClick}
                      href="/signup"
                      className="w-full"
                    >
                      <Button className="w-full justify-center bg-primary hover:bg-primary/90 text-primary-foreground text-lg">
                        Sign Up Free
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-center border-red-500 text-red-400 hover:bg-red-50 hover:text-red-300 hover:border-red-400 text-lg"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                    <div
                      className="w-full flex justify-center mt-2"
                      onClick={() => {
                        setIsMenuOpen(false);
                        router.push("/profile");
                      }}
                    >
                      <div
                        className="w-10 h-10 select-none rounded-full bg-card flex items-center justify-center text-amber-100 font-bold text-xs border border-border hover:bg-muted transition cursor-pointer"
                        title="Profile"
                      >
                        {userState?.profilePicture ? (
                          <Image
                            src={userState.profilePicture}
                            alt={userState?.displayName || "User avatar"}
                            width={40}
                            height={40}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : userState.displayName ? (
                          userState.displayName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        ) : (
                          userState.email?.[0]?.toUpperCase() || "U"
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

"use client";

import React from "react";
import Link from "next/link";
import { useUserStore } from "@/hooks/userUser";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FeedbackListPage = () => {
  const { user, isAuthenticated } = useUserStore();
  const router = useRouter();
  const [feedbacks, setFeedbacks] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    async function fetchFeedbacks() {
      if (user?.id) {
        setIsLoading(true);
        try {
          const token = localStorage.getItem("accessToken");
          const response = await axios.get(`/api/users/${user.id}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });

          if (response.data.success && response.data.user.interviews) {
            setFeedbacks(response.data.user.interviews);
          }
        } catch (error) {
          console.error("Error fetching feedbacks:", error);
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchFeedbacks();
  }, [isAuthenticated, router, user?.id]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Past Interview Feedbacks</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Past Interview Feedbacks</h1>
      {feedbacks.length === 0 ? (
        <p>You don't have any past interview feedbacks yet.</p>
      ) : (
        <div className="space-y-4">
          {feedbacks.map((interview) => (
            <Card key={interview.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{interview.role}</span>
                  <Badge>
                    {new Date(interview.createdAt).toLocaleDateString()}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  <strong>Level:</strong> {interview.level}
                </p>
                <p>
                  <strong>Type:</strong> {interview.type}
                </p>
                <Link href={`/feedback/${interview.id}`} passHref>
                  <Button className="mt-4">View Feedback</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackListPage;

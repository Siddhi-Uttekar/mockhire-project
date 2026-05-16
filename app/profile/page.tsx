"use client";
import UserProfile from "./components/userProfile";
import React from "react";

function page() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <UserProfile />
    </div>
  );
}

export default page;

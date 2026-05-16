import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        social_links: true,
        interviews: true,
        feedbacks: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      name,
      displayName,
      firstName,
      lastName,
      email,
      tags,
      phoneNumber,
      linkedinProfile,
      companyName,
      companyWebsite,
      companySize,
      industry,
      jobTitle,
      socialLinks,
      pronouns,
      bio,
      location,
      website,
      calendar,
    } = body;

    // Build update data object dynamically
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (displayName !== undefined) updateData.displayName = displayName;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (tags !== undefined) updateData.tags = Array.isArray(tags) ? tags.join(',') : tags;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (linkedinProfile !== undefined)
      updateData.linkedinProfile = linkedinProfile;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (companyWebsite !== undefined)
      updateData.companyWebsite = companyWebsite;
    if (companySize !== undefined) updateData.companySize = companySize;
    if (industry !== undefined) updateData.industry = industry;
    if (jobTitle !== undefined) updateData.jobTitle = jobTitle;
    if (pronouns !== undefined) updateData.pronouns = pronouns;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (calendar !== undefined) updateData.calendar = calendar;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        social_links: true,
      },
    });

    // Handle social links if provided
    if (socialLinks) {
      let linksToProcess: { type: string; url: string }[] = [];

      if (Array.isArray(socialLinks)) {
        linksToProcess = socialLinks.filter(
          (link) => link.url && String(link.url).trim() !== ""
        );
      } else if (typeof socialLinks === "object" && socialLinks !== null) {
        linksToProcess = Object.entries(socialLinks)
          .filter(([_, url]) => {
            const urlStr = String(url || "");
            return urlStr && urlStr.trim() !== "";
          })
          .map(([type, url]) => ({
            type,
            url: String(url),
          }));
      }

      const typesToKeep = linksToProcess.map((link) => link.type);

      await prisma.$transaction([
        prisma.social_links.deleteMany({
          where: {
            userId: id,
            NOT: {
              type: {
                in: typesToKeep,
              },
            },
          },
        }),
        ...linksToProcess.map((link) =>
          prisma.social_link.upsert({
            where: {
              userId_type: {
                userId: id,
                type: link.type,
              },
            },
            update: { url: link.url },
            create: {
              userId: id,
              type: link.type,
              url: link.url,
            },
          })
        ),
      ]);
    }

    // Fetch updated user with social links
    const finalUser = await prisma.user.findUnique({
      where: { id },
      include: {
        social_links: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        user: finalUser,
        message: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update profile",
        message: error.message,
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

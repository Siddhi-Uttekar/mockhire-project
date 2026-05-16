import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { sendVerificationEmail } from "@/lib/email";

const RecruiterRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url("Invalid URL"),
  linkedinProfile: z.string().url("Invalid URL"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      email,
      password,
      companyName,
      companyWebsite,
      linkedinProfile
    } = RecruiterRegistrationSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const emailVerificationToken = nanoid();
    const emailVerificationTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    const newUser = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        companyName,
        companyWebsite,
        linkedinProfile,
        role: "RECRUITER",
        emailVerificationToken,
        emailVerificationTokenExpiry,
        uid: nanoid(),
        name: `${firstName} ${lastName}`,
      },
    });

    await sendVerificationEmail(email, emailVerificationToken);

    return NextResponse.json(
      { message: "Recruiter registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

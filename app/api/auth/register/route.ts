// import { NextRequest, NextResponse } from "next/server";
// import { AuthService } from "@/lib/auth";
// import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// export async function POST(request: NextRequest) {
//   try {
//     const { email, password, name, displayName } = await request.json();

//     if (!email || !password || !name) {
//       return NextResponse.json(
//         { success: false, message: "Email, password, and name are required" },
//         { status: 400 }
//       );
//     }

//     const existingUser = await AuthService.findUserByEmail(email);
//     if (existingUser) {
//       return NextResponse.json(
//         { success: false, message: "User already exists with this email" },
//         { status: 400 }
//       );
//     }

//     const user = await AuthService.createUser({
//       email,
//       password,
//       name,
//       displayName,
//     });

//     const { accessToken, refreshToken } = AuthService.generateTokens(
//       user.id,
//       user.email
//     );

//     const { password: _, ...userWithoutPassword } = user;

//     const response = NextResponse.json({
//       success: true,
//       message: "Registration successful",
//       user: userWithoutPassword,
//       accessToken,
//     });

//     response.cookies.set("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//       maxAge: 30 * 24 * 60 * 60, // 30 days
//     });

//     return response;
//   } catch (error) {
//     console.error("Registration error:", error);

//     if (
//       error instanceof PrismaClientKnownRequestError &&
//       error.code === "P2002"
//     ) {
//       return NextResponse.json(
//         { success: false, message: "User already exists with this email" },
//         { status: 400 }
//       );
//     }

//     return NextResponse.json(
//       { success: false, message: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      displayName,
      role,
      // Recruiter fields
      companyName,
      companyWebsite,
      companySize,
      industry,
      jobTitle,
      phoneNumber,
      linkedinProfile
    } = await request.json();

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        { success: false, message: "Email, password, name, and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["CANDIDATE", "RECRUITER"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role specified" },
        { status: 400 }
      );
    }

    // Additional validation for recruiters
    if (role === "RECRUITER") {
      if (!companyName || !jobTitle || !phoneNumber) {
        return NextResponse.json(
          {
            success: false,
            message: "Company name, job title, and phone number are required for recruiters"
          },
          { status: 400 }
        );
      }
    }

    const existingUser = await AuthService.findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
    }

    const user = await AuthService.createUser({
      email,
      password,
      name,
      displayName,
      role: role as "CANDIDATE" | "RECRUITER",
      companyName,
      companyWebsite,
      companySize,
      industry,
      jobTitle,
      phoneNumber,
      linkedinProfile,
    });

    const { accessToken, refreshToken } = AuthService.generateTokens(
      user.id,
      user.email,
      user.role
    );

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
      user: userWithoutPassword,
      accessToken,
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);

    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
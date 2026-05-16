import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await AuthService.findUserByEmail(email);
    if (!user || user.role !== role) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await AuthService.comparePassword(
      password,
      user.password || ""
    );
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate tokens
    const { accessToken, refreshToken } = AuthService.generateTokens(
      user.id,
      user.email,
      user.role
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    // Set HTTP-only cookie for refresh token
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

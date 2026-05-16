// import jwt from "jsonwebtoken";
// import bcrypt from "bcryptjs";
// import { prisma } from "@/lib/prisma";

// const JWT_SECRET = process.env.JWT_SECRET || "RONALDO";

// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET environment variable is required");
// }
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
// const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

// export interface JWTPayload {
//   userId: string;
//   email: string;
//   type: "access" | "refresh";
// }

// export class AuthService {
//   static async hashPassword(password: string): Promise<string> {
//     return bcrypt.hash(password, 12);
//   }

//   static async comparePassword(
//     password: string,
//     hashedPassword: string
//   ): Promise<boolean> {
//     return bcrypt.compare(password, hashedPassword);
//   }

//   static generateTokens(userId: string, email: string) {
//     const accessTokenPayload: JWTPayload = { userId, email, type: "access" };
//     const refreshTokenPayload: JWTPayload = { userId, email, type: "refresh" };

//     const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
//       expiresIn: JWT_EXPIRES_IN,
//     });

//     const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
//       expiresIn: REFRESH_TOKEN_EXPIRES_IN,
//     });

//     return { accessToken, refreshToken };
//   }

//   static verifyToken(token: string): JWTPayload | null {
//     try {
//       return jwt.verify(token, JWT_SECRET) as JWTPayload;
//     } catch (error) {
//       return null;
//     }
//   }

//   static async createUser(userData: {
//     email: string;
//     password: string;
//     name: string;
//     displayName?: string;
//     provider?: string;
//   }) {
//     const hashedPassword = await this.hashPassword(userData.password);

//     const user = await prisma.user.create({
//       data: {
//         uid: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
//         email: userData.email,
//         password: hashedPassword,
//         name: userData.name,
//         displayName: userData.displayName || userData.name,
//         provider: userData.provider || "email",
//         firstName: userData.name.split(" ")[0] || "",
//         lastName: userData.name.split(" ").slice(1).join(" ") || "",
//         tags: "",
//       },
//     });

//     return user;
//   }

//   static async findUserByEmail(email: string) {
//     return prisma.user.findUnique({
//       where: { email },
//       include: {
//         socialLinks: true,
//       },
//     });
//   }

//   static async findUserByUid(uid: string) {
//     return prisma.user.findUnique({
//       where: { uid },
//       include: {
//         socialLinks: true,
//       },
//     });
//   }
// }
// lib/auth.ts
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "RONALDO";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string; // Add role to JWT payload
  type: "access" | "refresh";
}

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async comparePassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateTokens(userId: string, email: string, role: string) {
    const accessTokenPayload: JWTPayload = {
      userId,
      email,
      role,
      type: "access",
    };
    const refreshTokenPayload: JWTPayload = {
      userId,
      email,
      role,
      type: "refresh",
    };

    const accessToken = jwt.sign(accessTokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const refreshToken = jwt.sign(refreshTokenPayload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    return { accessToken, refreshToken };
  }

  static verifyToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      return null;
    }
  }



  static async createUser(userData: {
  email: string;
  password: string;
  name: string;
  displayName?: string;
  provider?: string;
  role: "CANDIDATE" | "RECRUITER";
  // Recruiter-specific fields
  companyName?: string;
  companyWebsite?: string;
  companySize?: string;
  industry?: string;
  jobTitle?: string;
  phoneNumber?: string;
  linkedinProfile?: string;
}) {
  const hashedPassword = await this.hashPassword(userData.password);

  // Generate unique ID
  const uniqueId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const user = await prisma.user.create({
    data: {
      id: uniqueId,  // ✅ Add this line
      uid: uniqueId,
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      displayName: userData.displayName || userData.name,
      provider: userData.provider || "email",
      firstName: userData.name.split(" ")[0] || "",
      lastName: userData.name.split(" ").slice(1).join(" ") || "",
      tags: "",
      role: userData.role,
      updatedAt: new Date(),
      // Recruiter fields
      companyName: userData.companyName,
      companyWebsite: userData.companyWebsite,
      companySize: userData.companySize,
      industry: userData.industry,
      jobTitle: userData.jobTitle,
      phoneNumber: userData.phoneNumber,
      linkedinProfile: userData.linkedinProfile,
    },
  });

  return user;
}

  static async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: {
        social_links: true,
      },
    });
  }

  static async findUserByUid(uid: string) {
    return prisma.user.findUnique({
      where: { uid },
      include: {
        social_links: true,
      },
    });
  }
}

// Session helpers (same semantics as lib/session.ts)
import { cookies, headers } from "next/headers";

export interface SessionUser {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: "CANDIDATE" | "RECRUITER";
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

function parseAccessTokenFromCookieHeader(cookieHeader?: string | null): string | null {
  if (!cookieHeader) return null;
  const cookiesArr = cookieHeader.split(";").map((c) => c.trim());
  for (const c of cookiesArr) {
    const [k, v] = c.split("=");
    if (k === "accessToken") return decodeURIComponent(v || "");
  }
  return null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get("accessToken")?.value;

    if (!token) {
      const headerStore = await headers();
      const authHeader = headerStore.get("authorization");
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    const payload = AuthService.verifyToken(token);
    if (!payload || payload.type !== "access") {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        uid: true,
        email: true,
        name: true,
        role: true,
        displayName: true,
        firstName: true,
        lastName: true,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

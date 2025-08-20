"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { z } from "zod";

const prisma = new PrismaClient();
console.log('PRISMA DEBUG: DATABASE_URL =', process.env.DATABASE_URL);

export async function getDecodedAuth() {

  const token = cookies().get("auth-token")?.value;
  if (!token) return null;

  try {

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}




// Validation schemas
const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Male", "Female", "Other", "PreferNotToSay"]).optional(),
  roleId: z.number().int().positive().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Helper function to create JWT token
function createToken(userId, email, roleId) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not set");
  }

  return jwt.sign({ userId, email, roleId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Helper function to set auth cookie
async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

// Get default patient role ID
async function getDefaultPatientRoleId() {
  let role = await prisma.userRole.findUnique({
    where: { name: "patient" },
  });

  if (!role) {
    // Create default patient role if it doesn't exist
    role = await prisma.userRole.create({
      data: {
        name: "patient",
        description: "Default patient role",
      },
    });
  }

  return role.id;
}

// Get physiotherapist role ID
async function getPhysiotherapistRoleId() {
  let role = await prisma.userRole.findUnique({
    where: { name: "physiotherapist" },
  });

  if (!role) {
    // Create physiotherapist role if it doesn't exist
    role = await prisma.userRole.create({
      data: {
        name: "physiotherapist",
        description: "Physiotherapist role",
      },
    });
  }

  return role.id;
}

// SIGNUP ACTION
export async function signup(formData) {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      roleId: formData.get("roleId")
        ? parseInt(formData.get("roleId"))
        : undefined,
    };

    const validatedData = signupSchema.parse(rawData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User already exists with this email",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Get default role if not provided
    const roleId = validatedData.roleId || (await getDefaultPatientRoleId());

    // Parse date of birth if provided
    const dateOfBirth = validatedData.dateOfBirth
      ? new Date(validatedData.dateOfBirth)
      : undefined;

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phone: validatedData.phone || null,
        dateOfBirth,
        gender: validatedData.gender,
        roleId,
      },
      include: {
        role: true,
      },
    });

    // Create and set auth token
    const token = createToken(user.id, user.email, user.roleId);
    await setAuthCookie(token);

    return {
      success: true,
      message: "Account created successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("Signup error:", error);
    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

// LOGIN ACTION
export async function login(formData) {
  try {
    // Extract and validate form data
    const rawData = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    const validatedData = loginSchema.parse(rawData);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        message: "Account has been deactivated. Please contact support.",
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      validatedData.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      return {
        success: false,
        message: "Invalid email or password",
      };
    }

    // Create and set auth token
    const token = createToken(user.id, user.email, user.roleId);
    await setAuthCookie(token);

    return {
      success: true,
      message: "Login successful",
      userRole: user.role.name,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    console.error("Login error:", error);
    return {
      success: false,
      message: "Login failed. Please try again.",
    };
  }
}

// LOGOUT ACTION
export async function logout() {
  try {
    const cookieStore = await cookies();

    // Remove the auth cookie
    cookieStore.delete("auth-token");

    // Redirect to login page
    redirect("/login");
  } catch (error) {
    console.error("Logout error:", error);
    // Still redirect even if there's an error
    redirect("/login");
  }
}

// Helper function to get current user from token
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token || !process.env.JWT_SECRET) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);


    const user = await prisma.user.findUnique({
      where: { id: Number(decoded.userId) },
      include: {
        role: true,
      },
    });

    return user?.isActive ? user : null;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Helper function to require authentication
export async function requireAuth() {
  console.log("here");
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

// Helper function to check if user has specific role
export async function checkUserRole(allowedRoles) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(user.role.name)) {
    throw new Error("Unauthorized: Insufficient permissions");
  }

  return user;
}

// PHYSIOTHERAPIST REGISTRATION ACTION
export async function registerPhysiotherapist(formData) {
  try {
    // Extract and validate form data
    const rawData = {
      // Basic user data
      email: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone") || undefined,
      dateOfBirth: formData.get("dateOfBirth") || undefined,
      gender: formData.get("gender") || undefined,
      
      // Physiotherapist-specific data
      coruRegistration: formData.get("coruRegistration"),
      qualification: formData.get("qualification"),
      yearsExperience: formData.get("yearsExperience") ? parseInt(formData.get("yearsExperience")) : undefined,
      bio: formData.get("bio"),
      hourlyRate: formData.get("hourlyRate") ? parseFloat(formData.get("hourlyRate")) : undefined,
      specializations: formData.get("specializations") ? JSON.parse(formData.get("specializations")) : [],
      selectedClinic: formData.get("selectedClinic") ? parseInt(formData.get("selectedClinic")) : undefined,
    };

    // Validate required fields
    if (!rawData.email || !rawData.password || !rawData.firstName || !rawData.lastName) {
      return {
        success: false,
        message: "Please fill in all required fields",
      };
    }

    if (!rawData.coruRegistration) {
      return {
        success: false,
        message: "CORU registration number is required for physiotherapists",
      };
    }

    if (!rawData.selectedClinic) {
      return {
        success: false,
        message: "Please select a clinic to associate with your profile",
      };
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: rawData.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "User already exists with this email",
      };
    }

    // Hash password
    const passwordHash = await bcrypt.hash(rawData.password, 12);

    // Get physiotherapist role
    const roleId = await getPhysiotherapistRoleId();

    // Parse date of birth if provided
    const dateOfBirth = rawData.dateOfBirth
      ? new Date(rawData.dateOfBirth)
      : undefined;

    // Create user and physiotherapist profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email: rawData.email,
          passwordHash,
          firstName: rawData.firstName,
          lastName: rawData.lastName,
          phone: rawData.phone || null,
          dateOfBirth,
          gender: rawData.gender,
          roleId,
        },
        include: {
          role: true,
        },
      });

      // Create physiotherapist profile
      const physiotherapistProfile = await tx.physiotherapistProfile.create({
        data: {
          userId: user.id,
          coruRegistration: rawData.coruRegistration,
          qualification: rawData.qualification,
          yearsExperience: rawData.yearsExperience,
          bio: rawData.bio,
          hourlyRate: rawData.hourlyRate,
          isVerified: false, // Requires admin verification
          isAvailable: false, // Not available until verified
        },
      });

      // Add specializations if provided
      if (rawData.specializations && rawData.specializations.length > 0) {
        const specializationRecords = rawData.specializations.map((specializationId) => ({
          physiotherapistId: physiotherapistProfile.id,
          specializationId: parseInt(specializationId),
        }));

        await tx.physiotherapistSpecialization.createMany({
          data: specializationRecords,
        });
      }

      // Create clinic association
      if (rawData.selectedClinic) {
        await tx.physiotherapistClinic.create({
          data: {
            physiotherapistId: physiotherapistProfile.id,
            clinicId: rawData.selectedClinic,
            isPrimary: true, // First clinic is always primary
            startDate: new Date(),
          },
        });
      }

      return { user, physiotherapistProfile };
    });

    // Create and set auth token
    const token = createToken(result.user.id, result.user.email, result.user.roleId);
    await setAuthCookie(token);

    return {
      success: true,
      message: "Physiotherapist registration successful. Your profile is pending verification.",
    };
  } catch (error) {
    console.error("Physiotherapist registration error:", error);
    return {
      success: false,
      message: "Failed to register physiotherapist. Please try again.",
    };
  }
}

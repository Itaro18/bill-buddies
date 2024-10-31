import { PrismaClient } from "@prisma/client";
// import CredentialsProvider from 'next-auth/providers/credentials';
// import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcrypt";
import { SignupSchema } from "@/lib/validators/auth.validator";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { ErrorHandler } from "@/lib/error";

const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const result = SignupSchema.safeParse(body);
    if (!result.success) {
      throw new ErrorHandler("Input Validation failed", "VALIDATION_ERROR", {
        fieldErrors: result.error.flatten().fieldErrors,
      });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: result.data.email,
      },
    });

    if (existingUser) {
      throw new ErrorHandler("User already Exists", "AUTHENTICATION_FAILED");
    } else {
      const hashedPassword = await bcrypt.hash(result.data.password, 10);
      const user = await prisma.user.create({
        data: {
          email: result.data.email,
          name: result.data.name,
          password: hashedPassword,
        },
      });
      if (!user) {
      }
    }
    return NextResponse.json(
      { message: "user created successfully" },
      { status: 201 },
    );
  } catch (e: any) {
    console.log(e.message);
    return NextResponse.json(
      { error: "Something went wrong! Please try again later" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { groupSchema } from '@/lib/validators/create.validator';
import { ErrorHandler } from '@/lib/error';
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth"
import { NEXT_AUTH_CONFIG } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    try {
        const body = await request.json();

        const result = groupSchema.safeParse(body);

        if (!result.success) {
            throw new ErrorHandler(
                'Input Validation failed',
                'VALIDATION_ERROR',
                {
                    fieldErrors: result.error.flatten().fieldErrors,
                }
            );
        }
        const {
            name,

        } = result.data;

        const existingUser = await prisma.user.findFirst({
            where: {
                email: session?.user?.email
            }
        });
        if (existingUser) {
            const group = await prisma.group.create({

                data: {
                    name: name,
                    users: {
                        connect: { id: existingUser.id }
                    }
                },
                include: {
                    users: true
                }
            });
            if (group) {
                return NextResponse.json({ message: "Group created successfully" }, { status: 201 })
            }

        }
        else {
            throw new ErrorHandler(
                'Input Validation failed',
                'VALIDATION_ERROR',
                {

                }
            );
        }

    }
    catch (e: any) {
        return NextResponse.json({ error: "Something went wrong! Please try again later" }, { status: 500 })
    }

};
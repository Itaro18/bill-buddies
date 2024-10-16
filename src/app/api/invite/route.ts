import { headers } from 'next/headers'
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from 'next-auth';
import { NEXT_AUTH_CONFIG } from '@/lib/auth';
import { ErrorHandler } from '@/lib/error';
import { inviteSchema } from '@/lib/validators/create.validator';

/* eslint-disable  @typescript-eslint/no-explicit-any */

const prisma = new PrismaClient();
export async function GET() {

    const headersList = headers();
    const id = headersList.get('id') || '';

    try {

        const res = await prisma.group.findUnique({
            where: {
                id
            }
        })

        const expiryDate = new Date(res?.inviteExpiry || "");
        const currentDate = new Date();


        const differenceInMs = currentDate.getTime() - expiryDate.getTime();

        const twentyFourHoursInMs = 24 * 60 * 60 * 1000;

        if (differenceInMs > twentyFourHoursInMs || res?.inviteCode === '') {
            const newInvite = Math.floor(100000000 + Math.random() * 900000000);

            console.log(newInvite)
            const t = await prisma.group.update({
                where: {
                    id
                },
                data: {
                    inviteCode: newInvite.toString(),
                    inviteExpiry: new Date()
                }
            })
            return NextResponse.json({ code: t.inviteCode })
        }
        else {
            return NextResponse.json({ code: res?.inviteCode })
        }

    }
    catch (e) {
        return NextResponse.json({ error: "something went wrong try again later" }, { status: 500 })
    }
}


export async function POST(request: NextRequest) {
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    try {
        const body = await request.json();

        const result = inviteSchema.safeParse(body);

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
            code

        } = result.data;

        const existingUser = await prisma.user.findFirst({
            where: {
                email: session?.user?.email
            }
        });

        const existingGroup = await prisma.group.findFirst({
            where: {
                inviteCode: code
            },
            include: {
                users: true
            }
        });

        if (existingUser && existingGroup) {
            for (let i = 0; i < existingGroup.users.length; i++) {
                if (existingUser.id === existingGroup.users[i].id) {
                    return NextResponse.json({ message: "Already presnt in Group" }, { status: 201 })
                }
            }
            const group = await prisma.group.update({
                where: {
                    id: existingGroup?.id
                },
                data: {

                    users: {
                        connect: { id: existingUser.id }
                    }
                },
            });
            if (group) {
                return NextResponse.json({ message: `Joined Group ${existingGroup.name}` }, { status: 201 })
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
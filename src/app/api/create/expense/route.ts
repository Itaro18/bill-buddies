// import { NEXT_AUTH_CONFIG } from "@/lib/auth";
// import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ErrorHandler } from "@/lib/error";
import { PrismaClient } from "@prisma/client";

const expenseEntrySchema = z.object({
  description: z.string(),
  amount: z.number(),
  payer: z.string(),
  grpId: z.string(),
  id: z.string(),
  name: z.string(),
  time: z.string().datetime(),
  email: z.string().email(),
  userExpenses: z.array(
    z.object({
      id: z.string(),
      share: z.number(),
    }),
  ),
  isSettlement: z.boolean(),
});
const prisma = new PrismaClient();
export async function POST(request: NextRequest) {
  // const session = await getServerSession(NEXT_AUTH_CONFIG);

  try {
    const body = await request.json();

    const result = expenseEntrySchema.safeParse(body);

    if (!result.success) {
      throw new ErrorHandler("Input Validation failed", "VALIDATION_ERROR", {
        fieldErrors: result.error.flatten().fieldErrors,
      });
    }

    // console.log({
    //     description:result.data.description,
    //     amount:result.data.amount,
    //     date: new Date(result.data.time),
    //     paidById: result.data.id,
    //     groupId:result.data.grpId,
    //     userExpenses: {
    //         create: result.data.userExpenses.map(ue => ({
    //             userId: ue.id,
    //             amount: parseFloat(ue.share)
    //         }))
    //     }
    // })

    if (result.data.isSettlement) {
      return NextResponse.json(
        { error: "Something went wrong! Please try again later" },
        { status: 500 },
      );
    }

    const res = await prisma.expense.create({
      data: {
        description: result.data.description,
        amount: result.data.amount * 100,
        date: new Date(result.data.time),
        paidById: result.data.id,
        groupId: result.data.grpId,
        isSettlement: false,
        userExpenses: {
          create: result.data.userExpenses.map((ue) => ({
            userId: ue.id,
            amount: ue.share * 100,
            groupId: result.data.grpId,
          })),
        },
      },
      include: {
        userExpenses: true,
      },
    });

    if (!res) {
      throw new ErrorHandler("Input Validation failed", "VALIDATION_ERROR", {});
    }
    return NextResponse.json(
      { message: "Transaction recorded Successfully" },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong! Please try again later" },
      { status: 500 },
    );
  }
}

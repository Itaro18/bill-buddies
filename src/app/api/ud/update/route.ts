import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ErrorHandler } from "@/lib/error";
import { PrismaClient } from "@prisma/client";

const expenseEntrySchema = z.object({
  description: z.string(),
  amount: z.number(),
  payer: z.string(),
  txnId: z.string(),
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
  try {
    const body = await request.json();
    console.log("here", body);
    const result = expenseEntrySchema.safeParse(body);

    if (!result.success) {
      throw new ErrorHandler("Input Validation failed", "VALIDATION_ERROR", {
        fieldErrors: result.error.flatten().fieldErrors,
      });
    }

    if (result.data.isSettlement) {
      return NextResponse.json(
        { error: "Something went wrong! Please try again later" },
        { status: 500 },
      );
    }

    const res = await prisma.$transaction(async (tx) => {
      await tx.userExpense.deleteMany({
        where: {
          expenseId: result.data.txnId,
        },
      });

      await prisma.expense.update({
        where: {
          id: result.data.txnId,
        },
        data: {
          description: result.data.description,
          amount: result.data.amount * 100,
          paidById: result.data.id,
          isSettlement: false,
        },
      });

      await tx.userExpense.createMany({
        data: result.data.userExpenses.map((ue) => ({
          userId: ue.id,
          amount: ue.share * 100,
          groupId: result.data.grpId,
          expenseId: result.data.txnId,
        })),
      });

      return tx.expense.findUnique({
        where: {
          id: result.data.txnId,
        },
        include: {
          userExpenses: true,
        },
      });
    });

    if (!res) {
      throw new ErrorHandler("Input Validation failed", "VALIDATION_ERROR", {});
    }
    return NextResponse.json(
      { message: "Transaction Updated Successfully" },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "Something went wrong! Please try again later" },
      { status: 500 },
    );
  }
}

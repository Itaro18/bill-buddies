import { NextRequest, NextResponse } from "next/server";
import { boolean, z } from "zod";
import { ErrorHandler } from "@/lib/error";
import { PrismaClient } from "@prisma/client";

const requestSchema = z.object({
  isSettlement: z.boolean(),
  txnId: z.string(),
});

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = requestSchema.safeParse(body);

    if (!result.success) {
      throw new ErrorHandler("Input Validation failed", "VALIDATION_ERROR", {
        fieldErrors: result.error.flatten().fieldErrors,
      });
    }

    const verifyTxn = await prisma.expense.findUnique({
      where: {
        id: result.data.txnId,
      },
    });
    console.log("here");
    if (verifyTxn) {
      const del = await prisma.expense.delete({
        where: {
          id: result.data.txnId,
        },
      });
      return NextResponse.json(
        { message: "Transaction deleted sucessfully" },
        { status: 202 },
      );
    }

    return NextResponse.json(
      { error: "Something went wrong! Please try again later" },
      { status: 500 },
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: "Something went wrong! Please try again later" },
      { status: 500 },
    );
  }
}

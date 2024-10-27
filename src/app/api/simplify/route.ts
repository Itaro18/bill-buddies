import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { simplify } from "@/app/services/expenseService";

/* eslint-disable  @typescript-eslint/no-explicit-any */
const prisma = new PrismaClient()

/* Todo add payerId to userExpense */


export async function POST(req: NextRequest) {
    const session =await getServerSession(NEXT_AUTH_CONFIG)
    const body = await req.json()
    const grpId = body.grpId
    const userId = session.user.id
    
    
    try {
        const  res= await simplify(grpId,userId)

        return NextResponse.json({ ledger:res }, { status: 200 })
    }
    catch (e: any) {
        return NextResponse.json({ message: "somehting went wrong" }, { status: 500 })
    }
}
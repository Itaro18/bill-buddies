import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
// import {z} from 'zod';
import { ErrorHandler } from "@/lib/error";
import { PrismaClient } from "@prisma/client";
import {simplify} from "@/app/services/expenseService"
/* eslint-disable @typescript-eslint/no-explicit-any */

// const groupsSchema = z.object({
//     email: z.string().email('Email is invalid').min(1, 'Email is required'),
// })

export async function GET() {
    const prisma = new PrismaClient();
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    try {

        const res = await prisma.user.findUnique({
            where: {
                email: session?.user?.email
            },
            select: {
                groups: true
            }
        })
      
        const names = res?.groups.map(async (group) =>{
            const txns = await simplify( 
                group.id,
              );
              let ledger=txns.data.ledger;
              let total = 0;
              
              for (let i = 0; i < ledger.length; i++) {
                total += ledger[i][1];
              }
              total= Number((total/100).toFixed(2))
            return  {   
                name:group.name,
                id:group.id,
                total:total
            }
        })
       
        if (res) {
            return NextResponse.json({ names }, { status: 200 })
        }
        else {
            throw new ErrorHandler(
                'Input Validation failed',
                'VALIDATION_ERROR',
                {

                }
            );
        }
        // return NextResponse.json({message:"great"},{status:200})
    }
    catch (e: any) {
        return NextResponse.json({ error: "something went wrong !Try again later" }, { status: 500 })
    }

}
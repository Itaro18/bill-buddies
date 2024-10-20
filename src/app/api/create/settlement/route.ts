import { NextRequest, NextResponse } from "next/server";
import {z} from "zod"
import { ErrorHandler } from '@/lib/error';
import { PrismaClient } from "@prisma/client";

const settlement =z.object({
    amount:z.number(),
    grpId:z.string(),
    id:z.string(),
    toId:z.string(),
})

export async function POST(request:NextRequest){
    try{
        const body= await request.json();

        const result= settlement.safeParse(body);
        console.log(result)
        if(!result.success){
            throw new ErrorHandler(
                'Input Validation failed',
                'VALIDATION_ERROR',
                {
                    fieldErrors: result.error.flatten().fieldErrors,
                }
            );
        }
        const prisma = new PrismaClient()

        const res= await prisma.expense.create({
            data:{
                description:"",
                amount:result.data.amount,
                date: new Date(),
                paidById:result.data.id,
                groupId:result.data.grpId,
                isSettlement:true,
                userExpenses: {
                    create: [
                        {   
                            userId:result.data.id,
                            groupId:result.data.grpId,
                            amount:result.data.amount,
                        },{
                            userId:result.data.toId,
                            groupId:result.data.grpId,
                            amount:result.data.amount,
                        }
                    ]
                }
            }
        })

        if(!res){
            throw new ErrorHandler(
                'Input Validation failed',
                'VALIDATION_ERROR',
                {

                }
            );
        }
        return NextResponse.json({message:"Setllement recorded Successfully"},{status:201})

    }
    catch(e:any){
        return NextResponse.json({ error: "Something went wrong! Please try again later" }, { status: 500 })

    }
    

}
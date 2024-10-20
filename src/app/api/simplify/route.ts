import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
/* eslint-disable  @typescript-eslint/no-explicit-any */
const prisma = new PrismaClient()

/* Todo add payerId to userExpense */
async function PayerMaper(expenseList: { expenseId: string, id: string }[]) {
    const payers = new Map();
    for (let i = 0; i < expenseList.length; i++) {
        const payer = await prisma.expense.findUnique({
            where: {
                id: expenseList[i].expenseId
            },
            select: {
                paidById: true
            }
        })
        payers.set(expenseList[i].id, payer?.paidById)
    }
    return payers;
}

function DataMapper(payerMap: Map<string, string>, txns: { expenseId: string, id: string, userId: string, amount: number ,groupId: string,  createdAt: Date, updatedAt: Date ,expense:{isSettlement:boolean}}[]) {
    const finalData = []
    for (let i = 0; i < txns.length; i++) {
        if (txns[i].userId === payerMap.get(txns[i].id)) {
            continue;
        }
        else {
            const payer = payerMap.get(txns[i].id)
            const paidFor = txns[i].userId
            const amt = txns[i].amount
            const isSettlement =txns[i].expense.isSettlement
            finalData.push({ paidFor, payer, amt ,isSettlement})
        }
    }
    return finalData
}

function ledgerMaker(arr: { paidFor: string, payer: string | undefined, amt: number ,isSettlement:boolean}[],userId:string,users:{id:string}[]) {
    const ledger =new Map()
    for(let i=0;i<users.length;i++){
        ledger.set(users[i].id,0)
    }

    for(let i=0;i<arr.length;i++){
        if(arr[i].paidFor === userId){
            const x= ledger.get(arr[i].payer)
            ledger.set(arr[i].payer,x-arr[i].amt)
            
        }
        else if(arr[i].payer === userId){
            const x= ledger.get(arr[i].paidFor)
            ledger.set(arr[i].paidFor,x+arr[i].amt)
            
        }
    }
    return ledger
}



export async function POST(req: NextRequest) {
    const session =await getServerSession(NEXT_AUTH_CONFIG)
    const body = await req.json()
    const grpId = body.grpId
    const userId = session.user.id
    
    
    try {
       
        const check = await prisma.user.findUnique({
            where: {
                id: userId,
                groups: {
                    some: {
                        id: grpId
                    }
                }
            },
        })
        
        if (!check) {
            return NextResponse.json({ error: "Invalid group ID or user ID" }, { status: 404 })
        }
        const txns = await prisma.userExpense.findMany({
            where: {
                groupId: grpId
            },
            include:{
                expense:{
                    select:{
                        isSettlement:true
                    }
                }
            }
        })
        const payerMap = await PayerMaper(txns)
        const finalData = DataMapper(payerMap, txns)
        const data =await prisma.group.findUnique({
            where:{
                id:grpId
            },
            include:{
                users:{
                    select:{
                        id:true,
                        name:true
                    }
                }
            }
        })

        let users = data?.users ?? [];

        users = users?.filter((user) => user?.id !== session.user.id);
        
        const result = ledgerMaker(finalData,session.user.id,users)
        const res:[userId:string, amt:number][]=[]
        result.forEach((value, key) => {
            res.push([key,value])
        })
        

        return NextResponse.json({ ledger:res }, { status: 200 })
    }
    catch (e: any) {
        return NextResponse.json({ message: "somehting went wrong" }, { status: 500 })
    }
}
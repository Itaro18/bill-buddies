import { headers } from 'next/headers'
import { getServerSession } from 'next-auth';
import { NEXT_AUTH_CONFIG } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { split } from 'postcss/lib/list';
/* eslint-disable  @typescript-eslint/no-explicit-any */



type userTxn={
    id:string;
    userId:string;
    expenseId:string;
    groupId:string;
    amount:number;
    createdAt:Date;
    updatedAt:Date;
    expense:{
        description:string;
        amount:number;
        date: Date;
        paidById:string;
    }
}

type outData={
    time:Date;
    description:string;
    paidById:string;
    amount:number;
    share:number
}

function processTxns(userTxns:userTxn[],id:string){
    const arr :outData[]=[];

    for(let i=0;i<userTxns.length;i++){
        const time=userTxns[i].expense.date
        const description=userTxns[i].expense.description
        const paidById=userTxns[i].expense.paidById
        const amount= userTxns[i].expense.amount
        const share= id === paidById ? amount - userTxns[i].amount : userTxns[i].amount

        arr.push({time ,description,paidById,amount,share})
    }

    return arr;
}

export async function GET(){
    console.log("here")
    const session = await getServerSession(NEXT_AUTH_CONFIG);
    const headersList = headers();
    const grpId = headersList.get('id') || '';
    const prisma= new PrismaClient();
    const userId=session.user.id

    try{

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

        const txns = await prisma.expense.findMany({
            where:{
                groupId:grpId
            }
        })

        if(txns){
            
            let userTxns = await prisma.userExpense.findMany({
                where:{
                    groupId:grpId,
                },
                include:{
                    expense:{
                        select:{
                            description:true,
                            amount:true,
                            date:true,
                            paidById:true
                        }
                    }
                },
                
            })
            // to-do remove after advanced split
            userTxns = userTxns?.filter((txn) => txn?.userId === session.user.id);
            const res = processTxns(userTxns,userId) 
            console.log(res)
            return NextResponse.json({ txns: res }, { status: 200 })
        }

        
        return NextResponse.json({ message: "working" }, { status: 200 })
    }catch(e:any){
        return NextResponse.json({ message: "somehting went wrong" }, { status: 500 })
    }

}
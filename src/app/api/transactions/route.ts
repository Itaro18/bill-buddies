import { headers } from 'next/headers'
import { getServerSession } from 'next-auth';
import { NEXT_AUTH_CONFIG } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { split } from 'postcss/lib/list';
/* eslint-disable  @typescript-eslint/no-explicit-any */



type userTxn={
    id:string;
    description:string;
    amount:number;
    date: Date;
    paidById:string;
    groupId:string;
    createdAt:Date;
    updatedAt:Date;
    userExpenses:{
        userId:string;
        amount:number;       
    }[]
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
        const time = userTxns[i].date;
        const description =userTxns[i].description;
        const paidById = userTxns[i].paidById;
        const amount = userTxns[i].amount
        let share = 0
        for(let j=0;j<userTxns[i].userExpenses.length;j++){
            if(userTxns[i].userExpenses[j].userId===id){
                share = id === paidById ? amount - userTxns[i].userExpenses[j].amount : userTxns[i].userExpenses[j].amount
            }
        }

        arr.push({time ,description,paidById,amount,share})
    }

    return arr;
}

export async function GET(){
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
            },
            include:{
                userExpenses:{
                    select:{
                        userId:true,
                        amount:true
                    }
                }
            }
        })

        if(txns){
            console.log(txns[0].userExpenses)
            console.log(txns)
            // let userTxns = await prisma.userExpense.findMany({
            //     where:{
            //         groupId:grpId,
            //     },
            //     include:{
            //         expense:{
            //             select:{
            //                 description:true,
            //                 amount:true,
            //                 date:true,
            //                 paidById:true
            //             }
            //         }
            //     },
                
            // })
            // to-do remove after advanced split
            // userTxns = userTxns?.filter((txn) => txn?.userId === session.user.id);
            const res = processTxns(txns,userId) 
            res.reverse()
            return NextResponse.json({ txns: res }, { status: 200 })
        }

        
        return NextResponse.json({ message: "no transactions" }, { status: 200 })
    }catch(e:any){
        return NextResponse.json({ message: "somehting went wrong" }, { status: 500 })
    }

}
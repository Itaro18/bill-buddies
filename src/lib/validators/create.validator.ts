import {z} from "zod"

export const groupSchema=z.object({

    name: z.string().min(3, 'Group name is should have min of 3 characters'),
    // email: z.string().email('Email is invalid').min(1, 'Email is required')
})

export const inviteSchema=z.object({
    code: z.string().length(9, 'Invalid Invite'),
}) 


export const expenseSchema=z.object({
    description:z.string().min(1,'Description should have a min length of 1'),
    amount:z.number().min(0, "Amount must be non-negative").refine(x => x * 100 - Math.trunc(x * 100)< Number.EPSILON,{
        message:"only 2 deciaml places allowed"
    }),
    payer:z.string().min(1,'Please select the payer'), 
    splitEqually:z.boolean(),
    splits:z.record(z.string(), z.number().min(0, "Amount must be non-negative"))
})



export type groupType =z.infer<typeof groupSchema>
export type expenseType =z.infer<typeof expenseSchema>
export type inviteType =z.infer<typeof inviteSchema>
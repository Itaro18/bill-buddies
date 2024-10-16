import nodemailer from 'nodemailer'
import bcrypt from "bcrypt"

// Looking to send emails in production? Check out our Email API/SMTP product!

export default async function sendInvite({toEmail,fromEmail,grpName,senderName}:{toEmail:string,fromEmail:string,grpName:string,senderName:string}){


    const  transporter = nodemailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
        user: "331b57ef956852",
        pass: "8832e7532a8cdf"
        }
    });
    
    const hashedToken = await bcrypt.hash(fromEmail, 10)
    
    await transporter.sendMail({
    from: "billbuddies@gmail.com",
    to: toEmail,
    subject: `You're invited to join  on Splitwise`,
    html: `
        <p>Hello,</p>
        <p>${senderName} has invited you to join ${grpName} on BillBuddies.</p>
        <p>Click <a href="${process.env.NEXT_PUBLIC_APP_URL}/verifyInvite?=${hashedToken}">here</a> to accept the invitation.</p>
        <p>or paste this in your browser : ${process.env.NEXT_PUBLIC_APP_URL}/verifyInvite?=${hashedToken}<p>
    `,
    })
   

};


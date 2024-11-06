import { PrismaClient } from "@prisma/client";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import bcrypt from "bcrypt"
// import {
//   SigninSchema,
// } from '@/lib/validators/auth.validator';
import { SessionStrategy } from "next-auth";
/* eslint-disable  @typescript-eslint/no-explicit-any */
const prisma = new PrismaClient();

export const NEXT_AUTH_CONFIG = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // CredentialsProvider({
    //   name: 'Email',
    //   credentials: {
    //     email: { label: 'email', type: 'text', placeholder: '' },
    //     password: { label: 'password', type: 'password', placeholder: '' },
    //   },
    //   async authorize(credentials):Promise<any> {
    //     if (!credentials?.email || !credentials?.password) {
    //       return null
    //     }

    //     const result = SigninSchema.safeParse({
    //       email: credentials.email,
    //       password: credentials.password,
    //     });

    //     if (!result.success) {

    //       throw new ErrorHandler(
    //         'Input Validation failed',
    //         'VALIDATION_ERROR',
    //         {
    //           fieldErrors: result.error.flatten().fieldErrors,
    //         }
    //       );
    //     }

    //     const existingUser = await prisma.user.findFirst({
    //       where: {
    //         email: result.data.email
    //       }
    //     });

    //     if (existingUser) {
    //       const passwordValidation = await bcrypt.compare(result.data.password, existingUser.password);

    //       if (passwordValidation) {
    //         return {
    //           id: existingUser.id.toString(),
    //           name: existingUser.name,
    //           email: existingUser.email
    //         }
    //       }
    //     }
    //     throw new ErrorHandler(
    //       'Email or password is incorrect',
    //       'AUTHENTICATION_FAILED'
    //     );
    //   },
    // }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as SessionStrategy },
  callbacks: {
    async jwt({ token }: any) {
      return token;
    },
    async session({ session, token }: any) {
      // const user = await prisma.user.findUnique({
      //   where: {
      //     id: token.sub,
      //   },
      // });
      if (token) {
        // console.log(token)
        session.accessToken = token.accessToken;
        session.user.id = token.sub;
        // console.log(session.user)
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};

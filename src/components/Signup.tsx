"use client";
import React, { useState } from "react";
import { signIn } from "next-auth/react";
// import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  SignupSchema,
  SignupSchemaType,
} from "@/lib/validators/auth.validator";
import { Toaster, toast } from "sonner";
import { Separator } from "./ui/separator";
/* eslint-disable  @typescript-eslint/no-explicit-any */

export const Signup = () => {
  // const {
  //   register,
  //   handleSubmit,
  //   formState: { errors },
  // } = useForm<SignupSchemaType>({
  //   resolver: zodResolver(SignupSchema)
  // });
  //   // const [name,setName]=useState('')
  //   // const [email,setEmail]=useState('');
  //   // const [password,setPassword]=useState('');
  //   // const [confirmPassword,setConfirmPassword]=useState('');
  //   const [showPassowrd,setShowPassword]=useState(false)
  //   const [showConfirmPassowrd,setShowConfirmPassword]=useState(false)
  //   // const router = useRouter();

  //   const onSubmit = async (data:SignupSchemaType) => {

  //     try{

  //       const response=await axios.post('/api/auth/signup',{
  //         name:data.name,
  //         email:data.email,
  //         password:data.password,
  //         confirmPassword:data.confirmPassword
  //       })

  //       if(response){

  //         signIn()
  //       }

  //     }catch(e:any){

  //       toast.error(e.response.data.error,{
  //         duration: 5000,
  //       })
  //     }

  //   }
  return (
    <main className="flex items-center justify-center w-full h-screen ">
      <section className="flex flex-col h-1/2  w-1/2 items-center justify-center ">
        {/* <form onSubmit={handleSubmit(onSubmit)}>
    <Card className="w-[380px] mb-5 border-0 ">
        <CardHeader>
            <CardTitle>Create Your Account </CardTitle>
            
        </CardHeader>
        <CardContent>
            
            <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input {...register('name')} id="name" placeholder="jon doe" />
                {errors.name && <p className="text-red-600">{errors.name.message?.toString()}</p>}
                </div>
                <div className="flex flex-col space-y-1.5">
                <Label htmlFor="name">Email</Label>
                <Input {...register('email')}  id="email" placeholder="name@mail.com" />
                {errors.email && <p className="text-red-600">{errors.email.message?.toString()}</p>}
                </div>
                <div className=" relative flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input {...register('password')} id="password" type={showPassowrd?"text":"password"} placeholder="********" />
                {errors.password && <p className="text-red-600">{errors.password.message?.toString()}</p>}
               <button
               type="button"
                  className={`absolute right-0  flex h-10 items-center px-4 text-gray-600 ${errors.password?'bottom-7 ' : 'bottom-0' }`}
                  onClick={()=>{setShowPassword(!showPassowrd)}}
                >
                  {showPassowrd ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
                
              
                </div>
                <div className=" relative flex flex-col space-y-1.5">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input {...register('confirmPassword')} id="password" type={showConfirmPassowrd?"text":"password"} placeholder="********" />
                {errors.confirmPassword && <p className="text-red-600">{errors.confirmPassword.message?.toString()}</p>}
                <button
                  type="button"
                  className={`absolute right-0  flex h-10 items-center px-4 text-gray-600 ${errors.confirmPassword?'bottom-7 ' : 'bottom-0' }`}
                  onClick={()=>{setShowConfirmPassword(!showConfirmPassowrd)}}
                >
                  {showConfirmPassowrd ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
                
                </div>
                
            </div>
            
        </CardContent>
        <CardFooter className="flex  justify-center">
              <Toaster toastOptions={{
              style: { background: 'black',
                border: '2px solid red',
                color: 'white'
              },
            }}/>
            <Button type="submit" className="w-full bg-red-600 hover:bg-red-300">Create an account</Button>
            
            
        </CardFooter>
        <div className="flex text-sm justify-center items-center pb-3">
          <p>Already have an account?</p>
          <a href="/signin" className="underline decoration-red-600 cursor-pointer">Sign in</a>
        </div>
    </Card>
    </form> */}
        <div className="border-2 border-gray-500 p-5 rounded-md">
          <Button
            className="w-[340px] border text-zinc-800 border-zinc-800 bg-red-600 hover:bg-red-300 cursor-pointer"
            onClick={async () => {
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <svg
              width={20}
              style={{ margin: 14 }}
              viewBox="-0.5 0 48 48"
              version="1.1"
              fill="#000000"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <title>Google-color</title> <desc>Created with Sketch.</desc>{" "}
                <defs> </defs>{" "}
                <g
                  id="Icons"
                  stroke="none"
                  stroke-width="1"
                  fill="none"
                  fill-rule="evenodd"
                >
                  {" "}
                  <g
                    id="Color-"
                    transform="translate(-401.000000, -860.000000)"
                  >
                    {" "}
                    <g
                      id="Google"
                      transform="translate(401.000000, 860.000000)"
                    >
                      {" "}
                      <path
                        d="M9.82727273,24 C9.82727273,22.4757333 10.0804318,21.0144 10.5322727,19.6437333 L2.62345455,13.6042667 C1.08206818,16.7338667 0.213636364,20.2602667 0.213636364,24 C0.213636364,27.7365333 1.081,31.2608 2.62025,34.3882667 L10.5247955,28.3370667 C10.0772273,26.9728 9.82727273,25.5168 9.82727273,24"
                        id="Fill-1"
                        fill="#FBBC05"
                      >
                        {" "}
                      </path>{" "}
                      <path
                        d="M23.7136364,10.1333333 C27.025,10.1333333 30.0159091,11.3066667 32.3659091,13.2266667 L39.2022727,6.4 C35.0363636,2.77333333 29.6954545,0.533333333 23.7136364,0.533333333 C14.4268636,0.533333333 6.44540909,5.84426667 2.62345455,13.6042667 L10.5322727,19.6437333 C12.3545909,14.112 17.5491591,10.1333333 23.7136364,10.1333333"
                        id="Fill-2"
                        fill="#EB4335"
                      >
                        {" "}
                      </path>{" "}
                      <path
                        d="M23.7136364,37.8666667 C17.5491591,37.8666667 12.3545909,33.888 10.5322727,28.3562667 L2.62345455,34.3946667 C6.44540909,42.1557333 14.4268636,47.4666667 23.7136364,47.4666667 C29.4455,47.4666667 34.9177955,45.4314667 39.0249545,41.6181333 L31.5177727,35.8144 C29.3995682,37.1488 26.7323182,37.8666667 23.7136364,37.8666667"
                        id="Fill-3"
                        fill="#34A853"
                      >
                        {" "}
                      </path>{" "}
                      <path
                        d="M46.1454545,24 C46.1454545,22.6133333 45.9318182,21.12 45.6113636,19.7333333 L23.7136364,19.7333333 L23.7136364,28.8 L36.3181818,28.8 C35.6879545,31.8912 33.9724545,34.2677333 31.5177727,35.8144 L39.0249545,41.6181333 C43.3393409,37.6138667 46.1454545,31.6490667 46.1454545,24"
                        id="Fill-4"
                        fill="#4285F4"
                      >
                        {" "}
                      </path>{" "}
                    </g>{" "}
                  </g>{" "}
                </g>{" "}
              </g>
            </svg>
            Login with google
          </Button>
          <Separator className="w-3/4 my-4 mx-auto" />
          <p className="mx-auto">More options coming soon ...</p>
        </div>
      </section>
    </main>
  );
};

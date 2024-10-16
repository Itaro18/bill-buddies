"use client"
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
export default function Homepage(){
    const router = useRouter();
    return <div className="">

        <div className=" mt-28 mb-12 sm:mt-40 sm:mb-32">
            <h1 className="text-3xl sm:text-5xl my-4">Hassle free <span className="text-red-600 ">Bill</span> splitting between <span className="text-red-600">Buddies</span></h1>
            <p className="text-xl sm:text-3xl">Clear the bills with <span className="text-red-600">Crypto</span></p>
        </div >
        <div className="sm:flex sm:justify-center mb-12 sm:mb-28"><Button onClick={()=>router.push('/signup')} className="rounded-2xl   sm:h-12 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-xl">Start Splitting</Button></div>
        
        
            <p className="text-xl sm:text-2xl sm:text-center">Spend <span className="text-sm align-middle text-red-600">$</span> Split <span className="text-sm align-middle text-red-600">$</span> Settle</p>
      
        <div className="mt-1 h-0.5 bg-red-600 w-2/3 sm:w-1/4 sm:mx-auto"></div>
    </div>
}
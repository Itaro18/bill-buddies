"use client";
import { SelectTheme } from "./ThemeToggler";
import { Button } from "./ui/button";
// import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
export default function Menubar() {
  // const router = useRouter();
  return (
    <div className="flex w-4/5 max-w-2xl items-center justify-between bg-red-600 px-4 py-1  rounded-[34px] text-md fixed top-10 z-10">
      <div>
        <p className="text-lg sm:text-3xl ml-4 cursor-pointer">BillBuddies</p>
      </div>
      <div className="flex items-center gap-x-2 ">
        <SelectTheme />
        <Button
          className="rounded-2xl shadow-[3px_3px_0px_1px_#718096]"
          onClick={() => signOut()}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

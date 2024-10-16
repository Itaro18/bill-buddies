"use client";
import { SelectTheme } from "./ThemeToggler";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Appbar() {
  const router = useRouter();
  return (
    <div className="flex w-4/5 max-w-2xl items-center justify-between bg-red-600 px-3 py-2  rounded-3xl text-md fixed top-10">
      <div>
        <p className="text-lg sm:text-2xl ml-4 cursor-pointer">BillBuddies</p>
      </div>
      <div className="flex items-center gap-2">
        <SelectTheme />
        <Button
          className="rounded-2xl shadow-[3px_3px_0px_1px_#718096] hover:invert"
          onClick={() => router.push("/signup")}
        >
          Start Splitting
        </Button>
      </div>
    </div>
  );
}
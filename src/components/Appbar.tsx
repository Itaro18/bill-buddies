"use client";
import { SelectTheme } from "./ThemeToggler";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

export default function Appbar() {
  const router = useRouter();
  return (
    <div className="flex w-10/12 sm:w-4/5 max-w-xl items-center justify-between bg-red-600 px-4 py-1  rounded-[34px] absolute sm:static top-20">
      <div>
        <p className="text-lg sm:text-2xl ml-4 cursor-pointer">BillBuddies</p>
      </div>
      <div className="flex items-center gap-2">
        <SelectTheme />
        <Button
          className="text-sm sm:text-md rounded-2xl shadow-[3px_3px_0px_1px_#718096] "
          onClick={() => router.push("/signup")}
        >
          Start Splitting
        </Button>
      </div>
    </div>
  );
}

"use client";
import { Button } from "./ui/button";
import Group from "./ui/group";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import {
  groupSchema,
  groupType,
  inviteSchema,
} from "@/lib/validators/create.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { Toaster, toast } from "sonner";
import axios from "axios";
import { useEffect, useState } from "react";
// import { useSession } from "next-auth/react";

/* eslint-disable  @typescript-eslint/no-explicit-any */

export default function DashboardContent() {
  interface grp {
    id: string;
    name: string;
    total: number;
  }
  //    const session=  useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<groupType>({
    resolver: zodResolver(groupSchema),
  });

  const [disable, setDiable] = useState(false);
  const [groups, setGroups] = useState<Array<grp>>([]);
  const [code, setCode] = useState("");
  const onSubmit = async (data: any) => {
    setDiable(true);

    try {
      const response = await axios.post("/api/create/group", {
        name: data.name,
      });
      if (response) {
        toast.success("Group created Successfully", {
          duration: 3000,
        });
      }
    } catch (e: any) {
      toast.error(e.response.data.error, {
        duration: 3000,
      });
    }
    setDiable(false);
  };

  const joinGrp = async () => {
    try {
      const result = inviteSchema.safeParse({ code });
      if (!result.success) {
        return toast.error("Invalid Invite Code", {
          duration: 3000,
        });
      }
      const response = await axios.post("/api/invite", {
        code,
      });
      if (response) {
        toast.success(response.data.message, {
          duration: 3000,
        });
        if (response.data.message !== "Already presnt in Group") {
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      }
    } catch (e: any) {
      toast.error(e.response.data.error, {
        duration: 3000,
      });
    }
  };
  useEffect(() => {
    async function fetchGroups() {
      const response = await axios.get("/api/user/groups");

      setGroups(response.data.names);
    }
    fetchGroups();
  }, [disable, code]);

  return (
    <div className="w-4/5 sm:w-3/5 max-w-xl ">
      <div className="flex my-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="mx-auto rounded-2xl  sm:h-12 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-md sm:text-xl"
            >
              Join Group
            </Button>
          </DialogTrigger>
          <DialogContent className="w-4/5 sm:max-w-[425px] bg-white text-black dark:text-white dark:bg-black rounded-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Join Group</DialogTitle>
                <DialogDescription>
                  Join a group thourgh Invite code
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-y-4">
                  <Label htmlFor="name" className=" ">
                    Invite Code
                  </Label>
                  <Input
                    onChange={(e) => {
                      setCode(e.target.value);
                    }}
                    id="code"
                    placeholder="123456789"
                    className="col-span-3 border-b-4"
                  />
                </div>
              </div>
              <DialogFooter className="mx-auto ">
                <DialogClose asChild>
                  <Button
                    type="button"
                    disabled={disable}
                    className="mx-auto rounded-2xl sm:h-8 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-lg"
                    onClick={() => {
                      joinGrp();
                    }}
                  >
                    Join
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              className="mx-auto rounded-2xl  sm:h-12 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-md sm:text-xl"
            >
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="w-4/5 sm:max-w-[425px] bg-white text-black dark:text-white dark:bg-black rounded-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Create Group</DialogTitle>
                <DialogDescription>
                  Create a group and add your friends to start splitting bills
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-y-4">
                  <Label htmlFor="name" className=" ">
                    Group Name
                  </Label>
                  <Input
                    {...register("name")}
                    id="name"
                    placeholder="Goa-Trip"
                    className="col-span-3 border-b-4"
                  />
                  {errors.name && (
                    <p className="text-red-600 w-full">
                      {errors.name.message?.toString()}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter className="mx-auto ">
                <DialogClose asChild>
                  <Button
                    type="submit"
                    disabled={disable}
                    className="mx-auto rounded-2xl sm:h-8 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-lg"
                  >
                    Create
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <Toaster
          toastOptions={{
            style: { background: "black" },
            classNames: {
              error: "border-2 border-red-600 text-red-600",
              success: "border-2 border-green-600  text-green-600",
            },
          }}
        />
      </div>

      <div>
        {groups.length >0 ? (groups.map(async (group, index) => {
          return (
            <Group
              title={group.name}
              key={index}
              grpId={group.id}
              total={group.total}
            />
          );
        })):(<p className="flex justify-center mt-20 mx-auto text-2xl text-indigo-300"> Join a Group or Create your group </p>)}
      </div>
    </div>
  );
}

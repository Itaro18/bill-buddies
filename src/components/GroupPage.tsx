"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import TransactionCard from "./ui/tranactionCard";
import SettlementCard from "./ui/settlementCard";
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
import { useState, useEffect } from "react";
import axios from "axios";
import { Copy } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, expenseType } from "@/lib/validators/create.validator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";

type outData = {
  txnId: string;
  time: Date;
  description: string;
  paidById: string;
  amount: number;
  share: number;
  isSettlement: boolean;
  paidFor: string[];
  userExpenses: {
    userId: string;
    amount: number;
  }[];
};

export default function GroupPage({
  title,
  users,
  id,
}: {
  title: string;
  users: {
    id: string;
    name: string;
    email: string;
  }[];
  id: string;
}) {
  const session = useSession();
  const [retrigger, setRetrigger] = useState(false);
  const ids = users.map((user) => user.id);
  const FormSchema = z.object({
    owedTo: z.enum(ids as [string, ...string[]], {
      required_error: "You need to select an Option",
    }),
  });

  const info: { name: string; email: string; id: string } =
    session.data?.user || {};

  users = users.map((user) => {
    if (user?.id === info.id) {
      return { ...user, name: `You (${user.name})` };
    }
    return user;
  });

  const nameMap = new Map();

  for (let i = 0; i < users.length; i++) {
    nameMap.set(users[i].id, users[i].name);
  }

  const [code, setCode] = useState("");
  const [ledger, setLedger] = useState([]);
  const [trasnactions, setTrasnactions] = useState<outData[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function getCode() {
      const res = await axios.get(`/api/invite`, {
        headers: {
          id,
        },
      });
      setCode(res.data.code);
    }
    getCode();
    async function getTxns() {
      const res = await axios.get(`/api/transactions`, {
        headers: {
          id,
        },
      });

      setTrasnactions(res.data.txns);
    }

    getTxns();
  }, [id, retrigger]);

  const handleCopyClick = () => {
    navigator.clipboard.writeText(code).then(() => {
      toast.success("Invite code Copied", {
        duration: 3000,
      });
    });
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<expenseType>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: 0,
      payer: "",
      splitEqually: false,
      splits: Object.fromEntries(users.map((user) => [user.id, 0.0])),
    },
  });

  const watchSplitEqually = watch("splitEqually");
  const watchAmount = watch("amount");
  const watchSplits = watch("splits");

  const [sum, setSum] = useState(0);

  const onSubmit = async (data: expenseType) => {
    try {
      const userExpenses: { id: string; share: number }[] = Object.entries(
        data.splits
      ).map(([id, share]) => ({
        id,
        share,
      }));

      console.log(userExpenses);

      const payer = users.filter((user) => {
        if (user.name === data.payer) {
          return true;
        }
        return false;
      });
      const time = new Date();
      const body = {
        description: data.description,
        amount: data.amount,
        payer: data.payer,
        grpId: id,
        time,
        ...payer[0],
        userExpenses,
        isSettlement: false,
      };

      console.log(body);
      if (watchAmount - sum < 0.01) {
        reset();
        setSum(0);
        setOpen(false);
      }
      const response = await axios.post("/api/create/expense", body);
      console.log(response);
      if (response.status === 201) {
        toast.success("Transction Recorded", {
          duration: 3000,
        });
      } else if (!response) {
        toast.error("Transction couldn't Recorded,Try later", {
          duration: 3000,
        });
      }

      setRetrigger((val) => !val);
    } catch (e) {}
  };

  const handleOpenChange = (newOpenState: boolean) => {
    if (newOpenState) {
      setOpen(true);
    } else {
      // Reset form when dialog is closed (even without submission)
      reset();
      setSum(0);
      setOpen(false);
    }
  };

  useEffect(() => {
    async function getLedger() {
      const res = await axios.post("/api/simplify", {
        grpId: id,
      });
      setLedger(res.data.ledger);
    }
    getLedger();
  }, [retrigger]);

  let counter = 0;
  const settler = async () => {
    const res = await axios.post("/api/simplify", {
      grpId: id,
    });
  };

  let total = 0;
  let owed = 0;
  for (let i = 0; i < ledger.length; i++) {
    total += ledger[i][1];
    if (ledger[i][1] < 0) {
      owed = 1;
    }
  }
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  async function onSettle(data: z.infer<typeof FormSchema>) {
    let amt;
    for (let i = 0; i < ledger.length; i++) {
      if (ledger[i][0] === data.owedTo) {
        amt = -1 * ledger[i][1];
      }
    }
    const res = await axios.post("/api/create/settlement", {
      amount: amt,
      grpId: id,
      id: info.id,
      toId: data.owedTo,
    });
    if (res.data.message) {
      setRetrigger((val) => !val);
      toast.success("Settlement Recorded", {
        duration: 3000,
      });
    } else {
      toast.error("Settlement couldn't be done,Try later", {
        duration: 3000,
      });
    }
  }

  return (
    <div className="w-9/10 sm:w-3/5 sm:max-w-2xl py-10 mt-24">
      <div className="flex justify-center  w-full ">
        <div className="w-1/3 ">
          <div className="w-16 sm:w-28 relative aspect-square rounded-sm overflow-hidden mx-auto">
            <Image
              src="/image.png"
              alt="group-icon"
              fill
              // sizes="(max-width: 700px) 25vw, 175px"
              className="object-cover"
            />
          </div>
        </div>
        <div className="self-end w-2/3">
          <h1 className="text-3xl sm:text-5xl text-red-600 mb-1">{title}</h1>
          {total > 0 ? (
            <p className="text-md text-green-400 sm:text-2xl">
              You are owed {(total / 100).toFixed(2)} overall
            </p>
          ) : total === 0 ? (
            <p className="text-md text-slate-400 sm:text-2xl">
              You are all settled up
            </p>
          ) : (
            <p className="text-md text-red-400 sm:text-2xl">
              You owe {((-1 * total) / 100).toFixed(2)} overall
            </p>
          )}
        </div>
      </div>
      <div className="w-full px-6 sm:px-16 my-4 grid gap-1 sm:text-xl">
        {ledger.map((entry, index) => {
          const name = nameMap.get(entry[0]);
          const amt = entry[1] > 0 ? entry[1] / 100 : (entry[1] / 100) * -1;
          if (entry[1] > 0) {
            counter++;
            return (
              <p key={index}>
                {name} ows you{" "}
                <span className="text-green-400">{amt.toFixed(2)}</span>
              </p>
            );
          } else if (entry[1] < 0) {
            counter++;
            return (
              <p key={index}>
                You owe {name}{" "}
                <span className="text-red-400">{amt.toFixed(2)}</span>
              </p>
            );
          }
        })}
        {counter ? (
          <p></p>
        ) : (
          <p className="my-10">You are settled up with everyone </p>
        )}
      </div>
      <div className="w-full  flex justify-center sm:justify-end sm:gap-x-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="m-2 rounded-2xl shadow-[3px_3px_0px_1px_#718096]  ">
              Settle
            </Button>
          </DialogTrigger>
          {owed === 0 ? (
            <DialogContent className="w-4/5 sm:max-w-[425px] bg-white text-black dark:text-white dark:bg-black rounded-md">
              <DialogHeader>
                <DialogTitle>Settled Up</DialogTitle>
                <DialogDescription>
                  You are settled up with everyone
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          ) : (
            <DialogContent className="w-4/5 sm:max-w-[425px] bg-white text-black dark:text-white dark:bg-black rounded-md">
              <DialogHeader>
                <DialogTitle>Settle Up</DialogTitle>
                <DialogDescription>
                  who are you settling up with?
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSettle)}
                  className="w-full space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="owedTo"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>
                          Select a buddy whom you want to settle up with
                        </FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            {ledger.length != 0 ? (
                              ledger.map((entry) => {
                                if (entry[0] === info.id || entry[1] >= 0) {
                                  return null;
                                }
                                return (
                                  <FormItem className="flex items-center space-x-3 space-y-0">
                                    <FormLabel className="font-normal flex w-full items-center">
                                      <p className="w-4/5 text-lg">
                                        {nameMap.get(entry[0])}
                                      </p>
                                      <p className=" text-lg sm:ml-6">
                                        {((-1 * entry[1]) / 100).toFixed(2)}
                                      </p>
                                    </FormLabel>
                                    <FormControl>
                                      <RadioGroupItem value={entry[0]} />
                                    </FormControl>
                                  </FormItem>
                                );
                              })
                            ) : (
                              <p className="text-green-400">
                                You are Settled Up With everyone
                              </p>
                            )}
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogClose asChild>
                    <Button type="submit">Settle</Button>
                  </DialogClose>
                </form>
              </Form>

              <DialogFooter className="mx-auto"></DialogFooter>
            </DialogContent>
          )}
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="m-2 rounded-2xl shadow-[3px_3px_0px_1px_#718096] ">
              Add Buddy
            </Button>
          </DialogTrigger>
          <DialogContent className="w-4/5 sm:max-w-[425px] bg-white text-black dark:text-white dark:bg-black rounded-md">
            <DialogHeader>
              <DialogTitle>Add Buddy</DialogTitle>
              <DialogDescription>
                Send the invite code to your Buddy
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="w-full relative">
                <div className="absolute rounded-s-md w-1 inset-y-0 " />
                <pre className="rounded-md text-sm sm:text-base !bg-[#151515] px-4 sm:px-6 md:px-8 whitespace-pre-wrap break-word flex justify-between">
                  <p className="mx-auto p-2 tracking-widest">{code}</p>
                </pre>
                <button
                  className="text-gray-500 p-2 absolute bottom-0 sm:top-1 right-2 hover:opacity-80 "
                  onClick={handleCopyClick}
                >
                  <Copy className="size-5 text-primary/50 " />
                </button>
              </div>
            </div>
            <DialogFooter className="mx-auto"></DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="m-2 rounded-2xl shadow-[3px_3px_0px_1px_#718096]  ">
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="w-11/12 sm:max-w-[425px] bg-white text-black dark:text-white dark:bg-black rounded-md">
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogDescription>Splitting equally</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className=" items-start flex flex-col gap-4">
                  <Label htmlFor="Description" className="">
                    Description
                  </Label>
                  <Input
                    {...register("description")}
                    id="description"
                    placeholder="Enter a Description"
                    className="col-span-4 w-full border-b-4"
                  />
                  {errors.description && (
                    <p className="text-red-600 w-full ">
                      {errors.description.message?.toString()}
                    </p>
                  )}
                  <Label htmlFor="TotalAmt" className="">
                    TotalAmt
                  </Label>
                  <Input
                    {...register("amount", { valueAsNumber: true })}
                    id="amount"
                    placeholder="100"
                    className=" w-62 border-b-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    type="number"
                    step="0.01"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (isNaN(parseFloat(value))) {
                        setValue("amount", 0);
                      } else {
                        setValue(
                          "amount",
                          parseFloat(parseFloat(value).toFixed(2))
                        );
                      }
                    }}
                  />
                  {errors.amount && (
                    <p className="text-red-600 w-full ">
                      {errors.amount.message?.toString()}
                    </p>
                  )}
                  <Label htmlFor="PaidBy" className="">
                    PaidBy
                  </Label>
                  <select
                    {...register("payer")}
                    className="w-56 block bg-transparent border-2 p-2 rounded-md border-b-4"
                  >
                    {users.map((user, index) => (
                      <option key={index} value={user.name}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                  {errors.payer && (
                    <p className="text-red-600 w-full ">
                      {errors.payer.message?.toString()}
                    </p>
                  )}
                </div>
                <div className="flex items-center">
                  <Controller
                    name="splitEqually"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          if (checked) {
                            const splitAmount =
                              Math.round(
                                (watchAmount / users.length + Number.EPSILON) *
                                  100
                              ) / 100;
                            users.forEach((user) => {
                              setValue(`splits.${user.id}`, splitAmount, {
                                shouldValidate: true,
                              });
                            });
                            setSum(watchAmount);
                          } else {
                            setSum(0);
                            users.forEach((user) => {
                              setValue(`splits.${user.id}`, 0, {
                                shouldValidate: true,
                              });
                            });
                          }
                        }}
                        id="splitEqually"
                      />
                    )}
                  />
                  <Label className="text-md ml-3">Split Equally</Label>
                </div>
              </div>
              <div className="border-t-2  border-red-500 rounded-sm my-4"></div>
              <div>
                {users.map((user) => {
                  return (
                    <div className="flex items-center justify-between">
                      <p className="text-xl m-2">{user.name}</p>
                      <Input
                        key={user.id}
                        {...register(`splits.${user.id}`, {
                          valueAsNumber: true,
                        })}
                        id={user.id}
                        placeholder="0.00"
                        className="w-24 border-b-4 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        disabled={watchSplitEqually}
                        type="number"
                        step="0.01"
                        inputMode="numeric"
                        onChange={(e) => {
                          const value = e.target.value;
                          setValue(
                            `splits.${user.id}`,
                            Number(Number(value).toFixed(2))
                          );
                          const totalSplit = Object.values(watchSplits).reduce(
                            (sum, value) => sum + (Number(value) || 0),
                            0
                          );
                          setSum(totalSplit);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="w-full flex justify-center items-center flex-col">
                <p className="">
                  {(watchAmount - sum).toFixed(2)} left of{" "}
                  {watchAmount.toFixed(2)}
                </p>
                {watchAmount - sum > 0.01 || watchAmount - sum < 0 ? (
                  <p className="text-red-400 my-2">
                    splits dont add up to total
                  </p>
                ) : (
                  <p></p>
                )}
              </div>
              <DialogFooter className="mx-auto">
                <Button
                  disabled={
                    !(
                      watchSplitEqually ||
                      (watchAmount - sum < 0.01 && 
                      watchAmount - sum >= 0 
                      ) 
                    )
                  }
                  type="submit"
                  className="mx-auto rounded-2xl  sm:h-8 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-lg mt-4"
                >
                  Split
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="my-4 px-5 sm:px-10">
        {trasnactions.map((txn) => {
          return txn.isSettlement ? (
            <SettlementCard
              txnId={txn.txnId}
              time={txn.time}
              paidBy={nameMap.get(txn.paidById)}
              totalAmt={txn.amount}
              paidFor={nameMap.get(txn.paidFor[0])}
            ></SettlementCard>
          ) : (
            <TransactionCard
              txnId={txn.txnId}
              time={txn.time}
              name={txn.description}
              paidBy={nameMap.get(txn.paidById)}
              totalAmt={txn.amount}
              yourShare={txn.paidById === info.id ? txn.share : -1 * txn.share}
              users={users}
              splits={txn.userExpenses}
              grpId={id}
            ></TransactionCard>
          );
        })}
      </div>
      <Toaster
        toastOptions={{
          style: {
            background: "black",
            border: "2px solid green",
            color: "white",
          },
        }}
      />
    </div>
  );
}

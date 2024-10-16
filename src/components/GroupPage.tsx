"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import TransactionCard from "./ui/tranactionCard";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useState, useEffect } from "react";
import axios from "axios";
import { Copy } from "lucide-react";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { expenseSchema, expenseType } from "@/lib/validators/create.validator";

// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
type outData={
  time:Date;
  description:string;
  paidById:string;
  amount:number;
  share:number
}

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

  


  const info: { name: string; email: string; id: string } =
    session.data?.user || {};

  users = users.map((user) => {
    if (user?.id === info.id) {
      return { ...user, name: `You (${user.name})` };
    }
    return user;
  });

  const nameMap= new Map();

  for(let i=0;i<users.length;i++){
    nameMap.set(users[i].id,users[i].name)
  }

  

  const [code, setCode] = useState("");
  const [ledger,setLedger] = useState([])
  const [trasnactions,setTrasnactions]=useState<outData[]>([])
  
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
  }, [id]);


  

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
    formState: { errors },
  } = useForm<expenseType>({
    resolver: zodResolver(expenseSchema),
  });

  const onSubmit = async (data: expenseType) => {
    const userExpenses: { id: string; share: string }[] = [];
    for (let i = 0; i < users.length; i++) {
      let x: number = data.amount / users.length;
      x = Math.round((x + Number.EPSILON) * 100) / 100;
      userExpenses.push({
        id: users[i].id,
        share: x.toString(),
      });
    }
    const payer = users.filter((user) => {
      if (user.name === data.payer) {
        return true;
      }
      return false;
    });
    const time = new Date();
    const body = {
      ...data,
      grpId: id,
      time,
      ...payer[0],
      userExpenses,
    };
    const response = await axios.post("/api/create/expense", body);
    if (response.status === 201) {
      toast.success("Transction Recorded", {
        duration: 3000,
      });
    } else {
      toast.error("Transction couldn't Recorded,Try later", {
        duration: 3000,
      });
    }
  };

  useEffect(()=>{
    async function getLedger() {
      const res = await axios.post("/api/simplify", {
        grpId: id,
      });
      console.log(res.data.ledger)
      setLedger(res.data.ledger)
    }
    getLedger();
  },[])

  let counter=0;
  const settler = async () => {
    const res = await axios.get("/api/transactions", {
      headers:{
        id
      }
    });
    // console.log(res.data.ledger);
  };

  let total=0;
  for(let i=0;i<ledger.length;i++){
    total+=ledger[i][1]
  }

  return (
    <div className="w-4/5 sm:w-3/5 max-w-2xl py-10 mt-24">
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
          {total>0 ?<p className="text-xl text-green-400 sm:text-2xl">You are owed {(total/100).toFixed(2)} overall</p> : total===0 ? <p className="text-xl text-slate-400 sm:text-2xl">You are all settled up</p>:<p className="text-xl text-red-400 sm:text-2xl">You owe {((-1*total)/100).toFixed(2)} overall</p>}
        </div>
      </div>
      <div className="w-full px-14 my-4 grid gap-1 sm:text-xl">
        {/* <p> You owe abc 2000</p>
        <p> You owe abc 2000</p>
        <p> You owe abc 2000</p>
        <p> You owe abc 2000</p> */}
        {
          ledger.map((entry,index)=>{
            const name=nameMap.get(entry[0])
            const amt=entry[1] >0 ? (entry[1]/100):(entry[1]/100)*-1
            if(entry[1]>0){
              counter++;
              return <p key={index}>{name} ows you <span className="text-green-400">{amt.toFixed(2)}</span></p>
            }
            else if(entry[1]<0){
              counter++;
              return <p key={index}>You owe {name} <span  className="text-red-400">{amt.toFixed(2)}</span></p>
            }
            
          })
        }
        {
          counter ? <p></p> :<p className="my-10">You are settled up with everyone </p>
        }
      </div>
      <div className="w-full flex justify-end">
        <Button
          className="rounded-2xl shadow-[3px_3px_0px_1px_#718096] hover:invert mr-8"
          onClick={settler}
        >
          Settle
        </Button>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-2xl shadow-[3px_3px_0px_1px_#718096] hover:invert mr-8">
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
              {/* <Button
                className="mx-auto rounded-2xl hover:invert  sm:h-8 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-lg"
                onClick={() => {
                  console.log(code)
                  return <p>{code}</p>;
                }}
              >
                Genearate
              </Button> */}
              {/* <p className="mx-auto tracking-widest bg-slate-500 p-3 rounded-md">{code}</p> */}
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

        <Dialog>
          <DialogTrigger asChild>
            <Button className="rounded-2xl shadow-[3px_3px_0px_1px_#718096] hover:invert ">
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="w-4/5 sm:max-w-[425px] bg-white text-black dark:text-white dark:bg-black rounded-md">
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
                    className="col-span-4 w-full"
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
                    className=" w-62"
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
                    className="w-56 block bg-transparent border-2 p-2 rounded-md"
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
              </div>
              <DialogFooter className="mx-auto">
                <DialogClose asChild>
                  <Button
                    type="submit"
                    className="mx-auto rounded-2xl hover:invert  sm:h-8 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-lg"
                  >
                    Split
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="my-4 px-10">
        {
          trasnactions.map((txn)=>{
            return (<TransactionCard
              time={txn.time}
              name={txn.description}
              paidBy={nameMap.get(txn.paidById)}
              totalAmt={txn.amount}
              yourShare={txn.paidById===info.id ?txn.share: (-1* txn.share)}
            ></TransactionCard>)
          })
        }
        {/* <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard>
        <TransactionCard
          date="Sept 19"
          name="Food"
          paidBy="abc"
          totalAmt="100"
          yourShare="10rs"
        ></TransactionCard> */}
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

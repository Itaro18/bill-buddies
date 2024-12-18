import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./button";
import axios from "axios";
import { toast } from "sonner";
import { useState } from "react";
import { expenseSchema, expenseType } from "@/lib/validators/create.validator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

export default function TransactionCard({
    txnId,
    time,
    name,
    paidBy,
    totalAmt,
    yourShare,
    users,
    splits,
    grpId,
}: {
    txnId: string;
    time: Date;
    name: string;
    paidBy: string;
    totalAmt: number;
    yourShare: number;
    users: {
        id: string;
        name: string;
        email: string;
    }[];
    splits: {
        userId: string;
        amount: number;
    }[];
    grpId: string;
}) {
    const date = new Date(time);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });

    const formattedName = name[0].toUpperCase() + name.slice(1).toLowerCase();
    const formattedDate = month + " " + day;
    const formattedAmount = (totalAmt / 100).toFixed(2);

    // OR more precisely control the format:
    const weekday = date.toLocaleString("en-US", { weekday: "long" });
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, "0");
    const ampm = hour >= 12 ? "pm" : "am";
    const hour12 = hour % 12 || 12;

    const year = date.getFullYear();
    const customFormat = `${weekday} ${hour12}:${minute}${ampm}  ${day} ${month} ${year}`;

    type expDet = {
        name: string;
        id: string;
        split: number;
    };

    const userMap: expDet[] = [];
    for (let i = 0; i < users.length; i++) {
        const name = users[i].name;
        const id = users[i].id;
        for (let j = 0; j < splits.length; j++) {
            if (splits[j].userId === id) {
                const split = splits[j].amount / 100;
                userMap.push({ name, id, split });
                break;
            }
        }
    }

    async function deleter() {
        const res = await axios.post("/api/ud/delete", {
            isSettlement: false,
            txnId: txnId,
        });
        if (res.data?.message) {
            toast.success("Transction Deleted", {
                duration: 3000,
            });
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            toast.error("Transction couldn't be Deletd,Try later", {
                duration: 3000,
            });
        }
        if (res.data?.message) {
        }
    }

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<expenseType>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            description: formattedName,
            amount: Number((totalAmt / 100).toFixed(2)),
            payer: paidBy,
            splitEqually: false,
            splits: Object.fromEntries(
                userMap.map((user) => [user.id, user.split])
            ),
        },
    });

    const update = async (data: expenseType) => {
        try {
            const userExpenses: { id: string; share: number }[] =
                Object.entries(data.splits).map(([id, share]) => ({
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
                txnId: txnId,
                description: data.description,
                amount: data.amount,
                payer: data.payer,
                grpId: grpId,
                time,
                ...payer[0],
                userExpenses,
                isSettlement: false,
            };

            console.log(body);
            if (watchAmount - sum < 0.01) {
                reset();
                //   setSum(0);
                setOpen(false);
            }
            const response = await axios.post("/api/ud/update", body);
            console.log(response);
            if (response.data?.message) {
                toast.success("Transction Updated", {
                    duration: 3000,
                });
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error("Transction couldn't Updated,Try later", {
                    duration: 3000,
                });
            }
        } catch (e) {}
    };

    //   const watchSplitEqually = watch("splitEqually");
    const watchAmount = watch("amount");
    const watchSplits = watch("splits");

    const [sum, setSum] = useState(Number((totalAmt / 100).toFixed(2)));
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(false);

    function editor() {
        setEdit((val) => !val);
    }
    const handleOpenChange = (newOpenState: boolean) => {
        if (newOpenState) {
            setOpen(true);
        } else {
            // Reset form when dialog is closed (even without submission)
            reset();
            setSum(Number((totalAmt / 100).toFixed(2)));
            setOpen(false);
            setEdit(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <div className="grid grid-cols-10 gap-x-4 items-center my-2  border-t-2 cursor-pointer py-1">
                    <div className="col-span-2 sm:col-span-1 p-1 mr-2 text-center">
                        <p className="text-lg sm:text-2xl">{formattedDate}</p>
                    </div>
                    <div className=" col-span-5 sm:col-span-6 ml-4">
                        <h1 className="text-md sm:text-2xl">{formattedName}</h1>
                        <p className="text-sm sm:text-xl">
                            {paidBy} paid {formattedAmount}
                        </p>
                    </div>
                    <div className="col-span-3 sm:col-span-3 ">
                        {yourShare > 0 ? (
                            <p className="text-sm text-green-400 sm:text-xl ">
                                you lent {(yourShare / 100).toFixed(2)}
                            </p>
                        ) : yourShare === 0 ? (
                            <p className="text-slate-400 ">not involved</p>
                        ) : (
                            <p className="text-md text-red-400 sm:text-xl ">
                                you owe {((-1 * yourShare) / 100).toFixed(2)}
                            </p>
                        )}
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="w-11/12 sm:4/5">
                <form onSubmit={handleSubmit(update)}>
                    <DialogHeader>
                        <DialogTitle>Tranaction Details</DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div>
                        <Input
                            disabled={!edit}
                            {...register("description")}
                            className="mx-auto  w-40 my-4 text-xl border-b-0 border-t-0 border-x-0 text-center focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className=" text-xl my-4">
                            {/* <p>{formattedDate}</p> */}
                            {/* <p>{formattedAmount}</p> */}
                            <div className="flex items-center justify-around">
                                <Label htmlFor="Amout" className=" text-xl ">
                                    Total
                                </Label>
                                <Input
                                    disabled={!edit}
                                    {...register("amount", {
                                        valueAsNumber: true,
                                    })}
                                    placeholder={formattedAmount}
                                    id="amount"
                                    className=" w-40 my-4 text-xl border-b-4 border-t-0 border-x-0 text-center focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    type="number"
                                    step="0.01"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (isNaN(parseFloat(value))) {
                                            setValue("amount", 0);
                                        } else {
                                            setValue(
                                                "amount",
                                                parseFloat(
                                                    parseFloat(value).toFixed(2)
                                                )
                                            );
                                        }
                                    }}
                                />
                                {errors.amount && (
                                    <p className="text-red-600 w-full ">
                                        {errors.amount.message?.toString()}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-around">
                                <Label htmlFor="PaidBy" className="text-xl">
                                    PaidBy
                                </Label>
                                <select
                                    disabled={!edit}
                                    {...register("payer")}
                                    className=" w-40 my-4 bg-transparent text-xl border-b-4 border-t-0 border-x-0 text-center focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                            <p className="text-center my-3 text-md">
                                {customFormat}
                            </p>
                            <div className="border-b-2 border-red-500 rounded-md my-6 sm:my-4 mx-4 sm:mx-8"></div>
                            <div>
                                {userMap.map((user) => {
                                    return (
                                        <div
                                            key={user.id}
                                            className="flex items-center justify-between sm:w-3/4 mx-auto"
                                        >
                                            <Label
                                                htmlFor={user.id}
                                                className=" text-xl "
                                            >
                                                {user.name}
                                            </Label>
                                            <Input
                                                disabled={!edit}
                                                {...register(
                                                    `splits.${user.id}`,
                                                    {
                                                        valueAsNumber: true,
                                                    }
                                                )}
                                                placeholder={user.split.toFixed(
                                                    2
                                                )}
                                                id={user.id}
                                                className=" w-40 my-4 text-xl border-b-4 border-t-0 border-x-0 text-center focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                //   disabled={watchSplitEqually}
                                                type="number"
                                                step="0.01"
                                                inputMode="numeric"
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value;
                                                    setValue(
                                                        `splits.${user.id}`,
                                                        Number(
                                                            Number(
                                                                value
                                                            ).toFixed(2)
                                                        )
                                                    );
                                                    const totalSplit =
                                                        Object.values(
                                                            watchSplits
                                                        ).reduce(
                                                            (sum, value) =>
                                                                sum +
                                                                (Number(
                                                                    value
                                                                ) || 0),
                                                            0
                                                        );
                                                    setSum(totalSplit);
                                                }}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                    {edit ? (
                        <div className="w-full flex justify-center items-center flex-col">
                            <p className="">
                                {(watchAmount - sum).toFixed(2)} left of{" "}
                                {watchAmount.toFixed(2)}
                            </p>
                            {watchAmount - sum > 0.01 ||
                            watchAmount - sum < 0 ? (
                                <p className="text-red-400 my-2">
                                    splits dont add up to total
                                </p>
                            ) : (
                                <p></p>
                            )}
                        </div>
                    ) : (
                        <></>
                    )}

                    <div className="flex justify-center mt-2 mb-6">
                        {edit ? (
                            <Button
                                disabled={
                                    !(
                                        watchAmount - sum < 0.01 &&
                                        watchAmount - sum >= 0
                                    )
                                }
                                type="submit"
                                className="mx-auto rounded-2xl  sm:h-8 sm:px-8 shadow-[3px_3px_0px_1px_#718096] text-lg mt-4"
                            >
                                Update
                            </Button>
                        ) : (
                            <></>
                        )}
                    </div>
                    <div className=" mx-auto w-3/5 flex justify-around  text-center">
                        <Button
                            type="button"
                            className="cursor-pointer px-0 bg-transparent on "
                            onClick={deleter}
                        >
                            {/* <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="35"
                                height="35"
                                viewBox="0 0 24 24"
                            >
                                <path d="M 10.806641 2 C 10.289641 2 9.7956875 2.2043125 9.4296875 2.5703125 L 9 3 L 4 3 A 1.0001 1.0001 0 1 0 4 5 L 20 5 A 1.0001 1.0001 0 1 0 20 3 L 15 3 L 14.570312 2.5703125 C 14.205312 2.2043125 13.710359 2 13.193359 2 L 10.806641 2 z M 4.3652344 7 L 5.8925781 20.263672 C 6.0245781 21.253672 6.877 22 7.875 22 L 16.123047 22 C 17.121047 22 17.974422 21.254859 18.107422 20.255859 L 19.634766 7 L 4.3652344 7 z"></path>
                            </svg> */}
                            <svg
                                viewBox="0 0 24 24"
                                width="35"
                                height="35"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g
                                    id="SVGRepo_tracerCarrier"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                    {" "}
                                    <path
                                        d="M4 7H20"
                                        stroke="#7a7a7a"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path>{" "}
                                    <path
                                        d="M6 10L7.70141 19.3578C7.87432 20.3088 8.70258 21 9.66915 21H14.3308C15.2974 21 16.1257 20.3087 16.2986 19.3578L18 10"
                                        stroke="#7a7a7a"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path>{" "}
                                    <path
                                        d="M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5V7H9V5Z"
                                        stroke="#7a7a7a"
                                        stroke-width="2"
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                    ></path>{" "}
                                </g>
                            </svg>
                        </Button>
                        <Button
                            type="button"
                            className="cursor-pointer px-0 bg-transparent "
                            onClick={editor}
                        >
                            {/* <svg
                                className="cursor-pointer"
                                xmlns="http://www.w3.org/2000/svg"
                                width="35"
                                height="35"
                                viewBox="0 0 24 24"
                            >
                                <path d="M 18 2 L 15.585938 4.4140625 L 19.585938 8.4140625 L 22 6 L 18 2 z M 14.076172 5.9238281 L 3 17 L 3 21 L 7 21 L 18.076172 9.9238281 L 14.076172 5.9238281 z"></path>
                            </svg> */}
                            <svg
                                viewBox="0 0 24 24"
                                width="35"
                                height="35"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                                <g
                                    id="SVGRepo_tracerCarrier"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                ></g>
                                <g id="SVGRepo_iconCarrier">
                                    {" "}
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M20.8477 1.87868C19.6761 0.707109 17.7766 0.707105 16.605 1.87868L2.44744 16.0363C2.02864 16.4551 1.74317 16.9885 1.62702 17.5692L1.03995 20.5046C0.760062 21.904 1.9939 23.1379 3.39334 22.858L6.32868 22.2709C6.90945 22.1548 7.44285 21.8693 7.86165 21.4505L22.0192 7.29289C23.1908 6.12132 23.1908 4.22183 22.0192 3.05025L20.8477 1.87868ZM18.0192 3.29289C18.4098 2.90237 19.0429 2.90237 19.4335 3.29289L20.605 4.46447C20.9956 4.85499 20.9956 5.48815 20.605 5.87868L17.9334 8.55027L15.3477 5.96448L18.0192 3.29289ZM13.9334 7.3787L3.86165 17.4505C3.72205 17.5901 3.6269 17.7679 3.58818 17.9615L3.00111 20.8968L5.93645 20.3097C6.13004 20.271 6.30784 20.1759 6.44744 20.0363L16.5192 9.96448L13.9334 7.3787Z"
                                        fill="#7a7a7a"
                                    ></path>{" "}
                                </g>
                            </svg>
                        </Button>
                    </div>
                    <DialogFooter></DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

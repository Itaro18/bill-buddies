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

export default function TransactionCard({
  time,
  name,
  paidBy,
  totalAmt,
  yourShare,
  users,
  splits
}: {
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
  splits:{
    userId:string;
    amount:number;       
  }[]
}) {
  const date = new Date(time);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });

  const formattedName = name[0].toUpperCase() + name.slice(1).toLowerCase();
  const formattedDate = month + " " + day;
  const formattedAmount = (totalAmt / 100).toFixed(2);
  const detailedDate = date.toLocaleString('en-US', {
    weekday: 'long',      // "Friday"
    hour: 'numeric',      // "2"
    minute: '2-digit',    // "00"
    hour12: true,         // for AM/PM
    day: 'numeric',       // "1"
    month: 'short',       // "Feb"
    year: 'numeric'       // "2013"
  });
  
  // OR more precisely control the format:
  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  const hour = date.getHours();
  const minute = date.getMinutes().toString().padStart(2, '0');
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  
  const year = date.getFullYear();
  const customFormat = `${weekday} ${hour12}:${minute}${ampm}  ${day} ${month} ${year}`;


  type expDet={
    name :string;
    id:string;
    split:number
  }

  

const userMap:expDet[]=[]
for(let i=0;i<users.length;i++){
    const name=users[i].name;
    const id=users[i].id
    for(let j=0;j<splits.length;j++){
        if(splits[j].userId===id){
            const split=splits[j].amount/100;
            userMap.push({name,id,split});
            break;
        }
    }
}

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="grid grid-cols-10 gap-x-4 items-center my-2  border-t-2 cursor-pointer">
          <div className="col-span-2 sm:col-span-1 p-1 mr-2 text-center">
            <p className="text-lg sm:text-2xl">{formattedDate}</p>
          </div>
          <div className=" col-span-5 sm:col-span-6 ml-4">
            <h1 className="text-md sm:text-2xl">{formattedName}</h1>
            <p className="text-sm sm:text-xl">
              {paidBy} paid {formattedAmount}
            </p>
          </div>
          <div className="col-span-3 sm:col-span-3">
            {yourShare > 0 ? (
              <p className="text-sm text-green-400 sm:text-xl">
                you lent {(yourShare / 100).toFixed(2)}
              </p>
            ) : yourShare === 0 ? (
              <p className="text-slate-400">not involved</p>
            ) : (
              <p className="text-md text-red-400 sm:text-xl">
                you owe {((-1 * yourShare) / 100).toFixed(2)}
              </p>
            )}
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tranaction Details</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <div>
          <h1 className="text-center text-2xl">{formattedName}</h1>
          <div className=" text-xl my-4">
            {/* <p>{formattedDate}</p> */}
            {/* <p>{formattedAmount}</p> */}
            <div className="flex items-center justify-around">
              <Label htmlFor="Amout" className=" text-xl ">
                Total 
              </Label>
            <Input
              placeholder={formattedAmount}
              id="amount"
              className=" w-40 my-4 text-xl border-b-4 border-t-0 border-x-0 text-center focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              type="number"
              step="0.01"
            />
            </div>
            <div className="flex items-center justify-around">
              <Label htmlFor="Payer" className=" text-xl ">
                Paid By
              </Label>
              <Input
                placeholder={paidBy}
                id="paidBy"
                className=" w-40 my-4 text-xl border-b-4 border-t-0 border-x-0 text-center focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <p className="text-center my-3 text-md">{customFormat}</p>
            <div className="border-b-2 border-red-500 rounded-md my-4 mx-8"></div>
            <div>
                {
                    userMap.map((user)=>{
                        return (
                            <div key= {user.id } className="flex items-center justify-between sm:w-3/4 mx-auto">
                                <Label htmlFor={user.id} className=" text-xl ">
                                    {user.name}
                                </Label>
                                <Input
                                    placeholder={user.split.toFixed(2)}
                                    id={user.id}
                                    className=" w-40 my-4 text-xl border-b-4 border-t-0 border-x-0 text-center focus-visible:ring-transparent [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                            </div>
                        )
                    })
                }
            </div>
          </div>
        </div>
        <DialogFooter></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

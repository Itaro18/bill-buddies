export default function TransactionCard({time,name,paidBy,totalAmt,yourShare}:{time:Date,name:string,paidBy:string,totalAmt:number,yourShare:number}){
    const date= new Date(time)
    const month   = date.getMonth();
    const day = date.getUTCDate().toString().padStart(2, '0');

    const monthNamer=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

    const formatedDate=monthNamer[month]+" "+day

    return <div className="grid grid-cols-10 gap-x-4 items-center my-2  border-t-2">
        <div className="col-span-2 sm:col-span-1 p-1 mr-2 text-center">
            <p className="text-lg sm:text-2xl">{formatedDate}</p>
        </div>
        <div className=" col-span-5 sm:col-span-6 ml-4">
            <h1 className="text-md sm:text-2xl">{name[0].toUpperCase()+name.slice(1).toLowerCase()}</h1>
            <p className="text-sm sm:text-xl">{paidBy} paid {(totalAmt/100).toFixed(2)}</p>
        </div>
        <div className="col-span-3 sm:col-span-3">
            {yourShare >0 ? <p className="text-sm text-green-400 sm:text-xl">you lent {(yourShare/100).toFixed(2)}</p> : yourShare ===0 ? <p className="text-slate-400">not involved</p>:<p className="text-md text-red-400 sm:text-xl">you owe {((-1*yourShare)/100).toFixed(2)}</p>}
            
        </div>
    </div>
}
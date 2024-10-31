export default function SettlementCard({
  txnId,
  time,
  paidBy,
  totalAmt,
  paidFor,
}: {
  txnId: string;
  time: Date;
  paidBy: string;
  totalAmt: number;
  paidFor: string;
}) {
  const date = new Date(time);
  const month = date.getMonth();
  const day = date.getUTCDate().toString().padStart(2, "0");

  const monthNamer = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const formatedDate = monthNamer[month] + " " + day;

  return (
    <div className="grid grid-cols-10 gap-x-4 items-center  border-t-2   my-2">
      <div className="col-span-2 sm:col-span-2 p-1 mr-1 text-center">
        <p className="text-md sm:text-2xl">{formatedDate}</p>
      </div>
      <div className=" col-span-8 sm:col-span-8 ml-4">
        <p className="text-sm tracking-wider sm:text-xl">
          {paidBy} settled up with {paidFor} by paing{" "}
          {(totalAmt / 100).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

import DashboardContent from "@/components/Dashboard";
import { getServerSession} from "next-auth";
import { Redirect } from '@/components/Redirect';
import Menubar from "@/components/Menubar";

export default async function Dashboard() {
  const session = await getServerSession();
  if (!session?.user) {
      return <Redirect to={'/'} />;
  }
  return (
    
    <div className="flex flex-col w-full items-center justify-center ">
      {/* <div>
      {JSON.stringify(session?.user)}
    </div> */}
      <Menubar/>
      <DashboardContent/>
    </div>
    
  );
}

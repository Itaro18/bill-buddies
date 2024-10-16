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
    
    <div className="flex w-full justify-center ">
      {/* <div>
      {JSON.stringify(session?.user)}
    </div> */}
      <Menubar/>
      <DashboardContent/>
    </div>
    
  );
}

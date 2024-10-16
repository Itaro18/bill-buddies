import Appbar from "@/components/Appbar";
import Homepage from "@/components/Homepage";
import { NEXT_AUTH_CONFIG } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

const getUserDetails = async () => {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
};

export default async function Home() {
  
  const session = await getUserDetails();



  if (session?.user) {
    redirect('/dashboard');
  }

  
  return (
    <div className="h-screen w-4/5 flex flex-col justify-center items-center">
      <Appbar/>
      <Homepage/>
    </div>
  );
}

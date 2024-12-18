import Appbar from "@/components/Appbar";
import Homepage from "@/components/Homepage";
import { NEXT_AUTH_CONFIG } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

const getUserDetails = async () => {
  const session = await getServerSession(NEXT_AUTH_CONFIG);
  return session;
};

export default async function Home() {
  const session = await getUserDetails();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="h-screen  flex flex-col items-center relative sm:static">
      <Appbar />
      <Homepage />
    </div>
  );
}
